"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";
import {
  cheminsFichiers,
  clesParDefaut,
  compteursParDefaut,
  piecesDepuisEntree,
  piecesParDefaut,
  type DonneesSaisieEdl,
  type EtatDesLieux,
  type TypeEdl,
} from "@/src/lib/etat-des-lieux";

/**
 * États des lieux, côté admin (migration 0030). Toutes les actions exigent
 * un compte admin ; les fichiers vivent dans le bucket privé.
 */

export type Resultat<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const BUCKET = "etats-des-lieux";
const COLONNES =
  "id, bien_id, type, entree_id, date_edl, locataire_nom, locataire_email, locataire_telephone, proprietaire_nom, proprietaire_email, agent_nom, pieces, compteurs, cles, observations, signature_locataire, signature_agent, statut, signe_le, envoye_le, created_at, updated_at, bien:bien_id(id, name, address, ville_commune)";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TAILLE_MAX = 8 * 1024 * 1024;

export type ResumeEdl = Pick<
  EtatDesLieux,
  "id" | "type" | "date_edl" | "locataire_nom" | "statut" | "envoye_le" | "created_at" | "bien" | "entree_id"
>;

export async function listEdl(): Promise<ResumeEdl[]> {
  const admin = await getAdminUser();
  if (!admin) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("etats_des_lieux")
    .select("id, type, date_edl, locataire_nom, statut, envoye_le, created_at, entree_id, bien:bien_id(id, name)")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listEdl error:", error);
    return [];
  }
  return (data ?? []) as unknown as ResumeEdl[];
}

