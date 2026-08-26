-- B0-B — Progressive Launch System
-- Founder release control + family-level member controls + one-time feature discovery.
-- Run after 026.

alter table public.platform_feature_flags
  add column if not exists announcement_version integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.network_feature_settings (
  network_id uuid not null references public.networks(id) on delete cascade,
  feature_key varchar(80) not null references public.platform_feature_flags(feature_key) on delete cascade,
  enabled boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key(network_id,feature_key)
);
alter table public.network_feature_settings enable row level security;
-- No direct client writes. Family admins use RPCs below.

drop policy if exists "family members read feature settings" on public.network_feature_settings;
create policy "family members read feature settings"
on public.network_feature_settings for select to authenticated
using (public.is_network_member(network_id) or public.is_platform_owner());

create table if not exists public.user_feature_discoveries (
  user_id uuid not null references auth.users(id) on delete cascade,
  feature_key varchar(80) not null references public.platform_feature_flags(feature_key) on delete cascade,
  announcement_version integer not null,
  seen_at timestamptz not null default now(),
  primary key(user_id,feature_key,announcement_version)
);
alter table public.user_feature_discoveries enable row level security;

create table if not exists public.platform_feature_rollout_audit (
  id bigint generated always as identity primary key,
  feature_key varchar(80) not null,
  bundle_key varchar(40) not null,
  previous_state varchar(20) not null,
  new_state varchar(20) not null,
  pilot_network_ids uuid[] not null default '{}',
  announced boolean not null default false,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);
alter table public.platform_feature_rollout_audit enable row level security;
-- Read through a platform-owner RPC; no client writes.

create or replace function public.audit_platform_feature_rollout()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if old.rollout_state is distinct from new.rollout_state
     or old.pilot_network_ids is distinct from new.pilot_network_ids
     or old.announcement_version is distinct from new.announcement_version then
    insert into public.platform_feature_rollout_audit(feature_key,bundle_key,previous_state,new_state,pilot_network_ids,announced,changed_by,changed_at)
    values(new.feature_key,new.bundle_key,old.rollout_state,new.rollout_state,new.pilot_network_ids,new.announcement_version>old.announcement_version,new.updated_by,now());
  end if;
  return new;
end $$;

drop trigger if exists trg_platform_feature_rollout_audit on public.platform_feature_flags;
create trigger trg_platform_feature_rollout_audit
after update on public.platform_feature_flags
for each row execute function public.audit_platform_feature_rollout();

drop policy if exists "users read own feature discoveries" on public.user_feature_discoveries;
create policy "users read own feature discoveries"
on public.user_feature_discoveries for select to authenticated using(user_id=auth.uid());

-- Founder-facing raw launch data. Effective feature RPC remains member-safe.
drop function if exists public.get_platform_launch_console();
create function public.get_platform_launch_console()
returns table(
  feature_key varchar,
  bundle_key varchar,
  rollout_state varchar,
  pilot_network_ids uuid[],
  announcement_version integer,
  updated_at timestamptz
)
language plpgsql security definer stable set search_path=public as $$
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access is required.' using errcode='42501';
  end if;
  return query
  select f.feature_key,f.bundle_key,f.rollout_state,f.pilot_network_ids,f.announcement_version,f.updated_at
  from public.platform_feature_flags f
  order by f.bundle_key,f.feature_key;
end $$;
revoke all on function public.get_platform_launch_console() from public;
grant execute on function public.get_platform_launch_console() to authenticated;

drop function if exists public.get_platform_rollout_audit(integer);
create function public.get_platform_rollout_audit(p_limit integer default 30)
returns table(id bigint,feature_key varchar,bundle_key varchar,previous_state varchar,new_state varchar,pilot_network_ids uuid[],announced boolean,changed_at timestamptz)
language plpgsql security definer stable set search_path=public as $$
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access is required.' using errcode='42501';
  end if;
  return query
  select a.id,a.feature_key,a.bundle_key,a.previous_state,a.new_state,a.pilot_network_ids,a.announced,a.changed_at
  from public.platform_feature_rollout_audit a
  order by a.changed_at desc,a.id desc
  limit greatest(1,least(coalesce(p_limit,30),100));
end $$;
revoke all on function public.get_platform_rollout_audit(integer) from public;
grant execute on function public.get_platform_rollout_audit(integer) to authenticated;

