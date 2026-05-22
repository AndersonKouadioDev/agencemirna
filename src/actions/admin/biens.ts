"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";
import { deleteAdminImage } from "./upload";
import { migrateBienImagesFromFolder } from "@/src/actions/bien.actions";

/**
 * Server Actions admin pour la table `biens`.
 *
 * Liste, lecture, upsert (création + édition), suppression, et gestion
 * des images via la table jointure `bien_images`.
 *
 * Toutes les actions vérifient `getAdminUser()` au début et retournent
 * `{ ok: false, error }` si non autorisé.
 */

// ============================================================================
// Types
// ============================================================================

export type BienAdminRow = {
  id: string;
  name: string | null;
  short_description: string | null;
  description: string | null;
  image: string | null; // legacy field (cover photo héritée du folder)
  prix: number | null;
  prix_month: number | null;
  chambre: number | null;
  salon: number | null;
  salle_bains: number | null;
  capacity: number | null;
  address: string | null;
  ville_commune: string | null;
  pays: string | null;
  localisation: string | null;
  latitude: number | null;
  longitude: number | null;
  folder: string | null;
  type_bien_id: number | null;
  service_bien_id: number | null;
  categorie_bien_id: number | null;
  is_active: boolean;
  created_at: string;
  // Joints
  types_bien: { id: number; name: string | null } | null;
  services_bien: { id: number; name: string | null } | null;
  categories_bien: { id: number; name: string | null } | null;
  // Galerie (depuis bien_images, première image = cover)
  cover_url?: string | null;
  images_count?: number;
};

export type BienImage = {
  id: string;
  url: string;
  storage_path: string | null;
  alt: string | null;
  ordre: number;
};

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ============================================================================
// LIST : tous les biens pour la table admin
// ============================================================================

/**
 * Récupère tous les biens pour la table admin avec les joints + cover photo.
 * La cover est calculée depuis bien_images.ordre = MIN(ordre) pour ce bien.
 */
export async function listBiensAdmin(): Promise<BienAdminRow[]> {
  const supabase = await createClient();

  // 1. Récupérer tous les biens avec les joints classiques
  const { data: biens, error } = await supabase
    .from("biens")
    .select(`
      id, name, short_description, description, image, prix, prix_month,
      chambre, salon, salle_bains, capacity, address, ville_commune, pays,
      localisation, folder, type_bien_id, service_bien_id, categorie_bien_id,
      is_active, created_at,
      types_bien:type_bien_id (id, name),
      services_bien:service_bien_id (id, name),
      categories_bien:categorie_bien_id (id, name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listBiensAdmin error:", error);
    return [];
  }
  if (!biens) return [];

  // 2. Récupérer la cover (ordre min) pour chaque bien
  const bienIds = biens.map((b) => b.id);
  if (bienIds.length === 0) return [];

  const { data: covers } = await supabase
    .from("bien_images")
    .select("bien_id, url, ordre")
    .in("bien_id", bienIds)
    .order("ordre", { ascending: true });

  // Map cover par bien_id (la 1ère image par ordre)
  const coverByBien = new Map<string, string>();
  const countByBien = new Map<string, number>();
  for (const img of covers ?? []) {
    if (!coverByBien.has(img.bien_id)) {
      coverByBien.set(img.bien_id, img.url);
    }
    countByBien.set(img.bien_id, (countByBien.get(img.bien_id) ?? 0) + 1);
  }

  // 3. Coords GPS (tentative tolérante : si la migration 0012 n'a pas
  //    encore tourné, les colonnes lat/lng n'existent pas et on retourne
  //    juste vide. Le module bien continue de fonctionner sans coords.)
  const coordsByBien = new Map<string, { latitude: number | null; longitude: number | null }>();
  try {
    const { data: coords } = await supabase
      .from("biens")
      .select("id, latitude, longitude")
      .in("id", bienIds);
    for (const c of coords ?? []) {
      coordsByBien.set(c.id, {
        latitude: (c as any).latitude ?? null,
        longitude: (c as any).longitude ?? null,
      });
    }
  } catch {
    // Colonnes lat/lng absentes : migration 0012 pas encore exécutée.
    // Le module bien fonctionne quand même, juste sans coords.
  }

  return biens.map((b) => {
    const coords = coordsByBien.get(b.id);
    return {
      ...(b as unknown as BienAdminRow),
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
      cover_url: coverByBien.get(b.id) ?? b.image ?? null,
      images_count: countByBien.get(b.id) ?? 0,
    };
  });
}

// ============================================================================
// GET ONE : bien avec ses images, pour l'édition
// ============================================================================

export async function getBienAdmin(
  id: string,
): Promise<{ bien: BienAdminRow; images: BienImage[] } | null> {
  const supabase = await createClient();

  const { data: bien, error } = await supabase
    .from("biens")
    .select(`
      id, name, short_description, description, image, prix, prix_month,
      chambre, salon, salle_bains, capacity, address, ville_commune, pays,
      localisation, folder, type_bien_id, service_bien_id, categorie_bien_id,
      is_active, created_at,
      types_bien:type_bien_id (id, name),
      services_bien:service_bien_id (id, name),
      categories_bien:categorie_bien_id (id, name)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !bien) {
    if (error) console.error("getBienAdmin error:", error);
    return null;
  }

  // Tentative tolérante de récupérer lat/lng (migration 0012)
  let latitude: number | null = null;
  let longitude: number | null = null;
  try {
    const { data: coords } = await supabase
      .from("biens")
      .select("latitude, longitude")
      .eq("id", id)
      .maybeSingle();
    latitude = (coords as any)?.latitude ?? null;
    longitude = (coords as any)?.longitude ?? null;
  } catch {
    // Migration 0012 pas encore exécutée, on continue sans coords
  }

  // Auto-import des images legacy : tente d'importer depuis le folder
  // Storage OU depuis bien.image (cover unique legacy). Idempotent :
  // ne fait rien si bien_images contient déjà des entries.
  // Appelé inconditionnellement (la fonction décide elle-même quoi faire).
  await migrateBienImagesFromFolder(id).catch(() => {});

  const { data: images } = await supabase
    .from("bien_images")
    .select("id, url, storage_path, alt, ordre")
    .eq("bien_id", id)
    .order("ordre", { ascending: true });

  return {
    bien: {
      ...(bien as unknown as BienAdminRow),
      latitude,
      longitude,
    },
    images: (images as BienImage[]) ?? [],
  };
}

