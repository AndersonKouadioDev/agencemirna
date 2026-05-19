import type { Metadata } from "next";
import { AdminSidebar } from "../_components/admin-sidebar";
import { AdminTopbar } from "../_components/admin-topbar";
import { requireAdmin } from "@/src/supabase/admin-auth";

export const metadata: Metadata = {
  title: {
    template: "%s · Admin Mirna",
    default: "Admin Mirna",
  },
  robots: { index: false, follow: false },
};

/**
 * Layout des routes admin authentifiées.
 * Ce layout ne s'applique PAS à /admin/login (route hors du route group `(authed)`).
 *
 * Le route group `(authed)` est invisible dans l'URL — les pages dedans
 * répondent à /admin (page.tsx), /admin/biens, /admin/services, etc.
 */
export default async function AdminAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Garde stricte : redirige vers /admin/login si non authentifié OU non admin.
  // Le middleware fait déjà un premier check au niveau session, ici on confirme
  // l'appartenance à la whitelist admin_users.
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-stone-50">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminTopbar admin={admin} />
        <main className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
