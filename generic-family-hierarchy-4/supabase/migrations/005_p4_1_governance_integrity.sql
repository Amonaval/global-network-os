-- P4.1 — data integrity, real contact privacy, governance and change requests.
-- Run after migrations 001 → 004.

/* -------------------------------------------------------------------------- */
/* 1. Relationship integrity                                                  */
/* -------------------------------------------------------------------------- */

-- Remove duplicate spouse rows that differ only by direction before adding
-- the canonical unique index.
with ranked as (
  select id,
         row_number() over (
           partition by least(person_id, related_person_id), greatest(person_id, related_person_id), relationship_type
           order by created_at, id
         ) as rn
  from public.family_relationships
  where relationship_type = 'spouse'
)
delete from public.family_relationships r
using ranked x
where r.id = x.id and x.rn > 1;

alter table public.family_relationships
  drop constraint if exists family_relationships_no_self;

alter table public.family_relationships
  add constraint family_relationships_no_self check (person_id <> related_person_id);

create unique index if not exists uq_family_relationships_spouse_pair
on public.family_relationships (
  least(person_id, related_person_id),
  greatest(person_id, related_person_id)
)
where relationship_type = 'spouse';

create or replace function public.validate_family_relationship()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  parent_id uuid;
  child_id uuid;
  parent_generation integer;
  child_generation integer;
begin
  if new.person_id = new.related_person_id then
    raise exception 'A member cannot be related to themselves.' using errcode = '23514';
  end if;

  -- Spouse relationships are symmetric. Generation equality is intentionally
  -- not enforced because the existing P3 data contains legitimate mixed-level
  -- spouse examples; the UI validator reports these as warnings.
  if new.relationship_type = 'spouse' then
    return new;
  end if;

  if new.relationship_type = 'parent' then
    parent_id := new.person_id;
    child_id := new.related_person_id;
  else
    parent_id := new.related_person_id;
    child_id := new.person_id;
  end if;

  select generation_level into parent_generation
  from public.family_members where id = parent_id;
  select generation_level into child_generation
  from public.family_members where id = child_id;

  if parent_generation is null or child_generation is null then
    raise exception 'Both members must exist before creating a relationship.' using errcode = '23503';
  end if;

  if parent_generation >= child_generation then
    raise exception 'Parent generation must be earlier than child generation.' using errcode = '23514';
  end if;

  -- Follow existing parent/child edges downward. If the proposed parent is
  -- already reachable from the proposed child, the new edge would create a cycle.
  if exists (
    with recursive descendants(id) as (
      select child_id
      union
      select case
               when r.relationship_type = 'parent' then r.related_person_id
               else r.person_id
             end
      from public.family_relationships r
      join descendants d on (
        case
          when r.relationship_type = 'parent' then r.person_id
          else r.related_person_id
        end
      ) = d.id
      where r.relationship_type in ('parent','child')
    )
    select 1 from descendants where id = parent_id
  ) then
    raise exception 'The relationship would create a parent/child cycle.' using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_family_relationship on public.family_relationships;
create trigger trg_validate_family_relationship
before insert or update on public.family_relationships
for each row execute function public.validate_family_relationship();

/* -------------------------------------------------------------------------- */
/* 2. Real database-level contact privacy                                     */
/* -------------------------------------------------------------------------- */

-- The P3 UI hid phone/email in Public preview, but authenticated clients could
-- still select those columns directly from family_members. Remove direct
-- SELECT access and expose only the approved, role-aware RPC below.
revoke select on public.family_members from authenticated;

-- PostgREST PATCH/UPSERT requests may require SELECT on the target table
-- (for example when returning the affected row). Keep direct SELECT available
-- only to administrators; normal members must continue using the redacted RPC.
drop policy if exists "authenticated members can read approved family members" on public.family_members;
create policy "admins can directly read family members"
on public.family_members for select to authenticated
using (public.is_admin());
grant select on public.family_members to authenticated;

