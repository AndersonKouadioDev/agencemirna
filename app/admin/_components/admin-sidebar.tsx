import { AdminSidebarNav } from "./admin-sidebar-nav";

/**
 * Sidebar fixe desktop (1024px+). Sur mobile/tablet, voir <MobileSidebar />
 * déclenchée depuis la topbar.
 */
export function AdminSidebar() {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64 lg:flex lg:flex-col bg-white border-r border-border">
      <AdminSidebarNav />
    </aside>
  );
}
