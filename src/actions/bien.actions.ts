"use server";

import { createClient } from "../supabase/server";
import { getAdminUser } from "../supabase/admin-auth";

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

  // FIX : utiliser "images" (le vrai bucket id), pas "public.images" qui
  // n'existait pas et causait un list vide.
  const { data, error } = await supabase.storage
    .from("images")
    .list(fullPath, {
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

  if (error || !data) {
    if (error) console.error("getBienImagesFromFolder error:", error);
    return [];
  }

  return data
    .filter((file) => file.name && !file.name.startsWith(".")) // ignore .emptyFolderPlaceholder
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
    // Le filtrage ne peut pas être laissé à la RLS : la policy admin est
    // `FOR ALL` et se combine en OU avec la policy publique, si bien qu'un
    // administrateur connecté voyait sur la vitrine la fiche du bien qu'il
    // venait de dépublier. getBien n'a que des appelants publics ; une
    // prévisualisation admin devrait passer par un paramètre explicite.
    .eq("is_active", true)
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
 * Ligne de `biens` telle que la vitrine la consomme.
 *
 * La table n'a pas de types générés : on décrit donc ici les colonnes
 * réellement lues par les appelants (catalogue, carrousel, carte, fiche,
 * sitemap) ainsi que les jointures demandées par le `select`. Les deux
 * jointures géographiques sont facultatives : le repli sans géographie de
 * `getAllBiens` ne les renvoie pas.
 */
export type BienPublicRow = {
  id: string;
  name: string | null;
  short_description: string | null;
  description: string | null;
  /** Cover unique héritée d'avant la table `bien_images`. */
  image: string | null;
  prix: number | null;
  prix_month: number | null;
  /** Migration 0024 : le montant n'est pas publié, la vitrine annonce
   *  « Prix sur demande ». Optionnelle tant que le SQL n'est pas appliqué. */
  prix_sur_demande?: boolean | null;
  chambre: number | null;
  salon: number | null;
  salle_bains: number | null;
  capacity: number | null;
  address: string | null;
  ville_commune: string | null;
  pays: string | null;
  localisation: string | null;
  adresse_complete: string | null;
  latitude: number | null;
  longitude: number | null;
  lien_video: string | null;
  area: number | null;
  folder: string | null;
  type_bien_id: number | null;
  service_bien_id: number | null;
  categorie_bien_id: number | null;
  commune_id: string | null;
  quartier_id: string | null;
  is_active: boolean;
  created_at: string;
  /** Absente de certains environnements : le sitemap retombe sur la date du jour. */
  updated_at?: string | null;
  types_bien: { id: number; name: string | null } | null;
  // `est_vente` / `est_meuble` viennent de la migration 0020 : c'est ce qui
  // décide de l'unité d'un prix, sans dépendre du libellé (voir bien-nature.ts).
  services_bien:
    | {
        id: number;
        name: string | null;
        est_vente?: boolean | null;
        est_meuble?: boolean | null;
      }
    | null;
  categories_bien:
    | { id: number; name: string | null; est_meuble?: boolean | null }
    | null;
  communes?: { id: string; nom: string | null; slug: string | null } | null;
  quartiers?: { id: string; name: string | null } | null;
};

/**
 * Liste tous les biens (page /properties publique).
 * Retourne toujours un array (jamais null) pour éviter les crashs sur .length.
 */
export async function getAllBiens(): Promise<BienPublicRow[]> {
  const supabase = await createClient();

  const query = (columns: string) =>
    supabase
      .from("biens")
      .select(columns)
      // Le filtrage ne peut pas être laissé à la RLS : la policy admin est
      // `FOR ALL` et se combine en OU avec la policy publique, si bien qu'un
      // administrateur connecté voyait sur la vitrine les biens qu'il venait
      // de dépublier.
      .eq("is_active", true)
      .order("created_at", { ascending: false });

  // Les jointures commune/quartier viennent de la migration 0015. Tant
  // qu'elle n'est pas appliquée, PostgREST rejette la requête entière et
  // renverrait [] sans erreur visible — ce qui viderait tout le catalogue.
  const withGeo = await query(
    `*,
      types_bien:type_bien_id (*),
      services_bien:service_bien_id (*),
      categories_bien:categorie_bien_id (*),
      communes:commune_id (id, nom, slug),
      quartiers:quartier_id (id, name)
      `,
  );
  if (!withGeo.error && withGeo.data)
    return withGeo.data as unknown as BienPublicRow[];

  console.error(
    "getAllBiens : jointure commune/quartier indisponible, repli sans géographie.",
    withGeo.error,
  );

  const { data: biens, error } = await query(
    `*,
      types_bien:type_bien_id (*),
      services_bien:service_bien_id (*),
      categories_bien:categorie_bien_id (*)
      `,
  );

  if (error) {
    console.error("Erreur lors de la récupération des biens:", error);
    return [];
  }

  return (biens ?? []) as unknown as BienPublicRow[];
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
 * Le user n'a rien à faire : ses photos cover legacy seront éditables.
 */
export async function migrateBienImagesFromFolder(
  bienId: string,
): Promise<{ ok: boolean; imported: number }> {
  // Le fichier est un module "use server" : cette fonction exportée est donc
  // une route appelable par n'importe qui, alors qu'elle supprime et réinsère
  // des lignes de bien_images. Ses deux appelants sont internes et réservés à
  // l'admin (bulkImportAllBienImages fait déjà ce contrôle) : on rétablit ici
  // la même garde plutôt que de compter sur la seule RLS.
  const admin = await getAdminUser();
  if (!admin) {
    return { ok: false, imported: 0 };
  }

  const supabase = await createClient();

  // Récupérer les bien_images existantes (avec leurs storage_path)
  const { data: existing } = await supabase
    .from("bien_images")
    .select("id, storage_path")
    .eq("bien_id", bienId);

  const existingCount = existing?.length ?? 0;

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
      // Si on a déjà PLUS d'entries que ce que le folder contient,
      // l'admin a probablement ajouté des photos manuellement → no-op.
      if (existingCount >= files.length) {
        return { ok: true, imported: 0 };
      }

      // Cas spécial : on a 1 entry legacy (storage_path NULL = importée
      // depuis bien.image au tout début), et le folder contient plus de
      // photos. On remplace pour avoir la galerie complète.
      const allLegacyCovers =
        existingCount > 0 &&
        existing!.every((e) => e.storage_path === null);

      if (allLegacyCovers) {
        // Supprime les entries legacy puis ré-importe depuis folder
        await supabase
          .from("bien_images")
          .delete()
          .eq("bien_id", bienId);
      } else if (existingCount > 0) {
        // L'admin a déjà uploadé des vraies photos, on respecte
        return { ok: true, imported: 0 };
      }

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

  // Si on est ici, pas de folder ou folder vide. Si le bien a déjà
  // au moins 1 entry, on ne fait rien.
  if (existingCount > 0) {
    return { ok: true, imported: 0 };
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

/**
 * Server Action : bulk import pour TOUS les biens.
 * Appelée depuis l'admin (un bouton), elle parcourt chaque bien et
 * applique migrateBienImagesFromFolder en cascade.
 * Retourne un récap : { bien.id, bien.name, folder, imported, ok }
 *
 * Idempotent : un bien déjà importé sera no-op.
 */
export async function bulkImportAllBienImages(): Promise<{
  ok: boolean;
  results: Array<{
    id: string;
    name: string | null;
    folder: string | null;
    imported: number;
    ok: boolean;
  }>;
}> {
  const admin = await getAdminUser();
  if (!admin) {
    return { ok: false, results: [] };
  }

  const supabase = await createClient();
  const { data: biens } = await supabase
    .from("biens")
    .select("id, name, folder")
    .order("name");

  if (!biens) {
    return { ok: false, results: [] };
  }

  const results = [];
  for (const bien of biens) {
    const r = await migrateBienImagesFromFolder(bien.id);
    results.push({
      id: bien.id,
      name: bien.name,
      folder: bien.folder,
      imported: r.imported,
      ok: r.ok,
    });
  }

  return { ok: true, results };
}
