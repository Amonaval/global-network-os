-- XP-7 runtime closure hotfix: remove PL/pgSQL output-column ambiguity in shared Admin invitation listing. Rerunnable.
create or replace function public.list_network_participation_invitations(p_network_id uuid)
returns table(id uuid,email text,target_ref uuid,target_kind varchar,invited_role varchar,status varchar,expires_at timestamptz,created_at timestamptz,resend_count integer)
language plpgsql security definer stable set search_path=public as $$
begin
 if not exists(
  select 1
  from public.network_memberships nm
  where nm.network_id=p_network_id
    and nm.user_id=auth.uid()
    and nm.status='active'
    and nm.role in ('owner','admin')
 ) then
  raise exception 'Network admin access required.' using errcode='42501';
 end if;
 return query
 select i.id,i.email,i.target_ref,i.target_kind,i.invited_role,
        case when i.status='pending' and i.expires_at<=now() then 'expired'::varchar else i.status end,
        i.expires_at,i.created_at,i.resend_count
 from public.network_participation_invitations i
 where i.network_id=p_network_id
 order by i.created_at desc;
end $$;

revoke all on function public.list_network_participation_invitations(uuid) from public;
grant execute on function public.list_network_participation_invitations(uuid) to authenticated;

do $$
begin
 if to_regprocedure('public.list_network_participation_invitations(uuid)') is null then
  raise exception 'XP-7 Admin status ambiguity hotfix function missing';
 end if;
end $$;
