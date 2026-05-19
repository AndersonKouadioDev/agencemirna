-- ============================================================================
-- Migration 0001 : admin_users + helper is_admin()
-- ============================================================================
-- Objectif : whitelist des utilisateurs Supabase Auth autorisés à accéder
-- au back-office /admin. Un user_id présent dans cette table = accès admin.
--
-- Pour ajouter un admin :
--   1. Créer le compte via Supabase Auth (Dashboard → Authentication → Add user)
--   2. INSERT INTO admin_users (user_id, full_name, role) VALUES ('<uuid>', '...', 'admin');
--
-- À exécuter via :
--   - Supabase Dashboard → SQL Editor (production)
--   - OU `supabase db push` si CLI Supabase configurée localement
-- ============================================================================

-- Table de whitelist
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

CREATE INDEX IF NOT EXISTS admin_users_user_id_idx ON public.admin_users(user_id);

-- Fonction helper : vérifie si l'utilisateur courant (auth.uid()) est admin
-- Utilisée par les policies RLS d'écriture sur toutes les tables admin.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

-- RLS sur admin_users : seul un admin peut lister/modifier les admins
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins can read admin_users"
  ON public.admin_users
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "super_admins can manage admin_users"
  ON public.admin_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Trigger pour mettre à jour last_login_at (sera appelé par notre code applicatif
-- lors du signin réussi, pas par Supabase Auth directement)
COMMENT ON COLUMN public.admin_users.last_login_at IS
  'Mis à jour côté app via server action après login réussi';
