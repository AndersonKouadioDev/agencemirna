import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAdmin } from "@/src/actions/admin/auth";
import type { AdminUser } from "@/src/supabase/admin-auth";

export function AdminTopbar({ admin }: { admin: AdminUser | null }) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between px-6 lg:px-8 h-14">
        {/* Empty space — placeholder pour breadcrumbs futurs */}
        <div className="flex-1" />

        <div className="flex items-center gap-3">
          {/* Lien vers le site public */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Voir le site
          </Link>

          {/* Identité user */}
          {admin && (
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-medium">
                {admin.fullName ?? admin.email}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {admin.role === "super_admin" ? "Super admin" : "Admin"}
              </span>
            </div>
          )}

          {/* Logout */}
          <form action={signOutAdmin}>
            <Button type="submit" variant="ghost" size="sm" title="Déconnexion">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Déconnexion</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
