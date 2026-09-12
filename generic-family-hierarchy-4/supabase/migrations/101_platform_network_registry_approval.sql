-- S4/S5 follow-up — Generic platform network registry + approval governance
-- Default remains frictionless: all signed-in creators are auto-approved.

alter table public.platform_onboarding_settings
  add column if not exists network_creation_approval_required boolean not null default false;

-- Current showcase decision: auto-approval ON.
update public.platform_onboarding_settings
set network_creation_approval_required=false,
    family_creation_approval_required=false,
    updated_at=now()
where id='default';

alter table public.networks add column if not exists approval_status varchar(20) not null default 'approved';
alter table public.networks add column if not exists approval_requested_at timestamptz;
alter table public.networks add column if not exists approval_reviewed_at timestamptz;
alter table public.networks add column if not exists approval_reviewed_by uuid references auth.users(id) on delete set null;
alter table public.networks add column if not exists approval_note text;
alter table public.networks drop constraint if exists networks_approval_status_check;
alter table public.networks add constraint networks_approval_status_check check (approval_status in ('pending','approved','rejected'));
update public.networks set approval_status='approved' where approval_status is null;
create index if not exists idx_networks_approval_status on public.networks(approval_status,vertical_kind,created_at desc);

create or replace function public.get_network_creation_policy()
returns boolean language sql security definer stable set search_path=public as $$
  select coalesce((select network_creation_approval_required from public.platform_onboarding_settings where id='default'),false);
$$;
revoke all on function public.get_network_creation_policy() from public;
grant execute on function public.get_network_creation_policy() to authenticated;

create or replace function public.set_network_creation_policy(p_approval_required boolean)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_platform_owner() then raise exception 'Platform-owner access required.' using errcode='42501'; end if;
  insert into public.platform_onboarding_settings(id,family_creation_approval_required,network_creation_approval_required,updated_at,updated_by)
  values('default',coalesce(p_approval_required,false),coalesce(p_approval_required,false),now(),auth.uid())
  on conflict(id) do update
    set family_creation_approval_required=excluded.family_creation_approval_required,
        network_creation_approval_required=excluded.network_creation_approval_required,
        updated_at=now(),updated_by=auth.uid();
end $$;
revoke all on function public.set_network_creation_policy(boolean) from public;
grant execute on function public.set_network_creation_policy(boolean) to authenticated;

-- Backward-compatible Family toggle now controls the generic platform policy.
create or replace function public.get_family_creation_policy()
returns boolean language sql security definer stable set search_path=public as $$
  select public.get_network_creation_policy();
$$;
revoke all on function public.get_family_creation_policy() from public;
grant execute on function public.get_family_creation_policy() to authenticated;

create or replace function public.set_family_creation_policy(p_approval_required boolean)
returns void language plpgsql security definer set search_path=public as $$
begin
  perform public.set_network_creation_policy(p_approval_required);
end $$;
revoke all on function public.set_family_creation_policy(boolean) from public;
grant execute on function public.set_family_creation_policy(boolean) to authenticated;

-- Called immediately after the existing create RPC completes.
create or replace function public.register_network_creation(p_network_id uuid)
returns text language plpgsql security definer set search_path=public as $$
declare
  v_required boolean:=false;
  v_creator uuid;
  v_status text;
begin
  if auth.uid() is null then raise exception 'Sign in required.' using errcode='42501'; end if;
  select created_by into v_creator from public.networks where id=p_network_id;
  if v_creator is null then raise exception 'Network not found.' using errcode='P0002'; end if;
  if v_creator<>auth.uid() and not public.is_platform_owner() then raise exception 'Only the creator or platform owner can register this network.' using errcode='42501'; end if;
  select public.get_network_creation_policy() into v_required;
  v_status:=case when public.is_platform_owner() or not v_required then 'approved' else 'pending' end;
  update public.networks
  set approval_status=v_status,
      approval_requested_at=coalesce(approval_requested_at,now()),
      approval_reviewed_at=case when v_status='approved' then now() else null end,
      approval_reviewed_by=case when v_status='approved' and public.is_platform_owner() then auth.uid() else null end,
      approval_note=case when v_status='approved' then 'Auto-approved by platform creation policy.' else null end,
      updated_at=now()
  where id=p_network_id;
  if v_status='pending' then
    update public.profiles set active_network_id=null,family_lobby_mode=true,updated_at=now() where id=auth.uid();
  end if;
  return v_status;
