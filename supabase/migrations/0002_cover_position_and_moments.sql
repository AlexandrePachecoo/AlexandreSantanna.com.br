-- Capa reposicionável + Momentos
-- cover_position: CSS object-position string ("50% 50%")
-- moments: array jsonb de { url, caption } (max 10 itens, enforce no app)

alter table public.letters
  add column if not exists cover_position text default '50% 50%',
  add column if not exists moments jsonb not null default '[]'::jsonb;
