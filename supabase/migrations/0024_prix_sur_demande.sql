-- ============================================================================
-- 0024 — « Prix sur demande »
-- ============================================================================
--
-- Quatre biens en vente n'ont aucun montant saisi. La vitrine ne savait pas
-- quoi en faire :
--   • la carte du catalogue masquait le bloc entier, laissant un vide sous le
--     filet de séparation — la carte se lit comme cassée ;
--   • l'encadré de la fiche affichait « PRIX DE VENTE — 0 FCFA », par un repli
--     `bien.prix ?? 0`. Un prix à zéro est pire qu'un prix absent : il annonce
--     un montant, et il est faux.
--
-- Le terme du métier est « Prix sur demande » (on trouve aussi « Nous
-- consulter »). Il est déjà employé sur les cartes d'annonces. Il devient ici
-- une décision explicite de l'agence, cochable à la création du bien : le
-- montant reste confidentiel et se négocie de vive voix.
--
-- Idempotente : rejouable sans effet de bord.
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- 1. Colonne
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.biens
  ADD COLUMN IF NOT EXISTS prix_sur_demande boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.biens.prix_sur_demande IS
  'Le montant ne doit pas être publié : la vitrine affiche « Prix sur demande ». '
  'Prime sur prix et prix_month, qui peuvent rester saisis pour l''usage interne.';


-- ────────────────────────────────────────────────────────────────────────────
-- 2. Pas de reprise — et c'est délibéré
-- ────────────────────────────────────────────────────────────────────────────
-- Il serait tentant de cocher la case sur les biens sans montant. Ce serait un
-- piège : le jour où l'agence saisit enfin le prix de vente de « TERRAIN », la
-- case cochée continuerait de le masquer, sans rien signaler. L'admin
-- chercherait longtemps.
--
-- La vitrine traite donc SÉPARÉMENT les deux situations, et n'a besoin
-- d'aucune écriture ici :
--   • case cochée          -> « Prix sur demande », choix assumé de l'agence ;
--   • aucun montant utile  -> « Prix sur demande » également, faute de mieux —
--     mais le jour où un montant est saisi, il s'affiche aussitôt.
--
-- Un montant à 0 est traité comme absent : personne ne vend à zéro franc, et
-- c'est la saisie vide que l'admin a voulu exprimer.


-- ────────────────────────────────────────────────────────────────────────────
-- 3. Contrôle
-- ────────────────────────────────────────────────────────────────────────────
-- Attendu : les quatre biens en vente sans montant ressortent en « aucun
-- montant saisi ». Ils s'afficheront « Prix sur demande » sans autre action ;
-- coche la case depuis /admin/biens si c'est un choix, saisis le prix sinon.

SELECT
  b.name,
  s.name AS service,
  coalesce(b.prix::text, '—')        AS prix,
  coalesce(b.prix_month::text, '—')  AS prix_mensuel,
  b.prix_sur_demande::text           AS case_cochee,
  CASE
    WHEN b.prix_sur_demande                                        THEN 'sur demande (choix)'
    WHEN coalesce(b.prix, 0) <= 0 AND coalesce(b.prix_month, 0) <= 0 THEN 'aucun montant saisi'
    ELSE 'montant affiché'
  END AS affichage
FROM public.biens b
LEFT JOIN public.services_bien s ON s.id = b.service_bien_id
WHERE b.is_active
ORDER BY affichage, b.name;
