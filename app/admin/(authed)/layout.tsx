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
 * Le route group `(authed)` est invisible dans l'URL : les pages dedans
 * répondent à /admin (page.tsx), /admin/biens, /admin/annonces, etc.
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
    // À l'impression (affiches QR, états des lieux), seule la page sort :
    // barre latérale et barre du haut sont masquées.
    <div className="min-h-screen bg-stone-50 print:bg-white">
      <div className="print:hidden">
        <AdminSidebar />
      </div>
      <div className="lg:pl-64 print:pl-0">
        <div className="print:hidden">
          <AdminTopbar admin={admin} />
        </div>
        <main className="p-6 lg:p-8 max-w-7xl mx-auto print:p-0 print:max-w-none">
          {children}
        </main>
      </div>
    </div>
  );
}
