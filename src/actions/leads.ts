"use server";

import { createClient } from "../supabase/server";

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

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    source: input.source,
    full_name: input.full_name?.trim() || null,
    email,
    phone,
    message: input.message?.trim() || null,
    bien_id: input.bien_id || null,
    source_url: input.source_url || null,
    metadata: input.metadata ?? null,
  });

  if (error) {
    console.error("createLead error:", error);
    return { ok: false, error: "Impossible d'enregistrer votre demande." };
  }

  // À terme : envoyer un email de notification à l'agence ici via Resend
  // ou Supabase Edge Function. Pour l'instant, le lead est juste stocké
  // en DB et visible dans /admin/leads.

  return { ok: true };
}
