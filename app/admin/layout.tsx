import type { Metadata } from "next";
import { headers } from "next/headers";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminTopbar } from "./_components/admin-topbar";
import { getAdminUser } from "@/src/supabase/admin-auth";

export const metadata: Metadata = {
  title: {
    template: "%s · Admin Mirna",
    default: "Admin Mirna",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // /admin/login a son propre layout (pas de sidebar) — on détecte via URL
  const h = await headers();
  const pathname = h.get("x-pathname") ?? h.get("next-url") ?? "";
  const isLoginPage = pathname.startsWith("/admin/login");

  if (isLoginPage) {
    // La page login se rend seule, sans chrome
    return <>{children}</>;
  }

  // Pour toutes les autres routes /admin/*, on récupère le user (le middleware
  // a déjà vérifié qu'il est connecté, getAdminUser confirme qu'il est admin).
  const admin = await getAdminUser();

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminTopbar admin={admin} />
        <main className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
