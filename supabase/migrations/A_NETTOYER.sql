-- ============================================================================
-- Nettoyage des données de vérification
-- ============================================================================
-- Une ligne a été créée dans `leads` pour vérifier que les formulaires du site
-- enregistraient de nouveau après l'application de 0010. Elle n'a aucune
-- valeur métier.
--
-- À exécuter dans Supabase → SQL Editor. Alternative équivalente : supprimer
-- la ligne depuis /admin/leads.
-- ============================================================================

-- Ce qui va être supprimé
SELECT 'A SUPPRIMER' AS etape, id, source, email, created_at
FROM public.leads
WHERE email = 'verif-technique@example.invalid';

DELETE FROM public.leads
WHERE email = 'verif-technique@example.invalid';

-- Contrôle : plus aucune adresse de test ne subsiste
SELECT 'RESTANT' AS etape, count(*) AS lignes_de_test
FROM public.leads
WHERE email LIKE '%@example.invalid'
   OR email LIKE '%@example.com'
   OR email LIKE 'verif-technique%';
