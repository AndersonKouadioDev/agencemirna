-- ============================================================================
-- 0029 — Avis des clients logés
-- ============================================================================
--
-- Un QR code affiché dans chaque logement ouvre /avis/<bien>?j=<jeton>. Le
-- client y laisse une note et un commentaire ; l'agence les modère dans
-- /admin/avis avant publication sur la fiche du bien, et peut répondre (la
-- réponse part au client par e-mail).
--
-- Sécurité :
--   • Le jeton par bien empêche de déposer un avis sans avoir eu le QR code
--     sous les yeux. Il vit dans `avis_jetons`, table invisible du public :
--     une colonne sur `biens` aurait fuité dans le catalogue (select *).
--   • Le public n'écrit jamais directement dans `avis` : il passe par la
--     fonction `deposer_avis`, qui vérifie le jeton. Sans elle, n'importe qui
--     pourrait insérer des avis avec la clé publique de Supabase.
--   • Le public ne lit pas `avis` (l'e-mail du client y figure) : il passe
--     par `avis_publies`, qui ne renvoie que les avis publiés et un nom
--     abrégé (« Awa B. »).
--
-- À exécuter dans Supabase → SQL Editor. Idempotente.
-- ============================================================================

-- ── Jetons des QR codes ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.avis_jetons (
  bien_id    uuid PRIMARY KEY REFERENCES public.biens(id) ON DELETE CASCADE,
  -- 122 bits aléatoires : impossible à deviner.
  jeton      text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.avis_jetons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin all avis_jetons" ON public.avis_jetons;
CREATE POLICY "admin all avis_jetons"
  ON public.avis_jetons FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Avis ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.avis (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bien_id          uuid NOT NULL REFERENCES public.biens(id) ON DELETE CASCADE,
  nom              text NOT NULL CHECK (char_length(nom) BETWEEN 2 AND 80),
  email            text NOT NULL CHECK (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  note             smallint NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire      text NOT NULL CHECK (char_length(commentaire) BETWEEN 10 AND 2000),
  -- Premier jour du mois du séjour (« novembre 2026 »), facultatif.
  mois_sejour      date,
  statut           text NOT NULL DEFAULT 'en_attente'
                     CHECK (statut IN ('en_attente', 'publie', 'refuse')),
  reponse          text CHECK (reponse IS NULL OR char_length(reponse) <= 2000),
  reponse_le       timestamptz,
  -- Date d'envoi réussi de la réponse par e-mail ; NULL = pas (encore) partie.
  reponse_envoyee_le timestamptz,
  modere_le        timestamptz,
  modere_par       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS avis_bien_statut_idx ON public.avis (bien_id, statut);
CREATE INDEX IF NOT EXISTS avis_created_at_idx  ON public.avis (created_at DESC);

DROP TRIGGER IF EXISTS avis_updated_at ON public.avis;
CREATE TRIGGER avis_updated_at
  BEFORE UPDATE ON public.avis
  FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();

ALTER TABLE public.avis ENABLE ROW LEVEL SECURITY;

-- Aucune policy publique : lecture et écriture publiques passent par les
-- fonctions ci-dessous.
DROP POLICY IF EXISTS "admin all avis" ON public.avis;
CREATE POLICY "admin all avis"
  ON public.avis FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Le jeton d'un QR code est-il valide ? (page publique /avis) ─────────────
CREATE OR REPLACE FUNCTION public.jeton_avis_valide(p_bien_id uuid, p_jeton text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.avis_jetons
    WHERE bien_id = p_bien_id AND jeton = p_jeton
  );
$$;

-- ── Dépôt d'un avis par un client ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.deposer_avis(
  p_bien_id     uuid,
  p_jeton       text,
  p_nom         text,
  p_email       text,
  p_note        integer,
  p_commentaire text,
  p_mois_sejour date
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT public.jeton_avis_valide(p_bien_id, p_jeton) THEN
    RAISE EXCEPTION 'jeton_invalide' USING ERRCODE = 'P0001';
  END IF;

  -- Garde-fou contre les envois en rafale depuis un même QR code.
  IF (
    SELECT count(*) FROM public.avis
    WHERE bien_id = p_bien_id
      AND lower(email) = lower(trim(p_email))
      AND created_at > now() - interval '1 day'
  ) >= 3 THEN
    RAISE EXCEPTION 'trop_d_avis' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.avis (bien_id, nom, email, note, commentaire, mois_sejour)
  VALUES (
    p_bien_id,
    trim(p_nom),
    lower(trim(p_email)),
    p_note,
    trim(p_commentaire),
    p_mois_sejour
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- ── Avis publiés d'un bien (fiche publique) ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.avis_publies(p_bien_id uuid)
RETURNS TABLE (
  id          uuid,
  nom_affiche text,
  note        smallint,
  commentaire text,
  mois_sejour date,
  reponse     text,
  reponse_le  timestamptz,
  created_at  timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    a.id,
    -- « Awa Bamba Koné » → « Awa B. » : jamais le nom complet en public.
    split_part(trim(a.nom), ' ', 1)
      || coalesce(' ' || upper(left(nullif(split_part(trim(a.nom), ' ', 2), ''), 1)) || '.', ''),
    a.note,
    a.commentaire,
    a.mois_sejour,
    a.reponse,
    a.reponse_le,
    a.created_at
  FROM public.avis a
  WHERE a.bien_id = p_bien_id AND a.statut = 'publie'
  ORDER BY a.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.jeton_avis_valide(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.deposer_avis(uuid, text, text, text, integer, text, date) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.avis_publies(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.jeton_avis_valide(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.deposer_avis(uuid, text, text, text, integer, text, date) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.avis_publies(uuid) TO anon, authenticated;
