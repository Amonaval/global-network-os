-- Showcase flow repair — make network creation + membership + activation atomic and repair legacy profile gaps.
-- This migration is additive and intentionally keeps auto-approval as the current default.

-- 1) Repair accounts that exist in auth.users but are missing the application profile row.
insert into public.profiles(id, full_name)
select u.id, coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'),''), split_part(coalesce(u.email,''),'@',1), '')
from auth.users u
left join public.profiles p on p.id=u.id
where p.id is null
on conflict(id) do nothing;

-- 2) Repair only genuinely orphaned creator memberships. Existing role transfers are preserved.
insert into public.network_memberships(network_id,user_id,role,status)
select n.id,n.created_by,'owner','active'
from public.networks n
where n.created_by is not null
  and not exists(
    select 1 from public.network_memberships nm
    where nm.network_id=n.id and nm.user_id=n.created_by
  )
on conflict(network_id,user_id) do nothing;

-- 3) Finalize every newly-created network through one generic contract.
--    The creator profile and membership are guaranteed before the UI is told creation succeeded.
create or replace function public.finalize_network_creation(
  p_network_id uuid,
  p_previous_network_id uuid default null
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare
  v_required boolean:=false;
  v_creator uuid;
  v_status text;
  v_name text;
begin
  if auth.uid() is null then raise exception 'Sign in required.' using errcode='42501'; end if;

  select n.created_by,n.name into v_creator,v_name
  from public.networks n where n.id=p_network_id;
  if v_creator is null then raise exception 'Network not found.' using errcode='P0002'; end if;
  if v_creator<>auth.uid() and not public.is_platform_owner() then
    raise exception 'Only the creator or platform owner can finalize this network.' using errcode='42501';
  end if;

  insert into public.profiles(id,full_name)
  select u.id,coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'),''),split_part(coalesce(u.email,''),'@',1),'')
  from auth.users u where u.id=v_creator
  on conflict(id) do nothing;

  insert into public.network_memberships(network_id,user_id,role,status)
  values(p_network_id,v_creator,'owner','active')
  on conflict(network_id,user_id) do update
    set role=case when public.network_memberships.status<>'active' then 'owner' else public.network_memberships.role end,
        status='active';

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

  if v_status='approved' then
    update public.profiles
      set active_network_id=p_network_id,family_lobby_mode=false,updated_at=now()
      where id=v_creator;
  else
    -- Creation RPCs historically activate the network before approval is known.
    -- Restore the caller's previous valid context rather than dropping them into limbo.
    update public.profiles
      set active_network_id=(case
        when p_previous_network_id is not null
         and exists(select 1 from public.network_memberships x where x.network_id=p_previous_network_id and x.user_id=v_creator and x.status='active')
        then p_previous_network_id else null end),
        family_lobby_mode=true,updated_at=now()
      where id=v_creator;
  end if;

  return jsonb_build_object(
    'network_id',p_network_id,
    'network_name',v_name,
    'approval_status',v_status,
    'membership_ready',exists(select 1 from public.network_memberships nm where nm.network_id=p_network_id and nm.user_id=v_creator and nm.status='active'),
    'active_network_id',(select p.active_network_id from public.profiles p where p.id=v_creator)
  );
end $$;
revoke all on function public.finalize_network_creation(uuid,uuid) from public;
grant execute on function public.finalize_network_creation(uuid,uuid) to authenticated;

-- Backward-compatible wrapper used by older clients.
create or replace function public.register_network_creation(p_network_id uuid)
returns text language plpgsql security definer set search_path=public as $$
declare v_result jsonb;
begin
  v_result:=public.finalize_network_creation(p_network_id,null);
  return coalesce(v_result->>'approval_status','approved');
end $$;
revoke all on function public.register_network_creation(uuid) from public;
grant execute on function public.register_network_creation(uuid) to authenticated;

-- 4) My Networks must be membership-driven. A missing profile row must never hide memberships.
drop function if exists public.get_my_networks();
create function public.get_my_networks()
returns table(network_id uuid,name varchar,slug varchar,role varchar,status varchar,storage_limit_bytes bigint,photo_upload_enabled boolean,photo_max_bytes integer,is_active boolean,vertical_kind varchar,network_template varchar)
language sql security definer stable set search_path=public as $$
  select n.id,n.name,n.slug,nm.role,nm.status,n.storage_limit_bytes,n.photo_upload_enabled,n.photo_max_bytes,
         coalesce(p.active_network_id=n.id,false),n.vertical_kind,coalesce(ns.network_template,n.vertical_kind)
  from public.network_memberships nm
  join public.networks n on n.id=nm.network_id
  left join public.profiles p on p.id=nm.user_id
  left join public.network_settings ns on ns.network_id=n.id
  where nm.user_id=auth.uid() and nm.status='active' and n.status='active'
    and (n.approval_status='approved' or public.is_platform_owner())
  order by coalesce(p.active_network_id=n.id,false) desc,n.name;
