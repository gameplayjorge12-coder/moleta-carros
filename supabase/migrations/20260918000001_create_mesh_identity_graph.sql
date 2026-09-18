-- MALHA — Grafo de Identidade EIXO (first-party, cross-site)
-- Camada 3 do plano (docs/MOLETA_PLANO_LEADS_E_PAINEL.md). Idempotente (re-run seguro).
-- Salvaguardas: mesh_sinal append-only (trigger) · upserts idempotentes · RLS nega anon.
-- Escrita SÓ via rota server-side com chave secreta (service_role bypassa RLS). Browser nunca toca aqui.

-- 1. DISPOSITIVO (identidade anônima estável) ---------------------------------
create table if not exists public.mesh_device (
  device_fp     text primary key,                 -- fingerprint estável (canvas/webgl/fontes/hardware)
  primeiro_visto timestamptz not null default now(),
  ultimo_visto   timestamptz not null default now(),
  ua            text,
  traits        jsonb not null default '{}'::jsonb -- device, tela, idioma, connection, etc.
);

-- 2. IDENTIDADE (pessoa — telefone entra quando semeada) -----------------------
create table if not exists public.mesh_identidade (
  id       uuid primary key default gen_random_uuid(),
  phone    text unique,                            -- E.164; NULL até semear (múltiplos NULL ok)
  nome     text,
  emails   text[] not null default '{}'::text[],
  traits   jsonb  not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);

-- 3. VÍNCULO (aresta dispositivo <-> identidade, com confiança/evidência) ------
create table if not exists public.mesh_vinculo (
  device_fp     text not null references public.mesh_device(device_fp) on delete cascade,
  identidade_id uuid not null references public.mesh_identidade(id) on delete cascade,
  confianca     numeric not null default 1.0,      -- 1.0 = seed direto; <1 = probabilístico
  evidencia     text,                              -- 'seed_whatsapp' | 'form' | 'ip_ua_match' ...
  criado_em     timestamptz not null default now(),
  primary key (device_fp, identidade_id)
);

-- 4. SINAL (evento cru — APPEND-ONLY, fonte da verdade) ------------------------
create table if not exists public.mesh_sinal (
  id         bigint generated always as identity primary key,
  device_fp  text,                                 -- pode chegar antes de existir em mesh_device
  site       text not null,                        -- 'moleta' | 'tupperware' | ...
  tipo       text not null,                        -- page_view | car_detail_view | whatsapp_click | ...
  veiculo_id uuid,
  ip         inet,
  asn        text,                                 -- p/ filtro de bot/datacenter
  geo        jsonb,
  referrer   text,
  utm        jsonb,                                -- inclui fbclid/gclid -> ROI por anúncio
  payload    jsonb not null default '{}'::jsonb,
  criado_em  timestamptz not null default now()
);

create index if not exists mesh_sinal_device_idx  on public.mesh_sinal(device_fp);
create index if not exists mesh_sinal_criado_idx  on public.mesh_sinal(criado_em);
create index if not exists mesh_sinal_site_idx    on public.mesh_sinal(site);
create index if not exists mesh_sinal_tipo_idx    on public.mesh_sinal(tipo);
create index if not exists mesh_vinculo_ident_idx on public.mesh_vinculo(identidade_id);

-- 5. APPEND-ONLY duro em mesh_sinal (bloqueia UPDATE/DELETE até via service_role) [G3]
create or replace function public.mesh_sinal_append_only()
returns trigger language plpgsql as $$
begin
  raise exception 'mesh_sinal e append-only: % bloqueado', tg_op;
end;
$$;

drop trigger if exists mesh_sinal_no_mutate on public.mesh_sinal;
create trigger mesh_sinal_no_mutate
  before update or delete on public.mesh_sinal
  for each row execute function public.mesh_sinal_append_only();

-- 6. RLS — nega anon em tudo (lead data e privado; escrita so server-side c/ secret) ---
alter table public.mesh_device     enable row level security;
alter table public.mesh_identidade enable row level security;
alter table public.mesh_vinculo    enable row level security;
alter table public.mesh_sinal       enable row level security;
-- Sem policy criada => anon/authenticated negados por padrao. service_role bypassa RLS.
