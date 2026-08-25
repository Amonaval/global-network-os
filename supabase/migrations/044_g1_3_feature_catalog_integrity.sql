-- G1.3 — Feature catalog integrity repair + deployment guard.
-- Run after 043. This is additive/idempotent and never overwrites founder rollout or Playground choices.
-- It repairs missing registry rows that can otherwise make code-known features throw "Unknown feature key".

do $$
begin
  if to_regclass('public.platform_feature_flags') is null or to_regclass('public.platform_playground_features') is null then
    raise exception 'Run the progressive launch migrations through 036 before G1.3.';
  end if;
  if to_regclass('public.family_intake_sessions') is null or to_regprocedure('public.create_family_intake_session(text)') is null then
    raise exception 'Run migration 043_s3a1_distributed_family_intake.sql before G1.3 so Build family together has its backend, not only a feature flag.';
  end if;
end $$;

-- Current post-S3-A1 launch baseline. Existing rows are intentionally preserved.
insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids) values
 ('core.home','core','released','{}'::uuid[]),
 ('core.family','core','released','{}'::uuid[]),
 ('core.directory','core','released','{}'::uuid[]),
 ('core.profile','core','released','{}'::uuid[]),
 ('core.guide','core','released','{}'::uuid[]),
 ('remember.memories','remember','released','{}'::uuid[]),
 ('remember.history','remember','released','{}'::uuid[]),
 ('remember.family_pulse','remember','released','{}'::uuid[]),
 ('remember.quiet_digest','remember','released','{}'::uuid[]),
 ('celebrate.special_days','celebrate','released','{}'::uuid[]),
 ('connect.places','connect','test','{}'::uuid[]),
 ('connect.community','connect','test','{}'::uuid[]),
 ('connect.trusted_introductions','connect','test','{}'::uuid[]),
 ('connect.gatherings','connect','pilot','{}'::uuid[]),
 ('contribute.help_family','contribute','released','{}'::uuid[]),
 ('contribute.branch_intake','contribute','pilot','{}'::uuid[]),
 ('share.family','share','pilot','{}'::uuid[]),
 ('share.public_profiles','share','test','{}'::uuid[]),
 ('share.print_qr','share','test','{}'::uuid[]),
 ('advanced.relationships','connect','released','{}'::uuid[]),
 ('admin.center','admin','released','{}'::uuid[]),
 ('admin.import','admin','released','{}'::uuid[]),
 ('admin.governance','admin','released','{}'::uuid[])
on conflict(feature_key) do nothing;

-- Repair only missing Playground rows. Preserve every existing Platform Owner choice.
insert into public.platform_playground_features(feature_key,enabled)
select feature_key,
       case when feature_key in ('share.public_profiles','share.print_qr') then false else true end
from public.platform_feature_flags
where feature_key in (
 'core.home','core.family','core.directory','core.profile','core.guide',
 'remember.memories','remember.history','remember.family_pulse','remember.quiet_digest','celebrate.special_days',
 'connect.places','connect.community','connect.trusted_introductions','connect.gatherings',
 'contribute.help_family','contribute.branch_intake','share.family','share.public_profiles','share.print_qr',
 'advanced.relationships','admin.center','admin.import','admin.governance'
)
on conflict(feature_key) do nothing;
