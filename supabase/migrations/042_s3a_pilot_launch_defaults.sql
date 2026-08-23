-- S3-A pilot freeze: conservative real-family defaults + rich safe Playground defaults.
-- Run after 041. Existing founder overrides are deliberately reset to the agreed pilot baseline.

insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state) values
 ('core.guide','core','released'),
 ('remember.family_pulse','remember','released'),
 ('remember.quiet_digest','remember','released'),
 ('connect.trusted_introductions','connect','test')
on conflict(feature_key) do update set bundle_key=excluded.bundle_key;

update public.platform_feature_flags set rollout_state = case feature_key
  when 'core.home' then 'released'
  when 'core.family' then 'released'
  when 'core.directory' then 'released'
  when 'core.profile' then 'released'
  when 'core.guide' then 'released'
  when 'celebrate.special_days' then 'released'
  when 'remember.memories' then 'released'
  when 'remember.history' then 'released'
  when 'remember.family_pulse' then 'released'
  when 'remember.quiet_digest' then 'released'
  when 'contribute.help_family' then 'released'
  when 'advanced.relationships' then 'released'
  when 'admin.center' then 'released'
  when 'admin.import' then 'released'
  when 'admin.governance' then 'released'
  when 'connect.gatherings' then 'pilot'
  when 'share.family' then 'pilot'
  when 'connect.places' then 'test'
  when 'connect.community' then 'test'
  when 'connect.trusted_introductions' then 'test'
  when 'share.public_profiles' then 'test'
  when 'share.print_qr' then 'test'
  else rollout_state end,
  pilot_network_ids = case when feature_key in ('connect.gatherings','share.family') then pilot_network_ids else '{}'::uuid[] end,
  updated_at=now();

-- Playground: show all member-facing capabilities except public-profile/print distribution by default.
insert into public.platform_playground_features(feature_key,enabled)
select feature_key,
  case when feature_key in ('share.public_profiles','share.print_qr') then false else true end
from public.platform_feature_flags
where bundle_key <> 'admin'
on conflict(feature_key) do update set enabled=excluded.enabled,updated_at=now();

-- Keep the Launch Control preset button aligned with the pilot-freeze policy.
create or replace function public.apply_alpha_day1_launch_preset()
returns integer
language plpgsql security definer set search_path=public as $$
declare v_changed integer:=0; r record; v_new_state varchar;
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access is required.' using errcode='42501'; end if;
  for r in select feature_key,rollout_state from public.platform_feature_flags loop
    v_new_state:=case
      when r.feature_key in ('core.home','core.family','core.directory','core.profile','core.guide','celebrate.special_days','remember.memories','remember.history','remember.family_pulse','remember.quiet_digest','contribute.help_family','advanced.relationships','admin.center','admin.import','admin.governance') then 'released'
      when r.feature_key in ('connect.gatherings','share.family') then 'pilot'
      else 'test'
    end;
    if r.rollout_state is distinct from v_new_state then
      update public.platform_feature_flags set rollout_state=v_new_state,pilot_network_ids=case when v_new_state='pilot' then pilot_network_ids else '{}'::uuid[] end,updated_by=auth.uid(),updated_at=now() where feature_key=r.feature_key;
      v_changed:=v_changed+1;
    end if;
  end loop;
  return v_changed;
end $$;
revoke all on function public.apply_alpha_day1_launch_preset() from public;
grant execute on function public.apply_alpha_day1_launch_preset() to authenticated;
