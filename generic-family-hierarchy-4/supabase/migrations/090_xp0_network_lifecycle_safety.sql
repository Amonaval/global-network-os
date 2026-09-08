-- 090 — XP-0 Network Lifecycle Safety
-- Rerunnable lifecycle closure: leave, reversible archive/restore, explicit storage purge,
-- metadata-driven relational residue verification and minimal platform purge receipts.

create table if not exists public.network_archive_membership_state (
  network_id uuid not null references public.networks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  previous_status varchar(20) not null,
  archived_at timestamptz not null default now(),
  primary key(network_id,user_id)
);
alter table public.network_archive_membership_state enable row level security;
revoke all on public.network_archive_membership_state from anon,authenticated;

-- Platform safety evidence, intentionally not network-owned and intentionally retained after purge.
-- Contains no network name/content/member data: only UUID, actor, timestamp and zero-residue result.
create table if not exists public.network_purge_receipts (
  id uuid primary key default gen_random_uuid(),
  purged_network_id uuid not null,
  purged_by uuid references auth.users(id) on delete set null,
  purged_at timestamptz not null default now(),
  relational_residue bigint not null default 0,
  storage_residue bigint not null default 0,
  verifier_version varchar(20) not null default 'xp0-v1'
);
create index if not exists idx_network_purge_receipts_actor_time on public.network_purge_receipts(purged_by,purged_at desc);
alter table public.network_purge_receipts enable row level security;
revoke all on public.network_purge_receipts from anon,authenticated;

-- Metadata-driven residue scanner. It checks every single-column FK in public that references
-- public.networks(id), regardless of column name, plus every network-prefixed Storage object.
create or replace function public.xp0_network_residue_report(p_network_id uuid) returns jsonb
language plpgsql security definer stable set search_path=public,storage as $$
declare r record; c bigint; relational_total bigint:=0; storage_total bigint:=0; details jsonb:='[]'::jsonb;
begin
 for r in
  select ns.nspname schema_name,cl.relname table_name,a.attname column_name
  from pg_constraint con
  join pg_class cl on cl.oid=con.conrelid
  join pg_namespace ns on ns.oid=cl.relnamespace
  join pg_class refcl on refcl.oid=con.confrelid
  join pg_namespace refns on refns.oid=refcl.relnamespace
  join unnest(con.conkey) with ordinality ck(attnum,ord) on true
  join unnest(con.confkey) with ordinality fk(attnum,ord) on fk.ord=ck.ord
  join pg_attribute a on a.attrelid=cl.oid and a.attnum=ck.attnum
  join pg_attribute ra on ra.attrelid=refcl.oid and ra.attnum=fk.attnum
  where con.contype='f' and ns.nspname='public' and refns.nspname='public'
    and refcl.relname='networks' and ra.attname='id'
    and array_length(con.conkey,1)=1
 loop
  execute format('select count(*) from %I.%I where %I=$1',r.schema_name,r.table_name,r.column_name) into c using p_network_id;
  if c>0 then
   relational_total:=relational_total+c;
   details:=details||jsonb_build_array(jsonb_build_object('table',r.table_name,'column',r.column_name,'count',c));
  end if;
 end loop;
 if to_regclass('storage.objects') is not null then
  select count(*) into storage_total from storage.objects where split_part(name,'/',1)=p_network_id::text;
 end if;
 return jsonb_build_object('networkId',p_network_id,'relationalResidue',relational_total,'storageResidue',storage_total,'details',details,'clean',relational_total=0 and storage_total=0);
end $$;
revoke all on function public.xp0_network_residue_report(uuid) from public;

