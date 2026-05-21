-- =============================================================================
-- 0008_strip_em_dash.sql
-- =============================================================================
-- Nettoie les caractères em-dash ('—', U+2014) restés dans les contenus
-- éditoriaux (saisies admin antérieures). Remplace par ':' typographiquement
-- équivalent en français.
--
-- Idempotente : ré-exécution safe (REPLACE sur une chaîne sans em-dash ne
-- fait rien).
-- =============================================================================

-- ─── PROMOTIONS ─────────────────────────────────────────────────────────────
UPDATE public.promotions SET title       = REPLACE(title,       '—', ':') WHERE title       LIKE '%—%';
UPDATE public.promotions SET description = REPLACE(description, '—', ':') WHERE description LIKE '%—%';
UPDATE public.promotions SET cta_label   = REPLACE(cta_label,   '—', ':') WHERE cta_label   LIKE '%—%';

-- ─── BIENS ──────────────────────────────────────────────────────────────────
UPDATE public.biens SET name              = REPLACE(name,              '—', ':') WHERE name              LIKE '%—%';
UPDATE public.biens SET description_courte = REPLACE(description_courte, '—', ':') WHERE description_courte LIKE '%—%';
UPDATE public.biens SET description       = REPLACE(description,       '—', ':') WHERE description       LIKE '%—%';

-- ─── SERVICES ──────────────────────────────────────────────────────────────
UPDATE public.services SET name              = REPLACE(name,              '—', ':') WHERE name              LIKE '%—%';
UPDATE public.services SET short_description = REPLACE(short_description, '—', ':') WHERE short_description LIKE '%—%';
UPDATE public.services SET long_description  = REPLACE(long_description,  '—', ':') WHERE long_description  LIKE '%—%';
UPDATE public.services SET cta_label         = REPLACE(cta_label,         '—', ':') WHERE cta_label         LIKE '%—%';

-- ─── AGENTS ────────────────────────────────────────────────────────────────
UPDATE public.agents SET full_name = REPLACE(full_name, '—', ':') WHERE full_name LIKE '%—%';
UPDATE public.agents SET role      = REPLACE(role,      '—', ':') WHERE role      LIKE '%—%';
UPDATE public.agents SET bio       = REPLACE(bio,       '—', ':') WHERE bio       LIKE '%—%';

-- ─── QUARTIERS ─────────────────────────────────────────────────────────────
UPDATE public.quartiers SET name        = REPLACE(name,        '—', ':') WHERE name        LIKE '%—%';
UPDATE public.quartiers SET tagline     = REPLACE(tagline,     '—', ':') WHERE tagline     LIKE '%—%';
UPDATE public.quartiers SET description = REPLACE(description, '—', ':') WHERE description LIKE '%—%';
UPDATE public.quartiers SET badge       = REPLACE(badge,       '—', ':') WHERE badge       LIKE '%—%';

-- ─── TESTIMONIALS ──────────────────────────────────────────────────────────
UPDATE public.testimonials SET quote        = REPLACE(quote,        '—', ':') WHERE quote        LIKE '%—%';
UPDATE public.testimonials SET author_name  = REPLACE(author_name,  '—', ':') WHERE author_name  LIKE '%—%';
UPDATE public.testimonials SET author_role  = REPLACE(author_role,  '—', ':') WHERE author_role  LIKE '%—%';

-- ─── ARTICLES ──────────────────────────────────────────────────────────────
UPDATE public.articles SET title      = REPLACE(title,      '—', ':') WHERE title      LIKE '%—%';
UPDATE public.articles SET excerpt    = REPLACE(excerpt,    '—', ':') WHERE excerpt    LIKE '%—%';
UPDATE public.articles SET content_md = REPLACE(content_md, '—', ':') WHERE content_md LIKE '%—%';
UPDATE public.articles SET category   = REPLACE(category,   '—', ':') WHERE category   LIKE '%—%';

-- ─── FAQS ──────────────────────────────────────────────────────────────────
UPDATE public.faqs SET question = REPLACE(question, '—', ':') WHERE question LIKE '%—%';
UPDATE public.faqs SET answer   = REPLACE(answer,   '—', ':') WHERE answer   LIKE '%—%';

-- ─── SOCIAL MENTIONS ───────────────────────────────────────────────────────
UPDATE public.social_mentions SET text          = REPLACE(text,          '—', ':') WHERE text          LIKE '%—%';
UPDATE public.social_mentions SET author_name   = REPLACE(author_name,   '—', ':') WHERE author_name   LIKE '%—%';
UPDATE public.social_mentions SET author_handle = REPLACE(author_handle, '—', ':') WHERE author_handle LIKE '%—%';
UPDATE public.social_mentions SET date_label    = REPLACE(date_label,    '—', ':') WHERE date_label    LIKE '%—%';
