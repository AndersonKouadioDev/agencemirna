"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";
import { MESSAGE_URL_IMAGE_INVALIDE, normaliserUrlImage } from "@/src/lib/image-url";
import { MESSAGE_URL_VIDEO_INVALIDE, videoLisible } from "@/src/lib/video";
import {
  MESSAGE_LIEN_PUB_INVALIDE,
  TYPES_PUB,
  cleEmplacementValide,
  type TypePub,
} from "@/src/lib/publicites";

/**
 * Publicités, pilotées depuis /admin/publicites.
 *
 * Toutes les écritures purgent « / » en portée `layout` : les emplacements
 * sont posés sur des pages dont plusieurs sont `force-static` (/services/*),
 * qu'une purge de la seule page d'accueil laisserait figées.
 */

const SELECT =
  "id, titre, type, emplacement, image, video_url, accroche, corps, lien, cta_label, " +
  "bien_id, ordre, is_active, starts_at, ends_at, updated_at, " +
  "biens:bien_id (id, name, image, ville_commune, is_active)";

export type PubliciteAdminRow = {
  id: string;
  titre: string;
  type: TypePub;
  emplacement: string;
  image: string | null;
  video_url: string | null;
  accroche: string | null;
  corps: string | null;
  lien: string | null;
  cta_label: string | null;
  bien_id: string | null;
  ordre: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  updated_at: string;
  biens: {
    id: string;
    name: string | null;
    image: string | null;
    ville_commune: string | null;
    is_active: boolean;
  } | null;
};

export type PubliciteFormData = {
  id?: string;
  titre: string;
  type: TypePub;
  emplacement: string;
  image?: string | null;
  video_url?: string | null;
  accroche?: string | null;
  corps?: string | null;
  lien?: string | null;
  cta_label?: string | null;
  bien_id?: string | null;
  is_active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
};

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function formatErreurPub(brut: string): string {
  const m = brut.toLowerCase();
  if (
    m.includes("publicites") &&
    (m.includes("does not exist") || m.includes("schema cache") || m.includes("could not find"))
  ) {
    return (
      "Les publicités demandent la migration 0027_publicites.sql, qui n'a pas " +
      "encore été appliquée. Ouvre Supabase → SQL Editor, exécute-la, puis " +
      `réessaie. (détail : ${brut})`
    );
  }
  if (m.includes("publicites_media_requis")) {
    return "Chaque type exige son contenu : une image pour « image », une adresse pour « vidéo », un texte pour « texte ».";
  }
  return brut;
}

// ============================================================================
// Lecture
// ============================================================================

export async function listPublicitesAdmin(): Promise<PubliciteAdminRow[]> {
  const admin = await getAdminUser();
  if (!admin) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("publicites")
    .select(SELECT)
    .order("emplacement", { ascending: true })
    .order("ordre", { ascending: true });
  if (error || !data) {
    if (error) console.error("listPublicitesAdmin error:", error);
    return [];
  }
  return data as unknown as PubliciteAdminRow[];
}

export async function getPubliciteAdmin(id: string): Promise<PubliciteAdminRow | null> {
  const admin = await getAdminUser();
  if (!admin) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("publicites")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("getPubliciteAdmin error:", error);
    return null;
  }
  return data as unknown as PubliciteAdminRow;
}

export type BienPourPub = {
  id: string;
  name: string | null;
  image: string | null;
  ville_commune: string | null;
  is_active: boolean;
};

export async function listBiensPourPublicite(): Promise<BienPourPub[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("biens")
    .select("id, name, image, ville_commune, is_active")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as BienPourPub[];
}

// ============================================================================
// Écriture
// ============================================================================

