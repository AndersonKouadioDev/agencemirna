"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";
import { normaliserUrlImage } from "@/src/lib/image-url";

/**
 * Server Actions admin pour les 4 tables de contenu éditable :
 *  - testimonials      : témoignages clients (carousel home)
 *  - articles          : blog "Le marché immobilier décodé"
 *  - faqs              : questions / réponses
 *
 * Pattern factorisé : un seul fichier pour 4 tables qui suivent la même
 * forme (CRUD simple, RLS lecture publique active + admin all, ordre).
 *
 * Lectures comprises, chaque export vérifie `getAdminUser()` : un identifiant
 * de Server Action est global, donc POSTable depuis n'importe quelle route, y
 * compris hors de /admin que le middleware est seul à filtrer.
 */

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Témoignages, articles et FAQ ne sont pas lus que par « / » et « /about » :
 * ils alimentent aussi /blog, /faq et /actualites/[slug]. L'ancienne liste
 * `["/", "/about"]` laissait donc en arrière les pages mêmes que ce module
 * remplit. Purger la racine en portée « layout » couvre toute la branche
 * vitrine d'un coup, comme le font déjà settings.ts, taxonomy.ts et
 * communes.ts — et sans avoir à relire le slug d'un article pour le supprimer.
 */
function revaliderVitrine() {
  revalidatePath("/", "layout");
}

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
  const admin = await getAdminUser();
  if (!admin) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, quote, author_name, author_role, avatar_initials, rating, ordre, is_active, updated_at")
    .order("ordre", { ascending: true });
  if (error || !data) return [];
  return data as TestimonialRow[];
}

export async function getTestimonialAdmin(id: string): Promise<TestimonialRow | null> {
  const admin = await getAdminUser();
  if (!admin) return null;
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
    is_active: input.is_active ?? true,
  };
  // `ordre` n'est écrit que s'il est fourni : un appelant qui l'omet ne doit
  // pas remettre la ligne en tête de carousel sans l'avoir demandé.
  const avecOrdre =
    input.ordre === undefined ? data : { ...data, ordre: input.ordre };

  if (input.id) {
    const { error } = await supabase.from("testimonials").update(avecOrdre).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    revaliderVitrine();
    revalidatePath("/admin/testimonials");
    return { ok: true, data: { id: input.id } };
  }
  // Sans position saisie, le nouveau témoignage se range en fin de carousel.
  const { data: existing } = await supabase
    .from("testimonials")
    .select("ordre")
    .order("ordre", { ascending: false })
    .limit(1);
  const nextOrdre = ((existing?.[0]?.ordre as number | undefined) ?? 0) + 1;
  const { data: created, error } = await supabase
    .from("testimonials")
    .insert({ ...data, ordre: input.ordre ?? nextOrdre })
    .select("id")
    .single();
  if (error || !created) return { ok: false, error: error?.message ?? "Erreur." };
  revaliderVitrine();
  revalidatePath("/admin/testimonials");
  return { ok: true, data: { id: created.id as string } };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revaliderVitrine();
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
  revaliderVitrine();
  revalidatePath("/admin/testimonials");
  return { ok: true, data: undefined };
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
  const admin = await getAdminUser();
  if (!admin) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select("id, question, answer, ordre, is_active, updated_at")
    .order("ordre", { ascending: true });
  return (data as FaqRow[]) ?? [];
}

