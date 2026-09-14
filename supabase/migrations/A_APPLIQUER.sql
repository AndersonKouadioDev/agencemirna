-- ============================================================================
-- À EXÉCUTER DANS SUPABASE → SQL EDITOR, EN UNE FOIS.
--
-- Contient les deux seules migrations non appliquées en base :
--   0010_leads.sql  — la table leads n'existe pas : aucun formulaire du
--                     site n'enregistre quoi que ce soit aujourd'hui.
--   0015_…          — communes, rattachement des biens, annonces liées.
--
-- Les migrations 0011 à 0014 sont déjà en base (vérifié par sondage).
-- Les deux scripts sont idempotents : les rejouer est sans effet de bord.
-- ============================================================================

-- ─── 0010_leads.sql ─────────────────────────────────────────────────────────
-- =============================================================================
-- 0010_leads.sql
-- =============================================================================
-- Table `leads` : capture toutes les demandes entrantes du site public.
--
-- Sources possibles :
--   - contact         : formulaire général /contact_us ou newsletter footer
--   - estimation      : demande d'estimation gratuite d'un bien (page /estimation)
--   - visit_request   : demande de visite sur une fiche bien
--   - newsletter      : abonnement à la newsletter
--
-- Permet à l'admin de centraliser les leads dans /admin/leads (à venir)
-- au lieu de les disperser dans des emails. L'envoi d'un email de
-- notification est un autre sujet (Resend / SMTP), pas couvert ici.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.leads (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source       text NOT NULL CHECK (source IN ('contact', 'estimation', 'visit_request', 'newsletter', 'other')),
  full_name    text,
  email        text,
  phone        text,
  message      text,
  -- Référence optionnelle vers le bien concerné (pour visit_request)
  bien_id      uuid REFERENCES public.biens(id) ON DELETE SET NULL,
  -- Métadonnées de tracking
  source_url   text,                    -- URL d'où vient la demande
  metadata     jsonb,                   -- Pour stocker des données spécifiques au type de lead
  -- Suivi commercial
  status       text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'qualified', 'converted', 'rejected', 'archived')),
  handled_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  handled_at   timestamptz,
  notes        text,
  -- Timestamps
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_status_idx     ON public.leads (status);
CREATE INDEX IF NOT EXISTS leads_source_idx     ON public.leads (source);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_bien_id_idx    ON public.leads (bien_id);

DROP TRIGGER IF EXISTS leads_updated_at ON public.leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();

-- ─── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Public peut INSERT (pour que les formulaires anonymes fonctionnent)
DROP POLICY IF EXISTS "public insert leads" ON public.leads;
CREATE POLICY "public insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

-- Seuls les admins peuvent lire / modifier / supprimer
DROP POLICY IF EXISTS "admin read leads" ON public.leads;
CREATE POLICY "admin read leads"
  ON public.leads FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin update leads" ON public.leads;
CREATE POLICY "admin update leads"
  ON public.leads FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin delete leads" ON public.leads;
CREATE POLICY "admin delete leads"
  ON public.leads FOR DELETE
  USING (public.is_admin());

-- ─── 0015_communes_quartiers_annonces.sql ───────────────────────────────────
-- ============================================================================
-- 0015 — Remise en ordre du modèle géographique et des annonces
-- ============================================================================
--
-- Trois corrections structurelles :
--
--  1. GÉOGRAPHIE. La table `quartiers` contenait en réalité des COMMUNES
--     (Cocody, Plateau, Marcory) mélangées à un vrai quartier (Riviera),
--     pendant que la table `communes` restait vide. On promeut les communes
--     dans `communes`, on rattache les quartiers restants à leur commune,
--     et on seede les 13 communes du District Autonome d'Abidjan.
--
--  2. LIAISON DES BIENS. `biens` ne référençait la localisation que par du
--     texte libre (`ville_commune`). On ajoute deux clés étrangères pour que
--     la création d'un bien lie explicitement une commune ET un quartier, et
--     que le filtrage de la vitrine s'appuie dessus plutôt que sur des
--     comparaisons de chaînes.
--
--  3. ANNONCES. Une annonce doit porter un TYPE et pointer vers un BIEN
--     existant. Les informations détaillées (prix, pièces, adresse) viennent
--     désormais du bien lié : l'annonce ne les re-saisit plus.
--
-- Idempotente : rejouable sans effet de bord.
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- 0. Utilitaire de comparaison insensible aux accents
-- ────────────────────────────────────────────────────────────────────────────
-- L'extension `unaccent` n'est pas garantie disponible : on translittère les
-- quelques caractères réellement utilisés par les libellés du projet.

