-- ============================================================================
-- 0021 — Complète ce qui manquait à la saisie
-- ============================================================================
--
-- Cette migration ne fait que ce qui se DÉDUIT des données existantes. Tout ce
-- qui demande une décision éditoriale (choix d'une photo, d'un compte social)
-- est laissé en commenté en fin de fichier, à décommenter après relecture.
--
-- Idempotente : rejouable sans effet de bord.
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- 1. Quartiers réellement nommés dans les adresses des biens
-- ────────────────────────────────────────────────────────────────────────────
-- Aucun quartier inventé : seuls ceux que les adresses citent explicitement.
--   « Marcory Zone 4, Rue Alex Fleming »   -> Zone 4
--   « Treichville Zone 3-Abidjan »         -> Zone 3
--   « Cocody angré-Abidjan »               -> Angré
-- Les autres quartiers d'Abidjan sont à créer depuis /admin/geographie, au
-- fur et à mesure des biens.
--
-- NB : `quartiers.image` est NOT NULL, une valeur est donc obligatoire à la
-- création. Les trois URL ci-dessous sont des visuels d'attente, à remplacer
-- par les vraies photos depuis /admin/geographie — contrairement aux types et
-- services (point 9), dont la colonne est nullable et que je laisse vides.

INSERT INTO public.quartiers (name, commune, commune_id, image, tagline, ordre, is_active)
SELECT v.name, c.nom, c.id, v.image, v.tagline, v.ordre, true
FROM (VALUES
  ('Zone 4',  'marcory',     'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800', 'Le quartier d''affaires et de vie',        10),
  ('Zone 3',  'treichville', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800', 'Industrie et logistique portuaire',     20),
  ('Angré',   'cocody',      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800', 'Résidentiel en pleine expansion',        30)
) AS v(name, slug_commune, image, tagline, ordre)
JOIN public.communes c ON c.slug = v.slug_commune
WHERE NOT EXISTS (
  SELECT 1 FROM public.quartiers q
  WHERE lower(public.unaccent_safe(q.name)) = lower(public.unaccent_safe(v.name))
    AND q.commune_id = c.id
);


-- ────────────────────────────────────────────────────────────────────────────
-- 2. Rattachement des biens à ces quartiers
-- ────────────────────────────────────────────────────────────────────────────
-- Le quartier doit appartenir à la commune déjà rattachée au bien, pour ne pas
-- créer d'incohérence entre les deux clés.

UPDATE public.biens b
SET quartier_id = m.quartier_id
FROM (
  SELECT DISTINCT ON (b2.id) b2.id AS bien_id, q.id AS quartier_id
  FROM public.biens b2
  JOIN public.quartiers q ON q.commune_id = b2.commune_id
  WHERE b2.quartier_id IS NULL
    AND b2.commune_id IS NOT NULL
    AND position(
          lower(public.unaccent_safe(q.name))
          IN lower(public.unaccent_safe(coalesce(b2.ville_commune,'') || ' ' || coalesce(b2.address,'')))
        ) > 0
  ORDER BY b2.id, length(q.name) DESC
) m
WHERE b.id = m.bien_id AND b.quartier_id IS NULL;


-- ────────────────────────────────────────────────────────────────────────────
-- 3. Troisième commune sur l'accueil
-- ────────────────────────────────────────────────────────────────────────────
-- La section « Communes phares » affiche trois cartes ; seules Plateau et
-- Marcory étaient cochées, laissant un trou dans la grille. Cocody a déjà son
-- image et son accroche, et porte des biens : c'est la seule à pouvoir
-- compléter la rangée sans autre saisie.

UPDATE public.communes
SET is_featured = true, updated_at = now()
WHERE slug = 'cocody' AND image IS NOT NULL AND NOT is_featured;


-- ────────────────────────────────────────────────────────────────────────────
-- 4. Coordonnées de l'agence
-- ────────────────────────────────────────────────────────────────────────────
-- La ligne semée par la migration 0014 porte encore « +225 00 00 00 00 00 ».
-- Le code écarte volontairement ce numéro de démonstration : tant qu'il est là,
-- AUCUN téléphone ne s'affiche sur le site et les liens WhatsApp retombent sur
-- la constante du projet.
--
-- Les valeurs posées ici sont celles que le site affichait en dur avant que
-- `site_settings` n'existe : elles ne sont donc pas inventées. Vérifie-les
-- quand même dans /admin/parametres.

UPDATE public.site_settings
SET
  phone = '+225 01 43 483 131',
  -- Format wa.me : 225 suivi des 10 chiffres, sans espace ni signe.
  whatsapp = '2250143483131',
  updated_at = now()
WHERE phone IS NULL
   OR whatsapp IS NULL
   OR regexp_replace(coalesce(phone, ''), '\D', '', 'g')    ~ '^(225)?0+$'
   OR regexp_replace(coalesce(whatsapp, ''), '\D', '', 'g') ~ '^(225)?0+$';


-- ────────────────────────────────────────────────────────────────────────────
-- 5. Contrôle
-- ────────────────────────────────────────────────────────────────────────────

SELECT 'biens sans commune'  AS controle, count(*)::text AS valeur FROM public.biens WHERE is_active AND commune_id IS NULL
UNION ALL
SELECT 'biens sans quartier', count(*)::text FROM public.biens WHERE is_active AND quartier_id IS NULL
UNION ALL
SELECT 'quartiers',           count(*)::text FROM public.quartiers
UNION ALL
SELECT 'communes a la une',   count(*)::text FROM public.communes WHERE is_featured AND is_active
UNION ALL
SELECT 'telephone',           coalesce(phone, 'NULL') FROM public.site_settings
UNION ALL
SELECT 'reseaux sociaux',     concat_ws(' / ', facebook, instagram, linkedin) FROM public.site_settings;


-- ============================================================================
-- À DÉCOMMENTER APRÈS VÉRIFICATION — je ne peux pas trancher à ta place
-- ============================================================================

-- ── 6. La commune du bien « Dakar » ────────────────────────────────────────
-- Son seul indice est « Rue Paul Langevin, Abidjan » : la ville n'est pas une
-- commune et je ne devine pas la rue. Tant qu'il n'a pas de commune, ce bien
-- n'apparaît dans aucun filtre de lieu. Remplace le slug par le bon.
--
-- UPDATE public.biens b
-- SET commune_id = (SELECT id FROM public.communes WHERE slug = 'marcory')
-- WHERE b.name = 'Dakar' AND b.commune_id IS NULL;


-- ── 7. Réseaux sociaux ─────────────────────────────────────────────────────
-- Les trois colonnes sont NULL, donc les icônes du pied de page ne
-- s'affichent pas. Les adresses ci-dessous sont celles que le code portait en
-- repli : je n'ai aucun moyen de vérifier que ces comptes existent. Corrige-les
-- avant de décommenter — une icône vers un compte inexistant est pire
-- qu'une icône absente.
--
-- UPDATE public.site_settings
-- SET facebook  = 'https://facebook.com/agencemirna',
--     instagram = 'https://instagram.com/agencemirna',
--     linkedin  = 'https://linkedin.com/company/agencemirna',
--     updated_at = now();


-- ── 8. Adresse électronique ────────────────────────────────────────────────
-- La base porte « contact@agencemirna.com », le code affichait
-- « info@agencemirna.com ». Les deux sont plausibles, je ne tranche pas.
--
-- UPDATE public.site_settings SET email = 'info@agencemirna.com', updated_at = now();


-- ── 9. Visuels des types et services ───────────────────────────────────────
-- Volontairement NON seedés. Le méga-menu a déjà ses propres images de repli
-- par famille : une colonne vide s'affiche correctement. Y écrire des photos
-- de banque d'images donnerait l'illusion d'un choix délibéré, et il faudrait
-- ensuite les retrouver pour les remplacer. À faire depuis /admin/taxonomie,
-- avec les vraies photos de l'agence.
