import type { ComponentType } from "react";
import {
  Home,
  Building2,
  KeyRound,
  Palette,
  Landmark,
  HardHat,
  Sparkles,
  MapPin,
  Users,
  Newspaper,
  FileText,
  Briefcase,
  Warehouse,
} from "lucide-react";

/**
 * Structure du menu Header — 5 items principaux max.
 *
 * 5 items :
 *   1. Biens       (mega menu : Types + Services + Communes + Quartiers)
 *   2. Services    (dropdown simple, 6 services métier statiques)
 *   3. Annonces    (lien direct)
 *   4. L'agence    (dropdown : À propos, Notre équipe, Blog)
 *   5. Contact     (lien direct)
 *
 * Le menu « Biens » est alimenté par la base (types_bien, services_bien,
 * communes, quartiers) via `getMenuList(pathname, data)`. Le layout marketing
 * charge ces données côté serveur et passe le menu construit au Header.
 *
 * Contrat d'URL de /properties, à respecter à la lettre :
 *   ?type=<libellé exact d'un type_bien>
 *   ?service=<libellé exact d'un service_bien>
 *   ?commune=<slug de commune>
 *   ?quartier=<id de quartier>
 *
 * IMPORTANT : `type` et `service` portent le **nom exact** de la ligne en base,
 * sinon le Select de /properties ne se pré-sélectionne pas après navigation.
 *
 * NB : les SERVICES MÉTIER du dropdown « Services » (vente, location meublée,
 * gestion, construction, décoration, promotion) sont du contenu vitrine
 * statique : ils n'ont rien à voir avec les SERVICES DE BIEN de `services_bien`
 * qui servent, eux, au filtrage du catalogue.
 */

// ─── Icônes ─────────────────────────────────────────────────────────────────
// Le menu est construit dans un Server Component puis passé au Header, qui est
// client : une référence de composant ne traverse pas cette frontière. On ne
// transporte donc qu'un nom d'icône, résolu à l'affichage via MENU_ICONS.

export type MenuIconName =
  | "home"
  | "immeuble"
  | "cle"
  | "document"
  | "mallette"
  | "entrepot"
  | "lieu"
  | "etincelle"
  | "palette"
  | "chantier"
  | "promotion"
  | "equipe"
  | "journal";

export const MENU_ICONS: Record<
  MenuIconName,
  ComponentType<{ className?: string }>
> = {
  home: Home,
  immeuble: Building2,
  cle: KeyRound,
  document: FileText,
  mallette: Briefcase,
  entrepot: Warehouse,
  lieu: MapPin,
  etincelle: Sparkles,
  palette: Palette,
  chantier: HardHat,
  promotion: Landmark,
  equipe: Users,
  journal: Newspaper,
};

export type MenuSubItem = {
  label: string;
  href: string;
  description?: string;
  /** Visuel affiché par le méga-menu au survol. Porté par la donnée, jamais
   *  déduit du libellé. */
  image?: string | null;
  icon?: MenuIconName;
};

export type MenuColumn = {
  title: string;
  items: MenuSubItem[];
};

export type MenuItem = {
  id: number;
  label: string;
  href?: string; // si dropdown, optionnel (clic = ouvre menu)
  active: boolean;
  columns?: MenuColumn[]; // mega menu si défini
  simpleItems?: MenuSubItem[]; // dropdown simple (1 colonne)
  featured?: {
    title: string;
    description: string;
    href: string;
    cta: string;
  };
};

/** Visuel de repli unique quand la donnée n'en porte pas. */
export const MENU_FALLBACK_IMAGE = "/images/photos/immeuble1.jpg";

/**
 * Visuel de repli par famille d'entrée.
 *
 * Les types et services de bien n'ont pas de colonne image en base : sans ce
 * jeu de replis, les ~17 entrées de ces deux colonnes affichaient toutes la
 * même photo, et la carte du méga-menu ne réagissait plus au survol.
 */
export const MENU_IMAGES_PAR_ICONE: Partial<Record<MenuIconName, string>> = {
  home: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
  immeuble: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800",
  cle: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800",
  document: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
  mallette: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
  entrepot: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
  lieu: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=800",
  palette: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800",
  chantier: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800",
  promotion: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
};

// ─── Données dynamiques injectées par le layout marketing ────────────────────

/** Sous-ensemble de `PublicCommune` dont le menu a besoin. */
export type MenuCommune = {
  id: string;
  nom: string;
  slug: string;
  image?: string | null;
};

/** Sous-ensemble de `PublicQuartier` dont le menu a besoin. */
export type MenuQuartier = {
  id: string;
  name: string;
  image?: string | null;
};

/** Ligne de `types_bien` / `services_bien`. */
export type MenuReference = {
  id: number;
  name: string;
};

export type MenuData = {
  communes?: MenuCommune[];
  quartiers?: MenuQuartier[];
  types?: MenuReference[];
  services?: MenuReference[];
  /**
   * Nombre de biens actifs par entrée, pour n'afficher que des filtres qui
   * donnent un résultat. Absent ou indisponible : tout est affiché.
   */
  facettes?: {
    types: Record<string, number>;
    services: Record<string, number>;
    communes: Record<string, number>;
    quartiers: Record<string, number>;
    disponible: boolean;
  };
};