$$;
revoke all on function public.get_my_networks() from public;
grant execute on function public.get_my_networks() to authenticated;

-- 5) Activating a network repairs the profile row if necessary and verifies the result.
create or replace function public.set_active_network(p_network_id uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'Sign in required.' using errcode='42501'; end if;
  if not public.is_network_member(p_network_id) then raise exception 'You are not an active member of this network.' using errcode='42501'; end if;
  if coalesce((select approval_status from public.networks where id=p_network_id),'pending')<>'approved' and not public.is_platform_owner() then
    raise exception 'This network is waiting for platform approval.' using errcode='42501';
  end if;

  insert into public.profiles(id,full_name,active_network_id,family_lobby_mode,updated_at)
  select u.id,coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'),''),split_part(coalesce(u.email,''),'@',1),''),p_network_id,false,now()
  from auth.users u where u.id=auth.uid()
  on conflict(id) do update
    set active_network_id=excluded.active_network_id,family_lobby_mode=false,updated_at=now();

  if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.active_network_id=p_network_id) then
    raise exception 'Network activation could not be persisted.' using errcode='P0001';
  end if;
end $$;
revoke all on function public.set_active_network(uuid) from public;
grant execute on function public.set_active_network(uuid) to authenticated;

-- 6) Approval also self-heals an orphaned creator membership.
create or replace function public.review_network_creation(p_network_id uuid,p_action text,p_note text default null)
returns text language plpgsql security definer set search_path=public as $$
declare v_status text; v_creator uuid;
begin
  if not public.is_platform_owner() then raise exception 'Platform-owner access required.' using errcode='42501'; end if;
  if p_action not in ('approve','reject') then raise exception 'Action must be approve or reject.' using errcode='22023'; end if;
  select created_by into v_creator from public.networks where id=p_network_id;
  if v_creator is null then raise exception 'Network not found.' using errcode='P0002'; end if;
  v_status:=case when p_action='approve' then 'approved' else 'rejected' end;

  if v_status='approved' then
    insert into public.profiles(id,full_name)
    select u.id,coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'),''),split_part(coalesce(u.email,''),'@',1),'')
    from auth.users u where u.id=v_creator on conflict(id) do nothing;
    insert into public.network_memberships(network_id,user_id,role,status)
    values(p_network_id,v_creator,'owner','active')
    on conflict(network_id,user_id) do update set status='active';
  end if;

  update public.networks
  set approval_status=v_status,approval_reviewed_at=now(),approval_reviewed_by=auth.uid(),approval_note=nullif(trim(coalesce(p_note,'')),''),updated_at=now()
  where id=p_network_id;
  return v_status;
end $$;
revoke all on function public.review_network_creation(uuid,text,text) from public;
grant execute on function public.review_network_creation(uuid,text,text) to authenticated;
