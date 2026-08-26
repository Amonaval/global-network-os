-- A4 — Lightweight Identity & Social Links
-- Run after 021. Adds storage-free avatar choices and explicit, opt-in public social links.

alter table public.family_members
  add column if not exists avatar_style varchar(20) not null default 'initials'
    check (avatar_style in ('initials','leaf','sun','sparkles','heart','person')),
  add column if not exists facebook_url text,
  add column if not exists facebook_public boolean not null default false,
  add column if not exists instagram_url text,
  add column if not exists instagram_public boolean not null default false,
  add column if not exists other_social_url text,
  add column if not exists other_social_label varchar(40),
  add column if not exists other_social_public boolean not null default false;

alter table public.profile_submissions
  add column if not exists avatar_style varchar(20) not null default 'initials',
  add column if not exists facebook_url text,
  add column if not exists facebook_public boolean not null default false,
  add column if not exists instagram_url text,
  add column if not exists instagram_public boolean not null default false,
  add column if not exists other_social_url text,
  add column if not exists other_social_label varchar(40),
  add column if not exists other_social_public boolean not null default false;

create or replace function public.a4_safe_external_url(p_url text,p_kind text default 'other') returns boolean
language plpgsql immutable set search_path=public as $$
declare u text:=lower(trim(coalesce(p_url,'')));
begin
  if u='' then return true; end if;
  if u !~ '^https://[^[:space:]]+$' then return false; end if;
  if p_kind='facebook' then return u ~ '^https://(www\.|m\.)?facebook\.com/'; end if;
  if p_kind='instagram' then return u ~ '^https://(www\.)?instagram\.com/'; end if;
  return true;
end $$;

alter table public.family_members drop constraint if exists family_members_a4_social_urls;
alter table public.family_members add constraint family_members_a4_social_urls check (
  public.a4_safe_external_url(facebook_url,'facebook') and
  public.a4_safe_external_url(instagram_url,'instagram') and
  public.a4_safe_external_url(other_social_url,'other') and
  (facebook_url is not null or facebook_public=false) and
  (instagram_url is not null or instagram_public=false) and
  (other_social_url is not null or other_social_public=false)
);

-- Return identity/social fields to authenticated family views, tenant-scoped.
drop function if exists public.get_visible_family_members();
create function public.get_visible_family_members()
returns table (
  id uuid, full_name varchar(150), date_of_birth date, date_of_death date,
  generation_level integer, profession varchar(100), city varchar(100), country varchar(100),
  photo_url text, bio text, phone varchar(30), email varchar(255),
  latitude numeric(10,7), longitude numeric(10,7), profile_status varchar(20),
  profile_visibility varchar(20), contact_visibility varchar(20), created_at timestamptz, updated_at timestamptz,
  avatar_style varchar(20), facebook_url text, facebook_public boolean, instagram_url text, instagram_public boolean,
  other_social_url text, other_social_label varchar(40), other_social_public boolean
)
language sql security definer stable set search_path=public as $$
  select fm.id,fm.full_name,fm.date_of_birth,fm.date_of_death,fm.generation_level,fm.profession,
    case when public.is_network_admin(fm.network_id) or fm.profile_visibility <> 'admin' then fm.city else null end,
    case when public.is_network_admin(fm.network_id) or fm.profile_visibility <> 'admin' then fm.country else null end,
    case when public.is_network_admin(fm.network_id) or fm.profile_visibility <> 'admin' then fm.photo_url else null end,
    case when public.is_network_admin(fm.network_id) or fm.profile_visibility <> 'admin' then fm.bio else null end,
    case when public.is_network_admin(fm.network_id) or fm.contact_visibility = 'member' then fm.phone else null end,
    case when public.is_network_admin(fm.network_id) or fm.contact_visibility = 'member' then fm.email else null end,
    fm.latitude,fm.longitude,fm.profile_status,fm.profile_visibility,fm.contact_visibility,fm.created_at,fm.updated_at,
    fm.avatar_style,fm.facebook_url,fm.facebook_public,fm.instagram_url,fm.instagram_public,fm.other_social_url,fm.other_social_label,fm.other_social_public
  from public.family_members fm
  where fm.network_id=public.current_network_id() and (fm.profile_status='approved' or public.is_network_admin(fm.network_id));
$$;
revoke all on function public.get_visible_family_members() from public;
grant execute on function public.get_visible_family_members() to authenticated;