export async function upsertPublicite(
  input: PubliciteFormData,
): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const titre = input.titre?.trim();
  if (!titre) return { ok: false, error: "Le titre (nom interne) est obligatoire." };

  if (!TYPES_PUB.includes(input.type)) {
    return { ok: false, error: "Type inconnu : image, texte ou vidéo." };
  }
  if (!cleEmplacementValide(input.emplacement)) {
    return { ok: false, error: "Choisissez un emplacement dans la liste." };
  }

  // L'image part dans next/image, qui LÈVE pour un hôte hors motif : refusée
  // à la saisie, jamais découverte au rendu — sur toutes les pages à la fois.
  const image = normaliserUrlImage(input.image);
  if (image === undefined) return { ok: false, error: MESSAGE_URL_IMAGE_INVALIDE };

  const videoUrl = input.video_url?.trim() || null;
  const corps = input.corps?.trim() || null;

  // Chaque type exige SON contenu. Le message est dit ici, à côté du champ,
  // pas laissé à la contrainte SQL.
  if (input.type === "image" && !image) {
    return { ok: false, error: "Une publicité « image » a besoin d'une image." };
  }
  if (input.type === "video") {
    if (!videoUrl) return { ok: false, error: "Une publicité « vidéo » a besoin de l'adresse de sa vidéo." };
    if (!videoLisible(videoUrl)) return { ok: false, error: MESSAGE_URL_VIDEO_INVALIDE };
  }
  if (input.type === "texte" && !corps) {
    return { ok: false, error: "Une publicité « texte » a besoin d'un texte." };
  }

  const lien = input.lien?.trim() || null;
  if (lien) {
    const ok =
      !lien.slice(0, 2).replace(/\\/g, "/").startsWith("//") &&
      (lien.startsWith("/") || /^https?:\/\//i.test(lien));
    if (!ok) return { ok: false, error: MESSAGE_LIEN_PUB_INVALIDE };
  }

  if (input.starts_at && input.ends_at && new Date(input.starts_at) >= new Date(input.ends_at)) {
    return { ok: false, error: "La date de fin doit être après la date de début." };
  }

  const supabase = await createClient();
  const data = {
    titre,
    type: input.type,
    emplacement: input.emplacement,
    image,
    video_url: videoUrl,
    accroche: input.accroche?.trim() || null,
    corps,
    lien,
    cta_label: input.cta_label?.trim() || null,
    bien_id: input.bien_id || null,
    is_active: input.is_active ?? true,
    starts_at: input.starts_at || null,
    ends_at: input.ends_at || null,
  };

  if (input.id) {
    const { error } = await supabase.from("publicites").update(data).eq("id", input.id);
    if (error) return { ok: false, error: formatErreurPub(error.message) };
    revalider();
    return { ok: true, data: { id: input.id } };
  }

  // Nouvelle pub : en fin de SON emplacement.
  const { data: dernier } = await supabase
    .from("publicites")
    .select("ordre")
    .eq("emplacement", input.emplacement)
    .order("ordre", { ascending: false })
    .limit(1);
  const ordre = ((dernier?.[0]?.ordre as number | undefined) ?? 0) + 10;

  const { data: cree, error } = await supabase
    .from("publicites")
    .insert({ ...data, ordre })
    .select("id")
    .single();
  if (error || !cree) {
    return { ok: false, error: formatErreurPub(error?.message ?? "Erreur de création.") };
  }
  revalider();
  return { ok: true, data: { id: cree.id as string } };
}

export async function deletePublicite(id: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("publicites").delete().eq("id", id);
  if (error) return { ok: false, error: formatErreurPub(error.message) };
  revalider();
  return { ok: true, data: undefined };
}

export async function togglePublicite(id: string, isActive: boolean): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("publicites").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, error: formatErreurPub(error.message) };
  revalider();
  return { ok: true, data: undefined };
}

/** Réordonne les pubs d'UN emplacement : les identifiants sont ceux de ce groupe. */
export async function reorderPublicites(ids: string[]): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const resultats = await Promise.all(
    ids.map((id, i) => supabase.from("publicites").update({ ordre: (i + 1) * 10 }).eq("id", id)),
  );
  const echec = resultats.find((r) => r.error);
  if (echec?.error) return { ok: false, error: formatErreurPub(echec.error.message) };
  revalider();
  return { ok: true, data: undefined };
}

export async function upsertPubliciteAndRedirect(input: PubliciteFormData) {
  const r = await upsertPublicite(input);
  if (r.ok) {
    const { redirect } = await import("next/navigation");
    redirect("/admin/publicites?flash=saved");
  }
  return r;
}

// ============================================================================

/** Non exporté : un module « use server » n'exporte que des fonctions async. */
function revalider() {
  revalidatePath("/admin/publicites");
  revalidatePath("/", "layout");
}
