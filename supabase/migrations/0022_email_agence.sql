-- ============================================================================
-- 0022 — Adresse électronique de l'agence
-- ============================================================================
--
-- La ligne semée par la migration 0014 portait « contact@agencemirna.com »,
-- valeur de démonstration. L'adresse réelle est info@agencemirna.com, qui est
-- d'ailleurs déjà la valeur de repli du code (src/data/contact.ts).
--
-- Elle ne sert plus seulement à l'affichage : depuis cette passe, c'est aussi
-- le destinataire des notifications de lead et des demandes de réservation.
-- ============================================================================

UPDATE public.site_settings
SET email = 'info@agencemirna.com', updated_at = now()
WHERE email IS DISTINCT FROM 'info@agencemirna.com';

-- Contrôle
SELECT email, phone, whatsapp,
       concat_ws(' / ', facebook, instagram, linkedin) AS reseaux
FROM public.site_settings;