export async function getEdl(id: string): Promise<EtatDesLieux | null> {
  const admin = await getAdminUser();
  if (!admin || !UUID.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("etats_des_lieux")
    .select(COLONNES)
    .eq("id", id)
    .maybeSingle();
  if (error) console.error("getEdl error:", error);
  return (data as unknown as EtatDesLieux) ?? null;
}

export type BienEdl = { id: string; name: string | null; chambre: number | null };

export async function listBiensEdl(): Promise<BienEdl[]> {
  const admin = await getAdminUser();
  if (!admin) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("biens")
    .select("id, name, chambre")
    .eq("is_active", true)
    .order("name", { ascending: true });
  return (data ?? []) as BienEdl[];
}

/** États des lieux d'entrée signés d'un bien, pour rattacher une sortie. */
export async function listEntreesSignees(bienId: string): Promise<ResumeEdl[]> {
  const admin = await getAdminUser();
  if (!admin || !UUID.test(bienId)) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("etats_des_lieux")
    .select("id, type, date_edl, locataire_nom, statut, envoye_le, created_at, entree_id, bien:bien_id(id, name)")
    .eq("bien_id", bienId)
    .eq("type", "entree")
    .eq("statut", "signe")
    .order("date_edl", { ascending: false });
  return (data ?? []) as unknown as ResumeEdl[];
}

export async function creerEdl(input: {
  bien_id: string;
  type: TypeEdl;
  entree_id?: string | null;
}): Promise<Resultat<string>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  if (!UUID.test(input.bien_id)) return { ok: false, error: "Choisissez un logement." };
  if (input.type !== "entree" && input.type !== "sortie") {
    return { ok: false, error: "Type inconnu." };
  }

  const supabase = await createClient();
  const { data: bien } = await supabase
    .from("biens")
    .select("id, chambre")
    .eq("id", input.bien_id)
    .maybeSingle();
  if (!bien) return { ok: false, error: "Logement introuvable." };

  // Une sortie reprend les pièces de l'entrée et les coordonnées des parties.
  let entree: EtatDesLieux | null = null;
  if (input.type === "sortie" && input.entree_id) {
    entree = await getEdl(input.entree_id);
    if (!entree || entree.bien_id !== input.bien_id || entree.type !== "entree") {
      return { ok: false, error: "État des lieux d'entrée introuvable pour ce logement." };
    }
  }

  const { data, error } = await supabase
    .from("etats_des_lieux")
    .insert({
      bien_id: input.bien_id,
      type: input.type,
      entree_id: entree?.id ?? null,
      locataire_nom: entree?.locataire_nom ?? "",
      locataire_email: entree?.locataire_email ?? null,
      locataire_telephone: entree?.locataire_telephone ?? null,
      proprietaire_nom: entree?.proprietaire_nom ?? null,
      proprietaire_email: entree?.proprietaire_email ?? null,
      agent_nom: admin.fullName ?? admin.email,
      pieces: entree ? piecesDepuisEntree(entree.pieces) : piecesParDefaut(bien.chambre as number | null),
      compteurs: entree
        ? entree.compteurs.map((c) => ({ ...c, releve: "", photo: null }))
        : compteursParDefaut(),
      cles: entree ? entree.cles.map((c) => ({ ...c, nombre: 0 })) : clesParDefaut(),
      cree_par: admin.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("creerEdl error:", error);
    return { ok: false, error: error?.message ?? "Création impossible." };
  }
  revalidatePath("/admin/etats-des-lieux");
  return { ok: true, data: data.id as string };
}

/** Enregistrement de la saisie (appelé automatiquement pendant la saisie). */
export async function enregistrerEdl(
  id: string,
  donnees: DonneesSaisieEdl,
): Promise<Resultat<{ updated_at: string }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  if (!UUID.test(id)) return { ok: false, error: "État des lieux inconnu." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("etats_des_lieux")
    .update({
      date_edl: donnees.date_edl,
      locataire_nom: donnees.locataire_nom.trim(),
      locataire_email: donnees.locataire_email?.trim() || null,
      locataire_telephone: donnees.locataire_telephone?.trim() || null,
      proprietaire_nom: donnees.proprietaire_nom?.trim() || null,
      proprietaire_email: donnees.proprietaire_email?.trim() || null,
      agent_nom: donnees.agent_nom?.trim() || null,
      pieces: donnees.pieces,
      compteurs: donnees.compteurs,
      cles: donnees.cles,
      observations: donnees.observations?.trim() || null,
    })
    .eq("id", id)
    // Un document signé ne se modifie plus.
    .eq("statut", "brouillon")
    .select("updated_at")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Cet état des lieux est déjà signé : il ne se modifie plus." };
  return { ok: true, data: { updated_at: data.updated_at as string } };
}

export type SignatureEnvoiPhoto =
  | { ok: true; signedUrl: string; path: string }
  | { ok: false; error: string };

/** Lien d'envoi direct d'une photo (déjà compressée en JPEG par la tablette). */
export async function signerEnvoiPhotoEdl(input: {
  edlId: string;
  contentType: string;
  size: number;
}): Promise<SignatureEnvoiPhoto> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  if (!UUID.test(input.edlId)) return { ok: false, error: "État des lieux inconnu." };
  if (!["image/jpeg", "image/png"].includes(input.contentType)) {
    return { ok: false, error: "Format de photo non pris en charge." };
  }
  if (!input.size || input.size > TAILLE_MAX) {
    return { ok: false, error: "Photo vide ou trop lourde (8 Mo maximum)." };
  }
  const ext = input.contentType === "image/png" ? "png" : "jpg";
  const path = `${input.edlId}/${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: error?.message ?? "Envoi impossible." };
  return { ok: true, signedUrl: data.signedUrl, path };
}

/** Liens de lecture temporaires (1 h) des photos et signatures. */
export async function liensFichiersEdl(chemins: string[]): Promise<Record<string, string>> {
  const admin = await getAdminUser();
  if (!admin || chemins.length === 0) return {};
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(chemins, 3600);
  if (error || !data) {
    console.error("liensFichiersEdl error:", error);
    return {};
  }
  return Object.fromEntries(
    data.filter((d) => d.signedUrl && d.path).map((d) => [d.path as string, d.signedUrl]),
  );
}

/** Image PNG d'une signature dessinée à l'écran (data URL) → bucket. */
async function enregistrerSignature(
  supabase: Awaited<ReturnType<typeof createClient>>,
  edlId: string,
  qui: "locataire" | "agent",
  dataUrl: string,
): Promise<string | null> {
  const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) return null;
  const octets = Buffer.from(m[1], "base64");
  if (octets.length === 0 || octets.length > 1024 * 1024) return null;
  const path = `${edlId}/signature-${qui}-${Date.now()}.png`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, octets, { contentType: "image/png", upsert: false });
  if (error) {
    console.error("enregistrerSignature error:", error);
    return null;
  }
  return path;
}

/**
 * Signature : enregistre la dernière saisie, les deux signatures, et fige le
 * document. Ensuite il se télécharge en PDF et s'envoie par e-mail.
 */
export async function signerEdl(
  id: string,
  donnees: DonneesSaisieEdl,
  signatures: { locataire: string; agent: string },
): Promise<Resultat> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  if (!donnees.locataire_nom.trim()) {
    return { ok: false, error: "Indiquez le nom du locataire avant de signer." };
  }
  if (donnees.pieces.length === 0) {
    return { ok: false, error: "Ajoutez au moins une pièce avant de signer." };
  }

  const sauvegarde = await enregistrerEdl(id, donnees);
  if (!sauvegarde.ok) return sauvegarde;

  const supabase = await createClient();
  const [locataire, agent] = await Promise.all([
    enregistrerSignature(supabase, id, "locataire", signatures.locataire),
    enregistrerSignature(supabase, id, "agent", signatures.agent),
  ]);
  if (!locataire || !agent) {
    return { ok: false, error: "Les deux signatures sont nécessaires (locataire et agent)." };
  }

  const { error } = await supabase
    .from("etats_des_lieux")
    .update({
      signature_locataire: locataire,
      signature_agent: agent,
      statut: "signe",
      signe_le: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("statut", "brouillon");
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/etats-des-lieux");
  revalidatePath(`/admin/etats-des-lieux/${id}`);
  return { ok: true, data: undefined };
}

export async function supprimerEdl(id: string): Promise<Resultat> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const edl = await getEdl(id);
  if (!edl) return { ok: false, error: "État des lieux introuvable." };

  const supabase = await createClient();
  // Fichiers d'abord : une ligne supprimée laisserait sinon des photos
  // orphelines, invisibles et facturées.
  const { data: fichiers } = await supabase.storage.from(BUCKET).list(id, { limit: 1000 });
  const chemins = [
    ...new Set([...(fichiers ?? []).map((f) => `${id}/${f.name}`), ...cheminsFichiers(edl)]),
  ];
  if (chemins.length) await supabase.storage.from(BUCKET).remove(chemins);

  const { error } = await supabase.from("etats_des_lieux").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/etats-des-lieux");
  return { ok: true, data: undefined };
}

/** Envoi du PDF au locataire et au propriétaire. */
export async function envoyerEdlParEmail(
  id: string,
): Promise<Resultat<{ destinataires: string[] }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const edl = await getEdl(id);
  if (!edl) return { ok: false, error: "État des lieux introuvable." };
  if (edl.statut !== "signe") {
    return { ok: false, error: "Faites signer l'état des lieux avant de l'envoyer." };
  }
  const destinataires = [edl.locataire_email, edl.proprietaire_email]
    .map((e) => e?.trim())
    .filter((e): e is string => !!e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  if (destinataires.length === 0) {
    return { ok: false, error: "Aucune adresse e-mail valide (locataire ou propriétaire)." };
  }

  const { genererPdfEdl, nomFichierEdl } = await import("@/src/lib/pdf-etat-des-lieux");
  const { envoyerEdl } = await import("@/src/lib/notify");
  const entree = edl.entree_id ? await getEdl(edl.entree_id) : null;
  const pdf = await genererPdfEdl(edl, entree);

  const envoi = await envoyerEdl({
    to: [...new Set(destinataires)],
    edl,
    pdf: { filename: nomFichierEdl(edl), content: pdf.toString("base64") },
  });
  if (!envoi.ok) return { ok: false, error: `Envoi refusé : ${envoi.error}` };
  if (envoi.skipped) {
    return { ok: false, error: "L'envoi d'e-mails n'est pas configuré (clé Resend absente)." };
  }

  const supabase = await createClient();
  await supabase
    .from("etats_des_lieux")
    .update({ envoye_le: new Date().toISOString() })
    .eq("id", id);
  revalidatePath(`/admin/etats-des-lieux/${id}`);
  return { ok: true, data: { destinataires } };
}
