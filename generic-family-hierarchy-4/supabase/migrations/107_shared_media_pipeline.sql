-- E5 — Shared private media registry, compression metadata and entity binding.
-- Additive foundation for profile, memory, event, announcement, complaint and future post media.

create table if not exists public.network_media_assets(
  id uuid primary key default gen_random_uuid(),
  network_id uuid not null references public.networks(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  bucket varchar(40) not null check(bucket in ('profile-photos','community-media')),
  object_path text not null,
  thumbnail_path text,
  media_kind varchar(30) not null check(media_kind in ('profile','memory','event','announcement','complaint','post','other')),
  entity_type varchar(80),
  entity_id text,
  mime_type varchar(100) not null default 'image/webp',
  bytes bigint not null default 0 check(bytes>=0),
  thumbnail_bytes bigint not null default 0 check(thumbnail_bytes>=0),
  width integer,
  height integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(bucket,object_path)
);
create index if not exists idx_network_media_assets_network_entity on public.network_media_assets(network_id,entity_type,entity_id,created_at desc);
create index if not exists idx_network_media_assets_network_kind on public.network_media_assets(network_id,media_kind,created_at desc);

-- Engagement-first showcase verticals need media enabled. Keep Family's existing per-network choice untouched.
update public.networks
set photo_upload_enabled=true,photo_max_bytes=greatest(photo_max_bytes,262144),updated_at=now()
where vertical_kind in ('family-association','housing-society');
alter table public.network_media_assets enable row level security;
revoke all on table public.network_media_assets from anon,authenticated;

create or replace function public.register_network_media_asset(
  p_bucket text,
  p_object_path text,
  p_thumbnail_path text default null,
  p_media_kind text default 'other',
  p_entity_type text default null,
  p_entity_id text default null,
  p_mime_type text default 'image/webp',
  p_bytes bigint default 0,
  p_thumbnail_bytes bigint default 0,
  p_width integer default null,
  p_height integer default null
) returns uuid
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); rid uuid; expected_scope text;
begin
  if nid is null or not public.is_network_member(nid) then raise exception 'Network membership required.' using errcode='42501'; end if;
  if p_bucket not in ('profile-photos','community-media') then raise exception 'Unsupported media bucket.'; end if;
  if p_media_kind not in ('profile','memory','event','announcement','complaint','post','other') then raise exception 'Unsupported media kind.'; end if;
  expected_scope:=case when p_bucket='profile-photos' then 'profiles' else 'community' end;
  if coalesce(p_object_path,'') not like nid::text||'/'||expected_scope||'/'||auth.uid()::text||'/%' then
    raise exception 'Media path is not owned by the signed-in member in the active network.' using errcode='42501';
  end if;
  if nullif(p_thumbnail_path,'') is not null and p_thumbnail_path not like nid::text||'/'||expected_scope||'/'||auth.uid()::text||'/%' then
    raise exception 'Thumbnail path is not owned by the signed-in member in the active network.' using errcode='42501';
  end if;
  insert into public.network_media_assets(network_id,owner_user_id,bucket,object_path,thumbnail_path,media_kind,entity_type,entity_id,mime_type,bytes,thumbnail_bytes,width,height)
  values(nid,auth.uid(),p_bucket,p_object_path,nullif(p_thumbnail_path,''),p_media_kind,nullif(trim(p_entity_type),''),nullif(trim(p_entity_id),''),coalesce(nullif(p_mime_type,''),'image/webp'),greatest(coalesce(p_bytes,0),0),greatest(coalesce(p_thumbnail_bytes,0),0),p_width,p_height)
  on conflict(bucket,object_path) do update set thumbnail_path=excluded.thumbnail_path,media_kind=excluded.media_kind,entity_type=coalesce(excluded.entity_type,network_media_assets.entity_type),entity_id=coalesce(excluded.entity_id,network_media_assets.entity_id),mime_type=excluded.mime_type,bytes=excluded.bytes,thumbnail_bytes=excluded.thumbnail_bytes,width=excluded.width,height=excluded.height,updated_at=now()
  returning id into rid;
  return rid;
end $$;
revoke all on function public.register_network_media_asset(text,text,text,text,text,text,text,bigint,bigint,integer,integer) from public;
grant execute on function public.register_network_media_asset(text,text,text,text,text,text,text,bigint,bigint,integer,integer) to authenticated;

create or replace function public.bind_network_media_asset(p_asset_id uuid,p_entity_type text,p_entity_id text) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
  if nid is null or not public.is_network_member(nid) then raise exception 'Network membership required.' using errcode='42501'; end if;
  update public.network_media_assets
  set entity_type=nullif(trim(p_entity_type),''),entity_id=nullif(trim(p_entity_id),''),updated_at=now()
  where id=p_asset_id and network_id=nid and (owner_user_id=auth.uid() or public.is_network_admin(nid));
  if not found then raise exception 'Media asset not found or not editable.' using errcode='42501'; end if;
end $$;
revoke all on function public.bind_network_media_asset(uuid,text,text) from public;
grant execute on function public.bind_network_media_asset(uuid,text,text) to authenticated;

