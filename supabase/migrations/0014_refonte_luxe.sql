-- ============================================================================
-- Migration 0014 : Refonte Luxe (Communes, Annonces, Paramètres, Nettoyage)
-- ============================================================================

-- 1. Nettoyage des tables inutiles
DROP TABLE IF EXISTS public.social_mentions CASCADE;
DROP TABLE IF EXISTS public.videos CASCADE;

-- 2. Renommage Promotions -> Annonces
ALTER TABLE IF EXISTS public.promotions RENAME TO annonces;
-- Renommage des index associés pour garder la cohérence
ALTER INDEX IF EXISTS promotions_pkey RENAME TO annonces_pkey;
ALTER INDEX IF EXISTS promotions_ordre_idx RENAME TO annonces_ordre_idx;
ALTER INDEX IF EXISTS promotions_dates_idx RENAME TO annonces_dates_idx;
ALTER INDEX IF EXISTS promotions_home_idx RENAME TO annonces_home_idx;

-- 3. Nouveaux champs pour les Biens (latitude et longitude existent déjà via 0012)
ALTER TABLE public.biens
  ADD COLUMN IF NOT EXISTS adresse_complete text,
  ADD COLUMN IF NOT EXISTS lien_video text;

-- 4. Création de la table Communes
CREATE TABLE IF NOT EXISTS public.communes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  nom text NOT NULL,
  slug text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  ordre int NOT NULL DEFAULT 0
);

-- Trigger updated_at pour communes
CREATE TRIGGER communes_updated_at
BEFORE UPDATE ON public.communes
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 5. Lier les Quartiers aux Communes
ALTER TABLE public.quartiers
  ADD COLUMN IF NOT EXISTS commune_id uuid REFERENCES public.communes(id) ON DELETE SET NULL;

-- 6. Création de la table Site Settings (Paramètres globaux)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  phone text,
  whatsapp text,
  email text,
  facebook text,
  instagram text,
  linkedin text
);

-- Trigger updated_at pour site_settings
CREATE TRIGGER site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Insertion de la ligne unique par défaut pour les settings
INSERT INTO public.site_settings (phone, whatsapp, email)
VALUES ('+225 00 00 00 00 00', '+225 00 00 00 00 00', 'contact@agencemirna.com')
ON CONFLICT DO NOTHING;

-- Mettre à jour les politiques RLS pour les nouvelles tables
ALTER TABLE public.communes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annonces ENABLE ROW LEVEL SECURITY;

-- Politiques Communes
CREATE POLICY "Les communes sont lisibles par tous" ON public.communes FOR SELECT USING (true);
CREATE POLICY "Modifiables par les admins" ON public.communes FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Politiques Site Settings
CREATE POLICY "Les settings sont lisibles par tous" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Modifiables par les admins" ON public.site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Note: La politique des annonces est héritée de l'ancienne table promotions, on s'assure juste que c'est ok.
