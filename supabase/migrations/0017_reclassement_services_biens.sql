-- ============================================================================
-- 0017 — Reclassement des biens sous un service précis
-- ============================================================================
--
-- Les 8 biens en location étaient rattachés au service générique « Location »,
-- pendant que « Location nue » et « Location meublée longue durée » restaient
-- vides. Conséquence : le filtre « meublé » du menu et le CTA « Voir nos
-- meublés » ne renvoyaient jamais rien.
--
-- Les 8 portent tous la catégorie « Meublé » : aucun ne relève de la location
-- nue. On les bascule donc vers « Location meublée longue durée », le seul
-- libellé meublé de la taxonomie.
--
-- RÉSERVE, à arbitrer : ces biens ont un `prix` de 50 000 à 100 000 FCFA et un
-- `prix_month` de 1 000 000 à 2 500 000, soit un rapport d'environ 20 à 25.
-- `prix` est donc un tarif à la nuitée, et la fiche publique l'affiche bien
-- « /jour ». Le libellé « longue durée » sous-décrit cette offre, qui est en
-- réalité louable à la nuit comme au mois. Voir la section commentée en fin de
-- fichier pour renommer le service si tu préfères « Location meublée ».
--
-- Idempotente : ne touche que les biens encore rattachés à « Location ».
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- 1. État avant reclassement
-- ────────────────────────────────────────────────────────────────────────────

SELECT
  'AVANT' AS etape,
  s.name  AS service,
  count(*) AS biens
FROM public.biens b
JOIN public.services_bien s ON s.id = b.service_bien_id
WHERE b.is_active
GROUP BY s.name
ORDER BY biens DESC;


-- ────────────────────────────────────────────────────────────────────────────
-- 2. Les meublés passent sous « Location meublée longue durée »
-- ────────────────────────────────────────────────────────────────────────────

UPDATE public.biens b
SET service_bien_id = (
  SELECT id FROM public.services_bien
  WHERE name = 'Location meublée longue durée'
)
FROM public.services_bien s, public.categories_bien c
WHERE b.service_bien_id = s.id
  AND b.categorie_bien_id = c.id
  AND s.name = 'Location'
  AND c.name IN ('Meublé', 'Semi-meublé');


-- ────────────────────────────────────────────────────────────────────────────
-- 3. Les non meublés passent sous « Location nue »
-- ────────────────────────────────────────────────────────────────────────────
-- Aucun bien ne relève de ce cas aujourd'hui ; la règle est posée pour que le
-- script reste juste si de nouveaux biens sont saisis avant son exécution.

UPDATE public.biens b
SET service_bien_id = (
  SELECT id FROM public.services_bien WHERE name = 'Location nue'
)
FROM public.services_bien s, public.categories_bien c
WHERE b.service_bien_id = s.id
  AND b.categorie_bien_id = c.id
  AND s.name = 'Location'
  AND c.name = 'Non meublé';


-- ────────────────────────────────────────────────────────────────────────────
-- 4. Contrôle : ce qui reste sous « Location »
-- ────────────────────────────────────────────────────────────────────────────
-- Un bien sans catégorie d'ameublement ne peut pas être reclassé
-- automatiquement : il faut lui en choisir une depuis l'admin.

SELECT
  'A TRAITER A LA MAIN' AS etape,
  b.id,
  b.name,
  b.ville_commune
FROM public.biens b
JOIN public.services_bien s ON s.id = b.service_bien_id
WHERE s.name = 'Location'
ORDER BY b.name;


-- ────────────────────────────────────────────────────────────────────────────
-- 5. État après reclassement
-- ────────────────────────────────────────────────────────────────────────────

SELECT
  'APRES' AS etape,
  s.name  AS service,
  count(*) AS biens
FROM public.biens b
JOIN public.services_bien s ON s.id = b.service_bien_id
WHERE b.is_active
GROUP BY s.name
ORDER BY biens DESC;


-- ============================================================================
-- OPTIONNEL — renommer le service pour qu'il colle à l'offre réelle
-- ============================================================================
-- « Location meublée longue durée » sous-décrit des biens loués à la nuitée.
-- « Location meublée » couvre les deux durées.
--
-- ATTENTION : le libellé sert de valeur de filtre dans les URL (?service=…).
-- Le renommer suppose de mettre à jour les liens en dur de
--   components/landing/services-bento.tsx
--   components/landing/services-showcase.tsx
--   components/landing/marquee-bar.tsx
--   app/(marketing)/services/location-meublee/page.tsx
-- Décommente seulement si tu me demandes de faire suivre le code.
--
-- UPDATE public.services_bien
-- SET name = 'Location meublée'
-- WHERE name = 'Location meublée longue durée';
