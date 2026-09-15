-- ============================================================================
-- 0020 — La nature d'un bien cesse de dépendre d'un libellé
-- ============================================================================
--
-- La vitrine décide à partir du TEXTE du service et de la catégorie :
--   serviceName.includes("vente")   -> afficher un prix de vente
--   categorieName.includes("meubl") -> afficher un tarif à la nuitée et le
--                                      sélecteur de dates
--
-- Conséquence : renommer « Vente » en « Ventes » depuis /admin/taxonomie
-- casse l'affichage du prix, sans le moindre avertissement. Et la
-- correspondance est fragile dans l'autre sens — « Non meublé » contient
-- « meubl », ce qui a déjà demandé une exception écrite à la main.
--
-- On déplace la décision du libellé vers des colonnes explicites. Les
-- libellés redeviennent alors de simples étiquettes, librement modifiables.
--
-- Idempotente : rejouable sans effet de bord.
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- 1. Colonnes
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.services_bien
  ADD COLUMN IF NOT EXISTS est_vente boolean NOT NULL DEFAULT false;
ALTER TABLE public.services_bien
  ADD COLUMN IF NOT EXISTS est_meuble boolean NOT NULL DEFAULT false;

-- Volontairement NULLABLE : `null` signifie « non renseigné », seul cas où la
-- fiche doit retomber sur la nature du service. Un `NOT NULL DEFAULT false`
-- rendrait toute nouvelle catégorie silencieusement « non meublée ».
ALTER TABLE public.categories_bien
  ADD COLUMN IF NOT EXISTS est_meuble boolean;

COMMENT ON COLUMN public.services_bien.est_vente IS
  'Le bien est à vendre : la fiche affiche un prix de vente, sans périodicité.';
COMMENT ON COLUMN public.services_bien.est_meuble IS
  'Service de location meublée : tarif à la nuitée et sélecteur de dates.';
COMMENT ON COLUMN public.categories_bien.est_meuble IS
  'Ameublement du bien. NULL = non renseigné, la nature du service tranche alors.';


-- ────────────────────────────────────────────────────────────────────────────
-- 2. Reprise depuis les libellés actuels
-- ────────────────────────────────────────────────────────────────────────────
-- C'est la dernière fois que le texte sert à décider : après cette migration,
-- seules les colonnes comptent.

UPDATE public.services_bien
SET est_vente = true
WHERE lower(public.unaccent_safe(name)) LIKE '%vente%';

UPDATE public.services_bien
SET est_meuble = true
WHERE lower(public.unaccent_safe(name)) LIKE '%meuble%'
   OR lower(public.unaccent_safe(name)) LIKE '%courte%'
   OR lower(public.unaccent_safe(name)) LIKE '%vacance%';

UPDATE public.categories_bien
SET est_meuble = CASE
  -- « Non meublé » contient « meubl » : l'ordre des tests compte.
  WHEN lower(public.unaccent_safe(name)) LIKE '%non meuble%' THEN false
  WHEN lower(public.unaccent_safe(name)) LIKE '%meuble%'     THEN true
  ELSE NULL
END
WHERE est_meuble IS NULL;


-- ────────────────────────────────────────────────────────────────────────────
-- 3. Contrôle
-- ────────────────────────────────────────────────────────────────────────────
-- Attendu : Vente -> est_vente ; Location meublée -> est_meuble ;
-- Meublé et Semi-meublé -> true ; Non meublé -> false.

SELECT 'services_bien' AS table_, name, est_vente::text AS vente, est_meuble::text AS meuble
FROM public.services_bien
UNION ALL
SELECT 'categories_bien', name, '—', coalesce(est_meuble::text, 'non renseigné')
FROM public.categories_bien
ORDER BY table_, name;
