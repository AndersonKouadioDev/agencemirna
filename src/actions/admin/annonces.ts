"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";
import {
  MESSAGE_URL_IMAGE_INVALIDE,
  normaliserUrlImage,
} from "@/src/lib/image-url";

/**
 * Server Actions admin pour la table `promotions` (créas, bannières,
 * offres et actualités publiées sur le site).
 * CRUD complet + toggle is_active + toggle show_on_home.
 */

// ============================================================================
// Types
// ============================================================================

const ANNONCE_SELECT =
  "id, title, description, sous_titre, image, cta_label, cta_url, starts_at, ends_at, " +
  "show_on_home, is_active, ordre, updated_at, type_annonce_id, bien_id, " +
  "types_annonce:type_annonce_id (id, name), " +
  "biens:bien_id (id, name, image, prix, prix_month, ville_commune)";

export type AnnonceBienLie = {
  id: string;
  name: string | null;
  image: string | null;
  prix: number | null;
  prix_month: number | null;
  ville_commune: string | null;
};

export type AnnonceAdminRow = {
  id: string;
  title: string;
  description: string | null;
  sous_titre: string | null;
  type_annonce_id: number | null;
  bien_id: string | null;
  types_annonce: { id: number; name: string } | null;
  biens: AnnonceBienLie | null;
  /** Optionnelle : la photo du bien lié sert de repli. */
  image: string | null;
  cta_label: string | null;
  cta_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  show_on_home: boolean;
  is_active: boolean;
  ordre: number;
  updated_at: string;
};

export type AnnonceFormData = {
  id?: string;
  title: string;
  description?: string | null;
  sous_titre?: string | null;
  type_annonce_id?: number | null;
  /** Bien mis en avant. Obligatoire : c'est lui qui porte les informations. */
  bien_id?: string | null;
  image?: string | null;
  cta_label?: string | null;
  cta_url?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  show_on_home?: boolean;
  is_active?: boolean;
  ordre?: number;
};

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ============================================================================
// Données de référence du formulaire
// ============================================================================

export type TypeAnnonce = { id: number; name: string };

export async function listTypesAnnonce(): Promise<TypeAnnonce[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("types_annonce")
    .select("id, name")
    .order("ordre", { ascending: true });
  if (error || !data) {
    if (error) console.error("listTypesAnnonce error:", error);
    return [];
  }
  return data as TypeAnnonce[];
}

export type BienOption = {
  id: string;
  name: string | null;
  image: string | null;
  prix: number | null;
  prix_month: number | null;
  ville_commune: string | null;
  is_active: boolean;
};

/**
 * Biens proposés au rattachement d'une annonce.
 * Volontairement allégé : le formulaire n'a besoin que de quoi identifier le
 * bien et en montrer un aperçu, pas de toute sa fiche.
 */
export async function listBiensPourAnnonce(): Promise<BienOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("biens")
    .select("id, name, image, prix, prix_month, ville_commune, is_active")
    .order("created_at", { ascending: false });
  if (error || !data) {
    if (error) console.error("listBiensPourAnnonce error:", error);
    return [];
  }
  return data as BienOption[];
}

// ============================================================================
// LIST
// ============================================================================

export async function listAnnoncesAdmin(): Promise<AnnonceAdminRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("annonces")
    .select(ANNONCE_SELECT)
    .order("ordre", { ascending: true });

  if (error || !data) {
    if (error) console.error("listAnnoncesAdmin error:", error);
    return [];
  }
  return data as unknown as AnnonceAdminRow[];
}

// ============================================================================
// GET
// ============================================================================

export async function getAnnonceAdmin(
  id: string,
): Promise<AnnonceAdminRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("annonces")
    .select(ANNONCE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getAnnonceAdmin error:", error);
    return null;
  }
  return data as unknown as AnnonceAdminRow;
}

// ============================================================================
// UPSERT
// ============================================================================

