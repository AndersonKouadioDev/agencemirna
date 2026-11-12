"use server";

import { randomUUID } from "node:crypto";
import { createClient } from "../supabase/server";
import { notifyNewLead } from "../lib/notify";
import { evaluerDemande, type ControleAntiRobot } from "../lib/anti-spam";

/**
 * Server Actions publiques pour la capture de leads (RLS autorise INSERT
 * anonyme sur la table `leads`).
 *
 * 4 sources supportées :
 *   - 'contact'        : formulaire général de contact / newsletter
 *   - 'estimation'     : demande d'estimation gratuite d'un bien
 *   - 'visit_request'  : demande de visite sur une fiche bien
 *   - 'newsletter'     : abonnement newsletter footer
 */

export type LeadSource =
  | "contact"
  | "estimation"
  | "visit_request"
  | "newsletter"
  | "other";

export type CreateLeadInput = {
  source: LeadSource;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  bien_id?: string | null;
  source_url?: string | null;
  metadata?: Record<string, unknown> | null;
  /** Champ piège et durée de saisie, fournis par `useAntiRobot()`. */
  anti_robot?: ControleAntiRobot | null;
};

export type LeadActionResult =
  | { ok: true }
  | { ok: false; error: string };

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function createLead(
  input: CreateLeadInput,
): Promise<LeadActionResult> {
  // Validation côté serveur (le client peut valider aussi mais on re-vérifie)
  if (!input.source) {
    return { ok: false, error: "Source manquante." };
  }

  // Au minimum email OU phone pour qu'on puisse rappeler
  const email = input.email?.trim() || null;
  const phone = input.phone?.trim() || null;

  if (!email && !phone) {
    return {
      ok: false,
      error: "Email ou téléphone obligatoire pour qu'on puisse vous recontacter.",
    };
  }

  if (email && !isValidEmail(email)) {
    return { ok: false, error: "Adresse email invalide." };
  }

  // Newsletter : juste email suffit
  if (input.source !== "newsletter") {
    if (!input.full_name?.trim()) {
      return { ok: false, error: "Votre nom est obligatoire." };
    }
  }

  // Tri des robots (voir src/lib/anti-spam.ts). Un robot certain reçoit la
  // même réponse qu'un visiteur, sans rien enregistrer : lui signaler l'échec
  // l'aiderait seulement à s'adapter.
  const verdict = evaluerDemande({
    source: input.source,
    full_name: input.full_name,
    email,
    message: input.message,
    anti_robot: input.anti_robot,
  });
  if (verdict.action === "ignorer") {
    console.warn(`[anti-spam] demande ignorée (${input.source}) : ${verdict.motif}`);
    return { ok: true };
  }
  const motifSpam = verdict.action === "rejeter" ? verdict.motif : null;
  const metadata = motifSpam
    ? { ...(input.metadata ?? {}), spam: motifSpam }
    : (input.metadata ?? null);

  const supabase = await createClient();
  // NB : la policy publique de `leads` autorise INSERT mais pas SELECT — et
  // c'est volontaire, une policy SELECT publique exposerait les coordonnées de
  // tous les prospects. Un `.select()` après l'insert déclencherait un RETURNING
  // que la RLS refuse, faisant échouer l'enregistrement. On insère donc sans
  // relire, et on génère l'identifiant côté serveur.
  const leadId = randomUUID();
  const { error } = await supabase
    .from("leads")
    .insert({
      id: leadId,
      source: input.source,
      full_name: input.full_name?.trim() || null,
      email,
      phone,
      message: input.message?.trim() || null,
      bien_id: input.bien_id || null,
      source_url: input.source_url || null,
      metadata,
      // Demande suspecte : gardée au statut « Rejeté » (filtre « Rejetés » de
      // l'admin) au lieu d'arriver parmi les nouvelles.
      ...(motifSpam ? { status: "rejected" } : {}),
    });

  if (error) {
    console.error("createLead error:", error);
    return { ok: false, error: "Impossible d'enregistrer votre demande." };
  }
  const insertedLead = { id: leadId };

  // Pas d'e-mail à l'agence pour une demande suspecte.
  if (motifSpam) {
    console.warn(`[anti-spam] demande rejetée (${input.source}) : ${motifSpam}`);
    return { ok: true };
  }

  // Best-effort : notification email à l'agence. Skip silencieux si
  // RESEND_API_KEY non configuré, échec silencieux sinon (le lead est
  // déjà créé en DB).
  const bienName =
    (input.metadata?.bien_name as string | undefined) ?? null;
  notifyNewLead({
    id: insertedLead.id as string,
    source: input.source,
    full_name: input.full_name?.trim() || null,
    email,
    phone,
    message: input.message?.trim() || null,
    metadata: input.metadata ?? null,
    bien_name: bienName,
  }).catch((e) => {
    console.error("[notify] failed:", e);
  });

  return { ok: true };
}