/** Nombre d'entrées affichées par colonne : au-delà, le méga-menu déborde. */
// Les communes d'Abidjan sont 13 : un plafond plus bas en masquerait sans
// rien dire. Types et services ne sont pas plafonnés du tout — ils sont
// triés par nom, couper la fin ferait disparaître « Villa » dès qu'un
// nouveau type serait ajouté depuis l'admin.
const MAX_PAR_COLONNE = 14;

// ─── Valeurs de repli ────────────────────────────────────────────────────────
// Le menu ne doit jamais disparaître : si la base est injoignable ou vide, on
// retombe sur ce jeu minimal (libellés et slugs seedés par la migration 0015).

const REPLI_TYPES: MenuReference[] = [
  { id: -1, name: "Villa" },
  { id: -2, name: "Duplex" },
  { id: -3, name: "Maison" },
  { id: -4, name: "Terrain" },
  { id: -5, name: "Local commercial" },
  { id: -6, name: "Bureau" },
];

const REPLI_SERVICES: MenuReference[] = [
  { id: -1, name: "Vente" },
  { id: -2, name: "Location meublée" },
  { id: -3, name: "Gestion locative" },
  { id: -4, name: "Construction" },
];


const REPLI_COMMUNES: MenuCommune[] = [
  { id: "cocody", nom: "Cocody", slug: "cocody" },
  { id: "plateau", nom: "Plateau", slug: "plateau" },
  { id: "marcory", nom: "Marcory", slug: "marcory" },
  { id: "treichville", nom: "Treichville", slug: "treichville" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const sansAccent = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Icône d'un type de bien, choisie sur la famille du libellé. */
const iconeType = (name: string): MenuIconName => {
  const n = sansAccent(name);
  if (n.includes("terrain")) return "lieu";
  if (n.includes("entrepot") || n.includes("hangar")) return "entrepot";
  if (n.includes("bureau")) return "immeuble";
  if (n.includes("local") || n.includes("commerce") || n.includes("boutique"))
    return "mallette";
  if (n.includes("duplex") || n.includes("appartement") || n.includes("immeuble"))
    return "immeuble";
  return "home";
};

/** Icône d'un service de bien (table services_bien). */
const iconeService = (name: string): MenuIconName => {
  const n = sansAccent(name);
  if (n.includes("vente")) return "document";
  if (n.includes("meuble")) return "etincelle";
  if (n.includes("commercial") || n.includes("professionnel")) return "mallette";
  if (n.includes("gestion")) return "immeuble";
  if (n.includes("location") || n.includes("bail")) return "cle";
  return "document";
};

const nonVide = <T,>(liste: T[] | undefined, repli: T[]): T[] =>
  liste && liste.length > 0 ? liste : repli;

/**
 * État actif d'un item, déduit du pathname.
 * Isolé de `getMenuList` car le menu est construit côté serveur, où le
 * pathname n'est pas connu : le Header le réapplique côté client.
 */
const estActif = (id: number, pathname: string): boolean => {
  switch (id) {
    case 1:
      return pathname.startsWith("/properties");
    case 2:
      return pathname.startsWith("/services");
    case 3:
      return pathname.startsWith("/annonces");
    case 4:
      return (
        pathname === "/about" ||
        pathname.startsWith("/agents") ||
        pathname.startsWith("/blog") ||
        pathname.startsWith("/actualites")
      );
    case 5:
      return pathname === "/contact_us";
    default:
      return false;
  }
};

/**
 * Réapplique l'état actif sur un menu déjà construit (serveur → client).
 */
export const applyActiveState = (
  menu: MenuItem[],
  pathname: string,
): MenuItem[] =>
  menu.map((item) => ({ ...item, active: estActif(item.id, pathname) }));

// ─── Contenu vitrine statique ───────────────────────────────────────────────

/**
 * Les 6 services métier de l'agence : pages vitrine statiques.
 * Les slugs doivent rester alignés sur STATIC_SERVICES (src/actions/public.ts).
 */
const SERVICES_METIER: MenuSubItem[] = [
  {
    label: "Vente de biens",
    href: "/services/vente",
    description: "Vendez votre bien avec un mandat sérieux.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
    icon: "home",
  },
  {
    label: "Location meublée",
    href: "/services/location-meublee",
    description: "Rentabilisez votre bien en courte durée.",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
    icon: "cle",
  },
  {
    label: "Gestion immobilière",
    href: "/services/gestion-immobiliere",
    description: "On gère tout pour vous.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    icon: "immeuble",
  },
  {
    label: "Décoration & aménagement",
    href: "/services/decoration-amenagement",
    description: "Donnez vie à vos espaces.",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800",
    icon: "palette",
  },
  {
    label: "Construction",
    href: "/services/construction",
    description: "De la conception à la livraison.",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800",
    icon: "chantier",
  },
  {
    label: "Promotion immobilière",
    href: "/services/promotion-immobiliere",
    description: "Programmes neufs sélectionnés.",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800",
    icon: "promotion",
  },
];

const ITEMS_AGENCE: MenuSubItem[] = [
  {
    label: "À propos",
    href: "/about",
    description: "Notre histoire, nos valeurs.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
    icon: "immeuble",
  },
  {
    label: "Notre équipe",
    href: "/agents",
    description: "Les visages derrière l'agence.",
    image: "/images/photos/team.jpg",
    icon: "equipe",
  },
  {
    label: "Blog",
    href: "/blog",
    description: "Conseils et actualités du marché.",
    image:
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800",
    icon: "journal",
  },
];

// ─── Construction du menu ───────────────────────────────────────────────────

export const getMenuList = (pathname: string, data?: MenuData): MenuItem[] => {
  // Quand on retombe sur un repli, c'est que la base n'a rien renvoyé — et
  // elle ne renverra rien non plus à /properties. Un lien filtré donnerait
  // alors « 0 bien » sans explication : on le dégrade en lien neutre.
  const typesReels = (data?.types ?? []).length > 0;
  const servicesReels = (data?.services ?? []).length > 0;
  const communesReelles = (data?.communes ?? []).length > 0;

  // Ne proposer que ce qui donne un résultat. Si le comptage est
  // indisponible, on n'écarte rien : mieux vaut un lien vide qu'un menu vide.
  const f = data?.facettes;
  const garde = <T,>(liste: T[], cle: (x: T) => string, bucket?: Record<string, number>) => {
    if (!f?.disponible || !bucket) return liste;
    const filtre = liste.filter((x) => (bucket[cle(x)] ?? 0) > 0);
    return filtre.length > 0 ? filtre : liste;
  };

  const types = garde(
    nonVide(data?.types, REPLI_TYPES),
    (t) => String(t.id),
    f?.types,
  );
  const servicesBien = garde(
    nonVide(data?.services, REPLI_SERVICES),
    (x) => String(x.id),
    f?.services,
  );
  const communes = garde(
    nonVide(data?.communes, REPLI_COMMUNES),
    (c) => c.id,
    f?.communes,
  ).slice(0, MAX_PAR_COLONNE);
  const quartiers = garde(
    data?.quartiers ?? [],
    (q) => q.id,
    f?.quartiers,
  ).slice(0, MAX_PAR_COLONNE);

  const colonneType: MenuColumn = {
    title: "Par type",
    items: [
      { label: "Tous les biens", href: "/properties", icon: "home" },
      ...types.map<MenuSubItem>((t) => ({
        label: t.name,
        href: typesReels
          ? `/properties?type=${encodeURIComponent(t.name)}`
          : "/properties",
        icon: iconeType(t.name),
      })),
    ],
  };

  const colonneService: MenuColumn = {
    title: "Par service",
    items: servicesBien.map<MenuSubItem>((s) => ({
      label: s.name,
      href: servicesReels
        ? `/properties?service=${encodeURIComponent(s.name)}`
        : "/properties",
      icon: iconeService(s.name),
    })),
  };

  const colonneCommune: MenuColumn = {
    title: "Par commune",
    items: communes.map<MenuSubItem>((c) => ({
      label: c.nom,
      href: communesReelles
        ? `/properties?commune=${encodeURIComponent(c.slug)}`
        : "/properties",
      image: c.image ?? null,
      icon: "lieu",
    })),
  };

  const colonneQuartier: MenuColumn = {
    title: "Par quartier",
    items: quartiers.map<MenuSubItem>((q) => ({
      label: q.name,
      href: `/properties?quartier=${encodeURIComponent(q.id)}`,
      image: q.image ?? null,
      icon: "lieu",
    })),
  };

  const colonnes: MenuColumn[] = [colonneType, colonneService, colonneCommune];
  // Colonne quartiers omise tant que la base n'en renvoie aucun, pour ne pas
  // laisser un titre sans liens dans le méga-menu.
  if (colonneQuartier.items.length > 0) colonnes.push(colonneQuartier);

  return [
    {
      id: 1,
      label: "Biens",
      href: "/properties",
      active: estActif(1, pathname),
      columns: colonnes,
      featured: {
        title: "Estimation gratuite",
        description: "Recevez la valeur de votre bien sous 24h ouvrées.",
        href: "/estimation",
        cta: "Demander une estimation",
      },
    },
    {
      id: 2,
      label: "Services",
      href: "/services",
      active: estActif(2, pathname),
      simpleItems: SERVICES_METIER,
    },
    {
      id: 3,
      label: "Annonces",
      href: "/annonces",
      active: estActif(3, pathname),
    },
    {
      id: 4,
      label: "L'agence",
      active: estActif(4, pathname),
      simpleItems: ITEMS_AGENCE,
    },
    {
      id: 5,
      label: "Contact",
      href: "/contact_us",
      active: estActif(5, pathname),
    },
  ];
};
