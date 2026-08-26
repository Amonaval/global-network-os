-- P4.2: relationship intelligence, life-event timelines and profile visibility.
-- Run after 001 -> 006 on an existing project.

/* -------------------------------------------------------------------------- */
/* 1. Profile visibility                                                      */
/* -------------------------------------------------------------------------- */
alter table public.family_members
  add column if not exists profile_visibility varchar(20) not null default 'member'
    check (profile_visibility in ('public','member','admin'));

alter table public.family_members
  add column if not exists contact_visibility varchar(20) not null default 'admin'
    check (contact_visibility in ('member','admin'));

create index if not exists idx_family_members_profile_visibility on public.family_members(profile_visibility);

drop function if exists public.get_visible_family_members();

create function public.get_visible_family_members()
returns table (
  id uuid, full_name varchar(150), date_of_birth date, date_of_death date,
  generation_level integer, profession varchar(100), city varchar(100), country varchar(100),
  photo_url text, bio text, phone varchar(30), email varchar(255),
  latitude numeric(10,7), longitude numeric(10,7), profile_status varchar(20),
  profile_visibility varchar(20), contact_visibility varchar(20), created_at timestamptz, updated_at timestamptz
)
language sql security definer stable set search_path=public as $$
  select fm.id,fm.full_name,fm.date_of_birth,fm.date_of_death,fm.generation_level,fm.profession,
    case when public.is_admin() or fm.profile_visibility <> 'admin' then fm.city else null end,
    case when public.is_admin() or fm.profile_visibility <> 'admin' then fm.country else null end,
    case when public.is_admin() or fm.profile_visibility <> 'admin' then fm.photo_url else null end,
    case when public.is_admin() or fm.profile_visibility <> 'admin' then fm.bio else null end,
    case when public.is_admin() or fm.contact_visibility = 'member' then fm.phone else null end,
    case when public.is_admin() or fm.contact_visibility = 'member' then fm.email else null end,
    fm.latitude,fm.longitude,fm.profile_status,fm.profile_visibility,fm.contact_visibility,fm.created_at,fm.updated_at
  from public.family_members fm
  where fm.profile_status='approved' or public.is_admin();
$$;
revoke all on function public.get_visible_family_members() from public;
grant execute on function public.get_visible_family_members() to authenticated;

