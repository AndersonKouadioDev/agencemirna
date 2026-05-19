-- ============================================================================
-- Migration 0002 : fix RLS récursif sur admin_users
-- ============================================================================
-- Problème de 0001 :
--   - Policy SELECT sur admin_users : USING (is_admin())
--   - is_admin() fait : SELECT FROM admin_users WHERE user_id = auth.uid()
--   - Le sub-SELECT re-déclenche la policy → boucle → 0 ligne
--   - Conséquence : même un admin légitime ne peut pas voir sa propre ligne
--     → le signInAdmin pense que l'user n'est pas admin → refus accès
--
-- Fix : la policy SELECT utilise `user_id = auth.uid()` directement (un user
-- peut lire SA PROPRE ligne, c'est suffisant pour la vérification d'accès).
-- Pour la gestion globale (lister tous les admins, créer/supprimer), on garde
-- une policy "super_admin" sur INSERT/UPDATE/DELETE.
-- ============================================================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "admins can read admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "super_admins can manage admin_users" ON public.admin_users;

-- 1. SELECT : un user peut lire SA propre ligne (zéro récursion)
CREATE POLICY "users read own admin row"
  ON public.admin_users
  FOR SELECT
  USING (user_id = auth.uid());

-- 2. SELECT : un super_admin peut lire toutes les lignes
--    (via la fonction is_admin_role qui bypass RLS pour éviter récursion)
CREATE OR REPLACE FUNCTION public.current_user_is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid() AND role = 'super_admin'
  );
$$;

CREATE POLICY "super_admins read all admin_users"
  ON public.admin_users
  FOR SELECT
  USING (public.current_user_is_super_admin());

-- 3. INSERT/UPDATE/DELETE : super_admins seulement
CREATE POLICY "super_admins insert admin_users"
  ON public.admin_users
  FOR INSERT
  WITH CHECK (public.current_user_is_super_admin());

CREATE POLICY "super_admins update admin_users"
  ON public.admin_users
  FOR UPDATE
  USING (public.current_user_is_super_admin());

CREATE POLICY "super_admins delete admin_users"
  ON public.admin_users
  FOR DELETE
  USING (public.current_user_is_super_admin());

-- ============================================================================
-- Bonus : permettre l'update de last_login_at par le user lui-même
-- (notre server action signInAdmin met à jour cette colonne après login)
-- ============================================================================

CREATE POLICY "users update own last_login_at"
  ON public.admin_users
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
