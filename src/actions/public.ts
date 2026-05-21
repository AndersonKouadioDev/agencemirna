"use server";

import { createClient } from "../supabase/server";

// ============================================================================
// Quartiers (configurables via admin, charge la section "Nos quartiers")
// ============================================================================

export type PublicQuartier = {
  id: string;
  name: string;
  commune: string;
  badge: string | null;
  tagline: string | null;
  description: string | null;
  image: string;
  search_query: string | null;
  ordre: number;
  is_featured: boolean;
};

/**
 * Retourne tous les quartiers actifs, triés par ordre.
 * `featured=true` pour ne récupérer que ceux mis en avant sur la home.
 */
export async function getActiveQuartiers(opts?: {
  featured?: boolean;
  limit?: number;
}): Promise<PublicQuartier[]> {
  const supabase = await createClient();
  let q = supabase
    .from("quartiers")
    .select(
      "id, name, commune, badge, tagline, description, image, search_query, ordre, is_featured",
    )
    // RLS filtre déjà is_active=true
    .order("ordre", { ascending: true });

  if (opts?.featured) q = q.eq("is_featured", true);
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error || !data) {
    if (error) console.error("getActiveQuartiers error:", error);
    return [];
  }
  return data as PublicQuartier[];
}

// ============================================================================
// Données de référence pour filtres publics (types, services, catégories)
// ============================================================================

export type BienReferenceData = {
  types: { id: number; name: string }[];
  services: { id: number; name: string }[];
  categories: { id: number; name: string }[];
};

/**
 * Charge les listes types/services/categories utilisées pour peupler
 * les dropdowns des filtres sur /properties (et autres pages publiques).
 * Lecture publique : aucune restriction RLS sur ces tables référentielles.
 */
export async function getBienReferenceData(): Promise<BienReferenceData> {
  const supabase = await createClient();

  const [typesRes, servicesRes, categoriesRes] = await Promise.all([
    supabase
      .from("types_bien")
      .select("id, name")
      .order("name", { ascending: true }),
    supabase
      .from("services_bien")
      .select("id, name")
      .order("name", { ascending: true }),
    supabase
      .from("categories_bien")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);

  return {
    types: (typesRes.data ?? []).filter((t) => t.name) as {
      id: number;
      name: string;
    }[],
    services: (servicesRes.data ?? []).filter((s) => s.name) as {
      id: number;
      name: string;
    }[],
    categories: (categoriesRes.data ?? []).filter((c) => c.name) as {
      id: number;
      name: string;
    }[],
  };
}

/**
 * Server Actions de lecture publique pour le site marketing.
 * Toutes ces actions vont à travers les RLS policies qui filtrent
 * automatiquement les rows inactives / hors plage de dates.
 */

// ============================================================================
// Services
// ============================================================================

export type PublicService = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  icon: string | null;
  image: string | null;
  highlights: string[];
  cta_label: string | null;
  cta_url: string | null;
  ordre: number;
};

export async function getActiveServices(): Promise<PublicService[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(
      "id, slug, name, short_description, long_description, icon, image, highlights, cta_label, cta_url, ordre",
    )
    // RLS filtre déjà is_active=true
    .order("ordre", { ascending: true });

  if (error || !data) {
    if (error) console.error("getActiveServices error:", error);
    return [];
  }
  return data.map((s) => ({
    ...s,
    highlights: Array.isArray(s.highlights) ? (s.highlights as string[]) : [],
  }));
}

export async function getServiceBySlug(
  slug: string,
): Promise<PublicService | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(
      "id, slug, name, short_description, long_description, icon, image, highlights, cta_label, cta_url, ordre",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getServiceBySlug error:", error);
    return null;
  }
  return {
    ...data,
    highlights: Array.isArray(data.highlights)
      ? (data.highlights as string[])
      : [],
  };
}

// ============================================================================
// Promotions
// ============================================================================

export type PublicPromotion = {
  id: string;
  title: string;
  description: string | null;
  image: string;
  cta_label: string | null;
  cta_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  show_on_home: boolean;
};