// ============================================================================
// REFERENCE DATA : types / services_bien / categories_bien pour les selects
// ============================================================================

export type ReferenceData = {
  types: { id: number; name: string }[];
  services: { id: number; name: string }[];
  categories: { id: number; name: string }[];
};

export async function getReferenceData(): Promise<ReferenceData> {
  const supabase = await createClient();

  const [typesRes, servicesRes, categoriesRes] = await Promise.all([
    supabase
      .from("types_bien")
      .select("id, name")
      .order("name", { ascending: true }),
    supabase
      .from("services_bien")
      .select("id, name")
      .order("name", { ascending: true }),
    supabase
      .from("categories_bien")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);

  return {
    types: (typesRes.data ?? []).filter((t) => t.name) as {
      id: number;
      name: string;
    }[],
    services: (servicesRes.data ?? []).filter((s) => s.name) as {
      id: number;
      name: string;
    }[],
    categories: (categoriesRes.data ?? []).filter((c) => c.name) as {
      id: number;
      name: string;
    }[],
  };
}

// ============================================================================
// UPSERT : créer ou modifier un bien + sync ses images
// ============================================================================

export type BienFormData = {
  id?: string;
  name: string;
  short_description?: string | null;
  description?: string | null;
  prix?: number | null;
  prix_month?: number | null;
  chambre?: number | null;
  salon?: number | null;
  salle_bains?: number | null;
  capacity?: number | null;
  address?: string | null;
  ville_commune?: string | null;
  pays?: string | null;
  localisation?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  type_bien_id?: number | null;
  service_bien_id?: number | null;
  categorie_bien_id?: number | null;
  /** Si false, le bien est masqué du site public (toujours visible en admin). */
  is_active?: boolean;
  /** URLs des images dans l'ordre voulu. La 1ère = cover. */
  image_urls: string[];
};

export async function upsertBien(
  input: BienFormData,
): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  if (!input.name?.trim()) {
    return { ok: false, error: "Le nom est obligatoire." };
  }

  const supabase = await createClient();

  // Données à upsert (on retire id, image_urls)
  const bienData = {
    name: input.name.trim(),
    short_description: input.short_description?.trim() || null,
    description: input.description?.trim() || null,
    prix: input.prix ?? null,
    prix_month: input.prix_month ?? null,
    chambre: input.chambre ?? null,
    salon: input.salon ?? null,
    salle_bains: input.salle_bains ?? null,
    capacity: input.capacity ?? null,
    address: input.address?.trim() || null,
    ville_commune: input.ville_commune?.trim() || null,
    pays: input.pays?.trim() || null,
    localisation: input.localisation?.trim() || null,
    // latitude / longitude écrits séparément en best-effort plus bas
    // pour tolérer l'absence de la migration 0012_biens_geocoords.sql
    type_bien_id: input.type_bien_id ?? null,
    service_bien_id: input.service_bien_id ?? null,
    categorie_bien_id: input.categorie_bien_id ?? null,
    image: input.image_urls[0] ?? null, // legacy field : cover pour compat site public
    is_active: input.is_active ?? true,
  };

  let bienId: string;

  if (input.id) {
    // UPDATE
    const { error } = await supabase
      .from("biens")
      .update(bienData)
      .eq("id", input.id);
    if (error) {
      console.error("upsertBien update error:", error);
      return { ok: false, error: error.message };
    }
    bienId = input.id;
  } else {
    // INSERT
    const { data, error } = await supabase
      .from("biens")
      .insert(bienData)
      .select("id")
      .single();
    if (error || !data) {
      console.error("upsertBien insert error:", error);
      return { ok: false, error: error?.message ?? "Erreur création." };
    }
    bienId = data.id;
  }

  // Best-effort : tente de persister lat/lng. Si la migration 0012 n'a
  // pas tourné, les colonnes n'existent pas → on swallow l'erreur pour
  // ne pas bloquer la création/édition du bien.
  if (input.latitude != null || input.longitude != null) {
    try {
      await supabase
        .from("biens")
        .update({
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
        } as any)
        .eq("id", bienId);
    } catch {
      // Colonnes lat/lng absentes : ignoré, le bien est créé sans coords.
    }
  }

  // Sync des images : on récupère les anciennes URLs, on calcule diff
  const { data: existingImages } = await supabase
    .from("bien_images")
    .select("id, url, storage_path")
    .eq("bien_id", bienId);

  const existingByUrl = new Map(
    (existingImages ?? []).map((img) => [img.url, img]),
  );

  // Images à SUPPRIMER : présentes en DB mais plus dans input.image_urls
  const toDelete = (existingImages ?? []).filter(
    (img) => !input.image_urls.includes(img.url),
  );

  if (toDelete.length > 0) {
    await supabase
      .from("bien_images")
      .delete()
      .in(
        "id",
        toDelete.map((img) => img.id),
      );
    // Cleanup Storage des fichiers retirés
    for (const img of toDelete) {
      if (img.storage_path) {
        await deleteAdminImage(img.storage_path).catch(() => {});
      }
    }
  }

  // Images à INSÉRER : nouvelles dans input.image_urls
  // Et UPDATE de l'ordre pour celles qui existaient déjà
  for (let i = 0; i < input.image_urls.length; i++) {
    const url = input.image_urls[i];
    const existing = existingByUrl.get(url);
    if (existing) {
      // Update ordre seulement
      await supabase
        .from("bien_images")
        .update({ ordre: i })
        .eq("id", existing.id);
    } else {
      // Insert nouveau
      const storage_path = extractStoragePath(url);
      await supabase.from("bien_images").insert({
        bien_id: bienId,
        url,
        storage_path,
        ordre: i,
      });
    }
  }

  // Revalidation des routes
  revalidatePath("/admin/biens");
  revalidatePath(`/admin/biens/${bienId}`);
  revalidatePath("/properties");
  revalidatePath(`/properties/${bienId}`);

  return { ok: true, data: { id: bienId } };
}

