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

export type TaxonomyRow = { id: number; name: string };
export type TaxonomyTable = "types_bien" | "services_bien" | "categories_bien";

const REVALIDATE = ["/", "/properties"];

export async function listTaxonomy(table: TaxonomyTable): Promise<TaxonomyRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from(table)
    .select("id, name")
    .order("name", { ascending: true });
  return ((data ?? []) as TaxonomyRow[]).filter((r) => r.name);
}

export async function addTaxonomyEntry(
  table: TaxonomyTable,
  name: string,
): Promise<ActionResult<{ id: number }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Le nom est obligatoire." };

  const supabase = await createClient();

  // Vérifie unicité car les tables n'ont pas toujours de contrainte UNIQUE
  const { data: existing } = await supabase
    .from(table)
    .select("id")
    .ilike("name", trimmed)
    .maybeSingle();
  if (existing) return { ok: false, error: "Cette valeur existe déjà." };

  const { data, error } = await supabase
    .from(table)
    .insert({ name: trimmed })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Erreur." };
  REVALIDATE.forEach((p) => revalidatePath(p));
  revalidatePath("/admin/parametres");
  return { ok: true, data: { id: data.id as number } };
}

export async function renameTaxonomyEntry(
  table: TaxonomyTable,
  id: number,
  name: string,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Le nom est obligatoire." };

  const supabase = await createClient();
  const { error } = await supabase
    .from(table)
    .update({ name: trimmed })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  REVALIDATE.forEach((p) => revalidatePath(p));
  revalidatePath("/admin/parametres");
  return { ok: true, data: undefined };
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
  if (error) return { ok: false, error: error.message };
  REVALIDATE.forEach((p) => revalidatePath(p));
  revalidatePath("/admin/parametres");
  return { ok: true, data: undefined };
}

// ============================================================================
// Compteurs (utilisés par StatsSection dynamique)
// ============================================================================

export type SiteStats = {
  biens_actifs: number;
  agents_actifs: number;
  services_actifs: number;
  promotions_actives: number;
};

export async function getSiteStats(): Promise<SiteStats> {
  const supabase = await createClient();

  // Note : count avec head:true ne renvoie pas les rows, juste le count
  const [biens, agents, services, promos] = await Promise.all([
    supabase.from("biens").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("agents").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("services").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("promotions").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  return {
    biens_actifs: biens.count ?? 0,
    agents_actifs: agents.count ?? 0,
    services_actifs: services.count ?? 0,
    promotions_actives: promos.count ?? 0,
  };
}
