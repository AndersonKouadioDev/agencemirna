-- =============================================================================
-- 0013_videos.sql
-- =============================================================================
-- Table `videos` : permet à l'admin d'ajouter / retirer / désactiver une
-- vidéo affichée sur la home page (et plus tard ailleurs si besoin).
--
-- 3 sources supportées via le champ `url` :
--   - YouTube       : https://www.youtube.com/watch?v=...   ou youtu.be/...
--   - Vimeo         : https://vimeo.com/...
--   - Fichier direct: .mp4 / .webm hébergé sur Supabase Storage ou autre CDN
--
-- Le composant public détecte le provider depuis l'URL et utilise le
-- bon rendu (iframe pour YouTube/Vimeo, <video> pour les fichiers).
--
-- RLS :
--   - Lecture publique uniquement si is_active=true (pour ne pas exposer
--     les brouillons côté site)
--   - Admin : tous les droits via is_admin()
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.videos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text,
  url           text NOT NULL,
  -- Image affichée AVANT que l'utilisateur ne clique sur play.
  -- Optionnel : si null et YouTube/Vimeo, on utilise leur miniature auto.
  poster        text,
  -- Si true, la vidéo apparaît sur la home (1 seule à la fois : on prend
  -- celle avec l'ordre le plus bas qui a show_on_home=true et is_active=true).
  show_on_home  boolean NOT NULL DEFAULT true,
  is_active     boolean NOT NULL DEFAULT true,
  ordre         integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS videos_ordre_idx ON public.videos(ordre);
CREATE INDEX IF NOT EXISTS videos_home_idx
  ON public.videos(show_on_home, is_active, ordre)
  WHERE show_on_home = true AND is_active = true;

-- Trigger updated_at (réutilise la fonction définie dans 0004)
DROP TRIGGER IF EXISTS videos_updated_at ON public.videos;
CREATE TRIGGER videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read active videos" ON public.videos;
CREATE POLICY "public read active videos"
  ON public.videos FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "admins manage videos" ON public.videos;
CREATE POLICY "admins manage videos"
  ON public.videos FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
