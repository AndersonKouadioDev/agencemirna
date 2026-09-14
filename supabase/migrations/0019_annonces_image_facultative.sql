-- ============================================================================
-- 0019 — L'image d'une annonce devient facultative
-- ============================================================================
--
-- `annonces.image` est NOT NULL depuis la migration 0004, du temps où une
-- annonce était une affiche autonome. Depuis la 0015, elle pointe vers un bien
-- et reprend sa photo à défaut de visuel propre : le formulaire annonce
-- l'image comme facultative et envoie `null`, que Postgres refuse (23502).
--
-- Conséquence : enregistrer une annonce sans visuel échoue, et à l'édition
-- l'échec emporte toute la mise à jour — les autres champs saisis sont perdus.
--
-- Le repli est déjà implémenté de bout en bout côté lecture
-- (annonce-card.tsx, annonces-grid.tsx) : seule la contrainte SQL empêchait
-- d'y arriver.
-- ============================================================================

ALTER TABLE public.annonces ALTER COLUMN image DROP NOT NULL;

COMMENT ON COLUMN public.annonces.image IS
  'Visuel propre à l''annonce. Laissé vide, la photo du bien lié est utilisée.';

-- Contrôle
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'annonces' AND column_name = 'image';
