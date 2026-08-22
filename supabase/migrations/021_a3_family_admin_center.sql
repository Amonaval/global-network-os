-- A3 — Family Admin Center backend. Run after 020.
-- Family-scoped administration only; no platform-global role escalation.

create or replace function public.get_family_admin_summary()
returns table(member_profiles bigint,claimed_profiles bigint,active_invitations bigint,admin_count bigint,media_usage_bytes bigint,storage_limit_bytes bigint,photo_max_bytes integer)
language plpgsql security definer stable set search_path=public,storage as $$
declare nid uuid:=public.current_network_id();
begin
 if not public.is_network_admin(nid) then raise exception 'Family administrator access is required.' using errcode='42501'; end if;
 return query
 select
  (select count(*) from public.family_members m where m.network_id=nid),
  (select count(*) from public.network_memberships nm where nm.network_id=nid and nm.status='active' and nm.member_id is not null),
  (select count(*) from public.member_invitations i where i.network_id=nid and i.status='active' and i.expires_at>now()),
  (select count(*) from public.network_memberships nm where nm.network_id=nid and nm.status='active' and nm.role in ('owner','admin')),
  coalesce((select sum(coalesce((o.metadata->>'size')::bigint,0)) from storage.objects o where o.name like nid::text||'/%'),0)::bigint,
  n.storage_limit_bytes,n.photo_max_bytes
 from public.networks n where n.id=nid;
end $$;
revoke all on function public.get_family_admin_summary() from public;
grant execute on function public.get_family_admin_summary() to authenticated;

create or replace function public.get_family_memberships()
returns table(user_id uuid,role varchar,status varchar,member_id uuid,display_name text,email text,member_name varchar)
language plpgsql security definer stable set search_path=public,auth as $$
declare nid uuid:=public.current_network_id();
begin
 if not public.is_network_admin(nid) then raise exception 'Family administrator access is required.' using errcode='42501'; end if;
 return query select nm.user_id,nm.role,nm.status,nm.member_id,
  coalesce(p.full_name,u.raw_user_meta_data->>'full_name',split_part(u.email,'@',1))::text,u.email::text,fm.full_name
 from public.network_memberships nm
 left join public.profiles p on p.id=nm.user_id
 left join auth.users u on u.id=nm.user_id
 left join public.family_members fm on fm.id=nm.member_id and fm.network_id=nid
 where nm.network_id=nid and nm.status='active'
 order by case nm.role when 'owner' then 0 when 'admin' then 1 else 2 end,coalesce(fm.full_name,p.full_name,u.email);
end $$;
revoke all on function public.get_family_memberships() from public;
grant execute on function public.get_family_memberships() to authenticated;

create or replace function public.set_family_member_role(p_user_id uuid,p_role varchar)
returns void language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); actor_role varchar; target_role varchar;
begin
 if p_role not in ('admin','member') then raise exception 'Role must be admin or member.' using errcode='22023'; end if;
 select role into actor_role from public.network_memberships where network_id=nid and user_id=auth.uid() and status='active';
 if actor_role not in ('owner','admin') then raise exception 'Family administrator access is required.' using errcode='42501'; end if;
 select role into target_role from public.network_memberships where network_id=nid and user_id=p_user_id and status='active';
 if target_role is null then raise exception 'This account is not an active member of this family.' using errcode='P0002'; end if;
 if target_role='owner' then raise exception 'The family owner role cannot be changed here.' using errcode='42501'; end if;
 if actor_role='admin' and target_role='admin' and p_user_id<>auth.uid() then raise exception 'Only the family owner can change another administrator.' using errcode='42501'; end if;
 if p_user_id=auth.uid() and p_role='member' and actor_role='admin' then raise exception 'Ask the family owner to remove your administrator role.' using errcode='42501'; end if;
 update public.network_memberships set role=p_role where network_id=nid and user_id=p_user_id;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'family_role_changed',jsonb_build_object('user_id',p_user_id,'role',p_role));
end $$;
revoke all on function public.set_family_member_role(uuid,varchar) from public;
grant execute on function public.set_family_member_role(uuid,varchar) to authenticated;
