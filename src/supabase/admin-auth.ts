import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "./server";

/**
 * Représente un utilisateur admin authentifié (combinaison auth.users + admin_users).
 */
export type AdminUser = {
  id: string; // auth.users.id
  email: string;
  fullName: string | null;
  role: "admin" | "super_admin";
  lastLoginAt: string | null;
};

/**
 * Récupère l'utilisateur courant ET vérifie qu'il est dans la whitelist admin.
 * Retourne null si non connecté OU non admin (jamais throw).
 *
 * À utiliser dans les Server Components / Server Actions où on veut le user
 * mais sans forcer la redirection (ex: composant header qui affiche le nom
 * d'utilisateur si dispo, ou hide certaines actions).
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: adminRow, error } = await supabase
    .from("admin_users")
    .select("full_name, role, last_login_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !adminRow) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: adminRow.full_name,
    role: adminRow.role,
    lastLoginAt: adminRow.last_login_at,
  };
}

/**
 * Garde stricte : récupère l'admin OU redirige vers /admin/login.
 * À utiliser au début de chaque Server Component sous /admin (sauf /admin/login).
 *
 * Le middleware fait déjà un premier check rapide, cette fonction est la
 * deuxième barrière (defense in depth) au niveau de la page.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