export async function getFaqAdmin(id: string): Promise<FaqRow | null> {
  const admin = await getAdminUser();
  if (!admin) return null;
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
    is_active: input.is_active ?? true,
  };
  // Idem témoignages : on ne réécrit la position que si elle est fournie.
  const avecOrdre =
    input.ordre === undefined ? data : { ...data, ordre: input.ordre };

  if (input.id) {
    const { error } = await supabase.from("faqs").update(avecOrdre).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    revaliderVitrine();
    revalidatePath("/admin/faqs");
    return { ok: true, data: { id: input.id } };
  }
  // Sans position saisie, la nouvelle question se range en fin d'accordéon.
  const { data: existing } = await supabase
    .from("faqs")
    .select("ordre")
    .order("ordre", { ascending: false })
    .limit(1);
  const nextOrdre = ((existing?.[0]?.ordre as number | undefined) ?? 0) + 1;
  const { data: created, error } = await supabase
    .from("faqs")
    .insert({ ...data, ordre: input.ordre ?? nextOrdre })
    .select("id")
    .single();
  if (error || !created) return { ok: false, error: error?.message ?? "Erreur." };
  revaliderVitrine();
  revalidatePath("/admin/faqs");
  return { ok: true, data: { id: created.id as string } };
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revaliderVitrine();
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
  revaliderVitrine();
  revalidatePath("/admin/faqs");
  return { ok: true, data: undefined };
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
  const admin = await getAdminUser();
  if (!admin) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("id, slug, title, excerpt, content_md, image, category, read_time_minutes, published_at, ordre, is_active, updated_at")
    // Exactement le tri de getActiveArticles : la liste admin annonçait
    // l'inverse de la vitrine, un article remonté ici partait en queue là-bas.
    .order("ordre", { ascending: true })
    .order("published_at", { ascending: false });
  return (data as ArticleRow[]) ?? [];
}

export async function getArticleAdmin(id: string): Promise<ArticleRow | null> {
  const admin = await getAdminUser();
  if (!admin) return null;
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

  // Le formulaire valide déjà l'adresse saisie, mais l'action est une route
  // publique : sans ce contrôle, une URL que next/image refuse pourrait être
  // écrite directement et casserait la page qui l'affiche.
  const imageValidee = normaliserUrlImage(input.image);
  if (imageValidee === undefined) {
    return {
      ok: false,
      error:
        "Adresse d'image refusée : indiquez un chemin interne ou une URL " +
        "https servie par un hébergeur déclaré dans next.config.",
    };
  }

  const supabase = await createClient();
  const data = {
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt?.trim() || null,
    content_md: input.content_md?.trim() || null,
    image: imageValidee,
    category: input.category?.trim() || null,
    read_time_minutes: input.read_time_minutes ?? null,
    published_at: input.published_at || new Date().toISOString(),
    is_active: input.is_active ?? true,
  };
  // `ordre` n'est écrit que s'il est fourni, pour ne pas reclasser un article
  // au passage d'un appelant qui ne s'occupe pas de son rang.
  const avecOrdre =
    input.ordre === undefined ? data : { ...data, ordre: input.ordre };

  if (input.id) {
    const { error } = await supabase.from("articles").update(avecOrdre).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    revaliderVitrine();
    revalidatePath("/admin/articles");
    return { ok: true, data: { id: input.id } };
  }
  // Un blog se lit du plus récent au plus ancien. L'auto-incrément
  // `max(ordre) + 1` plaçait au contraire chaque nouvel article en queue de
  // tri, donc hors des 2 cartes de l'accueil et de la une du blog, sans aucun
  // moyen de le remonter. Sans rang saisi on laisse donc 0 : c'est alors
  // `published_at` décroissant, deuxième critère de getActiveArticles, qui
  // départage, et le champ « Ordre » du formulaire sert à épingler ou
  // rétrograder manuellement.
  const { data: created, error } = await supabase
    .from("articles")
    .insert({ ...data, ordre: input.ordre ?? 0 })
    .select("id")
    .single();
  if (error || !created) return { ok: false, error: error?.message ?? "Erreur." };
  revaliderVitrine();
  revalidatePath("/admin/articles");
  return { ok: true, data: { id: created.id as string } };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  const supabase = await createClient();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revaliderVitrine();
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
  revaliderVitrine();
  revalidatePath("/admin/articles");
  return { ok: true, data: undefined };
}
