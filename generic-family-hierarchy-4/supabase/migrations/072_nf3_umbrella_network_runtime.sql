-- NF-3 — Umbrella Network Runtime
-- Umbrellas operate on Networks as governed participants. All outward detail is
-- derived from approved affiliations + currently permitted Network Passport data.
-- This migration intentionally never joins person/profile/contact/relationship tables.

create or replace function public.get_my_umbrella_runtime_summaries()
returns table(
 umbrella_id uuid,name varchar,slug varchar,umbrella_type varchar,summary varchar,location_label varchar,role varchar,
 approved_networks bigint,requested_networks bigint,suspended_networks bigint,visible_passport_networks bigint,public_passport_networks bigint,
 vertical_count bigint,capability_count bigint,scope_count bigint,profile_freshness_pct integer,health_score integer,health varchar
)
language sql security definer stable set search_path=public as $$
 with mine as (
  select u.*,a.role
  from public.federation_umbrellas u
  join public.federation_umbrella_admins a on a.umbrella_id=u.id
  where a.user_id=auth.uid() and a.status='active' and u.status='active'
 ), agg as (
  select m.id as umbrella_id,
   count(distinct f.id) filter(where f.status='approved') as approved_networks,
   count(distinct f.id) filter(where f.status='requested') as requested_networks,
   count(distinct f.id) filter(where f.status='suspended') as suspended_networks,
   count(distinct f.id) filter(where f.status='approved' and p.visibility in ('federation','public')) as visible_passport_networks,
   count(distinct f.id) filter(where f.status='approved' and p.visibility='public') as public_passport_networks,
   count(distinct n.vertical_kind) filter(where f.status='approved') as vertical_count,
   count(distinct cap.value) filter(where f.status='approved' and p.visibility in ('federation','public')) as capability_count,
   count(distinct scp.value) filter(where f.status='approved' and p.visibility in ('federation','public')) as scope_count,
   count(distinct f.id) filter(where f.status='approved' and p.visibility in ('federation','public') and p.updated_at>=now()-interval '180 days') as fresh_passports
  from mine m
  left join public.network_umbrella_affiliations f on f.umbrella_id=m.id
  left join public.networks n on n.id=f.network_id
  left join public.network_passports p on p.network_id=f.network_id
  left join lateral unnest(case when p.visibility in ('federation','public') then p.capabilities else '{}'::text[] end) cap(value) on true
  left join lateral unnest(case when p.visibility in ('federation','public') then p.participation_scopes else '{}'::text[] end) scp(value) on true
  group by m.id
 ), normalized as (
  select m.*,coalesce(a.approved_networks,0) approved_networks,coalesce(a.requested_networks,0) requested_networks,coalesce(a.suspended_networks,0) suspended_networks,
   coalesce(a.visible_passport_networks,0) visible_passport_networks,coalesce(a.public_passport_networks,0) public_passport_networks,
   coalesce(a.vertical_count,0) vertical_count,coalesce(a.capability_count,0) capability_count,coalesce(a.scope_count,0) scope_count,
   case when coalesce(a.approved_networks,0)=0 then 0 else round(100.0*coalesce(a.fresh_passports,0)/a.approved_networks)::int end as profile_freshness_pct
  from mine m left join agg a on a.umbrella_id=m.id
 ), scored as (
  select n.*,
   least(100,greatest(0,round(
    (case when n.approved_networks=0 then 0 else least(100,n.approved_networks*12) end)*0.30 +
    (case when n.approved_networks=0 then 0 else 100.0*n.visible_passport_networks/n.approved_networks end)*0.30 +
    least(100,n.vertical_count*22)*0.15 +
    n.profile_freshness_pct*0.15 +
    (case when n.requested_networks=0 then 100 else greatest(0,100-n.requested_networks*15) end)*0.10
   )::int)) as health_score
  from normalized n
 )
 select s.id,s.name,s.slug,s.umbrella_type,s.summary,s.location_label,s.role,
  s.approved_networks,s.requested_networks,s.suspended_networks,s.visible_passport_networks,s.public_passport_networks,
  s.vertical_count,s.capability_count,s.scope_count,s.profile_freshness_pct,s.health_score,
  (case when s.health_score>=75 then 'ready' when s.health_score>=45 then 'watch' else 'setup' end)::varchar
 from scored s order by s.name;
$$;
revoke all on function public.get_my_umbrella_runtime_summaries() from public;
grant execute on function public.get_my_umbrella_runtime_summaries() to authenticated;

create or replace function public.get_umbrella_network_participants(p_umbrella_id uuid)
returns table(
 affiliation_id uuid,network_id uuid,network_name varchar,vertical_kind varchar,relationship_type varchar,context_label varchar,
 passport_visible boolean,passport_slug varchar,passport_visibility varchar,passport_tagline varchar,passport_summary varchar,
 passport_location varchar,passport_established varchar,passport_external_url varchar,passport_capabilities text[],passport_scopes text[],
 passport_verification varchar,directory_discoverable boolean,passport_updated_at timestamptz,affiliation_updated_at timestamptz
)
language plpgsql security definer stable set search_path=public as $$
begin
 if not public.is_federation_umbrella_admin(p_umbrella_id) then raise exception 'Umbrella administrator access required.' using errcode='42501'; end if;
 return query
 select f.id,n.id,n.name,n.vertical_kind,f.relationship_type,f.context_label,
  (p.visibility in ('federation','public')),
  case when p.visibility in ('federation','public') then p.public_slug else '' end::varchar,
  case when p.visibility in ('federation','public') then p.visibility else 'private' end::varchar,
  case when p.visibility in ('federation','public') then p.tagline else '' end::varchar,
  case when p.visibility in ('federation','public') then p.summary else '' end::varchar,
  case when p.visibility in ('federation','public') then p.location_label else '' end::varchar,
  case when p.visibility in ('federation','public') then p.established_label else '' end::varchar,
  case when p.visibility in ('federation','public') then p.external_url else '' end::varchar,
  case when p.visibility in ('federation','public') then p.capabilities else '{}'::text[] end,
  case when p.visibility in ('federation','public') then p.participation_scopes else '{}'::text[] end,
  case when p.visibility in ('federation','public') then p.verification_state else 'self_declared' end::varchar,
  case when p.visibility in ('federation','public') then p.directory_discoverable else false end,
  case when p.visibility in ('federation','public') then p.updated_at else null end,
  f.updated_at
 from public.network_umbrella_affiliations f
 join public.networks n on n.id=f.network_id
 left join public.network_passports p on p.network_id=f.network_id
 where f.umbrella_id=p_umbrella_id and f.status='approved'
 order by n.name;
end $$;
revoke all on function public.get_umbrella_network_participants(uuid) from public;
grant execute on function public.get_umbrella_network_participants(uuid) to authenticated;

-- NF-3 Launch Control: separate from affiliation management so the operating
-- runtime can be certified before broader umbrella use.
with verticals(vertical_kind) as (values ('family'::varchar),('alumni'),('organization'),('business-trust'),('franchise'),('professional'))
insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind)
select v.vertical_kind||'.advanced.umbrella_runtime','federation','test','{}'::uuid[],v.vertical_kind from verticals v
on conflict(feature_key) do update set bundle_key=excluded.bundle_key,vertical_kind=excluded.vertical_kind;
insert into public.platform_playground_features(feature_key,enabled)
select feature_key,false from public.platform_feature_flags where feature_key like '%.advanced.umbrella_runtime'
on conflict(feature_key) do nothing;

comment on function public.get_umbrella_network_participants(uuid) is 'NF-3 network-participant directory. Approved affiliation + currently permitted Passport data only; never a child-member directory.';
