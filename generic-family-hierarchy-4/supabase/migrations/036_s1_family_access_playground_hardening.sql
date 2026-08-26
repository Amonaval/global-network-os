-- S1 hardening — family escape paths + independent Playground feature visibility.
-- Run after 035.

alter table public.profiles add column if not exists family_lobby_mode boolean not null default false;

create or replace function public.clear_family_lobby_on_activation() returns trigger
language plpgsql set search_path=public as $$
begin
  if new.active_network_id is not null then new.family_lobby_mode:=false; end if;
  return new;
end $$;
drop trigger if exists trg_profiles_clear_family_lobby on public.profiles;
create trigger trg_profiles_clear_family_lobby before insert or update of active_network_id on public.profiles
for each row execute function public.clear_family_lobby_on_activation();

create or replace function public.current_network_id() returns uuid
language sql security definer stable set search_path=public as $$
  select case when coalesce(p.family_lobby_mode,false) then null else coalesce(
    (
      select p.active_network_id
      from public.network_memberships active_nm
      where active_nm.network_id=p.active_network_id
        and active_nm.user_id=p.id
        and active_nm.status='active'
      limit 1
    ),
    (
      select nm.network_id
      from public.network_memberships nm
      join public.networks n on n.id=nm.network_id and n.status='active'
      where nm.user_id=p.id and nm.status='active'
      order by nm.joined_at desc
      limit 1
    )
  ) end
  from public.profiles p
  where p.id=auth.uid()
  limit 1;
$$;
revoke all on function public.current_network_id() from public;
grant execute on function public.current_network_id() to authenticated;

create or replace function public.set_active_network(p_network_id uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
  if not public.is_network_member(p_network_id) then
    raise exception 'You are not an active member of this family.' using errcode='42501';
  end if;
  update public.profiles set active_network_id=p_network_id,family_lobby_mode=false,updated_at=now() where id=auth.uid();
end $$;
revoke all on function public.set_active_network(uuid) from public;
grant execute on function public.set_active_network(uuid) to authenticated;

create or replace function public.enter_family_lobby() returns void
language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'Sign in is required.' using errcode='42501'; end if;
  update public.profiles set active_network_id=null,family_lobby_mode=true,updated_at=now() where id=auth.uid();
end $$;
revoke all on function public.enter_family_lobby() from public;
grant execute on function public.enter_family_lobby() to authenticated;

create or replace function public.leave_current_family() returns text
language plpgsql security definer set search_path=public as $$
declare
  uid uuid:=auth.uid();
  nid uuid;
  actor_role text;
  active_accounts integer;
  owner_accounts integer;
  profile_count integer;
begin
  if uid is null then raise exception 'Sign in is required.' using errcode='42501'; end if;
  select p.active_network_id into nid from public.profiles p where p.id=uid;
  if nid is null then raise exception 'Choose a family before leaving it.' using errcode='22023'; end if;
  select nm.role into actor_role from public.network_memberships nm where nm.network_id=nid and nm.user_id=uid and nm.status='active';
  if actor_role is null then raise exception 'You are not an active member of this family.' using errcode='42501'; end if;
  select count(*) into active_accounts from public.network_memberships where network_id=nid and status='active';
  select count(*) into owner_accounts from public.network_memberships where network_id=nid and status='active' and role='owner';
  select count(*) into profile_count from public.family_members where network_id=nid;

  if actor_role='owner' and active_accounts=1 and profile_count<=1 then
    update public.networks set status='archived',updated_at=now() where id=nid;
    update public.network_memberships set status='left' where network_id=nid and user_id=uid;
    update public.profiles set active_network_id=null,member_id=null,family_lobby_mode=true,updated_at=now() where id=uid;
    return 'archived';
  end if;

  if actor_role='owner' and owner_accounts<=1 then
    raise exception 'You are the only Owner of a populated family. Use Family Lobby to switch/unlink without leaving, or add another Owner before leaving.' using errcode='42501';
  end if;

  update public.network_memberships set status='left' where network_id=nid and user_id=uid;
  update public.profiles set active_network_id=null,member_id=null,family_lobby_mode=true,updated_at=now() where id=uid;
  insert into public.audit_log(network_id,actor_id,action,details) values(nid,uid,'family_membership_left','{}'::jsonb);
  return 'left';
end $$;
revoke all on function public.leave_current_family() from public;
grant execute on function public.leave_current_family() to authenticated;

-- Playground exposure is intentionally independent from real-family rollout.
create table if not exists public.platform_playground_features (
  feature_key varchar(80) primary key references public.platform_feature_flags(feature_key) on delete cascade,
  enabled boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.platform_playground_features enable row level security;
revoke all on public.platform_playground_features from anon,authenticated;

insert into public.platform_playground_features(feature_key,enabled)
select feature_key,true from public.platform_feature_flags
on conflict(feature_key) do nothing;

create or replace function public.get_playground_features()
returns table(feature_key varchar,enabled boolean)
language sql security definer stable set search_path=public as $$
  select f.feature_key,coalesce(p.enabled,true)
  from public.platform_feature_flags f
  left join public.platform_playground_features p on p.feature_key=f.feature_key
  order by f.bundle_key,f.feature_key;
$$;
revoke all on function public.get_playground_features() from public;
grant execute on function public.get_playground_features() to anon,authenticated;

create or replace function public.get_playground_launch_console()
returns table(feature_key varchar,enabled boolean,updated_at timestamptz)
language plpgsql security definer stable set search_path=public as $$
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access is required.' using errcode='42501'; end if;
  return query
  select f.feature_key,coalesce(p.enabled,true),coalesce(p.updated_at,f.updated_at)
  from public.platform_feature_flags f
  left join public.platform_playground_features p on p.feature_key=f.feature_key
  order by f.bundle_key,f.feature_key;
end $$;
revoke all on function public.get_playground_launch_console() from public;
grant execute on function public.get_playground_launch_console() to authenticated;

create or replace function public.set_playground_feature_visibility(p_feature_key varchar,p_enabled boolean)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access is required.' using errcode='42501'; end if;
  if not exists(select 1 from public.platform_feature_flags where feature_key=p_feature_key) then
    raise exception 'Unknown feature key: %',p_feature_key using errcode='P0002';
  end if;
  insert into public.platform_playground_features(feature_key,enabled,updated_by,updated_at)
  values(p_feature_key,coalesce(p_enabled,false),auth.uid(),now())
  on conflict(feature_key) do update set enabled=excluded.enabled,updated_by=auth.uid(),updated_at=now();
end $$;
revoke all on function public.set_playground_feature_visibility(varchar,boolean) from public;
grant execute on function public.set_playground_feature_visibility(varchar,boolean) to authenticated;
