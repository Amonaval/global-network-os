-- G5 — Alumni Network V1
-- Additive second-vertical persistence. Existing Family data and RPCs remain intact.

alter table public.networks add column if not exists vertical_kind varchar(20) not null default 'family';
update public.networks set vertical_kind='family' where vertical_kind is null or vertical_kind='';
alter table public.networks drop constraint if exists networks_vertical_kind_check;
alter table public.networks add constraint networks_vertical_kind_check check (vertical_kind in ('family','alumni'));
create index if not exists idx_networks_vertical_kind on public.networks(vertical_kind,status);

alter table public.network_settings add column if not exists vertical_kind varchar(20) not null default 'family';
update public.network_settings set vertical_kind='family' where vertical_kind is null or vertical_kind='';
alter table public.network_settings drop constraint if exists network_settings_vertical_kind_check;
alter table public.network_settings add constraint network_settings_vertical_kind_check check (vertical_kind in ('family','alumni'));

-- get_my_networks gains vertical identity. Drop is required because PostgreSQL cannot change TABLE return shape in place.
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
  order by (p.active_network_id=n.id) desc,n.name;
$$;
revoke all on function public.get_my_networks() from public;
grant execute on function public.get_my_networks() to authenticated;

create table if not exists public.alumni_profiles (
  id uuid primary key default gen_random_uuid(),
  network_id uuid not null references public.networks(id) on delete cascade,
  full_name varchar(180) not null,
  email text,
  graduation_year integer check (graduation_year is null or graduation_year between 1900 and 2200),
  program varchar(160),
  department varchar(160),
  city varchar(120),
  company varchar(180),
  job_title varchar(180),
  bio text,
  visibility varchar(20) not null default 'members' check (visibility in ('members','private')),
  claimed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(network_id,email)
);
create index if not exists idx_alumni_profiles_network_year on public.alumni_profiles(network_id,graduation_year);
create index if not exists idx_alumni_profiles_network_name on public.alumni_profiles(network_id,full_name);
create unique index if not exists uq_alumni_claimed_user_per_network on public.alumni_profiles(network_id,claimed_by) where claimed_by is not null;

