
-- A2 — Autonomous Create / Join / Invite / Claim
-- Run after 019. Keeps the family product tenant-safe while allowing self-service onboarding.

alter table public.network_memberships add column if not exists member_id uuid references public.family_members(id) on delete set null;
create unique index if not exists uq_network_memberships_claim
  on public.network_memberships(network_id,member_id) where member_id is not null;

-- Backfill the legacy active-family claim into the membership row.
update public.network_memberships nm
set member_id=p.member_id
from public.profiles p
where p.id=nm.user_id and p.active_network_id=nm.network_id and p.member_id is not null and nm.member_id is null;

create or replace function public.slugify_family_name(p_name text) returns text
language sql immutable set search_path=public as $$
  select trim(both '-' from regexp_replace(lower(coalesce(p_name,'')),'[^a-z0-9]+','-','g'));
$$;

create or replace function public.create_family(p_name text,p_slug text default null,p_description text default '')
returns uuid
language plpgsql security definer set search_path=public as $$
declare
  uid uuid:=auth.uid(); nid uuid; base_slug text; final_slug text; suffix integer:=1;
begin
  if uid is null then raise exception 'Sign in is required to create a family.' using errcode='42501'; end if;
  if length(trim(coalesce(p_name,'')))<2 then raise exception 'Please give your family a name.' using errcode='22023'; end if;

  base_slug:=public.slugify_family_name(coalesce(nullif(trim(p_slug),''),p_name));
  if length(base_slug)<2 then base_slug:='family'; end if;
  base_slug:=left(base_slug,60); final_slug:=base_slug;
  while exists(select 1 from public.networks where slug=final_slug) loop
    suffix:=suffix+1; final_slug:=left(base_slug,54)||'-'||suffix::text;
  end loop;

  insert into public.networks(name,slug,created_by,photo_upload_enabled)
  values(left(trim(p_name),180),final_slug,uid,false) returning id into nid;

  insert into public.network_memberships(network_id,user_id,role,status)
  values(nid,uid,'owner','active');

  insert into public.network_settings(
    id,network_id,name,description,entity_label,entity_label_plural,level_label,level_label_plural,
    parent_label,child_label,peer_label,network_template,photo_upload_enabled
  ) values(
    'network',nid,left(trim(p_name),180),coalesce(p_description,''),'Member','Members','Generation','Generations',
    'Parent','Child','Spouse','family',false
  );

  update public.profiles set active_network_id=nid,member_id=null,updated_at=now() where id=uid;
  return nid;
end;
$$;
revoke all on function public.create_family(text,text,text) from public;
grant execute on function public.create_family(text,text,text) to authenticated;

