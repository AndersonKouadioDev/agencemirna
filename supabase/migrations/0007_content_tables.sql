-- =============================================================================
-- 0007_content_tables.sql
-- =============================================================================
-- Migre les contenus jusqu'ici hardcodés en composants React vers de vraies
-- tables Supabase pilotables depuis l'admin.
--
-- Tables créées :
--   1. testimonials      : témoignages clients (carousel home)
--   2. articles          : articles éditoriaux (blog "Le marché immobilier")
--   3. faqs              : questions fréquentes (accordion)
--   4. social_mentions   : mentions Facebook / Instagram / Google
--
-- Toutes les tables suivent le même pattern :
--   - RLS public read si is_active = true
--   - RLS admin full CRUD via is_admin()
--   - Champ ordre pour tri manuel
--   - Trigger updated_at
--   - Seed du contenu actuellement en dur dans les composants
-- =============================================================================


-- ─── 1. TESTIMONIALS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.testimonials (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote             text NOT NULL,
  author_name       text NOT NULL,
  author_role       text,
  avatar_initials   text,
  rating            int DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  ordre             int NOT NULL DEFAULT 0,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS testimonials_is_active_idx ON public.testimonials (is_active);
CREATE INDEX IF NOT EXISTS testimonials_ordre_idx     ON public.testimonials (ordre);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read active testimonials" ON public.testimonials;
CREATE POLICY "public read active testimonials"
  ON public.testimonials FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "admin all testimonials" ON public.testimonials;
CREATE POLICY "admin all testimonials"
  ON public.testimonials FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ─── 2. ARTICLES (blog) ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.articles (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text NOT NULL UNIQUE,
  title             text NOT NULL,
  excerpt           text,
  content_md        text,
  image             text NOT NULL,
  category          text,
  read_time_minutes int DEFAULT 5,
  published_at      timestamptz NOT NULL DEFAULT now(),
  ordre             int NOT NULL DEFAULT 0,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS articles_is_active_idx    ON public.articles (is_active);
CREATE INDEX IF NOT EXISTS articles_published_at_idx ON public.articles (published_at DESC);
CREATE INDEX IF NOT EXISTS articles_slug_idx         ON public.articles (slug);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read active articles" ON public.articles;
CREATE POLICY "public read active articles"
  ON public.articles FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "admin all articles" ON public.articles;
CREATE POLICY "admin all articles"
  ON public.articles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ─── 3. FAQS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.faqs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question    text NOT NULL,
  answer      text NOT NULL,
  ordre       int NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS faqs_is_active_idx ON public.faqs (is_active);
CREATE INDEX IF NOT EXISTS faqs_ordre_idx     ON public.faqs (ordre);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read active faqs" ON public.faqs;
CREATE POLICY "public read active faqs"
  ON public.faqs FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "admin all faqs" ON public.faqs;
CREATE POLICY "admin all faqs"
  ON public.faqs FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ─── 4. SOCIAL_MENTIONS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.social_mentions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  network       text NOT NULL CHECK (network IN ('facebook', 'instagram', 'google', 'linkedin', 'twitter', 'youtube')),
  author_name   text NOT NULL,
  author_handle text,
  text          text NOT NULL,
  date_label    text,
  likes         int,
  rating        int CHECK (rating BETWEEN 1 AND 5),
  ordre         int NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS social_mentions_is_active_idx ON public.social_mentions (is_active);
CREATE INDEX IF NOT EXISTS social_mentions_ordre_idx     ON public.social_mentions (ordre);

ALTER TABLE public.social_mentions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read active social_mentions" ON public.social_mentions;
CREATE POLICY "public read active social_mentions"
  ON public.social_mentions FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "admin all social_mentions" ON public.social_mentions;
CREATE POLICY "admin all social_mentions"
  ON public.social_mentions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ─── TRIGGERS updated_at (factorisé) ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS testimonials_updated_at ON public.testimonials;
CREATE TRIGGER testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();

DROP TRIGGER IF EXISTS articles_updated_at ON public.articles;
CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();

DROP TRIGGER IF EXISTS faqs_updated_at ON public.faqs;
CREATE TRIGGER faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();

DROP TRIGGER IF EXISTS social_mentions_updated_at ON public.social_mentions;
CREATE TRIGGER social_mentions_updated_at
  BEFORE UPDATE ON public.social_mentions
  FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();


-- ─── SEEDS (contenus actuellement hardcodés dans les composants) ───────────

-- Testimonials (depuis testimonials-section.tsx)
-- Pattern WHERE NOT EXISTS sur author_name pour idempotence à la ré-exécution.
INSERT INTO public.testimonials
  (quote, author_name, author_role, avatar_initials, rating, ordre)
SELECT v.quote, v.author_name, v.author_role, v.avatar_initials, v.rating, v.ordre
FROM (VALUES
  (
    'L''Agence Mirna a géré la location de mon appartement à Marcory de A à Z. Trouvaille de locataires sérieux en moins de 2 semaines, état des lieux digital, virement à date fixe. Je recommande sans hésiter.',
    'Aïcha K.', 'Propriétaire bailleur · Marcory Zone 4', 'AK', 5, 1
  ),
  (
    'Expat français récemment muté à Abidjan, j''avais besoin d''un studio meublé clé en main. Mirna m''a trouvé un bien à Cocody en 4 jours, visite virtuelle, contrat signé à distance. Service vraiment premium.',
    'Thomas R.', 'Directeur Commercial · Expatrié', 'TR', 5, 2
  ),
  (
    'J''investis dans l''immo résidentiel depuis 5 ans. Mirna est la seule agence d''Abidjan qui m''a présenté un dossier complet avec rentabilité brute, charges, comparables. Du sérieux.',
    'Yves M.', 'Investisseur · Plateau-Abidjan', 'YM', 5, 3
  )
) AS v(quote, author_name, author_role, avatar_initials, rating, ordre)
WHERE NOT EXISTS (
  SELECT 1 FROM public.testimonials t WHERE t.author_name = v.author_name
);

-- Articles (depuis blog-section.tsx)
-- Pattern WHERE NOT EXISTS sur slug pour idempotence.
INSERT INTO public.articles
  (slug, title, excerpt, image, category, read_time_minutes, published_at, ordre)
SELECT v.slug, v.title, v.excerpt, v.image, v.category, v.read_time_minutes, v.published_at::timestamptz, v.ordre
FROM (VALUES
  (
    'estimer-prix-bien-abidjan-2026',
    'Comment estimer le juste prix de votre bien à Abidjan en 2026',
    'Méthode pas-à-pas pour fixer un prix de vente ou de location réaliste, basée sur les comparables, l''état du bien et la dynamique du quartier.',
    '/images/biens/bien15.jpg',
    'Guide propriétaire', 6, '2026-05-12', 1
  ),
  (
    'top-5-quartiers-investir-abidjan',
    'Top 5 des quartiers où investir à Abidjan cette année',
    'De Cocody Riviera à Marcory Zone 4 en passant par Bingerville, notre classement des zones avec le meilleur potentiel de plus-value.',
    '/images/biens/bien21.jpg',
    'Investissement', 8, '2026-04-28', 2
  ),
  (
    'location-meublee-vs-vide-cote-ivoire',
    'Location meublée vs vide : quelle stratégie en Côte d''Ivoire ?',
    'Fiscalité, rentabilité, profil de locataire, charges récurrentes : on compare les deux modèles pour vous aider à choisir.',
    '/images/biens/bien8.jpg',
    'Stratégie', 5, '2026-04-15', 3
  )
) AS v(slug, title, excerpt, image, category, read_time_minutes, published_at, ordre)
WHERE NOT EXISTS (
  SELECT 1 FROM public.articles a WHERE a.slug = v.slug
);

-- FAQs (depuis faq-section.tsx)
-- Pattern WHERE NOT EXISTS sur question pour idempotence.
INSERT INTO public.faqs (question, answer, ordre)
SELECT v.question, v.answer, v.ordre
FROM (VALUES
  (
    'Quels sont vos frais d''agence pour la location ?',
    'Pour une location standard, nos honoraires sont de 1 mois de loyer pour le bailleur et 1 mois pour le locataire (visite, état des lieux, rédaction du bail). Pour la gestion locative complète, nous facturons 8% du loyer mensuel encaissé.',
    1
  ),
  (
    'Combien de temps pour vendre un bien à Abidjan ?',
    'Le délai moyen sur nos mandats est de 4 à 6 semaines pour les biens correctement estimés. Cocody Riviera et Plateau partent généralement plus vite. Nous publions sur 4 portails, notre réseau d''expats et nos clients investisseurs.',
    2
  ),
  (
    'Acceptez-vous les paiements en plusieurs fois pour la location courte durée ?',
    'Pour les séjours de plus de 30 jours, nous proposons un échelonnement sur 2 versements (50% à la réservation, 50% à 7 jours du séjour). Tous les moyens de paiement sont acceptés : virement, Wave, Orange Money, MTN MoMo.',
    3
  ),
  (
    'Êtes-vous présents en dehors d''Abidjan ?',
    'Notre cœur de marché est Abidjan (Cocody, Plateau, Marcory, Riviera, Bingerville). Sur demande spécifique, nous accompagnons des projets à Bouaké, Yamoussoukro et San-Pédro via notre réseau de partenaires locaux.',
    4
  ),
  (
    'Comment puis-je estimer la valeur de mon bien ?',
    'Nous proposons une estimation gratuite et sans engagement sous 24h. Envoyez-nous les photos et la fiche détaillée du bien via WhatsApp ou notre formulaire de contact, un expert vous rappelle pour valider les éléments et vous transmet une fourchette de prix argumentée.',
    5
  ),
  (
    'Quelles garanties pour la gestion de mon bien en mon absence ?',
    'Mandat de gestion détaillé, comptes rendus mensuels avec photos, virement à date fixe le 5 du mois, dépôt de garantie séquestré, assurance loyers impayés en option, intervention 24h en cas d''urgence (plomberie, électricité). Vous avez un interlocuteur unique dédié.',
    6
  )
) AS v(question, answer, ordre)
WHERE NOT EXISTS (
  SELECT 1 FROM public.faqs f WHERE f.question = v.question
);

-- Social mentions (depuis social-section.tsx)
-- Pattern WHERE NOT EXISTS sur (network, author_name) pour idempotence.
INSERT INTO public.social_mentions
  (network, author_name, author_handle, text, date_label, likes, rating, ordre)
SELECT v.network, v.author_name, v.author_handle, v.text, v.date_label, v.likes, v.rating, v.ordre
FROM (VALUES
  (
    'facebook', 'Aïcha K.', 'Marcory Zone 4',
    'Service impeccable, locataires trouvés en 2 semaines pour mon appart. L''équipe Mirna est ultra pro 👌',
    'Il y a 3 jours', 24, NULL::int, 1
  ),
  (
    'google', 'Thomas R.', 'Google Reviews',
    'Trouvé un studio meublé à Cocody en 4 jours. Visite virtuelle, contrat à distance, parfait pour les expats.',
    'Il y a 1 semaine', NULL::int, 5, 2
  ),
  (
    'instagram', 'Yves M.', '@yves.invest',
    'Le seul cabinet d''Abidjan qui présente des dossiers d''invest sérieux avec ROI clair. Recommandé.',
    'Il y a 2 semaines', 47, NULL::int, 3
  )
) AS v(network, author_name, author_handle, text, date_label, likes, rating, ordre)
WHERE NOT EXISTS (
  SELECT 1 FROM public.social_mentions m
  WHERE m.network = v.network AND m.author_name = v.author_name
);
