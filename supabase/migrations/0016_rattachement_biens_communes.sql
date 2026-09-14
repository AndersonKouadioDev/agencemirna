-- ============================================================================
-- 0016 — Reprise du rattachement des biens à leur commune
-- ============================================================================
--
-- La migration 0015 rapprochait `biens.ville_commune` du nom de la commune par
-- égalité stricte. Aucun bien n'a été rattaché : le champ est saisi en texte
-- libre et vaut en réalité « Marcory-Abidjan », « Treichville Zone 3 »,
-- « Aidjan_ Cocody », « Plateau-Abidjan »… Le nom de la commune y est présent,
-- mais jamais seul.
--
-- On rapproche donc par inclusion, en retenant le nom le plus long lorsque
-- plusieurs communes correspondent, et en ignorant les accents.
--
-- Idempotente : ne touche qu'aux biens dont `commune_id` est encore NULL.
-- ============================================================================


-- `unaccent_safe` est créée par la migration 0015 ; on la redéclare ici pour
-- que ce script reste exécutable seul.
CREATE OR REPLACE FUNCTION public.unaccent_safe(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT translate(
    coalesce(input, ''),
    'àáâãäåçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ',
    'aaaaaaceeeeiiiinooooouuuuyyAAAAAACEEEEIIIINOOOOOUUUUY'
  );
$$;


-- ────────────────────────────────────────────────────────────────────────────
-- Rattachement par inclusion du nom de commune dans le texte libre
-- ────────────────────────────────────────────────────────────────────────────
-- On cherche aussi dans `address` : certains biens ne portent la commune que
-- dans leur adresse Google Places.
--
-- `ORDER BY length(c.nom) DESC` : si deux communes correspondaient, la plus
-- spécifique gagne. Le nom seul doit faire au moins 4 caractères pour éviter
-- des correspondances fortuites.

UPDATE public.biens b
SET commune_id = m.commune_id
FROM (
  SELECT DISTINCT ON (b2.id)
    b2.id AS bien_id,
    c.id  AS commune_id
  FROM public.biens b2
  JOIN public.communes c
    ON position(
         lower(public.unaccent_safe(c.nom))
         IN lower(public.unaccent_safe(coalesce(b2.ville_commune, '') || ' ' || coalesce(b2.address, '')))
       ) > 0
  WHERE b2.commune_id IS NULL
    AND length(c.nom) >= 4
  ORDER BY b2.id, length(c.nom) DESC
) m
WHERE b.id = m.bien_id
  AND b.commune_id IS NULL;


-- ────────────────────────────────────────────────────────────────────────────
-- Rattachement au quartier, quand son nom apparaît dans l'adresse
-- ────────────────────────────────────────────────────────────────────────────
-- Le quartier doit appartenir à la commune déjà rattachée, pour ne pas créer
-- d'incohérence entre les deux clés.

UPDATE public.biens b
SET quartier_id = m.quartier_id
FROM (
  SELECT DISTINCT ON (b2.id)
    b2.id AS bien_id,
    q.id  AS quartier_id
  FROM public.biens b2
  JOIN public.quartiers q
    ON q.commune_id = b2.commune_id
   AND position(
         lower(public.unaccent_safe(q.name))
         IN lower(public.unaccent_safe(coalesce(b2.ville_commune, '') || ' ' || coalesce(b2.address, '')))
       ) > 0
  WHERE b2.quartier_id IS NULL
    AND b2.commune_id IS NOT NULL
    AND length(q.name) >= 4
  ORDER BY b2.id, length(q.name) DESC
) m
WHERE b.id = m.bien_id
  AND b.quartier_id IS NULL;


-- ────────────────────────────────────────────────────────────────────────────
-- Contrôle : les biens restés sans commune
-- ────────────────────────────────────────────────────────────────────────────
-- Ceux dont `ville_commune` ne nomme aucune commune connue (par exemple le
-- seul libellé « Abidjan », qui désigne le district) restent à rattacher à la
-- main depuis l'admin. Cette requête les liste.

SELECT
  b.id,
  b.name,
  b.ville_commune,
  b.address
FROM public.biens b
WHERE b.commune_id IS NULL
ORDER BY b.name;
