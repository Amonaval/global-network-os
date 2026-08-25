-- G6 — Two-Vertical Architecture Proof, Shared UX Composition & Hardening
-- Additive hardening after 045. Family tables/RPCs remain unchanged.

-- 1) Vertical-scope the platform launch catalog so same-named bundles (core/admin)
-- cannot accidentally move features in another vertical.
alter table public.platform_feature_flags add column if not exists vertical_kind varchar(20) not null default 'family';
update public.platform_feature_flags set vertical_kind='family' where vertical_kind is null or vertical_kind='';
alter table public.platform_feature_flags drop constraint if exists platform_feature_flags_vertical_kind_check;
alter table public.platform_feature_flags add constraint platform_feature_flags_vertical_kind_check check(vertical_kind in ('family','alumni'));
create index if not exists idx_platform_feature_flags_vertical_bundle on public.platform_feature_flags(vertical_kind,bundle_key);

insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind) values
 ('alumni.core.home','core','released','{}'::uuid[],'alumni'),
 ('alumni.core.directory','discover','released','{}'::uuid[],'alumni'),
 ('alumni.core.cohorts','discover','released','{}'::uuid[],'alumni'),
 ('alumni.core.connections','connect','released','{}'::uuid[],'alumni'),
 ('alumni.admin.import','admin','released','{}'::uuid[],'alumni'),
 ('alumni.admin.manage','admin','released','{}'::uuid[],'alumni')
on conflict(feature_key) do update set vertical_kind='alumni';

-- Preserve existing Playground decisions; only seed missing Alumni rows.
insert into public.platform_playground_features(feature_key,enabled) values
 ('alumni.core.home',true),('alumni.core.directory',true),('alumni.core.cohorts',true),
 ('alumni.core.connections',true),('alumni.admin.import',false),('alumni.admin.manage',false)
on conflict(feature_key) do nothing;

create or replace function public.get_platform_vertical_launch_console(p_vertical_kind varchar)
returns table(feature_key varchar,bundle_key varchar,rollout_state varchar,pilot_network_ids uuid[],announcement_version integer,updated_at timestamptz)
language plpgsql security definer stable set search_path=public as $$
begin
 if not public.is_platform_owner() then raise exception 'Platform owner access is required.' using errcode='42501'; end if;
 if p_vertical_kind not in ('family','alumni') then raise exception 'Unknown vertical.' using errcode='22023'; end if;
 return query select f.feature_key,f.bundle_key,f.rollout_state,f.pilot_network_ids,f.announcement_version,f.updated_at
 from public.platform_feature_flags f where f.vertical_kind=p_vertical_kind order by f.bundle_key,f.feature_key;
end $$;
revoke all on function public.get_platform_vertical_launch_console(varchar) from public;
grant execute on function public.get_platform_vertical_launch_console(varchar) to authenticated;

create or replace function public.set_platform_vertical_bundle_rollout(p_vertical_kind varchar,p_bundle_key varchar,p_rollout_state varchar,p_pilot_network_ids uuid[] default '{}',p_announce boolean default false)
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
 if not public.is_platform_owner() then raise exception 'Platform owner access is required.' using errcode='42501'; end if;
 if p_vertical_kind not in ('family','alumni') then raise exception 'Unknown vertical.' using errcode='22023'; end if;
 if p_rollout_state not in ('hidden','test','pilot','released') then raise exception 'Invalid rollout state.' using errcode='22023'; end if;
 update public.platform_feature_flags
 set rollout_state=p_rollout_state,
     pilot_network_ids=case when p_rollout_state='pilot' then coalesce(p_pilot_network_ids,'{}') else '{}'::uuid[] end,
     announcement_version=case when p_announce then announcement_version+1 else announcement_version end,
     updated_by=auth.uid(),updated_at=now()
 where vertical_kind=p_vertical_kind and bundle_key=p_bundle_key;
 get diagnostics v_count=row_count;
 return v_count;
end $$;
revoke all on function public.set_platform_vertical_bundle_rollout(varchar,varchar,varchar,uuid[],boolean) from public;
grant execute on function public.set_platform_vertical_bundle_rollout(varchar,varchar,varchar,uuid[],boolean) to authenticated;

create or replace function public.get_platform_network_targets()
returns table(network_id uuid,name varchar,slug varchar,status varchar,member_count bigint,vertical_kind varchar)
language plpgsql security definer stable set search_path=public as $$
begin
 if not public.is_platform_owner() then raise exception 'Platform owner access is required.' using errcode='42501'; end if;
 return query select n.id,n.name,n.slug,n.status,(select count(*) from public.network_memberships nm where nm.network_id=n.id and nm.status='active'),n.vertical_kind
 from public.networks n order by n.created_at desc,n.name;
