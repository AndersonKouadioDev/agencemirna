"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/src/supabase/server";

export type SignInResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Server Action : connexion email/password d'un admin.
 * Vérifie que l'utilisateur est bien dans la table admin_users.
 * En cas de succès : met à jour last_login_at et redirige vers `next` ou /admin.
 */
export async function signInAdmin(formData: FormData): Promise<SignInResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    return { ok: false, error: "Email et mot de passe requis." };
  }

  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError || !authData.user) {
    return {
      ok: false,
      error: "Email ou mot de passe incorrect.",
    };
  }

  // Vérifier que cet utilisateur est dans la whitelist admin
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (!adminRow) {
    // Déconnecter immédiatement et refuser
    await supabase.auth.signOut();
    return {
      ok: false,
      error:
        "Ce compte n'a pas accès au back-office. Contactez un administrateur.",
    };
  }

  // Mettre à jour le timestamp de dernière connexion (best-effort, n'échoue
  // pas la connexion si ça plante)
  await supabase
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("user_id", authData.user.id);

  revalidatePath("/admin", "layout");
  // sanity-check anti open-redirect : `next` doit être une route interne
  const safeNext = next.startsWith("/admin") ? next : "/admin";
  redirect(safeNext);
}

/**
 * Server Action : déconnexion.
 */
export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}
