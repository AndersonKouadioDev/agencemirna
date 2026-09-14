"use server";

import { createClient } from "../supabase/server";
import { STATIC_SERVICES, type PublicService } from "@/src/data/services";

/**
 * POURQUOI un `.eq("is_active", true)` explicite sur chaque lecture publique.
 *
 * Le filtrage ne peut pas être laissé à la RLS : la policy admin est `FOR ALL`
 * et se combine en OU avec la policy publique, si bien qu'un administrateur
 * connecté voyait sur la vitrine le contenu qu'il venait de dépublier — et
 * pouvait en conclure que le bouton de dépublication était cassé. Redondant
 * pour le visiteur anonyme, décisif pour la session admin.
 */

// ============================================================================
// Communes
// ============================================================================

export type PublicCommune = {
  id: string;
  nom: string;
  slug: string;
  ordre: number;
  badge: string | null;
  tagline: string | null;
  description: string | null;
  image: string | null;
  search_query: string | null;
  is_featured: boolean;
};

/**
 * Communes actives, triées par ordre.
 * `featured=true` pour la section « Communes phares » de l'accueil.
 *
 * NB : les colonnes de présentation (image, tagline, badge…) sont ajoutées par
 * la migration 0015. Tant qu'elle n'est pas appliquée, PostgREST rejette la
 * requête entière et renvoie [] sans lever d'exception — on retente donc avec
 * le jeu de colonnes minimal plutôt que de faire disparaître les communes.
 */
export async function listCommunesPublic(opts?: {
  featured?: boolean;
  limit?: number;
}): Promise<PublicCommune[]> {
  const supabase = await createClient();

  const build = (columns: string) => {
    let q = supabase
      .from("communes")
      .select(columns)
      .eq("is_active", true)
      .order("ordre", { ascending: true })
      .order("nom", { ascending: true });
    if (opts?.featured) q = q.eq("is_featured", true);
    if (opts?.limit) q = q.limit(opts.limit);
    return q;
  };

  const { data, error } = await build(
    "id, nom, slug, ordre, badge, tagline, description, image, search_query, is_featured",
  );

  if (!error && data) return data as unknown as PublicCommune[];

  console.error("listCommunesPublic error:", error);
  // Repli : schéma d'avant la migration 0015.
  if (opts?.featured) return [];
  const { data: base, error: baseError } = await build("id, nom, slug, ordre");
  if (baseError || !base) return [];
  return (base as unknown as Array<Record<string, unknown>>).map((c) => ({
    ...(c as { id: string; nom: string; slug: string; ordre: number }),
    badge: null,
    tagline: null,
    description: null,
    image: null,
    search_query: null,
    is_featured: false,
  }));
}

/**
 * Nombre de biens actifs par entrée de taxonomie.
 *
 * Sert à n'offrir dans la navigation que des filtres qui donnent un résultat :
 * la taxonomie compte 4 services et 10 types, mais la plupart ne sont portés
 * par aucun bien — la moitié des liens du méga-menu menaient à « 0 bien ».
 */
export type CatalogueFacettes = {
  types: Record<string, number>;
  services: Record<string, number>;
  communes: Record<string, number>;
  quartiers: Record<string, number>;
  /** false si la requête a échoué : les appelants n'appliquent alors aucun filtre. */
  disponible: boolean;
};

