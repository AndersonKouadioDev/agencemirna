"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";
import { envoyerReponseAvis } from "@/src/lib/notify";

/**
 * Avis des clients logés, côté admin : modération, réponse, QR codes
 * (migration 0029).
 */

export type StatutAvis = "en_attente" | "publie" | "refuse";

export type AvisAdmin = {
  id: string;
  bien_id: string;
  nom: string;
  email: string;
  note: number;
  commentaire: string;
  mois_sejour: string | null;
  statut: StatutAvis;
  reponse: string | null;
  reponse_le: string | null;
  reponse_envoyee_le: string | null;
  created_at: string;
  bien: { id: string; name: string | null } | null;
};

export type Resultat<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.agencemirna.com";

const STATUTS: readonly StatutAvis[] = ["en_attente", "publie", "refuse"];

/** Page publique du bien : à rafraîchir quand ses avis changent. */
function rafraichir(bienId?: string) {
  revalidatePath("/admin/avis");
  if (bienId) revalidatePath(`/properties/${bienId}`);
}

export async function listAvisAdmin(
  statut: StatutAvis | "tous" = "tous",
): Promise<AvisAdmin[]> {
  const admin = await getAdminUser();
  if (!admin) return [];
  const supabase = await createClient();
  let q = supabase
    .from("avis")
    .select(
      "id, bien_id, nom, email, note, commentaire, mois_sejour, statut, reponse, reponse_le, reponse_envoyee_le, created_at, bien:bien_id(id, name)",
    )
    .order("created_at", { ascending: false });
  if (statut !== "tous") q = q.eq("statut", statut);
  const { data, error } = await q;
  if (error) {
    console.error("listAvisAdmin error:", error);
    return [];
  }
  return (data ?? []) as unknown as AvisAdmin[];
}

export async function compterAvisEnAttente(): Promise<number> {
  const admin = await getAdminUser();
  if (!admin) return 0;
  const supabase = await createClient();
  const { count } = await supabase
    .from("avis")
    .select("id", { count: "exact", head: true })
    .eq("statut", "en_attente");
  return count ?? 0;
}

export async function modererAvis(
  id: string,
  statut: StatutAvis,
): Promise<Resultat> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  if (!STATUTS.includes(statut)) return { ok: false, error: "Statut inconnu." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("avis")
    .update({ statut, modere_le: new Date().toISOString(), modere_par: admin.id })
    .eq("id", id)
    .select("bien_id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  rafraichir(data?.bien_id as string | undefined);
  return { ok: true, data: undefined };
}

export async function supprimerAvis(id: string): Promise<Resultat> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("avis")
    .delete()
    .eq("id", id)
    .select("bien_id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  rafraichir(data?.bien_id as string | undefined);
  return { ok: true, data: undefined };
}

/**
 * Enregistre la réponse de l'agence (affichée sous l'avis publié) et
 * l'envoie au client par e-mail. La réponse reste enregistrée même si l'envoi
 * échoue : l'admin voit alors « non envoyée » et peut réessayer.
 */
export async function repondreAvis(
  id: string,
  reponse: string,
): Promise<Resultat<{ envoyee: boolean; raison?: string }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const texte = reponse.trim();
  if (texte.length < 2) return { ok: false, error: "La réponse est vide." };
  if (texte.length > 2000) {
    return { ok: false, error: "La réponse ne doit pas dépasser 2 000 caractères." };
  }

  const supabase = await createClient();
  const { data: avis, error } = await supabase
    .from("avis")
    .update({ reponse: texte, reponse_le: new Date().toISOString() })
    .eq("id", id)
    .select("bien_id, nom, email, commentaire, bien:bien_id(name)")
    .maybeSingle();
  if (error || !avis) {
    return { ok: false, error: error?.message ?? "Avis introuvable." };
  }

  const bien = avis.bien as unknown as { name: string | null } | null;
  const envoi = await envoyerReponseAvis({
    to: avis.email as string,
    nom: avis.nom as string,
    bienNom: bien?.name ?? null,
    commentaire: avis.commentaire as string,
    reponse: texte,
  });

  // `skipped` : pas de clé Resend configurée, rien n'est réellement parti.
  const envoyee = envoi.ok && !envoi.skipped;
  if (envoyee) {
    await supabase
      .from("avis")
      .update({ reponse_envoyee_le: new Date().toISOString() })
      .eq("id", id);
  }
  rafraichir(avis.bien_id as string);
  return {
    ok: true,
    data: envoyee
      ? { envoyee: true }
      : {
          envoyee: false,
          raison: envoi.ok
            ? "l'envoi d'e-mails n'est pas configuré (clé Resend absente)"
            : envoi.error,
        },
  };
}

// ============================================================================
// QR codes
// ============================================================================

export type BienQr = { id: string; name: string | null; image: string | null };

export async function listBiensPourQr(): Promise<BienQr[]> {
  const admin = await getAdminUser();
  if (!admin) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("biens")
    .select("id, name, image")
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (error) {
    console.error("listBiensPourQr error:", error);
    return [];
  }
  return (data ?? []) as BienQr[];
}

/** Lien du QR code d'un bien, créé à la première demande. */
export async function obtenirLienAvis(bienId: string): Promise<Resultat<string>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();

  const { data: existant, error: erreurLecture } = await supabase
    .from("avis_jetons")
    .select("jeton")
    .eq("bien_id", bienId)
    .maybeSingle();
  if (erreurLecture) return { ok: false, error: erreurLecture.message };

  let jeton = existant?.jeton as string | undefined;
  if (!jeton) {
    const { data, error } = await supabase
      .from("avis_jetons")
      .insert({ bien_id: bienId })
      .select("jeton")
      .single();
    if (error || !data) return { ok: false, error: error?.message ?? "Création impossible." };
    jeton = data.jeton as string;
  }
  return { ok: true, data: `${SITE_URL}/avis/${bienId}?j=${jeton}` };
}

/**
 * Nouveau jeton : l'ancien QR code cesse de fonctionner (affiche arrachée,
 * lien qui circule…). Il faut alors réimprimer l'affiche.
 */
export async function regenererLienAvis(bienId: string): Promise<Resultat<string>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("avis_jetons").delete().eq("bien_id", bienId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/avis/qr-codes/${bienId}`);
  return obtenirLienAvis(bienId);
}
