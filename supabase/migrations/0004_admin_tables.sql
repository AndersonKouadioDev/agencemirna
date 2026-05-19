-- ============================================================================
-- Migration 0004 : tables admin (services, promotions, agents, bien_images)
--                  + RLS + trigger updated_at + seed des 6 services
-- ============================================================================
-- Objectif : créer le schéma pour les CRUD du back-office.
--
-- Conventions :
--   - Tous les UUID PRIMARY KEY DEFAULT gen_random_uuid()
--   - Toutes les tables ont created_at + updated_at (auto via trigger)
--   - Toutes les tables ont is_active (soft-delete)
--   - Toutes les tables ont ordre INT (drag-to-reorder)
--   - RLS : public peut lire les rows actives, admins peuvent tout faire
--   - Convention image : la 1ère par ordre = cover (pas de colonne is_cover)
--
-- À exécuter dans Supabase SQL Editor.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Fonction trigger pour auto-update de updated_at
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. Table : services (les 6 services métier de l'agence)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_description text,
  long_description text,
  icon text,                                  -- nom d'icône lucide-react
  image text,                                 -- URL Supabase Storage
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,  -- array de strings (points clés)
  cta_label text DEFAULT 'En savoir plus',
  cta_url text,
  ordre int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS services_ordre_idx ON public.services(ordre);
CREATE INDEX IF NOT EXISTS services_slug_idx ON public.services(slug);

DROP TRIGGER IF EXISTS services_updated_at ON public.services;
CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read active services" ON public.services;
DROP POLICY IF EXISTS "admins manage services" ON public.services;

CREATE POLICY "public read active services"
  ON public.services FOR SELECT
  USING (is_active);

CREATE POLICY "admins manage services"
  ON public.services FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- 3. Seed : les 6 services métier d'Agence Mirna
-- ----------------------------------------------------------------------------

INSERT INTO public.services (slug, name, short_description, long_description, icon, highlights, cta_label, cta_url, ordre, is_active)
VALUES
  (
    'vente',
    'Vente de biens immobiliers',
    'Vendez votre bien avec un partenaire de confiance, du mandat à la signature.',
    'Agence Mirna vous accompagne à chaque étape de la vente de votre bien : estimation gratuite et personnalisée, mise en valeur professionnelle, diffusion ciblée auprès de notre réseau d''acheteurs qualifiés, négociation et accompagnement jusqu''à la signature chez le notaire.',
    'Home',
    '["Estimation gratuite et personnalisée", "Mise en valeur professionnelle (photos pro)", "Diffusion ciblée à notre fichier d''acheteurs", "Négociation et accompagnement jusqu''à la signature", "Pas de commission sans vente"]'::jsonb,
    'Demander une estimation',
    '/contact_us',
    1,
    true
  ),
  (
    'gestion-immobiliere',
    'Gestion immobilière',
    'Confiez-nous la gestion locative complète de vos biens en toute sérénité.',
    'Notre service de gestion immobilière prend en charge l''ensemble du cycle locatif : recherche et sélection rigoureuse des locataires, rédaction du bail, état des lieux, encaissement des loyers, suivi technique et maintenance, déclarations fiscales. Vous percevez vos revenus sans aucune contrainte.',
    'Building2',
    '["Recherche et sélection rigoureuse des locataires", "Gestion administrative complète (bail, état des lieux, quittances)", "Encaissement et reversement mensuel des loyers", "Suivi technique et coordination des artisans", "Reporting détaillé et accès propriétaire"]'::jsonb,
    'Confier mon bien en gestion',
    '/contact_us',
    2,
    true
  ),
  (
    'location-meublee',
    'Location meublée courte durée',
    'Optimisez la rentabilité de votre bien avec la location meublée tourisme.',
    'Spécialistes de la location meublée à Abidjan, nous transformons vos biens en hébergements à fort rendement : aménagement et décoration clés en main, gestion des annonces multi-plateformes (Airbnb, Booking), accueil des voyageurs, ménage et linge, optimisation tarifaire dynamique.',
    'KeyRound',
    '["Aménagement et décoration clés en main", "Diffusion multi-plateformes (Airbnb, Booking, site Mirna)", "Accueil personnalisé et conciergerie 7j/7", "Ménage, linge, maintenance inclus", "Tarification dynamique pour maximiser le revenu"]'::jsonb,
    'Démarrer mon projet meublé',
    '/contact_us',
    3,
    true
  ),
  (
    'decoration-amenagement',
    'Décoration d''intérieur et aménagement',
    'Donnez une nouvelle vie à vos espaces avec nos décorateurs experts.',
    'Nos décorateurs et architectes d''intérieur conçoivent des espaces qui vous ressemblent : étude de style, plans d''aménagement, sélection des matériaux et du mobilier, coordination des artisans, suivi de chantier jusqu''à la livraison clé en main. Particuliers et professionnels.',
    'Palette',
    '["Étude de style et plans d''aménagement personnalisés", "Sélection mobilier, matériaux et accessoires", "Coordination de tous les corps de métier", "Suivi de chantier et livraison clé en main", "Devis gratuit sous 48h"]'::jsonb,
    'Demander un devis déco',
    '/contact_us',
    4,
    true
  ),
  (
    'construction',
    'Construction',
    'De la conception à la livraison, nous bâtissons vos projets immobiliers.',
    'Agence Mirna pilote vos projets de construction de A à Z : étude de faisabilité, dépôt des permis, choix des entreprises, suivi de chantier et garantie de parfait achèvement. Maisons individuelles, villas, petits collectifs, bureaux.',
    'HardHat',
    '["Étude de faisabilité et chiffrage détaillé", "Dépôt des permis et démarches administratives", "Sélection et coordination des entreprises", "Suivi de chantier hebdomadaire", "Garantie de parfait achèvement"]'::jsonb,
    'Discuter de mon projet',
    '/contact_us',
    5,
    true
  ),
  (
    'promotion-immobiliere',
    'Promotion immobilière',
    'Investissez dans nos programmes neufs sélectionnés à Abidjan.',
    'Découvrez nos programmes neufs en cours et à venir à Abidjan et sa périphérie : appartements en VEFA, résidences sécurisées, biens d''investissement locatif. Visites virtuelles, plans détaillés, prix sous le marché, paiement échelonné, garanties promoteur.',
    'Landmark',
    '["Programmes neufs sélectionnés à Abidjan et alentours", "Plans détaillés et visites virtuelles", "Prix attractifs et paiement échelonné", "Garanties promoteur (livraison, conformité)", "Accompagnement pour le financement bancaire"]'::jsonb,
    'Voir les programmes en cours',
    '/contact_us',
    6,
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. Table : promotions (créas, offres, actualités à publier sur le site)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  title text NOT NULL,
  description text,
  image text NOT NULL,                          -- URL Supabase Storage (cover)
  cta_label text,
  cta_url text,
  starts_at timestamptz,                        -- null = visible dès maintenant
  ends_at timestamptz,                          -- null = jamais expire
  show_on_home boolean NOT NULL DEFAULT false,  -- afficher dans le bandeau home
  is_active boolean NOT NULL DEFAULT true,
  ordre int NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS promotions_ordre_idx ON public.promotions(ordre);
CREATE INDEX IF NOT EXISTS promotions_dates_idx ON public.promotions(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS promotions_home_idx ON public.promotions(show_on_home) WHERE show_on_home = true;

DROP TRIGGER IF EXISTS promotions_updated_at ON public.promotions;
CREATE TRIGGER promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read active promotions" ON public.promotions;
DROP POLICY IF EXISTS "admins manage promotions" ON public.promotions;

-- Lecture publique : active ET (pas de date de début OU début passé) ET (pas de date de fin OU fin future)
CREATE POLICY "public read active promotions"
  ON public.promotions FOR SELECT
  USING (
    is_active
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at > now())
  );

CREATE POLICY "admins manage promotions"
  ON public.promotions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- 5. Table : agents (équipe de l'agence)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  full_name text NOT NULL,
  role text,                                    -- ex: "Responsable gestion locative"
  photo text,                                   -- URL Supabase Storage
  bio text,
  phone text,
  email text,
  whatsapp text,                                -- numéro pour lien wa.me
  specialites text[] NOT NULL DEFAULT '{}',     -- ex: {Vente, Gestion, Location meublée}
  is_active boolean NOT NULL DEFAULT true,
  ordre int NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS agents_ordre_idx ON public.agents(ordre);

DROP TRIGGER IF EXISTS agents_updated_at ON public.agents;
CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read active agents" ON public.agents;
DROP POLICY IF EXISTS "admins manage agents" ON public.agents;

CREATE POLICY "public read active agents"
  ON public.agents FOR SELECT
  USING (is_active);

CREATE POLICY "admins manage agents"
  ON public.agents FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- 6. Table : bien_images (multi-photos par bien, ordonnées)
-- ----------------------------------------------------------------------------
--
-- Convention : la photo avec le plus petit `ordre` est la cover (alignée avec
-- la sémantique de notre <ImageUploader>). Pas de colonne is_cover séparée.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.bien_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  bien_id uuid NOT NULL REFERENCES public.biens(id) ON DELETE CASCADE,
  url text NOT NULL,
  storage_path text,                            -- chemin dans le bucket (pour delete cleanup)
  alt text,
  ordre int NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS bien_images_bien_idx ON public.bien_images(bien_id, ordre);

ALTER TABLE public.bien_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read bien_images" ON public.bien_images;
DROP POLICY IF EXISTS "admins manage bien_images" ON public.bien_images;

CREATE POLICY "public read bien_images"
  ON public.bien_images FOR SELECT
  USING (true);  -- toujours visible (le bien lui-même est public)

CREATE POLICY "admins manage bien_images"
  ON public.bien_images FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- Vérification (à exécuter après pour valider) :
-- ----------------------------------------------------------------------------
-- SELECT slug, name, ordre, is_active FROM public.services ORDER BY ordre;
-- → doit lister les 6 services
--
-- SELECT tablename FROM pg_tables WHERE schemaname='public'
--   AND tablename IN ('services','promotions','agents','bien_images');
-- → doit lister les 4 tables
--
-- SELECT tablename, policyname FROM pg_policies
--   WHERE schemaname='public'
--   AND tablename IN ('services','promotions','agents','bien_images')
--   ORDER BY tablename, policyname;
-- → doit lister 2 policies par table (public read + admins manage)
-- ----------------------------------------------------------------------------
