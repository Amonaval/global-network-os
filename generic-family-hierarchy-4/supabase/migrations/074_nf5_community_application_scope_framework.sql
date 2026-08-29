-- NF-5 — Community Applications / Purpose Scope Framework
-- Adds explicit person-level, purpose-specific opt-in snapshots over approved federation paths.
-- A network's Passport purpose declaration is a prerequisite, never person consent.

create table if not exists public.federated_scope_profiles(
 id uuid primary key default gen_random_uuid(),
 owner_user_id uuid not null references auth.users(id) on delete cascade,
 network_id uuid not null references public.networks(id) on delete cascade,
 umbrella_id uuid not null references public.federation_umbrellas(id) on delete cascade,
 scope_key varchar(48) not null,
 display_name varchar(180) not null,
 headline varchar(180),
 summary varchar(800),
 location_label varchar(160),
 tags text[] not null default '{}',
 contact_mode varchar(24) not null default 'introduction_only' check(contact_mode in ('introduction_only','direct_request')),
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(owner_user_id,network_id,umbrella_id,scope_key),
 check(length(trim(scope_key)) between 2 and 48),
 check(coalesce(array_length(tags,1),0)<=12)
);
create index if not exists idx_federated_scope_profiles_scope on public.federated_scope_profiles(umbrella_id,scope_key,active,updated_at desc);
alter table public.federated_scope_profiles enable row level security;
revoke all on public.federated_scope_profiles from anon,authenticated;

create or replace function public.get_my_federated_scope_contexts()
returns table(network_id uuid,network_name varchar,umbrella_id uuid,umbrella_name varchar,scope_key text,passport_visibility varchar)
language sql security definer stable set search_path=public as $$
 select distinct n.id,n.name,u.id,u.name,s.scope_key,p.visibility
 from public.network_memberships nm
 join public.networks n on n.id=nm.network_id and n.status='active'
 join public.network_umbrella_affiliations a on a.network_id=n.id and a.status='approved'
 join public.federation_umbrellas u on u.id=a.umbrella_id and u.status='active'
 join public.network_passports p on p.network_id=n.id and p.visibility in ('federation','public')
 cross join lateral unnest(p.participation_scopes) s(scope_key)
 where nm.user_id=auth.uid() and nm.status='active'
 order by n.name,u.name,s.scope_key;
$$;
revoke all on function public.get_my_federated_scope_contexts() from public;
grant execute on function public.get_my_federated_scope_contexts() to authenticated;

create or replace function public.get_my_federated_scope_profiles()
returns table(id uuid,scope_key varchar,display_name varchar,headline varchar,summary varchar,location_label varchar,tags text[],contact_mode varchar,network_id uuid,network_name varchar,umbrella_id uuid,umbrella_name varchar,active boolean,updated_at timestamptz)
language sql security definer stable set search_path=public as $$
 select p.id,p.scope_key,p.display_name,p.headline,p.summary,p.location_label,p.tags,p.contact_mode,p.network_id,n.name,p.umbrella_id,u.name,p.active,p.updated_at
 from public.federated_scope_profiles p join public.networks n on n.id=p.network_id join public.federation_umbrellas u on u.id=p.umbrella_id
 where p.owner_user_id=auth.uid() order by p.updated_at desc;
$$;
revoke all on function public.get_my_federated_scope_profiles() from public;
grant execute on function public.get_my_federated_scope_profiles() to authenticated;

create or replace function public.save_my_federated_scope_profile(
 p_network_id uuid,p_umbrella_id uuid,p_scope_key text,p_display_name text,p_headline text default null,p_summary text default null,p_location_label text default null,p_tags text[] default '{}',p_contact_mode text default 'introduction_only'
) returns uuid language plpgsql security definer set search_path=public as $$
declare rid uuid; sk text:=lower(trim(p_scope_key));
begin
 if auth.uid() is null or not public.is_network_member(p_network_id) then raise exception 'Active source-network membership required.' using errcode='42501'; end if;
 if length(trim(coalesce(p_display_name,'')))<2 then raise exception 'Display name is required.' using errcode='22023'; end if;
 if coalesce(array_length(p_tags,1),0)>12 then raise exception 'Use at most 12 tags.' using errcode='22023'; end if;
 if p_contact_mode not in ('introduction_only','direct_request') then raise exception 'Unsupported contact mode.' using errcode='22023'; end if;
 if not exists(select 1 from public.network_umbrella_affiliations a join public.federation_umbrellas u on u.id=a.umbrella_id and u.status='active' where a.network_id=p_network_id and a.umbrella_id=p_umbrella_id and a.status='approved') then raise exception 'Approved umbrella affiliation required.' using errcode='42501'; end if;
 if not exists(select 1 from public.network_passports p where p.network_id=p_network_id and p.visibility in ('federation','public') and exists(select 1 from unnest(p.participation_scopes) x where lower(x)=sk)) then raise exception 'The Network Passport must currently declare this purpose for federation/public participation.' using errcode='42501'; end if;
 insert into public.federated_scope_profiles(owner_user_id,network_id,umbrella_id,scope_key,display_name,headline,summary,location_label,tags,contact_mode,active,updated_at)
 values(auth.uid(),p_network_id,p_umbrella_id,sk,trim(p_display_name),nullif(trim(coalesce(p_headline,'')),''),left(nullif(trim(coalesce(p_summary,'')),''),800),nullif(trim(coalesce(p_location_label,'')),''),coalesce(p_tags,'{}'),p_contact_mode,true,now())
 on conflict(owner_user_id,network_id,umbrella_id,scope_key) do update set display_name=excluded.display_name,headline=excluded.headline,summary=excluded.summary,location_label=excluded.location_label,tags=excluded.tags,contact_mode=excluded.contact_mode,active=true,updated_at=now()
 returning id into rid; return rid;
