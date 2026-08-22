-- A5 — 100 MB family storage enforcement
-- Run after 022. Enforces tenant-prefixed media, 100 KB/image and 100 MB/family at the database boundary.

alter table public.networks add column if not exists media_usage_bytes bigint not null default 0 check (media_usage_bytes >= 0);

-- Reconcile counters from existing A1-prefixed objects. Legacy non-prefixed objects remain readable but
-- are intentionally not attributed to a family until migrated/re-uploaded.
update public.networks n set media_usage_bytes=coalesce((
  select sum(coalesce((o.metadata->>'size')::bigint,0))
  from storage.objects o
  where o.bucket_id in ('profile-photos','community-media') and o.name like n.id::text||'/%'
),0);

create or replace function public.a5_storage_guard() returns trigger
language plpgsql security definer set search_path=public,storage as $$
declare
  nid uuid; bytes bigint; old_bytes bigint:=0; lim bigint; max_file integer; current_usage bigint;
begin
  if new.bucket_id not in ('profile-photos','community-media') then return new; end if;
  begin nid:=split_part(new.name,'/',1)::uuid; exception when others then
    raise exception 'Family media path must begin with the family id.' using errcode='22023';
  end;
  if nid<>public.current_network_id() or not public.is_network_member(nid) then
    raise exception 'Media can only be uploaded to your active family.' using errcode='42501';
  end if;
  bytes:=coalesce((new.metadata->>'size')::bigint,0);
  select storage_limit_bytes,photo_max_bytes,media_usage_bytes into lim,max_file,current_usage
  from public.networks where id=nid for update;
  if lim is null then raise exception 'Family was not found.' using errcode='P0002'; end if;
  if bytes<=0 then raise exception 'Uploaded image size could not be verified.' using errcode='22023'; end if;
  if bytes>max_file then raise exception 'Image exceeds this family''s % KB upload limit.',ceil(max_file/1024.0) using errcode='22023'; end if;
  if tg_op='UPDATE' then old_bytes:=coalesce((old.metadata->>'size')::bigint,0); end if;
  if current_usage-old_bytes+bytes>lim then
    raise exception 'Family storage limit reached. Remove older photos or use a lightweight avatar.' using errcode='22023';
  end if;
  return new;
end $$;

create or replace function public.a5_storage_account() returns trigger
language plpgsql security definer set search_path=public,storage as $$
declare nid uuid; delta bigint;
begin
  if tg_op='INSERT' then
    if new.bucket_id not in ('profile-photos','community-media') then return new; end if;
    begin nid:=split_part(new.name,'/',1)::uuid; exception when others then return new; end;
    delta:=coalesce((new.metadata->>'size')::bigint,0);
    update public.networks set media_usage_bytes=media_usage_bytes+delta,updated_at=now() where id=nid;
    return new;
  elsif tg_op='DELETE' then
    if old.bucket_id not in ('profile-photos','community-media') then return old; end if;
    begin nid:=split_part(old.name,'/',1)::uuid; exception when others then return old; end;
    delta:=coalesce((old.metadata->>'size')::bigint,0);
    update public.networks set media_usage_bytes=greatest(0,media_usage_bytes-delta),updated_at=now() where id=nid;
    return old;
  else
    if new.bucket_id not in ('profile-photos','community-media') then return new; end if;
    begin nid:=split_part(new.name,'/',1)::uuid; exception when others then return new; end;
    delta:=coalesce((new.metadata->>'size')::bigint,0)-coalesce((old.metadata->>'size')::bigint,0);
    update public.networks set media_usage_bytes=greatest(0,media_usage_bytes+delta),updated_at=now() where id=nid;
    return new;
  end if;
end $$;

drop trigger if exists a5_storage_guard_trigger on storage.objects;
create trigger a5_storage_guard_trigger before insert or update on storage.objects for each row execute function public.a5_storage_guard();
drop trigger if exists a5_storage_account_trigger on storage.objects;
create trigger a5_storage_account_trigger after insert or update or delete on storage.objects for each row execute function public.a5_storage_account();

