-- P4.4: Intelligence, Geography, Export & Scale
-- Run after 001 -> 008 on an existing project.

/* -------------------------------------------------------------------------- */
/* 1. Server-side discovery                                                   */
/* -------------------------------------------------------------------------- */
drop function if exists public.search_family_members(text,text,text,integer,text,integer,integer);

create or replace function public.search_family_members(
  p_query text default null,
  p_profession text default null,
  p_city text default null,
  p_generation integer default null,
  p_life_status text default 'all',
  p_limit integer default 100,
  p_offset integer default 0
)
returns table(
  id uuid,
  full_name text,
  date_of_birth date,
  date_of_death date,
  generation_level integer,
  profession text,
  city text,
  country text,
  photo_url text,
  bio text,
  phone text,
  email text,
  latitude double precision,
  longitude double precision,
  profile_status text,
  profile_visibility text,
  contact_visibility text
)
language sql
security definer
stable
set search_path=public
as $$
  select
    m.id,m.full_name,m.date_of_birth,m.date_of_death,m.generation_level,
    m.profession,m.city,m.country,m.photo_url,m.bio,
    case when public.is_admin() or coalesce(m.contact_visibility,'admin') <> 'admin' then m.phone end,
    case when public.is_admin() or coalesce(m.contact_visibility,'admin') <> 'admin' then m.email end,
    m.latitude::double precision,m.longitude::double precision,m.profile_status,
    coalesce(m.profile_visibility,'member'),coalesce(m.contact_visibility,'admin')
  from public.family_members m
  where m.profile_status='approved'
    and (public.is_admin() or coalesce(m.profile_visibility,'member') <> 'admin')
    and (nullif(trim(p_query),'') is null or
         lower(coalesce(m.full_name,'')) like '%'||lower(trim(p_query))||'%' or
         lower(coalesce(m.profession,'')) like '%'||lower(trim(p_query))||'%' or
         lower(coalesce(m.city,'')) like '%'||lower(trim(p_query))||'%' or
         lower(coalesce(m.country,'')) like '%'||lower(trim(p_query))||'%')
    and (nullif(trim(p_profession),'') is null or lower(coalesce(m.profession,''))=lower(trim(p_profession)))
    and (nullif(trim(p_city),'') is null or lower(coalesce(m.city,''))=lower(trim(p_city)))
    and (p_generation is null or m.generation_level=p_generation)
    and (coalesce(p_life_status,'all')='all' or (p_life_status='living' and m.date_of_death is null) or (p_life_status='deceased' and m.date_of_death is not null))
  order by lower(m.full_name),m.id
  limit greatest(1,least(coalesce(p_limit,100),500))
  offset greatest(0,coalesce(p_offset,0));
$$;
revoke all on function public.search_family_members(text,text,text,integer,text,integer,integer) from public;
grant execute on function public.search_family_members(text,text,text,integer,text,integer,integer) to authenticated;

/* -------------------------------------------------------------------------- */
/* 2. Network analytics                                                       */
/* -------------------------------------------------------------------------- */
create or replace function public.get_network_analytics()
returns jsonb
language plpgsql
security definer
stable
set search_path=public
as $$
declare result jsonb;
begin
  if not public.is_admin() then raise exception 'Administrator access is required.' using errcode='42501'; end if;
  with base as (
    select * from public.family_members where profile_status='approved'
  ),
  gens as (
    select coalesce(jsonb_agg(jsonb_build_object('generation',generation_level,'count',cnt) order by generation_level),'[]'::jsonb) value
    from (select generation_level,count(*)::int cnt from base group by generation_level) x
  ),
  cities as (
    select coalesce(jsonb_agg(jsonb_build_object('city',city,'country',country,'count',cnt) order by cnt desc,city),'[]'::jsonb) value
    from (select coalesce(city,'Unknown') city,coalesce(country,'') country,count(*)::int cnt from base group by city,country) x
  ),
  professions as (
    select coalesce(jsonb_agg(jsonb_build_object('profession',profession,'count',cnt) order by cnt desc,profession),'[]'::jsonb) value
    from (select coalesce(nullif(trim(profession),''),'Not specified') profession,count(*)::int cnt from base group by 1) x
  )
  select jsonb_build_object(
    'members',(select count(*) from base),
    'living',(select count(*) from base where date_of_death is null),
    'deceased',(select count(*) from base where date_of_death is not null),
    'generations',(select value from gens),
    'cities',(select value from cities),
    'professions',(select value from professions),
    'relationships',(select count(*) from public.family_relationships r join base a on a.id=r.person_id join base b on b.id=r.related_person_id),
    'mapped',(select count(*) from base where latitude is not null and longitude is not null),
    'memories',(select count(*) from public.memories),
    'life_events',(select count(*) from public.member_life_events)
  ) into result;
  return result;
end;
$$;
revoke all on function public.get_network_analytics() from public;
grant execute on function public.get_network_analytics() to authenticated;

/* -------------------------------------------------------------------------- */
/* 3. Geography summary                                                       */
/* -------------------------------------------------------------------------- */
create or replace function public.get_geography_summary()
returns jsonb
language sql
security definer
stable
set search_path=public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'city',coalesce(city,'Unknown'),
    'country',coalesce(country,''),
    'count',cnt,
    'latitude',latitude,
    'longitude',longitude
  ) order by cnt desc,city),'[]'::jsonb)
  from (
    select city,country,count(*)::int cnt,
           avg(latitude)::double precision latitude,
           avg(longitude)::double precision longitude
    from public.family_members
    where profile_status='approved' and latitude is not null and longitude is not null
      and (public.is_admin() or coalesce(profile_visibility,'member') <> 'admin')
    group by city,country
  ) x;
$$;
revoke all on function public.get_geography_summary() from public;
grant execute on function public.get_geography_summary() to authenticated;
