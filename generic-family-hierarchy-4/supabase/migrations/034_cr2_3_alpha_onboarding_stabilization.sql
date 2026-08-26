-- CR2.3 — Alpha Onboarding Stabilization
-- Hardens fresh-family context and removes legacy global-admin assumptions from onboarding telemetry.

create or replace function public.current_network_id() returns uuid
language sql security definer stable set search_path=public as $$
  select coalesce(
    (
      select p.active_network_id
      from public.profiles p
      join public.network_memberships active_nm
        on active_nm.network_id=p.active_network_id
       and active_nm.user_id=p.id
       and active_nm.status='active'
      where p.id=auth.uid()
      limit 1
    ),
    (
      select nm.network_id
      from public.network_memberships nm
      join public.networks n on n.id=nm.network_id and n.status='active'
      where nm.user_id=auth.uid() and nm.status='active'
      order by nm.joined_at desc
      limit 1
    )
  );
$$;
revoke all on function public.current_network_id() from public;
grant execute on function public.current_network_id() to authenticated;

-- Keep the old is_admin compatibility surface family-scoped.
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path=public as $$
  select public.is_network_admin(public.current_network_id());
$$;

-- Audit should never depend on the old platform-global admin role. It is family scoped.
create or replace function public.log_audit_event(
  p_action varchar,
  p_details jsonb default '{}'::jsonb
)
returns uuid
language plpgsql security definer set search_path=public as $$
declare
  audit_id uuid;
  nid uuid:=public.current_network_id();
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode='42501';
  end if;
  if nid is null or (not public.is_network_admin(nid) and not public.is_platform_owner()) then
    raise exception 'Family administrator access is required.' using errcode='42501';
  end if;
  insert into public.audit_log(network_id,actor_id,action,details)
  values(nid,auth.uid(),left(p_action,80),coalesce(p_details,'{}'::jsonb))
  returning id into audit_id;
  return audit_id;
end;
$$;
revoke all on function public.log_audit_event(varchar,jsonb) from public;
grant execute on function public.log_audit_event(varchar,jsonb) to authenticated;
