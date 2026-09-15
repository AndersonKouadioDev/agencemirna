-- ============================================================================
-- 0026 — Le bandeau d'infos et les coordonnées se pilotent depuis l'admin
-- ============================================================================
--
-- Deux manques, de même nature : du contenu éditorial figé dans le code.
--
-- 1. LE BANDEAU DÉFILANT. Ses messages sont écrits en dur dans
--    `components/landing/marquee-bar.tsx` — y compris un « dès 50 000
--    FCFA/nuit » qui deviendra faux au premier changement de tarif, et une
--    liste de services qui ne suit pas /admin/taxonomie. Modifier une virgule
--    demande un déploiement.
--
-- 2. LES COORDONNÉES. `site_settings` ne porte que six champs. Pas d'adresse
--    postale — le pied de page n'en affiche aucune —, pas d'horaires (il
--    annonce « 24/7 » en dur), pas de second numéro alors que le code sait
--    déjà en afficher plusieurs (`SiteContact.phones` est un tableau), et
--    aucun réseau au-delà des trois historiques.
--
-- Cette migration pose les deux, ET REPREND L'EXISTANT : les quatre messages
-- du bandeau sont insérés tels qu'ils s'affichent aujourd'hui. Rien ne
-- disparaît de la vitrine au moment où le SQL passe.
--
-- Idempotente : rejouable sans effet de bord.
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- 1. Table du bandeau
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.infos_bandeau (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  -- Le message. Court : il défile, personne ne lit trois lignes qui bougent.
  texte       text NOT NULL,

  -- Destination. Chemin interne (« /contact_us ») ou URL absolue. Nullable :
  -- une information peut n'être qu'une information.
  lien        text,

  -- Clé du pictogramme, résolue côté code (src/lib/bandeau-icones.ts).
  -- On stocke une CLÉ et non un nom de composant : le jeu d'icônes peut
  -- changer de bibliothèque sans réécrire les données, et une clé inconnue
  -- retombe sur un pictogramme neutre au lieu de casser le rendu.
  icone       text NOT NULL DEFAULT 'megaphone',

  ordre       integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,

  -- Fenêtre d'affichage, comme les annonces : une information de saison
  -- s'éteint toute seule au lieu de rester jusqu'à ce qu'on y repense.
  starts_at   timestamptz,
  ends_at     timestamptz
);

COMMENT ON TABLE public.infos_bandeau IS
  'Messages du bandeau défilant en haut du site. Ordonnés par `ordre`.';
COMMENT ON COLUMN public.infos_bandeau.icone IS
  'Clé du pictogramme (voir src/lib/bandeau-icones.ts). Une clé inconnue retombe sur un pictogramme neutre.';

-- Contraintes posées à part pour rester rejouables sur une table existante,
-- et rattachées à LEUR table : `conname` seul se heurterait à une contrainte
-- homonyme ailleurs dans le schéma.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'infos_bandeau_texte_non_vide'
      AND conrelid = 'public.infos_bandeau'::regclass
  ) THEN
    ALTER TABLE public.infos_bandeau
      ADD CONSTRAINT infos_bandeau_texte_non_vide CHECK (btrim(texte) <> '');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'infos_bandeau_fenetre_coherente'
      AND conrelid = 'public.infos_bandeau'::regclass
  ) THEN
    ALTER TABLE public.infos_bandeau
      ADD CONSTRAINT infos_bandeau_fenetre_coherente
      CHECK (starts_at IS NULL OR ends_at IS NULL OR starts_at < ends_at);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS infos_bandeau_ordre_idx
  ON public.infos_bandeau (is_active, ordre);

DROP TRIGGER IF EXISTS infos_bandeau_updated_at ON public.infos_bandeau;
CREATE TRIGGER infos_bandeau_updated_at
BEFORE UPDATE ON public.infos_bandeau
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


-- ────────────────────────────────────────────────────────────────────────────
-- 2. RLS du bandeau
-- ────────────────────────────────────────────────────────────────────────────
-- Lecture publique des seules lignes actives. Le code filtre EN PLUS la
-- fenêtre de dates et `is_active` : la policy admin est `FOR ALL` et se
-- combine en OU avec celle-ci, si bien qu'un administrateur connecté verrait
-- sinon sur la vitrine ce qu'il vient de dépublier.

