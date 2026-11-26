-- ============================================================================
-- 0030 — États des lieux (entrée / sortie) sur tablette
-- ============================================================================
--
-- L'agent remplit l'état des lieux pièce par pièce depuis l'admin, sur
-- tablette : état de chaque élément, photos, compteurs, clés, puis signatures
-- du locataire et de l'agent. Le document est ensuite consultable dans
-- l'admin, téléchargeable en PDF et envoyé par e-mail au locataire et au
-- propriétaire. Un état des lieux de sortie se compare à celui d'entrée.
--
-- Pièces, compteurs et clés sont en JSONB : leur liste varie d'un logement à
-- l'autre (studio, villa…) et se décide sur place, pas dans le schéma.
--
-- Les photos et signatures vont dans un bucket PRIVÉ : ce sont des documents
-- contractuels, avec l'intérieur des logements et le nom des locataires. On
-- ne les lit que par des liens signés, à durée limitée, générés pour un admin.
--
-- À exécuter dans Supabase → SQL Editor. Idempotente.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.etats_des_lieux (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bien_id              uuid NOT NULL REFERENCES public.biens(id) ON DELETE RESTRICT,
  type                 text NOT NULL CHECK (type IN ('entree', 'sortie')),
  -- État des lieux d'entrée auquel se compare une sortie.
  entree_id            uuid REFERENCES public.etats_des_lieux(id) ON DELETE SET NULL,
  date_edl             date NOT NULL DEFAULT current_date,
  locataire_nom        text NOT NULL DEFAULT '',
  locataire_email      text,
  locataire_telephone  text,
  proprietaire_nom     text,
  proprietaire_email   text,
  agent_nom            text,
  -- [{ id, nom, commentaire, photos: [chemin], elements: [{ id, nom, etat, commentaire }] }]
  pieces               jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- [{ id, libelle, numero, releve, photo }]
  compteurs            jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- [{ id, libelle, nombre }]
  cles                 jsonb NOT NULL DEFAULT '[]'::jsonb,
  observations         text,
  signature_locataire  text,   -- chemin dans le bucket
  signature_agent      text,
  statut               text NOT NULL DEFAULT 'brouillon'
                         CHECK (statut IN ('brouillon', 'signe')),
  signe_le             timestamptz,
  envoye_le            timestamptz,
  cree_par             uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT edl_sortie_seulement CHECK (entree_id IS NULL OR type = 'sortie')
);

CREATE INDEX IF NOT EXISTS edl_bien_idx       ON public.etats_des_lieux (bien_id, type);
CREATE INDEX IF NOT EXISTS edl_created_at_idx ON public.etats_des_lieux (created_at DESC);

DROP TRIGGER IF EXISTS edl_updated_at ON public.etats_des_lieux;
CREATE TRIGGER edl_updated_at
  BEFORE UPDATE ON public.etats_des_lieux
  FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();

ALTER TABLE public.etats_des_lieux ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin all etats_des_lieux" ON public.etats_des_lieux;
CREATE POLICY "admin all etats_des_lieux"
  ON public.etats_des_lieux FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Bucket privé des photos et signatures ───────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'etats-des-lieux',
  'etats-des-lieux',
  false,
  8388608,                                   -- 8 Mo
  ARRAY['image/jpeg', 'image/png']           -- le PDF ne sait lire que ces deux formats
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 8388608,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png'];

DROP POLICY IF EXISTS "admins read edl bucket"   ON storage.objects;
DROP POLICY IF EXISTS "admins insert edl bucket" ON storage.objects;
DROP POLICY IF EXISTS "admins update edl bucket" ON storage.objects;
DROP POLICY IF EXISTS "admins delete edl bucket" ON storage.objects;

CREATE POLICY "admins read edl bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'etats-des-lieux' AND public.is_admin());

CREATE POLICY "admins insert edl bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'etats-des-lieux' AND public.is_admin());

CREATE POLICY "admins update edl bucket"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'etats-des-lieux' AND public.is_admin());

CREATE POLICY "admins delete edl bucket"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'etats-des-lieux' AND public.is_admin());