CREATE OR REPLACE FUNCTION public.unaccent_safe(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT translate(
    coalesce(input, ''),
    'àáâãäåçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ',
    'aaaaaaceeeeiiiinooooouuuuyyAAAAAACEEEEIIIINOOOOOUUUUY'
  );
$$;


-- Extraction tolérante d'une clé dans une description JSON. Un cast ::jsonb
-- direct lèverait une exception sur une description malformée et ferait
-- échouer l'ensemble de la migration.
CREATE OR REPLACE FUNCTION public.json_extrait(texte text, cle text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v jsonb;
BEGIN
  IF texte IS NULL OR left(btrim(texte), 1) <> '{' THEN
    RETURN NULL;
  END IF;
  BEGIN
    v := btrim(texte)::jsonb;
  EXCEPTION WHEN others THEN
    RETURN NULL;
  END;
  RETURN nullif(btrim(coalesce(v ->> cle, '')), '');
END;
$$;


-- ────────────────────────────────────────────────────────────────────────────
-- 1. La table `communes` reçoit les champs de présentation
-- ────────────────────────────────────────────────────────────────────────────
-- La section « Communes » de l'accueil a besoin des mêmes visuels que
-- l'ancienne section « Quartiers » : image, badge, accroche, description.

ALTER TABLE public.communes ADD COLUMN IF NOT EXISTS badge        text;
ALTER TABLE public.communes ADD COLUMN IF NOT EXISTS tagline      text;
ALTER TABLE public.communes ADD COLUMN IF NOT EXISTS description  text;
ALTER TABLE public.communes ADD COLUMN IF NOT EXISTS image        text;
ALTER TABLE public.communes ADD COLUMN IF NOT EXISTS search_query text;
ALTER TABLE public.communes ADD COLUMN IF NOT EXISTS is_featured  boolean NOT NULL DEFAULT false;


-- ────────────────────────────────────────────────────────────────────────────
-- 2. Seed des communes du District Autonome d'Abidjan
-- ────────────────────────────────────────────────────────────────────────────
-- 10 communes urbaines + 3 communes périurbaines. Les slugs sont sans accent
-- (cf. le correctif de `slugify` côté admin, qui normalise en NFD).

INSERT INTO public.communes (nom, slug, ordre, is_active) VALUES
  ('Cocody',      'cocody',      10, true),
  ('Plateau',     'plateau',     20, true),
  ('Marcory',     'marcory',     30, true),
  ('Treichville', 'treichville', 40, true),
  ('Yopougon',    'yopougon',    50, true),
  ('Abobo',       'abobo',       60, true),
  ('Adjamé',      'adjame',      70, true),
  ('Attécoubé',   'attecoube',   80, true),
  ('Koumassi',    'koumassi',    90, true),
  ('Port-Bouët',  'port-bouet', 100, true),
  ('Bingerville', 'bingerville',110, true),
  ('Anyama',      'anyama',     120, true),
  ('Songon',      'songon',     130, true)
ON CONFLICT (slug) DO NOTHING;


-- ────────────────────────────────────────────────────────────────────────────
-- 3. Promotion des « quartiers » qui sont en fait des communes
-- ────────────────────────────────────────────────────────────────────────────
-- On récupère les visuels déjà saisis en admin (image, badge, accroche…)
-- pour ne rien perdre du rendu actuel de l'accueil.

UPDATE public.communes c
SET
  badge        = COALESCE(c.badge,        q.badge),
  tagline      = COALESCE(c.tagline,      q.tagline),
  description  = COALESCE(c.description,  q.description),
  image        = COALESCE(c.image,        q.image),
  search_query = COALESCE(c.search_query, q.search_query),
  is_featured  = c.is_featured OR q.is_featured,
  updated_at   = now()
FROM public.quartiers q
WHERE lower(trim(q.name)) = lower(trim(c.nom));


-- ────────────────────────────────────────────────────────────────────────────
-- 4. Rattachement des quartiers restants à leur commune
-- ────────────────────────────────────────────────────────────────────────────
-- a) par le libellé texte `commune` lorsqu'il désigne une vraie commune
UPDATE public.quartiers q
SET commune_id = c.id, updated_at = now()
FROM public.communes c
WHERE q.commune_id IS NULL
  AND lower(trim(q.commune)) = lower(trim(c.nom));

-- b) rattachements connus que le texte libre ne permet pas de déduire
--    (les lignes existantes portent toutes `commune = 'Abidjan'`, qui est le
--     district et non une commune).
UPDATE public.quartiers q
SET commune_id = c.id, commune = c.nom, updated_at = now()
FROM public.communes c
WHERE q.commune_id IS NULL
  AND c.slug = 'cocody'
  AND lower(trim(q.name)) IN ('riviera', 'riviera golf', 'angré', 'angre', 'deux plateaux', '2 plateaux');


