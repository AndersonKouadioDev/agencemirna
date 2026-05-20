"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";

/**
 * Server Actions admin pour la table `promotions` (créas, bannières,
 * offres et actualités publiées sur le site).
 * CRUD complet + toggle is_active + toggle show_on_home.
 */

// ============================================================================
// Types
// ============================================================================

export type PromotionAdminRow = {
  id: string;
  title: string;
  description: string | null;
  image: string;
  cta_label: string | null;
  cta_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  show_on_home: boolean;
  is_active: boolean;
  ordre: number;
  updated_at: string;
};

export type PromotionFormData = {
  id?: string;
  title: string;
  description?: string | null;
  image: string;
  cta_label?: string | null;
  cta_url?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  show_on_home?: boolean;
  is_active?: boolean;
  ordre?: number;
};

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ============================================================================
// LIST
// ============================================================================

export async function listPromotionsAdmin(): Promise<PromotionAdminRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotions")
    .select(
      "id, title, description, image, cta_label, cta_url, starts_at, ends_at, show_on_home, is_active, ordre, updated_at",
    )
    .order("ordre", { ascending: true });

  if (error || !data) {
    if (error) console.error("listPromotionsAdmin error:", error);
    return [];
  }
  return data as PromotionAdminRow[];
}

// ============================================================================
// GET
// ============================================================================

export async function getPromotionAdmin(
  id: string,
): Promise<PromotionAdminRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotions")
    .select(
      "id, title, description, image, cta_label, cta_url, starts_at, ends_at, show_on_home, is_active, ordre, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getPromotionAdmin error:", error);
    return null;
  }
  return data as PromotionAdminRow;
}

// ============================================================================
// UPSERT
// ============================================================================

export async function upsertPromotion(
  input: PromotionFormData,
): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  if (!input.title?.trim()) {
    return { ok: false, error: "Le titre est obligatoire." };
  }
  if (!input.image?.trim()) {
    return { ok: false, error: "Une image est obligatoire." };
  }
  if (
    input.starts_at &&
    input.ends_at &&
    new Date(input.starts_at) >= new Date(input.ends_at)
  ) {
    return {
      ok: false,
      error: "La date de fin doit être après la date de début.",
    };
  }

  const supabase = await createClient();

  const data = {
    title: input.title.trim(),
    description: input.description?.trim() || null,
    image: input.image.trim(),
    cta_label: input.cta_label?.trim() || null,
    cta_url: input.cta_url?.trim() || null,
    starts_at: input.starts_at || null,
    ends_at: input.ends_at || null,
    show_on_home: input.show_on_home ?? false,
    is_active: input.is_active ?? true,
    ordre: input.ordre ?? 0,
  };

  if (input.id) {
    const { error } = await supabase
      .from("promotions")
      .update(data)
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/promotions");
    revalidatePath("/promotions");
    revalidatePath("/");
    return { ok: true, data: { id: input.id } };
  } else {
    const { data: existing } = await supabase
      .from("promotions")
      .select("ordre")
      .order("ordre", { ascending: false })
      .limit(1);
    const nextOrdre = ((existing?.[0]?.ordre as number | undefined) ?? 0) + 1;

    const { data: created, error } = await supabase
      .from("promotions")
      .insert({ ...data, ordre: nextOrdre })
      .select("id")
      .single();
    if (error || !created) {
      return { ok: false, error: error?.message ?? "Erreur de création." };
    }
    revalidatePath("/admin/promotions");
    revalidatePath("/promotions");
    revalidatePath("/");
    return { ok: true, data: { id: created.id as string } };
  }
}

// ============================================================================
// DELETE
// ============================================================================

export async function deletePromotion(id: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const { error } = await supabase.from("promotions").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/promotions");
  revalidatePath("/promotions");
  revalidatePath("/");
  return { ok: true, data: undefined };
}

// ============================================================================
// TOGGLE ACTIVE
// ============================================================================

export async function togglePromotionActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("promotions")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/promotions");
  revalidatePath("/promotions");
  revalidatePath("/");
  return { ok: true, data: undefined };
}

// ============================================================================
// REORDER
// ============================================================================

export async function reorderPromotions(ids: string[]): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const updates = ids.map((id, ordre) =>
    supabase.from("promotions").update({ ordre: ordre + 1 }).eq("id", id),
  );
  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);
  if (errors.length > 0) return { ok: false, error: errors[0].error!.message };

  revalidatePath("/admin/promotions");
  revalidatePath("/promotions");
  return { ok: true, data: undefined };
}

// ============================================================================
// Redirect helper
// ============================================================================

export async function upsertPromotionAndRedirect(input: PromotionFormData) {
  const result = await upsertPromotion(input);
  if (result.ok) {
    redirect("/admin/promotions?flash=saved");
  }
  return result;
}
