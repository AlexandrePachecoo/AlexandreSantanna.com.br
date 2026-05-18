-- specialDay schema
-- Cartas virtuais emocionais compartilháveis por link.
-- Sem auth: acesso público pelo slug, edição pelo edit_token.

create extension if not exists pgcrypto;

create table if not exists public.letters (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  edit_token      text not null unique,

  title           text not null,
  content         text not null,
  sender_name     text,
  recipient_name  text,

  theme           text not null default 'romantic',
  cover_image     text,
  music_url       text,

  visibility      text not null default 'public'
                    check (visibility in ('public', 'private')),
  password_hash   text,
  unlock_date     timestamptz,

  views           integer not null default 0,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists letters_slug_idx       on public.letters (slug);
create index if not exists letters_edit_token_idx on public.letters (edit_token);
create index if not exists letters_created_at_idx on public.letters (created_at desc);

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists letters_set_updated_at on public.letters;
create trigger letters_set_updated_at
before update on public.letters
for each row execute function public.set_updated_at();

-- RLS desligado: todo acesso é via service_role nas API routes.
alter table public.letters disable row level security;

-- Bucket de storage para cover_image e assets das cartas.
-- Criar via Supabase Dashboard ou:
--   insert into storage.buckets (id, name, public)
--   values ('letters', 'letters', true)
--   on conflict (id) do nothing;
