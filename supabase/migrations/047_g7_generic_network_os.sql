-- G7 — Generic Network OS Productization & Template Architecture
-- Additive generic affiliation/projection + shared activity/group foundation.
-- Family kinship tables and Alumni persistence remain authoritative vertical stores.

create table if not exists public.network_entities(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 kind varchar(50) not null,
 external_ref uuid,
 owner_user_id uuid references auth.users(id) on delete set null,
 label varchar(220) not null,
 metadata jsonb not null default '{}'::jsonb,
 visibility varchar(20) not null default 'members' check(visibility in ('members','private')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index if not exists uq_network_entities_external_ref on public.network_entities(network_id,kind,external_ref) where external_ref is not null;
create index if not exists idx_network_entities_network_kind on public.network_entities(network_id,kind);
do $$ begin if not exists(select 1 from pg_constraint where conname='uq_network_entities_id_network') then alter table public.network_entities add constraint uq_network_entities_id_network unique(id,network_id); end if; end $$;

create table if not exists public.network_dimensions(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 dimension_key varchar(80) not null,
 label varchar(160) not null,
 entity_kind varchar(50),
 sort_order integer not null default 0,
 created_at timestamptz not null default now(),
 unique(network_id,dimension_key)
);

do $$ begin if not exists(select 1 from pg_constraint where conname='uq_network_dimensions_id_network') then alter table public.network_dimensions add constraint uq_network_dimensions_id_network unique(id,network_id); end if; end $$;

create table if not exists public.network_dimension_values(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 dimension_id uuid not null references public.network_dimensions(id) on delete cascade,
 value_key varchar(220) not null,
 label varchar(220) not null,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 unique(network_id,dimension_id,value_key)
);
create index if not exists idx_network_dimension_values_dimension on public.network_dimension_values(network_id,dimension_id,label);
do $$ begin if not exists(select 1 from pg_constraint where conname='uq_network_dimension_values_id_network') then alter table public.network_dimension_values add constraint uq_network_dimension_values_id_network unique(id,network_id); end if; end $$;
do $$ begin if not exists(select 1 from pg_constraint where conname='fk_network_dimension_value_dimension_tenant') then alter table public.network_dimension_values add constraint fk_network_dimension_value_dimension_tenant foreign key(dimension_id,network_id) references public.network_dimensions(id,network_id) on delete cascade; end if; end $$;

create table if not exists public.network_entity_affiliations(
 network_id uuid not null references public.networks(id) on delete cascade,
 entity_id uuid not null references public.network_entities(id) on delete cascade,
 dimension_id uuid not null references public.network_dimensions(id) on delete cascade,
 value_id uuid not null references public.network_dimension_values(id) on delete cascade,
 source varchar(30) not null default 'vertical_adapter',
 created_at timestamptz not null default now(),
 primary key(network_id,entity_id,dimension_id,value_id)
);
create index if not exists idx_network_affiliations_value on public.network_entity_affiliations(network_id,value_id,entity_id);
do $$ begin
 if not exists(select 1 from pg_constraint where conname='fk_network_affiliation_entity_tenant') then alter table public.network_entity_affiliations add constraint fk_network_affiliation_entity_tenant foreign key(entity_id,network_id) references public.network_entities(id,network_id) on delete cascade; end if;
 if not exists(select 1 from pg_constraint where conname='fk_network_affiliation_dimension_tenant') then alter table public.network_entity_affiliations add constraint fk_network_affiliation_dimension_tenant foreign key(dimension_id,network_id) references public.network_dimensions(id,network_id) on delete cascade; end if;
 if not exists(select 1 from pg_constraint where conname='fk_network_affiliation_value_tenant') then alter table public.network_entity_affiliations add constraint fk_network_affiliation_value_tenant foreign key(value_id,network_id) references public.network_dimension_values(id,network_id) on delete cascade; end if;
end $$;

create table if not exists public.network_projections(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 projection_key varchar(100) not null,
 label varchar(180) not null,
 levels text[] not null,
 is_default boolean not null default false,
 sort_order integer not null default 0,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(network_id,projection_key),
 check(cardinality(levels)>0)
);

create table if not exists public.network_groups(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 name varchar(180) not null,
 group_type varchar(50) not null default 'group',
 description text,
 dimension_value_id uuid references public.network_dimension_values(id) on delete set null,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(network_id,name)
);

do $$ begin if not exists(select 1 from pg_constraint where conname='uq_network_groups_id_network') then alter table public.network_groups add constraint uq_network_groups_id_network unique(id,network_id); end if; end $$;
do $$ begin if not exists(select 1 from pg_constraint where conname='fk_network_group_dimension_tenant') then alter table public.network_groups add constraint fk_network_group_dimension_tenant foreign key(dimension_value_id,network_id) references public.network_dimension_values(id,network_id) on delete set null; end if; end $$;

create table if not exists public.network_group_memberships(
 group_id uuid not null,
 network_id uuid not null references public.networks(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role varchar(20) not null default 'member' check(role in ('member','lead')),
 created_at timestamptz not null default now(),
 primary key(group_id,user_id),
 constraint fk_network_group_membership_tenant foreign key(group_id,network_id) references public.network_groups(id,network_id) on delete cascade
);

create table if not exists public.network_activities(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 activity_type varchar(30) not null check(activity_type in ('event','memory','milestone','announcement')),
 title varchar(220) not null,
 body text,
 starts_at timestamptz,
 ends_at timestamptz,
 place varchar(220),
 visibility varchar(20) not null default 'members' check(visibility in ('members','private')),
 metadata jsonb not null default '{}'::jsonb,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists idx_network_activities_network_type_date on public.network_activities(network_id,activity_type,starts_at desc nulls last,created_at desc);
do $$ begin if not exists(select 1 from pg_constraint where conname='uq_network_activities_id_network') then alter table public.network_activities add constraint uq_network_activities_id_network unique(id,network_id); end if; end $$;

create table if not exists public.network_activity_rsvps(
 activity_id uuid not null,
 network_id uuid not null references public.networks(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 response varchar(20) not null check(response in ('going','maybe','declined')),
 updated_at timestamptz not null default now(),
 primary key(activity_id,user_id),
 constraint fk_network_activity_rsvp_tenant foreign key(activity_id,network_id) references public.network_activities(id,network_id) on delete cascade
);

alter table public.network_entities enable row level security;
alter table public.network_dimensions enable row level security;
alter table public.network_dimension_values enable row level security;
alter table public.network_entity_affiliations enable row level security;
alter table public.network_projections enable row level security;
alter table public.network_groups enable row level security;
alter table public.network_group_memberships enable row level security;
alter table public.network_activities enable row level security;
alter table public.network_activity_rsvps enable row level security;

revoke all on table public.network_entities,public.network_dimensions,public.network_dimension_values,public.network_entity_affiliations,public.network_projections,public.network_groups,public.network_group_memberships,public.network_activities,public.network_activity_rsvps from anon,authenticated;

-- Internal helpers used by vertical adapters/triggers.
create or replace function public.g7_value_key(p_label text) returns text language sql immutable as $$
 select lower(trim(both '-' from regexp_replace(trim(coalesce(p_label,'')),'[^a-zA-Z0-9]+','-','g')));
$$;

create or replace function public.g7_ensure_dimension(p_network uuid,p_key text,p_label text,p_sort integer default 0) returns uuid
language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
 insert into public.network_dimensions(network_id,dimension_key,label,sort_order) values(p_network,trim(p_key),trim(p_label),p_sort)
 on conflict(network_id,dimension_key) do update set label=excluded.label,sort_order=excluded.sort_order
 returning id into v_id;
 return v_id;
end $$;

create or replace function public.g7_set_entity_affiliation(p_entity uuid,p_network uuid,p_dimension_key text,p_label text) returns void
language plpgsql security definer set search_path=public as $$
declare v_dim uuid; v_value uuid; v_key text;
begin
 select id into v_dim from public.network_dimensions where network_id=p_network and dimension_key=p_dimension_key;
 if v_dim is null then return; end if;
 delete from public.network_entity_affiliations where network_id=p_network and entity_id=p_entity and dimension_id=v_dim;
 if nullif(trim(coalesce(p_label,'')),'') is null then return; end if;
 v_key:=public.g7_value_key(p_label); if v_key='' then v_key:=md5(trim(p_label)); end if;
 insert into public.network_dimension_values(network_id,dimension_id,value_key,label) values(p_network,v_dim,v_key,trim(p_label))
 on conflict(network_id,dimension_id,value_key) do update set label=excluded.label returning id into v_value;
 insert into public.network_entity_affiliations(network_id,entity_id,dimension_id,value_id) values(p_network,p_entity,v_dim,v_value)
 on conflict do nothing;
end $$;

-- Internal adapter helpers are never an application API.
revoke all on function public.g7_value_key(text) from public;
revoke all on function public.g7_ensure_dimension(uuid,text,text,integer) from public;
revoke all on function public.g7_set_entity_affiliation(uuid,uuid,text,text) from public;

-- Seed Alumni dimensions/projections for every existing Alumni network.
select public.g7_ensure_dimension(id,'institution','Institution',10) from public.networks where vertical_kind='alumni';
select public.g7_ensure_dimension(id,'department','Program / School',20) from public.networks where vertical_kind='alumni';
select public.g7_ensure_dimension(id,'batch','Batch / Graduation Year',30) from public.networks where vertical_kind='alumni';
select public.g7_ensure_dimension(id,'program','Stream / Course',40) from public.networks where vertical_kind='alumni';
select public.g7_ensure_dimension(id,'city','City',50) from public.networks where vertical_kind='alumni';
select public.g7_ensure_dimension(id,'company','Company',60) from public.networks where vertical_kind='alumni';

insert into public.network_projections(network_id,projection_key,label,levels,is_default,sort_order)
select id,'institution-program-batch-stream','Program → Batch → Stream',array['institution','department','batch','program'],true,10 from public.networks where vertical_kind='alumni'
on conflict(network_id,projection_key) do update set label=excluded.label,levels=excluded.levels,is_default=excluded.is_default,sort_order=excluded.sort_order;
insert into public.network_projections(network_id,projection_key,label,levels,is_default,sort_order)
select id,'institution-batch-program-stream','Batch → Program → Stream',array['institution','batch','department','program'],false,20 from public.networks where vertical_kind='alumni'
on conflict(network_id,projection_key) do update set label=excluded.label,levels=excluded.levels,sort_order=excluded.sort_order;
insert into public.network_projections(network_id,projection_key,label,levels,is_default,sort_order)
select id,'city-institution-batch','City → Institution → Batch',array['city','institution','batch'],false,30 from public.networks where vertical_kind='alumni'
on conflict(network_id,projection_key) do update set label=excluded.label,levels=excluded.levels,sort_order=excluded.sort_order;
insert into public.network_projections(network_id,projection_key,label,levels,is_default,sort_order)
select id,'company-institution-batch','Company → Institution → Batch',array['company','institution','batch'],false,40 from public.networks where vertical_kind='alumni'
on conflict(network_id,projection_key) do update set label=excluded.label,levels=excluded.levels,sort_order=excluded.sort_order;

create or replace function public.g7_sync_alumni_profile() returns trigger language plpgsql security definer set search_path=public as $$
declare v_entity uuid; v_institution text;
begin
 if TG_OP='DELETE' then
   delete from public.network_entities where network_id=old.network_id and kind='person' and external_ref=old.id;
   return old;
 end if;
 insert into public.network_entities(network_id,kind,external_ref,owner_user_id,label,metadata,visibility)
 values(new.network_id,'person',new.id,new.claimed_by,new.full_name,jsonb_build_object('vertical','alumni'),new.visibility)
 on conflict(network_id,kind,external_ref) where external_ref is not null do update set owner_user_id=excluded.owner_user_id,label=excluded.label,visibility=excluded.visibility,updated_at=now()
 returning id into v_entity;
 select coalesce(ans.institution_name,n.name) into v_institution from public.networks n left join public.alumni_network_settings ans on ans.network_id=n.id where n.id=new.network_id;
 perform public.g7_set_entity_affiliation(v_entity,new.network_id,'institution',v_institution);
 perform public.g7_set_entity_affiliation(v_entity,new.network_id,'department',new.department);
 perform public.g7_set_entity_affiliation(v_entity,new.network_id,'batch',case when new.graduation_year is null then null else new.graduation_year::text end);
 perform public.g7_set_entity_affiliation(v_entity,new.network_id,'program',new.program);
 perform public.g7_set_entity_affiliation(v_entity,new.network_id,'city',new.city);
 perform public.g7_set_entity_affiliation(v_entity,new.network_id,'company',new.company);
 return new;
end $$;

revoke all on function public.g7_sync_alumni_profile() from public;

drop trigger if exists trg_g7_sync_alumni_profile on public.alumni_profiles;
create trigger trg_g7_sync_alumni_profile after insert or update of full_name,graduation_year,program,department,city,company,visibility,claimed_by on public.alumni_profiles for each row execute function public.g7_sync_alumni_profile();
drop trigger if exists trg_g7_remove_alumni_profile on public.alumni_profiles;
create trigger trg_g7_remove_alumni_profile after delete on public.alumni_profiles for each row execute function public.g7_sync_alumni_profile();

-- Standalone backfill helper (kept after trigger function because triggers cannot be invoked directly).
create or replace function public.g7_sync_alumni_profile_row(p_profile uuid) returns void language plpgsql security definer set search_path=public as $$
declare r public.alumni_profiles%rowtype; v_entity uuid; v_institution text;
begin
 select * into r from public.alumni_profiles where id=p_profile; if not found then return; end if;
 insert into public.network_entities(network_id,kind,external_ref,owner_user_id,label,metadata,visibility)
 values(r.network_id,'person',r.id,r.claimed_by,r.full_name,jsonb_build_object('vertical','alumni'),r.visibility)
 on conflict(network_id,kind,external_ref) where external_ref is not null do update set owner_user_id=excluded.owner_user_id,label=excluded.label,visibility=excluded.visibility,updated_at=now()
 returning id into v_entity;
 select coalesce(ans.institution_name,n.name) into v_institution from public.networks n left join public.alumni_network_settings ans on ans.network_id=n.id where n.id=r.network_id;
 perform public.g7_set_entity_affiliation(v_entity,r.network_id,'institution',v_institution);
 perform public.g7_set_entity_affiliation(v_entity,r.network_id,'department',r.department);
 perform public.g7_set_entity_affiliation(v_entity,r.network_id,'batch',case when r.graduation_year is null then null else r.graduation_year::text end);
 perform public.g7_set_entity_affiliation(v_entity,r.network_id,'program',r.program);
 perform public.g7_set_entity_affiliation(v_entity,r.network_id,'city',r.city);
 perform public.g7_set_entity_affiliation(v_entity,r.network_id,'company',r.company);
end $$;
revoke all on function public.g7_sync_alumni_profile_row(uuid) from public;
select public.g7_sync_alumni_profile_row(id) from public.alumni_profiles;

-- Read API: generic affiliated entities for the active network.
create or replace function public.get_network_affiliated_entities()
returns table(entity_id uuid,external_ref uuid,entity_kind varchar,entity_label varchar,affiliations jsonb)
language sql security definer stable set search_path=public as $$
 select e.id,e.external_ref,e.kind,e.label,
 coalesce((select jsonb_object_agg(x.dimension_key,x.labels) from (
   select d.dimension_key,jsonb_agg(v.label order by v.label) labels
   from public.network_entity_affiliations a
   join public.network_dimensions d on d.id=a.dimension_id and d.network_id=a.network_id
   join public.network_dimension_values v on v.id=a.value_id and v.network_id=a.network_id
   where a.entity_id=e.id and a.network_id=e.network_id group by d.dimension_key
 ) x),'{}'::jsonb)
 from public.network_entities e
 where e.network_id=public.current_network_id() and public.is_network_member(e.network_id)
   and (e.visibility='members' or e.owner_user_id=auth.uid() or public.is_network_admin(e.network_id))
 order by e.label;
$$;
revoke all on function public.get_network_affiliated_entities() from public;
grant execute on function public.get_network_affiliated_entities() to authenticated;

create or replace function public.get_network_projections()
returns table(projection_key varchar,label varchar,levels text[],is_default boolean)
language sql security definer stable set search_path=public as $$
 select p.projection_key,p.label,p.levels,p.is_default from public.network_projections p
 where p.network_id=public.current_network_id() and public.is_network_member(p.network_id) order by p.sort_order,p.label;
$$;
revoke all on function public.get_network_projections() from public;
grant execute on function public.get_network_projections() to authenticated;

create or replace function public.get_network_groups()
returns table(id uuid,name varchar,group_type varchar,description text,member_count bigint,my_member boolean)
language sql security definer stable set search_path=public as $$
 select g.id,g.name,g.group_type,g.description,
   (select count(*) from public.network_group_memberships gm where gm.group_id=g.id and gm.network_id=g.network_id),
   exists(select 1 from public.network_group_memberships gm where gm.group_id=g.id and gm.network_id=g.network_id and gm.user_id=auth.uid())
 from public.network_groups g
 where g.network_id=public.current_network_id() and public.is_network_member(g.network_id) order by g.name;
$$;
revoke all on function public.get_network_groups() from public;
grant execute on function public.get_network_groups() to authenticated;

create or replace function public.create_network_group(p_name text,p_group_type text default 'group',p_description text default null) returns uuid
language plpgsql security definer set search_path=public as $$
declare v_network uuid:=public.current_network_id(); v_id uuid;
begin
 if not public.is_network_admin(v_network) then raise exception 'Network admin access required.' using errcode='42501'; end if;
 if length(trim(coalesce(p_name,'')))<2 then raise exception 'Group name is required.'; end if;
 insert into public.network_groups(network_id,name,group_type,description,created_by) values(v_network,trim(p_name),coalesce(nullif(trim(p_group_type),''),'group'),nullif(trim(p_description),''),auth.uid()) returning id into v_id;
 return v_id;
end $$;
revoke all on function public.create_network_group(text,text,text) from public;
grant execute on function public.create_network_group(text,text,text) to authenticated;

create or replace function public.join_network_group(p_group_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare v_network uuid:=public.current_network_id();
begin
 if not public.is_network_member(v_network) then raise exception 'Membership required.' using errcode='42501'; end if;
 if not exists(select 1 from public.network_groups where id=p_group_id and network_id=v_network) then raise exception 'Group not found.'; end if;
 insert into public.network_group_memberships(group_id,network_id,user_id) values(p_group_id,v_network,auth.uid()) on conflict do nothing;
end $$;
revoke all on function public.join_network_group(uuid) from public;
grant execute on function public.join_network_group(uuid) to authenticated;

create or replace function public.leave_network_group(p_group_id uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
 delete from public.network_group_memberships where group_id=p_group_id and network_id=public.current_network_id() and user_id=auth.uid();
end $$;
revoke all on function public.leave_network_group(uuid) from public;
grant execute on function public.leave_network_group(uuid) to authenticated;

create or replace function public.get_network_activities(p_activity_type text default null)
returns table(id uuid,activity_type varchar,title varchar,body text,starts_at timestamptz,ends_at timestamptz,place varchar,visibility varchar,created_by uuid,my_rsvp varchar,going_count bigint)
language sql security definer stable set search_path=public as $$
 select a.id,a.activity_type,a.title,a.body,a.starts_at,a.ends_at,a.place,a.visibility,a.created_by,
   r.response,
   (select count(*) from public.network_activity_rsvps rr where rr.activity_id=a.id and rr.response='going')
 from public.network_activities a left join public.network_activity_rsvps r on r.activity_id=a.id and r.user_id=auth.uid()
 where a.network_id=public.current_network_id() and public.is_network_member(a.network_id)
   and (a.visibility='members' or a.created_by=auth.uid() or public.is_network_admin(a.network_id))
   and (p_activity_type is null or p_activity_type='' or a.activity_type=p_activity_type)
 order by coalesce(a.starts_at,a.created_at) desc;
$$;
revoke all on function public.get_network_activities(text) from public;
grant execute on function public.get_network_activities(text) to authenticated;

create or replace function public.create_network_activity(p_activity_type text,p_title text,p_body text default null,p_starts_at timestamptz default null,p_ends_at timestamptz default null,p_place text default null,p_visibility text default 'members') returns uuid
language plpgsql security definer set search_path=public as $$
declare v_network uuid:=public.current_network_id(); v_id uuid;
begin
 if not public.is_network_member(v_network) then raise exception 'Membership required.' using errcode='42501'; end if;
 if p_activity_type in ('event','announcement') and not public.is_network_admin(v_network) then raise exception 'Network admin access required for events and announcements.' using errcode='42501'; end if;
 if p_activity_type not in ('event','memory','milestone','announcement') then raise exception 'Invalid activity type.'; end if;
 if p_visibility not in ('members','private') then raise exception 'Invalid visibility.'; end if;
 if length(trim(coalesce(p_title,'')))<2 then raise exception 'Title is required.'; end if;
 insert into public.network_activities(network_id,activity_type,title,body,starts_at,ends_at,place,visibility,created_by)
 values(v_network,p_activity_type,trim(p_title),nullif(trim(p_body),''),p_starts_at,p_ends_at,nullif(trim(p_place),''),p_visibility,auth.uid()) returning id into v_id;
 return v_id;
end $$;
revoke all on function public.create_network_activity(text,text,text,timestamptz,timestamptz,text,text) from public;
grant execute on function public.create_network_activity(text,text,text,timestamptz,timestamptz,text,text) to authenticated;

create or replace function public.respond_network_event(p_activity_id uuid,p_response text) returns void
language plpgsql security definer set search_path=public as $$
declare v_network uuid:=public.current_network_id();
begin
 if p_response not in ('going','maybe','declined') then raise exception 'Invalid RSVP response.'; end if;
 if not public.is_network_member(v_network) then raise exception 'Membership required.' using errcode='42501'; end if;
 if not exists(select 1 from public.network_activities where id=p_activity_id and network_id=v_network and activity_type='event') then raise exception 'Event not found.'; end if;
 insert into public.network_activity_rsvps(activity_id,network_id,user_id,response) values(p_activity_id,v_network,auth.uid(),p_response)
 on conflict(activity_id,user_id) do update set response=excluded.response,updated_at=now();
end $$;
revoke all on function public.respond_network_event(uuid,text) from public;
grant execute on function public.respond_network_event(uuid,text) to authenticated;

-- Seed useful Alumni Playground/launch feature keys without touching existing choices.
insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind) values
 ('alumni.shared.explorer','discover','released','{}'::uuid[],'alumni'),
 ('alumni.shared.community','connect','released','{}'::uuid[],'alumni'),
 ('alumni.shared.places','discover','released','{}'::uuid[],'alumni')
on conflict(feature_key) do update set vertical_kind='alumni';
insert into public.platform_playground_features(feature_key,enabled) values
 ('alumni.shared.explorer',true),('alumni.shared.community',true),('alumni.shared.places',true)
on conflict(feature_key) do nothing;
