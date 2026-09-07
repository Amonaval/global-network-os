-- 089 — Platform vertical parity + creator-owned network lifecycle
-- Safe to rerun. Adds a vertical-neutral permanent-delete RPC; no table drops.

drop function if exists public.delete_owned_network_permanently(uuid,text);
create function public.delete_owned_network_permanently(p_network_id uuid,p_confirm_name text) returns uuid
language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); nname text; next_id uuid;
begin
 if uid is null then raise exception 'Sign in required.' using errcode='42501'; end if;
 select n.name into nname
 from public.networks n
 join public.network_memberships nm on nm.network_id=n.id
 where n.id=p_network_id and nm.user_id=uid and nm.status='active' and nm.role='owner';
 if nname is null then raise exception 'Only the network Owner can permanently delete this network.' using errcode='42501'; end if;
 if trim(coalesce(p_confirm_name,''))<>nname then raise exception 'Network name confirmation does not match.' using errcode='22023'; end if;

 -- Detach user profile pointers before network-owned rows cascade away.
 update public.profiles set active_network_id=null,member_id=null,updated_at=now()
 where id=uid and active_network_id=p_network_id;
 delete from public.networks where id=p_network_id;

 select nm.network_id into next_id
 from public.network_memberships nm join public.networks n on n.id=nm.network_id and n.status='active'
 where nm.user_id=uid and nm.status='active'
 order by nm.joined_at desc limit 1;
 update public.profiles set active_network_id=next_id,updated_at=now() where id=uid and active_network_id is null;
 return next_id;
end $$;
revoke all on function public.delete_owned_network_permanently(uuid,text) from public;
grant execute on function public.delete_owned_network_permanently(uuid,text) to authenticated;

do $$ begin
 if to_regprocedure('public.delete_owned_network_permanently(uuid,text)') is null then
  raise exception '089 compatibility check failed: delete_owned_network_permanently missing.';
 end if;
end $$;
