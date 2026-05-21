"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";

/**
 * Server Actions admin pour la table `quartiers` (zones/communes affichées
 * sur la home dans la section "Nos quartiers", chargées dans le dropdown
 * Localisation du hero search).
 */

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type QuartierRow = {
  id: string;
  name: string;
  commune: string;
  badge: string | null;
  tagline: string | null;
  description: string | null;
  image: string;
  search_query: string | null;
  ordre: number;
  is_active: boolean;
  is_featured: boolean;
  updated_at: string;
};

export type QuartierFormData = {
  id?: string;
  name: string;
  commune: string;
  badge?: string | null;
  tagline?: string | null;
  description?: string | null;
  image: string;
  search_query?: string | null;
  ordre?: number;
  is_active?: boolean;
  is_featured?: boolean;
};

const REVALIDATE = ["/", "/properties"];

export async function listQuartiersAdmin(): Promise<QuartierRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quartiers")
    .select("id, name, commune, badge, tagline, description, image, search_query, ordre, is_active, is_featured, updated_at")
    .order("ordre", { ascending: true });
  return (data as QuartierRow[]) ?? [];
}

export async function getQuartierAdmin(id: string): Promise<QuartierRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quartiers")
    .select("id, name, commune, badge, tagline, description, image, search_query, ordre, is_active, is_featured, updated_at")
    .eq("id", id)
    .maybeSingle();
  return (data as QuartierRow) ?? null;
}

export async function upsertQuartier(
  input: QuartierFormData,
): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  if (!input.name?.trim()) return { ok: false, error: "Le nom est obligatoire." };
  if (!input.commune?.trim()) return { ok: false, error: "La commune est obligatoire." };
  if (!input.image?.trim()) return { ok: false, error: "L'image est obligatoire." };

  const supabase = await createClient();
  const data = {
    name: input.name.trim(),
    commune: input.commune.trim(),
    badge: input.badge?.trim() || null,
    tagline: input.tagline?.trim() || null,
    description: input.description?.trim() || null,
    image: input.image.trim(),
    search_query: input.search_query?.trim() || null,
    ordre: input.ordre ?? 0,
    is_active: input.is_active ?? true,
    is_featured: input.is_featured ?? false,
  };

  if (input.id) {
    const { error } = await supabase.from("quartiers").update(data).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    REVALIDATE.forEach((p) => revalidatePath(p));
    revalidatePath("/admin/quartiers");
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
    .insert({ ...data, ordre: nextOrdre })
    .select("id")
    .single();
  if (error || !created) return { ok: false, error: error?.message ?? "Erreur." };
  REVALIDATE.forEach((p) => revalidatePath(p));
  revalidatePath("/admin/quartiers");
  return { ok: true, data: { id: created.id as string } };
}

export async function deleteQuartier(id: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("quartiers").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  REVALIDATE.forEach((p) => revalidatePath(p));
  revalidatePath("/admin/quartiers");
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
  REVALIDATE.forEach((p) => revalidatePath(p));
  revalidatePath("/admin/quartiers");
  return { ok: true, data: undefined };
}

export async function toggleQuartierFeatured(
  id: string,
  isFeatured: boolean,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("quartiers").update({ is_featured: isFeatured }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  REVALIDATE.forEach((p) => revalidatePath(p));
  revalidatePath("/admin/quartiers");
  return { ok: true, data: undefined };
}
