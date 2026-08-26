-- CR1 — Core Family Simplicity & Trust
-- Protect direct lineage from destructive co-admin changes.
-- Family admins may add/correct data, but only the Family Owner may delete a parent-child relationship.

create or replace function public.current_family_role(p_network_id uuid default public.current_network_id())
returns varchar
language sql security definer stable set search_path=public as $$
  select nm.role
  from public.network_memberships nm
  where nm.network_id=p_network_id
    and nm.user_id=auth.uid()
    and nm.status='active'
  limit 1;
$$;
revoke all on function public.current_family_role(uuid) from public;
grant execute on function public.current_family_role(uuid) to authenticated;

create or replace function public.protect_foundational_family_relationship()
returns trigger
language plpgsql security definer set search_path=public as $$
declare
  actor_role varchar;
begin
  -- Service-role/maintenance operations do not carry an authenticated end-user uid.
  if auth.uid() is null then return old; end if;

  actor_role := public.current_family_role(old.network_id);
  if old.relationship_type in ('parent','child') and actor_role is distinct from 'owner' then
    raise exception 'Only the Family Owner can remove a parent-child relationship. Ask the owner to correct this family line.' using errcode='42501';
  end if;
  return old;
end $$;

revoke all on function public.protect_foundational_family_relationship() from public;

drop trigger if exists trg_protect_foundational_family_relationship on public.family_relationships;
create trigger trg_protect_foundational_family_relationship
before delete on public.family_relationships
for each row execute function public.protect_foundational_family_relationship();

comment on function public.protect_foundational_family_relationship() is
'CR1: prevents family co-admin/member deletion of parent-child lineage; Family Owner remains the destructive authority. All changes remain subject to tenant RLS and audit logging.';
