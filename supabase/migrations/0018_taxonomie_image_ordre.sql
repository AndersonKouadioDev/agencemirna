-- ============================================================================
-- 0018 — Visuel et ordre sur les taxonomies de bien
-- ============================================================================
--
--  1. IMAGE. Les communes portent un visuel depuis la migration 0015, mais pas
--     les types ni les services. Conséquence sur la vitrine : les entrées de
--     ces deux colonnes du méga-menu retombaient toutes sur la même photo de
--     repli, et la carte d'illustration ne réagissait plus au survol.
--
--  2. ORDRE. Ces tables n'ont aucune colonne de tri : la vitrine les classe
--     par nom. L'agence ne peut donc pas décider de ce qui remonte en premier,
--     et l'ajout d'un type pousse mécaniquement les suivants vers le bas.
--
--  3. ICÔNE. `types_bien` possède déjà une colonne `icon` ; on l'ajoute aux
--     deux autres tables pour qu'elles se gèrent de la même manière.
--
-- Idempotente : rejouable sans effet de bord.
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- 1. Colonnes
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.types_bien      ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE public.services_bien   ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE public.categories_bien ADD COLUMN IF NOT EXISTS image text;

ALTER TABLE public.types_bien      ADD COLUMN IF NOT EXISTS ordre integer NOT NULL DEFAULT 0;
ALTER TABLE public.services_bien   ADD COLUMN IF NOT EXISTS ordre integer NOT NULL DEFAULT 0;
ALTER TABLE public.categories_bien ADD COLUMN IF NOT EXISTS ordre integer NOT NULL DEFAULT 0;

ALTER TABLE public.services_bien   ADD COLUMN IF NOT EXISTS icon text;
ALTER TABLE public.categories_bien ADD COLUMN IF NOT EXISTS icon text;

COMMENT ON COLUMN public.types_bien.image IS
  'Visuel affiché dans le méga-menu et les raccourcis de l''accueil.';
COMMENT ON COLUMN public.services_bien.image IS
  'Visuel affiché dans le méga-menu.';


-- ────────────────────────────────────────────────────────────────────────────
-- 2. Ordre initial
-- ────────────────────────────────────────────────────────────────────────────
-- On part de l'ordre alphabétique actuel, par pas de 10, pour laisser de la
-- place aux insertions sans avoir à tout renuméroter.

UPDATE public.types_bien t
SET ordre = r.rang * 10
FROM (
  SELECT id, row_number() OVER (ORDER BY name) AS rang FROM public.types_bien
) r
WHERE t.id = r.id AND t.ordre = 0;

UPDATE public.services_bien s
SET ordre = r.rang * 10
FROM (
  SELECT id, row_number() OVER (ORDER BY name) AS rang FROM public.services_bien
) r
WHERE s.id = r.id AND s.ordre = 0;

UPDATE public.categories_bien c
SET ordre = r.rang * 10
FROM (
  SELECT id, row_number() OVER (ORDER BY name) AS rang FROM public.categories_bien
) r
WHERE c.id = r.id AND c.ordre = 0;


-- ────────────────────────────────────────────────────────────────────────────
-- 3. Contrôle
-- ────────────────────────────────────────────────────────────────────────────

SELECT 'types_bien' AS table_, id, name, ordre, image FROM public.types_bien
UNION ALL
SELECT 'services_bien', id, name, ordre, image FROM public.services_bien
UNION ALL
SELECT 'categories_bien', id, name, ordre, image FROM public.categories_bien
ORDER BY table_, ordre;