create or replace function public.leave_owned_network(p_network_id uuid) returns uuid
language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); actor_role text; owner_count int; next_id uuid;
begin
 if uid is null then raise exception 'Sign in required.' using errcode='42501'; end if;
 select role into actor_role from public.network_memberships where network_id=p_network_id and user_id=uid and status='active';
 if actor_role is null then raise exception 'You are not an active member of this network.' using errcode='42501'; end if;
 if actor_role='owner' then
  select count(*) into owner_count from public.network_memberships where network_id=p_network_id and role='owner' and status='active';
  if owner_count<=1 then raise exception 'The sole owner cannot leave. Add another owner, archive, or permanently delete the network.' using errcode='42501'; end if;
 end if;
 update public.network_memberships set status='left' where network_id=p_network_id and user_id=uid;
 select nm.network_id into next_id from public.network_memberships nm join public.networks n on n.id=nm.network_id and n.status='active'
 where nm.user_id=uid and nm.status='active' and nm.network_id<>p_network_id order by nm.joined_at desc limit 1;
 update public.profiles set active_network_id=next_id,member_id=case when next_id is null then null else member_id end,updated_at=now()
 where id=uid and active_network_id=p_network_id;
 return next_id;
end $$;
revoke all on function public.leave_owned_network(uuid) from public; grant execute on function public.leave_owned_network(uuid) to authenticated;

create or replace function public.archive_owned_network(p_network_id uuid,p_confirm_name text) returns uuid
language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); nname text; next_id uuid;
begin
 if uid is null then raise exception 'Sign in required.' using errcode='42501'; end if;
 select n.name into nname from public.networks n join public.network_memberships nm on nm.network_id=n.id
 where n.id=p_network_id and nm.user_id=uid and nm.status='active' and nm.role='owner';
 if nname is null then raise exception 'Only the network Owner can archive this network.' using errcode='42501'; end if;
 if trim(coalesce(p_confirm_name,''))<>nname then raise exception 'Network name confirmation does not match.' using errcode='22023'; end if;
 delete from public.network_archive_membership_state where network_id=p_network_id;
 insert into public.network_archive_membership_state(network_id,user_id,previous_status)
 select network_id,user_id,status from public.network_memberships where network_id=p_network_id;
 update public.networks set status='archived',updated_at=now() where id=p_network_id;
 update public.network_memberships set status='suspended' where network_id=p_network_id and status='active';
 select nm.network_id into next_id from public.network_memberships nm join public.networks n on n.id=nm.network_id and n.status='active'
 where nm.user_id=uid and nm.status='active' and nm.network_id<>p_network_id order by nm.joined_at desc limit 1;
 update public.profiles set active_network_id=next_id,member_id=case when next_id is null then null else member_id end,updated_at=now()
 where active_network_id=p_network_id;
 return next_id;
end $$;
revoke all on function public.archive_owned_network(uuid,text) from public; grant execute on function public.archive_owned_network(uuid,text) to authenticated;

create or replace function public.restore_owned_network(p_network_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); owner_ok boolean;
begin
 if uid is null then raise exception 'Sign in required.' using errcode='42501'; end if;
 select exists(select 1 from public.network_memberships nm join public.networks n on n.id=nm.network_id
  where n.id=p_network_id and n.status='archived' and nm.user_id=uid and nm.role='owner' and nm.status in ('suspended','active')) into owner_ok;
 if not owner_ok then raise exception 'Only the archived network Owner can restore this network.' using errcode='42501'; end if;
 update public.networks set status='active',updated_at=now() where id=p_network_id;
 if exists(select 1 from public.network_archive_membership_state where network_id=p_network_id) then
  update public.network_memberships nm set status=s.previous_status
  from public.network_archive_membership_state s where s.network_id=p_network_id and s.network_id=nm.network_id and s.user_id=nm.user_id;
 else
  -- Compatibility fallback for networks archived before XP-0 snapshotting existed.
  update public.network_memberships set status='active' where network_id=p_network_id and status='suspended';
 end if;
 delete from public.network_archive_membership_state where network_id=p_network_id;
end $$;
revoke all on function public.restore_owned_network(uuid) from public; grant execute on function public.restore_owned_network(uuid) to authenticated;

