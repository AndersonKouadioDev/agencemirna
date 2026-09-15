-- ============================================================================
-- 0025 — Une annonce porte une image OU une vidéo
-- ============================================================================
--
-- Jusqu'ici une annonce n'avait qu'un visuel fixe (`annonces.image`), avec la
-- photo du bien lié en repli. L'agence veut pouvoir publier une vidéo à la
-- place : une visite filmée vaut mieux qu'une photo pour une mise en avant.
--
-- Deux colonnes plutôt qu'une seule URL polymorphe :
--   • `media_type` porte le CHOIX, explicitement. Deviner la nature d'un
--     média à son extension ou à son domaine est précisément ce qui a déjà
--     coûté cher ailleurs dans ce projet (la nature d'un bien se lisait dans
--     un libellé, migration 0020) ;
--   • `video_url` porte l'adresse. `image` est CONSERVÉE et sert alors
--     d'affiche — l'image figée montrée avant que le visiteur ne lance la
--     lecture.
--
-- La vidéo est référencée par URL et non téléversée : YouTube, Vimeo, ou un
-- fichier .mp4/.webm hébergé ailleurs. Le bucket `images` plafonne à 8 Mo et
-- n'accepte que des types image (migration 0003) ; une visite filmée de trente
-- secondes pèse déjà plus, et la bande passante d'un CDN vidéo ne se compare
-- pas à celle d'un Storage. C'est aussi le format que `biens.lien_video`
-- emploie déjà.
--
-- Idempotente : rejouable sans effet de bord.
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- 1. Colonnes
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.annonces
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image';

ALTER TABLE public.annonces
  ADD COLUMN IF NOT EXISTS video_url text;

COMMENT ON COLUMN public.annonces.media_type IS
  'image | video — ce que la carte de l''annonce met en avant.';
COMMENT ON COLUMN public.annonces.video_url IS
  'Adresse de la vidéo quand media_type = video : YouTube, Vimeo, ou fichier .mp4/.webm.';
COMMENT ON COLUMN public.annonces.image IS
  'Visuel de l''annonce. Quand media_type = video, sert d''affiche avant lecture. '
  'Facultatif dans les deux cas : la photo du bien lié prend le relais.';


-- ────────────────────────────────────────────────────────────────────────────
-- 2. Contraintes
-- ────────────────────────────────────────────────────────────────────────────
-- Posées à part pour rester rejouables sur une table déjà en place. Les lignes
-- existantes prennent le défaut 'image' et les satisfont donc toutes.
--
-- La seconde est un garde-fou, pas le contrôle principal : le formulaire refuse
-- déjà une vidéo sans adresse, avec un message lisible. Elle existe pour le cas
-- où une écriture passerait à côté du formulaire — une annonce annoncée en
-- vidéo et muette afficherait un cadre noir sur la page d'accueil.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'annonces_media_type_valide') THEN
    ALTER TABLE public.annonces
      ADD CONSTRAINT annonces_media_type_valide
      CHECK (media_type IN ('image', 'video'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'annonces_video_url_requise') THEN
    ALTER TABLE public.annonces
      ADD CONSTRAINT annonces_video_url_requise
      CHECK (media_type <> 'video' OR btrim(coalesce(video_url, '')) <> '');
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────────────────────
-- 3. Pas de reprise
-- ────────────────────────────────────────────────────────────────────────────
-- Toutes les annonces existantes sont des images : le défaut suffit. Aucune
-- URL de vidéo n'est devinable depuis les données en place.


-- ────────────────────────────────────────────────────────────────────────────
-- 4. Contrôle
-- ────────────────────────────────────────────────────────────────────────────
-- Attendu : toutes les annonces en « image », aucune en « vidéo muette ».

SELECT
  a.title,
  a.media_type,
  CASE
    WHEN a.media_type = 'video' AND btrim(coalesce(a.video_url, '')) = '' THEN 'VIDÉO SANS ADRESSE'
    WHEN a.media_type = 'video'                                          THEN 'vidéo'
    WHEN a.image IS NOT NULL                                             THEN 'image propre'
    WHEN b.image IS NOT NULL                                             THEN 'photo du bien (repli)'
    ELSE 'aucun visuel'
  END AS visuel,
  coalesce(b.name, '— aucun bien —') AS bien
FROM public.annonces a
LEFT JOIN public.biens b ON b.id = a.bien_id
ORDER BY a.ordre, a.title;
