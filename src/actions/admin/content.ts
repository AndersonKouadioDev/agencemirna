"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";

/**
 * Server Actions admin pour les 4 tables de contenu éditable :
 *  - testimonials      : témoignages clients (carousel home)
 *  - articles          : blog "Le marché immobilier décodé"
 *  - faqs              : questions / réponses
 *  - social_mentions   : mentions Facebook / Google / Instagram
 *
 * Pattern factorisé : un seul fichier pour 4 tables qui suivent la même
 * forme (CRUD simple, RLS lecture publique active + admin all, ordre).
 */

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const REVALIDATE_PATHS = ["/", "/about"];

// ============================================================================
// TESTIMONIALS
// ============================================================================

export type TestimonialRow = {
  id: string;
  quote: string;
  author_name: string;
  author_role: string | null;
  avatar_initials: string | null;
  rating: number;
  ordre: number;
  is_active: boolean;
  updated_at: string;
};

export type TestimonialFormData = {
  id?: string;
  quote: string;
  author_name: string;
  author_role?: string | null;
  avatar_initials?: string | null;
  rating?: number;
  ordre?: number;
  is_active?: boolean;
};

export async function listTestimonialsAdmin(): Promise<TestimonialRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, quote, author_name, author_role, avatar_initials, rating, ordre, is_active, updated_at")
    .order("ordre", { ascending: true });
  if (error || !data) return [];
  return data as TestimonialRow[];
}

export async function getTestimonialAdmin(id: string): Promise<TestimonialRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("id, quote, author_name, author_role, avatar_initials, rating, ordre, is_active, updated_at")
    .eq("id", id)
    .maybeSingle();
  return (data as TestimonialRow) ?? null;
}

export async function upsertTestimonial(
  input: TestimonialFormData,
): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  if (!input.quote?.trim()) return { ok: false, error: "Le témoignage est obligatoire." };
  if (!input.author_name?.trim()) return { ok: false, error: "Le nom de l'auteur est obligatoire." };

  const supabase = await createClient();
  const data = {
    quote: input.quote.trim(),
    author_name: input.author_name.trim(),
    author_role: input.author_role?.trim() || null,
    avatar_initials: input.avatar_initials?.trim() || null,
    rating: input.rating ?? 5,
    ordre: input.ordre ?? 0,
    is_active: input.is_active ?? true,
  };

  if (input.id) {
    const { error } = await supabase.from("testimonials").update(data).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
    revalidatePath("/admin/testimonials");
    return { ok: true, data: { id: input.id } };
  }
  const { data: existing } = await supabase
    .from("testimonials")
    .select("ordre")
    .order("ordre", { ascending: false })
    .limit(1);
  const nextOrdre = ((existing?.[0]?.ordre as number | undefined) ?? 0) + 1;
  const { data: created, error } = await supabase
    .from("testimonials")
    .insert({ ...data, ordre: nextOrdre })
    .select("id")
    .single();
  if (error || !created) return { ok: false, error: error?.message ?? "Erreur." };
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  revalidatePath("/admin/testimonials");
  return { ok: true, data: { id: created.id as string } };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  revalidatePath("/admin/testimonials");
  return { ok: true, data: undefined };
}

export async function toggleTestimonialActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  revalidatePath("/admin/testimonials");
  return { ok: true, data: undefined };
}

export async function upsertTestimonialAndRedirect(input: TestimonialFormData) {
  const result = await upsertTestimonial(input);
  if (result.ok) redirect("/admin/testimonials?flash=saved");
  return result;
}

// ============================================================================
// FAQS
// ============================================================================

export type FaqRow = {
  id: string;
  question: string;
  answer: string;
  ordre: number;
  is_active: boolean;
  updated_at: string;
};

export type FaqFormData = {
  id?: string;
  question: string;
  answer: string;
  ordre?: number;
  is_active?: boolean;
};

export async function listFaqsAdmin(): Promise<FaqRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select("id, question, answer, ordre, is_active, updated_at")
    .order("ordre", { ascending: true });
  return (data as FaqRow[]) ?? [];
}

export async function getFaqAdmin(id: string): Promise<FaqRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select("id, question, answer, ordre, is_active, updated_at")
    .eq("id", id)
    .maybeSingle();
  return (data as FaqRow) ?? null;
}

export async function upsertFaq(
  input: FaqFormData,
): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  if (!input.question?.trim()) return { ok: false, error: "La question est obligatoire." };
  if (!input.answer?.trim()) return { ok: false, error: "La réponse est obligatoire." };

  const supabase = await createClient();
  const data = {
    question: input.question.trim(),
    answer: input.answer.trim(),
    ordre: input.ordre ?? 0,
    is_active: input.is_active ?? true,
  };

  if (input.id) {
    const { error } = await supabase.from("faqs").update(data).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
    revalidatePath("/admin/faqs");
    return { ok: true, data: { id: input.id } };
  }
  const { data: existing } = await supabase
    .from("faqs")
    .select("ordre")
    .order("ordre", { ascending: false })
    .limit(1);
  const nextOrdre = ((existing?.[0]?.ordre as number | undefined) ?? 0) + 1;
  const { data: created, error } = await supabase
    .from("faqs")
    .insert({ ...data, ordre: nextOrdre })
    .select("id")
    .single();
  if (error || !created) return { ok: false, error: error?.message ?? "Erreur." };
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  revalidatePath("/admin/faqs");
  return { ok: true, data: { id: created.id as string } };
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  revalidatePath("/admin/faqs");
  return { ok: true, data: undefined };
}

export async function toggleFaqActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  revalidatePath("/admin/faqs");
  return { ok: true, data: undefined };
}

export async function upsertFaqAndRedirect(input: FaqFormData) {
  const result = await upsertFaq(input);
  if (result.ok) redirect("/admin/faqs?flash=saved");
  return result;
}
