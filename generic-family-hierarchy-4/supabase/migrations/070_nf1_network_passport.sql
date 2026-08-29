-- NF-1 — Network Passport
-- Governed outward network identity. Deliberately excludes member rows, contact data and graph topology.

create table if not exists public.network_passports(
 network_id uuid primary key references public.networks(id) on delete cascade,
 public_slug varchar(80) not null unique,
 tagline varchar(120) not null default '',
 summary varchar(800) not null default '',
 location_label varchar(120) not null default '',
 established_label varchar(80) not null default '',
 external_url varchar(300) not null default '',
 capabilities text[] not null default '{}',
 participation_scopes text[] not null default '{}',
 visibility varchar(20) not null default 'private' check(visibility in ('private','federation','public')),
 directory_discoverable boolean not null default false,
 verification_state varchar(30) not null default 'self_declared' check(verification_state in ('self_declared','network_admin_reviewed')),
 created_by uuid references auth.users(id) on delete set null,
 updated_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(public_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
 check(external_url='' or external_url ~ '^https://')
);
create index if not exists idx_network_passports_visibility on public.network_passports(visibility,directory_discoverable,updated_at desc);
alter table public.network_passports enable row level security;
revoke all on table public.network_passports from anon,authenticated;

create or replace function public.get_my_network_passports()
returns table(network_id uuid,network_name varchar,vertical_kind varchar,public_slug varchar,tagline varchar,summary varchar,location_label varchar,established_label varchar,external_url varchar,capabilities text[],participation_scopes text[],visibility varchar,directory_discoverable boolean,verification_state varchar,updated_at timestamptz)
language sql security definer stable set search_path=public as $$
 select n.id,n.name,n.vertical_kind,coalesce(p.public_slug,n.slug),coalesce(p.tagline,''),coalesce(p.summary,''),coalesce(p.location_label,''),coalesce(p.established_label,''),coalesce(p.external_url,''),coalesce(p.capabilities,'{}'),coalesce(p.participation_scopes,'{}'),coalesce(p.visibility,'private'),coalesce(p.directory_discoverable,false),coalesce(p.verification_state,'self_declared'),p.updated_at
 from public.network_memberships nm join public.networks n on n.id=nm.network_id left join public.network_passports p on p.network_id=n.id
 where nm.user_id=auth.uid() and nm.status='active' and n.status='active'
 order by n.name;
$$;
revoke all on function public.get_my_network_passports() from public;
grant execute on function public.get_my_network_passports() to authenticated;

create or replace function public.save_network_passport(p_network_id uuid,p_public_slug text,p_tagline text default '',p_summary text default '',p_location_label text default '',p_established_label text default '',p_external_url text default '',p_capabilities text[] default '{}',p_participation_scopes text[] default '{}',p_visibility text default 'private',p_directory_discoverable boolean default false)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_slug text:=lower(trim(coalesce(p_public_slug,'')));v_url text:=trim(coalesce(p_external_url,''));
begin
 if not public.is_network_admin(p_network_id) then raise exception 'Network owner/admin access required.' using errcode='42501'; end if;
 if v_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' or length(v_slug)>80 then raise exception 'Passport slug must use lowercase letters, numbers and hyphens.'; end if;
 if length(trim(coalesce(p_tagline,'')))>120 or length(trim(coalesce(p_summary,'')))>800 or length(trim(coalesce(p_location_label,'')))>120 or length(trim(coalesce(p_established_label,'')))>80 then raise exception 'Passport field exceeds its allowed length.'; end if;
 if v_url<>'' and (length(v_url)>300 or v_url !~ '^https://') then raise exception 'External URL must use HTTPS.'; end if;
 if p_visibility not in ('private','federation','public') then raise exception 'Invalid Passport visibility.'; end if;
 if coalesce(array_length(p_capabilities,1),0)>12 or coalesce(array_length(p_participation_scopes,1),0)>12 then raise exception 'Use at most 12 capabilities or participation scopes.'; end if;
 if exists(select 1 from unnest(coalesce(p_capabilities,'{}')) x where length(trim(x))>80) or exists(select 1 from unnest(coalesce(p_participation_scopes,'{}')) x where length(trim(x))>80) then raise exception 'Capability and scope labels must be 80 characters or fewer.'; end if;
 insert into public.network_passports(network_id,public_slug,tagline,summary,location_label,established_label,external_url,capabilities,participation_scopes,visibility,directory_discoverable,verification_state,created_by,updated_by)
 values(p_network_id,v_slug,trim(coalesce(p_tagline,'')),trim(coalesce(p_summary,'')),trim(coalesce(p_location_label,'')),trim(coalesce(p_established_label,'')),v_url,array(select distinct trim(x) from unnest(coalesce(p_capabilities,'{}')) x where trim(x)<>'' limit 12),array(select distinct trim(x) from unnest(coalesce(p_participation_scopes,'{}')) x where trim(x)<>'' limit 12),p_visibility,case when p_visibility='private' then false else coalesce(p_directory_discoverable,false) end,'network_admin_reviewed',auth.uid(),auth.uid())
 on conflict(network_id) do update set public_slug=excluded.public_slug,tagline=excluded.tagline,summary=excluded.summary,location_label=excluded.location_label,established_label=excluded.established_label,external_url=excluded.external_url,capabilities=excluded.capabilities,participation_scopes=excluded.participation_scopes,visibility=excluded.visibility,directory_discoverable=excluded.directory_discoverable,verification_state='network_admin_reviewed',updated_by=auth.uid(),updated_at=now();
 return p_network_id;
end $$;
revoke all on function public.save_network_passport(uuid,text,text,text,text,text,text,text[],text[],text,boolean) from public;
grant execute on function public.save_network_passport(uuid,text,text,text,text,text,text,text[],text[],text,boolean) to authenticated;

create or replace function public.get_public_network_passport(p_slug text)
returns table(network_id uuid,network_name varchar,vertical_kind varchar,public_slug varchar,tagline varchar,summary varchar,location_label varchar,established_label varchar,external_url varchar,capabilities text[],participation_scopes text[],visibility varchar,directory_discoverable boolean,verification_state varchar,updated_at timestamptz)
language sql security definer stable set search_path=public as $$
 select n.id,n.name,n.vertical_kind,p.public_slug,p.tagline,p.summary,p.location_label,p.established_label,p.external_url,p.capabilities,p.participation_scopes,p.visibility,p.directory_discoverable,p.verification_state,p.updated_at
 from public.network_passports p join public.networks n on n.id=p.network_id
 where p.public_slug=lower(trim(p_slug)) and p.visibility='public' and n.status='active'
 limit 1;
$$;
revoke all on function public.get_public_network_passport(text) from public;
grant execute on function public.get_public_network_passport(text) to anon,authenticated;

-- Launch Control: NF-1 is independently gated and TEST by default.
with verticals(vertical_kind) as (values ('family'::varchar),('alumni'),('organization'),('business-trust'),('franchise'),('professional'))
insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind)
select v.vertical_kind||'.advanced.network_passport','federation','test','{}'::uuid[],v.vertical_kind from verticals v
on conflict(feature_key) do update set bundle_key=excluded.bundle_key,vertical_kind=excluded.vertical_kind;
insert into public.platform_playground_features(feature_key,enabled)
select feature_key,false from public.platform_feature_flags where feature_key like '%.advanced.network_passport'
on conflict(feature_key) do nothing;