-- Small platform-level family directory for pilot targeting only.
drop function if exists public.get_platform_family_targets();
create function public.get_platform_family_targets()
returns table(network_id uuid,name varchar,slug varchar,status varchar,member_count bigint)
language plpgsql security definer stable set search_path=public as $$
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access is required.' using errcode='42501';
  end if;
  return query
  select n.id,n.name,n.slug,n.status,
    (select count(*) from public.network_memberships nm where nm.network_id=n.id and nm.status='active')
  from public.networks n
  order by n.created_at desc,n.name;
end $$;
revoke all on function public.get_platform_family_targets() from public;
grant execute on function public.get_platform_family_targets() to authenticated;

-- Replace B0-A rollout writer with an announcement-aware version.
drop function if exists public.set_platform_feature_rollout(varchar,varchar,uuid[]);
drop function if exists public.set_platform_feature_rollout(varchar,varchar,uuid[],boolean);
create function public.set_platform_feature_rollout(
  p_feature_key varchar,
  p_rollout_state varchar,
  p_pilot_network_ids uuid[] default '{}',
  p_announce boolean default false
) returns void
language plpgsql security definer set search_path=public as $$
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access is required.' using errcode='42501';
  end if;
  if p_rollout_state not in ('hidden','test','pilot','released') then
    raise exception 'Invalid rollout state.' using errcode='22023';
  end if;
  update public.platform_feature_flags
  set rollout_state=p_rollout_state,
      pilot_network_ids=case when p_rollout_state='pilot' then coalesce(p_pilot_network_ids,'{}') else '{}' end,
      announcement_version=announcement_version + case when p_announce and p_rollout_state in ('pilot','released') then 1 else 0 end,
      updated_by=auth.uid(),
      updated_at=now()
  where feature_key=p_feature_key;
  if not found then raise exception 'Unknown feature key: %',p_feature_key using errcode='P0002'; end if;
end $$;
revoke all on function public.set_platform_feature_rollout(varchar,varchar,uuid[],boolean) from public;
grant execute on function public.set_platform_feature_rollout(varchar,varchar,uuid[],boolean) to authenticated;

-- One action can roll out a coherent bundle while keeping solo overrides possible.
drop function if exists public.set_platform_bundle_rollout(varchar,varchar,uuid[],boolean);
create function public.set_platform_bundle_rollout(
  p_bundle_key varchar,
  p_rollout_state varchar,
  p_pilot_network_ids uuid[] default '{}',
  p_announce boolean default false
) returns integer
language plpgsql security definer set search_path=public as $$
declare changed integer;
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access is required.' using errcode='42501';
  end if;
  if p_rollout_state not in ('hidden','test','pilot','released') then
    raise exception 'Invalid rollout state.' using errcode='22023';
  end if;
  update public.platform_feature_flags
  set rollout_state=p_rollout_state,
      pilot_network_ids=case when p_rollout_state='pilot' then coalesce(p_pilot_network_ids,'{}') else '{}' end,
      announcement_version=announcement_version + case when p_announce and p_rollout_state in ('pilot','released') then 1 else 0 end,
      updated_by=auth.uid(),updated_at=now()
  where bundle_key=p_bundle_key;
  get diagnostics changed = row_count;
  if changed=0 then raise exception 'Unknown feature bundle: %',p_bundle_key using errcode='P0002'; end if;
  return changed;
end $$;
revoke all on function public.set_platform_bundle_rollout(varchar,varchar,uuid[],boolean) from public;
grant execute on function public.set_platform_bundle_rollout(varchar,varchar,uuid[],boolean) to authenticated;

-- Family admins can only narrow member-facing capabilities; they cannot release founder-hidden features.
drop function if exists public.get_family_feature_settings();
create function public.get_family_feature_settings()
returns table(feature_key varchar,enabled boolean)
language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
  if nid is null or not public.is_network_admin(nid) then
    raise exception 'Family admin access is required.' using errcode='42501';
  end if;
  return query
  select f.feature_key,coalesce(s.enabled,true)
  from public.platform_feature_flags f
  left join public.network_feature_settings s on s.network_id=nid and s.feature_key=f.feature_key
  where f.bundle_key<>'admin'
  order by f.bundle_key,f.feature_key;
