-- S0 — Showcase Control Plane
-- Founder-controlled network-type visibility and curated palette selection.
-- Additive only: no existing vertical or feature flag is removed.

create table if not exists public.platform_showcase_verticals (
  vertical_kind varchar primary key,
  create_enabled boolean not null default true,
  playground_enabled boolean not null default true,
  featured boolean not null default false,
  palette_key varchar not null default 'signature',
  updated_by uuid null,
  updated_at timestamptz not null default now(),
  constraint platform_showcase_verticals_palette_chk check (palette_key in ('signature','warm','modern','classic','minimal'))
);

alter table public.platform_showcase_verticals enable row level security;
revoke all on public.platform_showcase_verticals from anon,authenticated;

insert into public.platform_showcase_verticals(vertical_kind,create_enabled,playground_enabled,featured,palette_key) values
 ('family',true,true,true,'signature'),
 ('family-association',true,true,true,'signature'),
 ('housing-society',true,true,true,'signature'),
 ('alumni',false,false,false,'signature'),
 ('association',false,false,false,'signature'),
 ('organization',false,false,false,'signature'),
 ('business-trust',false,false,false,'signature'),
 ('franchise',false,false,false,'signature'),
 ('professional',false,false,false,'signature')
on conflict(vertical_kind) do nothing;

create or replace function public.get_showcase_vertical_settings()
returns table(vertical_kind varchar,create_enabled boolean,playground_enabled boolean,featured boolean,palette_key varchar)
language sql security definer stable set search_path=public as $$
  select s.vertical_kind,s.create_enabled,s.playground_enabled,s.featured,s.palette_key
  from public.platform_showcase_verticals s
  order by s.featured desc,s.vertical_kind;
$$;
revoke all on function public.get_showcase_vertical_settings() from public;
grant execute on function public.get_showcase_vertical_settings() to anon,authenticated;

create or replace function public.get_platform_showcase_vertical_settings()
returns table(vertical_kind varchar,create_enabled boolean,playground_enabled boolean,featured boolean,palette_key varchar,updated_at timestamptz)
language plpgsql security definer stable set search_path=public as $$
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access is required.' using errcode='42501'; end if;
  return query select s.vertical_kind,s.create_enabled,s.playground_enabled,s.featured,s.palette_key,s.updated_at from public.platform_showcase_verticals s order by s.featured desc,s.vertical_kind;
end $$;
revoke all on function public.get_platform_showcase_vertical_settings() from public;
grant execute on function public.get_platform_showcase_vertical_settings() to authenticated;

create or replace function public.set_platform_showcase_vertical_setting(
  p_vertical_kind varchar,
  p_create_enabled boolean,
  p_playground_enabled boolean,
  p_featured boolean,
  p_palette_key varchar
) returns void
language plpgsql security definer set search_path=public as $$
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access is required.' using errcode='42501'; end if;
  if p_vertical_kind not in ('family','alumni','association','family-association','housing-society','organization','business-trust','franchise','professional') then raise exception 'Unknown vertical.' using errcode='22023'; end if;
  if p_palette_key not in ('signature','warm','modern','classic','minimal') then raise exception 'Unknown palette.' using errcode='22023'; end if;
  insert into public.platform_showcase_verticals(vertical_kind,create_enabled,playground_enabled,featured,palette_key,updated_by,updated_at)
  values(p_vertical_kind,p_create_enabled,p_playground_enabled,p_featured,p_palette_key,auth.uid(),now())
  on conflict(vertical_kind) do update set create_enabled=excluded.create_enabled,playground_enabled=excluded.playground_enabled,featured=excluded.featured,palette_key=excluded.palette_key,updated_by=excluded.updated_by,updated_at=excluded.updated_at;
end $$;
revoke all on function public.set_platform_showcase_vertical_setting(varchar,boolean,boolean,boolean,varchar) from public;
grant execute on function public.set_platform_showcase_vertical_setting(varchar,boolean,boolean,boolean,varchar) to authenticated;

comment on table public.platform_showcase_verticals is 'S0 founder-controlled showcase surface: creation visibility, Playground visibility, featured state and curated vertical palette.';