create table if not exists public.alumni_connections (
  id uuid primary key default gen_random_uuid(),
  network_id uuid not null references public.networks(id) on delete cascade,
  person_id uuid not null references public.alumni_profiles(id) on delete cascade,
  related_person_id uuid not null references public.alumni_profiles(id) on delete cascade,
  relation_kind varchar(40) not null check (relation_kind in ('batchmate','classmate','mentor','mentee','professional_connection')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (person_id <> related_person_id),
  unique(network_id,person_id,related_person_id,relation_kind)
);

create table if not exists public.alumni_invitations (
  id uuid primary key default gen_random_uuid(),
  network_id uuid not null references public.networks(id) on delete cascade,
  profile_id uuid not null references public.alumni_profiles(id) on delete cascade,
  token uuid not null default gen_random_uuid() unique,
  recipient_hint text,
  status varchar(20) not null default 'active' check (status in ('active','accepted','expired','revoked')),
  expires_at timestamptz not null default (now()+interval '30 days'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

alter table public.alumni_profiles enable row level security;
alter table public.alumni_connections enable row level security;
alter table public.alumni_invitations enable row level security;
-- G5 uses security-definer RPCs as the audited application boundary; no direct table privileges.
revoke all on table public.alumni_profiles from anon,authenticated;
revoke all on table public.alumni_connections from anon,authenticated;
revoke all on table public.alumni_invitations from anon,authenticated;

create or replace function public.create_alumni_network(p_name text,p_institution text,p_description text default '') returns uuid
language plpgsql security definer set search_path=public as $$
declare v_id uuid; v_slug text; v_base text;
begin
  if auth.uid() is null then raise exception 'Sign in required.' using errcode='42501'; end if;
  if length(trim(coalesce(p_name,'')))<2 then raise exception 'Network name is required.'; end if;
  if length(trim(coalesce(p_institution,'')))<2 then raise exception 'Institution name is required.'; end if;
  v_base:=lower(regexp_replace(trim(p_name),'[^a-zA-Z0-9]+','-','g')); v_base:=trim(both '-' from v_base);
  if v_base='' then v_base:='alumni-network'; end if;
  v_slug:=v_base;
  while exists(select 1 from public.networks where slug=v_slug) loop v_slug:=v_base||'-'||substr(gen_random_uuid()::text,1,6); end loop;
  insert into public.networks(name,slug,created_by,vertical_kind) values(trim(p_name),v_slug,auth.uid(),'alumni') returning id into v_id;
  insert into public.network_memberships(network_id,user_id,role,status) values(v_id,auth.uid(),'owner','active');
  insert into public.network_settings(network_id,id,name,description,entity_label,entity_label_plural,level_label,level_label_plural,parent_label,child_label,peer_label,network_template,vertical_kind)
  values(v_id,'network',trim(p_name),coalesce(p_description,''),'Alumni','Alumni','Batch Year','Batch Years','Senior','Junior','Classmate','alumni','alumni');
  update public.profiles set active_network_id=v_id,updated_at=now() where id=auth.uid();
  insert into public.audit_log(network_id,actor_id,action,details) values(v_id,auth.uid(),'alumni_network_created',jsonb_build_object('institution',trim(p_institution)));
  -- Creator gets an editable seed identity; email is intentionally copied only from the authenticated account.
  insert into public.alumni_profiles(network_id,full_name,email,bio,claimed_by)
  select v_id,coalesce(nullif(trim(p.full_name),''),split_part(coalesce(u.email,'Alumni'), '@',1)),lower(u.email),trim(p_institution),auth.uid()
  from public.profiles p join auth.users u on u.id=p.id where p.id=auth.uid();
  return v_id;
end $$;
revoke all on function public.create_alumni_network(text,text,text) from public;
grant execute on function public.create_alumni_network(text,text,text) to authenticated;

create or replace function public.get_alumni_directory(p_query text default null,p_year integer default null,p_program text default null)
returns table(id uuid,full_name varchar,email text,graduation_year integer,program varchar,department varchar,city varchar,company varchar,job_title varchar,bio text,visibility varchar,claimed boolean,is_me boolean)
language sql security definer stable set search_path=public as $$
  select ap.id,ap.full_name,
    case when ap.claimed_by=auth.uid() or public.is_network_admin(ap.network_id) then ap.email else null end,
    ap.graduation_year,ap.program,ap.department,ap.city,ap.company,ap.job_title,ap.bio,ap.visibility,
    ap.claimed_by is not null,ap.claimed_by=auth.uid()
  from public.alumni_profiles ap
  where ap.network_id=public.current_network_id()
    and public.is_network_member(ap.network_id)
    and (ap.visibility='members' or ap.claimed_by=auth.uid() or public.is_network_admin(ap.network_id))
    and (p_query is null or trim(p_query)='' or ap.full_name ilike '%'||trim(p_query)||'%' or coalesce(ap.city,'') ilike '%'||trim(p_query)||'%' or coalesce(ap.company,'') ilike '%'||trim(p_query)||'%')
    and (p_year is null or ap.graduation_year=p_year)
    and (p_program is null or trim(p_program)='' or ap.program=p_program)
  order by ap.graduation_year nulls last,ap.full_name;
$$;
revoke all on function public.get_alumni_directory(text,integer,text) from public;
grant execute on function public.get_alumni_directory(text,integer,text) to authenticated;

create or replace function public.upsert_my_alumni_profile(p_full_name text,p_graduation_year integer default null,p_program text default null,p_department text default null,p_city text default null,p_company text default null,p_job_title text default null,p_bio text default null)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_network uuid:=public.current_network_id(); v_id uuid;
begin
 if (select vertical_kind from public.networks where id=v_network)<>'alumni' then raise exception 'Active network is not Alumni.'; end if;
 select id into v_id from public.alumni_profiles where network_id=v_network and claimed_by=auth.uid();
 if v_id is null then
   insert into public.alumni_profiles(network_id,full_name,email,graduation_year,program,department,city,company,job_title,bio,claimed_by)
   select v_network,trim(p_full_name),lower(u.email),p_graduation_year,nullif(trim(p_program),''),nullif(trim(p_department),''),nullif(trim(p_city),''),nullif(trim(p_company),''),nullif(trim(p_job_title),''),nullif(trim(p_bio),''),auth.uid() from auth.users u where u.id=auth.uid() returning id into v_id;
 else
   update public.alumni_profiles set full_name=trim(p_full_name),graduation_year=p_graduation_year,program=nullif(trim(p_program),''),department=nullif(trim(p_department),''),city=nullif(trim(p_city),''),company=nullif(trim(p_company),''),job_title=nullif(trim(p_job_title),''),bio=nullif(trim(p_bio),''),updated_at=now() where id=v_id;
 end if;
 return v_id;
end $$;
revoke all on function public.upsert_my_alumni_profile(text,integer,text,text,text,text,text,text) from public;
grant execute on function public.upsert_my_alumni_profile(text,integer,text,text,text,text,text,text) to authenticated;

create or replace function public.get_my_claimable_alumni_profiles()
returns table(profile_id uuid,network_id uuid,network_name varchar,full_name varchar,graduation_year integer,program varchar)
language sql security definer stable set search_path=public as $$
 select ap.id,ap.network_id,n.name,ap.full_name,ap.graduation_year,ap.program
 from public.alumni_profiles ap join public.networks n on n.id=ap.network_id join auth.users u on u.id=auth.uid()
 where ap.claimed_by is null and ap.email is not null and lower(ap.email)=lower(u.email) and n.vertical_kind='alumni' and n.status='active';
$$;
revoke all on function public.get_my_claimable_alumni_profiles() from public;
grant execute on function public.get_my_claimable_alumni_profiles() to authenticated;

create or replace function public.claim_alumni_profile_by_verified_email(p_profile_id uuid) returns uuid
language plpgsql security definer set search_path=public as $$
declare v_network uuid; v_email text; v_existing uuid;
begin
 select ap.network_id,lower(ap.email) into v_network,v_email from public.alumni_profiles ap where ap.id=p_profile_id and ap.claimed_by is null;
 if v_network is null then raise exception 'Profile is not available to claim.'; end if;
 if v_email is distinct from (select lower(email) from auth.users where id=auth.uid()) then raise exception 'Verified email does not match.' using errcode='42501'; end if;
 select id into v_existing from public.alumni_profiles where network_id=v_network and claimed_by=auth.uid();
 if v_existing is not null and v_existing<>p_profile_id then raise exception 'Your account is already linked to another alumni profile in this network.'; end if;
 update public.alumni_profiles set claimed_by=auth.uid(),updated_at=now() where id=p_profile_id;
 insert into public.network_memberships(network_id,user_id,role,status) values(v_network,auth.uid(),'member','active') on conflict(network_id,user_id) do update set status='active';
 update public.profiles set active_network_id=v_network,updated_at=now() where id=auth.uid();
 return v_network;
end $$;
revoke all on function public.claim_alumni_profile_by_verified_email(uuid) from public;
grant execute on function public.claim_alumni_profile_by_verified_email(uuid) to authenticated;

create or replace function public.admin_upsert_alumni_profile(p_full_name text,p_email text default null,p_graduation_year integer default null,p_program text default null,p_department text default null,p_city text default null,p_company text default null,p_job_title text default null)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_network uuid:=public.current_network_id(); v_id uuid;
begin
 if not public.is_network_admin(v_network) or (select vertical_kind from public.networks where id=v_network)<>'alumni' then raise exception 'Alumni admin access required.' using errcode='42501'; end if;
 if p_email is not null and trim(p_email)<>'' then select id into v_id from public.alumni_profiles where network_id=v_network and lower(email)=lower(trim(p_email)); end if;
 if v_id is null then
  insert into public.alumni_profiles(network_id,full_name,email,graduation_year,program,department,city,company,job_title) values(v_network,trim(p_full_name),nullif(lower(trim(p_email)),''),p_graduation_year,nullif(trim(p_program),''),nullif(trim(p_department),''),nullif(trim(p_city),''),nullif(trim(p_company),''),nullif(trim(p_job_title),'')) returning id into v_id;
 else
  update public.alumni_profiles set full_name=trim(p_full_name),graduation_year=coalesce(p_graduation_year,graduation_year),program=coalesce(nullif(trim(p_program),''),program),department=coalesce(nullif(trim(p_department),''),department),city=coalesce(nullif(trim(p_city),''),city),company=coalesce(nullif(trim(p_company),''),company),job_title=coalesce(nullif(trim(p_job_title),''),job_title),updated_at=now() where id=v_id;
 end if;
 return v_id;
end $$;
revoke all on function public.admin_upsert_alumni_profile(text,text,integer,text,text,text,text,text) from public;
grant execute on function public.admin_upsert_alumni_profile(text,text,integer,text,text,text,text,text) to authenticated;

create or replace function public.import_alumni_profiles(p_rows jsonb) returns table(inserted integer,updated integer,skipped integer)
language plpgsql security definer set search_path=public as $$
declare v_network uuid:=public.current_network_id(); r jsonb; v_id uuid; v_inserted int:=0; v_updated int:=0; v_skipped int:=0;
begin
 if not public.is_network_admin(v_network) or (select vertical_kind from public.networks where id=v_network)<>'alumni' then raise exception 'Alumni admin access required.' using errcode='42501'; end if;
 if jsonb_typeof(p_rows)<>'array' or jsonb_array_length(p_rows)>1000 then raise exception 'Import must contain 1–1000 rows.'; end if;
 for r in select value from jsonb_array_elements(p_rows) loop
  if length(trim(coalesce(r->>'full_name','')))<2 then v_skipped:=v_skipped+1; continue; end if;
  v_id:=null;
  if nullif(trim(r->>'email'),'') is not null then select id into v_id from public.alumni_profiles where network_id=v_network and lower(email)=lower(trim(r->>'email')); end if;
  if v_id is null then
   insert into public.alumni_profiles(network_id,full_name,email,graduation_year,program,department,city,company,job_title)
   values(v_network,trim(r->>'full_name'),nullif(lower(trim(r->>'email')),''),nullif(r->>'graduation_year','')::integer,nullif(trim(r->>'program'),''),nullif(trim(r->>'department'),''),nullif(trim(r->>'city'),''),nullif(trim(r->>'company'),''),nullif(trim(r->>'job_title'),'')); v_inserted:=v_inserted+1;
  else
   update public.alumni_profiles set full_name=trim(r->>'full_name'),graduation_year=coalesce(nullif(r->>'graduation_year','')::integer,graduation_year),program=coalesce(nullif(trim(r->>'program'),''),program),department=coalesce(nullif(trim(r->>'department'),''),department),city=coalesce(nullif(trim(r->>'city'),''),city),company=coalesce(nullif(trim(r->>'company'),''),company),job_title=coalesce(nullif(trim(r->>'job_title'),''),job_title),updated_at=now() where id=v_id; v_updated:=v_updated+1;
  end if;
 end loop;
 return query select v_inserted,v_updated,v_skipped;
end $$;
revoke all on function public.import_alumni_profiles(jsonb) from public;
grant execute on function public.import_alumni_profiles(jsonb) to authenticated;

create or replace function public.create_alumni_invitation(p_profile_id uuid,p_recipient_hint text default null,p_expires_days integer default 30) returns text
language plpgsql security definer set search_path=public as $$
declare v_network uuid:=public.current_network_id(); v_token uuid;
begin
 if not public.is_network_admin(v_network) then raise exception 'Admin access required.' using errcode='42501'; end if;
 if not exists(select 1 from public.alumni_profiles where id=p_profile_id and network_id=v_network) then raise exception 'Profile not found.'; end if;
 insert into public.alumni_invitations(network_id,profile_id,recipient_hint,expires_at,created_by) values(v_network,p_profile_id,p_recipient_hint,now()+(greatest(1,least(coalesce(p_expires_days,30),90))||' days')::interval,auth.uid()) returning token into v_token;
 return v_token::text;
end $$;
revoke all on function public.create_alumni_invitation(uuid,text,integer) from public;
grant execute on function public.create_alumni_invitation(uuid,text,integer) to authenticated;

create or replace function public.preview_alumni_invitation(p_token text)
returns table(full_name varchar,network_name varchar,status varchar,expires_at timestamptz)
language sql security definer stable set search_path=public as $$
 select ap.full_name,n.name,ai.status,ai.expires_at from public.alumni_invitations ai join public.alumni_profiles ap on ap.id=ai.profile_id join public.networks n on n.id=ai.network_id where ai.token::text=p_token limit 1;
$$;
revoke all on function public.preview_alumni_invitation(text) from public;
grant execute on function public.preview_alumni_invitation(text) to anon,authenticated;

create or replace function public.accept_alumni_invitation(p_token text) returns uuid
language plpgsql security definer set search_path=public as $$
declare v_network uuid; v_profile uuid; v_existing uuid;
begin
 if auth.uid() is null then raise exception 'Sign in required.' using errcode='42501'; end if;
 select network_id,profile_id into v_network,v_profile from public.alumni_invitations where token::text=p_token and status='active' and expires_at>now() for update;
 if v_network is null then raise exception 'Invitation is invalid or expired.'; end if;
 select id into v_existing from public.alumni_profiles where network_id=v_network and claimed_by=auth.uid();
 if v_existing is not null and v_existing<>v_profile then raise exception 'Your account is already linked to another alumni profile in this network.'; end if;
 if exists(select 1 from public.alumni_profiles where id=v_profile and claimed_by is not null and claimed_by<>auth.uid()) then raise exception 'This profile has already been claimed.'; end if;
 update public.alumni_profiles set claimed_by=auth.uid(),updated_at=now() where id=v_profile;
 insert into public.network_memberships(network_id,user_id,role,status) values(v_network,auth.uid(),'member','active') on conflict(network_id,user_id) do update set status='active';
 update public.profiles set active_network_id=v_network,updated_at=now() where id=auth.uid();
 update public.alumni_invitations set status='accepted',accepted_at=now() where token::text=p_token;
 return v_network;
end $$;
revoke all on function public.accept_alumni_invitation(text) from public;
grant execute on function public.accept_alumni_invitation(text) to authenticated;
