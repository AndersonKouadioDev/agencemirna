-- =============================================================================
-- 0012_biens_geocoords.sql
-- =============================================================================
-- Ajoute les coordonnées géographiques aux biens pour la vue carte sur
-- /properties.
--
-- - latitude  : float8 (degrés décimaux, -90 à +90)
-- - longitude : float8 (degrés décimaux, -180 à +180)
--
-- Nullable car les biens existants n'ont pas de coordonnées. L'admin
-- pourra les renseigner manuellement depuis /admin/biens/[id] via les
-- nouveaux inputs (ou en collant un lien Google Maps qui les extrait).
--
-- Index spatial non créé : volume actuel des biens trop faible pour
-- justifier PostGIS. À ajouter quand on dépassera ~1000 biens.
-- =============================================================================

ALTER TABLE public.biens
  ADD COLUMN IF NOT EXISTS latitude  double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

-- Contraintes de validité (degrees décimaux)
ALTER TABLE public.biens
  DROP CONSTRAINT IF EXISTS biens_latitude_range;
ALTER TABLE public.biens
  ADD CONSTRAINT biens_latitude_range
  CHECK (latitude IS NULL OR (latitude BETWEEN -90 AND 90));

ALTER TABLE public.biens
  DROP CONSTRAINT IF EXISTS biens_longitude_range;
ALTER TABLE public.biens
  ADD CONSTRAINT biens_longitude_range
  CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180));