create or replace function public.get_network_media_assets(p_entity_type text,p_entity_ids text[] default null)
returns table(id uuid,bucket varchar,object_path text,thumbnail_path text,media_kind varchar,entity_type varchar,entity_id text,mime_type varchar,bytes bigint,thumbnail_bytes bigint,width integer,height integer,created_at timestamptz)
language sql security definer stable set search_path=public as $$
 select m.id,m.bucket,m.object_path,m.thumbnail_path,m.media_kind,m.entity_type,m.entity_id,m.mime_type,m.bytes,m.thumbnail_bytes,m.width,m.height,m.created_at
 from public.network_media_assets m
 where m.network_id=public.current_network_id() and public.is_network_member(m.network_id)
   and (nullif(trim(coalesce(p_entity_type,'')),'') is null or m.entity_type=p_entity_type)
   and (p_entity_ids is null or cardinality(p_entity_ids)=0 or m.entity_id=any(p_entity_ids))
 order by m.created_at desc;
$$;
revoke all on function public.get_network_media_assets(text,text[]) from public;
grant execute on function public.get_network_media_assets(text,text[]) to authenticated;

create or replace function public.forget_network_media_asset_by_path(p_bucket text,p_object_path text) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
 delete from public.network_media_assets where network_id=nid and bucket=p_bucket and object_path=p_object_path and (owner_user_id=auth.uid() or public.is_network_admin(nid));
end $$;
revoke all on function public.forget_network_media_asset_by_path(text,text) from public;
grant execute on function public.forget_network_media_asset_by_path(text,text) to authenticated;

create or replace function public.get_network_media_summary()
returns table(media_usage_bytes bigint,storage_limit_bytes bigint,registered_assets bigint,registered_main_bytes bigint,registered_thumbnail_bytes bigint)
language sql security definer stable set search_path=public as $$
 select n.media_usage_bytes,n.storage_limit_bytes,
   (select count(*) from public.network_media_assets m where m.network_id=n.id),
   (select coalesce(sum(m.bytes),0) from public.network_media_assets m where m.network_id=n.id),
   (select coalesce(sum(m.thumbnail_bytes),0) from public.network_media_assets m where m.network_id=n.id)
 from public.networks n where n.id=public.current_network_id() and public.is_network_member(n.id);
$$;
revoke all on function public.get_network_media_summary() from public;
grant execute on function public.get_network_media_summary() to authenticated;

-- Registered E5 assets (including thumbnails) are readable by active network members.
-- Existing privacy rules for legacy memories / complaints are preserved by the surrounding predicates.
create or replace function public.can_read_profile_photo(object_name text) returns boolean
language sql security definer stable set search_path=public as $$
 select auth.uid() is not null and (
   (object_name like public.current_network_id()::text||'/%' and public.is_network_member(public.current_network_id()))
   or object_name like 'profiles/'||auth.uid()::text||'/%'
 ) and (
   public.is_network_admin()
   or object_name like public.current_network_id()::text||'/profiles/'||auth.uid()::text||'/%'
   or object_name like 'profiles/'||auth.uid()::text||'/%'
   or exists(select 1 from public.network_media_assets a where a.network_id=public.current_network_id() and a.bucket='profile-photos' and (a.object_path=object_name or a.thumbnail_path=object_name) and public.is_network_member(a.network_id))
   or exists(select 1 from public.family_members fm where fm.network_id=public.current_network_id() and (fm.photo_url=object_name or fm.photo_url like '%/profile-photos/'||object_name) and fm.profile_status='approved' and fm.profile_visibility<>'admin')
 );
$$;
revoke all on function public.can_read_profile_photo(text) from public;grant execute on function public.can_read_profile_photo(text) to authenticated;

create or replace function public.can_read_community_media(object_name text) returns boolean
language sql security definer stable set search_path=public as $$
 select auth.uid() is not null and (
   (object_name like public.current_network_id()::text||'/%' and public.is_network_member(public.current_network_id()))
   or object_name like 'community/'||auth.uid()::text||'/%'
 ) and (
   public.is_network_admin()
   or object_name like public.current_network_id()::text||'/community/'||auth.uid()::text||'/%'
   or object_name like 'community/'||auth.uid()::text||'/%'
   or exists(select 1 from public.network_media_assets a where a.network_id=public.current_network_id() and a.bucket='community-media' and a.media_kind<>'complaint' and (a.object_path=object_name or a.thumbnail_path=object_name) and public.is_network_member(a.network_id))
   or exists(select 1 from public.memories m left join public.family_members fm on fm.id=m.member_id and fm.network_id=m.network_id
     where m.network_id=public.current_network_id() and (m.photo_url=object_name or m.photo_url like '%/community-media/'||object_name)
       and m.visibility<>'admin' and (m.member_id is null or (fm.profile_status='approved' and fm.profile_visibility<>'admin')))
   or exists(select 1 from public.hs_complaints c cross join lateral jsonb_array_elements(c.attachments) a
     where c.network_id=public.current_network_id() and coalesce(a->>'path',a->>'url')=object_name
       and (c.created_by=auth.uid() or c.assigned_to=auth.uid() or public.is_network_admin(c.network_id)))
 );
$$;
revoke all on function public.can_read_community_media(text) from public;grant execute on function public.can_read_community_media(text) to authenticated;
