-- A1 — Multi-family foundation
-- Run after 018. Converts the legacy single family into the first tenant without deleting data.
-- Priority: isolation first. Self-service family creation/joining is A2.

create table if not exists public.networks (
  id uuid primary key default gen_random_uuid(),
  name varchar(180) not null,
  slug varchar(80) not null unique,
  status varchar(20) not null default 'active' check (status in ('active','archived')),
  storage_limit_bytes bigint not null default 104857600 check (storage_limit_bytes between 1048576 and 10737418240),
  photo_upload_enabled boolean not null default false,
  photo_max_bytes integer not null default 102400 check (photo_max_bytes between 10240 and 1048576),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.network_memberships (
  network_id uuid not null references public.networks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role varchar(20) not null default 'member' check (role in ('owner','admin','member')),
  status varchar(20) not null default 'active' check (status in ('active','invited','suspended','left')),
  joined_at timestamptz not null default now(),
  primary key(network_id,user_id)
);
create index if not exists idx_network_memberships_user on public.network_memberships(user_id,status,network_id);

alter table public.profiles add column if not exists active_network_id uuid references public.networks(id) on delete set null;

-- Bootstrap the existing single-family installation into one tenant.
do $$
declare
  legacy_id uuid;
  legacy_name text;
  legacy_photo boolean;
  owner_id uuid;
begin
  select name,coalesce(photo_upload_enabled,false) into legacy_name,legacy_photo
  from public.network_settings where id='network' limit 1;

  select id into legacy_id from public.networks order by created_at limit 1;
  if legacy_id is null then
    select id into owner_id from public.profiles where role='admin' order by id limit 1;
    insert into public.networks(name,slug,created_by,photo_upload_enabled)
    values(coalesce(nullif(legacy_name,''),'Our Family'),'our-family',owner_id,coalesce(legacy_photo,false))
    returning id into legacy_id;
  end if;

  -- Existing admins become admins; the first admin becomes owner. Existing users become members.
  insert into public.network_memberships(network_id,user_id,role,status)
  select legacy_id,p.id,case when p.role='admin' then 'admin' else 'member' end,'active'
  from public.profiles p
  on conflict(network_id,user_id) do nothing;

  select p.id into owner_id from public.profiles p where p.role='admin' order by p.id limit 1;
  if owner_id is not null then
    update public.network_memberships set role='owner' where network_id=legacy_id and user_id=owner_id;
  end if;

  update public.profiles set active_network_id=legacy_id where active_network_id is null;
end $$;

create or replace function public.current_network_id() returns uuid
language sql security definer stable set search_path=public as $$
  select p.active_network_id
  from public.profiles p
  join public.network_memberships nm on nm.network_id=p.active_network_id and nm.user_id=p.id and nm.status='active'
  where p.id=auth.uid()
  limit 1;
$$;
revoke all on function public.current_network_id() from public;
grant execute on function public.current_network_id() to authenticated;

create or replace function public.is_network_member(p_network_id uuid default public.current_network_id()) returns boolean
language sql security definer stable set search_path=public as $$
  select auth.uid() is not null and exists(
    select 1 from public.network_memberships nm
    where nm.network_id=p_network_id and nm.user_id=auth.uid() and nm.status='active'
  );
$$;
revoke all on function public.is_network_member(uuid) from public;
grant execute on function public.is_network_member(uuid) to authenticated;

create or replace function public.is_network_admin(p_network_id uuid default public.current_network_id()) returns boolean
language sql security definer stable set search_path=public as $$
  select auth.uid() is not null and exists(
    select 1 from public.network_memberships nm
    where nm.network_id=p_network_id and nm.user_id=auth.uid() and nm.status='active' and nm.role in ('owner','admin')
  );
$$;
revoke all on function public.is_network_admin(uuid) from public;
grant execute on function public.is_network_admin(uuid) to authenticated;

-- Preserve old callers while changing admin semantics from global admin to active-family admin.
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path=public as $$
  select public.is_network_admin(public.current_network_id());
$$;

create or replace function public.set_active_network(p_network_id uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
  if not public.is_network_member(p_network_id) then
    raise exception 'You are not an active member of this family.' using errcode='42501';
  end if;
  update public.profiles set active_network_id=p_network_id,updated_at=now() where id=auth.uid();
end $$;
revoke all on function public.set_active_network(uuid) from public;
grant execute on function public.set_active_network(uuid) to authenticated;

create or replace function public.get_my_networks()
returns table(network_id uuid,name varchar,slug varchar,role varchar,status varchar,storage_limit_bytes bigint,photo_upload_enabled boolean,photo_max_bytes integer,is_active boolean)
language sql security definer stable set search_path=public as $$
  select n.id,n.name,n.slug,nm.role,nm.status,n.storage_limit_bytes,n.photo_upload_enabled,n.photo_max_bytes,(p.active_network_id=n.id)
  from public.network_memberships nm
  join public.networks n on n.id=nm.network_id
  join public.profiles p on p.id=nm.user_id
  where nm.user_id=auth.uid() and nm.status='active' and n.status='active'
  order by (p.active_network_id=n.id) desc,n.name;
$$;
revoke all on function public.get_my_networks() from public;
grant execute on function public.get_my_networks() to authenticated;

-- Tenant-own every family-domain table. Defaults keep legacy RPCs/inserts working for the active family.
do $$
declare t text;
begin
  foreach t in array array[
    'network_settings','family_members','family_relationships','profile_submissions','audit_log','change_requests',
    'member_invitations','member_life_events','memories','memory_people','notifications','notification_preferences',
    'contribution_suggestions','community_groups','community_group_members','community_events','community_event_responses','participation_events'
  ] loop
    if to_regclass('public.'||t) is not null then
      execute format('alter table public.%I add column if not exists network_id uuid references public.networks(id) on delete cascade',t);
      execute format('update public.%I set network_id=(select id from public.networks order by created_at limit 1) where network_id is null',t);
      execute format('alter table public.%I alter column network_id set default public.current_network_id()',t);
      execute format('alter table public.%I alter column network_id set not null',t);
      execute format('create index if not exists %I on public.%I(network_id)', 'idx_'||t||'_network',t);
    end if;
  end loop;
end $$;

-- network_settings remains backward-compatible but is now one row per family.
alter table public.network_settings drop constraint if exists network_settings_pkey;
alter table public.network_settings drop constraint if exists network_settings_id_check;
alter table public.network_settings add constraint network_settings_pkey primary key(network_id);
create unique index if not exists uq_network_settings_network on public.network_settings(network_id);

-- Core RLS isolation. Existing specialized RPCs still enforce their own governance;
-- these policies make direct table access tenant-safe.
alter table public.networks enable row level security;
alter table public.network_memberships enable row level security;
drop policy if exists "members read their networks" on public.networks;
create policy "members read their networks" on public.networks for select to authenticated
using (public.is_network_member(id));
drop policy if exists "admins update their network" on public.networks;
create policy "admins update their network" on public.networks for update to authenticated
using (public.is_network_admin(id)) with check (public.is_network_admin(id));
drop policy if exists "users read their memberships" on public.network_memberships;
create policy "users read their memberships" on public.network_memberships for select to authenticated
using (user_id=auth.uid() or public.is_network_admin(network_id));
drop policy if exists "owners manage memberships" on public.network_memberships;
create policy "owners manage memberships" on public.network_memberships for all to authenticated
using (public.is_network_admin(network_id)) with check (public.is_network_admin(network_id));

-- Replace the broad network-settings policies introduced by the legacy single-network model.
drop policy if exists "authenticated can read network settings" on public.network_settings;
drop policy if exists "admins can manage network settings" on public.network_settings;
drop policy if exists "members read network settings" on public.network_settings;
create policy "members read network settings" on public.network_settings for select to authenticated
using (network_id=public.current_network_id() and public.is_network_member(network_id));
drop policy if exists "family admins manage network settings" on public.network_settings;
create policy "family admins manage network settings" on public.network_settings for all to authenticated
using (network_id=public.current_network_id() and public.is_network_admin(network_id))
with check (network_id=public.current_network_id() and public.is_network_admin(network_id));

-- Critical direct-read tables: add a restrictive tenant policy. Restrictive policies combine with existing permissive policies.
do $$
declare t text; pname text;
begin
  foreach t in array array[
    'family_members','family_relationships','profile_submissions','audit_log','change_requests','member_invitations',
    'member_life_events','memories','memory_people','notifications','notification_preferences','contribution_suggestions',
    'community_groups','community_group_members','community_events','community_event_responses','participation_events'
  ] loop
    if to_regclass('public.'||t) is not null then
      execute format('alter table public.%I enable row level security',t);
      pname := 'tenant isolation '||t;
      execute format('drop policy if exists %I on public.%I',pname,t);
      execute format('create policy %I on public.%I as restrictive for all to authenticated using (network_id=public.current_network_id()) with check (network_id=public.current_network_id())',pname,t);
    end if;
  end loop;
end $$;

-- Make profile visibility itself membership-aware while retaining self access.
drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile" on public.profiles for select to authenticated
using (id=auth.uid() or exists(
  select 1 from public.network_memberships mine
  join public.network_memberships theirs on theirs.network_id=mine.network_id
  where mine.user_id=auth.uid() and mine.status='active' and theirs.user_id=profiles.id and theirs.status='active'
));

-- Keep legacy network settings aligned with the tenant control row.
update public.network_settings ns
set photo_upload_enabled=n.photo_upload_enabled
from public.networks n where n.id=ns.network_id;

comment on table public.networks is 'A1 tenant boundary: one row per independent family network.';
comment on table public.network_memberships is 'User-to-family membership and family-scoped role. Owner/admin are not platform-global roles.';