-- Switching families also switches the legacy profile.member_id compatibility pointer.
create or replace function public.set_active_network(p_network_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare claimed uuid;
begin
  if not public.is_network_member(p_network_id) then
    raise exception 'You are not an active member of this family.' using errcode='42501';
  end if;
  select nm.member_id into claimed from public.network_memberships nm
   where nm.network_id=p_network_id and nm.user_id=auth.uid() and nm.status='active';
  update public.profiles set active_network_id=p_network_id,member_id=claimed,updated_at=now() where id=auth.uid();
end $$;
revoke all on function public.set_active_network(uuid) from public;
grant execute on function public.set_active_network(uuid) to authenticated;

drop function if exists public.get_my_networks();
create function public.get_my_networks()
returns table(network_id uuid,name varchar,slug varchar,role varchar,status varchar,storage_limit_bytes bigint,
              photo_upload_enabled boolean,photo_max_bytes integer,is_active boolean,member_id uuid)
language sql security definer stable set search_path=public as $$
  select n.id,n.name,n.slug,nm.role,nm.status,n.storage_limit_bytes,n.photo_upload_enabled,n.photo_max_bytes,
         (p.active_network_id=n.id),nm.member_id
  from public.network_memberships nm
  join public.networks n on n.id=nm.network_id
  join public.profiles p on p.id=nm.user_id
  where nm.user_id=auth.uid() and nm.status='active' and n.status='active'
  order by (p.active_network_id=n.id) desc,n.name;
$$;
revoke all on function public.get_my_networks() from public;
grant execute on function public.get_my_networks() to authenticated;

-- A2 invitation preview intentionally reveals only minimal onboarding data to a holder of the opaque token.
drop function if exists public.get_invitation_preview(text);
create function public.get_invitation_preview(p_token text)
returns table(member_name text,status text,expires_at timestamptz,family_name text,family_slug text)
language plpgsql security definer set search_path=public,extensions as $$
declare target_id uuid;
begin
  if length(coalesce(p_token,''))<32 then return; end if;
  select i.id into target_id from public.member_invitations i
    where i.token_hash=encode(digest(p_token,'sha256'),'hex') limit 1;
  if target_id is null then return; end if;
  update public.member_invitations set first_opened_at=coalesce(first_opened_at,now()) where id=target_id;
  return query
    select fm.full_name::text,public.invitation_status(i.used_at,i.revoked_at,i.expires_at),i.expires_at,
           n.name::text,n.slug::text
    from public.member_invitations i
    join public.family_members fm on fm.id=i.member_id and fm.network_id=i.network_id
    join public.networks n on n.id=i.network_id
    where i.id=target_id;
end;
$$;
revoke all on function public.get_invitation_preview(text) from public;
grant execute on function public.get_invitation_preview(text) to anon,authenticated;

-- Tenant-safe replacements for invitation administration.
create or replace function public.create_bulk_member_invitations(p_items jsonb,p_expires_days integer default 7)
returns table(invitation_id uuid,member_id uuid,token text)
language plpgsql security definer set search_path=public,extensions as $$
declare item jsonb; raw_token text; target uuid; created uuid; channel text; hint text; nid uuid:=public.current_network_id();
begin
  if nid is null or not public.is_network_admin(nid) then raise exception 'Family administrator access is required.' using errcode='42501'; end if;
  if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 or jsonb_array_length(p_items)>200 then
    raise exception 'Provide between 1 and 200 invitation items.' using errcode='22023';
  end if;
  for item in select value from jsonb_array_elements(p_items) loop
    begin target := (item->>'member_id')::uuid; exception when others then
      raise exception 'Every invitation needs a valid member ID.' using errcode='22023'; end;
    raw_token:=item->>'token'; channel:=coalesce(nullif(item->>'channel',''),'link');
    hint:=nullif(left(trim(item->>'recipient_hint'),160),'');
    if length(coalesce(raw_token,''))<32 then raise exception 'Every invitation needs a strong token.' using errcode='22023'; end if;
    if channel not in ('link','email','whatsapp','sms','print','other') then raise exception 'Invalid delivery channel.' using errcode='22023'; end if;
    if not exists(select 1 from public.family_members fm where fm.id=target and fm.network_id=nid and fm.profile_status='approved') then
      raise exception 'Approved family member not found.' using errcode='P0002'; end if;
    if exists(select 1 from public.network_memberships nm where nm.network_id=nid and nm.member_id=target and nm.status='active') then
      raise exception 'A selected member profile is already claimed.' using errcode='23505'; end if;
    update public.member_invitations set revoked_at=now(),revoked_by=auth.uid()
      where network_id=nid and member_id=target and used_at is null and revoked_at is null and expires_at>now();
    insert into public.member_invitations(network_id,member_id,token_hash,created_by,expires_at,last_sent_at,delivery_channel,recipient_hint)
    values(nid,target,encode(digest(raw_token,'sha256'),'hex'),auth.uid(),
      now()+make_interval(days=>greatest(1,least(coalesce(p_expires_days,7),30))),now(),channel,hint)
    returning id into created;
    insert into public.audit_log(network_id,actor_id,action,details)
      values(nid,auth.uid(),'member_invitation_created',jsonb_build_object('invitation_id',created,'member_id',target,'channel',channel));
    invitation_id:=created; member_id:=target; token:=raw_token; return next;
  end loop;
end;
$$;
revoke all on function public.create_bulk_member_invitations(jsonb,integer) from public;
grant execute on function public.create_bulk_member_invitations(jsonb,integer) to authenticated;

create or replace function public.accept_member_invitation(p_token text) returns uuid
language plpgsql security definer set search_path=public,extensions as $$
declare invite public.member_invitations; uid uuid:=auth.uid(); active_nid uuid; existing_claim uuid;
begin
  if uid is null then raise exception 'Sign in is required to accept this invitation.' using errcode='42501'; end if;
  select * into invite from public.member_invitations
   where token_hash=encode(digest(p_token,'sha256'),'hex') and used_at is null
     and revoked_at is null and expires_at>now() for update;
  if invite.id is null then raise exception 'This invitation is invalid, expired, revoked or already used.' using errcode='22023'; end if;
  if not exists(select 1 from public.family_members fm where fm.id=invite.member_id and fm.network_id=invite.network_id) then
    raise exception 'The invited family profile no longer exists.' using errcode='P0002'; end if;

  select nm.user_id into existing_claim from public.network_memberships nm
    where nm.network_id=invite.network_id and nm.member_id=invite.member_id and nm.status='active' and nm.user_id<>uid limit 1;
  if existing_claim is not null then raise exception 'This family profile is already claimed.' using errcode='23505'; end if;

  insert into public.network_memberships(network_id,user_id,role,status,member_id)
  values(invite.network_id,uid,'member','active',invite.member_id)
  on conflict(network_id,user_id) do update set status='active',member_id=excluded.member_id;

  select active_network_id into active_nid from public.profiles where id=uid for update;
  update public.profiles
     set active_network_id=invite.network_id,member_id=invite.member_id,updated_at=now()
   where id=uid;
  if not found then raise exception 'User profile was not initialized.' using errcode='P0002'; end if;

  update public.member_invitations set used_at=now(),accepted_by=uid where id=invite.id;
  insert into public.audit_log(network_id,actor_id,action,details)
    values(invite.network_id,uid,'member_invitation_accepted',jsonb_build_object('invitation_id',invite.id,'member_id',invite.member_id));
  if invite.created_by is not null and invite.created_by<>uid then
    insert into public.notifications(network_id,user_id,type,title,body)
      values(invite.network_id,invite.created_by,'invitation_accepted','Invitation accepted','A relative joined and claimed their profile.');
  end if;
  return invite.member_id;
end;
$$;
revoke all on function public.accept_member_invitation(text) from public;
grant execute on function public.accept_member_invitation(text) to authenticated;

create or replace function public.revoke_member_invitation(p_invitation_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
  if nid is null or not public.is_network_admin(nid) then raise exception 'Family administrator access is required.' using errcode='42501'; end if;
  update public.member_invitations set revoked_at=now(),revoked_by=auth.uid()
   where id=p_invitation_id and network_id=nid and used_at is null and revoked_at is null;
  if not found then raise exception 'Active invitation not found in this family.' using errcode='P0002'; end if;
  insert into public.audit_log(network_id,actor_id,action,details)
    values(nid,auth.uid(),'member_invitation_revoked',jsonb_build_object('invitation_id',p_invitation_id));
end;
$$;
revoke all on function public.revoke_member_invitation(uuid) from public;
grant execute on function public.revoke_member_invitation(uuid) to authenticated;

create or replace function public.resend_member_invitation(p_invitation_id uuid,p_token text,p_expires_days integer default 7)
returns uuid language plpgsql security definer set search_path=public,extensions as $$
declare old_invite public.member_invitations; new_id uuid; nid uuid:=public.current_network_id();
begin
  if nid is null or not public.is_network_admin(nid) then raise exception 'Family administrator access is required.' using errcode='42501'; end if;
  if length(coalesce(p_token,''))<32 then raise exception 'A strong token is required.' using errcode='22023'; end if;
  select * into old_invite from public.member_invitations where id=p_invitation_id and network_id=nid for update;
  if old_invite.id is null or old_invite.used_at is not null then raise exception 'Invitation cannot be resent.' using errcode='22023'; end if;
  if exists(select 1 from public.network_memberships nm where nm.network_id=nid and nm.member_id=old_invite.member_id and nm.status='active') then
    raise exception 'This profile is already claimed.' using errcode='23505'; end if;
  update public.member_invitations set revoked_at=coalesce(revoked_at,now()),revoked_by=coalesce(revoked_by,auth.uid()) where id=old_invite.id;
  insert into public.member_invitations(network_id,member_id,token_hash,created_by,expires_at,last_sent_at,delivery_channel,recipient_hint,resend_of)
  values(nid,old_invite.member_id,encode(digest(p_token,'sha256'),'hex'),auth.uid(),
    now()+make_interval(days=>greatest(1,least(coalesce(p_expires_days,7),30))),now(),
    old_invite.delivery_channel,old_invite.recipient_hint,old_invite.id)
  returning id into new_id;
  insert into public.audit_log(network_id,actor_id,action,details)
    values(nid,auth.uid(),'member_invitation_resent',jsonb_build_object('invitation_id',new_id,'resend_of',old_invite.id,'member_id',old_invite.member_id));
  return new_id;
end;
$$;
revoke all on function public.resend_member_invitation(uuid,text,integer) from public;
grant execute on function public.resend_member_invitation(uuid,text,integer) to authenticated;

create or replace function public.get_member_invitations()
returns table(id uuid,member_id uuid,member_name text,status text,expires_at timestamptz,
  created_at timestamptz,first_opened_at timestamptz,last_sent_at timestamptz,
  delivery_channel text,recipient_hint text,resend_of uuid)
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
  if nid is null or not public.is_network_admin(nid) then raise exception 'Family administrator access is required.' using errcode='42501'; end if;
  return query select i.id,i.member_id,fm.full_name::text,public.invitation_status(i.used_at,i.revoked_at,i.expires_at),
    i.expires_at,i.created_at,i.first_opened_at,i.last_sent_at,i.delivery_channel::text,i.recipient_hint::text,i.resend_of
  from public.member_invitations i join public.family_members fm on fm.id=i.member_id and fm.network_id=nid
  where i.network_id=nid order by i.created_at desc limit 1000;
end;
$$;
revoke all on function public.get_member_invitations() from public;
grant execute on function public.get_member_invitations() to authenticated;
