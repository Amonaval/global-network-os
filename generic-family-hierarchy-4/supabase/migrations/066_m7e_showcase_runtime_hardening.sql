-- M7-E — Showcase Runtime Hardening & Demo Certification
-- Adds counts-only runtime certification and privacy-safe discovery diagnostics.

create or replace function public.get_my_showcase_runtime_certification() returns jsonb
language sql security definer stable set search_path=public as $$
with mine as(
 select nm.network_id from public.network_memberships nm where nm.user_id=auth.uid() and nm.status='active'
),
bridges as(
 select b.* from public.network_trust_bridges b where b.status='accepted' and exists(select 1 from mine m where m.network_id in(b.requester_network_id,b.recipient_network_id))
),
vals as(
 select
  (select count(*) from mine)::int active_networks,
  (
   select count(*) from mine m join public.networks n on n.id=m.network_id
   where case
    when n.vertical_kind='family' then exists(select 1 from public.network_memberships nm where nm.network_id=m.network_id and nm.user_id=auth.uid() and nm.status='active' and nm.member_id is not null)
    when n.vertical_kind='alumni' then exists(select 1 from public.alumni_profiles ap where ap.network_id=m.network_id and ap.claimed_by=auth.uid())
    else exists(select 1 from public.network_entities ne where ne.network_id=m.network_id and ne.owner_user_id=auth.uid() and ne.kind='person')
   end
  )::int claimed_contexts,
  (select count(*) from bridges)::int accepted_bridges,
  (select count(*) from bridges where coalesce((capabilities->>'discovery')::boolean,false))::int discovery_bridges,
  (select count(*) from bridges where coalesce((capabilities->>'introductions')::boolean,false))::int introduction_bridges,
  (select count(*) from bridges where coalesce((capabilities->>'pathTraversal')::boolean,false))::int traversal_bridges,
  (select count(*) from public.trusted_introduction_requests i where i.requester_user_id=auth.uid() and i.status='accepted')::int accepted_outcomes
)
select jsonb_build_object(
 'activeNetworks',active_networks,'claimedContexts',claimed_contexts,'acceptedBridges',accepted_bridges,
 'discoveryBridges',discovery_bridges,'introductionBridges',introduction_bridges,'traversalBridges',traversal_bridges,'acceptedOutcomes',accepted_outcomes,
 'status',case when active_networks<1 then 'blocked' when active_networks>=2 and claimed_contexts>=1 and discovery_bridges>=1 and introduction_bridges>=1 then 'ready' else 'needs_setup' end
) from vals;
$$;
revoke all on function public.get_my_showcase_runtime_certification() from public;
grant execute on function public.get_my_showcase_runtime_certification() to authenticated;

create or replace function public.diagnose_cross_network_discovery(p_source_network_id uuid,p_query text) returns jsonb
language plpgsql security definer stable set search_path=public as $$
declare q text:=trim(coalesce(p_query,'')); target_networks integer:=0; eligible_people integer:=0; eligible_matches integer:=0; raw_matches integer:=0;
begin
 if auth.uid() is null or not public.is_network_member(p_source_network_id) then raise exception 'Membership in the source network is required.' using errcode='42501'; end if;
 if length(q)<2 then return jsonb_build_object('code','no_match','targetNetworks',0,'eligibleClaimedPeople',0); end if;
 with targets as(
  select distinct case when b.requester_network_id=p_source_network_id then b.recipient_network_id else b.requester_network_id end id
  from public.network_trust_bridges b
  where b.status='accepted' and p_source_network_id in(b.requester_network_id,b.recipient_network_id)
   and coalesce((b.capabilities->>'discovery')::boolean,false)
 ) select count(*) into target_networks from targets;
 if target_networks=0 then return jsonb_build_object('code','no_bridge','targetNetworks',0,'eligibleClaimedPeople',0); end if;

 with targets as(
  select distinct case when b.requester_network_id=p_source_network_id then b.recipient_network_id else b.requester_network_id end id
  from public.network_trust_bridges b
  where b.status='accepted' and p_source_network_id in(b.requester_network_id,b.recipient_network_id)
   and coalesce((b.capabilities->>'discovery')::boolean,false)
 ), claimed as(
  select ne.network_id,ne.owner_user_id uid,(ne.label||' '||coalesce(ne.metadata::text,'')) blob from public.network_entities ne join targets t on t.id=ne.network_id where ne.kind='person' and ne.owner_user_id is not null and ne.visibility='members'
  union all select ap.network_id,ap.claimed_by,(ap.full_name||' '||coalesce(ap.program,'')||' '||coalesce(ap.department,'')||' '||coalesce(ap.city,'')||' '||coalesce(ap.company,'')||' '||coalesce(ap.job_title,'')||' '||coalesce(ap.bio,'')) from public.alumni_profiles ap join targets t on t.id=ap.network_id where ap.claimed_by is not null and ap.visibility='members'
  union all select fm.network_id,nm.user_id,(fm.full_name||' '||coalesce(fm.profession,'')||' '||coalesce(fm.city,'')||' '||coalesce(fm.country,'')||' '||coalesce(fm.bio,'')) from public.family_members fm join targets t on t.id=fm.network_id join public.network_memberships nm on nm.network_id=fm.network_id and nm.member_id=fm.id and nm.status='active' where fm.profile_status='approved'
 ), raw as(
  select ne.network_id,(ne.label||' '||coalesce(ne.metadata::text,'')) blob from public.network_entities ne join targets t on t.id=ne.network_id where ne.kind='person'
  union all select ap.network_id,(ap.full_name||' '||coalesce(ap.program,'')||' '||coalesce(ap.department,'')||' '||coalesce(ap.city,'')||' '||coalesce(ap.company,'')||' '||coalesce(ap.job_title,'')||' '||coalesce(ap.bio,'')) from public.alumni_profiles ap join targets t on t.id=ap.network_id
  union all select fm.network_id,(fm.full_name||' '||coalesce(fm.profession,'')||' '||coalesce(fm.city,'')||' '||coalesce(fm.country,'')||' '||coalesce(fm.bio,'')) from public.family_members fm join targets t on t.id=fm.network_id where fm.profile_status='approved'
 )
 select (select count(*) from claimed where uid<>auth.uid()),(select count(*) from claimed where uid<>auth.uid() and lower(blob) like '%'||lower(q)||'%'),(select count(*) from raw where lower(blob) like '%'||lower(q)||'%')
 into eligible_people,eligible_matches,raw_matches;

 return jsonb_build_object('code',case when eligible_matches>0 then 'ready' when raw_matches>0 then 'matching_unclaimed' when eligible_people=0 then 'no_claimed_people' else 'no_match' end,'targetNetworks',target_networks,'eligibleClaimedPeople',eligible_people);
end $$;
revoke all on function public.diagnose_cross_network_discovery(uuid,text) from public;
grant execute on function public.diagnose_cross_network_discovery(uuid,text) to authenticated;

comment on function public.diagnose_cross_network_discovery(uuid,text) is 'M7-E privacy-safe discovery diagnostic. Returns only readiness categories and aggregate counts; never target identity or search result details.';