create or replace function public.get_visible_family_members()
returns table (
  id uuid,
  full_name varchar(150),
  date_of_birth date,
  date_of_death date,
  generation_level integer,
  profession varchar(100),
  city varchar(100),
  country varchar(100),
  photo_url text,
  bio text,
  phone varchar(30),
  email varchar(255),
  latitude numeric(10,7),
  longitude numeric(10,7),
  profile_status varchar(20),
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select
    fm.id,
    fm.full_name,
    fm.date_of_birth,
    fm.date_of_death,
    fm.generation_level,
    fm.profession,
    fm.city,
    fm.country,
    fm.photo_url,
    fm.bio,
    case when public.is_admin() then fm.phone else null end,
    case when public.is_admin() then fm.email else null end,
    fm.latitude,
    fm.longitude,
    fm.profile_status,
    fm.created_at,
    fm.updated_at
  from public.family_members fm
  where fm.profile_status = 'approved' or public.is_admin();
$$;

revoke all on function public.get_visible_family_members() from public;
grant execute on function public.get_visible_family_members() to authenticated;

/* -------------------------------------------------------------------------- */
/* 3. General change-request model                                             */
/* -------------------------------------------------------------------------- */

create table if not exists public.change_requests (
  id uuid primary key default gen_random_uuid(),
  action varchar(40) not null check (action in ('create_member','update_member','add_relationship','remove_relationship','import','other')),
  target_member_id uuid references public.family_members(id) on delete set null,
  submitted_by uuid references auth.users(id) on delete set null,
  status varchar(20) not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  payload jsonb not null default '{}'::jsonb,
  review_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_change_requests_status_created
on public.change_requests(status, created_at desc);
create index if not exists idx_change_requests_target_member
on public.change_requests(target_member_id);
create index if not exists idx_change_requests_submitted_by
on public.change_requests(submitted_by);

alter table public.change_requests enable row level security;

drop policy if exists "members can read own change requests" on public.change_requests;
create policy "members can read own change requests"
on public.change_requests for select to authenticated
using (submitted_by = auth.uid() or public.is_admin());

-- Inserts/updates happen through security-definer functions so clients cannot
-- forge submitted_by/reviewer identities or bypass the status workflow.
revoke insert, update, delete on public.change_requests from authenticated;

create or replace function public.create_change_request(
  p_action varchar,
  p_target_member_id uuid default null,
  p_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare request_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  insert into public.change_requests(action,target_member_id,submitted_by,payload)
  values(p_action,p_target_member_id,auth.uid(),coalesce(p_payload,'{}'::jsonb))
  returning id into request_id;
  return request_id;
end;
$$;

revoke all on function public.create_change_request(varchar,uuid,jsonb) from public;
grant execute on function public.create_change_request(varchar,uuid,jsonb) to authenticated;

create or replace function public.review_change_request(
  p_request_id uuid,
  p_status varchar,
  p_review_note text default null
)
returns public.change_requests
language plpgsql
security definer
set search_path = public
as $$
declare result public.change_requests;
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required.' using errcode = '42501';
  end if;
  if p_status not in ('approved','rejected','cancelled') then
    raise exception 'Invalid review status.' using errcode = '22023';
  end if;
  update public.change_requests
  set status=p_status, review_note=p_review_note, reviewed_by=auth.uid(), reviewed_at=now()
  where id=p_request_id
  returning * into result;
  if result.id is null then raise exception 'Change request not found.' using errcode = 'P0002'; end if;
  insert into public.audit_log(actor_id,action,details)
  values(auth.uid(),'change_request_reviewed',jsonb_build_object('request_id',result.id,'status',result.status,'action',result.action));
  return result;
end;
$$;

revoke all on function public.review_change_request(uuid,varchar,text) from public;
grant execute on function public.review_change_request(uuid,varchar,text) to authenticated;

/* -------------------------------------------------------------------------- */
/* 4. Audit logging                                                           */
/* -------------------------------------------------------------------------- */

revoke insert on public.audit_log from authenticated;

create or replace function public.log_audit_event(
  p_action varchar,
  p_details jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare audit_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  insert into public.audit_log(actor_id,action,details)
  values(auth.uid(),left(p_action,80),coalesce(p_details,'{}'::jsonb))
  returning id into audit_id;
  return audit_id;
end;
$$;

revoke all on function public.log_audit_event(varchar,jsonb) from public;
grant execute on function public.log_audit_event(varchar,jsonb) to authenticated;

/* Atomic profile submission + generalized change request. */
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
  p_photo_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare request_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  if nullif(trim(p_full_name),'') is null then
    raise exception 'Full name is required.' using errcode = '22023';
  end if;

  insert into public.profile_submissions(
    id,member_id,full_name,profession,city,country,bio,phone,email,photo_url,status,submitted_by
  ) values (
    p_submission_id,p_member_id,trim(p_full_name),p_profession,p_city,p_country,p_bio,p_phone,p_email,p_photo_url,'pending',auth.uid()
  );

  insert into public.change_requests(action,target_member_id,submitted_by,payload)
  values (
    case when p_member_id is null then 'create_member' else 'update_member' end,
    p_member_id,
    auth.uid(),
    jsonb_build_object('submission_id',p_submission_id,'full_name',p_full_name,'profession',p_profession,'city',p_city,'country',p_country,'bio',p_bio,'phone',p_phone,'email',p_email,'photo_url',p_photo_url)
  ) returning id into request_id;

  insert into public.audit_log(actor_id,action,details)
  values(auth.uid(),'profile_change_submitted',jsonb_build_object('submission_id',p_submission_id,'member_id',p_member_id));

  return request_id;
end;
$$;

revoke all on function public.submit_profile_change(uuid,uuid,varchar,varchar,varchar,varchar,text,varchar,varchar,text) from public;
grant execute on function public.submit_profile_change(uuid,uuid,varchar,varchar,varchar,varchar,text,varchar,varchar,text) to authenticated;

/* -------------------------------------------------------------------------- */
/* 5. Capability foundation                                                   */
/* -------------------------------------------------------------------------- */

create table if not exists public.network_role_capabilities (
  role varchar(20) not null check (role in ('member','admin')),
  capability varchar(60) not null,
  primary key(role, capability)
);

insert into public.network_role_capabilities(role,capability) values
  ('member','view_network'),
  ('member','submit_profile'),
  ('member','view_own_change_requests'),
  ('admin','view_network'),
  ('admin','submit_profile'),
  ('admin','view_own_change_requests'),
  ('admin','manage_members'),
  ('admin','manage_relationships'),
  ('admin','manage_submissions'),
  ('admin','manage_network'),
  ('admin','view_private_contact'),
  ('admin','view_audit_log')
on conflict do nothing;

alter table public.network_role_capabilities enable row level security;
revoke all on public.network_role_capabilities from authenticated;

create or replace function public.has_capability(p_capability varchar)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.network_role_capabilities rc
    join public.profiles p on p.role = rc.role
    where p.id = auth.uid() and rc.capability = p_capability
  );
$$;

revoke all on function public.has_capability(varchar) from public;
grant execute on function public.has_capability(varchar) to authenticated;
