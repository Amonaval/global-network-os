-- P4 Production Hardening
-- Run after 001 -> 009 on an existing P4 database.
-- This migration closes security/consistency gaps found during the P4 production-readiness audit.

create extension if not exists pgcrypto;

/* -------------------------------------------------------------------------- */
/* 1. Race-safe first-admin bootstrap                                         */
/* -------------------------------------------------------------------------- */
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path=public as $$
declare
  first_user boolean;
begin
  -- Serialize first-user evaluation so two concurrent signups cannot both
  -- observe an empty profiles table and both become administrators.
  perform pg_advisory_xact_lock(739281);
  select not exists(select 1 from public.profiles) into first_user;
  insert into public.profiles(id,full_name,role)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),
         case when first_user then 'admin' else 'member' end)
  on conflict (id) do nothing;
  return new;
end;
$$;

/* -------------------------------------------------------------------------- */
/* 2. Visibility-safe member projection                                       */
/* -------------------------------------------------------------------------- */
drop function if exists public.get_visible_family_members();

create function public.get_visible_family_members()
returns table (
  id uuid, full_name varchar(150), date_of_birth date, date_of_death date,
  generation_level integer, profession varchar(100), city varchar(100), country varchar(100),
  photo_url text, bio text, phone varchar(30), email varchar(255),
  latitude numeric(10,7), longitude numeric(10,7), profile_status varchar(20),
  profile_visibility varchar(20), contact_visibility varchar(20),
  created_at timestamptz, updated_at timestamptz
)
language sql security definer stable set search_path=public as $$
  select
    fm.id,
    case when public.is_admin() or fm.profile_visibility <> 'admin' then fm.full_name else null end,
    case when public.is_admin() or fm.profile_visibility <> 'admin' then fm.date_of_birth else null end,
    case when public.is_admin() or fm.profile_visibility <> 'admin' then fm.date_of_death else null end,
    case when public.is_admin() or fm.profile_visibility <> 'admin' then fm.generation_level else null end,
    case when public.is_admin() or fm.profile_visibility <> 'admin' then fm.profession else null end,
    case when public.is_admin() or fm.profile_visibility <> 'admin' then fm.city else null end,
    case when public.is_admin() or fm.profile_visibility <> 'admin' then fm.country else null end,
    case when public.is_admin() or fm.profile_visibility <> 'admin' then fm.photo_url else null end,
    case when public.is_admin() or fm.profile_visibility <> 'admin' then fm.bio else null end,
    case when public.is_admin() or fm.contact_visibility = 'member' then fm.phone else null end,
    case when public.is_admin() or fm.contact_visibility = 'member' then fm.email else null end,
    case when public.is_admin() or fm.profile_visibility <> 'admin' then fm.latitude else null end,
    case when public.is_admin() or fm.profile_visibility <> 'admin' then fm.longitude else null end,
    fm.profile_status,fm.profile_visibility,fm.contact_visibility,fm.created_at,fm.updated_at
  from public.family_members fm
  where (public.is_admin() or (fm.profile_status='approved' and fm.profile_visibility <> 'admin'));
$$;
revoke all on function public.get_visible_family_members() from public;
grant execute on function public.get_visible_family_members() to authenticated;

/* -------------------------------------------------------------------------- */
/* 3. Prevent direct submission forgery                                       */
/* -------------------------------------------------------------------------- */
revoke insert, update, delete on public.profile_submissions from authenticated;