end $$;
revoke all on function public.get_platform_network_targets() from public;
grant execute on function public.get_platform_network_targets() to authenticated;

-- 2) Store Alumni network identity outside generic network settings.
create table if not exists public.alumni_network_settings(
 network_id uuid primary key references public.networks(id) on delete cascade,
 institution_name varchar(220) not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.alumni_network_settings enable row level security;
revoke all on table public.alumni_network_settings from anon,authenticated;
insert into public.alumni_network_settings(network_id,institution_name)
select n.id,n.name from public.networks n where n.vertical_kind='alumni'
on conflict(network_id) do nothing;

-- Recreate only the Alumni creator RPC, preserving its signature. Institution is now
-- durable vertical data rather than being overloaded into a person's bio.
create or replace function public.create_alumni_network(p_name text,p_institution text,p_description text default '') returns uuid
language plpgsql security definer set search_path=public as $$
declare v_id uuid; v_slug text; v_base text;
begin
  if auth.uid() is null then raise exception 'Sign in required.' using errcode='42501'; end if;
  if length(trim(coalesce(p_name,'')))<2 then raise exception 'Network name is required.'; end if;
  if length(trim(coalesce(p_institution,'')))<2 then raise exception 'Institution name is required.'; end if;
  v_base:=lower(regexp_replace(trim(p_name),'[^a-zA-Z0-9]+','-','g')); v_base:=trim(both '-' from v_base);
  if v_base='' then v_base:='alumni-network'; end if;
  v_slug:=v_base;
  while exists(select 1 from public.networks where slug=v_slug) loop v_slug:=v_base||'-'||substr(gen_random_uuid()::text,1,6); end loop;
  insert into public.networks(name,slug,created_by,vertical_kind) values(trim(p_name),v_slug,auth.uid(),'alumni') returning id into v_id;
  insert into public.network_memberships(network_id,user_id,role,status) values(v_id,auth.uid(),'owner','active');
  insert into public.network_settings(network_id,id,name,description,entity_label,entity_label_plural,level_label,level_label_plural,parent_label,child_label,peer_label,network_template,vertical_kind)
  values(v_id,'network',trim(p_name),coalesce(p_description,''),'Alumni','Alumni','Batch Year','Batch Years','Senior','Junior','Classmate','alumni','alumni');
  insert into public.alumni_network_settings(network_id,institution_name) values(v_id,trim(p_institution));
  update public.profiles set active_network_id=v_id,updated_at=now() where id=auth.uid();
  insert into public.audit_log(network_id,actor_id,action,details) values(v_id,auth.uid(),'alumni_network_created',jsonb_build_object('institution',trim(p_institution)));
  insert into public.alumni_profiles(network_id,full_name,email,claimed_by)
  select v_id,coalesce(nullif(trim(p.full_name),''),split_part(coalesce(u.email,'Alumni'),'@',1)),lower(u.email),auth.uid()
  from public.profiles p join auth.users u on u.id=p.id where p.id=auth.uid();
  return v_id;
end $$;
revoke all on function public.create_alumni_network(text,text,text) from public;
grant execute on function public.create_alumni_network(text,text,text) to authenticated;

create or replace function public.get_alumni_network_overview()
returns table(institution_name varchar,profile_count bigint,claimed_count bigint,batch_count bigint,program_count bigint)
language sql security definer stable set search_path=public as $$
 select coalesce(ans.institution_name,n.name),
   (select count(*) from public.alumni_profiles ap where ap.network_id=n.id),
   (select count(*) from public.alumni_profiles ap where ap.network_id=n.id and ap.claimed_by is not null),
   (select count(distinct ap.graduation_year) from public.alumni_profiles ap where ap.network_id=n.id and ap.graduation_year is not null),
   (select count(distinct ap.program) from public.alumni_profiles ap where ap.network_id=n.id and nullif(trim(ap.program),'') is not null)
 from public.networks n left join public.alumni_network_settings ans on ans.network_id=n.id
 where n.id=public.current_network_id() and n.vertical_kind='alumni' and public.is_network_member(n.id);
$$;
revoke all on function public.get_alumni_network_overview() from public;
grant execute on function public.get_alumni_network_overview() to authenticated;

-- 3) Database-level tenant integrity. Even future RPCs cannot connect a profile
-- from Network A to a connection/invitation row claiming Network B.
do $$ begin
 if not exists(select 1 from pg_constraint where conname='uq_alumni_profiles_id_network') then alter table public.alumni_profiles add constraint uq_alumni_profiles_id_network unique(id,network_id); end if;
 if not exists(select 1 from pg_constraint where conname='fk_alumni_connections_person_network') then alter table public.alumni_connections add constraint fk_alumni_connections_person_network foreign key(person_id,network_id) references public.alumni_profiles(id,network_id) on delete cascade; end if;
 if not exists(select 1 from pg_constraint where conname='fk_alumni_connections_related_network') then alter table public.alumni_connections add constraint fk_alumni_connections_related_network foreign key(related_person_id,network_id) references public.alumni_profiles(id,network_id) on delete cascade; end if;
 if not exists(select 1 from pg_constraint where conname='fk_alumni_invitation_profile_network') then alter table public.alumni_invitations add constraint fk_alumni_invitation_profile_network foreign key(profile_id,network_id) references public.alumni_profiles(id,network_id) on delete cascade; end if;
