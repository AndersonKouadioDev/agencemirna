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

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:flex lg:flex-col bg-white border-r border-border">
      {/* Logo / brand */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <Image
          src="/images/logo.png"
          alt="Agence Mirna"
          width={32}
          height={32}
          className="object-contain"
        />
        <div className="flex flex-col">
          <span className="text-sm font-agate font-bold leading-tight">
            AGENCE MIRNA
          </span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Back-office
          </span>
        </div>
      </div>

      {/* Nav principale */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      {/* Nav secondaire */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        {FOOTER_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </div>
    </aside>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  // Active si exact match OU si sous-route (sauf pour /admin qui doit être exact)
  const isActive =
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(item.href);

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}
