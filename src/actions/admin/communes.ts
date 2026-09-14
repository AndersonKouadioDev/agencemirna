"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";

export type CommuneAdminRow = {
  id: string;
  nom: string;
  slug: string;
  is_active: boolean;
  ordre: number;
  updated_at: string;
  // Champs de présentation (migration 0015) : alimentent la section
  // « Communes phares » de l'accueil et les visuels du méga-menu.
  badge: string | null;
  tagline: string | null;
  description: string | null;
  image: string | null;
  search_query: string | null;
  is_featured: boolean;
};

export type CommuneFormData = {
  id?: string;
  nom: string;
  slug: string;
  is_active?: boolean;
  ordre?: number;
  badge?: string | null;
  tagline?: string | null;
  description?: string | null;
  image?: string | null;
  search_query?: string | null;
  is_featured?: boolean;
};

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function listCommunesAdmin(): Promise<CommuneAdminRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("communes")
    .select("*")
    .order("ordre", { ascending: true });

  if (error || !data) return [];
  return data as CommuneAdminRow[];
}

export async function getCommuneAdmin(id: string): Promise<CommuneAdminRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("communes").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as CommuneAdminRow;
}

/**
 * Les communes alimentent la section « Communes phares » de l'accueil, le
 * méga-menu et les filtres du catalogue : toute écriture doit les revalider,
 * sans quoi une modification reste invisible sur le site.
 */
function revaliderVitrine() {
  revalidatePath("/admin/communes");
  revalidatePath("/", "layout");
  revalidatePath("/properties");
}

export async function upsertCommune(input: CommuneFormData): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  if (!input.nom?.trim()) return { ok: false, error: "Le nom est obligatoire." };
  if (!input.slug?.trim()) return { ok: false, error: "Le slug est obligatoire." };

  const supabase = await createClient();

  const data = {
    nom: input.nom.trim(),
    slug: input.slug.trim().toLowerCase(),
    is_active: input.is_active ?? true,
    badge: input.badge?.trim() || null,
    tagline: input.tagline?.trim() || null,
    description: input.description?.trim() || null,
    image: input.image?.trim() || null,
    search_query: input.search_query?.trim() || null,
    is_featured: input.is_featured ?? false,
  };

  if (input.id) {
    // `ordre` n'est écrit que s'il est explicitement fourni : sinon une
    // simple édition remettait la commune en tête de liste (ordre = 0).
    const payload =
      input.ordre !== undefined ? { ...data, ordre: input.ordre } : data;
    const { error } = await supabase.from("communes").update(payload).eq("id", input.id);
    if (error) {
      return {
        ok: false,
        error:
          error.code === "23505"
            ? "Ce slug est déjà utilisé par une autre commune."
            : error.message,
      };
    }
    revaliderVitrine();
    return { ok: true, data: { id: input.id } };
  } else {
    const { data: existing } = await supabase.from("communes").select("ordre").order("ordre", { ascending: false }).limit(1);
    const nextOrdre = ((existing?.[0]?.ordre as number | undefined) ?? 0) + 1;

    const { data: created, error } = await supabase.from("communes").insert({ ...data, ordre: input.ordre ?? nextOrdre }).select("id").single();
    if (error || !created) {
      return {
        ok: false,
        error:
          error?.code === "23505"
            ? "Ce slug est déjà utilisé par une autre commune."
            : error?.message ?? "Erreur.",
      };
    }
    revaliderVitrine();
    return { ok: true, data: { id: created.id } };
  }
}

export async function deleteCommune(id: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("communes").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revaliderVitrine();
  return { ok: true, data: undefined };
}

export async function toggleCommuneActive(id: string, isActive: boolean): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("communes").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revaliderVitrine();
  return { ok: true, data: undefined };
}

export async function upsertCommuneAndRedirect(input: CommuneFormData) {
  const result = await upsertCommune(input);
  if (result.ok) redirect("/admin/communes?flash=saved");
  return result;
}
