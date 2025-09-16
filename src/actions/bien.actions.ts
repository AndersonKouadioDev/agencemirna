"use server";

import { createClient } from "../supabase/server";

/**
 * Get the images of a bien
 * @param folderName - The folder name of the bien
 * @returns - The images of the bien
 */
const getBienImages = async (folderName: string) => {
  const supabase = createClient();
  // Le chemin complet sera maintenant 'biens/dakar' par exemple
  const fullPath = `biens/${folderName}`;

  const { data, error } = await supabase.storage
    .from("public.images")
    .list(fullPath, {
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

  if (error) {
    console.error("Erreur lors de la récupération des fichiers:", error);
    return [];
  }

  const imageUrls = data.map((file) => {
    return supabase.storage
      .from("images")
      .getPublicUrl(`${fullPath}/${file.name}`).data.publicUrl;
  });

  return imageUrls;
};

/**
 * Get a bien
 * @param bienId - The id of the bien
 * @returns - The bien
 */
export async function getBien(bienId: string) {
  const supabase = createClient();

  // Récupérer les informations du bien depuis la base de données
  const { data: bien, error } = await supabase
    .from("biens")
    .select(
      `*,
    types_bien:type_bien_id (*),
    services_bien:service_bien_id (*),
    categories_bien:categorie_bien_id (*)
  `
    )
    .eq("id", bienId)
    .single();

  if (error) {
    console.error("Erreur lors de la récupération du bien:", error);
    return null;
  }

  // Retourner le bien avec ses images
  return bien;
}

/**
 * Get a bien with its images
 * @param bienId - The id of the bien
 * @returns - The bien with its images
 */
export async function getBienWithImages(bienId: string) {
  const bien = await getBien(bienId);

  // Récupérer les images du bien
  // Ici, bien.folder contiendrait 'dakar', 'kilagi', etc.
  const images = await getBienImages(bien?.folder);
  return { ...bien, images };
}

export async function getAllBiens() {
  const supabase = createClient();

  // Récupérer les informations du bien depuis la base de données
  const { data: biens, error } = await supabase
    .from("biens")
    .select(
      `*,
      types_bien:type_bien_id (*),
      services_bien:service_bien_id (*),
      categories_bien:categorie_bien_id (*)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur lors de la récupération du bien:", error);
    return null;
  }

  // Retourner le bien avec ses images
  return biens;
}
