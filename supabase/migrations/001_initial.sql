create extension if not exists pgcrypto;

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  full_name varchar(150) not null,
  date_of_birth date,
  date_of_death date,
  generation_level integer not null check (generation_level >= 1),
  profession varchar(100),
  city varchar(100),
  country varchar(100) default 'India',
  photo_url text default '',
  bio text default '',
  phone varchar(30),
  email varchar(255),
  profile_status varchar(20) not null default 'approved'
    check (profile_status in ('approved','pending','disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_relationships (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.family_members(id) on delete cascade,
  related_person_id uuid not null references public.family_members(id) on delete cascade,
  relationship_type varchar(20) not null check (relationship_type in ('parent','child','spouse')),
  created_at timestamptz not null default now(),
  unique(person_id, related_person_id, relationship_type)
);

create table if not exists public.profile_submissions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.family_members(id) on delete set null,
  full_name varchar(150) not null,
  profession varchar(100),
  city varchar(100),
  country varchar(100),
  bio text,
  phone varchar(30),
  email varchar(255),
  photo_url text,
  status varchar(20) not null default 'pending'
    check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create index if not exists idx_family_members_profession on public.family_members(profession);
create index if not exists idx_family_members_city on public.family_members(city);
create index if not exists idx_family_members_country on public.family_members(country);
create index if not exists idx_family_members_generation on public.family_members(generation_level);
create index if not exists idx_family_relationships_person on public.family_relationships(person_id);
create index if not exists idx_family_relationships_related on public.family_relationships(related_person_id);

alter table public.family_members enable row level security;
alter table public.family_relationships enable row level security;
alter table public.profile_submissions enable row level security;

-- Production policy baseline: authenticated members may read approved hierarchy/profile data.
create policy "authenticated members can read approved family members"
on public.family_members for select
to authenticated
using (profile_status = 'approved');

create policy "authenticated members can read relationships"
on public.family_relationships for select
to authenticated
using (true);

-- Submissions may be created by authenticated users. Admin review should be enforced
-- through a dedicated admin role/claim before enabling update/delete policies.
create policy "authenticated members can submit profiles"
on public.profile_submissions for insert
to authenticated
with check (true);

-- Admin policies should be added once the production auth/admin claim strategy is selected.
-- Do not expose the Supabase service-role key to the browser.
