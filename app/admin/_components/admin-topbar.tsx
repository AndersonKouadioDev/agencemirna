import Link from "next/link";
import Image from "next/image";
import { LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAdmin } from "@/src/actions/admin/auth";
import type { AdminUser } from "@/src/supabase/admin-auth";
import { AdminMobileSidebar } from "./admin-mobile-sidebar";

export function AdminTopbar({ admin }: { admin: AdminUser | null }) {
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between gap-3 px-4 lg:px-8 h-14">
        {/* Gauche : hamburger (mobile) + logo (mobile only, redondant en desktop avec la sidebar) */}
        <div className="flex items-center gap-2 lg:hidden">
          <AdminMobileSidebar />
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Agence Mirna"
              width={24}
              height={24}
              className="object-contain"
            />
            <span className="text-sm font-agate font-bold">MIRNA</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline">
              Admin
            </span>
          </Link>
        </div>

        {/* Espace flex pour pousser les actions à droite */}
        <div className="flex-1" />

        {/* Droite : actions + identité */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 transition-colors px-2 py-1.5 rounded-md hover:bg-zinc-100"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Voir le site
          </Link>

          {admin && (
            <div className="hidden md:flex flex-col items-end leading-tight max-w-[180px]">
              <span className="text-sm font-medium truncate">
                {admin.fullName ?? admin.email}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {admin.role === "super_admin" ? "Super admin" : "Admin"}
              </span>
            </div>
          )}

          <form action={signOutAdmin}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              title="Déconnexion"
              aria-label="Déconnexion"
              className="text-neutral-700 hover:bg-zinc-100 hover:text-neutral-900"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1.5 sm:text-xs">
                Déconnexion
              </span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