drop function if exists public.get_my_archived_networks();
create function public.get_my_archived_networks()
returns table(network_id uuid,name varchar,slug varchar,role varchar,vertical_kind varchar,archived_at timestamptz)
language sql security definer stable set search_path=public as $$
 select n.id,n.name,n.slug,nm.role,n.vertical_kind,n.updated_at
 from public.network_memberships nm join public.networks n on n.id=nm.network_id
 where nm.user_id=auth.uid() and nm.role='owner' and nm.status in ('suspended','active') and n.status='archived'
 order by n.updated_at desc,n.name;
$$;
revoke all on function public.get_my_archived_networks() from public; grant execute on function public.get_my_archived_networks() to authenticated;

-- Hard purge is a two-phase operation. SQL authorizes/freezes and later finalizes relational deletion.
-- Supabase Storage objects are removed through the supported Storage API by the server route; direct
-- DELETE FROM storage.objects is intentionally forbidden by modern Supabase and must never be used.
drop function if exists public.prepare_owned_network_for_purge(uuid,text);
create function public.prepare_owned_network_for_purge(p_network_id uuid,p_confirm_name text) returns void
language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); nname text; nstatus text; next_id uuid;
begin
 if uid is null then raise exception 'Sign in required.' using errcode='42501'; end if;
 select n.name,n.status into nname,nstatus from public.networks n join public.network_memberships nm on nm.network_id=n.id
 where n.id=p_network_id and nm.user_id=uid and nm.role='owner' and nm.status in ('active','suspended');
 if nname is null then raise exception 'Only the network Owner can permanently delete this network.' using errcode='42501'; end if;
 if trim(coalesce(p_confirm_name,''))<>nname then raise exception 'Network name confirmation does not match.' using errcode='22023'; end if;
 if nstatus='active' then
  delete from public.network_archive_membership_state where network_id=p_network_id;
  insert into public.network_archive_membership_state(network_id,user_id,previous_status) select network_id,user_id,status from public.network_memberships where network_id=p_network_id;
  update public.networks set status='archived',updated_at=now() where id=p_network_id;
  update public.network_memberships set status='suspended' where network_id=p_network_id and status='active';
 elsif nstatus<>'archived' then raise exception 'Network is not in a purgeable lifecycle state.' using errcode='55000'; end if;
 select nm.network_id into next_id from public.network_memberships nm join public.networks n on n.id=nm.network_id and n.status='active'
 where nm.user_id=uid and nm.status='active' and nm.network_id<>p_network_id order by nm.joined_at desc limit 1;
 update public.profiles set active_network_id=next_id,member_id=case when next_id is null then null else member_id end,updated_at=now() where active_network_id=p_network_id;
end $$;
revoke all on function public.prepare_owned_network_for_purge(uuid,text) from public; grant execute on function public.prepare_owned_network_for_purge(uuid,text) to authenticated;

drop function if exists public.delete_owned_network_permanently(uuid,text);
create function public.delete_owned_network_permanently(p_network_id uuid,p_confirm_name text) returns uuid
language plpgsql security definer set search_path=public,storage as $$
declare uid uuid:=auth.uid(); nname text; next_id uuid; before_report jsonb; after_report jsonb;
begin
 if uid is null then raise exception 'Sign in required.' using errcode='42501'; end if;
 select n.name into nname from public.networks n join public.network_memberships nm on nm.network_id=n.id
 where n.id=p_network_id and nm.user_id=uid and nm.status in ('active','suspended') and nm.role='owner';
 if nname is null then raise exception 'Only the network Owner can permanently delete this network.' using errcode='42501'; end if;
 if trim(coalesce(p_confirm_name,''))<>nname then raise exception 'Network name confirmation does not match.' using errcode='22023'; end if;
 before_report:=public.xp0_network_residue_report(p_network_id);
 if coalesce((before_report->>'storageResidue')::bigint,0)>0 then raise exception 'Network storage must be purged through the Supabase Storage API before relational deletion. Remaining objects: %',before_report->>'storageResidue' using errcode='P0001'; end if;
 update public.profiles set active_network_id=null,member_id=null,updated_at=now() where active_network_id=p_network_id;
 delete from public.networks where id=p_network_id;
 after_report:=public.xp0_network_residue_report(p_network_id);
 if not coalesce((after_report->>'clean')::boolean,false) then raise exception 'XP-0 purge residue verification failed: %',after_report::text using errcode='P0001'; end if;
 insert into public.network_purge_receipts(purged_network_id,purged_by,relational_residue,storage_residue,verifier_version)
 values(p_network_id,uid,coalesce((after_report->>'relationalResidue')::bigint,0),coalesce((after_report->>'storageResidue')::bigint,0),'xp0-v2-storage-api');
 select nm.network_id into next_id from public.network_memberships nm join public.networks n on n.id=nm.network_id and n.status='active' where nm.user_id=uid and nm.status='active' order by nm.joined_at desc limit 1;
 update public.profiles set active_network_id=next_id,updated_at=now() where id=uid and active_network_id is null;
 return next_id;
