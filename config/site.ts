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
  Megaphone,
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
 *   1. Biens       (mega menu : Types + Services + Quartiers + featured)
 *   2. Services    (dropdown simple, 6 services métier)
 *   3. Promotions  (lien direct, page promotions)
 *   4. L'agence    (dropdown : À propos, Notre équipe, Blog)
 *   5. Contact     (lien direct)
 *
 * IMPORTANT : les valeurs `type` et `service` dans les URLs doivent
 * correspondre **exactement** aux noms en base (services_bien / types_bien
 * seedés dans migration 0006) pour que le Select de /properties les
 * pré-sélectionne après navigation. Voir `list-properties-section.tsx`.
 */

export type MenuSubItem = {
  label: string;
  href: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
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

export const getMenuList = (pathname: string): MenuItem[] => {
  return [
    {
      id: 1,
      label: "Biens",
      href: "/properties",
      active: pathname.startsWith("/properties"),
      columns: [
        {
          title: "Par type",
          items: [
            { label: "Tous les biens", href: "/properties", icon: Home },
            { label: "Villas", href: "/properties?type=Villa", icon: Home },
            { label: "Duplex", href: "/properties?type=Duplex", icon: Building2 },
            { label: "Maisons", href: "/properties?type=Maison", icon: Home },
            { label: "Terrains", href: "/properties?type=Terrain", icon: MapPin },
            { label: "Locaux commerciaux", href: "/properties?type=Local%20commercial", icon: Briefcase },
            { label: "Bureaux", href: "/properties?type=Bureau", icon: Building2 },
            { label: "Entrepôts", href: "/properties?type=Entrep%C3%B4t", icon: Warehouse },
          ],
        },
        {
          title: "Par service",
          items: [
            { label: "Vente", href: "/properties?service=Vente", icon: FileText },
            { label: "Location nue", href: "/properties?service=Location%20nue", icon: KeyRound },
            { label: "Location meublée", href: "/properties?service=Location%20meubl%C3%A9e%20longue%20dur%C3%A9e", icon: Sparkles },
            { label: "Bail commercial", href: "/properties?service=Bail%20commercial", icon: Briefcase },
            { label: "Gestion locative", href: "/properties?service=Gestion%20locative", icon: Building2 },
          ],
        },
        {
          title: "Par quartier",
          items: [
            { label: "Cocody", href: "/properties?q=Cocody", icon: MapPin },
            { label: "Plateau", href: "/properties?q=Plateau", icon: MapPin },
            { label: "Marcory", href: "/properties?q=Marcory", icon: MapPin },
            { label: "Riviera", href: "/properties?q=Riviera", icon: MapPin },
          ],
        },
      ],
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
      active: pathname.startsWith("/services"),
      simpleItems: [
        {
          label: "Vente de biens",
          href: "/services/vente",
          description: "Vendez votre bien avec un mandat sérieux.",
          icon: Home,
        },
        {
          label: "Location meublée",
          href: "/services/location-meublee",
          description: "Rentabilisez votre bien en courte durée.",
          icon: KeyRound,
        },
        {
          label: "Gestion immobilière",
          href: "/services/gestion-immobiliere",
          description: "On gère tout pour vous.",
          icon: Building2,
        },
        {
          label: "Décoration & aménagement",
          href: "/services/decoration-amenagement",
          description: "Donnez vie à vos espaces.",
          icon: Palette,
        },
        {
          label: "Construction",
          href: "/services/construction",
          description: "De la conception à la livraison.",
          icon: HardHat,
        },
        {
          label: "Promotion immobilière",
          href: "/services/promotion-immobiliere",
          description: "Programmes neufs sélectionnés.",
          icon: Landmark,
        },
      ],
    },
    {
      id: 3,
      label: "Promotions",
      href: "/promotions",
      active: pathname.startsWith("/promotions"),
    },
    {
      id: 4,
      label: "L'agence",
      active:
        pathname === "/about" ||
        pathname.startsWith("/agents") ||
        pathname.startsWith("/blog") ||
        pathname.startsWith("/actualites"),
      simpleItems: [
        {
          label: "À propos",
          href: "/about",
          description: "Notre histoire, nos valeurs.",
          icon: Building2,
        },
        {
          label: "Notre équipe",
          href: "/agents",
          description: "Les visages derrière l'agence.",
          icon: Users,
        },
        {
          label: "Blog",
          href: "/blog",
          description: "Conseils et actualités du marché.",
          icon: Newspaper,
        },
      ],
    },
    {
      id: 5,
      label: "Contact",
      href: "/contact_us",
      active: pathname === "/contact_us",
    },
  ];
};