end $$;
create index if not exists idx_alumni_profiles_claimed on public.alumni_profiles(network_id,claimed_by) where claimed_by is not null;
create index if not exists idx_alumni_connections_person on public.alumni_connections(network_id,person_id);
create index if not exists idx_alumni_connections_related on public.alumni_connections(network_id,related_person_id);
create index if not exists idx_alumni_invitations_active on public.alumni_invitations(network_id,status,expires_at);

create or replace function public.create_alumni_connection(p_related_profile_id uuid,p_relation_kind varchar default 'professional_connection') returns uuid
language plpgsql security definer set search_path=public as $$
declare v_network uuid:=public.current_network_id(); v_me uuid; v_id uuid;
begin
 if auth.uid() is null then raise exception 'Sign in required.' using errcode='42501'; end if;
 if (select vertical_kind from public.networks where id=v_network)<>'alumni' then raise exception 'Active network is not Alumni.'; end if;
 select id into v_me from public.alumni_profiles where network_id=v_network and claimed_by=auth.uid();
 if v_me is null then raise exception 'Complete or claim your Alumni profile first.' using errcode='42501'; end if;
 if p_related_profile_id=v_me then raise exception 'You cannot connect to your own profile.' using errcode='22023'; end if;
 if p_relation_kind not in ('batchmate','classmate','mentor','mentee','professional_connection') then raise exception 'Invalid Alumni relationship.' using errcode='22023'; end if;
 if not exists(select 1 from public.alumni_profiles where id=p_related_profile_id and network_id=v_network and visibility='members') then raise exception 'Alumni profile is unavailable.'; end if;
 insert into public.alumni_connections(network_id,person_id,related_person_id,relation_kind,created_by)
 values(v_network,v_me,p_related_profile_id,p_relation_kind,auth.uid())
 on conflict(network_id,person_id,related_person_id,relation_kind) do update set created_by=excluded.created_by
 returning id into v_id;
 return v_id;
end $$;
revoke all on function public.create_alumni_connection(uuid,varchar) from public;
grant execute on function public.create_alumni_connection(uuid,varchar) to authenticated;

create or replace function public.get_my_alumni_connections()
returns table(connection_id uuid,related_profile_id uuid,full_name varchar,graduation_year integer,program varchar,city varchar,company varchar,job_title varchar,relation_kind varchar)
language sql security definer stable set search_path=public as $$
 with mine as (select id,network_id from public.alumni_profiles where network_id=public.current_network_id() and claimed_by=auth.uid() limit 1), links as (
  select ac.id,case when ac.person_id=m.id then ac.related_person_id else ac.person_id end related_id,ac.relation_kind,m.network_id
  from public.alumni_connections ac join mine m on m.network_id=ac.network_id where ac.person_id=m.id or ac.related_person_id=m.id
 )
 select l.id,ap.id,ap.full_name,ap.graduation_year,ap.program,ap.city,ap.company,ap.job_title,l.relation_kind
 from links l join public.alumni_profiles ap on ap.id=l.related_id and ap.network_id=l.network_id
 where ap.visibility='members' or ap.claimed_by=auth.uid() or public.is_network_admin(ap.network_id)
 order by ap.full_name;
$$;
revoke all on function public.get_my_alumni_connections() from public;
grant execute on function public.get_my_alumni_connections() to authenticated;
