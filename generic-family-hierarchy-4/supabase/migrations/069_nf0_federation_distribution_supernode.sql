-- NF-0A / FD-2 — Federation as Distribution Supernode foundation
-- Registers the aggregate-only federation distribution lab in vertical-aware Launch Control.
-- This does NOT create Network↔Umbrella affiliation rows and grants no person-level access.

do $$
begin
 if to_regclass('public.platform_feature_flags') is null then raise exception 'Progressive Launch Control must exist before NF-0A.'; end if;
end $$;

with verticals(vertical_kind) as (
 values ('family'::varchar),('alumni'),('organization'),('business-trust'),('franchise'),('professional')
)
insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind)
select v.vertical_kind||'.advanced.federation_distribution','federation','test','{}'::uuid[],v.vertical_kind
from verticals v
on conflict(feature_key) do update set bundle_key=excluded.bundle_key,vertical_kind=excluded.vertical_kind;

insert into public.platform_playground_features(feature_key,enabled)
select feature_key,false from public.platform_feature_flags where feature_key like '%.advanced.federation_distribution'
on conflict(feature_key) do nothing;
