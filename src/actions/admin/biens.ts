"use server";

import { revalidatePath } from "next/cache";
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
 * Toutes les actions vérifient `getAdminUser()` au début. Les écritures
 * retournent `{ ok: false, error }` si non autorisé ; les lectures retournent
 * leur valeur vide (null / tableau vide). Un identifiant de Server Action est
 * global : sans cette garde, un module `"use server"` expose chacun de ses
 * exports en POST depuis n'importe quelle route, y compris hors de /admin que
 * le middleware est seul à protéger.
 */

// ============================================================================
// Types
// ============================================================================

const BIEN_SELECT = `
      id, name, short_description, description, image, prix, prix_month,
      chambre, salon, salle_bains, capacity, address, ville_commune, pays,
      localisation, latitude, longitude, adresse_complete, lien_video, area,
      folder, type_bien_id, service_bien_id, categorie_bien_id,
      commune_id, quartier_id,
      is_active, created_at,
      types_bien:type_bien_id (id, name),
      services_bien:service_bien_id (id, name),
      categories_bien:categorie_bien_id (id, name)
    `;

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
  adresse_complete: string | null;
  latitude: number | null;
  longitude: number | null;
  lien_video: string | null;
  address: string | null;
  ville_commune: string | null;
  pays: string | null;
  localisation: string | null;
  folder: string | null;
  type_bien_id: number | null;
  service_bien_id: number | null;
  categorie_bien_id: number | null;
  commune_id: string | null;
  quartier_id: string | null;
  area: number | null;
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
  const admin = await getAdminUser();
  if (!admin) return [];

  const supabase = await createClient();

  // 1. Récupérer tous les biens avec les joints classiques + lat/lng
  //    (migration 0012_biens_geocoords.sql obligatoire — ajoute les
  //    colonnes latitude/longitude. Si tu vois une erreur du genre
  //    "column biens.latitude does not exist", applique la migration.)
  const { data: biens, error } = await supabase
    .from("biens")
    .select(BIEN_SELECT)
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

  return biens.map((b) => ({
    ...(b as unknown as BienAdminRow),
    cover_url: coverByBien.get(b.id) ?? b.image ?? null,
    images_count: countByBien.get(b.id) ?? 0,
  }));
}

// ============================================================================
// GET ONE : bien avec ses images, pour l'édition
// ============================================================================

/**
 * Lecture pure : elle n'écrit plus rien.
 *
 * L'import des images héritées (`migrateBienImagesFromFolder`) était déclenché
 * ici, si bien qu'ouvrir une fiche supprimait puis réinsérait des lignes de
 * `bien_images`. La page d'édition l'appelle désormais explicitement avant de
 * lire, ce qui rend l'écriture visible là où elle se produit.
 */
export async function getBienAdmin(
  id: string,
): Promise<{ bien: BienAdminRow; images: BienImage[] } | null> {
  const admin = await getAdminUser();
  if (!admin) return null;

  const supabase = await createClient();

  const { data: bien, error } = await supabase
    .from("biens")
    .select(BIEN_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !bien) {
    if (error) console.error("getBienAdmin error:", error);
    return null;
  }

  const { data: images } = await supabase
    .from("bien_images")
    .select("id, url, storage_path, alt, ordre")
    .eq("bien_id", id)
    .order("ordre", { ascending: true });

  return {
    bien: bien as unknown as BienAdminRow,
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
  communes: { id: string; nom: string; is_active: boolean }[];
  quartiers: {
    id: string;
    name: string;
    commune: string | null;
    commune_id: string | null;
    is_active: boolean;
  }[];
};

export async function getReferenceData(): Promise<ReferenceData> {
  const admin = await getAdminUser();
  // Objet neuf plutôt qu'une constante de module : les tableaux repartent
  // vers l'appelant, une constante partagée survivrait à la requête.
  if (!admin)
    return { types: [], services: [], categories: [], communes: [], quartiers: [] };

  const supabase = await createClient();

  const [typesRes, servicesRes, categoriesRes, communesRes, quartiersRes] =
    await Promise.all([
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
    supabase
      .from("communes")
      .select("id, nom, is_active, ordre")
      .order("ordre", { ascending: true }),
    supabase
      .from("quartiers")
      .select("id, name, commune, commune_id, is_active, ordre")
      .order("ordre", { ascending: true }),
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
    communes: (communesRes.data ?? []) as ReferenceData["communes"],
    quartiers: (quartiersRes.data ?? []) as ReferenceData["quartiers"],
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
  /** UUID : surtout pas de parseInt, qui les transformerait en null. */
  commune_id?: string | null;
  quartier_id?: string | null;
  adresse_complete?: string | null;
  lien_video?: string | null;
  /** Surface habitable en m². */
  area?: number | null;
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

  // Données à upsert (on retire id, image_urls).
  // IMPORTANT : `latitude` / `longitude` nécessitent que la migration
  // 0012_biens_geocoords.sql ait été appliquée sur Supabase (elle ajoute
  // les colonnes). Si tu vois l'erreur "column biens.latitude does not
  // exist", lance la migration.
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
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    type_bien_id: input.type_bien_id ?? null,
    service_bien_id: input.service_bien_id ?? null,
    categorie_bien_id: input.categorie_bien_id ?? null,
    commune_id: input.commune_id || null,
    quartier_id: input.quartier_id || null,
    adresse_complete: input.adresse_complete?.trim() || null,
    lien_video: input.lien_video?.trim() || null,
    area: input.area ?? null,
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
      return { ok: false, error: formatBienError(error.message) };
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
      return {
        ok: false,
        error: formatBienError(error?.message ?? "Erreur création."),
      };
    }
    bienId = data.id;
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
 * Traduit les erreurs Postgres techniques en messages clairs pour l'admin.
 * Cas couvert : colonne lat/lng absente parce que la migration 0012 n'a
 * pas été appliquée.
 */
function formatBienError(rawMessage: string): string {
  const msg = rawMessage.toLowerCase();
  if (msg.includes("column") && msg.includes("does not exist")) {
    // Le message d'origine parlait de GPS quelle que soit la colonne
    // manquante, ce qui envoyait l'admin sur une fausse piste. On nomme
    // la migration correspondant à la colonne réellement absente.
    const migration =
      msg.includes("commune_id") ||
      msg.includes("quartier_id") ||
      msg.includes("area")
        ? "0015_communes_quartiers_annonces.sql"
        : msg.includes("adresse_complete") || msg.includes("lien_video")
          ? "0014_refonte_luxe.sql"
          : msg.includes("latitude") || msg.includes("longitude")
            ? "0012_biens_geocoords.sql"
            : null;

    if (migration) {
      return (
        `Une colonne attendue n'existe pas en base : la migration ${migration} ` +
        "n'a pas été appliquée. Ouvre Supabase → SQL Editor, exécute le " +
        `contenu de supabase/migrations/${migration}, puis réessaie. ` +
        `(détail : ${rawMessage})`
      );
    }
  }
  return rawMessage;
}

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