export async function getActivePromotions(): Promise<PublicPromotion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotions")
    .select(
      "id, title, description, image, cta_label, cta_url, starts_at, ends_at, show_on_home",
    )
    // RLS filtre déjà is_active=true ET dans plage de dates
    .order("ordre", { ascending: true });

  if (error || !data) {
    if (error) console.error("getActivePromotions error:", error);
    return [];
  }
  return data as PublicPromotion[];
}

/**
 * Retourne la promo à afficher sur la home (1 seule, la 1ère trouvée
 * avec show_on_home=true), ou null si aucune.
 */
export async function getHomePromotion(): Promise<PublicPromotion | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotions")
    .select(
      "id, title, description, image, cta_label, cta_url, starts_at, ends_at, show_on_home",
    )
    .eq("show_on_home", true)
    .order("ordre", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as PublicPromotion;
}

// ============================================================================
// Agents
// ============================================================================

export type PublicAgent = {
  id: string;
  full_name: string;
  role: string | null;
  photo: string | null;
  bio: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  specialites: string[];
  ordre: number;
};

export async function getActiveAgents(): Promise<PublicAgent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .select(
      "id, full_name, role, photo, bio, phone, email, whatsapp, specialites, ordre",
    )
    // RLS filtre déjà is_active=true
    .order("ordre", { ascending: true });

  if (error || !data) {
    if (error) console.error("getActiveAgents error:", error);
    return [];
  }
  return data.map((a) => ({
    ...a,
    specialites: Array.isArray(a.specialites)
      ? (a.specialites as string[])
      : [],
  }));
}

// ============================================================================
// Testimonials (carousel "Ils nous font confiance")
// ============================================================================

export type PublicTestimonial = {
  id: string;
  quote: string;
  author_name: string;
  author_role: string | null;
  avatar_initials: string | null;
  rating: number;
  ordre: number;
};

export async function getActiveTestimonials(opts?: {
  limit?: number;
}): Promise<PublicTestimonial[]> {
  const supabase = await createClient();
  let q = supabase
    .from("testimonials")
    .select("id, quote, author_name, author_role, avatar_initials, rating, ordre")
    .order("ordre", { ascending: true });
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error || !data) {
    if (error) console.error("getActiveTestimonials error:", error);
    return [];
  }
  return data as PublicTestimonial[];
}

// ============================================================================
// Articles (blog "Le marché immobilier décodé")
// ============================================================================

export type PublicArticle = {
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
};

export async function getActiveArticles(opts?: {
  limit?: number;
}): Promise<PublicArticle[]> {
  const supabase = await createClient();
  let q = supabase
    .from("articles")
    .select(
      "id, slug, title, excerpt, content_md, image, category, read_time_minutes, published_at, ordre",
    )
    .order("ordre", { ascending: true })
    .order("published_at", { ascending: false });
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error || !data) {
    if (error) console.error("getActiveArticles error:", error);
    return [];
  }
  return data as PublicArticle[];
}

// ============================================================================
// FAQs (accordion "On vous répond")
// ============================================================================

export type PublicFaq = {
  id: string;
  question: string;
  answer: string;
  ordre: number;
};

export async function getActiveFaqs(): Promise<PublicFaq[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("id, question, answer, ordre")
    .order("ordre", { ascending: true });
  if (error || !data) {
    if (error) console.error("getActiveFaqs error:", error);
    return [];
  }
  return data as PublicFaq[];
}

// ============================================================================
// Social mentions (feed "On parle de nous" dans SocialSection)
// ============================================================================

export type PublicSocialMention = {
  id: string;
  network: "facebook" | "instagram" | "google" | "linkedin" | "twitter" | "youtube";
  author_name: string;
  author_handle: string | null;
  text: string;
  date_label: string | null;
  likes: number | null;
  rating: number | null;
  ordre: number;
};

export async function getActiveSocialMentions(opts?: {
  limit?: number;
}): Promise<PublicSocialMention[]> {
  const supabase = await createClient();
  let q = supabase
    .from("social_mentions")
    .select(
      "id, network, author_name, author_handle, text, date_label, likes, rating, ordre",
    )
    .order("ordre", { ascending: true });
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error || !data) {
    if (error) console.error("getActiveSocialMentions error:", error);
    return [];
  }
  return data as PublicSocialMention[];
}
