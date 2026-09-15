-- ============================================================================
-- 0027 — Publicités : des emplacements sur tout le site, pilotés depuis l'admin
-- ============================================================================
--
-- Le site devient un espace de promotion immobilière. Une publicité est une
-- image, un texte ou une vidéo, posée sur un EMPLACEMENT — une balise placée
-- dans une page (haut de l'accueil, colonne d'une fiche, pied d'un article…).
-- Plusieurs publicités sur le même emplacement défilent en carrousel.
--
-- Les emplacements ne sont PAS une table : ce sont des positions dans le code
-- des pages, et la base ne peut pas en inventer. Ils vivent dans un registre
-- (src/lib/publicites.ts) ; la colonne `emplacement` en porte la clé, et une
-- clé inconnue n'affiche simplement rien — jamais d'erreur sur la vitrine.
--
-- Une publicité peut pointer vers un bien : c'est le cas nominal d'une agence.
-- `ON DELETE SET NULL` — supprimer le bien ne fait pas disparaître la pub, qui
-- perd seulement sa destination et se signale en admin.
--
-- Idempotente : rejouable sans effet de bord.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.publicites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  -- Nom interne, pour s'y retrouver en admin. Pas affiché tel quel.
  titre       text NOT NULL,

  -- image | texte | video — ce que l'emplacement montre.
  type        text NOT NULL DEFAULT 'image',
  emplacement text NOT NULL,

  -- Visuel (type image), ou affiche avant lecture (type video). Facultatif en
  -- vidéo : le fournisseur peut en publier une.
  image       text,
  video_url   text,

  -- Surtitre court et corps (type texte, et en surimpression des deux autres).
  accroche    text,
  corps       text,

  -- Destination et libellé du bouton. Sans lien, une pub pointant vers un bien
  -- mène à sa fiche ; sans bien non plus, elle reste inerte.
  lien        text,
  cta_label   text,
  bien_id     uuid REFERENCES public.biens(id) ON DELETE SET NULL,

  ordre       integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  starts_at   timestamptz,
  ends_at     timestamptz
);

COMMENT ON TABLE public.publicites IS
  'Publicités posées sur les emplacements du site (voir src/lib/publicites.ts).';
COMMENT ON COLUMN public.publicites.emplacement IS
  'Clé du registre d''emplacements. Inconnue = jamais affichée, jamais d''erreur.';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publicites_type_valide'
                 AND conrelid = 'public.publicites'::regclass) THEN
    ALTER TABLE public.publicites ADD CONSTRAINT publicites_type_valide
      CHECK (type IN ('image', 'texte', 'video'));
  END IF;

  -- Chaque type exige son média : une pub « image » sans image serait un
  -- cadre vide sur la page d'accueil. Les contrôles principaux vivent dans le
  -- formulaire ; ceci est le garde-fou d'une écriture qui le contournerait.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publicites_media_requis'
                 AND conrelid = 'public.publicites'::regclass) THEN
    ALTER TABLE public.publicites ADD CONSTRAINT publicites_media_requis CHECK (
      (type = 'image' AND btrim(coalesce(image, '')) <> '')
      OR (type = 'video' AND btrim(coalesce(video_url, '')) <> '')
      OR (type = 'texte' AND btrim(coalesce(corps, '')) <> '')
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publicites_fenetre_coherente'
                 AND conrelid = 'public.publicites'::regclass) THEN
    ALTER TABLE public.publicites ADD CONSTRAINT publicites_fenetre_coherente
      CHECK (starts_at IS NULL OR ends_at IS NULL OR starts_at < ends_at);
  END IF;
END $$;

-- La lecture publique filtre par emplacement puis trie par ordre : c'est
-- exactement cet index.
CREATE INDEX IF NOT EXISTS publicites_emplacement_idx
  ON public.publicites (emplacement, is_active, ordre);

DROP TRIGGER IF EXISTS publicites_updated_at ON public.publicites;
CREATE TRIGGER publicites_updated_at
BEFORE UPDATE ON public.publicites
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- Le code filtre EN PLUS `is_active` et la fenêtre : la policy admin est
-- `FOR ALL` et se combine en OU avec celle-ci.
ALTER TABLE public.publicites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read active publicites" ON public.publicites;
CREATE POLICY "public read active publicites"
  ON public.publicites FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admin manage publicites" ON public.publicites;
CREATE POLICY "admin manage publicites"
  ON public.publicites FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- ── Pas de reprise ────────────────────────────────────────────────────────────
-- Aucune publicité n'existait nulle part : rien à reprendre. Les emplacements
-- restent vides tant que l'agence n'y pose rien, et une balise vide ne rend
-- rien — pas même un cadre.

-- ── Contrôle ──────────────────────────────────────────────────────────────────
SELECT emplacement, type, count(*) AS publicites
FROM public.publicites
GROUP BY emplacement, type
ORDER BY emplacement, type;
