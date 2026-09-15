-- ============================================================================
-- 0028 — Le formulaire de bien s'adapte au type : drapeaux sur types_bien
-- ============================================================================
--
-- Le formulaire proposait les cinq caractéristiques à tous les types : on
-- demandait le nombre de chambres et de salles de bain d'un TERRAIN, et un
-- entrepôt se voyait offrir une « capacité » en personnes. Sur la fiche, ces
-- champs restaient vides — quatre biens sur douze n'en avaient aucun.
--
-- Deux drapeaux, portés par le TYPE et non devinés depuis son libellé
-- (migration 0020, même principe : renommer « Terrain » ne doit rien casser) :
--   • a_pieces   : chambres, salons, salles de bain ont un sens
--   • a_capacite : une capacité d'accueil en personnes a un sens
-- La surface vaut pour tous les types, du studio au terrain : pas de drapeau.
--
-- Réglables depuis /admin/taxonomie. Les valeurs posées ci-dessous sont des
-- défauts raisonnables, PAS une décision de l'agence : c'est la dernière fois
-- qu'un libellé sert à décider, et seulement pour amorcer.
--
-- Idempotente : rejouable sans effet de bord.
-- ============================================================================

ALTER TABLE public.types_bien
  ADD COLUMN IF NOT EXISTS a_pieces boolean NOT NULL DEFAULT true;
ALTER TABLE public.types_bien
  ADD COLUMN IF NOT EXISTS a_capacite boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.types_bien.a_pieces IS
  'Le formulaire propose chambres / salons / salles de bain. Faux pour un terrain, un entrepôt…';
COMMENT ON COLUMN public.types_bien.a_capacite IS
  'Le formulaire propose une capacité d''accueil en personnes. Faux pour un terrain, un local…';

-- ── Amorçage depuis les libellés actuels ────────────────────────────────────
-- Ne touche que les types encore aux valeurs par défaut (true, true) : rejouer
-- la migration après une reprise en main depuis l'admin ne doit rien écraser.

UPDATE public.types_bien
SET a_pieces = false, a_capacite = false
WHERE a_pieces AND a_capacite
  AND lower(public.unaccent_safe(name)) IN ('terrain', 'entrepot', 'local commercial');

UPDATE public.types_bien
SET a_pieces = false
WHERE a_pieces AND a_capacite
  AND lower(public.unaccent_safe(name)) = 'bureau';

-- ── Contrôle ──────────────────────────────────────────────────────────────────
-- Attendu : Terrain, Entrepôt, Local commercial sans pièces ni capacité ;
-- Bureau sans pièces mais avec capacité ; le résidentiel avec les deux.

SELECT name,
       CASE WHEN a_pieces   THEN 'pièces'   ELSE '—' END AS pieces,
       CASE WHEN a_capacite THEN 'capacité' ELSE '—' END AS capacite
FROM public.types_bien
ORDER BY ordre, name;
