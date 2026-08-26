-- P5-S0: visibility-aware authorization for private media.
-- Run after 001 -> 013. This replaces bucket-wide authenticated SELECT.

update storage.buckets set public = false
where id in ('profile-photos', 'community-media');

-- Keep table details out of the storage policy and run the checks with a fixed
-- search_path. A signed URL may be minted only when the current viewer could
-- also obtain the corresponding profile/memory through the application RPCs.
create or replace function public.can_read_profile_photo(object_name text)
returns boolean
language sql security definer stable set search_path = public
as $$
  select auth.uid() is not null and (
    public.is_admin()
    or object_name like 'profiles/' || auth.uid()::text || '/%'
    or exists (
      select 1
      from public.family_members fm
      where (fm.photo_url = object_name or fm.photo_url like '%/profile-photos/' || object_name)
        and fm.profile_status = 'approved'
        and fm.profile_visibility <> 'admin'
    )
  );
$$;
revoke all on function public.can_read_profile_photo(text) from public;
grant execute on function public.can_read_profile_photo(text) to authenticated;

create or replace function public.can_read_community_media(object_name text)
returns boolean
language sql security definer stable set search_path = public
as $$
  select auth.uid() is not null and (
    public.is_admin()
    or object_name like 'community/' || auth.uid()::text || '/%'
    or exists (
      select 1
      from public.memories m
      left join public.family_members fm on fm.id = m.member_id
      where (m.photo_url = object_name or m.photo_url like '%/community-media/' || object_name)
        and m.visibility <> 'admin'
        and (
          m.member_id is null
          or (fm.profile_status = 'approved' and fm.profile_visibility <> 'admin')
        )
    )
  );
$$;
revoke all on function public.can_read_community_media(text) from public;
grant execute on function public.can_read_community_media(text) to authenticated;

drop policy if exists "authenticated can read profile photos" on storage.objects;
drop policy if exists "visibility-aware profile photo reads" on storage.objects;
create policy "visibility-aware profile photo reads"
on storage.objects for select to authenticated
using (
  bucket_id = 'profile-photos'
  and public.can_read_profile_photo(name)
);

drop policy if exists "authenticated can read community media" on storage.objects;
drop policy if exists "visibility-aware community media reads" on storage.objects;
create policy "visibility-aware community media reads"
on storage.objects for select to authenticated
using (
  bucket_id = 'community-media'
  and public.can_read_community_media(name)
);

-- Prevent callers from attaching an object owned by another account to a new
-- memory and thereby turning a guessed private path into readable content.
create or replace function public.create_memory(
  p_member_id uuid,
  p_title varchar,
  p_story text default null,
  p_photo_url text default null,
  p_visibility varchar default 'member'
) returns uuid
language plpgsql security definer set search_path=public as $$
declare memory_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  if nullif(trim(p_title),'') is null then raise exception 'Memory title is required.' using errcode='22023'; end if;
  if p_visibility not in ('public','member','admin') then raise exception 'Invalid visibility.' using errcode='22023'; end if;
  if p_visibility='admin' and not public.is_admin() then raise exception 'Only administrators can create admin-only memories.' using errcode='42501'; end if;
  if not public.is_admin() and p_member_id is not null
     and not exists(select 1 from public.profiles where id=auth.uid() and member_id=p_member_id) then
    raise exception 'You can only create memories for your own profile.' using errcode='42501';
  end if;
  if p_photo_url is not null and p_photo_url <> ''
     and not public.is_admin()
     and p_photo_url not like 'community/' || auth.uid()::text || '/%' then
    raise exception 'You can only attach media uploaded by your account.' using errcode='42501';
  end if;
  insert into public.memories(member_id,title,story,photo_url,visibility,created_by)
  values(p_member_id,trim(p_title),p_story,nullif(p_photo_url,''),p_visibility,auth.uid())
  returning id into memory_id;
  insert into public.audit_log(actor_id,action,details)
  values(auth.uid(),'memory_created',jsonb_build_object('memory_id',memory_id,'member_id',p_member_id));
  return memory_id;
end;
$$;
revoke all on function public.create_memory(uuid,varchar,text,text,varchar) from public;
grant execute on function public.create_memory(uuid,varchar,text,text,varchar) to authenticated;

-- Profile submissions are inserted by a SECURITY DEFINER RPC. Validate the
-- referenced object at the table boundary as defense in depth.
create or replace function public.validate_profile_submission_media()
returns trigger
language plpgsql security definer set search_path=public as $$
begin
  if new.photo_url is not null and new.photo_url <> ''
     and not public.is_admin()
     and new.photo_url not like 'profiles/' || new.submitted_by::text || '/%' then
    raise exception 'You can only attach a profile photo uploaded by your account.' using errcode='42501';
  end if;
  return new;
end;
$$;

drop trigger if exists validate_profile_submission_media_trigger on public.profile_submissions;
create trigger validate_profile_submission_media_trigger
before insert or update of photo_url on public.profile_submissions
for each row execute function public.validate_profile_submission_media();