/* Tighten the generic change-request RPC. */
create or replace function public.create_change_request(
  p_action varchar,
  p_target_member_id uuid default null,
  p_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql security definer set search_path=public as $$
declare request_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode='42501';
  end if;
  if p_action not in ('create_member','update_member','add_relationship','remove_relationship','import','other') then
    raise exception 'Invalid change-request action.' using errcode='22023';
  end if;
  if not public.is_admin() and p_action in ('add_relationship','remove_relationship','import') then
    raise exception 'Administrator access is required for this change type.' using errcode='42501';
  end if;
  if not public.is_admin() and p_target_member_id is not null
     and not exists(select 1 from public.profiles where id=auth.uid() and member_id=p_target_member_id) then
    raise exception 'You can only submit changes for your own profile.' using errcode='42501';
  end if;
  insert into public.change_requests(action,target_member_id,submitted_by,payload)
  values(p_action,p_target_member_id,auth.uid(),coalesce(p_payload,'{}'::jsonb))
  returning id into request_id;
  return request_id;
end;
$$;
revoke all on function public.create_change_request(varchar,uuid,jsonb) from public;
grant execute on function public.create_change_request(varchar,uuid,jsonb) to authenticated;

/* -------------------------------------------------------------------------- */
/* 4. Profile submission ownership validation                                 */
/* -------------------------------------------------------------------------- */
create or replace function public.submit_profile_change(
  p_submission_id uuid,
  p_member_id uuid default null,
  p_full_name varchar default '',
  p_profession varchar default null,
  p_city varchar default null,
  p_country varchar default null,
  p_bio text default null,
  p_phone varchar default null,
  p_email varchar default null,
  p_photo_url text default null,
  p_profile_visibility varchar default 'member',
  p_contact_visibility varchar default 'admin'
)
returns uuid
language plpgsql security definer set search_path=public as $$
declare request_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  if nullif(trim(p_full_name),'') is null then raise exception 'Full name is required.' using errcode='22023'; end if;
  if p_profile_visibility not in ('public','member','admin')
     or p_contact_visibility not in ('member','admin') then
    raise exception 'Invalid visibility setting.' using errcode='22023';
  end if;
  if not public.is_admin() and p_member_id is not null
     and not exists(select 1 from public.profiles where id=auth.uid() and member_id=p_member_id) then
    raise exception 'You can only submit changes for your own profile.' using errcode='42501';
  end if;

  insert into public.profile_submissions(
    id,member_id,full_name,profession,city,country,bio,phone,email,photo_url,
    status,submitted_by,profile_visibility,contact_visibility
  )
  values(
    p_submission_id,p_member_id,trim(p_full_name),p_profession,p_city,p_country,
    p_bio,p_phone,p_email,p_photo_url,'pending',auth.uid(),
    p_profile_visibility,p_contact_visibility
  );

  insert into public.change_requests(action,target_member_id,submitted_by,payload)
  values(
    case when p_member_id is null then 'create_member' else 'update_member' end,
    p_member_id,auth.uid(),
    jsonb_build_object(
      'submission_id',p_submission_id,'full_name',p_full_name,'profession',p_profession,
      'city',p_city,'country',p_country,'bio',p_bio,'phone',p_phone,'email',p_email,
      'photo_url',p_photo_url,'profile_visibility',p_profile_visibility,
      'contact_visibility',p_contact_visibility
    )
  )
  returning id into request_id;

  insert into public.audit_log(actor_id,action,details)
  values(auth.uid(),'profile_change_submitted',
         jsonb_build_object('submission_id',p_submission_id,'member_id',p_member_id));
  return request_id;
end;
$$;
revoke all on function public.submit_profile_change(uuid,uuid,varchar,varchar,varchar,varchar,text,varchar,varchar,text,varchar,varchar) from public;
grant execute on function public.submit_profile_change(uuid,uuid,varchar,varchar,varchar,varchar,text,varchar,varchar,text,varchar,varchar) to authenticated;

/* -------------------------------------------------------------------------- */
/* 5. IDOR-safe life-event reads                                              */
/* -------------------------------------------------------------------------- */
create or replace function public.get_member_life_events(p_member_id uuid)
returns table (
  id uuid,member_id uuid,event_type varchar,title varchar,event_date date,
  location varchar,description text,visibility varchar,created_by uuid,
  created_at timestamptz,updated_at timestamptz
)
language sql security definer stable set search_path=public as $$
  select e.id,e.member_id,e.event_type,e.title,e.event_date,e.location,e.description,
         e.visibility,e.created_by,e.created_at,e.updated_at
  from public.member_life_events e
  join public.family_members fm on fm.id=e.member_id
  where e.member_id=p_member_id
    and (
      public.is_admin()
      or (
        fm.profile_status='approved'
        and fm.profile_visibility <> 'admin'
        and e.visibility <> 'admin'
      )
    );
$$;
revoke all on function public.get_member_life_events(uuid) from public;
grant execute on function public.get_member_life_events(uuid) to authenticated;

/* -------------------------------------------------------------------------- */
/* 6. IDOR-safe memory reads                                                  */
/* -------------------------------------------------------------------------- */
create or replace function public.get_memories(p_member_id uuid default null)
returns table(
  id uuid,member_id uuid,title varchar,story text,photo_url text,
  visibility varchar,created_by uuid,created_at timestamptz
)
language sql security definer stable set search_path=public as $$
  select m.id,m.member_id,m.title,m.story,m.photo_url,m.visibility,m.created_by,m.created_at
  from public.memories m
  left join public.family_members fm on fm.id=m.member_id
  where (p_member_id is null or m.member_id=p_member_id)
    and (
      public.is_admin()
      or (
        m.visibility <> 'admin'
        and (m.member_id is null or (fm.profile_status='approved' and fm.profile_visibility <> 'admin'))
      )
    );
$$;
revoke all on function public.get_memories(uuid) from public;
grant execute on function public.get_memories(uuid) to authenticated;

/* -------------------------------------------------------------------------- */
/* 7. Prevent invitation reassignment of an already-linked account            */
/* -------------------------------------------------------------------------- */
create or replace function public.accept_member_invitation(p_token text) returns uuid
language plpgsql security definer set search_path=public,extensions as $$
declare invite public.member_invitations; uid uuid; owner_user uuid; current_member uuid;
begin
  uid:=auth.uid();
  if uid is null then raise exception 'Sign in is required to accept this invitation.' using errcode='42501'; end if;

  select * into invite
  from public.member_invitations
  where token_hash=encode(digest(p_token,'sha256'),'hex')
    and used_at is null and expires_at>now()
  for update;

  if invite.id is null then
    raise exception 'This invitation is invalid, expired or already used.' using errcode='22023';
  end if;

  select member_id into current_member from public.profiles where id=uid for update;

  if current_member is not null and current_member<>invite.member_id then
    raise exception 'This account is already linked to a different family member.' using errcode='23505';
  end if;

  if exists(select 1 from public.profiles where member_id=invite.member_id and id<>uid) then
    raise exception 'This member profile is already claimed.' using errcode='23505';
  end if;

  update public.profiles set member_id=invite.member_id,updated_at=now() where id=uid;
  if not found then raise exception 'User profile was not initialized.' using errcode='P0002'; end if;

  update public.member_invitations set used_at=now(),accepted_by=uid where id=invite.id;
  insert into public.audit_log(actor_id,action,details)
  values(uid,'member_invitation_accepted',jsonb_build_object('invitation_id',invite.id,'member_id',invite.member_id));

  owner_user:=invite.created_by;
  if owner_user is not null and owner_user<>uid then
    insert into public.notifications(user_id,type,title,body)
    values(owner_user,'invitation_accepted','Invitation accepted','A member has accepted your invitation link.');
  end if;
  return invite.member_id;
end;
$$;
revoke all on function public.accept_member_invitation(text) from public;
grant execute on function public.accept_member_invitation(text) to authenticated;

/* -------------------------------------------------------------------------- */
/* 8. Audit RPC is admin-only                                                 */
/* -------------------------------------------------------------------------- */
create or replace function public.log_audit_event(
  p_action varchar,
  p_details jsonb default '{}'::jsonb
)
returns uuid
language plpgsql security definer set search_path=public as $$
declare audit_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required.' using errcode='42501';
  end if;
  insert into public.audit_log(actor_id,action,details)
  values(auth.uid(),left(p_action,80),coalesce(p_details,'{}'::jsonb))
  returning id into audit_id;
  return audit_id;
end;
$$;
revoke all on function public.log_audit_event(varchar,jsonb) from public;
grant execute on function public.log_audit_event(varchar,jsonb) to authenticated;