end $$;
revoke all on function public.delete_owned_network_permanently(uuid,text) from public; grant execute on function public.delete_owned_network_permanently(uuid,text) to authenticated;

create or replace function public.get_my_network_purge_receipt(p_network_id uuid) returns jsonb
language sql security definer stable set search_path=public as $$
 select coalesce((select jsonb_build_object('networkId',purged_network_id,'purgedAt',purged_at,'relationalResidue',relational_residue,'storageResidue',storage_residue,'verifierVersion',verifier_version,'clean',relational_residue=0 and storage_residue=0)
 from public.network_purge_receipts where purged_network_id=p_network_id and purged_by=auth.uid() order by purged_at desc limit 1),'{}'::jsonb);
$$;
revoke all on function public.get_my_network_purge_receipt(uuid) from public; grant execute on function public.get_my_network_purge_receipt(uuid) to authenticated;

-- Compatibility wrappers keep existing productized screens working while routing to XP-0 primitives.
create or replace function public.leave_productized_network() returns uuid language plpgsql security definer set search_path=public as $$begin return public.leave_owned_network(public.current_network_id());end$$;
revoke all on function public.leave_productized_network() from public; grant execute on function public.leave_productized_network() to authenticated;
create or replace function public.archive_productized_network(p_confirm_name text) returns void language plpgsql security definer set search_path=public as $$begin perform public.archive_owned_network(public.current_network_id(),p_confirm_name);end$$;
revoke all on function public.archive_productized_network(text) from public; grant execute on function public.archive_productized_network(text) to authenticated;
create or replace function public.delete_productized_network_permanently(p_confirm_name text) returns void language plpgsql security definer set search_path=public as $$begin perform public.delete_owned_network_permanently(public.current_network_id(),p_confirm_name);end$$;
revoke all on function public.delete_productized_network_permanently(text) from public; grant execute on function public.delete_productized_network_permanently(text) to authenticated;

-- Family leave now follows the same explicit lifecycle safety rule: the sole owner never silently archives on Leave.
create or replace function public.leave_current_family() returns text language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin perform public.leave_owned_network(nid); return 'left'; end $$;
revoke all on function public.leave_current_family() from public; grant execute on function public.leave_current_family() to authenticated;

do $$ begin
 if to_regprocedure('public.restore_owned_network(uuid)') is null then raise exception 'XP-0 compatibility check failed: restore_owned_network missing.'; end if;
 if to_regprocedure('public.xp0_network_residue_report(uuid)') is null then raise exception 'XP-0 compatibility check failed: residue verifier missing.'; end if;
 if to_regprocedure('public.prepare_owned_network_for_purge(uuid,text)') is null then raise exception 'XP-0 compatibility check failed: purge preparation missing.'; end if;
 if to_regprocedure('public.delete_owned_network_permanently(uuid,text)') is null then raise exception 'XP-0 compatibility check failed: permanent purge missing.'; end if;
end $$;
