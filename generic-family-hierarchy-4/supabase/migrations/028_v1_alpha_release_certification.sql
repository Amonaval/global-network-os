-- V1 — Family Alpha Release Certification
-- Essential account-recovery + multi-owner Launch Control support.
-- Run after 027.

create table if not exists public.platform_owner_audit (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  target_user_id uuid references auth.users(id) on delete set null,
  action varchar(20) not null check (action in ('added','removed')),
  created_at timestamptz not null default now()
);
alter table public.platform_owner_audit enable row level security;
-- Founder-only reads are exposed through a security-definer RPC; no direct client policy is required.

create or replace function public.get_platform_owners()
returns table(user_id uuid,email text,created_at timestamptz,is_me boolean)
language sql security definer stable set search_path=public,auth as $$
  select po.user_id,u.email,po.created_at,(po.user_id=auth.uid())
  from public.platform_owners po
  join auth.users u on u.id=po.user_id
  where public.is_platform_owner()
  order by po.created_at,lower(coalesce(u.email,''));
$$;
revoke all on function public.get_platform_owners() from public;
grant execute on function public.get_platform_owners() to authenticated;

create or replace function public.add_platform_owner_by_email(p_email text)
returns uuid
language plpgsql security definer set search_path=public,auth as $$
declare
  v_target uuid;
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access is required.' using errcode='42501';
  end if;
  select id into v_target from auth.users where lower(email)=lower(trim(p_email)) limit 1;
  if v_target is null then
    raise exception 'No Family Network account was found for that email. Ask them to create/sign in to an account first.' using errcode='P0002';
  end if;
  insert into public.platform_owners(user_id) values(v_target) on conflict(user_id) do nothing;
  if found then
    insert into public.platform_owner_audit(actor_user_id,target_user_id,action) values(auth.uid(),v_target,'added');
  end if;
  return v_target;
end $$;
revoke all on function public.add_platform_owner_by_email(text) from public;
grant execute on function public.add_platform_owner_by_email(text) to authenticated;

create or replace function public.remove_platform_owner(p_user_id uuid)
returns void
language plpgsql security definer set search_path=public as $$
declare
  v_count integer;
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access is required.' using errcode='42501';
  end if;
  if not exists(select 1 from public.platform_owners where user_id=p_user_id) then
    raise exception 'That account is not a platform owner.' using errcode='P0002';
  end if;
  select count(*) into v_count from public.platform_owners;
  if v_count<=1 then
    raise exception 'At least one platform owner must remain.' using errcode='23514';
  end if;
  delete from public.platform_owners where user_id=p_user_id;
  insert into public.platform_owner_audit(actor_user_id,target_user_id,action) values(auth.uid(),p_user_id,'removed');
end $$;
revoke all on function public.remove_platform_owner(uuid) from public;
grant execute on function public.remove_platform_owner(uuid) to authenticated;

create or replace function public.get_platform_owner_audit(p_limit integer default 20)
returns table(id uuid,actor_email text,target_email text,action varchar,created_at timestamptz)
language sql security definer stable set search_path=public,auth as $$
  select a.id,actor.email,target.email,a.action,a.created_at
  from public.platform_owner_audit a
  left join auth.users actor on actor.id=a.actor_user_id
  left join auth.users target on target.id=a.target_user_id
  where public.is_platform_owner()
  order by a.created_at desc
  limit greatest(1,least(coalesce(p_limit,20),100));
$$;
revoke all on function public.get_platform_owner_audit(integer) from public;
grant execute on function public.get_platform_owner_audit(integer) to authenticated;

-- Optional safe Day-1 preset for first-family release. It never runs automatically.
-- Core family + special days + administration are released; richer capabilities return to Test.
create or replace function public.apply_alpha_day1_launch_preset()
returns integer
language plpgsql security definer set search_path=public as $$
declare
  v_changed integer:=0;
  r record;
  v_new_state varchar;
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access is required.' using errcode='42501';
  end if;
  for r in select feature_key,bundle_key,rollout_state from public.platform_feature_flags loop
    v_new_state:=case when r.bundle_key in ('core','celebrate','admin') then 'released' else 'test' end;
    if r.rollout_state is distinct from v_new_state then
      update public.platform_feature_flags
      set rollout_state=v_new_state,pilot_network_ids='{}',updated_by=auth.uid(),updated_at=now()
      where feature_key=r.feature_key;
      v_changed:=v_changed+1;
    end if;
  end loop;
  return v_changed;
end $$;
revoke all on function public.apply_alpha_day1_launch_preset() from public;
grant execute on function public.apply_alpha_day1_launch_preset() to authenticated;

comment on function public.add_platform_owner_by_email(text) is 'Founder-only: grant Launch Control to an existing Family Network account by email.';
comment on function public.remove_platform_owner(uuid) is 'Founder-only: revoke Launch Control while preventing removal of the final platform owner.';