// ============================================================================
// DELETE : supprime le bien et toutes ses images (Storage + DB)
// ============================================================================

export async function deleteBien(id: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();

  // Récupérer les images pour cleanup Storage
  const { data: images } = await supabase
    .from("bien_images")
    .select("storage_path")
    .eq("bien_id", id);

  // Cleanup Storage
  for (const img of images ?? []) {
    if (img.storage_path) {
      await deleteAdminImage(img.storage_path).catch(() => {});
    }
  }

  // Supprimer le bien (ON DELETE CASCADE sur bien_images)
  const { error } = await supabase.from("biens").delete().eq("id", id);
  if (error) {
    console.error("deleteBien error:", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/biens");
  revalidatePath("/properties");
  return { ok: true, data: undefined };
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Depuis une URL Supabase Storage publique, extrait le `storage_path`.
 * Ex: "https://xxx.supabase.co/storage/v1/object/public/images/biens/abc/123.jpg"
 *     → "biens/abc/123.jpg"
 *
 * Retourne null si l'URL ne correspond pas au pattern attendu.
 */
function extractStoragePath(url: string): string | null {
  try {
    const u = new URL(url);
    const marker = "/storage/v1/object/public/images/";
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return null;
    return u.pathname.substring(idx + marker.length);
  } catch {
    return null;
  }
}

/**
 * Wrapper pratique pour les Server Actions appelées depuis un formulaire :
 * en cas de succès, redirige vers la liste avec un message flash (param URL).
 */
export async function upsertBienAndRedirect(input: BienFormData) {
  const result = await upsertBien(input);
  if (!result.ok) return result;
  redirect(`/admin/biens?flash=${input.id ? "updated" : "created"}`);
}
