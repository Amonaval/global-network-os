-- E8 — Media archive, quota visibility and explicit cleanup lifecycle.
-- Archive is reversible. Physical deletion is a deliberate two-step action with a registry tombstone.

alter table public.network_media_assets add column if not exists lifecycle_state varchar(20) not null default 'active';
alter table public.network_media_assets add column if not exists archived_at timestamptz;
alter table public.network_media_assets add column if not exists archived_by uuid references auth.users(id) on delete set null;
alter table public.network_media_assets add column if not exists delete_requested_at timestamptz;
alter table public.network_media_assets add column if not exists delete_requested_by uuid references auth.users(id) on delete set null;
alter table public.network_media_assets add column if not exists deleted_at timestamptz;
alter table public.network_media_assets add column if not exists deleted_by uuid references auth.users(id) on delete set null;
alter table public.network_media_assets add column if not exists delete_reason text;

do $$ begin
 if not exists(select 1 from pg_constraint where conname='network_media_lifecycle_check') then
  alter table public.network_media_assets add constraint network_media_lifecycle_check check(lifecycle_state in ('active','archived','delete_pending','deleted'));
 end if;
end $$;
create index if not exists idx_network_media_assets_lifecycle on public.network_media_assets(network_id,lifecycle_state,created_at desc);

create or replace function public.set_network_media_asset_archived(p_asset_id uuid,p_archived boolean) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();a public.network_media_assets%rowtype;
begin
 if nid is null then raise exception 'Choose an active network.';end if;
 select * into a from public.network_media_assets where id=p_asset_id and network_id=nid;
 if not found or not (a.owner_user_id=auth.uid() or public.is_network_admin(nid)) then raise exception 'Media asset not found or not editable.' using errcode='42501';end if;
 if a.lifecycle_state in ('delete_pending','deleted') then raise exception 'Deleted media cannot be archived or restored.';end if;
 update public.network_media_assets set lifecycle_state=case when p_archived then 'archived' else 'active' end,archived_at=case when p_archived then now() else null end,archived_by=case when p_archived then auth.uid() else null end,updated_at=now() where id=a.id;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),case when p_archived then 'network_media_archived' else 'network_media_restored' end,jsonb_build_object('asset_id',a.id,'media_kind',a.media_kind,'entity_type',a.entity_type,'entity_id',a.entity_id));
end $$;
revoke all on function public.set_network_media_asset_archived(uuid,boolean) from public;grant execute on function public.set_network_media_asset_archived(uuid,boolean) to authenticated;

create or replace function public.request_network_media_asset_delete(p_asset_id uuid,p_reason text default null) returns jsonb
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();a public.network_media_assets%rowtype;
begin
 if nid is null then raise exception 'Choose an active network.';end if;
 select * into a from public.network_media_assets where id=p_asset_id and network_id=nid for update;
 if not found or not (a.owner_user_id=auth.uid() or public.is_network_admin(nid)) then raise exception 'Media asset not found or not editable.' using errcode='42501';end if;
 if a.lifecycle_state='deleted' then raise exception 'Media has already been deleted.';end if;
 -- Bound historical content must be archived before deletion. This prevents accidental one-click destruction.
 if a.entity_id is not null and a.lifecycle_state<>'archived' then raise exception 'Archive linked media before permanently deleting it.';end if;
 update public.network_media_assets set lifecycle_state='delete_pending',delete_requested_at=now(),delete_requested_by=auth.uid(),delete_reason=nullif(trim(coalesce(p_reason,'')),''),updated_at=now() where id=a.id;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'network_media_delete_requested',jsonb_build_object('asset_id',a.id,'bucket',a.bucket,'media_kind',a.media_kind,'entity_type',a.entity_type,'entity_id',a.entity_id));
 return jsonb_build_object('asset_id',a.id,'bucket',a.bucket,'object_path',a.object_path,'thumbnail_path',a.thumbnail_path);
end $$;
revoke all on function public.request_network_media_asset_delete(uuid,text) from public;grant execute on function public.request_network_media_asset_delete(uuid,text) to authenticated;

create or replace function public.finalize_network_media_asset_delete(p_asset_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();a public.network_media_assets%rowtype;
begin
 select * into a from public.network_media_assets where id=p_asset_id and network_id=nid for update;
 if not found or a.lifecycle_state<>'delete_pending' or not (a.delete_requested_by=auth.uid() or public.is_network_admin(nid)) then raise exception 'No authorized deletion is pending.' using errcode='42501';end if;
 update public.network_media_assets set lifecycle_state='deleted',deleted_at=now(),deleted_by=auth.uid(),updated_at=now() where id=a.id;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'network_media_deleted',jsonb_build_object('asset_id',a.id,'bucket',a.bucket,'media_kind',a.media_kind,'bytes',a.bytes,'thumbnail_bytes',a.thumbnail_bytes));