-- ────────────────────────────────────────────────────────────────────────────
-- 5. Suppression des doublons commune/quartier
-- ────────────────────────────────────────────────────────────────────────────
-- Les lignes de `quartiers` qui portent le nom d'une commune ont été promues
-- à l'étape 3 : les garder afficherait la même entité deux fois. Aucun bien
-- ne les référence (la colonne quartier_id n'existait pas encore).

DELETE FROM public.quartiers q
USING public.communes c
WHERE lower(trim(q.name)) = lower(trim(c.nom));


-- ────────────────────────────────────────────────────────────────────────────
-- 6. Les biens référencent explicitement commune et quartier
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.biens
  ADD COLUMN IF NOT EXISTS commune_id  uuid REFERENCES public.communes(id)  ON DELETE SET NULL;
ALTER TABLE public.biens
  ADD COLUMN IF NOT EXISTS quartier_id uuid REFERENCES public.quartiers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS biens_commune_id_idx  ON public.biens (commune_id);
CREATE INDEX IF NOT EXISTS biens_quartier_id_idx ON public.biens (quartier_id);

-- Reprise de l'historique : `ville_commune` était du texte libre.
UPDATE public.biens b
SET commune_id = c.id
FROM public.communes c
WHERE b.commune_id IS NULL
  AND b.ville_commune IS NOT NULL
  AND lower(trim(b.ville_commune)) = lower(trim(c.nom));


-- ────────────────────────────────────────────────────────────────────────────
-- 7. Surface habitable
-- ────────────────────────────────────────────────────────────────────────────
-- La vitrine lisait déjà `biens.area`, colonne qui n'a jamais existé : le
-- critère d'achat le plus consulté n'apparaissait sur aucune fiche.

ALTER TABLE public.biens ADD COLUMN IF NOT EXISTS area numeric;

COMMENT ON COLUMN public.biens.area IS 'Surface habitable en m².';


-- ────────────────────────────────────────────────────────────────────────────
-- 8. Les annonces pointent vers un bien et portent un type
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.types_annonce (
  id         serial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  name       text NOT NULL UNIQUE,
  ordre      integer NOT NULL DEFAULT 0
);

-- Les quatre premiers reprennent les valeurs déjà saisies par l'agence, qui
-- étaient stockées dans le JSON de `description`.
INSERT INTO public.types_annonce (name, ordre) VALUES
  ('Promotion',      10),
  ('Nouveau',        20),
  ('Exclusivité',    30),
  ('Opportunité',    40),
  ('Coup de cœur',   50),
  ('Baisse de prix', 60)
ON CONFLICT (name) DO NOTHING;

ALTER TABLE public.annonces
  ADD COLUMN IF NOT EXISTS type_annonce_id integer REFERENCES public.types_annonce(id) ON DELETE SET NULL;
ALTER TABLE public.annonces
  ADD COLUMN IF NOT EXISTS bien_id uuid REFERENCES public.biens(id) ON DELETE CASCADE;
ALTER TABLE public.annonces
  ADD COLUMN IF NOT EXISTS sous_titre text;

CREATE INDEX IF NOT EXISTS annonces_bien_id_idx ON public.annonces (bien_id);

COMMENT ON COLUMN public.annonces.bien_id IS
  'Bien mis en avant. L''annonce ne duplique pas ses informations : prix, pièces et localisation sont lus sur le bien.';
COMMENT ON COLUMN public.annonces.cta_url IS
  'Lien libre, optionnel. Laissé vide, l''annonce redirige vers /properties/{bien_id}.';

-- ── Récupération des données empaquetées en JSON dans `description` ──────────
-- Le formulaire admin y sérialisait {type, price, oldPrice, subtitle}. On
-- extrait ces valeurs vers de vraies colonnes avant de nettoyer, pour ne pas
-- perdre la saisie de l'agence.

-- a) le type, rapproché de la table de référence sans tenir compte de la casse
UPDATE public.annonces a
SET type_annonce_id = t.id
FROM public.types_annonce t
WHERE a.type_annonce_id IS NULL
  AND a.description IS NOT NULL
  AND trim(a.description) LIKE '{%}'
  AND lower(unaccent_safe(public.json_extrait(a.description, 'type'))) =
      lower(unaccent_safe(t.name));

-- b) le sous-titre
UPDATE public.annonces
SET sous_titre = public.json_extrait(description, 'subtitle')
WHERE sous_titre IS NULL
  AND public.json_extrait(description, 'subtitle') IS NOT NULL;

-- c) les descriptions qui ne sont qu'un blob JSON n'ont plus lieu d'être :
--    prix et informations détaillées viennent désormais du bien lié.
UPDATE public.annonces
SET description = NULL
WHERE description IS NOT NULL
  AND left(btrim(description), 1) = '{'
  AND right(btrim(description), 1) = '}';

-- d) tout ce qui reste sans type reçoit « Promotion », valeur par défaut
--    historique du formulaire.
UPDATE public.annonces
SET type_annonce_id = (SELECT id FROM public.types_annonce WHERE name = 'Promotion')
WHERE type_annonce_id IS NULL;


-- ────────────────────────────────────────────────────────────────────────────
-- 9. RLS sur la nouvelle table
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.types_annonce ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Les types d'annonce sont lisibles par tous" ON public.types_annonce;
CREATE POLICY "Les types d'annonce sont lisibles par tous"
  ON public.types_annonce FOR SELECT USING (true);

DROP POLICY IF EXISTS "Types d'annonce modifiables par les admins" ON public.types_annonce;
CREATE POLICY "Types d'annonce modifiables par les admins"
  ON public.types_annonce FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