end $$;
revoke all on function public.save_my_federated_scope_profile(uuid,uuid,text,text,text,text,text,text[],text) from public;
grant execute on function public.save_my_federated_scope_profile(uuid,uuid,text,text,text,text,text,text[],text) to authenticated;

create or replace function public.set_my_federated_scope_profile_active(p_profile_id uuid,p_active boolean) returns void
language plpgsql security definer set search_path=public as $$
begin
 update public.federated_scope_profiles set active=p_active,updated_at=now() where id=p_profile_id and owner_user_id=auth.uid();
 if not found then raise exception 'Scope profile not found or not owned by you.' using errcode='42501'; end if;
end $$;
revoke all on function public.set_my_federated_scope_profile_active(uuid,boolean) from public;
grant execute on function public.set_my_federated_scope_profile_active(uuid,boolean) to authenticated;

create or replace function public.search_federated_scope_profiles(p_scope_key text,p_query text default '',p_limit integer default 40)
returns table(id uuid,scope_key varchar,display_name varchar,headline varchar,summary varchar,location_label varchar,tags text[],contact_mode varchar,network_id uuid,network_name varchar,umbrella_id uuid,umbrella_name varchar,source_network_id uuid,source_network_name varchar,trust_path_label text,is_mine boolean,updated_at timestamptz)
language sql security definer stable set search_path=public as $$
 with requester_paths as (
  select distinct src.id source_network_id,src.name source_network_name,a.umbrella_id
  from public.network_memberships nm join public.networks src on src.id=nm.network_id and src.status='active'
  join public.network_umbrella_affiliations a on a.network_id=src.id and a.status='approved'
  join public.federation_umbrellas u on u.id=a.umbrella_id and u.status='active'
  where nm.user_id=auth.uid() and nm.status='active'
 ), eligible as (
  select distinct on (sp.id) sp.*,n.name network_name,u.name umbrella_name,rp.source_network_id,rp.source_network_name
  from requester_paths rp
  join public.federated_scope_profiles sp on sp.umbrella_id=rp.umbrella_id and sp.active and lower(sp.scope_key)=lower(trim(p_scope_key))
  join public.network_umbrella_affiliations ta on ta.network_id=sp.network_id and ta.umbrella_id=sp.umbrella_id and ta.status='approved'
  join public.federation_umbrellas u on u.id=sp.umbrella_id and u.status='active'
  join public.networks n on n.id=sp.network_id and n.status='active'
  join public.network_passports np on np.network_id=sp.network_id and np.visibility in ('federation','public')
  where exists(select 1 from unnest(np.participation_scopes) x where lower(x)=lower(sp.scope_key))
  order by sp.id,rp.source_network_name
 )
 select e.id,e.scope_key,e.display_name,e.headline,e.summary,e.location_label,e.tags,e.contact_mode,e.network_id,e.network_name,e.umbrella_id,e.umbrella_name,e.source_network_id,e.source_network_name,
  (e.source_network_name||' → '||e.umbrella_name||' → '||e.network_name)::text,(e.owner_user_id=auth.uid()),e.updated_at
 from eligible e
 where coalesce(trim(p_query),'')='' or lower(concat_ws(' ',e.display_name,e.headline,e.summary,e.location_label,array_to_string(e.tags,' '),e.network_name)) like '%'||lower(trim(p_query))||'%'
 order by (e.owner_user_id=auth.uid()) desc,e.updated_at desc
 limit least(greatest(coalesce(p_limit,40),1),100);
$$;
revoke all on function public.search_federated_scope_profiles(text,text,integer) from public;
grant execute on function public.search_federated_scope_profiles(text,text,integer) to authenticated;
comment on table public.federated_scope_profiles is 'NF-5 explicit person-owned, purpose-scoped outward snapshots. No private network member/contact/relationship data is inherited.';
comment on function public.search_federated_scope_profiles(text,text,integer) is 'NF-5 consented purpose discovery through approved umbrella paths. Every returned person created an active purpose-specific snapshot.';

with verticals(vertical_kind) as (values ('family'::varchar),('alumni'),('organization'),('business-trust'),('franchise'),('professional'))
insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind)
select v.vertical_kind||'.advanced.application_scopes','federation','test','{}'::uuid[],v.vertical_kind from verticals v
on conflict(feature_key) do update set bundle_key=excluded.bundle_key,vertical_kind=excluded.vertical_kind;
insert into public.platform_playground_features(feature_key,enabled)
select feature_key,false from public.platform_feature_flags where feature_key like '%.advanced.application_scopes'
on conflict(feature_key) do nothing;
