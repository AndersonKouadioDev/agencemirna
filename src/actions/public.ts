"use server";

import { createClient } from "../supabase/server";

// ============================================================================
// Communes
// ============================================================================

export type PublicCommune = {
  id: string;
  nom: string;
  slug: string;
  ordre: number;
};

export async function listCommunesPublic(): Promise<PublicCommune[]> {
  const supabase = await createClient();
  // NB : la table `communes` (migration 0014) ne contient que
  // id / created_at / updated_at / nom / slug / is_active / ordre.
  // Sélectionner des colonnes inexistantes faisait échouer la requête
  // et renvoyait systématiquement [] (communes invisibles côté public).
  const { data, error } = await supabase
    .from("communes")
    .select("id, nom, slug, ordre")
    .eq("is_active", true)
    .order("ordre", { ascending: true })
    .order("nom", { ascending: true });
    
  if (error || !data) {
    if (error) console.error("listCommunesPublic error:", error);
    return [];
  }
  return data as PublicCommune[];
}

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

const STATIC_SERVICES: PublicService[] = [
  {
    id: "vente",
    slug: "vente",
    name: "Vente de biens immobiliers",
    short_description: "Achat et vente de villas, terrains et appartements haut de gamme.",
    long_description: "Nous vous accompagnons à chaque étape de votre transaction immobilière, de l'estimation de votre bien jusqu'à la signature chez le notaire, en vous garantissant une transaction sécurisée et au meilleur prix.",
    icon: "Key",
    image: null,
    highlights: ["Estimation précise", "Visibilité maximale", "Accompagnement juridique"],
    cta_label: "Estimer mon bien",
    cta_url: "/estimation",
    ordre: 1,
  },
  {
    id: "location",
    slug: "location-meublee",
    name: "Location meublée",
    short_description: "Des appartements et villas meublés prêts à vivre pour de courtes ou longues durées.",
    long_description: "Profitez de notre sélection de biens meublés de haut standing, idéals pour vos séjours professionnels ou vos vacances. Nos logements sont soigneusement équipés pour vous offrir un confort optimal.",
    icon: "Sofa",
    image: null,
    highlights: ["Biens équipés", "Service de conciergerie", "Flexibilité de durée"],
    cta_label: "Voir nos meublés",
    cta_url: "/properties?service=Meublé",
    ordre: 2,
  },
  {
    id: "gestion",
    slug: "gestion-immobiliere",
    name: "Gestion locative",
    short_description: "Confiez-nous la gestion de votre patrimoine immobilier en toute sérénité.",
    long_description: "Nous prenons en charge la gestion complète de vos biens immobiliers : recherche de locataires, rédaction des baux, encaissement des loyers, gestion des travaux et de l'entretien.",
    icon: "Building",
    image: null,
    highlights: ["Sélection rigoureuse des locataires", "Suivi comptable et administratif", "Garantie des loyers impayés"],
    cta_label: "Nous confier votre bien",
    cta_url: "/contact_us",
    ordre: 3,
  },
  {
    id: "construction",
    slug: "construction",
    name: "Construction",
    short_description: "Réalisation de vos projets de construction de la conception à la remise des clés.",
    long_description: "Notre équipe d'experts vous accompagne dans la réalisation de votre projet de construction, en veillant au respect des normes de qualité, des délais et de votre budget.",
    icon: "HardHat",
    image: null,
    highlights: ["Expertise technique", "Suivi de chantier", "Respect des délais"],
    cta_label: "Discuter de votre projet",
    cta_url: "/contact_us",
    ordre: 4,
  },
  {
    id: "decoration",
    slug: "decoration-amenagement",
    name: "Décoration d'intérieur",
    short_description: "Aménagement et décoration sur-mesure pour sublimer vos espaces.",
    long_description: "Nos architectes d'intérieur conçoivent des espaces uniques et fonctionnels qui reflètent votre style de vie. Du choix des matériaux à la sélection du mobilier, nous sublimons votre intérieur.",
    icon: "Paintbrush",
    image: null,
    highlights: ["Design sur-mesure", "Sélection de mobilier de créateurs", "Optimisation de l'espace"],
    cta_label: "Découvrir nos réalisations",
    cta_url: "/contact_us",
    ordre: 5,
  },
  {
    id: "promotion",
    slug: "promotion-immobiliere",
    name: "Promotion immobilière",
    short_description: "Développement de projets immobiliers résidentiels et commerciaux.",
    long_description: "Nous développons des programmes immobiliers neufs de qualité, répondant aux attentes du marché et offrant d'excellentes opportunités d'investissement ou d'habitation.",
    icon: "Briefcase",
    image: null,
    highlights: ["Emplacements de choix", "Architecture moderne", "Normes environnementales"],
    cta_label: "Nos programmes neufs",
    cta_url: "/contact_us",
    ordre: 6,
  }
];

export async function getActiveServices(): Promise<PublicService[]> {
  return STATIC_SERVICES;
}

export async function getServiceBySlug(
  slug: string,
): Promise<PublicService | null> {
  return STATIC_SERVICES.find((s) => s.slug === slug) || null;
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

export async function getArticleBySlug(slug: string): Promise<PublicArticle | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select(
      "id, slug, title, excerpt, content_md, image, category, read_time_minutes, published_at, ordre",
    )
    .eq("slug", slug)
    .maybeSingle();
  return (data as PublicArticle) ?? null;
}

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
// Annonces
// ============================================================================

export type PublicAnnonce = {
  id: string;
  title: string;
  description: string;
  /** Pas de colonne `category` dans la table `annonces` : champ optionnel. */
  category?: string | null;
  cta_url?: string | null;
  image?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  cta_label?: string | null;
  created_at: string;
};

export async function getActiveAnnonces(): Promise<PublicAnnonce[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("annonces")
    .select("id, title, description, created_at, cta_url, image, starts_at, ends_at, cta_label")
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("getActiveAnnonces error:", error);
    return [];
  }
  return data as PublicAnnonce[];
}

export async function getHomeAnnonce(): Promise<PublicAnnonce | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("annonces")
    .select("id, title, description, created_at, cta_url, image, starts_at, ends_at, cta_label")
    .eq("show_on_home", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data as PublicAnnonce | null;
}
