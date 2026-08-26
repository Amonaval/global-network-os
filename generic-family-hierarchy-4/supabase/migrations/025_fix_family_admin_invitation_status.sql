-- A6 verification hotfix — Family Settings admin summary compatibility.
-- member_invitations has no physical status column; status is derived from lifecycle timestamps.

create or replace function public.get_family_admin_summary()
returns table(member_profiles bigint,claimed_profiles bigint,active_invitations bigint,admin_count bigint,media_usage_bytes bigint,storage_limit_bytes bigint,photo_max_bytes integer)
language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
 if not public.is_network_admin(nid) then raise exception 'Family administrator access is required.' using errcode='42501'; end if;
 return query select
  (select count(*) from public.family_members m where m.network_id=nid),
  (select count(*) from public.network_memberships nm where nm.network_id=nid and nm.status='active' and nm.member_id is not null),
  (select count(*) from public.member_invitations i
    where i.network_id=nid
      and public.invitation_status(i.used_at,i.revoked_at,i.expires_at)='active'),
  (select count(*) from public.network_memberships nm where nm.network_id=nid and nm.status='active' and nm.role in ('owner','admin')),
  n.media_usage_bytes,n.storage_limit_bytes,n.photo_max_bytes
 from public.networks n where n.id=nid;
end $$;
revoke all on function public.get_family_admin_summary() from public;
grant execute on function public.get_family_admin_summary() to authenticated;