-- Replace the safe-self-edit RPC so identity/social data can be maintained without admin review.
drop function if exists public.update_own_profile_safe_fields(varchar,varchar,varchar,text,varchar,varchar,text);
create function public.update_own_profile_safe_fields(
  p_profession varchar default null,p_city varchar default null,p_country varchar default null,p_bio text default null,
  p_phone varchar default null,p_email varchar default null,p_photo_url text default null,p_avatar_style varchar default 'initials',
  p_facebook_url text default null,p_facebook_public boolean default false,p_instagram_url text default null,p_instagram_public boolean default false,
  p_other_social_url text default null,p_other_social_label varchar default null,p_other_social_public boolean default false
) returns public.family_members
language plpgsql security definer set search_path=public as $$
declare target_member uuid; result public.family_members; mode varchar;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select p.member_id into target_member from public.profiles p where p.id=auth.uid();
  if target_member is null then raise exception 'Your account is not linked to a member profile.' using errcode='42501'; end if;
  select coalesce(ns.self_edit_mode,'review') into mode from public.network_settings ns where ns.network_id=public.current_network_id() limit 1;
  if coalesce(mode,'review') <> 'safe_fields_direct' then raise exception 'This family requires administrator review for profile changes.' using errcode='42501'; end if;
  if p_email is not null and p_email<>'' and position('@' in p_email)=0 then raise exception 'Enter a valid email address.' using errcode='22023'; end if;
  if p_avatar_style not in ('initials','leaf','sun','sparkles','heart','person') then raise exception 'Invalid avatar choice.' using errcode='22023'; end if;
  if not public.a4_safe_external_url(p_facebook_url,'facebook') or not public.a4_safe_external_url(p_instagram_url,'instagram') or not public.a4_safe_external_url(p_other_social_url,'other') then raise exception 'Enter valid HTTPS social profile links.' using errcode='22023'; end if;
  update public.family_members set profession=nullif(trim(p_profession),''),city=nullif(trim(p_city),''),country=coalesce(nullif(trim(p_country),''),'India'),bio=nullif(p_bio,''),phone=nullif(trim(p_phone),''),email=nullif(trim(p_email),''),photo_url=coalesce(nullif(p_photo_url,''),photo_url),avatar_style=p_avatar_style,facebook_url=nullif(trim(p_facebook_url),''),facebook_public=(p_facebook_public and nullif(trim(p_facebook_url),'') is not null),instagram_url=nullif(trim(p_instagram_url),''),instagram_public=(p_instagram_public and nullif(trim(p_instagram_url),'') is not null),other_social_url=nullif(trim(p_other_social_url),''),other_social_label=left(coalesce(nullif(trim(p_other_social_label),''),'Website'),40),other_social_public=(p_other_social_public and nullif(trim(p_other_social_url),'') is not null),updated_at=now()
  where id=target_member and network_id=public.current_network_id() returning * into result;
  if result.id is null then raise exception 'Linked member profile was not found in this family.' using errcode='P0002'; end if;
  insert into public.audit_log(actor_id,action,details) values(auth.uid(),'own_profile_identity_links_updated',jsonb_build_object('member_id',target_member));
  return result;
end $$;
revoke all on function public.update_own_profile_safe_fields(varchar,varchar,varchar,text,varchar,varchar,text,varchar,text,boolean,text,boolean,text,varchar,boolean) from public;
grant execute on function public.update_own_profile_safe_fields(varchar,varchar,varchar,text,varchar,varchar,text,varchar,text,boolean,text,boolean,text,varchar,boolean) to authenticated;

