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

// ============================================================================
// ARTICLES (blog)
// ============================================================================

export type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_md: string | null;
  image: string;
  category: string | null;
  read_time_minutes: number | null;
  published_at: string;
  ordre: number;
  is_active: boolean;
  updated_at: string;
};

export type ArticleFormData = {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content_md?: string | null;
  image: string;
  category?: string | null;
  read_time_minutes?: number | null;
  published_at?: string | null;
  ordre?: number;
  is_active?: boolean;
};

export async function listArticlesAdmin(): Promise<ArticleRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("id, slug, title, excerpt, content_md, image, category, read_time_minutes, published_at, ordre, is_active, updated_at")
    .order("published_at", { ascending: false });
  return (data as ArticleRow[]) ?? [];
}

export async function getArticleAdmin(id: string): Promise<ArticleRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("id, slug, title, excerpt, content_md, image, category, read_time_minutes, published_at, ordre, is_active, updated_at")
    .eq("id", id)
    .maybeSingle();
  return (data as ArticleRow) ?? null;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 100);
}

export async function upsertArticle(
  input: ArticleFormData,
): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  if (!input.title?.trim()) return { ok: false, error: "Le titre est obligatoire." };
  if (!input.image?.trim()) return { ok: false, error: "L'image est obligatoire." };
  const slug = input.slug?.trim() || slugify(input.title);
  if (!slug) return { ok: false, error: "Le slug est obligatoire." };

  const supabase = await createClient();
  const data = {
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt?.trim() || null,
    content_md: input.content_md?.trim() || null,
    image: input.image.trim(),
    category: input.category?.trim() || null,
    read_time_minutes: input.read_time_minutes ?? null,
    published_at: input.published_at || new Date().toISOString(),
    ordre: input.ordre ?? 0,
    is_active: input.is_active ?? true,
  };

  if (input.id) {
    const { error } = await supabase.from("articles").update(data).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
    revalidatePath("/admin/articles");
    return { ok: true, data: { id: input.id } };
  }
  const { data: existing } = await supabase
    .from("articles")
    .select("ordre")
    .order("ordre", { ascending: false })
    .limit(1);
  const nextOrdre = ((existing?.[0]?.ordre as number | undefined) ?? 0) + 1;
  const { data: created, error } = await supabase
    .from("articles")
    .insert({ ...data, ordre: nextOrdre })
    .select("id")
    .single();
  if (error || !created) return { ok: false, error: error?.message ?? "Erreur." };
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  revalidatePath("/admin/articles");
  return { ok: true, data: { id: created.id as string } };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  revalidatePath("/admin/articles");
  return { ok: true, data: undefined };
}

export async function toggleArticleActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("articles").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  revalidatePath("/admin/articles");
  return { ok: true, data: undefined };
}

// ============================================================================
// SOCIAL MENTIONS
// ============================================================================

export type SocialMentionRow = {
  id: string;
  network: string;
  author_name: string;
  author_handle: string | null;
  text: string;
  date_label: string | null;
  likes: number | null;
  rating: number | null;
  ordre: number;
  is_active: boolean;
  updated_at: string;
};

export type SocialMentionFormData = {
  id?: string;
  network: string;
  author_name: string;
  author_handle?: string | null;
  text: string;
  date_label?: string | null;
  likes?: number | null;
  rating?: number | null;
  ordre?: number;
  is_active?: boolean;
};

export async function listSocialMentionsAdmin(): Promise<SocialMentionRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("social_mentions")
    .select("id, network, author_name, author_handle, text, date_label, likes, rating, ordre, is_active, updated_at")
    .order("ordre", { ascending: true });
  return (data as SocialMentionRow[]) ?? [];
}

export async function getSocialMentionAdmin(id: string): Promise<SocialMentionRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("social_mentions")
    .select("id, network, author_name, author_handle, text, date_label, likes, rating, ordre, is_active, updated_at")
    .eq("id", id)
    .maybeSingle();
  return (data as SocialMentionRow) ?? null;
}

export async function upsertSocialMention(
  input: SocialMentionFormData,
): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  if (!input.author_name?.trim()) return { ok: false, error: "Le nom de l'auteur est obligatoire." };
  if (!input.text?.trim()) return { ok: false, error: "Le texte de la mention est obligatoire." };
  if (!input.network) return { ok: false, error: "Le réseau est obligatoire." };

  const supabase = await createClient();
  const data = {
    network: input.network,
    author_name: input.author_name.trim(),
    author_handle: input.author_handle?.trim() || null,
    text: input.text.trim(),
    date_label: input.date_label?.trim() || null,
    likes: input.likes ?? null,
    rating: input.rating ?? null,
    ordre: input.ordre ?? 0,
    is_active: input.is_active ?? true,
  };

  if (input.id) {
    const { error } = await supabase.from("social_mentions").update(data).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
    revalidatePath("/admin/social-mentions");
    return { ok: true, data: { id: input.id } };
  }
  const { data: existing } = await supabase
    .from("social_mentions")
    .select("ordre")
    .order("ordre", { ascending: false })
    .limit(1);
  const nextOrdre = ((existing?.[0]?.ordre as number | undefined) ?? 0) + 1;
  const { data: created, error } = await supabase
    .from("social_mentions")
    .insert({ ...data, ordre: nextOrdre })
    .select("id")
    .single();
  if (error || !created) return { ok: false, error: error?.message ?? "Erreur." };
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  revalidatePath("/admin/social-mentions");
  return { ok: true, data: { id: created.id as string } };
}

export async function deleteSocialMention(id: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("social_mentions").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  revalidatePath("/admin/social-mentions");
  return { ok: true, data: undefined };
}

export async function toggleSocialMentionActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("social_mentions").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  revalidatePath("/admin/social-mentions");
  return { ok: true, data: undefined };
}