end $$;
revoke all on function public.register_network_creation(uuid) from public;
grant execute on function public.register_network_creation(uuid) to authenticated;

create or replace function public.get_network_approval_status(p_network_id uuid)
returns text language sql security definer stable set search_path=public as $$
  select n.approval_status from public.networks n
  where n.id=p_network_id and (n.created_by=auth.uid() or public.is_network_member(n.id) or public.is_platform_owner());
$$;
revoke all on function public.get_network_approval_status(uuid) from public;
grant execute on function public.get_network_approval_status(uuid) to authenticated;

create or replace function public.get_platform_network_registry()
returns table(network_id uuid,name varchar,slug varchar,vertical_kind varchar,approval_status varchar,network_status varchar,creator_user_id uuid,creator_email text,created_at timestamptz,reviewed_at timestamptz,approval_note text,member_count bigint)
language sql security definer stable set search_path=public as $$
  select n.id,n.name,n.slug,n.vertical_kind,n.approval_status,n.status,n.created_by,u.email::text,n.created_at,n.approval_reviewed_at,n.approval_note,
         (select count(*) from public.network_memberships nm where nm.network_id=n.id and nm.status='active')
  from public.networks n
  left join auth.users u on u.id=n.created_by
  where public.is_platform_owner()
  order by (n.approval_status='pending') desc,n.created_at desc;
$$;
revoke all on function public.get_platform_network_registry() from public;
grant execute on function public.get_platform_network_registry() to authenticated;

create or replace function public.review_network_creation(p_network_id uuid,p_action text,p_note text default null)
returns text language plpgsql security definer set search_path=public as $$
declare v_status text;
begin
  if not public.is_platform_owner() then raise exception 'Platform-owner access required.' using errcode='42501'; end if;
  if p_action not in ('approve','reject') then raise exception 'Action must be approve or reject.' using errcode='22023'; end if;
  if not exists(select 1 from public.networks where id=p_network_id) then raise exception 'Network not found.' using errcode='P0002'; end if;
  v_status:=case when p_action='approve' then 'approved' else 'rejected' end;
  update public.networks
  set approval_status=v_status,
      approval_reviewed_at=now(),approval_reviewed_by=auth.uid(),approval_note=nullif(trim(coalesce(p_note,'')),''),updated_at=now()
  where id=p_network_id;
  return v_status;
end $$;
revoke all on function public.review_network_creation(uuid,text,text) from public;
grant execute on function public.review_network_creation(uuid,text,text) to authenticated;

-- Pending/rejected networks never appear in a normal user's My Networks list.
drop function if exists public.get_my_networks();
create function public.get_my_networks()
returns table(network_id uuid,name varchar,slug varchar,role varchar,status varchar,storage_limit_bytes bigint,photo_upload_enabled boolean,photo_max_bytes integer,is_active boolean,vertical_kind varchar,network_template varchar)
language sql security definer stable set search_path=public as $$
  select n.id,n.name,n.slug,nm.role,nm.status,n.storage_limit_bytes,n.photo_upload_enabled,n.photo_max_bytes,
         (p.active_network_id=n.id),n.vertical_kind,coalesce(ns.network_template,n.vertical_kind)
  from public.network_memberships nm
  join public.networks n on n.id=nm.network_id
  join public.profiles p on p.id=nm.user_id
  left join public.network_settings ns on ns.network_id=n.id
  where nm.user_id=auth.uid() and nm.status='active' and n.status='active'
    and (n.approval_status='approved' or public.is_platform_owner())
  order by (p.active_network_id=n.id) desc,n.name;
$$;
revoke all on function public.get_my_networks() from public;
grant execute on function public.get_my_networks() to authenticated;

create or replace function public.set_active_network(p_network_id uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
  if not public.is_network_member(p_network_id) then raise exception 'You are not an active member of this network.' using errcode='42501'; end if;
  if coalesce((select approval_status from public.networks where id=p_network_id),'pending')<>'approved' and not public.is_platform_owner() then
    raise exception 'This network is waiting for platform approval.' using errcode='42501';
  end if;
  update public.profiles set active_network_id=p_network_id,family_lobby_mode=false,updated_at=now() where id=auth.uid();
end $$;
revoke all on function public.set_active_network(uuid) from public;
grant execute on function public.set_active_network(uuid) to authenticated;
