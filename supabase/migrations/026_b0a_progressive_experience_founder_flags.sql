-- B0-A — Product Simplification Foundation
-- Progressive member experience + platform-owner launch gates.
-- Run after 025.

alter table public.profiles
  add column if not exists experience_level varchar(20) not null default 'simple'
  check (experience_level in ('simple','connected','explorer'));

create table if not exists public.platform_owners (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Preserve the original installation administrator as the initial platform owner.
-- A1 stopped using profiles.role for family administration, so this does not
-- promote later family admins to platform ownership.
insert into public.platform_owners(user_id)
select p.id from public.profiles p
where p.role='admin'
order by p.created_at,p.id
limit 1
on conflict(user_id) do nothing;

create or replace function public.is_platform_owner()
returns boolean language sql security definer stable set search_path=public as $$
  select auth.uid() is not null and exists(
    select 1 from public.platform_owners po where po.user_id=auth.uid()
  );
$$;
revoke all on function public.is_platform_owner() from public;
grant execute on function public.is_platform_owner() to authenticated;

alter table public.platform_owners enable row level security;
drop policy if exists "platform owner can read own ownership" on public.platform_owners;
create policy "platform owner can read own ownership"
on public.platform_owners for select to authenticated
using (user_id=auth.uid());

create table if not exists public.platform_feature_flags (
  feature_key varchar(80) primary key,
  bundle_key varchar(40) not null,
  rollout_state varchar(20) not null default 'hidden'
    check (rollout_state in ('hidden','test','pilot','released')),
  pilot_network_ids uuid[] not null default '{}',
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state) values
 ('core.home','core','released'),
 ('core.family','core','released'),
 ('core.directory','core','released'),
 ('core.profile','core','released'),
 ('remember.memories','remember','test'),
 ('remember.history','remember','test'),
 ('celebrate.special_days','celebrate','released'),
 ('connect.places','connect','test'),
 ('connect.community','connect','test'),
 ('connect.gatherings','connect','test'),
 ('contribute.help_family','contribute','test'),
 ('share.family','share','test'),
 ('share.public_profiles','share','test'),
 ('share.print_qr','share','test'),
 ('advanced.relationships','connect','test'),
 ('admin.center','admin','released'),
 ('admin.import','admin','released'),
 ('admin.governance','admin','released')
on conflict(feature_key) do nothing;

alter table public.platform_feature_flags enable row level security;
-- No direct client mutations. Reads/writes go through security-definer RPCs.

drop function if exists public.get_effective_platform_features();
create function public.get_effective_platform_features()
returns table(feature_key varchar, rollout_state varchar, enabled boolean)
language sql security definer stable set search_path=public as $$
  select f.feature_key,f.rollout_state,
    case f.rollout_state
      when 'released' then true
      when 'test' then public.is_platform_owner()
      when 'pilot' then public.is_platform_owner() or coalesce(public.current_network_id()=any(f.pilot_network_ids),false)
      else false
    end as enabled
  from public.platform_feature_flags f
  order by f.bundle_key,f.feature_key;
$$;
revoke all on function public.get_effective_platform_features() from public;
grant execute on function public.get_effective_platform_features() to authenticated;

create or replace function public.set_platform_feature_rollout(
  p_feature_key varchar,
  p_rollout_state varchar,
  p_pilot_network_ids uuid[] default '{}'
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
      pilot_network_ids=coalesce(p_pilot_network_ids,'{}'),
      updated_by=auth.uid(),
      updated_at=now()
  where feature_key=p_feature_key;
  if not found then raise exception 'Unknown feature key: %',p_feature_key using errcode='P0002'; end if;
end $$;
revoke all on function public.set_platform_feature_rollout(varchar,varchar,uuid[]) from public;
grant execute on function public.set_platform_feature_rollout(varchar,varchar,uuid[]) to authenticated;

create or replace function public.set_my_experience_level(p_level varchar)
returns void language plpgsql security definer set search_path=public as $$
begin
  if p_level not in ('simple','connected','explorer') then
    raise exception 'Invalid experience level.' using errcode='22023';
  end if;
  update public.profiles set experience_level=p_level,updated_at=now() where id=auth.uid();
end $$;
revoke all on function public.set_my_experience_level(varchar) from public;
grant execute on function public.set_my_experience_level(varchar) to authenticated;

comment on table public.platform_feature_flags is 'Founder-controlled release gates. Hidden/Test/Pilot/Released is independent from family role and member experience level.';
comment on column public.profiles.experience_level is 'Member-facing complexity level. Family administration remains a separate role-gated surface.';
