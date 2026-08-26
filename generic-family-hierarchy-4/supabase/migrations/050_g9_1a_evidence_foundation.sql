-- G9.1-A Evidence Foundation
-- Additive only: no G9 tables/functions are altered.

create table if not exists public.network_knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  network_id uuid not null references public.networks(id) on delete cascade,
  source_type text not null,
  external_id text,
  title text not null,
  uri text,
  connector_id text,
  visibility text not null default 'network' check (visibility in ('network','restricted')),
  authorization_refs text[] not null default '{}',
  content_hash text,
  source_updated_at timestamptz,
  last_observed_at timestamptz not null default now(),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.network_evidence_records (
  id uuid primary key default gen_random_uuid(),
  network_id uuid not null references public.networks(id) on delete cascade,
  source_id uuid not null references public.network_knowledge_sources(id) on delete cascade,
  document_external_id text,
  chunk_id text not null,
  title text,
  uri text,
  section text,
  breadcrumb jsonb not null default '[]',
  content_hash text not null,
  excerpt text,
  source_updated_at timestamptz,
  captured_at timestamptz not null default now(),
  visibility text not null default 'network' check (visibility in ('network','restricted')),
  authorization_refs text[] not null default '{}',
  extraction_version text,
  metadata jsonb not null default '{}',
  unique(network_id, source_id, chunk_id, content_hash)
);

create table if not exists public.network_candidate_assertions (
  id uuid primary key default gen_random_uuid(),
  network_id uuid not null references public.networks(id) on delete cascade,
  subject jsonb not null,
  predicate text not null,
  object jsonb not null,
  evidence_ids uuid[] not null default '{}',
  confidence numeric(5,4) not null check (confidence >= 0 and confidence <= 1),
  extraction_method text not null,
  extractor_version text,
  status text not null default 'candidate'
    check (status in ('candidate','verified','rejected','superseded','conflicted')),
  supersedes_assertion_id uuid references public.network_candidate_assertions(id),
  reviewed_by uuid,
  reviewed_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.network_assertion_decisions (
  id uuid primary key default gen_random_uuid(),
  network_id uuid not null references public.networks(id) on delete cascade,
  assertion_id uuid not null references public.network_candidate_assertions(id) on delete cascade,
  action text not null check (action in ('accept','reject','merge','supersede')),
  actor_user_id uuid not null,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists idx_network_knowledge_sources_network on public.network_knowledge_sources(network_id);
create index if not exists idx_network_evidence_network on public.network_evidence_records(network_id);
create index if not exists idx_network_evidence_source on public.network_evidence_records(source_id);
create index if not exists idx_network_candidate_assertions_network_status on public.network_candidate_assertions(network_id,status);
create index if not exists idx_network_assertion_decisions_assertion on public.network_assertion_decisions(assertion_id);

alter table public.network_knowledge_sources enable row level security;
alter table public.network_evidence_records enable row level security;
alter table public.network_candidate_assertions enable row level security;
alter table public.network_assertion_decisions enable row level security;

-- Reuse the existing membership table as the tenant boundary.
drop policy if exists "g91a knowledge sources network members" on public.network_knowledge_sources;
create policy "g91a knowledge sources network members" on public.network_knowledge_sources
for select using (exists (
  select 1 from public.network_memberships nm
  where nm.network_id=network_knowledge_sources.network_id and nm.user_id=auth.uid() and nm.status='active'
) and network_knowledge_sources.visibility='network');

drop policy if exists "g91a evidence network members" on public.network_evidence_records;
create policy "g91a evidence network members" on public.network_evidence_records
for select using (exists (
  select 1 from public.network_memberships nm
  where nm.network_id=network_evidence_records.network_id and nm.user_id=auth.uid() and nm.status='active'
) and network_evidence_records.visibility='network');

drop policy if exists "g91a candidate assertions network members" on public.network_candidate_assertions;
create policy "g91a candidate assertions network members" on public.network_candidate_assertions
for select using (exists (
  select 1 from public.network_memberships nm
  where nm.network_id=network_candidate_assertions.network_id and nm.user_id=auth.uid() and nm.status='active'
));

drop policy if exists "g91a assertion decisions network members" on public.network_assertion_decisions;
create policy "g91a assertion decisions network members" on public.network_assertion_decisions
for select using (exists (
  select 1 from public.network_memberships nm
  where nm.network_id=network_assertion_decisions.network_id and nm.user_id=auth.uid() and nm.status='active'
));

-- Writes deliberately remain closed in G9.1-A. Later batches must use reviewed
-- RPC/service boundaries rather than granting broad client insert/update access.
