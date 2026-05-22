import type { ComponentType } from "react";
import {
  Home,
  Building2,
  KeyRound,
  Palette,
  Landmark,
  HardHat,
  Sparkles,
  Calculator,
  MapPin,
  Megaphone,
  Map as MapIcon,
  Users,
  Newspaper,
  HelpCircle,
  MessageCircle,
  FileText,
  Building,
  Briefcase,
} from "lucide-react";

/**
 * Structure du menu Header — version mega menu (max 4 items principaux).
 *
 * 4 items :
 *   1. Biens (mega menu : Types + Services + Quartiers + Actions)
 *   2. Services (dropdown simple, 6 services métier)
 *   3. L'agence (dropdown : À propos, Notre équipe, Blog, FAQ)
 *   4. Contact (lien direct)
 *
 * Les sous-items pointent vers les pages publiques existantes avec, pour
 * Biens, des filtres préappliqués via query params (?type=&service=&q=).
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
            { label: "Appartements", href: "/properties?type=Appartement", icon: Building2 },
            { label: "Studios", href: "/properties?type=Studio", icon: Building },
            { label: "Villas", href: "/properties?type=Villa", icon: Home },
            { label: "Terrains", href: "/properties?type=Terrain", icon: MapPin },
            { label: "Locaux commerciaux", href: "/properties?type=Local+commercial", icon: Briefcase },
          ],
        },
        {
          title: "Par service",
          items: [
            { label: "À louer", href: "/properties?service=location", icon: KeyRound },
            { label: "À vendre", href: "/properties?service=vente", icon: FileText },
            { label: "Meublé courte durée", href: "/properties?service=meublée", icon: Sparkles },
            { label: "Bail commercial", href: "/properties?service=Bail+commercial", icon: Briefcase },
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
      label: "L'agence",
      active:
        pathname === "/about" ||
        pathname.startsWith("/agents") ||
        pathname.startsWith("/promotions") ||
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
          href: "/about#actualites",
          description: "Conseils et actualités du marché.",
          icon: Newspaper,
        },
        {
          label: "Promotions",
          href: "/promotions",
          description: "Offres et programmes en cours.",
          icon: Megaphone,
        },
        {
          label: "FAQ",
          href: "/about#faq",
          description: "Réponses aux questions fréquentes.",
          icon: HelpCircle,
        },
      ],
    },
    {
      id: 4,
      label: "Contact",
      href: "/contact_us",
      active: pathname === "/contact_us",
    },
  ];
};