-- Governed profile submissions carry the same fields for admin-approved edits/additions.
drop function if exists public.submit_profile_change(uuid,uuid,varchar,varchar,varchar,varchar,text,varchar,varchar,text,varchar,varchar);
create function public.submit_profile_change(
  p_submission_id uuid,p_member_id uuid default null,p_full_name varchar default '',p_profession varchar default null,p_city varchar default null,p_country varchar default null,p_bio text default null,p_phone varchar default null,p_email varchar default null,p_photo_url text default null,p_profile_visibility varchar default 'member',p_contact_visibility varchar default 'admin',
  p_avatar_style varchar default 'initials',p_facebook_url text default null,p_facebook_public boolean default false,p_instagram_url text default null,p_instagram_public boolean default false,p_other_social_url text default null,p_other_social_label varchar default null,p_other_social_public boolean default false
) returns uuid language plpgsql security definer set search_path=public as $$
declare request_id uuid;
begin
 if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
 if nullif(trim(p_full_name),'') is null then raise exception 'Full name is required.' using errcode='22023'; end if;
 if p_profile_visibility not in ('public','member','admin') or p_contact_visibility not in ('member','admin') then raise exception 'Invalid visibility setting.' using errcode='22023'; end if;
 if p_avatar_style not in ('initials','leaf','sun','sparkles','heart','person') then raise exception 'Invalid avatar choice.' using errcode='22023'; end if;
 if not public.a4_safe_external_url(p_facebook_url,'facebook') or not public.a4_safe_external_url(p_instagram_url,'instagram') or not public.a4_safe_external_url(p_other_social_url,'other') then raise exception 'Enter valid HTTPS social profile links.' using errcode='22023'; end if;
 if not public.is_network_admin() and p_member_id is not null and not exists(select 1 from public.profiles where id=auth.uid() and member_id=p_member_id) then raise exception 'You can only submit changes for your own profile.' using errcode='42501'; end if;
 insert into public.profile_submissions(id,member_id,full_name,profession,city,country,bio,phone,email,photo_url,status,submitted_by,profile_visibility,contact_visibility,avatar_style,facebook_url,facebook_public,instagram_url,instagram_public,other_social_url,other_social_label,other_social_public)
 values(p_submission_id,p_member_id,trim(p_full_name),p_profession,p_city,p_country,p_bio,p_phone,p_email,p_photo_url,'pending',auth.uid(),p_profile_visibility,p_contact_visibility,p_avatar_style,nullif(trim(p_facebook_url),''),(p_facebook_public and nullif(trim(p_facebook_url),'') is not null),nullif(trim(p_instagram_url),''),(p_instagram_public and nullif(trim(p_instagram_url),'') is not null),nullif(trim(p_other_social_url),''),left(coalesce(nullif(trim(p_other_social_label),''),'Website'),40),(p_other_social_public and nullif(trim(p_other_social_url),'') is not null));
 insert into public.change_requests(action,target_member_id,submitted_by,payload) values(case when p_member_id is null then 'create_member' else 'update_member' end,p_member_id,auth.uid(),jsonb_build_object('submission_id',p_submission_id,'full_name',p_full_name,'profile_visibility',p_profile_visibility,'contact_visibility',p_contact_visibility,'avatar_style',p_avatar_style)) returning id into request_id;
 return request_id;
end $$;
revoke all on function public.submit_profile_change(uuid,uuid,varchar,varchar,varchar,varchar,text,varchar,varchar,text,varchar,varchar,varchar,text,boolean,text,boolean,text,varchar,boolean) from public;
grant execute on function public.submit_profile_change(uuid,uuid,varchar,varchar,varchar,varchar,text,varchar,varchar,text,varchar,varchar,varchar,text,boolean,text,boolean,text,varchar,boolean) to authenticated;

-- Public RPC returns only links explicitly opted into public display. No social image is fetched or stored.
drop function if exists public.get_public_family_member(uuid);
create function public.get_public_family_member(p_member_id uuid)
returns table(id uuid,full_name text,generation_level integer,profession text,city text,country text,bio text,date_of_death date,avatar_style varchar,facebook_url text,instagram_url text,other_social_url text,other_social_label varchar)
language sql security definer stable set search_path=public as $$
 select fm.id,fm.full_name::text,fm.generation_level,fm.profession::text,fm.city::text,fm.country::text,fm.bio,fm.date_of_death,fm.avatar_style,
   case when fm.facebook_public then fm.facebook_url else null end,
   case when fm.instagram_public then fm.instagram_url else null end,
   case when fm.other_social_public then fm.other_social_url else null end,
   case when fm.other_social_public then fm.other_social_label else null end
 from public.family_members fm where fm.id=p_member_id and fm.profile_status='approved' and fm.profile_visibility='public';
$$;
revoke all on function public.get_public_family_member(uuid) from public;
grant execute on function public.get_public_family_member(uuid) to anon,authenticated;

-- Lightweight avatar is safe to expose in the public directory; still no private photo.
drop function if exists public.get_public_family_members();
create function public.get_public_family_members()
returns table(id uuid,full_name text,generation_level integer,profession text,city text,country text,bio text,date_of_death date,avatar_style varchar)
language sql security definer stable set search_path=public as $$
 select fm.id,fm.full_name::text,fm.generation_level,fm.profession::text,fm.city::text,fm.country::text,fm.bio,fm.date_of_death,fm.avatar_style
 from public.family_members fm where fm.profile_status='approved' and fm.profile_visibility='public';
$$;
revoke all on function public.get_public_family_members() from public;
grant execute on function public.get_public_family_members() to anon,authenticated;
