-- =============================================================================
-- 0006_taxonomy_quartiers.sql
-- =============================================================================
-- 1. Étend la taxonomie des biens (types_bien + services_bien) pour couvrir
--    les standards du marché immobilier ivoirien (référence : Realtyna, IDX,
--    SeLoger, AfricaProperty, etc.).
-- 2. Crée la table `quartiers` pour rendre la section "Nos quartiers"
--    configurable depuis l'admin (au lieu de hardcodé).
-- =============================================================================

-- ─── 1. TYPES DE BIEN (extension) ───────────────────────────────────────────
-- ON CONFLICT pour idempotence : ré-exécution safe si déjà inséré
INSERT INTO public.types_bien (name) VALUES
  ('Villa'),
  ('Duplex'),
  ('Maison'),
  ('Terrain'),
  ('Entrepôt'),
  ('Local commercial'),
  ('Bureau'),
  ('Immeuble')
ON CONFLICT (name) DO NOTHING;

-- ─── 2. SERVICES / TYPES DE TRANSACTION (extension) ────────────────────────
-- Note : on garde l'existant (Vente de biens immobiliers, Location meublée
-- courte durée, etc.) et on ajoute les manquants pour avoir une grille
-- complète à la 'IDX' du marché.
INSERT INTO public.services_bien (name) VALUES
  ('Vente'),
  ('Location nue'),
  ('Location meublée longue durée'),
  ('Bail commercial'),
  ('Bail à usage d''habitation'),
  ('Gestion locative')
ON CONFLICT (name) DO NOTHING;

-- ─── 3. CATÉGORIES (caractéristique meublé/non meublé) ─────────────────────
INSERT INTO public.categories_bien (name) VALUES
  ('Meublé'),
  ('Non meublé'),
  ('Semi-meublé')
ON CONFLICT (name) DO NOTHING;

-- ─── 4. TABLE QUARTIERS ────────────────────────────────────────────────────
-- Configurable via /admin/quartiers (CRUD à venir).
-- Sert à peupler la section "Nos quartiers" de la home + dropdown localisation.
CREATE TABLE IF NOT EXISTS public.quartiers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identité
  name        text NOT NULL,                  -- Cocody, Plateau, Marcory, Riviera...
  commune     text NOT NULL,                  -- Abidjan (ou autre ville)
  badge       text,                           -- Premium, Business, Lifestyle, Familles...
  tagline     text,                           -- "Le prestige résidentiel"
  description text,                           -- Texte long
  -- Visuel
  image       text NOT NULL,                  -- Path /images/... ou URL Storage
  -- Lien de recherche (préfiltre /properties?q=<value>)
  search_query text,                          -- Si null → utilise `name`
  -- Tri / publication
  ordre       integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false, -- Mis en avant sur la home
  -- Timestamps
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quartiers_is_active_idx ON public.quartiers (is_active);
CREATE INDEX IF NOT EXISTS quartiers_ordre_idx     ON public.quartiers (ordre);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.trg_quartiers_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS quartiers_updated_at ON public.quartiers;
CREATE TRIGGER quartiers_updated_at
  BEFORE UPDATE ON public.quartiers
  FOR EACH ROW EXECUTE FUNCTION public.trg_quartiers_updated_at();

-- ─── 5. RLS ─────────────────────────────────────────────────────────────────
ALTER TABLE public.quartiers ENABLE ROW LEVEL SECURITY;

-- Lecture publique des quartiers actifs uniquement
DROP POLICY IF EXISTS "public read active quartiers" ON public.quartiers;
CREATE POLICY "public read active quartiers"
  ON public.quartiers FOR SELECT
  USING (is_active = true);

-- Admin : tout permis (utilise la fonction is_admin() définie dans 0001)
DROP POLICY IF EXISTS "admin all quartiers" ON public.quartiers;
CREATE POLICY "admin all quartiers"
  ON public.quartiers FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── 6. SEED — 4 quartiers initiaux (configurables ensuite via admin) ──────
INSERT INTO public.quartiers
  (name, commune, badge, tagline, description, image, search_query, ordre, is_active, is_featured)
VALUES
  (
    'Cocody', 'Abidjan', 'Premium',
    'Le prestige résidentiel',
    'Riviera, Angré, II Plateaux : ambassades, lycées internationaux, villas avec jardin. La référence haut de gamme d''Abidjan.',
    '/images/biens/bien6.jpg',
    'Cocody', 1, true, true
  ),
  (
    'Plateau', 'Abidjan', 'Business',
    'Le cœur d''affaires',
    'CBD d''Abidjan, tours modernes, sièges sociaux et appartements haut de gamme à proximité directe des bureaux.',
    '/images/biens/bien1.jpg',
    'Plateau', 2, true, true
  ),
  (
    'Marcory', 'Abidjan', 'Lifestyle',
    'L''art de vivre moderne',
    'Zone 4, résidentielle, restaurants tendances et accès rapide au reste de la ville. Le bon compromis vie + travail.',
    '/images/biens/bien10.jpg',
    'Marcory', 3, true, true
  ),
  (
    'Riviera', 'Abidjan', 'Familles',
    'Le calme à 15 min du centre',
    'Espaces verts, résidences sécurisées, idéal pour les familles et les expats à la recherche de tranquillité.',
    '/images/biens/bien3.jpg',
    'Riviera', 4, true, true
  )
ON CONFLICT DO NOTHING;
