-- ============================================================================
-- Migration 0003 : policies RLS sur le bucket Storage "images"
-- ============================================================================
-- Objectif : permettre aux admins d'uploader/modifier/supprimer des images
-- via le back-office. Le SELECT (lecture publique) reste pour que les visiteurs
-- du site puissent voir les photos des biens.
--
-- Découvert au test live : upload_admin_image() retournait "new row violates
-- row-level security policy" car aucune policy INSERT n'existait pour les
-- utilisateurs authentifiés sur storage.objects pour le bucket "images".
--
-- À exécuter dans Supabase SQL Editor.
-- ============================================================================

-- S'assurer que le bucket existe et est public en lecture
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  8388608,                                                       -- 8 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  file_size_limit = 8388608,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

-- Nettoyer les anciennes policies sur ce bucket si elles existent
DROP POLICY IF EXISTS "public read images bucket" ON storage.objects;
DROP POLICY IF EXISTS "admins list images bucket" ON storage.objects;
DROP POLICY IF EXISTS "admins insert images bucket" ON storage.objects;
DROP POLICY IF EXISTS "admins update images bucket" ON storage.objects;
DROP POLICY IF EXISTS "admins delete images bucket" ON storage.objects;

-- 1. SELECT (LIST) : restreint aux admins.
--    Note : ce bucket est public (public = true), donc l'AFFICHAGE des
--    images via les URLs (getPublicUrl) ne dépend PAS de cette policy.
--    Cette policy contrôle uniquement le droit de LISTER les fichiers
--    via l'API .storage.list(), qu'on ne veut PAS exposer aux visiteurs
--    (sinon ils peuvent scraper le contenu complet du bucket).
CREATE POLICY "admins list images bucket"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'images'
    AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- 2. INSERT : seuls les admins (whitelist admin_users) peuvent uploader
CREATE POLICY "admins insert images bucket"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'images'
    AND EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- 3. UPDATE : seuls les admins peuvent modifier (ex: changer le cache-control)
CREATE POLICY "admins update images bucket"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'images'
    AND EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- 4. DELETE : seuls les admins peuvent supprimer
CREATE POLICY "admins delete images bucket"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'images'
    AND EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- Vérification : doit lister les 4 policies sur le bucket "images"
-- SELECT policyname, cmd FROM pg_policies
-- WHERE schemaname='storage' AND tablename='objects'
--   AND policyname LIKE '%images bucket%';
-- ============================================================================
