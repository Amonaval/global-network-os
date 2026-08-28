-- M6-A — Trusted Identity Unification + Cross-Network Reachability
-- Derived account-level aggregate only. Does not merge network-local profiles or graphs.

create or replace function public.get_my_trusted_network_reach() returns jsonb
language sql security definer stable set search_path=public as $$
  with mine as (
    select nm.network_id,nm.role,n.vertical_kind
    from public.network_memberships nm
    join public.networks n on n.id=nm.network_id
    where nm.user_id=auth.uid() and nm.status='active' and n.status='active'
  ), all_members as (
    select nm.network_id,nm.user_id
    from public.network_memberships nm
    join mine m on m.network_id=nm.network_id
    where nm.status='active'
  ), claimed as (
    select m.network_id
    from mine m
    where
      (m.vertical_kind='family' and exists(
        select 1 from public.network_memberships own
        where own.network_id=m.network_id and own.user_id=auth.uid() and own.status='active' and own.member_id is not null
      ))
      or (m.vertical_kind='alumni' and exists(
        select 1 from public.alumni_profiles ap
        where ap.network_id=m.network_id and ap.claimed_by=auth.uid()
      ))
      or (m.vertical_kind in ('organization','business-trust','franchise','professional') and exists(
        select 1 from public.network_entities e
        where e.network_id=m.network_id and e.owner_user_id=auth.uid()
      ))
  )
  select jsonb_build_object(
    'active_networks',(select count(*) from mine),
    'owned_networks',(select count(*) from mine where role='owner'),
    'administered_networks',(select count(*) from mine where role in ('owner','admin')),
    'verticals',(select count(distinct vertical_kind) from mine),
    'unique_member_accounts',(select count(distinct user_id) from all_members),
    'membership_edges',(select count(*) from all_members),
    'claimed_contexts',(select count(*) from claimed)
  );
$$;
revoke all on function public.get_my_trusted_network_reach() from public;
grant execute on function public.get_my_trusted_network_reach() to authenticated;

comment on function public.get_my_trusted_network_reach() is
'M6-A privacy-safe aggregate of the signed-in person own network memberships. Returns counts only; does not expose or merge cross-network identities or graphs.';