end $$;
revoke all on function public.get_family_feature_settings() from public;
grant execute on function public.get_family_feature_settings() to authenticated;

drop function if exists public.set_family_feature_setting(varchar,boolean);
create function public.set_family_feature_setting(p_feature_key varchar,p_enabled boolean)
returns void language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); bundle text;
begin
  if nid is null or not public.is_network_admin(nid) then
    raise exception 'Family admin access is required.' using errcode='42501';
  end if;
  select bundle_key into bundle from public.platform_feature_flags where feature_key=p_feature_key;
  if bundle is null then raise exception 'Unknown feature key: %',p_feature_key using errcode='P0002'; end if;
  if bundle='admin' then raise exception 'Admin capabilities are not member-view controls.' using errcode='22023'; end if;
  insert into public.network_feature_settings(network_id,feature_key,enabled,updated_by,updated_at)
  values(nid,p_feature_key,p_enabled,auth.uid(),now())
  on conflict(network_id,feature_key) do update
    set enabled=excluded.enabled,updated_by=excluded.updated_by,updated_at=excluded.updated_at;
end $$;
revoke all on function public.set_family_feature_setting(varchar,boolean) from public;
grant execute on function public.set_family_feature_setting(varchar,boolean) to authenticated;

-- Effective visibility = founder launch gate AND family member control.
drop function if exists public.get_effective_platform_features();
create function public.get_effective_platform_features()
returns table(feature_key varchar, rollout_state varchar, enabled boolean)
language sql security definer stable set search_path=public as $$
  select f.feature_key,f.rollout_state,
    (
      case f.rollout_state
        when 'released' then true
        when 'test' then public.is_platform_owner()
        when 'pilot' then public.is_platform_owner() or coalesce(public.current_network_id()=any(f.pilot_network_ids),false)
        else false
      end
      and case when f.bundle_key='admin' then true else coalesce(s.enabled,true) end
    ) as enabled
  from public.platform_feature_flags f
  left join public.network_feature_settings s
    on s.network_id=public.current_network_id() and s.feature_key=f.feature_key
  order by f.bundle_key,f.feature_key;
$$;
revoke all on function public.get_effective_platform_features() from public;
grant execute on function public.get_effective_platform_features() to authenticated;

-- One-time discovery feed. Client still applies the member's experience-tier filter.
drop function if exists public.get_my_feature_announcements();
create function public.get_my_feature_announcements()
returns table(feature_key varchar,announcement_version integer,rollout_state varchar,updated_at timestamptz)
language sql security definer stable set search_path=public as $$
  select f.feature_key,f.announcement_version,f.rollout_state,f.updated_at
  from public.platform_feature_flags f
  left join public.network_feature_settings s
    on s.network_id=public.current_network_id() and s.feature_key=f.feature_key
  where f.announcement_version>0
    and (
      case f.rollout_state
        when 'released' then true
        when 'test' then public.is_platform_owner()
        when 'pilot' then public.is_platform_owner() or coalesce(public.current_network_id()=any(f.pilot_network_ids),false)
        else false
      end
    )
    and (f.bundle_key='admin' or coalesce(s.enabled,true))
    and not exists(
      select 1 from public.user_feature_discoveries d
      where d.user_id=auth.uid() and d.feature_key=f.feature_key and d.announcement_version=f.announcement_version
    )
  order by f.updated_at desc;
$$;
revoke all on function public.get_my_feature_announcements() from public;
grant execute on function public.get_my_feature_announcements() to authenticated;

drop function if exists public.mark_feature_announcement_seen(varchar,integer);
create function public.mark_feature_announcement_seen(p_feature_key varchar,p_announcement_version integer)
returns void language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'Sign in required.' using errcode='42501'; end if;
  insert into public.user_feature_discoveries(user_id,feature_key,announcement_version)
  values(auth.uid(),p_feature_key,p_announcement_version)
  on conflict do nothing;
end $$;
revoke all on function public.mark_feature_announcement_seen(varchar,integer) from public;
grant execute on function public.mark_feature_announcement_seen(varchar,integer) to authenticated;

comment on table public.network_feature_settings is 'Family-admin member-view preferences. They can only narrow platform founder rollout, never override it.';
comment on table public.user_feature_discoveries is 'Per-user acknowledgement of founder-announced feature rollout versions.';