-- New paths: <network_id>/profiles/<user_id>/... and <network_id>/community/<user_id>/...
drop policy if exists "authenticated can upload profile photos" on storage.objects;
create policy "authenticated can upload profile photos" on storage.objects for insert to authenticated with check (
 bucket_id='profile-photos' and (storage.foldername(name))[1]=public.current_network_id()::text and
 (storage.foldername(name))[2]='profiles' and (storage.foldername(name))[3]=auth.uid()::text and public.is_network_member(public.current_network_id())
);
drop policy if exists "authenticated can update own profile photos" on storage.objects;
create policy "authenticated can update own profile photos" on storage.objects for update to authenticated using (
 bucket_id='profile-photos' and (storage.foldername(name))[1]=public.current_network_id()::text and (storage.foldername(name))[2]='profiles' and (storage.foldername(name))[3]=auth.uid()::text
) with check (
 bucket_id='profile-photos' and (storage.foldername(name))[1]=public.current_network_id()::text and (storage.foldername(name))[2]='profiles' and (storage.foldername(name))[3]=auth.uid()::text
);
drop policy if exists "authenticated can delete own profile photos" on storage.objects;
create policy "authenticated can delete own profile photos" on storage.objects for delete to authenticated using (
 bucket_id='profile-photos' and (storage.foldername(name))[1]=public.current_network_id()::text and ((storage.foldername(name))[2]='profiles' and (storage.foldername(name))[3]=auth.uid()::text or public.is_network_admin(public.current_network_id()))
);

drop policy if exists "authenticated can upload community media" on storage.objects;
create policy "authenticated can upload community media" on storage.objects for insert to authenticated with check (
 bucket_id='community-media' and (storage.foldername(name))[1]=public.current_network_id()::text and (storage.foldername(name))[2]='community' and (storage.foldername(name))[3]=auth.uid()::text
);
drop policy if exists "authenticated can delete community media" on storage.objects;
create policy "authenticated can delete community media" on storage.objects for delete to authenticated using (
 bucket_id='community-media' and (storage.foldername(name))[1]=public.current_network_id()::text and ((storage.foldername(name))[2]='community' and (storage.foldername(name))[3]=auth.uid()::text or public.is_network_admin(public.current_network_id()))
);

-- Tenant-aware read helpers, retaining legacy paths for already-stored media.
create or replace function public.can_read_profile_photo(object_name text) returns boolean
language sql security definer stable set search_path=public as $$
 select auth.uid() is not null and (
   (object_name like public.current_network_id()::text||'/%' and public.is_network_member(public.current_network_id()))
   or object_name like 'profiles/'||auth.uid()::text||'/%'
 ) and (public.is_network_admin() or exists(
   select 1 from public.family_members fm where fm.network_id=public.current_network_id()
   and (fm.photo_url=object_name or fm.photo_url like '%/profile-photos/'||object_name)
   and fm.profile_status='approved' and fm.profile_visibility<>'admin'
 ) or object_name like public.current_network_id()::text||'/profiles/'||auth.uid()::text||'/%' or object_name like 'profiles/'||auth.uid()::text||'/%');
$$;

create or replace function public.can_read_community_media(object_name text) returns boolean
language sql security definer stable set search_path=public as $$
 select auth.uid() is not null and (
   (object_name like public.current_network_id()::text||'/%' and public.is_network_member(public.current_network_id()))
   or object_name like 'community/'||auth.uid()::text||'/%'
 ) and (public.is_network_admin() or exists(
   select 1 from public.memories m left join public.family_members fm on fm.id=m.member_id and fm.network_id=m.network_id
   where m.network_id=public.current_network_id() and (m.photo_url=object_name or m.photo_url like '%/community-media/'||object_name)
   and m.visibility<>'admin' and (m.member_id is null or (fm.profile_status='approved' and fm.profile_visibility<>'admin'))
 ) or object_name like public.current_network_id()::text||'/community/'||auth.uid()::text||'/%' or object_name like 'community/'||auth.uid()::text||'/%');
$$;

-- A3 summary now uses the atomic counter rather than repeatedly scanning Storage.
create or replace function public.get_family_admin_summary()
returns table(member_profiles bigint,claimed_profiles bigint,active_invitations bigint,admin_count bigint,media_usage_bytes bigint,storage_limit_bytes bigint,photo_max_bytes integer)
language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
 if not public.is_network_admin(nid) then raise exception 'Family administrator access is required.' using errcode='42501'; end if;
 return query select
  (select count(*) from public.family_members m where m.network_id=nid),
  (select count(*) from public.network_memberships nm where nm.network_id=nid and nm.status='active' and nm.member_id is not null),
  (select count(*) from public.member_invitations i where i.network_id=nid and i.status='active' and i.expires_at>now()),
  (select count(*) from public.network_memberships nm where nm.network_id=nid and nm.status='active' and nm.role in ('owner','admin')),
  n.media_usage_bytes,n.storage_limit_bytes,n.photo_max_bytes from public.networks n where n.id=nid;
end $$;
revoke all on function public.get_family_admin_summary() from public;
grant execute on function public.get_family_admin_summary() to authenticated;
