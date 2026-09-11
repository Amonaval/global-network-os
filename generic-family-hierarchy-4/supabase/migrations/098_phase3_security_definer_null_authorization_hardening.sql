-- Phase 3 security hardening — close NULL authorization bypasses in SECURITY DEFINER role checks.
-- Rerunnable. Apply after 094_xp6_participation_parity.sql.
--
-- PostgreSQL three-valued logic makes `NULL NOT IN (...)` and `NULL <> 'owner'`
-- evaluate to NULL, not TRUE. In PL/pgSQL `IF NULL THEN` does not execute.
-- Every role lookup used as an authorization gate must therefore reject NULL explicitly.

create or replace function public.create_network_participation_invitation(
  p_network_id uuid,
  p_email text,
  p_target_ref uuid default null,
  p_target_kind text default null,
  p_invited_role text default 'member',
  p_expires_days integer default 14
)
returns jsonb language plpgsql security definer set search_path=public as $$
declare actor text; v public.network_participation_invitations%rowtype;
begin
 select role into actor from public.network_memberships where network_id=p_network_id and user_id=auth.uid() and status='active';
 if actor is null or actor not in ('owner','admin') then raise exception 'Network admin access required.' using errcode='42501';end if;
 if position('@' in trim(coalesce(p_email,'')))<2 then raise exception 'Valid email required.' using errcode='22023';end if;
 if p_invited_role='admin' and actor<>'owner' then raise exception 'Only owner can invite an admin.' using errcode='42501';end if;
 update public.network_participation_invitations set status='expired',updated_at=now() where network_id=p_network_id and status='pending' and expires_at<=now();
 select * into v from public.network_participation_invitations where network_id=p_network_id and lower(email)=lower(trim(p_email)) and status='pending' order by created_at desc limit 1;
 if found then return jsonb_build_object('id',v.id,'token',v.token,'email',v.email,'expiresAt',v.expires_at,'status',v.status);end if;
 insert into public.network_participation_invitations(network_id,email,target_ref,target_kind,invited_role,expires_at,created_by)
 values(p_network_id,lower(trim(p_email)),p_target_ref,nullif(trim(coalesce(p_target_kind,'')),''),case when p_invited_role='admin' then 'admin' else 'member' end,now()+make_interval(days=>greatest(1,least(30,coalesce(p_expires_days,14)))),auth.uid()) returning * into v;
 return jsonb_build_object('id',v.id,'token',v.token,'email',v.email,'expiresAt',v.expires_at,'status',v.status);
end $$;

create or replace function public.set_family_member_role(p_user_id uuid,p_role varchar)
returns void language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); actor_role varchar; target_role varchar;
begin
 if p_role not in ('admin','member') then raise exception 'Role must be admin or member.' using errcode='22023'; end if;
 select role into actor_role from public.network_memberships where network_id=nid and user_id=auth.uid() and status='active';
 if actor_role is null or actor_role not in ('owner','admin') then raise exception 'Family administrator access is required.' using errcode='42501'; end if;
 select role into target_role from public.network_memberships where network_id=nid and user_id=p_user_id and status='active';
 if target_role is null then raise exception 'This account is not an active member of this family.' using errcode='P0002'; end if;
 if target_role='owner' then raise exception 'The family owner role cannot be changed here.' using errcode='42501'; end if;
 if actor_role='admin' and target_role='admin' and p_user_id<>auth.uid() then raise exception 'Only the family owner can change another administrator.' using errcode='42501'; end if;
 if p_user_id=auth.uid() and p_role='member' and actor_role='admin' then raise exception 'Ask the family owner to remove your administrator role.' using errcode='42501'; end if;
 update public.network_memberships set role=p_role where network_id=nid and user_id=p_user_id;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'family_role_changed',jsonb_build_object('user_id',p_user_id,'role',p_role));
end $$;

create or replace function public.set_productized_network_member_role(p_user_id uuid,p_role text) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); actor_role text; target_role text;
begin
 if not public.g8_productized_vertical((select vertical_kind from public.networks where id=nid)) then raise exception 'Productized network required.' using errcode='42501'; end if;
 select role into actor_role from public.network_memberships where network_id=nid and user_id=auth.uid() and status='active';
 if actor_role is null or actor_role<>'owner' then raise exception 'Only the network owner can change admin roles.' using errcode='42501'; end if;
 if p_user_id=auth.uid() then raise exception 'The owner role cannot be changed here.' using errcode='42501'; end if;
 if p_role not in ('admin','member') then raise exception 'Invalid member role.' using errcode='22023'; end if;
 select role into target_role from public.network_memberships where network_id=nid and user_id=p_user_id and status='active';
 if target_role is null or target_role='owner' then raise exception 'Target member cannot be changed.' using errcode='22023'; end if;
 update public.network_memberships set role=p_role where network_id=nid and user_id=p_user_id;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'productized_member_role_changed',jsonb_build_object('user_id',p_user_id,'role',p_role));
end $$;

create or replace function public.remove_productized_network_member(p_user_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); actor_role text; target_role text;
begin
 if not public.g8_productized_vertical((select vertical_kind from public.networks where id=nid)) then raise exception 'Productized network required.' using errcode='42501'; end if;
 select role into actor_role from public.network_memberships where network_id=nid and user_id=auth.uid() and status='active';
 if actor_role is null or actor_role not in ('owner','admin') then raise exception 'Network admin access required.' using errcode='42501'; end if;
 if p_user_id=auth.uid() then raise exception 'Use the network switcher/lobby to leave your own network.' using errcode='42501'; end if;
 select role into target_role from public.network_memberships where network_id=nid and user_id=p_user_id and status='active';
 if target_role is null or target_role='owner' then raise exception 'The network owner cannot be removed.' using errcode='42501'; end if;
 if target_role='admin' and actor_role<>'owner' then raise exception 'Only the owner can remove an admin.' using errcode='42501'; end if;
 update public.network_memberships set status='left' where network_id=nid and user_id=p_user_id;
 update public.network_entities set owner_user_id=null,updated_at=now() where network_id=nid and owner_user_id=p_user_id;
 update public.profiles set active_network_id=null,updated_at=now() where id=p_user_id and active_network_id=nid;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'productized_member_removed',jsonb_build_object('user_id',p_user_id,'previous_role',target_role));
end $$;

revoke all on function public.create_network_participation_invitation(uuid,text,uuid,text,text,integer) from public;
grant execute on function public.create_network_participation_invitation(uuid,text,uuid,text,text,integer) to authenticated;
revoke all on function public.set_family_member_role(uuid,varchar) from public;
grant execute on function public.set_family_member_role(uuid,varchar) to authenticated;
revoke all on function public.set_productized_network_member_role(uuid,text) from public;
grant execute on function public.set_productized_network_member_role(uuid,text) to authenticated;
revoke all on function public.remove_productized_network_member(uuid) from public;
grant execute on function public.remove_productized_network_member(uuid) to authenticated;

-- Fail migration if the primary vulnerable function is not present after replacement.
do $$
begin
 if to_regprocedure('public.create_network_participation_invitation(uuid,text,uuid,text,text,integer)') is null then
  raise exception 'Phase-3 security hardening failed: invitation function missing.';
 end if;
end $$;
