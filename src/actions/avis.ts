"use server";

import { createClient } from "@/src/supabase/server";
import { notifyNouvelAvis } from "@/src/lib/notify";
import { evaluerDemande, type ControleAntiRobot } from "@/src/lib/anti-spam";

/**
 * Avis des clients logés, côté public (migration 0029).
 *
 * Le client arrive par le QR code du logement (/avis/<bien>?j=<jeton>).
 * L'écriture passe par la fonction SQL `deposer_avis`, qui vérifie le jeton :
 * la table `avis` elle-même n'est ni lisible ni modifiable par le public.
 */

export type AvisPublic = {
  id: string;
  nom_affiche: string;
  note: number;
  commentaire: string;
  mois_sejour: string | null;
  reponse: string | null;
  reponse_le: string | null;
  created_at: string;
};

export type DepotAvisInput = {
  bien_id: string;
  jeton: string;
  nom: string;
  email: string;
  note: number;
  commentaire: string;
  /** « 2026-11 », facultatif. */
  mois_sejour?: string | null;
  consentement: boolean;
  anti_robot?: ControleAntiRobot | null;
};

export type DepotAvisResultat = { ok: true } | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOIS = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Le lien du QR code est-il encore valable ? */
export async function jetonAvisValide(
  bienId: string,
  jeton: string,
): Promise<boolean> {
  if (!UUID.test(bienId) || !/^[0-9a-f]{32}$/i.test(jeton)) return false;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("jeton_avis_valide", {
    p_bien_id: bienId,
    p_jeton: jeton,
  });
  if (error) {
    console.error("jetonAvisValide error:", error);
    return false;
  }
  return data === true;
}

/** Avis publiés d'un bien. `[]` si la migration 0029 n'est pas appliquée. */
export async function getAvisPublies(bienId: string): Promise<AvisPublic[]> {
  if (!UUID.test(bienId)) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("avis_publies", {
    p_bien_id: bienId,
  });
  if (error) {
    console.error("getAvisPublies error:", error);
    return [];
  }
  return (data ?? []) as AvisPublic[];
}

export async function deposerAvis(
  input: DepotAvisInput,
): Promise<DepotAvisResultat> {
  const nom = input.nom?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";
  const commentaire = input.commentaire?.trim() ?? "";
  const note = Number(input.note);

  if (!UUID.test(input.bien_id ?? "")) {
    return { ok: false, error: "Logement inconnu." };
  }
  if (nom.length < 2 || nom.length > 80) {
    return { ok: false, error: "Indiquez votre nom (2 à 80 caractères)." };
  }
  if (!EMAIL.test(email)) {
    return { ok: false, error: "Adresse e-mail invalide." };
  }
  if (!Number.isInteger(note) || note < 1 || note > 5) {
    return { ok: false, error: "Choisissez une note de 1 à 5 étoiles." };
  }
  if (commentaire.length < 10) {
    return { ok: false, error: "Votre commentaire doit faire au moins 10 caractères." };
  }
  if (commentaire.length > 2000) {
    return { ok: false, error: "Votre commentaire ne doit pas dépasser 2 000 caractères." };
  }
  if (input.mois_sejour && !MOIS.test(input.mois_sejour)) {
    return { ok: false, error: "Mois du séjour invalide." };
  }
  if (!input.consentement) {
    return { ok: false, error: "Merci d'accepter la publication de votre avis." };
  }

  // Champ piège rempli ou envoi instantané : un robot, on ne garde rien.
  const verdict = evaluerDemande({
    source: "avis",
    full_name: nom,
    email,
    message: commentaire,
    anti_robot: input.anti_robot,
  });
  if (verdict.action === "ignorer") {
    console.warn(`[anti-spam] avis ignoré : ${verdict.motif}`);
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("deposer_avis", {
    p_bien_id: input.bien_id,
    p_jeton: input.jeton,
    p_nom: nom,
    p_email: email,
    p_note: note,
    p_commentaire: commentaire,
    p_mois_sejour: input.mois_sejour ? `${input.mois_sejour}-01` : null,
  });

  if (error) {
    if (error.message?.includes("jeton_invalide")) {
      return {
        ok: false,
        error: "Ce lien n'est plus valable. Scannez le QR code affiché dans le logement.",
      };
    }
    if (error.message?.includes("trop_d_avis")) {
      return {
        ok: false,
        error: "Vous avez déjà envoyé plusieurs avis aujourd'hui pour ce logement.",
      };
    }
    console.error("deposerAvis error:", error);
    return { ok: false, error: "Impossible d'enregistrer votre avis pour le moment." };
  }

  // Le motif « rejeter » (texte tiré au hasard…) n'empêche pas l'envoi : tout
  // avis passe de toute façon par la relecture de l'agence avant publication.
  // Le nom du logement est relu en base plutôt que repris du navigateur.
  const { data: bien } = await supabase
    .from("biens")
    .select("name")
    .eq("id", input.bien_id)
    .maybeSingle();
  notifyNouvelAvis({
    bienNom: (bien?.name as string | null | undefined) ?? null,
    nom,
    email,
    note,
    commentaire,
  }).catch((e) => console.error("[notify] avis:", e));

  return { ok: true };
}
