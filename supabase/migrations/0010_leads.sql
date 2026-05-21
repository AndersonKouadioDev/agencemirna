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
