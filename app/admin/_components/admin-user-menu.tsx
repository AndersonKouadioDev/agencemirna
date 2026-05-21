"use client";

import Link from "next/link";
import { ExternalLink, LogOut, Settings, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAdmin } from "@/src/actions/admin/auth";
import type { AdminUser } from "@/src/supabase/admin-auth";

/**
 * Menu dropdown utilisateur dans la topbar admin.
 * Pattern standard pro : avatar circulaire avec initiales → clic → menu
 * avec identité + actions (Voir le site, Paramètres, Déconnexion).
 */
export function AdminUserMenu({ admin }: { admin: AdminUser | null }) {
  // Initiales : 2 premières lettres du fullName ou de l'email
  const initials = getInitials(admin?.fullName ?? admin?.email ?? "?");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="Menu utilisateur"
        >
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              "bg-primary/15 text-primary text-xs font-semibold",
            )}
          >
            {initials}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* Bloc identité */}
        <div className="px-2.5 py-2">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full shrink-0",
                "bg-primary/15 text-primary text-sm font-semibold",
              )}
            >
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-neutral-900 truncate">
                {admin?.fullName ?? "Utilisateur"}
              </div>
              <div className="text-xs text-neutral-500 truncate">
                {admin?.email}
              </div>
            </div>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            {admin?.role === "super_admin" ? "Super admin" : "Admin"}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Actions */}
        <DropdownMenuLabel>Navigation</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            Voir le site public
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/parametres">
            <Settings className="h-4 w-4" />
            Paramètres
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout : danger variant (rouge) */}
        <form action={signOutAdmin}>
          <DropdownMenuItem asChild variant="danger">
            <button type="submit" className="w-full">
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Calcule les initiales d'un nom complet ou d'un email.
 * Exemples :
 *   "Anderson Kouadio" → "AK"
 *   "Agence Mirna" → "AM"
 *   "mirnaagenceimob@gmail.com" → "MA" (depuis "mirnaagenceimob")
 *   "x" → "X"
 */
function getInitials(value: string): string {
  if (!value) return "?";

  // Si c'est un email, prendre la partie locale et chercher des séparateurs
  const localPart = value.includes("@") ? value.split("@")[0] : value;
  const cleaned = localPart.replace(/[._\-+]+/g, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    // Un seul mot : prendre les 2 premières lettres
    return parts[0].slice(0, 2).toUpperCase();
  }
  // Plusieurs mots : initiales des 2 premiers
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
