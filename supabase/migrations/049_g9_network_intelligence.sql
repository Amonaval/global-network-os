-- G9 — Network Intelligence Layer
-- Additive after 048. Registers permission-aware deterministic intelligence for Launch Control.

insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind) values
 ('intelligence.network','intelligence','test','{}'::uuid[],'family'),
 ('alumni.shared.intelligence','intelligence','test','{}'::uuid[],'alumni'),
 ('organization.shared.intelligence','intelligence','test','{}'::uuid[],'organization'),
 ('business-trust.shared.intelligence','intelligence','test','{}'::uuid[],'business-trust'),
 ('franchise.shared.intelligence','intelligence','test','{}'::uuid[],'franchise')
on conflict(feature_key) do update set
 bundle_key=excluded.bundle_key,
 vertical_kind=excluded.vertical_kind;

insert into public.platform_playground_features(feature_key,enabled) values
 ('intelligence.network',true),
 ('alumni.shared.intelligence',true),
 ('organization.shared.intelligence',true),
 ('business-trust.shared.intelligence',true),
 ('franchise.shared.intelligence',true)
on conflict(feature_key) do update set enabled=excluded.enabled;
