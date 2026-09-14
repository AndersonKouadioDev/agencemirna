"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";

/**
 * Server Actions admin pour la taxonomie des biens :
 *  - types_bien        : Appartement, Studio, Villa, Terrain, Entrepôt...
 *  - services_bien     : Vente, Location, Gestion locative, Bail commercial...
 *  - categories_bien   : Meublé, Non meublé, Semi-meublé...
 *
 * CRUD simple : add / rename / delete. Pas de toggle actif car ces tables
 * sont des référentiels purs (peu de raisons de désactiver une valeur).
 */

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type TaxonomyRow = {
  id: number;
  name: string;
  image: string | null;
  icon: string | null;
  ordre: number;
};
export type TaxonomyTable = "types_bien" | "services_bien" | "categories_bien";

const REVALIDATE = ["/properties", "/admin/taxonomie"];

/**
 * Les types et les services sont lus par app/(marketing)/layout.tsx pour
 * construire le méga-menu : une purge de "/" en portée « page » par défaut
 * laisserait ce layout sur l'ancienne liste. Même portée « layout » que
 * communes.ts, qui touche au même menu.
 */
const revalider = () => {
  REVALIDATE.forEach((p) => revalidatePath(p));
  revalidatePath("/", "layout");
};

/**
 * Les colonnes image / icon / ordre viennent de la migration 0018. Tant
 * qu'elle n'est pas appliquée, PostgREST rejette la requête entière et
 * renverrait [] sans erreur visible — ce qui viderait les listes déroulantes
 * de création d'un bien. On retente donc avec le jeu minimal.
 */
export async function listTaxonomy(table: TaxonomyTable): Promise<TaxonomyRow[]> {
  // Module « use server » : sans cette garde, la fonction est une route
  // appelable par n'importe qui, au même titre que les écritures du fichier.
  const admin = await getAdminUser();
  if (!admin) return [];

  const supabase = await createClient();

  const complet = await supabase
    .from(table)
    .select("id, name, image, icon, ordre")
    .order("ordre", { ascending: true })
    .order("name", { ascending: true });

  if (!complet.error && complet.data) {
    return (complet.data as unknown as TaxonomyRow[]).filter((r) => r.name);
  }

  console.error(`listTaxonomy(${table}) : repli sans image/ordre.`, complet.error);
  const { data } = await supabase
    .from(table)
    .select("id, name")
    .order("name", { ascending: true });
  return ((data ?? []) as Array<{ id: number; name: string }>)
    .filter((r) => r.name)
    .map((r) => ({ ...r, image: null, icon: null, ordre: 0 }));
}

export type TaxonomyFormData = {
  id?: number;
  name: string;
  image?: string | null;
  icon?: string | null;
  ordre?: number | null;
};

/**
 * Crée ou modifie une entrée de taxonomie.
 *
 * Remplace l'ancien couple add/rename : ceux-ci n'écrivaient que le nom, si
 * bien qu'aucun visuel ni aucun ordre n'était saisissable.
 */
export async function upsertTaxonomyEntry(
  table: TaxonomyTable,
  input: TaxonomyFormData,
): Promise<ActionResult<{ id: number }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Le nom est obligatoire." };

  const supabase = await createClient();

  // Ces tables n'ont pas toutes une contrainte UNIQUE : on vérifie nous-mêmes.
  //
  // Deux pièges dans ce garde-fou. Le second argument d'`ilike` est un motif :
  // sans échappement, « Local_commercial » serait rejeté comme doublon de
  // « Local commercial ». Et `maybeSingle()` échoue dès que deux lignes
  // correspondent, en renvoyant data:null — le garde-fou se désarmait donc
  // exactement dans le cas où il sert. On lit une page de candidats et on
  // tranche en JavaScript sur une égalité stricte, insensible à la casse.
  const motif = name.replace(/[\\%_]/g, "\\$&");
  const { data: homonymes, error: erreurHomonymes } = await supabase
    .from(table)
    .select("id, name")
    .ilike("name", motif)
    .limit(25);
  if (erreurHomonymes) return { ok: false, error: erreurHomonymes.message };
  const doublon = (homonymes ?? []).find(
    (r) =>
      r.id !== input.id &&
      String(r.name).trim().toLowerCase() === name.toLowerCase(),
  );
  if (doublon) {
    return { ok: false, error: "Cette valeur existe déjà." };
  }

  const payload: Record<string, unknown> = { name };
  // `image`, `icon` et `ordre` sont optionnels dans TaxonomyFormData : les
  // écrire inconditionnellement remettait la colonne à null à chaque
  // enregistrement d'un appelant qui ne les fournit pas. On ne touche une
  // colonne que lorsque sa valeur est explicitement transmise — `null` reste
  // une valeur, c'est ainsi que le formulaire retire une image.
  if (input.image !== undefined) payload.image = input.image?.trim() || null;
  if (input.icon !== undefined) payload.icon = input.icon?.trim() || null;
  if (input.ordre != null) payload.ordre = input.ordre;

  if (input.id) {
    // Sans `.select()`, PostgREST répond 204 sans corps : une mise à jour qui
    // ne touche aucune ligne (id disparu, RLS) reviendrait avec error:null et
    // l'admin verrait un succès pour une modification jamais écrite.
    const { data: modifie, error } = await supabase
      .from(table)
      .update(payload)
      .eq("id", input.id)
      .select("id")
      .maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!modifie) {
      return { ok: false, error: "Entrée introuvable ou droits insuffisants." };
    }
    revalider();
    return { ok: true, data: { id: input.id } };
  }

  // Nouvel élément : placé en fin de liste.
  const { data: dernier } = await supabase
    .from(table)
    .select("ordre")
    .order("ordre", { ascending: false })
    .limit(1)
    .maybeSingle();
  const suivant = ((dernier?.ordre as number | undefined) ?? 0) + 10;

  const { data, error } = await supabase
    .from(table)
    .insert({ ...payload, ordre: input.ordre ?? suivant })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Erreur." };
  revalider();
  return { ok: true, data: { id: data.id as number } };
}

export async function deleteTaxonomyEntry(
  table: TaxonomyTable,
  id: number,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  // Note : si des biens référencent cet id, la FK lèvera l'erreur Postgres
  // (on laisse remonter à l'utilisateur, pas de cascade automatique).
  // `.select()` pour la même raison que l'update : une suppression sans effet
  // doit se distinguer d'une suppression réussie.
  const { data: supprime, error } = await supabase
    .from(table)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) {
    // La clé étrangère protège les biens qui référencent l'entrée : on
    // traduit l'erreur Postgres brute en message actionnable.
    return {
      ok: false,
      error:
        error.code === "23503"
          ? "Impossible de supprimer : des biens utilisent encore cette valeur. Reclassez-les d'abord."
          : error.message,
    };
  }
  if (!supprime) {
    return { ok: false, error: "Entrée introuvable ou droits insuffisants." };
  }
  revalider();
  return { ok: true, data: undefined };
}

// ============================================================================
// Compteurs (utilisés par StatsSection dynamique)
// ============================================================================

