-- M7-A — Zero-Friction Network Launch & Activation
-- Privacy-safe launch snapshots for networks the signed-in person administers.
create or replace function public.get_my_network_launch_snapshots()
returns table(network_id uuid,network_name varchar,vertical_kind varchar,role varchar,seeded_items bigint,active_members bigint,claimed_identities bigint,accepted_bridges bigint,accepted_introductions bigint)
language sql security definer stable set search_path=public as $$
 with mine as (
  select n.id,n.name,n.vertical_kind,nm.role
  from public.network_memberships nm join public.networks n on n.id=nm.network_id
  where nm.user_id=auth.uid() and nm.status='active' and nm.role in ('owner','admin') and n.status='active'
 )
 select m.id,m.name,m.vertical_kind,m.role,
  case when m.vertical_kind='family' then (select count(*) from public.family_members fm where fm.network_id=m.id and fm.profile_status='approved') when m.vertical_kind='alumni' then (select count(*) from public.alumni_profiles ap where ap.network_id=m.id) else (select count(*) from public.network_entities e where e.network_id=m.id) end,
  (select count(*) from public.network_memberships nm where nm.network_id=m.id and nm.status='active'),
  case when m.vertical_kind='family' then (select count(*) from public.network_memberships nm where nm.network_id=m.id and nm.status='active' and nm.member_id is not null) when m.vertical_kind='alumni' then (select count(*) from public.alumni_profiles ap where ap.network_id=m.id and ap.claimed_by is not null) else (select count(*) from public.network_entities e where e.network_id=m.id and e.owner_user_id is not null) end,
  (select count(*) from public.network_trust_bridges b where b.status='accepted' and m.id in (b.requester_network_id,b.recipient_network_id)),
  (select count(*) from public.trusted_introduction_requests r where r.status='accepted' and m.id in (r.source_network_id,r.target_network_id))
 from mine m order by m.name;
$$;
revoke all on function public.get_my_network_launch_snapshots() from public;
grant execute on function public.get_my_network_launch_snapshots() to authenticated;
comment on function public.get_my_network_launch_snapshots() is 'M7-A aggregate launch readiness for networks administered by the signed-in user. Counts only; no cross-network directory exposure.';
