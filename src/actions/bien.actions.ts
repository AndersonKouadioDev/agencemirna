"use server";

import { createClient } from "../supabase/server";

/**
 * Helper : récupère les images depuis le bucket Storage pour un bien
 * ayant un `folder` (système legacy avant la migration bien_images).
 * @param folderName - Le nom du folder dans le bucket (ex: "dakar")
 * @returns Liste d'objets { url, name } pour cleanup ultérieur
 */
async function getBienImagesFromFolder(
  folderName: string,
): Promise<{ url: string; name: string }[]> {
  if (!folderName) return [];

  const supabase = await createClient();
  const fullPath = `biens/${folderName}`;

  const { data, error } = await supabase.storage
    .from("public.images")
    .list(fullPath, {
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

  if (error || !data) {
    return [];
  }

  return data
    .filter((file) => file.name && !file.name.startsWith(".")) // ignore .emptyFolderPlaceholder etc.
    .map((file) => ({
      url: supabase.storage
        .from("images")
        .getPublicUrl(`${fullPath}/${file.name}`).data.publicUrl,
      name: file.name,
    }));
}

/**
 * Récupère les images d'un bien depuis la table `bien_images` (système actuel).
 * Si vide ET le bien a un `folder` legacy, retourne les URLs du folder Storage.
 */
async function getBienImagesUnified(
  bienId: string,
  folder: string | null,
): Promise<string[]> {
  const supabase = await createClient();

  // 1. Essayer la table bien_images (nouveau système)
  const { data: rows } = await supabase
    .from("bien_images")
    .select("url, ordre")
    .eq("bien_id", bienId)
    .order("ordre", { ascending: true });

  if (rows && rows.length > 0) {
    return rows.map((r) => r.url);
  }

  // 2. Fallback : folder Storage legacy
  if (folder) {
    const files = await getBienImagesFromFolder(folder);
    return files.map((f) => f.url);
  }

  return [];
}

/**
 * Lit un bien depuis Postgres avec ses joints (types, services, catégories).
 */
export async function getBien(bienId: string) {
  const supabase = await createClient();

  const { data: bien, error } = await supabase
    .from("biens")
    .select(
      `*,
      types_bien:type_bien_id (*),
      services_bien:service_bien_id (*),
      categories_bien:categorie_bien_id (*)
      `,
    )
    .eq("id", bienId)
    .maybeSingle();

  if (error) {
    console.error("Erreur lors de la récupération du bien:", error);
    return null;
  }

  return bien;
}

/**
 * Lit un bien + ses images (bien_images en priorité, fallback folder Storage).
 * Utilisé par la fiche détail sur le site public.
 */
export async function getBienWithImages(bienId: string) {
  const bien = await getBien(bienId);

  if (!bien) {
    return null;
  }

  const images = await getBienImagesUnified(bien.id, bien.folder ?? null);
  return { ...bien, images };
}

/**
 * Liste tous les biens (page /properties publique).
 * Retourne toujours un array (jamais null) pour éviter les crashs sur .length.
 */
export async function getAllBiens() {
  const supabase = await createClient();

  const { data: biens, error } = await supabase
    .from("biens")
    .select(
      `*,
      types_bien:type_bien_id (*),
      services_bien:service_bien_id (*),
      categories_bien:categorie_bien_id (*)
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur lors de la récupération des biens:", error);
    return [];
  }

  return biens ?? [];
}

// ============================================================================
// Import automatique des images legacy : appelé par l'admin à chaque
// édition d'un bien qui a un `folder` mais 0 entries bien_images.
// ============================================================================

/**
 * Server Action : si un bien a un `folder` Storage legacy et 0 image dans
 * bien_images, importe les URLs du folder dans bien_images (path préservé).
 * Idempotent (no-op si bien_images déjà rempli).
 *
 * Appelée silencieusement par l'admin à chaque chargement de la page d'édition.
 * Le user n'a rien à faire.
 */
export async function migrateBienImagesFromFolder(
  bienId: string,
): Promise<{ ok: boolean; imported: number }> {
  const supabase = await createClient();

  // Vérif : le bien a-t-il déjà des bien_images ?
  const { count } = await supabase
    .from("bien_images")
    .select("*", { count: "exact", head: true })
    .eq("bien_id", bienId);

  if ((count ?? 0) > 0) {
    return { ok: true, imported: 0 };
  }

  // Récupérer le folder du bien
  const { data: bien } = await supabase
    .from("biens")
    .select("folder")
    .eq("id", bienId)
    .maybeSingle();

  if (!bien?.folder) {
    return { ok: true, imported: 0 };
  }

  const files = await getBienImagesFromFolder(bien.folder);
  if (files.length === 0) {
    return { ok: true, imported: 0 };
  }

  // Insert dans bien_images avec storage_path pour cleanup futur
  const rows = files.map((file, i) => ({
    bien_id: bienId,
    url: file.url,
    storage_path: `biens/${bien.folder}/${file.name}`,
    ordre: i,
  }));

  const { error } = await supabase.from("bien_images").insert(rows);
  if (error) {
    console.error("migrateBienImagesFromFolder error:", error);
    return { ok: false, imported: 0 };
  }

  return { ok: true, imported: rows.length };
}
