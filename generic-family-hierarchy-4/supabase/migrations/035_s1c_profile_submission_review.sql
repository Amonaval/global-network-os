-- S1-C: family-scoped profile review without reopening direct table writes.
-- P4 hardening revoked direct UPDATE on profile_submissions; review must remain RPC-governed.

-- Gender is optional human relationship context used for Father/Mother/Son/Daughter wording.
alter table public.family_members add column if not exists gender varchar(10);
alter table public.family_members drop constraint if exists family_members_gender_check;
alter table public.family_members add constraint family_members_gender_check check (gender is null or gender in ('Male','Female','Other'));

-- Return gender to authenticated family views. This keeps relationship wording consistent after reload.
drop function if exists public.get_visible_family_members();
create function public.get_visible_family_members()
returns table (
  id uuid, full_name varchar(150), date_of_birth date, date_of_death date,
  generation_level integer, profession varchar(100), city varchar(100), country varchar(100),
  photo_url text, bio text, phone varchar(30), email varchar(255),
  latitude numeric(10,7), longitude numeric(10,7), profile_status varchar(20),
  profile_visibility varchar(20), contact_visibility varchar(20), created_at timestamptz, updated_at timestamptz,
  avatar_style varchar(20), facebook_url text, facebook_public boolean, instagram_url text, instagram_public boolean,
  other_social_url text, other_social_label varchar(40), other_social_public boolean, gender varchar(10)
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
    fm.avatar_style,fm.facebook_url,fm.facebook_public,fm.instagram_url,fm.instagram_public,fm.other_social_url,fm.other_social_label,fm.other_social_public,fm.gender
  from public.family_members fm
  where fm.network_id=public.current_network_id() and (fm.profile_status='approved' or public.is_network_admin(fm.network_id));
$$;
revoke all on function public.get_visible_family_members() from public;
grant execute on function public.get_visible_family_members() to authenticated;
create or replace function public.review_profile_submission(
  p_submission_id uuid,
  p_status varchar,
  p_review_note text default null
) returns void
language plpgsql security definer set search_path=public as $$
declare
  nid uuid := public.current_network_id();
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode='42501';
  end if;
  if p_status not in ('approved','rejected') then
    raise exception 'Review status must be approved or rejected.' using errcode='22023';
  end if;
  if nid is null or not public.is_network_admin(nid) then
    raise exception 'Family Owner or co-admin access is required.' using errcode='42501';
  end if;
  if not exists(select 1 from public.profile_submissions ps where ps.id=p_submission_id and ps.network_id=nid) then
    raise exception 'Profile submission was not found in the active family.' using errcode='P0002';
  end if;

  update public.profile_submissions
     set status=p_status
   where id=p_submission_id and network_id=nid;

  insert into public.audit_log(actor_id,action,details,network_id)
  values(auth.uid(),
         case when p_status='approved' then 'profile_submission_approved' else 'profile_submission_rejected' end,
         jsonb_build_object('submission_id',p_submission_id,'review_note',nullif(trim(coalesce(p_review_note,'')),'')),
         nid);
end;
$$;
revoke all on function public.review_profile_submission(uuid,varchar,text) from public;
grant execute on function public.review_profile_submission(uuid,varchar,text) to authenticated;

comment on function public.review_profile_submission(uuid,varchar,text) is 'Family-scoped owner/admin review path for profile submissions. Keeps direct table UPDATE revoked.';

-- First-person bootstrap for a freshly created family. This is intentionally separate
-- from generic profile claiming: only the signed-in member of the active family can
-- create/link their own first profile, and only when their membership is unclaimed.
create or replace function public.add_myself_to_family(
  p_full_name text,
  p_gender varchar default null
) returns uuid
language plpgsql security definer set search_path=public as $$
declare
  uid uuid:=auth.uid(); nid uuid:=public.current_network_id(); mid uuid;
begin
  if uid is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  if nid is null or not public.is_network_member(nid) then raise exception 'Open a family first.' using errcode='42501'; end if;
  if length(trim(coalesce(p_full_name,'')))<2 then raise exception 'Please enter your name.' using errcode='22023'; end if;
  if p_gender is not null and p_gender not in ('Male','Female','Other') then raise exception 'Choose Male, Female or Other.' using errcode='22023'; end if;
  select nm.member_id into mid from public.network_memberships nm where nm.network_id=nid and nm.user_id=uid and nm.status='active';
  if mid is not null then return mid; end if;

  insert into public.family_members(id,network_id,full_name,generation_level,profile_status,profile_visibility,contact_visibility,gender)
  values(gen_random_uuid(),nid,left(trim(p_full_name),150),3,'approved','member','admin',p_gender)
  returning id into mid;

  update public.network_memberships set member_id=mid where network_id=nid and user_id=uid and status='active';
  update public.profiles set member_id=mid,active_network_id=nid,updated_at=now() where id=uid;
  insert into public.audit_log(network_id,actor_id,action,details)
  values(nid,uid,'family_creator_profile_added',jsonb_build_object('member_id',mid));
  return mid;
end;
$$;
revoke all on function public.add_myself_to_family(text,varchar) from public;
grant execute on function public.add_myself_to_family(text,varchar) to authenticated;
