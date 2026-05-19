import Link from "next/link";
import Image from "next/image";
import type { AdminUser } from "@/src/supabase/admin-auth";
import { AdminMobileSidebar } from "./admin-mobile-sidebar";
import { AdminUserMenu } from "./admin-user-menu";

export function AdminTopbar({ admin }: { admin: AdminUser | null }) {
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-stone-200">
      <div className="flex items-center justify-between gap-3 px-4 lg:px-8 h-14">
        {/* Gauche : hamburger (mobile) + logo (mobile only) */}
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
          </Link>
        </div>

        {/* Espace flex pour pousser le menu utilisateur à droite */}
        <div className="flex-1" />

        {/* Droite : menu utilisateur (avatar + dropdown) */}
        <AdminUserMenu admin={admin} />
      </div>
    </header>
  );
}
