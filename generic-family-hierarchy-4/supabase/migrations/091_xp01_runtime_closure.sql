-- 091 — XP-0/XP-1 Runtime Closure
-- Corrects XP-0 hard deletion for modern Supabase Storage and hardens onboarding step behavior.
-- Rerunnable. Storage object deletion is intentionally NOT performed with SQL; the app server uses the Supabase Storage API.

-- Freeze/authorize a network before external Storage API deletion. Active networks are archived first so
-- normal members stop using them while purge is in progress. Already archived networks are safe to retry.
drop function if exists public.prepare_owned_network_for_purge(uuid,text);
create function public.prepare_owned_network_for_purge(p_network_id uuid,p_confirm_name text) returns void
language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); nname text; nstatus text; owner_status text; next_id uuid;
begin
 if uid is null then raise exception 'Sign in required.' using errcode='42501'; end if;
 select n.name,n.status,nm.status into nname,nstatus,owner_status
 from public.networks n join public.network_memberships nm on nm.network_id=n.id
 where n.id=p_network_id and nm.user_id=uid and nm.role='owner' and nm.status in ('active','suspended');
 if nname is null then raise exception 'Only the network Owner can permanently delete this network.' using errcode='42501'; end if;
 if trim(coalesce(p_confirm_name,''))<>nname then raise exception 'Network name confirmation does not match.' using errcode='22023'; end if;

 if nstatus='active' then
  delete from public.network_archive_membership_state where network_id=p_network_id;
  insert into public.network_archive_membership_state(network_id,user_id,previous_status)
  select network_id,user_id,status from public.network_memberships where network_id=p_network_id;
  update public.networks set status='archived',updated_at=now() where id=p_network_id;
  update public.network_memberships set status='suspended' where network_id=p_network_id and status='active';
 elsif nstatus<>'archived' then
  raise exception 'Network is not in a purgeable lifecycle state.' using errcode='55000';
 end if;

 select nm.network_id into next_id
 from public.network_memberships nm join public.networks n on n.id=nm.network_id and n.status='active'
 where nm.user_id=uid and nm.status='active' and nm.network_id<>p_network_id
 order by nm.joined_at desc limit 1;
 update public.profiles set active_network_id=next_id,member_id=case when next_id is null then null else member_id end,updated_at=now()
 where active_network_id=p_network_id;
end $$;
revoke all on function public.prepare_owned_network_for_purge(uuid,text) from public;
grant execute on function public.prepare_owned_network_for_purge(uuid,text) to authenticated;

-- Replace XP-0 SQL storage deletion with a database-side finalizer. The server must purge Storage through
-- the Storage API first. We refuse relational deletion while any network-prefixed storage object remains.
drop function if exists public.delete_owned_network_permanently(uuid,text);
create function public.delete_owned_network_permanently(p_network_id uuid,p_confirm_name text) returns uuid
language plpgsql security definer set search_path=public,storage as $$
declare uid uuid:=auth.uid(); nname text; next_id uuid; before_report jsonb; after_report jsonb;
begin
 if uid is null then raise exception 'Sign in required.' using errcode='42501'; end if;
 select n.name into nname
 from public.networks n join public.network_memberships nm on nm.network_id=n.id
 where n.id=p_network_id and nm.user_id=uid and nm.status in ('active','suspended') and nm.role='owner';
 if nname is null then raise exception 'Only the network Owner can permanently delete this network.' using errcode='42501'; end if;
 if trim(coalesce(p_confirm_name,''))<>nname then raise exception 'Network name confirmation does not match.' using errcode='22023'; end if;

 before_report:=public.xp0_network_residue_report(p_network_id);
 if coalesce((before_report->>'storageResidue')::bigint,0)>0 then
  raise exception 'Network storage must be purged through the Supabase Storage API before relational deletion. Remaining objects: %',before_report->>'storageResidue' using errcode='P0001';
 end if;

 update public.profiles set active_network_id=null,member_id=null,updated_at=now() where active_network_id=p_network_id;
 delete from public.networks where id=p_network_id;

 after_report:=public.xp0_network_residue_report(p_network_id);
 if not coalesce((after_report->>'clean')::boolean,false) then
  raise exception 'XP-0 purge residue verification failed: %',after_report::text using errcode='P0001';
 end if;
 insert into public.network_purge_receipts(purged_network_id,purged_by,relational_residue,storage_residue,verifier_version)
 values(p_network_id,uid,coalesce((after_report->>'relationalResidue')::bigint,0),coalesce((after_report->>'storageResidue')::bigint,0),'xp0-v2-storage-api');

 select nm.network_id into next_id from public.network_memberships nm join public.networks n on n.id=nm.network_id and n.status='active'
 where nm.user_id=uid and nm.status='active' order by nm.joined_at desc limit 1;
 update public.profiles set active_network_id=next_id,updated_at=now() where id=uid and active_network_id is null;
 return next_id;
end $$;
revoke all on function public.delete_owned_network_permanently(uuid,text) from public;
grant execute on function public.delete_owned_network_permanently(uuid,text) to authenticated;

-- Keep the compatibility wrapper, but it can only finalize networks whose Storage was already purged.
create or replace function public.delete_productized_network_permanently(p_confirm_name text) returns void
language plpgsql security definer set search_path=public as $$
begin perform public.delete_owned_network_permanently(public.current_network_id(),p_confirm_name); end $$;
revoke all on function public.delete_productized_network_permanently(text) from public;
grant execute on function public.delete_productized_network_permanently(text) to authenticated;

do $$ begin
 if to_regprocedure('public.prepare_owned_network_for_purge(uuid,text)') is null then raise exception 'XP runtime closure failed: purge preparation RPC missing.'; end if;
 if to_regprocedure('public.delete_owned_network_permanently(uuid,text)') is null then raise exception 'XP runtime closure failed: purge finalizer missing.'; end if;
end $$;