export async function getCatalogueFacettes(): Promise<CatalogueFacettes> {
  const vide: CatalogueFacettes = {
    types: {},
    services: {},
    communes: {},
    quartiers: {},
    disponible: false,
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("biens")
    .select("type_bien_id, service_bien_id, commune_id, quartier_id")
    .eq("is_active", true);

  if (error || !data) {
    if (error) console.error("getCatalogueFacettes error:", error);
    return vide;
  }

  const facettes: CatalogueFacettes = { ...vide, disponible: true };
  const compter = (bucket: Record<string, number>, cle: unknown) => {
    if (cle === null || cle === undefined) return;
    const k = String(cle);
    bucket[k] = (bucket[k] ?? 0) + 1;
  };

  for (const b of data as Array<Record<string, unknown>>) {
    compter(facettes.types, b.type_bien_id);
    compter(facettes.services, b.service_bien_id);
    compter(facettes.communes, b.commune_id);
    compter(facettes.quartiers, b.quartier_id);
  }
  return facettes;
}

// ============================================================================
// Quartiers (configurables via admin, charge la section "Nos quartiers")
// ============================================================================

export type PublicQuartier = {
  id: string;
  name: string;
  commune: string;
  /** Rattachement à une commune. Était absent du select : le regroupement
   *  commune → quartiers retombait sur une comparaison de libellés. */
  commune_id: string | null;
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
      "id, name, commune, commune_id, badge, tagline, description, image, search_query, ordre, is_featured",
    )
    // Filtre explicite, jamais délégué à la RLS : voir la note en tête de fichier.
    .eq("is_active", true)
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

export type TaxonomieEntree = {
  id: number;
  name: string;
  /** Visuel saisi depuis /admin/taxonomie, utilisé par le méga-menu. */
  image: string | null;
  ordre: number;
};

export type BienReferenceData = {
  types: TaxonomieEntree[];
  services: TaxonomieEntree[];
  categories: TaxonomieEntree[];
};

/**
 * Ligne brute d'une table de taxonomie telle que PostgREST la renvoie :
 * `name` peut être nul en base, et `image` / `ordre` sont absents tant que la
 * migration 0018 n'est pas appliquée (d'où le repli de `charger`).
 */
type TaxonomieBrute = {
  id: number;
  name: string | null;
  image?: string | null;
  ordre?: number | null;
};

/**
 * Charge les listes types/services/categories utilisées pour peupler
 * les dropdowns des filtres sur /properties (et autres pages publiques).
 * Lecture publique : aucune restriction RLS sur ces tables référentielles.
 */
export async function getBienReferenceData(): Promise<BienReferenceData> {
  const supabase = await createClient();

  /**
   * `image` et `ordre` viennent de la migration 0018. Tant qu'elle n'est pas
   * appliquée, PostgREST rejette la requête entière et renverrait [] sans
   * erreur visible — ce qui viderait les filtres du catalogue et le menu.
   */
  const charger = async (table: string): Promise<TaxonomieBrute[]> => {
    const complet = await supabase
      .from(table)
      .select("id, name, image, ordre")
      .order("ordre", { ascending: true })
      .order("name", { ascending: true });
    if (!complet.error && complet.data)
      return complet.data as unknown as TaxonomieBrute[];

    console.error(`getBienReferenceData(${table}) : repli sans image/ordre.`, complet.error);
    const base = await supabase
      .from(table)
      .select("id, name")
      .order("name", { ascending: true });
    return (
      (base.data ?? []) as unknown as Pick<TaxonomieBrute, "id" | "name">[]
    ).map((r) => ({
      ...r,
      image: null,
      ordre: 0,
    }));
  };

  const [types, services, categories] = await Promise.all([
    charger("types_bien"),
    charger("services_bien"),
    charger("categories_bien"),
  ]);

  const utilisables = (rows: TaxonomieBrute[]) =>
    rows.filter((r) => r.name) as TaxonomieEntree[];

  return {
    types: utilisables(types),
    services: utilisables(services),
    categories: utilisables(categories),
  };
}

/**
 * Server Actions de lecture publique pour le site marketing.
 * Le statut et la fenêtre de dates sont filtrés ici, en clair : la RLS seule
 * ne suffit pas pour une session admin (note en tête de fichier).
 */

// ============================================================================
// Services
// ============================================================================

/**
 * Index des 6 services métier : il n'alimente plus que la navigation (cartes du
 * hub /services, bloc « Nos autres services », sitemap). Le contenu éditorial
 * et les CTA vivent désormais dans les pages statiques app/(marketing)/services/<slug>/ :
 * les dupliquer ici laissait deux sources de vérité qui divergeaient déjà
 * (le CTA « Voir nos meublés » ne correspondait plus à celui de la page).
 */
/** @deprecated Importer STATIC_SERVICES depuis `@/src/data/services` :
 *  ces données sont statiques, les enrober dans une action serveur oblige
 *  inutilement les pages à devenir asynchrones. */
export async function getActiveServices(): Promise<PublicService[]> {
  return STATIC_SERVICES;
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
    // Filtre explicite, jamais délégué à la RLS : voir la note en tête de fichier.
    .eq("is_active", true)
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
    // Filtre explicite, jamais délégué à la RLS : voir la note en tête de fichier.
    .eq("is_active", true)
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
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, slug, title, excerpt, content_md, image, category, read_time_minutes, published_at, ordre",
    )
    .eq("slug", slug)
    // `published_at` est saisissable en admin : sans ce garde, un article daté
    // du futur sortait dès son enregistrement.
    .lte("published_at", new Date().toISOString())
    // Filtre explicite, jamais délégué à la RLS : voir la note en tête de fichier.
    .eq("is_active", true)
    .maybeSingle();
  // Sans cette trace, une requête cassée (colonne renommée, migration non
  // appliquée) est indiscernable d'un slug inconnu : la page d'article
  // répondait 404 en silence. C'est la seule lecture du fichier qui
  // ignorait `error`.
  if (error) console.error("getArticleBySlug error:", error);
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
    // Filtre explicite, jamais délégué à la RLS : voir la note en tête de fichier.
    .eq("is_active", true)
    // Même garde que getArticleBySlug : un article programmé reste masqué
    // jusqu'à sa date.
    .lte("published_at", new Date().toISOString())
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
    // Filtre explicite, jamais délégué à la RLS : voir la note en tête de fichier.
    .eq("is_active", true)
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

export type PublicAnnonceBien = {
  id: string;
  name: string | null;
  image: string | null;
  prix: number | null;
  prix_month: number | null;
  ville_commune: string | null;
  chambre: number | null;
  salle_bains: number | null;
  area: number | null;
};

export type PublicAnnonce = {
  id: string;
  title: string;
  /** Texte propre à l'annonce. Les détails du bien viennent de `bien`. */
  description: string | null;
  sous_titre: string | null;
  cta_url: string | null;
  cta_label: string | null;
  image: string | null;
  starts_at: string | null;
  ends_at: string | null;
  ordre: number;
  created_at: string;
  types_annonce: { id: number; name: string } | null;
  bien: PublicAnnonceBien | null;
};

const ANNONCE_SELECT =
  "id, title, description, sous_titre, created_at, cta_url, cta_label, image, starts_at, ends_at, ordre, " +
  "types_annonce:type_annonce_id (id, name), " +
  "bien:bien_id (id, name, image, prix, prix_month, ville_commune, chambre, salle_bains, area, is_active)";

/**
 * Annonces visibles publiquement.
 *
 * Le filtrage ne peut pas être délégué à la RLS : la policy admin est
 * `FOR ALL` et se combine en OU avec la policy publique, si bien qu'un
 * administrateur connecté voyait sur la vitrine les annonces qu'il venait
 * de dépublier. On filtre donc explicitement statut et fenêtre de dates.
 */
export async function getActiveAnnonces(opts?: {
  onHome?: boolean;
  limit?: number;
}): Promise<PublicAnnonce[]> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  let q = supabase
    .from("annonces")
    .select(ANNONCE_SELECT)
    .eq("is_active", true)
    .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
    .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
    // Trié par `ordre` : c'est ce que pilote le glisser-déposer de l'admin,
    // qui n'avait jusqu'ici aucun effet sur le site.
    .order("ordre", { ascending: true })
    .order("created_at", { ascending: false });

  if (opts?.onHome) q = q.eq("show_on_home", true);
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error || !data) {
    if (error) console.error("getActiveAnnonces error:", error);
    return [];
  }
  // Filtrage en JS plutôt qu'en PostgREST : `.eq("bien.is_active", true)`
  // changerait la sémantique de la jointure gauche et ferait disparaître les
  // annonces sans bien rattaché. Une annonce dont le bien est dépublié reste
  // affichée, mais cesse d'en emprunter le prix et les caractéristiques.
  return (data as unknown as PublicAnnonce[]).map((a) =>
    a.bien && (a.bien as { is_active?: boolean }).is_active === false
      ? { ...a, bien: null }
      : a,
  );
}

