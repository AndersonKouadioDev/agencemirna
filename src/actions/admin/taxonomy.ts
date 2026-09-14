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

const REVALIDATE = ["/", "/properties", "/admin/taxonomie", "/admin/parametres"];

const revalider = () => REVALIDATE.forEach((p) => revalidatePath(p));

/**
 * Les colonnes image / icon / ordre viennent de la migration 0018. Tant
 * qu'elle n'est pas appliquée, PostgREST rejette la requête entière et
 * renverrait [] sans erreur visible — ce qui viderait les listes déroulantes
 * de création d'un bien. On retente donc avec le jeu minimal.
 */
export async function listTaxonomy(table: TaxonomyTable): Promise<TaxonomyRow[]> {
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
  const { data: existant } = await supabase
    .from(table)
    .select("id")
    .ilike("name", name)
    .maybeSingle();
  if (existant && existant.id !== input.id) {
    return { ok: false, error: "Cette valeur existe déjà." };
  }

  const payload: Record<string, unknown> = {
    name,
    image: input.image?.trim() || null,
    icon: input.icon?.trim() || null,
  };
  if (input.ordre != null) payload.ordre = input.ordre;

  if (input.id) {
    const { error } = await supabase.from(table).update(payload).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
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
  const { error } = await supabase.from(table).delete().eq("id", id);
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
  revalider();
  return { ok: true, data: undefined };
}

// ============================================================================
// Compteurs (utilisés par StatsSection dynamique)
// ============================================================================

export type SiteStats = {
  biens_actifs: number;
  agents_actifs: number;
  annonces_actives: number;
};

export async function getSiteStats(): Promise<SiteStats> {
  const supabase = await createClient();

  // Note : count avec head:true ne renvoie pas les rows, juste le count
  const [biens, agents, annonces] = await Promise.all([
    supabase.from("biens").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("agents").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("annonces").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  return {
    biens_actifs: biens.count ?? 0,
    agents_actifs: agents.count ?? 0,
    annonces_actives: annonces.count ?? 0,
  };
}
