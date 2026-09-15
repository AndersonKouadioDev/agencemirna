-- ============================================================================
-- 0023 — Un article est composé de sections
-- ============================================================================
--
-- Jusqu'ici un article n'avait qu'un seul bloc de texte (`articles.content_md`)
-- et une image de couverture. Il se compose désormais de SECTIONS, chacune
-- avec son titre, son texte, jusqu'à trois images, et la position de ces
-- images par rapport au texte.
--
-- `articles.content_md` est conservée et reprise dans une première section :
-- rien n'est perdu, et une reprise ratée reste rattrapable.
--
-- Idempotente : rejouable sans effet de bord.
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- 1. Table
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.article_sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  article_id  uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  ordre       integer NOT NULL DEFAULT 0,

  titre       text,
  -- Markdown, rendu par un moteur maison qui ne produit qu'une liste fermée
  -- d'éléments React : une section ne peut donc pas injecter de HTML.
  contenu_md  text,

  -- Jusqu'à trois visuels, dans l'ordre du tableau.
  images      text[] NOT NULL DEFAULT '{}',

  -- Disposition des images par rapport au texte de la section.
  --   gauche  : images à gauche, texte à droite
  --   droite  : texte à gauche, images à droite
  --   centre  : images pleine largeur, texte en dessous
  --   entoure : image flottante, le texte s'enroule autour
  position_image text NOT NULL DEFAULT 'droite'
);

-- Contraintes posées à part pour rester rejouables sur une table existante.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'article_sections_max_3_images') THEN
    ALTER TABLE public.article_sections
      ADD CONSTRAINT article_sections_max_3_images
      CHECK (coalesce(array_length(images, 1), 0) <= 3);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'article_sections_position_valide') THEN
    ALTER TABLE public.article_sections
      ADD CONSTRAINT article_sections_position_valide
      CHECK (position_image IN ('gauche', 'centre', 'droite', 'entoure'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS article_sections_article_id_idx
  ON public.article_sections (article_id, ordre);

COMMENT ON COLUMN public.article_sections.images IS
  'Jusqu''à trois URL, dans l''ordre d''affichage.';
COMMENT ON COLUMN public.article_sections.position_image IS
  'gauche | centre | droite | entoure — disposition des images face au texte.';


-- ────────────────────────────────────────────────────────────────────────────
-- 2. `updated_at` automatique
-- ────────────────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS article_sections_updated_at ON public.article_sections;
CREATE TRIGGER article_sections_updated_at
BEFORE UPDATE ON public.article_sections
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


-- ────────────────────────────────────────────────────────────────────────────
-- 3. RLS
-- ────────────────────────────────────────────────────────────────────────────
-- Une section suit la visibilité de son article : dépublier l'article suffit
-- à masquer tout son contenu, sans avoir à toucher chaque section.

ALTER TABLE public.article_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read sections of active articles" ON public.article_sections;
CREATE POLICY "public read sections of active articles"
  ON public.article_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_id AND a.is_active
    )
  );

DROP POLICY IF EXISTS "admin manage article sections" ON public.article_sections;
CREATE POLICY "admin manage article sections"
  ON public.article_sections FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));


-- ────────────────────────────────────────────────────────────────────────────
-- 4. Reprise du contenu existant
-- ────────────────────────────────────────────────────────────────────────────
-- Chaque article qui portait du texte reçoit une première section. La colonne
-- `articles.content_md` n'est PAS supprimée : tant qu'elle est là, une reprise
-- mal passée se rejoue sans perte.

INSERT INTO public.article_sections (article_id, ordre, contenu_md, position_image)
SELECT a.id, 10, a.content_md, 'droite'
FROM public.articles a
WHERE a.content_md IS NOT NULL
  AND btrim(a.content_md) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.article_sections s WHERE s.article_id = a.id
  );


-- ────────────────────────────────────────────────────────────────────────────
-- 5. Contrôle
-- ────────────────────────────────────────────────────────────────────────────

SELECT
  a.title,
  count(s.id)                                    AS sections,
  coalesce(sum(coalesce(array_length(s.images, 1), 0)), 0) AS images,
  CASE WHEN btrim(coalesce(a.content_md, '')) = '' THEN 'vide' ELSE 'conservé' END AS ancien_contenu
FROM public.articles a
LEFT JOIN public.article_sections s ON s.article_id = a.id
GROUP BY a.id, a.title, a.content_md
ORDER BY a.title;
