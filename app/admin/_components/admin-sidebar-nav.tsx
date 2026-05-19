"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Sparkles,
  Megaphone,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
  { label: "Biens", href: "/admin/biens", icon: Home },
  { label: "Services", href: "/admin/services", icon: Sparkles },
  { label: "Promotions", href: "/admin/promotions", icon: Megaphone },
  { label: "Agents", href: "/admin/agents", icon: Users },
];

const FOOTER_ITEMS: NavItem[] = [
  { label: "Paramètres", href: "/admin/parametres", icon: Settings },
];

/**
 * Contenu de la sidebar — réutilisé dans la version desktop (sidebar fixe)
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
  // /admin : match exact uniquement (sinon serait actif sur toutes les sous-routes)
  const isActive =
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
