-- NF-4 — Federated Directory & Discovery
-- Purpose-aware discovery of governed Network Passports across approved umbrella affiliations.
-- Returns Networks only. It intentionally does not query child-network people/profile/contact/relationship tables.

create or replace function public.search_federated_network_directory(
 p_query text default '',
 p_purpose text default 'all',
 p_limit integer default 40
)
returns table(
 network_id uuid,network_name varchar,vertical_kind varchar,passport_slug varchar,passport_visibility varchar,
 tagline varchar,summary varchar,location_label varchar,established_label varchar,external_url varchar,
 capabilities text[],participation_scopes text[],verification_state varchar,
 umbrella_id uuid,umbrella_name varchar,umbrella_slug varchar,relationship_type varchar,context_label varchar,
 source_network_id uuid,source_network_name varchar,matched_purpose varchar,trust_path_label text,passport_updated_at timestamptz
)
language sql security definer stable set search_path=public as $$
 with requester_networks as (
  select distinct nm.network_id,n.name as network_name
  from public.network_memberships nm
  join public.networks n on n.id=nm.network_id
  where nm.user_id=auth.uid() and nm.status='active'
 ), requester_umbrellas as (
  select distinct rn.network_id as source_network_id,rn.network_name as source_network_name,f.umbrella_id
  from requester_networks rn
  join public.network_umbrella_affiliations f on f.network_id=rn.network_id and f.status='approved'
  join public.federation_umbrellas u on u.id=f.umbrella_id and u.status='active'
 ), candidates as (
  select distinct on (ru.source_network_id,f.network_id,f.umbrella_id)
   n.id network_id,n.name network_name,n.vertical_kind,p.public_slug passport_slug,p.visibility passport_visibility,
   p.tagline,p.summary,p.location_label,p.established_label,p.external_url,p.capabilities,p.participation_scopes,p.verification_state,
   u.id umbrella_id,u.name umbrella_name,u.slug umbrella_slug,f.relationship_type,f.context_label,
   ru.source_network_id,ru.source_network_name,p.updated_at passport_updated_at
  from requester_umbrellas ru
  join public.network_umbrella_affiliations f on f.umbrella_id=ru.umbrella_id and f.status='approved' and f.network_id<>ru.source_network_id
  join public.federation_umbrellas u on u.id=f.umbrella_id and u.status='active'
  join public.networks n on n.id=f.network_id
  join public.network_passports p on p.network_id=n.id
  where p.visibility in ('federation','public') and p.directory_discoverable=true
 ), filtered as (
  select c.*,
   case when coalesce(nullif(trim(p_purpose),''),'all')='all' then ''
        when lower(p_purpose)=any(select lower(x) from unnest(c.participation_scopes) x) then p_purpose
        when lower(p_purpose)=any(select lower(x) from unnest(c.capabilities) x) then p_purpose
        else '' end::varchar as matched_purpose
  from candidates c
  where (
   coalesce(trim(p_query),'')='' or
   lower(c.network_name||' '||coalesce(c.tagline,'')||' '||coalesce(c.summary,'')||' '||coalesce(c.location_label,'')||' '||array_to_string(c.capabilities,' ')||' '||array_to_string(c.participation_scopes,' ')) like '%'||lower(trim(p_query))||'%'
  )
  and (
   coalesce(nullif(trim(p_purpose),''),'all')='all' or
   lower(p_purpose)=any(select lower(x) from unnest(c.participation_scopes) x) or
   lower(p_purpose)=any(select lower(x) from unnest(c.capabilities) x)
  )
 )
 select f.network_id,f.network_name,f.vertical_kind,f.passport_slug,f.passport_visibility,f.tagline,f.summary,f.location_label,f.established_label,f.external_url,
  f.capabilities,f.participation_scopes,f.verification_state,f.umbrella_id,f.umbrella_name,f.umbrella_slug,f.relationship_type,f.context_label,
  f.source_network_id,f.source_network_name,f.matched_purpose,
  (f.source_network_name||' → '||f.umbrella_name||' → '||f.network_name)::text as trust_path_label,
  f.passport_updated_at
 from filtered f
 order by f.network_name,f.umbrella_name
 limit least(greatest(coalesce(p_limit,40),1),100);
$$;
revoke all on function public.search_federated_network_directory(text,text,integer) from public;
grant execute on function public.search_federated_network_directory(text,text,integer) to authenticated;
comment on function public.search_federated_network_directory(text,text,integer) is 'NF-4 authenticated Network-only federated discovery. Eligible path = active requester membership -> approved umbrella affiliation -> approved target affiliation -> permitted directory-discoverable Network Passport.';

with verticals(vertical_kind) as (values ('family'::varchar),('alumni'),('organization'),('business-trust'),('franchise'),('professional'))
insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind)
select v.vertical_kind||'.advanced.federated_directory','federation','test','{}'::uuid[],v.vertical_kind from verticals v
on conflict(feature_key) do update set bundle_key=excluded.bundle_key,vertical_kind=excluded.vertical_kind;
insert into public.platform_playground_features(feature_key,enabled)
select feature_key,false from public.platform_feature_flags where feature_key like '%.advanced.federated_directory'
on conflict(feature_key) do nothing;
