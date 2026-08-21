-- 013: Public-page RPCs accessible by the anon role.
-- Provides a minimal read-only view for the shareable /public route.

/* ------------------------------------------------------------------ */
/* 1. Public network info (name + labels only)                         */
/* ------------------------------------------------------------------ */
create or replace function public.get_public_network_info()
returns table(
  name text,
  description text,
  entity_label text,
  entity_label_plural text,
  level_label text,
  level_label_plural text
)
language sql security definer stable set search_path=public as $$
  select
    ns.name::text,
    coalesce(ns.description, '')::text,
    coalesce(ns.entity_label, 'Member')::text,
    coalesce(ns.entity_label_plural, 'Members')::text,
    coalesce(ns.level_label, 'Generation')::text,
    coalesce(ns.level_label_plural, 'Generations')::text
  from public.network_settings ns
  where ns.id = 'network'
  limit 1;
$$;
revoke all on function public.get_public_network_info() from public;
grant execute on function public.get_public_network_info() to anon, authenticated;

/* ------------------------------------------------------------------ */
/* 2. Public member list — only profile_visibility = 'public'         */
/* No contact fields, no photo (storage is private).                  */
/* ------------------------------------------------------------------ */
create or replace function public.get_public_family_members()
returns table(
  id uuid,
  full_name text,
  generation_level integer,
  profession text,
  city text,
  country text,
  bio text,
  date_of_death date
)
language sql security definer stable set search_path=public as $$
  select
    fm.id,
    fm.full_name::text,
    fm.generation_level,
    fm.profession::text,
    fm.city::text,
    fm.country::text,
    fm.bio,
    fm.date_of_death
  from public.family_members fm
  where fm.profile_status = 'approved'
    and fm.profile_visibility = 'public';
$$;
revoke all on function public.get_public_family_members() from public;
grant execute on function public.get_public_family_members() to anon, authenticated;