/* -------------------------------------------------------------------------- */
/* 2. Life events                                                             */
/* -------------------------------------------------------------------------- */
create table if not exists public.member_life_events (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.family_members(id) on delete cascade,
  event_type varchar(30) not null check (event_type in ('birth','marriage','move','education','career','family','milestone','other')),
  title varchar(160) not null,
  event_date date,
  location varchar(160),
  description text,
  visibility varchar(20) not null default 'member' check (visibility in ('public','member','admin')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_member_life_events_member_date on public.member_life_events(member_id,event_date);
create index if not exists idx_member_life_events_visibility on public.member_life_events(visibility);
alter table public.member_life_events enable row level security;
revoke all on public.member_life_events from authenticated;

create or replace function public.get_member_life_events(p_member_id uuid)
returns table (id uuid,member_id uuid,event_type varchar,title varchar,event_date date,location varchar,description text,visibility varchar,created_by uuid,created_at timestamptz,updated_at timestamptz)
language sql security definer stable set search_path=public as $$
  select e.id,e.member_id,e.event_type,e.title,e.event_date,e.location,e.description,e.visibility,e.created_by,e.created_at,e.updated_at
  from public.member_life_events e
  where e.member_id=p_member_id and (public.is_admin() or e.visibility <> 'admin');
$$;
revoke all on function public.get_member_life_events(uuid) from public;
grant execute on function public.get_member_life_events(uuid) to authenticated;

create or replace function public.create_member_life_event(
  p_member_id uuid,p_event_type varchar,p_title varchar,p_event_date date default null,
  p_location varchar default null,p_description text default null,p_visibility varchar default 'member'
) returns uuid
language plpgsql security definer set search_path=public as $$
declare event_id uuid; owner_id uuid;
begin
  select p.id into owner_id from public.profiles p where p.id=auth.uid();
  if not public.is_admin() and not exists(select 1 from public.profiles p where p.id=auth.uid() and p.member_id=p_member_id) then
    raise exception 'You can only edit your own profile timeline.' using errcode='42501';
  end if;
  if p_visibility not in ('public','member','admin') then raise exception 'Invalid visibility.' using errcode='22023'; end if;
  if p_visibility='admin' and not public.is_admin() then raise exception 'Only administrators can create admin-only events.' using errcode='42501'; end if;
  insert into public.member_life_events(member_id,event_type,title,event_date,location,description,visibility,created_by)
  values(p_member_id,p_event_type,p_title,p_event_date,p_location,p_description,p_visibility,auth.uid()) returning id into event_id;
  insert into public.audit_log(actor_id,action,details) values(auth.uid(),'life_event_created',jsonb_build_object('member_id',p_member_id,'event_id',event_id));
  return event_id;
end;
$$;
revoke all on function public.create_member_life_event(uuid,varchar,varchar,date,varchar,text,varchar) from public;
grant execute on function public.create_member_life_event(uuid,varchar,varchar,date,varchar,text,varchar) to authenticated;

create or replace function public.update_member_life_event(
  p_event_id uuid,p_event_type varchar,p_title varchar,p_event_date date default null,
  p_location varchar default null,p_description text default null,p_visibility varchar default 'member'
) returns void
language plpgsql security definer set search_path=public as $$
declare event_member uuid;
begin
  select member_id into event_member from public.member_life_events where id=p_event_id;
  if event_member is null then raise exception 'Timeline event not found.' using errcode='P0002'; end if;
  if not public.is_admin() and not exists(select 1 from public.profiles p where p.id=auth.uid() and p.member_id=event_member) then raise exception 'You can only edit your own profile timeline.' using errcode='42501'; end if;
  if p_visibility='admin' and not public.is_admin() then raise exception 'Only administrators can create admin-only events.' using errcode='42501'; end if;
  update public.member_life_events set event_type=p_event_type,title=p_title,event_date=p_event_date,location=p_location,description=p_description,visibility=p_visibility,updated_at=now() where id=p_event_id;
  insert into public.audit_log(actor_id,action,details) values(auth.uid(),'life_event_updated',jsonb_build_object('event_id',p_event_id,'member_id',event_member));
end;
$$;
revoke all on function public.update_member_life_event(uuid,varchar,varchar,date,varchar,text,varchar) from public;
grant execute on function public.update_member_life_event(uuid,varchar,varchar,date,varchar,text,varchar) to authenticated;

create or replace function public.delete_member_life_event(p_event_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare event_member uuid;
begin
  select member_id into event_member from public.member_life_events where id=p_event_id;
  if event_member is null then raise exception 'Timeline event not found.' using errcode='P0002'; end if;
  if not public.is_admin() and not exists(select 1 from public.profiles p where p.id=auth.uid() and p.member_id=event_member) then raise exception 'You can only edit your own profile timeline.' using errcode='42501'; end if;
  delete from public.member_life_events where id=p_event_id;
  insert into public.audit_log(actor_id,action,details) values(auth.uid(),'life_event_deleted',jsonb_build_object('event_id',p_event_id,'member_id',event_member));
end;
$$;
revoke all on function public.delete_member_life_event(uuid) from public;
grant execute on function public.delete_member_life_event(uuid) to authenticated;

/* -------------------------------------------------------------------------- */
/* 3. Profile submission carries visibility choices                            */
/* -------------------------------------------------------------------------- */
alter table public.profile_submissions
  add column if not exists profile_visibility varchar(20) not null default 'member'
    check (profile_visibility in ('public','member','admin'));
alter table public.profile_submissions
  add column if not exists contact_visibility varchar(20) not null default 'admin'
    check (contact_visibility in ('member','admin'));

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
  if p_profile_visibility not in ('public','member','admin') or p_contact_visibility not in ('member','admin') then raise exception 'Invalid visibility setting.' using errcode='22023'; end if;
  insert into public.profile_submissions(id,member_id,full_name,profession,city,country,bio,phone,email,photo_url,status,submitted_by,profile_visibility,contact_visibility)
  values(p_submission_id,p_member_id,trim(p_full_name),p_profession,p_city,p_country,p_bio,p_phone,p_email,p_photo_url,'pending',auth.uid(),p_profile_visibility,p_contact_visibility);
  insert into public.change_requests(action,target_member_id,submitted_by,payload)
  values(case when p_member_id is null then 'create_member' else 'update_member' end,p_member_id,auth.uid(),
    jsonb_build_object('submission_id',p_submission_id,'full_name',p_full_name,'profession',p_profession,'city',p_city,'country',p_country,'bio',p_bio,'phone',p_phone,'email',p_email,'photo_url',p_photo_url,'profile_visibility',p_profile_visibility,'contact_visibility',p_contact_visibility))
    returning id into request_id;
  insert into public.audit_log(actor_id,action,details) values(auth.uid(),'profile_change_submitted',jsonb_build_object('submission_id',p_submission_id,'member_id',p_member_id));
  return request_id;
end;
$$;
revoke all on function public.submit_profile_change(uuid,uuid,varchar,varchar,varchar,varchar,text,varchar,varchar,text,varchar,varchar) from public;
grant execute on function public.submit_profile_change(uuid,uuid,varchar,varchar,varchar,varchar,text,varchar,varchar,text,varchar,varchar) to authenticated;