export async function upsertPromotion(
  input: AnnonceFormData,
): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  if (!input.title?.trim()) {
    return { ok: false, error: "Le titre est obligatoire." };
  }
  if (!input.bien_id) {
    return {
      ok: false,
      error:
        "Choisissez le bien mis en avant : c'est lui qui porte le prix et les " +
        "caractéristiques affichés sur l'annonce.",
    };
  }
  if (
    input.starts_at &&
    input.ends_at &&
    new Date(input.starts_at) >= new Date(input.ends_at)
  ) {
    return {
      ok: false,
      error: "La date de fin doit être après la date de début.",
    };
  }

  // Le champ « URL d'image » du formulaire est libre et cette action reste
  // appelable sans lui : une adresse hors des `remotePatterns` de next.config
  // ferait lever next/image et tomber toutes les pages qui affichent l'annonce.
  const image = normaliserUrlImage(input.image);
  if (image === undefined) {
    return { ok: false, error: MESSAGE_URL_IMAGE_INVALIDE };
  }

  const supabase = await createClient();

  const data = {
    title: input.title.trim(),
    description: input.description?.trim() || null,
    sous_titre: input.sous_titre?.trim() || null,
    type_annonce_id: input.type_annonce_id ?? null,
    bien_id: input.bien_id ?? null,
    // Facultative : la photo du bien lié sert de repli à l'affichage.
    image,
    cta_label: input.cta_label?.trim() || null,
    cta_url: input.cta_url?.trim() || null,
    starts_at: input.starts_at || null,
    ends_at: input.ends_at || null,
    show_on_home: input.show_on_home ?? false,
    is_active: input.is_active ?? true,
    ordre: input.ordre ?? 0,
  };

  if (input.id) {
    const { error } = await supabase
      .from("annonces")
      .update(data)
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    // Portée « layout » et non « page » : MarqueeBar est monté dans le layout
    // marketing, et les sept pages sous /services sont en `force-static`. Une
    // purge de « / » seule les laissait défiler l'ancien bandeau indéfiniment.
    revalidatePath("/admin/annonces");
    revalidatePath("/annonces");
    revalidatePath("/", "layout");
    return { ok: true, data: { id: input.id } };
  } else {
    const { data: existing } = await supabase
      .from("annonces")
      .select("ordre")
      .order("ordre", { ascending: false })
      .limit(1);
    const nextOrdre = ((existing?.[0]?.ordre as number | undefined) ?? 0) + 1;

    const { data: created, error } = await supabase
      .from("annonces")
      .insert({ ...data, ordre: nextOrdre })
      .select("id")
      .single();
    if (error || !created) {
      return { ok: false, error: error?.message ?? "Erreur de création." };
    }
    revalidatePath("/admin/annonces");
    revalidatePath("/annonces");
    revalidatePath("/", "layout");
    return { ok: true, data: { id: created.id as string } };
  }
}

// ============================================================================
// DELETE
// ============================================================================

export async function deleteAnnonce(id: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const { error } = await supabase.from("annonces").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/annonces");
  revalidatePath("/annonces");
  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

// ============================================================================
// TOGGLE ACTIVE
// ============================================================================

export async function toggleAnnonceActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("annonces")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/annonces");
  revalidatePath("/annonces");
  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

// ============================================================================
// REORDER
// ============================================================================

export async function reorderAnnonces(ids: string[]): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const updates = ids.map((id, ordre) =>
    supabase.from("annonces").update({ ordre: ordre + 1 }).eq("id", id),
  );
  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);
  if (errors.length > 0) return { ok: false, error: errors[0].error!.message };

  revalidatePath("/admin/annonces");
  revalidatePath("/annonces");
  // L'accueil consomme `ordre` (section Annonces & Promotions, bandeau) : il
  // était la seule surface qu'un réordonnancement laissait en arrière.
  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

// ============================================================================
// Redirect helper
// ============================================================================

export async function upsertAnnonceAndRedirect(input: AnnonceFormData) {
  const result = await upsertPromotion(input);
  if (result.ok) {
    redirect("/admin/annonces?flash=saved");
  }
  return result;
}
