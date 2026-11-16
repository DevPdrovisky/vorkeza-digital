-- Fura-Fila de Aluguéis — esquema do banco (Supabase / Postgres)
-- Rode inteiro no SQL Editor do Supabase. Pode ser executado de novo sem quebrar nada.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- Dossiês
create table if not exists public.dossies (
  id                    uuid primary key default gen_random_uuid(),
  codigo                text not null unique,                 -- FF-XXXXX-XXXXX (verificação pública)
  created_at            timestamptz not null default now(),
  status                text not null default 'pendente' check (status in ('pendente', 'pago')),
  nome                  text not null,
  email                 text not null,
  respostas             jsonb not null,
  aceite_em             timestamptz not null default now(),   -- consentimento LGPD
  pago_em               timestamptz,
  stripe_session_id     text,
  stripe_payment_intent text,
  email_pagador         text,
  valor_centavos        integer
);

create index if not exists dossies_email_idx on public.dossies (lower(email));
create index if not exists dossies_sessao_idx on public.dossies (stripe_session_id);

-- ---------------------------------------------------------------- Comprovantes (metadados; arquivos no Storage)
create table if not exists public.comprovantes (
  id         uuid primary key default gen_random_uuid(),
  dossie_id  uuid not null references public.dossies (id) on delete cascade,
  caminho    text not null,
  nome       text not null,
  tipo       text not null,
  tamanho    integer not null,
  created_at timestamptz not null default now()
);

create index if not exists comprovantes_dossie_idx on public.comprovantes (dossie_id);

-- ---------------------------------------------------------------- Segurança (RLS)
-- O servidor usa a service role (ignora RLS). Pelo navegador, o usuário logado
-- só enxerga os próprios dossiês PAGOS, pelo e-mail do login.
alter table public.dossies enable row level security;
alter table public.comprovantes enable row level security;

drop policy if exists "dono le dossies pagos" on public.dossies;
create policy "dono le dossies pagos" on public.dossies
  for select to authenticated
  using (status = 'pago' and lower(email) = lower(auth.jwt() ->> 'email'));

revoke all on public.dossies from anon;
revoke all on public.comprovantes from anon, authenticated;
grant select on public.dossies to authenticated;

-- ---------------------------------------------------------------- Storage (bucket privado)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('comprovantes', 'comprovantes', false, 4194304, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
-- Sem políticas no storage.objects para este bucket: só a service role lê e grava.
