-- ============================================================================
-- Migration 0005 : ajoute is_active à biens pour activer/désactiver un bien
-- ============================================================================
-- Permet à l'équipe de masquer un bien du site public sans le supprimer
-- (utile pour les biens en attente, hors saison, en cours de renouvellement
-- de mandat, etc.). Conservation des photos et de l'historique.
--
-- À exécuter dans Supabase SQL Editor.
-- ============================================================================

-- Ajout de la colonne
ALTER TABLE public.biens
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS biens_is_active_idx ON public.biens(is_active);

-- ----------------------------------------------------------------------------
-- RLS : activation + policies
-- ----------------------------------------------------------------------------
-- Note : si la table biens n'avait pas encore de RLS activée, on l'active.
-- Les visiteurs publics ne voient QUE les biens actifs.
-- Les admins voient tout et peuvent tout faire.

ALTER TABLE public.biens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read active biens" ON public.biens;
DROP POLICY IF EXISTS "admins manage biens" ON public.biens;

CREATE POLICY "public read active biens"
  ON public.biens FOR SELECT
  USING (is_active);

CREATE POLICY "admins manage biens"
  ON public.biens FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- Vérification
-- ----------------------------------------------------------------------------
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema='public' AND table_name='biens' AND column_name='is_active';
--
-- SELECT policyname, cmd FROM pg_policies
-- WHERE schemaname='public' AND tablename='biens';
