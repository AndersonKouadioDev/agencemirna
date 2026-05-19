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
 * Fallback en cascade :
 * 1. Table bien_images (nouveau système, multi-photos)
 * 2. Folder Storage legacy si défini
 * 3. bien.image (cover unique legacy) wrappée en array
 */
async function getBienImagesUnified(
  bienId: string,
  folder: string | null,
  legacyCover: string | null,
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

  // 2. Fallback : folder Storage legacy (si configuré ET accessible)
  if (folder) {
    const files = await getBienImagesFromFolder(folder);
    if (files.length > 0) {
      return files.map((f) => f.url);
    }
  }

  // 3. Dernier recours : bien.image (cover unique legacy) en array
  if (legacyCover) {
    return [legacyCover];
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

  const images = await getBienImagesUnified(
    bien.id,
    bien.folder ?? null,
    bien.image ?? null,
  );
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
 * Server Action : importe les photos d'un bien legacy dans bien_images.
 *
 * Stratégie :
 * 1. Si bien_images contient déjà des entries → no-op (idempotent)
 * 2. Sinon, tente d'importer depuis le folder Storage (si bien.folder set)
 * 3. Sinon (dernier recours), importe bien.image (cover unique) en tant
 *    que seule entry dans bien_images
 *
 * Appelée silencieusement par l'admin à chaque chargement de la page d'édition.
 * Le user n'a rien à faire — ses photos cover legacy seront éditables.
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

  // Récupérer le folder et l'image cover legacy du bien
  const { data: bien } = await supabase
    .from("biens")
    .select("folder, image")
    .eq("id", bienId)
    .maybeSingle();

  if (!bien) {
    return { ok: true, imported: 0 };
  }

  // 1. Essayer le folder Storage en priorité
  if (bien.folder) {
    const files = await getBienImagesFromFolder(bien.folder);
    if (files.length > 0) {
      const rows = files.map((file, i) => ({
        bien_id: bienId,
        url: file.url,
        storage_path: `biens/${bien.folder}/${file.name}`,
        ordre: i,
      }));
      const { error } = await supabase.from("bien_images").insert(rows);
      if (error) {
        console.error("migrateBienImagesFromFolder (folder) error:", error);
        return { ok: false, imported: 0 };
      }
      return { ok: true, imported: rows.length };
    }
  }

  // 2. Dernier recours : importer bien.image (cover unique legacy)
  if (bien.image) {
    const { error } = await supabase.from("bien_images").insert({
      bien_id: bienId,
      url: bien.image,
      storage_path: null, // URL inconnue, pas de cleanup auto
      ordre: 0,
    });
    if (error) {
      console.error("migrateBienImagesFromFolder (legacy cover) error:", error);
      return { ok: false, imported: 0 };
    }
    return { ok: true, imported: 1 };
  }

  return { ok: true, imported: 0 };
}
