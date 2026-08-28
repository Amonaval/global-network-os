-- LC-1 — M6/M7 Launch Control Governance Hardening
-- Registers every advanced M6/M7 surface in the existing vertical-aware Launch Control.
-- Safe default: TEST (platform owners only). Existing founder rollout choices are preserved.

do $$
begin
  if to_regclass('public.platform_feature_flags') is null then
    raise exception 'Progressive Launch Control must exist before LC-1.';
  end if;
  if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='platform_feature_flags' and column_name='vertical_kind') then
    raise exception 'Vertical-aware Launch Control migrations must be applied before LC-1.';
  end if;
end $$;

with verticals(vertical_kind) as (
 values ('family'::varchar),('alumni'),('organization'),('business-trust'),('franchise'),('professional')
), features(suffix,bundle_key) as (
 values
  ('identity_reach'::varchar,'network-effect'::varchar),
  ('trust_bridges','network-effect'),
  ('cross_network_discovery','network-effect'),
  ('network_effect_pulse','network-effect'),
  ('multihop_paths','network-effect'),
  ('guided_launch','pilot-ops'),
  ('wow_showcase','showcase'),
  ('pilot_console','pilot-ops'),
  ('pilot_feedback','pilot-ops'),
  ('runtime_certification','pilot-ops'),
  ('product_decision_gate','pilot-ops')
)
insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind)
select v.vertical_kind||'.advanced.'||f.suffix,f.bundle_key,'test','{}'::uuid[],v.vertical_kind
from verticals v cross join features f
on conflict(feature_key) do update
 set bundle_key=excluded.bundle_key,
     vertical_kind=excluded.vertical_kind;

-- Keep advanced M6/M7 capabilities out of anonymous Playground controls. Their M7-B
-- theater is controlled by the real rollout flag, while network-product Playgrounds
-- remain independently governed by their existing catalog features.
insert into public.platform_playground_features(feature_key,enabled)
select feature_key,false
from public.platform_feature_flags
where feature_key like '%.advanced.%'
on conflict(feature_key) do nothing;

comment on table public.platform_feature_flags is
'Founder Launch Control registry. LC-1 requires M6/M7 advanced capabilities to be registered per vertical; deployment alone never releases them.';
