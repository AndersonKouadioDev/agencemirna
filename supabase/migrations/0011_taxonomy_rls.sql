-- =============================================================================
-- 0011_taxonomy_rls.sql
-- =============================================================================
-- Corrige les RLS sur les 3 tables référentielles legacy :
--   - types_bien
--   - services_bien
--   - categories_bien
--
-- Ces tables avaient RLS activée mais aucune policy, donc même un admin
-- authentifié ne pouvait pas INSERT / UPDATE / DELETE (erreur :
-- "new row violates row-level security policy").
--
-- Cette migration :
--   1. Active RLS (idempotent, no-op si déjà active)
--   2. Ajoute policy SELECT publique (lecture libre, ces tables sont
--      des référentiels visibles partout côté public)
--   3. Ajoute policy ALL admin via is_admin()
-- =============================================================================

-- ─── TYPES_BIEN ─────────────────────────────────────────────────────────────
ALTER TABLE public.types_bien ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read types_bien" ON public.types_bien;
CREATE POLICY "public read types_bien"
  ON public.types_bien FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "admin all types_bien" ON public.types_bien;
CREATE POLICY "admin all types_bien"
  ON public.types_bien FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── SERVICES_BIEN ──────────────────────────────────────────────────────────
ALTER TABLE public.services_bien ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read services_bien" ON public.services_bien;
CREATE POLICY "public read services_bien"
  ON public.services_bien FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "admin all services_bien" ON public.services_bien;
CREATE POLICY "admin all services_bien"
  ON public.services_bien FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── CATEGORIES_BIEN ────────────────────────────────────────────────────────
ALTER TABLE public.categories_bien ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read categories_bien" ON public.categories_bien;
CREATE POLICY "public read categories_bien"
  ON public.categories_bien FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "admin all categories_bien" ON public.categories_bien;
CREATE POLICY "admin all categories_bien"
  ON public.categories_bien FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── Vérification ─────────────────────────────────────────────────────────
-- Pour vérifier que les policies sont bien actives :
-- SELECT tablename, policyname, cmd
-- FROM pg_policies
-- WHERE schemaname='public'
--   AND tablename IN ('types_bien', 'services_bien', 'categories_bien')
-- ORDER BY tablename, cmd;
