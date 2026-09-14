"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";

/**
 * Server Actions admin pour la table `quartiers`.
 *
 * Un quartier n'a plus de rendu propre sur la vitrine : la section « Nos
 * quartiers » a disparu de l'accueil. Il ne sert plus qu'au filtre
 * /properties?quartier=<id> et au groupement du dropdown Localisation, qui
 * n'affichent que son nom. Les colonnes purement décoratives (badge,
 * description, is_featured) ne sont donc plus ni saisies ni écrites.
 */

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type QuartierRow = {
  commune_id?: string | null;
  id: string;
  name: string;
  commune: string;
  /** Affichée sous le nom dans la liste d'administration. */
  tagline: string | null;
  image: string;
  /** Alias de recherche : résout ?location= vers ce quartier. */
  search_query: string | null;
  ordre: number;
  is_active: boolean;
  updated_at: string;
};

export type QuartierFormData = {
  commune_id?: string | null;
  id?: string;
  name: string;
  commune: string;
  tagline?: string | null;
  image: string;
  search_query?: string | null;
  ordre?: number;
  is_active?: boolean;
};

const COLONNES =
  "id, name, commune, commune_id, tagline, image, search_query, ordre, is_active, updated_at";

// La liste et les filtres de lieu vivent sur l'accueil et le catalogue ;
// /admin/quartiers ne contient plus qu'un redirect, la page consommatrice
// est /admin/geographie.
const REVALIDATE = ["/", "/properties", "/admin/geographie"];

function revaliderVitrine() {
  REVALIDATE.forEach((p) => revalidatePath(p));
}

export async function listQuartiersAdmin(): Promise<QuartierRow[]> {
  const admin = await getAdminUser();
  if (!admin) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("quartiers")
    .select(COLONNES)
    .order("ordre", { ascending: true });
  return (data as unknown as QuartierRow[]) ?? [];
}

export async function getQuartierAdmin(id: string): Promise<QuartierRow | null> {
  const admin = await getAdminUser();
  if (!admin) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("quartiers")
    .select(COLONNES)
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as QuartierRow) ?? null;
}

export async function upsertQuartier(
  input: QuartierFormData,
): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  if (!input.name?.trim()) return { ok: false, error: "Le nom est obligatoire." };
  if (!input.commune?.trim()) return { ok: false, error: "La commune est obligatoire." };
  // `quartiers.image` est NOT NULL depuis la migration 0006 : sans cette
  // garde, l'admin recevrait l'erreur brute de Postgres au lieu d'un message
  // en français. La vignette ne sert aujourd'hui qu'à repérer la ligne dans
  // la liste d'administration — voir « migrationsNecessaires » pour la
  // rendre facultative.
  if (!input.image?.trim()) return { ok: false, error: "L'image est obligatoire." };

  const supabase = await createClient();
  const data = {
    commune_id: input.commune_id || null,
    name: input.name.trim(),
    commune: input.commune.trim(),
    tagline: input.tagline?.trim() || null,
    image: input.image.trim(),
    search_query: input.search_query?.trim() || null,
    is_active: input.is_active ?? true,
  };

  if (input.id) {
    // `ordre` n'est écrit que s'il est explicitement fourni, comme dans
    // communes.ts : la valeur par défaut `?? 0` remettait le quartier en tête
    // de liste dès qu'un appelant omettait le champ.
    const payload =
      input.ordre !== undefined ? { ...data, ordre: input.ordre } : data;
    const { error } = await supabase.from("quartiers").update(payload).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    revaliderVitrine();
    return { ok: true, data: { id: input.id } };
  }
  const { data: existing } = await supabase
    .from("quartiers")
    .select("ordre")
    .order("ordre", { ascending: false })
    .limit(1);
  const nextOrdre = ((existing?.[0]?.ordre as number | undefined) ?? 0) + 1;
  const { data: created, error } = await supabase
    .from("quartiers")
    .insert({ ...data, ordre: input.ordre ?? nextOrdre })
    .select("id")
    .single();
  if (error || !created) return { ok: false, error: error?.message ?? "Erreur." };
  revaliderVitrine();
  return { ok: true, data: { id: created.id as string } };
}

export async function deleteQuartier(id: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("quartiers").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revaliderVitrine();
  return { ok: true, data: undefined };
}

export async function toggleQuartierActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("quartiers").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revaliderVitrine();
  return { ok: true, data: undefined };
}
