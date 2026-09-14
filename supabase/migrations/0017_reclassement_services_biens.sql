-- ============================================================================
-- 0017 — Services de bien : Vente, Gestion locative, Location meublée,
--        Construction
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
-- Cible : quatre services, alignés sur les prestations réelles de l'agence.
--
--   · « Location meublée longue durée » est renommée « Location meublée ».
--     Le qualificatif sous-décrivait l'offre : ces biens affichent 50 000 à
--     100 000 FCFA pour un prix mensuel de 1 à 2,5 M, soit un tarif à la
--     nuitée. « Location meublée » couvre les deux durées.
--
--   · « Construction » est créée : elle n'existait pas en base alors que
--     l'agence propose la prestation et qu'une page vitrine lui est dédiée.
--
--   · Les 8 biens en « Location », tous de catégorie « Meublé », basculent
--     vers « Location meublée ».
--
--   · « Location », « Location nue », « Bail commercial » et « Bail à usage
--     d'habitation » sortent de la taxonomie une fois vidées.
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
-- 2. Renommage et création
-- ────────────────────────────────────────────────────────────────────────────
-- Le renommage vient avant le reclassement, pour que l'étape suivante vise
-- directement le libellé final.

UPDATE public.services_bien
SET name = 'Location meublée'
WHERE name = 'Location meublée longue durée';

INSERT INTO public.services_bien (name)
SELECT 'Construction'
WHERE NOT EXISTS (
  SELECT 1 FROM public.services_bien WHERE name = 'Construction'
);


-- ────────────────────────────────────────────────────────────────────────────
-- 3. Les biens meublés passent sous « Location meublée »
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
-- 4. Les biens en location restants suivent, quelle que soit leur catégorie
-- ────────────────────────────────────────────────────────────────────────────
-- La cible ne conserve qu'un seul service de location. Un bien resté sous un
-- libellé supprimé deviendrait invisible de tout filtre : on le rattache donc
-- à « Location meublée » plutôt que de le laisser orphelin. Les biens
-- concernés sont listés à l'étape 6 pour vérification.

UPDATE public.biens b
SET service_bien_id = (
  SELECT id FROM public.services_bien WHERE name = 'Location meublée'
)
FROM public.services_bien s
WHERE b.service_bien_id = s.id
  AND s.name IN ('Location', 'Location nue', 'Bail à usage d''habitation');


-- ────────────────────────────────────────────────────────────────────────────
-- 5. Retrait des libellés hors cible
-- ────────────────────────────────────────────────────────────────────────────
-- DELETE conditionné à l'absence de bien référençant la ligne : si un bien y
-- était resté rattaché, la ligne est conservée plutôt que de faire échouer la
-- migration sur la clé étrangère.

DELETE FROM public.services_bien s
WHERE s.name IN (
    'Location',
    'Location nue',
    'Bail commercial',
    'Bail à usage d''habitation'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.biens b WHERE b.service_bien_id = s.id
  );


-- ────────────────────────────────────────────────────────────────────────────
-- 6. Contrôle : biens reclassés sans catégorie d'ameublement
-- ────────────────────────────────────────────────────────────────────────────
-- Ils sont passés sous « Location meublée » par l'étape 4 sans que leur
-- catégorie le confirme : à vérifier depuis l'admin.

SELECT 'A VERIFIER' AS etape, b.id, b.name, b.ville_commune
FROM public.biens b
JOIN public.services_bien s ON s.id = b.service_bien_id
WHERE s.name = 'Location meublée'
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
