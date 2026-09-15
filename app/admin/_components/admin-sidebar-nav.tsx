"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Megaphone,
  Users,
  Settings,
  MessageSquareQuote,
  HelpCircle,
  Newspaper,
  MapPin,
  Inbox,
  Tags,
  ScrollText,
  BadgePercent,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /**
   * Préfixes annexes qui appartiennent à cette entrée sans vivre sous son
   * `href`. Sans eux, la saisie d'une commune ou d'un quartier n'allumait
   * aucune entrée : la sidebar perdait toute surbrillance pendant tout le
   * temps du formulaire.
   */
  matches?: string[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
  { label: "Leads", href: "/admin/leads", icon: Inbox },
  { label: "Biens", href: "/admin/biens", icon: Home },
  { label: "Types & services", href: "/admin/taxonomie", icon: Tags },
  {
    label: "Communes & quartiers",
    href: "/admin/geographie",
    icon: MapPin,
    matches: ["/admin/communes", "/admin/quartiers"],
  },
  { label: "Annonces", href: "/admin/annonces", icon: Megaphone },
  { label: "Bandeau d'infos", href: "/admin/bandeau", icon: ScrollText },
  { label: "Publicités", href: "/admin/publicites", icon: BadgePercent },
  
  { label: "Agents", href: "/admin/agents", icon: Users },
  { label: "Témoignages", href: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "Articles", href: "/admin/articles", icon: Newspaper },
  { label: "FAQ", href: "/admin/faqs", icon: HelpCircle },
  
];

const FOOTER_ITEMS: NavItem[] = [
  { label: "Paramètres", href: "/admin/parametres", icon: Settings },
];

/**
 * Contenu de la sidebar : réutilisé dans la version desktop (sidebar fixe)
 * et mobile (Sheet drawer).
 * @param onNavigate callback appelé quand un item est cliqué (utile pour
 *   fermer le drawer mobile après navigation).
 */
export function AdminSidebarNav({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Logo / brand */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border shrink-0">
        <Image
          src="/images/logo.png"
          alt="Agence Mirna"
          width={32}
          height={32}
          className="object-contain shrink-0"
        />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-agate font-bold leading-tight truncate">
            AGENCE MIRNA
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Back-office
          </span>
        </div>
      </div>

      {/* Nav principale */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* Nav secondaire */}
      <div className="px-3 py-4 border-t border-border space-y-1 shrink-0">
        {FOOTER_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const sousRoute = (prefixe: string) =>
    pathname === prefixe || pathname.startsWith(`${prefixe}/`);

  // /admin : match exact uniquement (sinon serait actif sur toutes les sous-routes)
  const isActive =
    item.href === "/admin"
      ? pathname === "/admin"
      : sousRoute(item.href) || (item.matches?.some(sousRoute) ?? false);

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        // IMPORTANT : ne PAS utiliser bg-muted/bg-accent ici : ces tokens
        // sont définis en marron foncé dans globals.css (couleurs de marque)
        // → hover devient un bloc presque noir.
        // On utilise bg-primary/5 pour le hover : très subtil orange, cohérent
        // avec la palette terre/cream de la marque et avec l'active state (bg-primary/10).
        "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-neutral-700 hover:bg-primary/5 hover:text-neutral-900",
      )}
    >
      {/* Barre verticale d'accent à gauche quand actif (plus visible que juste la couleur) */}
      {isActive && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary"
        />
      )}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-transform",
          !isActive && "group-hover:scale-110",
        )}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
