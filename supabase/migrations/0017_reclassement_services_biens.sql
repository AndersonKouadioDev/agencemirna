-- ============================================================================
-- 0017 — Taxonomie des services de bien : Location et Location meublée
-- ============================================================================
--
-- La table comptait sept services pour deux réellement utilisés :
--   1 Location ......................  8 biens
--   2 Vente .........................  4 biens
--   3 Location nue ..................  0
--   4 Location meublée longue durée .  0
--   5 Bail commercial ...............  0
--   6 Bail à usage d'habitation .....  0
--   7 Gestion locative ..............  0
--
-- Cible retenue : Location, Location meublée, Vente.
--
--   · « Location meublée longue durée » est renommée « Location meublée ».
--     Le qualificatif « longue durée » sous-décrivait l'offre : ces biens ont
--     un prix de 50 000 à 100 000 FCFA pour un prix mensuel de 1 à 2,5 M, soit
--     un tarif à la nuitée. « Location meublée » couvre les deux durées.
--
--   · Les 8 biens en « Location » portent tous la catégorie « Meublé » : ils
--     basculent vers « Location meublée ». « Location » reste en place pour
--     les biens non meublés à venir.
--
--   · « Location nue » et « Bail à usage d'habitation » sont des synonymes
--     stricts de « Location » : on les supprime. Aucun bien ne les référence.
--
-- « Bail commercial » et « Gestion locative » ne sont pas des synonymes de
-- Location : ils sont laissés en place, mais restent sans aucun bien. Voir la
-- section commentée en fin de fichier pour les retirer aussi.
--
-- Idempotente : rejouable sans effet de bord.
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- 1. État avant
-- ────────────────────────────────────────────────────────────────────────────

SELECT 'AVANT' AS etape, s.id, s.name,
       count(b.id) FILTER (WHERE b.is_active) AS biens_actifs
FROM public.services_bien s
LEFT JOIN public.biens b ON b.service_bien_id = s.id
GROUP BY s.id, s.name
ORDER BY s.id;


-- ────────────────────────────────────────────────────────────────────────────
-- 2. Renommage
-- ────────────────────────────────────────────────────────────────────────────
-- Fait avant le reclassement pour que l'étape suivante vise le libellé final.

UPDATE public.services_bien
SET name = 'Location meublée'
WHERE name = 'Location meublée longue durée';


-- ────────────────────────────────────────────────────────────────────────────
-- 3. Les meublés passent sous « Location meublée »
-- ────────────────────────────────────────────────────────────────────────────

UPDATE public.biens b
SET service_bien_id = (
  SELECT id FROM public.services_bien WHERE name = 'Location meublée'
)
FROM public.services_bien s, public.categories_bien c
WHERE b.service_bien_id = s.id
  AND b.categorie_bien_id = c.id
  AND s.name IN ('Location', 'Location nue', 'Bail à usage d''habitation')
  AND c.name IN ('Meublé', 'Semi-meublé');


-- ────────────────────────────────────────────────────────────────────────────
-- 4. Les non meublés se regroupent sous « Location »
-- ────────────────────────────────────────────────────────────────────────────
-- Aucun bien ne relève de ce cas aujourd'hui ; la règle est posée pour que le
-- script reste juste si des biens sont saisis avant son exécution.

UPDATE public.biens b
SET service_bien_id = (
  SELECT id FROM public.services_bien WHERE name = 'Location'
)
FROM public.services_bien s
WHERE b.service_bien_id = s.id
  AND s.name IN ('Location nue', 'Bail à usage d''habitation');


-- ────────────────────────────────────────────────────────────────────────────
-- 5. Suppression des synonymes devenus vides
-- ────────────────────────────────────────────────────────────────────────────
-- Le DELETE est conditionné à l'absence de bien référençant la ligne : si un
-- bien y est resté rattaché, la ligne est conservée plutôt que de faire
-- échouer la migration sur la clé étrangère.

DELETE FROM public.services_bien s
WHERE s.name IN ('Location nue', 'Bail à usage d''habitation')
  AND NOT EXISTS (
    SELECT 1 FROM public.biens b WHERE b.service_bien_id = s.id
  );


-- ────────────────────────────────────────────────────────────────────────────
-- 6. Contrôle : biens sans catégorie d'ameublement
-- ────────────────────────────────────────────────────────────────────────────
-- Un bien en location sans catégorie ne peut pas être reclassé
-- automatiquement : il faut lui en choisir une depuis l'admin.

SELECT 'A TRAITER A LA MAIN' AS etape, b.id, b.name, b.ville_commune
FROM public.biens b
JOIN public.services_bien s ON s.id = b.service_bien_id
WHERE s.name = 'Location'
  AND b.categorie_bien_id IS NULL
ORDER BY b.name;


-- ────────────────────────────────────────────────────────────────────────────
-- 7. État après
-- ────────────────────────────────────────────────────────────────────────────

SELECT 'APRES' AS etape, s.id, s.name,
       count(b.id) FILTER (WHERE b.is_active) AS biens_actifs
FROM public.services_bien s
LEFT JOIN public.biens b ON b.service_bien_id = s.id
GROUP BY s.id, s.name
ORDER BY s.id;


-- ============================================================================
-- OPTIONNEL — ne garder que les trois services de la cible
-- ============================================================================
-- « Bail commercial » et « Gestion locative » restent sans aucun bien. Ils ne
-- sont pas des synonymes de Location, je ne les supprime donc pas d'office.
-- Décommente si tu veux une taxonomie strictement réduite à trois entrées.
--
-- DELETE FROM public.services_bien s
-- WHERE s.name IN ('Bail commercial', 'Gestion locative')
--   AND NOT EXISTS (SELECT 1 FROM public.biens b WHERE b.service_bien_id = s.id);
