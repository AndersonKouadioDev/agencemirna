-- =============================================================================
-- 0009_seed_posters_mirna.sql
-- =============================================================================
-- Seed des 4 posters/affiches marketing fournies par Agence Mirna :
--   1. Devenez Propriétaire d'un Terrain (Titre Foncier / Approbation / ACD)
--   2. Colombe 5 (Cocody Abatta, vue Lagune)
--   3. Colombe 6 (Angré Nouveau CHU)
--   4. Colombe 7 (Riviera 3 Palmeraie, Akouedo)
--
-- PRÉREQUIS : déposer les 4 images dans /public/images/posters/ avec
-- exactement ces noms de fichiers :
--   /public/images/posters/terrain.jpg
--   /public/images/posters/colombe-5.jpg
--   /public/images/posters/colombe-6.jpg
--   /public/images/posters/colombe-7.jpg
--
-- Les promotions seront affichées :
--   - dans le PostersCarousel sous le hero (format 4:5)
--   - sur /promotions (page dédiée)
--   - dans le marquee top (titre uniquement)
--
-- Idempotent : WHERE NOT EXISTS sur le titre.
-- =============================================================================

INSERT INTO public.promotions
  (title, description, image, cta_label, cta_url, show_on_home, is_active, ordre)
SELECT v.title, v.description, v.image, v.cta_label, v.cta_url, v.show_on_home, v.is_active, v.ordre
FROM (VALUES
  (
    'Devenez propriétaire d''un terrain dans le Grand Abidjan',
    'Vous rêvez de bâtir la maison de vos rêves, de réaliser un investissement locatif rentable ou de vous constituer un patrimoine foncier sécurisé ? Mirna Immobilier vous accompagne sur 3 typologies : Titre Foncier, Approbation, ACD. Le Grand Abidjan s''étend à une vitesse incroyable et la valeur du foncier ne cesse de grimper. Attendre, c''est payer plus cher demain.',
    '/images/posters/terrain.jpg',
    'Plus d''infos',
    '/contact_us',
    true, true, 1
  ),
  (
    'Colombe 5 : Immeuble Haut Standing à Cocody Abatta',
    'Programme haut standing avec vue sur Lagune. F4 (170m²) à 128 000 000 F CFA, F5 (400m²) Penthouse à 338 000 000 F CFA. Apport initial 20M à 50M, loyer mensuel 1,5M à 4M sur 5 ans, payable sur 6 ans. Livraison décembre 2026. Titre de Propriété / ACD, transaction devant notaire.',
    '/images/posters/colombe-5.jpg',
    'Découvrir le programme',
    '/contact_us',
    true, true, 2
  ),
  (
    'Colombe 6 : Appartements Haut Standing à Angré Nouveau CHU',
    'Projet immeuble R+7 avec Penthouse et Parking Interne. F2 (89m²) à partir de 65 000 000 F CFA, F3 (100m²) à 77M, F3 (110m²) à 86M. Apport initial 20M, loyer 750k à 1,1M sur 5 ans. Livraison juin 2027. Titre de Propriété / ACD, transaction devant notaire.',
    '/images/posters/colombe-6.jpg',
    'Découvrir le programme',
    '/contact_us',
    true, true, 3
  ),
  (
    'Colombe 7 : Appartements Haut Standing à Riviera 3 Palmeraie',
    'Projet immeuble R+4 avec Penthouse et Parking Interne à Riviera 3, Palmeraie (Akouedo). F3 (100m²) à 74M, F3 (125m²) à 80M, F4 (160m²) à 103M. Apport initial 20M à 25M, loyer 900k à 1,3M sur 5 ans. Livraison juin 2027. Titre de Propriété / ACD, transaction devant notaire.',
    '/images/posters/colombe-7.jpg',
    'Découvrir le programme',
    '/contact_us',
    true, true, 4
  )
) AS v(title, description, image, cta_label, cta_url, show_on_home, is_active, ordre)
WHERE NOT EXISTS (
  SELECT 1 FROM public.promotions p WHERE p.title = v.title
);

-- Note : show_on_home=true sur toutes les promos affichera la première
-- (par ordre) dans le HomePromoBanner. Pour n'en mettre qu'une seule
-- en avant, désactivez show_on_home sur les autres via /admin/promotions.