end $$;
revoke all on function public.finalize_network_media_asset_delete(uuid) from public;grant execute on function public.finalize_network_media_asset_delete(uuid) to authenticated;

create or replace function public.cancel_network_media_asset_delete(p_asset_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();a public.network_media_assets%rowtype;
begin
 select * into a from public.network_media_assets where id=p_asset_id and network_id=nid for update;
 if not found or a.lifecycle_state<>'delete_pending' or not (a.delete_requested_by=auth.uid() or public.is_network_admin(nid)) then raise exception 'No authorized deletion is pending.' using errcode='42501';end if;
 update public.network_media_assets set lifecycle_state='archived',delete_requested_at=null,delete_requested_by=null,updated_at=now() where id=a.id;
end $$;
revoke all on function public.cancel_network_media_asset_delete(uuid) from public;grant execute on function public.cancel_network_media_asset_delete(uuid) to authenticated;

create or replace function public.get_network_media_management_snapshot()
returns jsonb language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.current_network_id();admin boolean;begin
 if nid is null or not public.is_network_member(nid) then raise exception 'Network membership required.' using errcode='42501';end if;admin:=public.is_network_admin(nid);
 return jsonb_build_object(
  'is_admin',admin,
  'media_usage_bytes',(select media_usage_bytes from public.networks where id=nid),
  'storage_limit_bytes',(select storage_limit_bytes from public.networks where id=nid),
  'assets',coalesce((select jsonb_agg(jsonb_build_object(
    'id',m.id,'bucket',m.bucket,'object_path',m.object_path,'thumbnail_path',m.thumbnail_path,'media_kind',m.media_kind,'entity_type',m.entity_type,'entity_id',m.entity_id,
    'mime_type',m.mime_type,'bytes',m.bytes,'thumbnail_bytes',m.thumbnail_bytes,'width',m.width,'height',m.height,'lifecycle_state',m.lifecycle_state,'created_at',m.created_at,'archived_at',m.archived_at,'deleted_at',m.deleted_at,'delete_reason',m.delete_reason,'owned_by_me',m.owner_user_id=auth.uid(),
    'unbound',m.entity_id is null
   ) order by m.created_at desc) from public.network_media_assets m where m.network_id=nid and (admin or m.owner_user_id=auth.uid())),'[]'::jsonb)
 );
end $$;
revoke all on function public.get_network_media_management_snapshot() from public;grant execute on function public.get_network_media_management_snapshot() to authenticated;

-- Normal feature hydration shows active media only. Archive inventory uses the dedicated management RPC above.
create or replace function public.get_network_media_assets(p_entity_type text,p_entity_ids text[] default null)
returns table(id uuid,bucket varchar,object_path text,thumbnail_path text,media_kind varchar,entity_type varchar,entity_id text,mime_type varchar,bytes bigint,thumbnail_bytes bigint,width integer,height integer,created_at timestamptz)
language sql security definer stable set search_path=public as $$
 select m.id,m.bucket,m.object_path,m.thumbnail_path,m.media_kind,m.entity_type,m.entity_id,m.mime_type,m.bytes,m.thumbnail_bytes,m.width,m.height,m.created_at
 from public.network_media_assets m
 where m.network_id=public.current_network_id() and public.is_network_member(m.network_id) and m.lifecycle_state='active'
   and (nullif(trim(coalesce(p_entity_type,'')),'') is null or m.entity_type=p_entity_type)
   and (p_entity_ids is null or cardinality(p_entity_ids)=0 or m.entity_id=any(p_entity_ids))
 order by m.created_at desc;
$$;
revoke all on function public.get_network_media_assets(text,text[]) from public;grant execute on function public.get_network_media_assets(text,text[]) to authenticated;

create or replace function public.get_network_media_summary()
returns table(media_usage_bytes bigint,storage_limit_bytes bigint,registered_assets bigint,registered_main_bytes bigint,registered_thumbnail_bytes bigint)
language sql security definer stable set search_path=public as $$
 select n.media_usage_bytes,n.storage_limit_bytes,
   (select count(*) from public.network_media_assets m where m.network_id=n.id and m.lifecycle_state<>'deleted'),
   (select coalesce(sum(m.bytes),0) from public.network_media_assets m where m.network_id=n.id and m.lifecycle_state<>'deleted'),
   (select coalesce(sum(m.thumbnail_bytes),0) from public.network_media_assets m where m.network_id=n.id and m.lifecycle_state<>'deleted')
 from public.networks n where n.id=public.current_network_id() and public.is_network_member(n.id);
$$;
revoke all on function public.get_network_media_summary() from public;grant execute on function public.get_network_media_summary() to authenticated;

-- Deleted / delete-pending registry entries never authorize a storage read. Archived entries stay privately readable.
create or replace function public.can_read_profile_photo(object_name text) returns boolean
language sql security definer stable set search_path=public as $$
 select auth.uid() is not null and (
   (object_name like public.current_network_id()::text||'/%' and public.is_network_member(public.current_network_id())) or object_name like 'profiles/'||auth.uid()::text||'/%'
 ) and not exists(select 1 from public.network_media_assets z where z.network_id=public.current_network_id() and z.lifecycle_state in ('delete_pending','deleted') and (z.object_path=object_name or z.thumbnail_path=object_name)) and (
   public.is_network_admin() or object_name like public.current_network_id()::text||'/profiles/'||auth.uid()::text||'/%' or object_name like 'profiles/'||auth.uid()::text||'/%'
   or exists(select 1 from public.network_media_assets a where a.network_id=public.current_network_id() and a.bucket='profile-photos' and a.lifecycle_state in ('active','archived') and (a.object_path=object_name or a.thumbnail_path=object_name) and public.is_network_member(a.network_id))
   or exists(select 1 from public.family_members fm where fm.network_id=public.current_network_id() and (fm.photo_url=object_name or fm.photo_url like '%/profile-photos/'||object_name) and fm.profile_status='approved' and fm.profile_visibility<>'admin')
 );
$$;
revoke all on function public.can_read_profile_photo(text) from public;grant execute on function public.can_read_profile_photo(text) to authenticated;

create or replace function public.can_read_community_media(object_name text) returns boolean
language sql security definer stable set search_path=public as $$
 select auth.uid() is not null and (
   (object_name like public.current_network_id()::text||'/%' and public.is_network_member(public.current_network_id())) or object_name like 'community/'||auth.uid()::text||'/%'
 ) and not exists(select 1 from public.network_media_assets z where z.network_id=public.current_network_id() and z.lifecycle_state in ('delete_pending','deleted') and (z.object_path=object_name or z.thumbnail_path=object_name)) and (
   public.is_network_admin() or object_name like public.current_network_id()::text||'/community/'||auth.uid()::text||'/%' or object_name like 'community/'||auth.uid()::text||'/%'
   or exists(select 1 from public.network_media_assets a where a.network_id=public.current_network_id() and a.bucket='community-media' and a.lifecycle_state in ('active','archived') and a.media_kind<>'complaint' and (a.object_path=object_name or a.thumbnail_path=object_name) and public.is_network_member(a.network_id))
   or exists(select 1 from public.memories m left join public.family_members fm on fm.id=m.member_id and fm.network_id=m.network_id where m.network_id=public.current_network_id() and (m.photo_url=object_name or m.photo_url like '%/community-media/'||object_name) and m.visibility<>'admin' and (m.member_id is null or (fm.profile_status='approved' and fm.profile_visibility<>'admin')))
   or exists(select 1 from public.hs_complaints c cross join lateral jsonb_array_elements(c.attachments) a where c.network_id=public.current_network_id() and coalesce(a->>'path',a->>'url')=object_name and (c.created_by=auth.uid() or c.assigned_to=auth.uid() or public.is_network_admin(c.network_id)))
 );
$$;
revoke all on function public.can_read_community_media(text) from public;grant execute on function public.can_read_community_media(text) to authenticated;

-- Backward-compatible remove helpers now preserve an auditable tombstone instead of deleting registry history.
create or replace function public.forget_network_media_asset_by_path(p_bucket text,p_object_path text) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();a public.network_media_assets%rowtype;
begin
 select * into a from public.network_media_assets where network_id=nid and bucket=p_bucket and object_path=p_object_path;
 if not found then return;end if;
 if not (a.owner_user_id=auth.uid() or public.is_network_admin(nid)) then raise exception 'Media asset not editable.' using errcode='42501';end if;
 update public.network_media_assets set lifecycle_state='deleted',deleted_at=coalesce(deleted_at,now()),deleted_by=coalesce(deleted_by,auth.uid()),delete_reason=coalesce(delete_reason,'Removed from content'),updated_at=now() where id=a.id;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'network_media_deleted',jsonb_build_object('asset_id',a.id,'bucket',a.bucket,'media_kind',a.media_kind,'source','legacy_remove_helper'));
end $$;
revoke all on function public.forget_network_media_asset_by_path(text,text) from public;grant execute on function public.forget_network_media_asset_by_path(text,text) to authenticated;