ALTER TABLE public.infos_bandeau ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read active infos_bandeau" ON public.infos_bandeau;
CREATE POLICY "public read active infos_bandeau"
  ON public.infos_bandeau FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "admin manage infos_bandeau" ON public.infos_bandeau;
CREATE POLICY "admin manage infos_bandeau"
  ON public.infos_bandeau FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));


-- ────────────────────────────────────────────────────────────────────────────
-- 3. Reprise des messages actuellement codés en dur
-- ────────────────────────────────────────────────────────────────────────────
-- Exactement ceux de `buildFallbackAnnouncements()`, dans le même ordre. Le
-- numéro de téléphone n'est pas recopié : il vit dans `site_settings` et le
-- bandeau l'y lira, sans quoi il faudrait le corriger à deux endroits.
-- Le jeton {telephone} est remplacé au rendu.
--
-- N'insère QUE si la table est vide : rejouer la migration après une reprise
-- en main par l'agence ne doit pas faire réapparaître les textes d'origine.

INSERT INTO public.infos_bandeau (texte, lien, icone, ordre, is_active)
SELECT v.texte, v.lien, v.icone, v.ordre, true
FROM (VALUES
  ('Estimation gratuite de votre bien : réponse sous 24h', '/contact_us', 'megaphone',  10),
  ('Une question ? Appelez-nous au {telephone}',           '{telephone}', 'telephone',  20),
  ('Découvrez nos services : gestion, vente, location meublée, construction', '/services', 'journal', 30),
  ('Nos appartements meublés, disponibles dès maintenant', '/properties?service=Location%20meubl%C3%A9e', 'etincelles', 40)
) AS v(texte, lien, icone, ordre)
WHERE NOT EXISTS (SELECT 1 FROM public.infos_bandeau);


-- ────────────────────────────────────────────────────────────────────────────
-- 4. Coordonnées : ce qui manquait à `site_settings`
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS phone_secondaire text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS adresse          text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS horaires         text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS whatsapp_message text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS tiktok           text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS youtube          text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS twitter          text;

COMMENT ON COLUMN public.site_settings.phone_secondaire IS
  'Second numéro affiché à côté du principal. `SiteContact.phones` sait déjà en porter plusieurs.';
COMMENT ON COLUMN public.site_settings.adresse IS
  'Adresse postale de l''agence, affichée au pied de page.';
COMMENT ON COLUMN public.site_settings.horaires IS
  'Horaires d''ouverture. Le pied de page annonçait « 24/7 » en dur.';
COMMENT ON COLUMN public.site_settings.whatsapp_message IS
  'Message pré-rempli des liens WhatsApp. Venait de NEXT_PUBLIC_WHATSAPP_MESSAGE, donc d''un redéploiement.';


-- ────────────────────────────────────────────────────────────────────────────
-- 5. Reprise du message WhatsApp
-- ────────────────────────────────────────────────────────────────────────────
-- La variable d'environnement reste lue en repli tant que cette colonne est
-- vide : rien ne change tant que l'agence n'a pas saisi son propre message.


-- ────────────────────────────────────────────────────────────────────────────
-- 6. Contrôle
-- ────────────────────────────────────────────────────────────────────────────

SELECT 'bandeau' AS objet, texte AS valeur, icone AS detail, ordre::text AS ordre
FROM public.infos_bandeau
UNION ALL
SELECT 'paramètre', 'téléphone',        coalesce(phone, '— non saisi —'),            '—' FROM public.site_settings
UNION ALL
SELECT 'paramètre', 'second numéro',    coalesce(phone_secondaire, '— non saisi —'), '—' FROM public.site_settings
UNION ALL
SELECT 'paramètre', 'adresse',          coalesce(adresse, '— non saisi —'),          '—' FROM public.site_settings
UNION ALL
SELECT 'paramètre', 'horaires',         coalesce(horaires, '— non saisi —'),         '—' FROM public.site_settings
UNION ALL
SELECT 'paramètre', 'réseaux sociaux',
       coalesce(concat_ws(' / ', facebook, instagram, linkedin, tiktok, youtube, twitter), '— aucun —'), '—'
FROM public.site_settings
ORDER BY objet, ordre, valeur;
