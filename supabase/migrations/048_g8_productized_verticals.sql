-- G8 — Productized verticals: Organizational Intelligence, Business Trust, Franchise
-- Additive after 047. Family/Alumni stores remain unchanged.

-- 1) Activate three new vertical kinds everywhere runtime/rollout depends on vertical identity.
alter table public.networks drop constraint if exists networks_vertical_kind_check;
alter table public.networks add constraint networks_vertical_kind_check check (vertical_kind in ('family','alumni','organization','business-trust','franchise'));
alter table public.network_settings drop constraint if exists network_settings_vertical_kind_check;
alter table public.network_settings add constraint network_settings_vertical_kind_check check (vertical_kind in ('family','alumni','organization','business-trust','franchise'));
alter table public.platform_feature_flags drop constraint if exists platform_feature_flags_vertical_kind_check;
alter table public.platform_feature_flags add constraint platform_feature_flags_vertical_kind_check check(vertical_kind in ('family','alumni','organization','business-trust','franchise'));

-- 2) Durable productized-template settings.
create table if not exists public.productized_network_settings(
 network_id uuid primary key references public.networks(id) on delete cascade,
 template_id varchar(40) not null check(template_id in ('organization','business-trust','franchise')),
 context_label varchar(120) not null,
 context_value varchar(240) not null,
 description text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.productized_network_settings enable row level security;
revoke all on public.productized_network_settings from anon,authenticated;

-- 3) Generic typed relationships over G7 entities.
create table if not exists public.network_entity_relationships(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 from_entity_id uuid not null,
 to_entity_id uuid not null,
 relationship_type varchar(80) not null,
 metadata jsonb not null default '{}'::jsonb,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 check(from_entity_id<>to_entity_id),
 unique(network_id,from_entity_id,to_entity_id,relationship_type),
 constraint fk_network_entity_relationship_from_tenant foreign key(from_entity_id,network_id) references public.network_entities(id,network_id) on delete cascade,
 constraint fk_network_entity_relationship_to_tenant foreign key(to_entity_id,network_id) references public.network_entities(id,network_id) on delete cascade
);
create index if not exists idx_network_entity_relationships_from on public.network_entity_relationships(network_id,from_entity_id);
create index if not exists idx_network_entity_relationships_to on public.network_entity_relationships(network_id,to_entity_id);
alter table public.network_entity_relationships enable row level security;
revoke all on public.network_entity_relationships from anon,authenticated;

-- 4) Generic join codes for productized networks (Family keeps its established family-specific flow).
create table if not exists public.network_join_codes(
 network_id uuid primary key references public.networks(id) on delete cascade,
 code varchar(16) not null unique,
 created_by uuid references auth.users(id) on delete set null,
 updated_at timestamptz not null default now()
);
alter table public.network_join_codes enable row level security;
revoke all on public.network_join_codes from anon,authenticated;

-- 5) Governed member contribution suggestions.
create table if not exists public.network_contributions(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 entity_id uuid,
 message text not null,
 payload jsonb not null default '{}'::jsonb,
 status varchar(20) not null default 'open' check(status in ('open','accepted','rejected')),
 created_by uuid references auth.users(id) on delete set null,
 reviewed_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 reviewed_at timestamptz,
 constraint fk_network_contribution_entity_tenant foreign key(entity_id,network_id) references public.network_entities(id,network_id) on delete cascade
);
create index if not exists idx_network_contributions_open on public.network_contributions(network_id,status,created_at desc);
alter table public.network_contributions enable row level security;
revoke all on public.network_contributions from anon,authenticated;

-- Backend template whitelist helpers. Kept internal; code templates remain UX/source contracts.
create or replace function public.g8_productized_vertical(p_kind text) returns boolean language sql immutable as $$
 select p_kind in ('organization','business-trust','franchise');
$$;
create or replace function public.g8_allowed_entity_kind(p_kind text,p_entity_kind text) returns boolean language sql immutable as $$
 select case p_kind
  when 'organization' then p_entity_kind in ('person','team','project','product','location')
  when 'business-trust' then p_entity_kind in ('person','organization','location','product')
  when 'franchise' then p_entity_kind in ('branch','person','organization','location')
  else false end;
$$;
create or replace function public.g8_allowed_relationship(p_kind text,p_rel text) returns boolean language sql immutable as $$
 select case p_kind
  when 'organization' then p_rel in ('reports_to','works_with','owns','depends_on')
  when 'business-trust' then p_rel in ('recommends','verified_by','supplies_to','worked_with')
  when 'franchise' then p_rel in ('owns','operates','manages','supports')
  else false end;
$$;
revoke all on function public.g8_productized_vertical(text) from public;
revoke all on function public.g8_allowed_entity_kind(text,text) from public;
revoke all on function public.g8_allowed_relationship(text,text) from public;

create or replace function public.g8_seed_productized_structure(p_network uuid,p_kind text) returns void
language plpgsql security definer set search_path=public as $$
begin
 if p_kind='organization' then
  perform public.g7_ensure_dimension(p_network,'region','Region',10); perform public.g7_ensure_dimension(p_network,'business_unit','Business Unit',20); perform public.g7_ensure_dimension(p_network,'department','Department',30); perform public.g7_ensure_dimension(p_network,'team','Team',40); perform public.g7_ensure_dimension(p_network,'project','Project',50); perform public.g7_ensure_dimension(p_network,'skill','Skill / Expertise',60);
  insert into public.network_projections(network_id,projection_key,label,levels,is_default,sort_order) values
   (p_network,'org-structure','Region → Business Unit → Department → Team',array['region','business_unit','department','team'],true,10),
   (p_network,'project-structure','Project → Team → Skill',array['project','team','skill'],false,20),
   (p_network,'expertise-structure','Skill → Department → Team',array['skill','department','team'],false,30)
  on conflict(network_id,projection_key) do update set label=excluded.label,levels=excluded.levels,is_default=excluded.is_default,sort_order=excluded.sort_order;
 elsif p_kind='business-trust' then
  perform public.g7_ensure_dimension(p_network,'region','Region',10); perform public.g7_ensure_dimension(p_network,'category','Business Category',20); perform public.g7_ensure_dimension(p_network,'service','Product / Service',30);
  insert into public.network_projections(network_id,projection_key,label,levels,is_default,sort_order) values
   (p_network,'region-category','Region → Category → Service',array['region','category','service'],true,10),
   (p_network,'category-region','Category → Region',array['category','region'],false,20)
  on conflict(network_id,projection_key) do update set label=excluded.label,levels=excluded.levels,is_default=excluded.is_default,sort_order=excluded.sort_order;
 elsif p_kind='franchise' then
  perform public.g7_ensure_dimension(p_network,'country','Country',10); perform public.g7_ensure_dimension(p_network,'state','State',20); perform public.g7_ensure_dimension(p_network,'city','City',30); perform public.g7_ensure_dimension(p_network,'store_type','Store Type',40); perform public.g7_ensure_dimension(p_network,'owner','Franchise Owner',50);
  insert into public.network_projections(network_id,projection_key,label,levels,is_default,sort_order) values
   (p_network,'geography','Country → State → City → Store Type',array['country','state','city','store_type'],true,10),
   (p_network,'ownership','Owner → State → City',array['owner','state','city'],false,20)
  on conflict(network_id,projection_key) do update set label=excluded.label,levels=excluded.levels,is_default=excluded.is_default,sort_order=excluded.sort_order;
 end if;
end $$;
revoke all on function public.g8_seed_productized_structure(uuid,text) from public;

create or replace function public.create_productized_network(p_vertical_kind text,p_name text,p_context_value text,p_description text default '') returns uuid
language plpgsql security definer set search_path=public as $$
declare v_id uuid; v_slug text; v_base text; v_entity text; v_entities text; v_level text; v_parent text; v_child text; v_peer text; v_context_label text;
begin
 if auth.uid() is null then raise exception 'Sign in required.' using errcode='42501'; end if;
 if not public.g8_productized_vertical(p_vertical_kind) then raise exception 'Unsupported productized network template.' using errcode='22023'; end if;
 if length(trim(coalesce(p_name,'')))<2 then raise exception 'Network name is required.'; end if;
 if length(trim(coalesce(p_context_value,'')))<2 then raise exception 'Network context is required.'; end if;
 v_base:=lower(regexp_replace(trim(p_name),'[^a-zA-Z0-9]+','-','g')); v_base:=trim(both '-' from v_base); if v_base='' then v_base:='network'; end if; v_slug:=v_base;
 while exists(select 1 from public.networks where slug=v_slug) loop v_slug:=v_base||'-'||substr(gen_random_uuid()::text,1,6); end loop;
 if p_vertical_kind='organization' then v_entity:='Person';v_entities:='People';v_level:='Team';v_parent:='Manager';v_child:='Direct report';v_peer:='Colleague';v_context_label:='Organization / company';
 elsif p_vertical_kind='business-trust' then v_entity:='Business';v_entities:='Businesses';v_level:='Category';v_parent:='Recommender';v_child:='Recommended';v_peer:='Partner';v_context_label:='Network purpose / ecosystem';
 else v_entity:='Location';v_entities:='Locations';v_level:='Region';v_parent:='Owner';v_child:='Location';v_peer:='Peer location';v_context_label:='Brand / franchise system'; end if;
 insert into public.networks(name,slug,created_by,vertical_kind) values(trim(p_name),v_slug,auth.uid(),p_vertical_kind) returning id into v_id;
 insert into public.network_memberships(network_id,user_id,role,status) values(v_id,auth.uid(),'owner','active');
 insert into public.network_settings(network_id,id,name,description,entity_label,entity_label_plural,level_label,level_label_plural,parent_label,child_label,peer_label,network_template,vertical_kind)
 values(v_id,'network',trim(p_name),coalesce(p_description,''),v_entity,v_entities,v_level,v_level||'s',v_parent,v_child,v_peer,p_vertical_kind,p_vertical_kind);
 insert into public.productized_network_settings(network_id,template_id,context_label,context_value,description) values(v_id,p_vertical_kind,v_context_label,trim(p_context_value),nullif(trim(coalesce(p_description,'')),''));
 perform public.g8_seed_productized_structure(v_id,p_vertical_kind);
 update public.profiles set active_network_id=v_id,updated_at=now() where id=auth.uid();
 insert into public.audit_log(network_id,actor_id,action,details) values(v_id,auth.uid(),'productized_network_created',jsonb_build_object('vertical_kind',p_vertical_kind,'context',trim(p_context_value)));
 return v_id;
end $$;
revoke all on function public.create_productized_network(text,text,text,text) from public;
grant execute on function public.create_productized_network(text,text,text,text) to authenticated;

create or replace function public.get_productized_network_settings()
returns table(template_id varchar,context_label varchar,context_value varchar,description text)
language sql security definer stable set search_path=public as $$
 select s.template_id,s.context_label,s.context_value,s.description from public.productized_network_settings s where s.network_id=public.current_network_id() and public.is_network_member(s.network_id);
$$;
revoke all on function public.get_productized_network_settings() from public;
grant execute on function public.get_productized_network_settings() to authenticated;

-- Verified-email claiming links a signed-in member to an imported generic entity without changing domain semantics.
create or replace function public.get_my_claimable_productized_entities()
returns table(entity_id uuid,entity_kind varchar,entity_label varchar,network_id uuid,network_name varchar)
language sql security definer stable set search_path=public as $$
 select e.id,e.kind,e.label,e.network_id,n.name
 from public.network_entities e
 join public.networks n on n.id=e.network_id
 join public.network_memberships m on m.network_id=e.network_id and m.user_id=auth.uid() and m.status='active'
 where e.network_id=public.current_network_id()
   and public.g8_productized_vertical(n.vertical_kind)
   and e.owner_user_id is null
   and not exists(select 1 from public.network_entities mine where mine.network_id=e.network_id and mine.owner_user_id=auth.uid())
   and nullif(trim(coalesce(e.metadata->>'email','')),'') is not null
   and lower(trim(e.metadata->>'email'))=lower(trim(coalesce(auth.jwt()->>'email','')))
 order by e.label;
$$;
revoke all on function public.get_my_claimable_productized_entities() from public;
grant execute on function public.get_my_claimable_productized_entities() to authenticated;

create or replace function public.claim_productized_network_entity_by_verified_email(p_entity_id uuid) returns uuid
language plpgsql security definer set search_path=public as $$
declare v_network uuid:=public.current_network_id(); v_owner uuid; v_email text; v_kind text;
begin
 if auth.uid() is null or not public.is_network_member(v_network) then raise exception 'Network membership required.' using errcode='42501'; end if;
 select e.owner_user_id,e.metadata->>'email',n.vertical_kind into v_owner,v_email,v_kind
 from public.network_entities e join public.networks n on n.id=e.network_id
 where e.id=p_entity_id and e.network_id=v_network;
 if not found or not public.g8_productized_vertical(v_kind) then raise exception 'Claimable entity not found.' using errcode='22023'; end if;
 if v_owner is not null and v_owner<>auth.uid() then raise exception 'This entity is already claimed.' using errcode='23505'; end if;
 if exists(select 1 from public.network_entities mine where mine.network_id=v_network and mine.owner_user_id=auth.uid() and mine.id<>p_entity_id) then raise exception 'Your account is already linked to another entity in this network.' using errcode='23505'; end if;
 if lower(trim(coalesce(v_email,'')))<>lower(trim(coalesce(auth.jwt()->>'email',''))) or nullif(trim(coalesce(v_email,'')),'') is null then raise exception 'Verified email does not match this entity.' using errcode='42501'; end if;
 update public.network_entities set owner_user_id=auth.uid(),updated_at=now() where id=p_entity_id and network_id=v_network;
 insert into public.audit_log(network_id,actor_id,action,details) values(v_network,auth.uid(),'productized_entity_claimed',jsonb_build_object('entity_id',p_entity_id));
 return p_entity_id;
end $$;
revoke all on function public.claim_productized_network_entity_by_verified_email(uuid) from public;
grant execute on function public.claim_productized_network_entity_by_verified_email(uuid) to authenticated;

create or replace function public.g8_set_entity_affiliations(p_entity uuid,p_network uuid,p_dimension_key text,p_values jsonb) returns void
language plpgsql security definer set search_path=public as $$
declare v_dim uuid; v_value uuid; v_key text; v_label text; item jsonb;
begin
 select id into v_dim from public.network_dimensions where network_id=p_network and dimension_key=p_dimension_key;
 if v_dim is null then raise exception 'Unknown network dimension: %',p_dimension_key using errcode='22023'; end if;
 if not exists(select 1 from public.network_entities where id=p_entity and network_id=p_network) then raise exception 'Entity does not belong to active network.' using errcode='22023'; end if;
 delete from public.network_entity_affiliations where network_id=p_network and entity_id=p_entity and dimension_id=v_dim;
 if p_values is null or p_values='null'::jsonb then return; end if;
 if jsonb_typeof(p_values)='array' then
  for item in select value from jsonb_array_elements(p_values) loop
   v_label:=trim(both '"' from item::text);
   if nullif(v_label,'') is null then continue; end if;
   v_key:=public.g7_value_key(v_label); if v_key='' then v_key:=md5(v_label); end if;
   insert into public.network_dimension_values(network_id,dimension_id,value_key,label) values(p_network,v_dim,v_key,v_label)
   on conflict(network_id,dimension_id,value_key) do update set label=excluded.label returning id into v_value;
   insert into public.network_entity_affiliations(network_id,entity_id,dimension_id,value_id) values(p_network,p_entity,v_dim,v_value) on conflict do nothing;
  end loop;
 else
  v_label:=trim(both '"' from p_values::text);
  if nullif(v_label,'') is not null then
   v_key:=public.g7_value_key(v_label); if v_key='' then v_key:=md5(v_label); end if;
   insert into public.network_dimension_values(network_id,dimension_id,value_key,label) values(p_network,v_dim,v_key,v_label)
   on conflict(network_id,dimension_id,value_key) do update set label=excluded.label returning id into v_value;
   insert into public.network_entity_affiliations(network_id,entity_id,dimension_id,value_id) values(p_network,p_entity,v_dim,v_value) on conflict do nothing;
  end if;
 end if;
end $$;
revoke all on function public.g8_set_entity_affiliations(uuid,uuid,text,jsonb) from public;

create or replace function public.upsert_productized_network_entity(p_entity_id uuid,p_kind text,p_label text,p_metadata jsonb default '{}'::jsonb,p_affiliations jsonb default '{}'::jsonb,p_visibility text default 'members') returns uuid
language plpgsql security definer set search_path=public as $$
declare v_network uuid:=public.current_network_id(); v_kind text; v_id uuid; pair record;
begin
 select vertical_kind into v_kind from public.networks where id=v_network;
 if not public.g8_productized_vertical(v_kind) then raise exception 'Active network does not use the productized entity runtime.'; end if;
 if p_entity_id is null then
  if not public.is_network_admin(v_network) then raise exception 'Network admin access required.' using errcode='42501'; end if;
 else
  if not public.is_network_admin(v_network) and not exists(select 1 from public.network_entities own where own.id=p_entity_id and own.network_id=v_network and own.owner_user_id=auth.uid()) then raise exception 'You can edit only your claimed entity.' using errcode='42501'; end if;
 end if;
 if not public.g8_allowed_entity_kind(v_kind,p_kind) then raise exception 'Entity kind is not allowed for this network.' using errcode='22023'; end if;
 if length(trim(coalesce(p_label,'')))<2 then raise exception 'Entity name is required.'; end if;
 if p_visibility not in ('members','private') then raise exception 'Invalid visibility.'; end if;
 if p_entity_id is null then
  insert into public.network_entities(network_id,kind,label,metadata,visibility,owner_user_id) values(v_network,p_kind,trim(p_label),coalesce(p_metadata,'{}'),p_visibility,null) returning id into v_id;
 else
  update public.network_entities set kind=p_kind,label=trim(p_label),metadata=coalesce(p_metadata,'{}'),visibility=p_visibility,updated_at=now() where id=p_entity_id and network_id=v_network returning id into v_id;
  if v_id is null then raise exception 'Entity not found.'; end if;
 end if;
 for pair in select key,value from jsonb_each(coalesce(p_affiliations,'{}'::jsonb)) loop
  perform public.g8_set_entity_affiliations(v_id,v_network,pair.key,pair.value);
 end loop;
 return v_id;
end $$;
revoke all on function public.upsert_productized_network_entity(uuid,text,text,jsonb,jsonb,text) from public;
grant execute on function public.upsert_productized_network_entity(uuid,text,text,jsonb,jsonb,text) to authenticated;

create or replace function public.delete_productized_network_entity(p_entity_id uuid) returns void language plpgsql security definer set search_path=public as $$
begin if not public.is_network_admin() then raise exception 'Network admin access required.' using errcode='42501'; end if; delete from public.network_entities where id=p_entity_id and network_id=public.current_network_id(); end $$;
revoke all on function public.delete_productized_network_entity(uuid) from public; grant execute on function public.delete_productized_network_entity(uuid) to authenticated;

create or replace function public.import_productized_network_entities(p_rows jsonb)
returns table(inserted integer,updated integer,skipped integer) language plpgsql security definer set search_path=public as $$
declare r jsonb; v_id uuid; existing_id uuid; i integer:=0;u integer:=0;s integer:=0; v_kind text; v_label text; v_metadata jsonb; v_aff jsonb;
begin
 if not public.is_network_admin() then raise exception 'Network admin access required.' using errcode='42501'; end if;
 if jsonb_typeof(p_rows)<>'array' then raise exception 'Rows must be an array.'; end if;
 for r in select value from jsonb_array_elements(p_rows) loop
  v_label:=trim(coalesce(r->>'label','')); if length(v_label)<2 then s:=s+1; continue; end if;
  v_kind:=coalesce(nullif(r->>'kind',''),(select case vertical_kind when 'organization' then 'person' when 'business-trust' then 'organization' else 'branch' end from public.networks where id=public.current_network_id()));
  v_metadata:=coalesce(r->'metadata','{}'::jsonb); v_aff:=coalesce(r->'affiliations','{}'::jsonb);
  select id into existing_id from public.network_entities where network_id=public.current_network_id() and kind=v_kind and lower(label)=lower(v_label) order by created_at limit 1;
  v_id:=public.upsert_productized_network_entity(existing_id,v_kind,v_label,v_metadata,v_aff,'members');
  if existing_id is null then i:=i+1; else u:=u+1; end if;
 end loop;
 return query select i,u,s;
end $$;
revoke all on function public.import_productized_network_entities(jsonb) from public; grant execute on function public.import_productized_network_entities(jsonb) to authenticated;

create or replace function public.create_productized_network_relationship(p_from_entity_id uuid,p_to_entity_id uuid,p_relationship_type text,p_metadata jsonb default '{}'::jsonb) returns uuid
language plpgsql security definer set search_path=public as $$
declare v_network uuid:=public.current_network_id(); v_kind text; v_id uuid;
begin
 if not public.is_network_admin(v_network) then raise exception 'Network admin access required.' using errcode='42501'; end if;
 select vertical_kind into v_kind from public.networks where id=v_network;
 if not public.g8_allowed_relationship(v_kind,p_relationship_type) then raise exception 'Relationship type is not allowed for this network.' using errcode='22023'; end if;
 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata,created_by) values(v_network,p_from_entity_id,p_to_entity_id,p_relationship_type,coalesce(p_metadata,'{}'),auth.uid()) on conflict(network_id,from_entity_id,to_entity_id,relationship_type) do update set metadata=excluded.metadata,created_by=excluded.created_by returning id into v_id; return v_id;
end $$;
revoke all on function public.create_productized_network_relationship(uuid,uuid,text,jsonb) from public; grant execute on function public.create_productized_network_relationship(uuid,uuid,text,jsonb) to authenticated;

create or replace function public.get_productized_network_relationships()
returns table(id uuid,from_entity_id uuid,to_entity_id uuid,from_label varchar,to_label varchar,relationship_type varchar,relationship_label text,metadata jsonb)
language sql security definer stable set search_path=public as $$
 select r.id,r.from_entity_id,r.to_entity_id,f.label,t.label,r.relationship_type,initcap(replace(r.relationship_type,'_',' ')),r.metadata from public.network_entity_relationships r join public.network_entities f on f.id=r.from_entity_id and f.network_id=r.network_id join public.network_entities t on t.id=r.to_entity_id and t.network_id=r.network_id where r.network_id=public.current_network_id() and public.is_network_member(r.network_id) order by f.label,t.label;
$$;
revoke all on function public.get_productized_network_relationships() from public; grant execute on function public.get_productized_network_relationships() to authenticated;

create or replace function public.delete_productized_network_relationship(p_relationship_id uuid) returns void language plpgsql security definer set search_path=public as $$ begin if not public.is_network_admin() then raise exception 'Network admin access required.' using errcode='42501'; end if; delete from public.network_entity_relationships where id=p_relationship_id and network_id=public.current_network_id(); end $$;
revoke all on function public.delete_productized_network_relationship(uuid) from public; grant execute on function public.delete_productized_network_relationship(uuid) to authenticated;

create or replace function public.g8_generate_join_code() returns text language plpgsql volatile as $$ declare c text; begin loop c:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)); exit when not exists(select 1 from public.network_join_codes where code=c); end loop; return c; end $$;
revoke all on function public.g8_generate_join_code() from public;
create or replace function public.get_or_create_network_join_code() returns text language plpgsql security definer set search_path=public as $$ declare nid uuid:=public.current_network_id();c text; begin if not public.is_network_admin(nid) then raise exception 'Network admin access required.' using errcode='42501'; end if; if not public.g8_productized_vertical((select vertical_kind from public.networks where id=nid)) then raise exception 'Generic join code is not used by this vertical.'; end if; select code into c from public.network_join_codes where network_id=nid; if c is null then c:=public.g8_generate_join_code();insert into public.network_join_codes(network_id,code,created_by) values(nid,c,auth.uid());end if; return c; end $$;
revoke all on function public.get_or_create_network_join_code() from public; grant execute on function public.get_or_create_network_join_code() to authenticated;
create or replace function public.regenerate_network_join_code() returns text language plpgsql security definer set search_path=public as $$ declare nid uuid:=public.current_network_id();c text; begin if not public.is_network_admin(nid) then raise exception 'Network admin access required.' using errcode='42501'; end if;c:=public.g8_generate_join_code();insert into public.network_join_codes(network_id,code,created_by,updated_at) values(nid,c,auth.uid(),now()) on conflict(network_id) do update set code=excluded.code,created_by=excluded.created_by,updated_at=now();return c;end $$;
revoke all on function public.regenerate_network_join_code() from public; grant execute on function public.regenerate_network_join_code() to authenticated;
create or replace function public.join_productized_network_by_code(p_code text) returns uuid language plpgsql security definer set search_path=public as $$ declare nid uuid; begin if auth.uid() is null then raise exception 'Sign in required.' using errcode='42501'; end if;select j.network_id into nid from public.network_join_codes j join public.networks n on n.id=j.network_id where upper(j.code)=upper(trim(p_code)) and public.g8_productized_vertical(n.vertical_kind) and n.status='active';if nid is null then raise exception 'Network code not found.';end if;insert into public.network_memberships(network_id,user_id,role,status) values(nid,auth.uid(),'member','active') on conflict(network_id,user_id) do update set status='active';update public.profiles set active_network_id=nid,updated_at=now() where id=auth.uid();return nid;end $$;
revoke all on function public.join_productized_network_by_code(text) from public; grant execute on function public.join_productized_network_by_code(text) to authenticated;

-- Admin membership management for released productized networks.
create or replace function public.get_productized_network_memberships()
returns table(user_id uuid,email text,role varchar,status varchar,entity_label varchar,joined_at timestamptz)
language sql security definer stable set search_path=public as $$
 select m.user_id,u.email::text,m.role,m.status,e.label,m.created_at
 from public.network_memberships m
 left join auth.users u on u.id=m.user_id
 left join public.network_entities e on e.network_id=m.network_id and e.owner_user_id=m.user_id
 where m.network_id=public.current_network_id() and public.is_network_admin(m.network_id)
   and public.g8_productized_vertical((select n.vertical_kind from public.networks n where n.id=m.network_id))
 order by case m.role when 'owner' then 0 when 'admin' then 1 else 2 end,coalesce(e.label,u.email::text);
$$;
revoke all on function public.get_productized_network_memberships() from public;
grant execute on function public.get_productized_network_memberships() to authenticated;

create or replace function public.set_productized_network_member_role(p_user_id uuid,p_role text) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); actor_role text; target_role text;
begin
 if not public.g8_productized_vertical((select vertical_kind from public.networks where id=nid)) then raise exception 'Productized network required.' using errcode='42501'; end if;
 select role into actor_role from public.network_memberships where network_id=nid and user_id=auth.uid() and status='active';
 if actor_role<>'owner' then raise exception 'Only the network owner can change admin roles.' using errcode='42501'; end if;
 if p_user_id=auth.uid() then raise exception 'The owner role cannot be changed here.' using errcode='42501'; end if;
 if p_role not in ('admin','member') then raise exception 'Invalid member role.' using errcode='22023'; end if;
 select role into target_role from public.network_memberships where network_id=nid and user_id=p_user_id and status='active';
 if target_role is null or target_role='owner' then raise exception 'Target member cannot be changed.' using errcode='22023'; end if;
 update public.network_memberships set role=p_role where network_id=nid and user_id=p_user_id;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'productized_member_role_changed',jsonb_build_object('user_id',p_user_id,'role',p_role));
end $$;
revoke all on function public.set_productized_network_member_role(uuid,text) from public;
grant execute on function public.set_productized_network_member_role(uuid,text) to authenticated;

create or replace function public.remove_productized_network_member(p_user_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); actor_role text; target_role text;
begin
 if not public.g8_productized_vertical((select vertical_kind from public.networks where id=nid)) then raise exception 'Productized network required.' using errcode='42501'; end if;
 select role into actor_role from public.network_memberships where network_id=nid and user_id=auth.uid() and status='active';
 if actor_role not in ('owner','admin') then raise exception 'Network admin access required.' using errcode='42501'; end if;
 if p_user_id=auth.uid() then raise exception 'Use the network switcher/lobby to leave your own network.' using errcode='42501'; end if;
 select role into target_role from public.network_memberships where network_id=nid and user_id=p_user_id and status='active';
 if target_role is null or target_role='owner' then raise exception 'The network owner cannot be removed.' using errcode='42501'; end if;
 if target_role='admin' and actor_role<>'owner' then raise exception 'Only the owner can remove an admin.' using errcode='42501'; end if;
 update public.network_memberships set status='left' where network_id=nid and user_id=p_user_id;
 update public.network_entities set owner_user_id=null,updated_at=now() where network_id=nid and owner_user_id=p_user_id;
 update public.profiles set active_network_id=null,updated_at=now() where id=p_user_id and active_network_id=nid;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'productized_member_removed',jsonb_build_object('user_id',p_user_id,'previous_role',target_role));
end $$;
revoke all on function public.remove_productized_network_member(uuid) from public;
grant execute on function public.remove_productized_network_member(uuid) to authenticated;

create or replace function public.submit_productized_network_contribution(p_entity_id uuid,p_message text,p_payload jsonb default '{}'::jsonb) returns uuid language plpgsql security definer set search_path=public as $$ declare nid uuid:=public.current_network_id();v_id uuid; begin if not public.is_network_member(nid) then raise exception 'Membership required.' using errcode='42501';end if;if length(trim(coalesce(p_message,'')))<3 then raise exception 'Please add a useful note.';end if;if p_entity_id is not null and not exists(select 1 from public.network_entities where id=p_entity_id and network_id=nid) then raise exception 'Entity not found.';end if;insert into public.network_contributions(network_id,entity_id,message,payload,created_by) values(nid,p_entity_id,trim(p_message),coalesce(p_payload,'{}'),auth.uid()) returning id into v_id;return v_id;end $$;
revoke all on function public.submit_productized_network_contribution(uuid,text,jsonb) from public;grant execute on function public.submit_productized_network_contribution(uuid,text,jsonb) to authenticated;
create or replace function public.get_productized_network_contributions() returns table(id uuid,entity_id uuid,entity_label varchar,message text,payload jsonb,status varchar,created_at timestamptz,created_by uuid) language sql security definer stable set search_path=public as $$ select c.id,c.entity_id,e.label,c.message,c.payload,c.status,c.created_at,c.created_by from public.network_contributions c left join public.network_entities e on e.id=c.entity_id and e.network_id=c.network_id where c.network_id=public.current_network_id() and (c.created_by=auth.uid() or public.is_network_admin(c.network_id)) order by c.created_at desc; $$;
revoke all on function public.get_productized_network_contributions() from public;grant execute on function public.get_productized_network_contributions() to authenticated;
create or replace function public.review_productized_network_contribution(p_contribution_id uuid,p_action text) returns void language plpgsql security definer set search_path=public as $$ begin if not public.is_network_admin() then raise exception 'Network admin access required.' using errcode='42501';end if;if p_action not in ('accepted','rejected') then raise exception 'Invalid action.';end if;update public.network_contributions set status=p_action,reviewed_by=auth.uid(),reviewed_at=now() where id=p_contribution_id and network_id=public.current_network_id();end $$;
revoke all on function public.review_productized_network_contribution(uuid,text) from public;grant execute on function public.review_productized_network_contribution(uuid,text) to authenticated;

-- 6) Expand G7 read API with metadata/ownership for generic directories.
drop function if exists public.get_network_affiliated_entities();
create function public.get_network_affiliated_entities()
returns table(entity_id uuid,external_ref uuid,entity_kind varchar,entity_label varchar,owner_user_id uuid,metadata jsonb,visibility varchar,affiliations jsonb)
language sql security definer stable set search_path=public as $$
 select e.id,e.external_ref,e.kind,e.label,e.owner_user_id,e.metadata,e.visibility,
 coalesce((select jsonb_object_agg(x.dimension_key,x.labels) from (select d.dimension_key,jsonb_agg(v.label order by v.label) labels from public.network_entity_affiliations a join public.network_dimensions d on d.id=a.dimension_id and d.network_id=a.network_id join public.network_dimension_values v on v.id=a.value_id and v.network_id=a.network_id where a.entity_id=e.id and a.network_id=e.network_id group by d.dimension_key)x),'{}'::jsonb)
 from public.network_entities e where e.network_id=public.current_network_id() and public.is_network_member(e.network_id) and (e.visibility='members' or e.owner_user_id=auth.uid() or public.is_network_admin(e.network_id)) order by e.label;
$$;
revoke all on function public.get_network_affiliated_entities() from public; grant execute on function public.get_network_affiliated_entities() to authenticated;

-- 7) Vertical-aware feature visibility now filters to the active vertical.
drop function if exists public.get_effective_platform_features();
create function public.get_effective_platform_features() returns table(feature_key varchar,rollout_state varchar,enabled boolean)
language sql security definer stable set search_path=public as $$
 select f.feature_key,f.rollout_state,(case f.rollout_state when 'released' then true when 'test' then public.is_platform_owner() when 'pilot' then public.is_platform_owner() or coalesce(public.current_network_id()=any(f.pilot_network_ids),false) else false end and case when f.bundle_key='admin' then true else coalesce(s.enabled,true) end)
 from public.platform_feature_flags f left join public.network_feature_settings s on s.network_id=public.current_network_id() and s.feature_key=f.feature_key
 where f.vertical_kind=coalesce((select n.vertical_kind from public.networks n where n.id=public.current_network_id()),'family') order by f.bundle_key,f.feature_key;
$$;
revoke all on function public.get_effective_platform_features() from public;grant execute on function public.get_effective_platform_features() to authenticated;

-- 8) Launch control supports all active product verticals.
create or replace function public.get_platform_vertical_launch_console(p_vertical_kind varchar)
returns table(feature_key varchar,bundle_key varchar,rollout_state varchar,pilot_network_ids uuid[],announcement_version integer,updated_at timestamptz)
language plpgsql security definer stable set search_path=public as $$ begin if not public.is_platform_owner() then raise exception 'Platform owner access is required.' using errcode='42501';end if;if p_vertical_kind not in ('family','alumni','organization','business-trust','franchise') then raise exception 'Unknown vertical.' using errcode='22023';end if;return query select f.feature_key,f.bundle_key,f.rollout_state,f.pilot_network_ids,f.announcement_version,f.updated_at from public.platform_feature_flags f where f.vertical_kind=p_vertical_kind order by f.bundle_key,f.feature_key;end $$;
revoke all on function public.get_platform_vertical_launch_console(varchar) from public;grant execute on function public.get_platform_vertical_launch_console(varchar) to authenticated;
create or replace function public.set_platform_vertical_bundle_rollout(p_vertical_kind varchar,p_bundle_key varchar,p_rollout_state varchar,p_pilot_network_ids uuid[] default '{}',p_announce boolean default false) returns integer language plpgsql security definer set search_path=public as $$ declare v_count integer;begin if not public.is_platform_owner() then raise exception 'Platform owner access is required.' using errcode='42501';end if;if p_vertical_kind not in ('family','alumni','organization','business-trust','franchise') then raise exception 'Unknown vertical.' using errcode='22023';end if;if p_rollout_state not in ('hidden','test','pilot','released') then raise exception 'Invalid rollout state.';end if;update public.platform_feature_flags set rollout_state=p_rollout_state,pilot_network_ids=case when p_rollout_state='pilot' then coalesce(p_pilot_network_ids,'{}') else '{}'::uuid[] end,announcement_version=case when p_announce then announcement_version+1 else announcement_version end,updated_by=auth.uid(),updated_at=now() where vertical_kind=p_vertical_kind and bundle_key=p_bundle_key;get diagnostics v_count=row_count;return v_count;end $$;
revoke all on function public.set_platform_vertical_bundle_rollout(varchar,varchar,varchar,uuid[],boolean) from public;grant execute on function public.set_platform_vertical_bundle_rollout(varchar,varchar,varchar,uuid[],boolean) to authenticated;

-- Feature catalogs for the three new released verticals.
insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind) values
 ('organization.core.home','core','released','{}'::uuid[],'organization'),('organization.shared.explorer','discover','released','{}'::uuid[],'organization'),('organization.core.directory','discover','released','{}'::uuid[],'organization'),('organization.shared.community','community','released','{}'::uuid[],'organization'),('organization.shared.places','discover','released','{}'::uuid[],'organization'),('organization.core.connections','connect','released','{}'::uuid[],'organization'),('organization.shared.contribute','contribute','released','{}'::uuid[],'organization'),('organization.admin.manage','admin','released','{}'::uuid[],'organization'),('organization.admin.import','admin','released','{}'::uuid[],'organization'),
 ('business-trust.core.home','core','released','{}'::uuid[],'business-trust'),('business-trust.shared.explorer','discover','released','{}'::uuid[],'business-trust'),('business-trust.core.directory','discover','released','{}'::uuid[],'business-trust'),('business-trust.shared.community','community','released','{}'::uuid[],'business-trust'),('business-trust.shared.places','discover','released','{}'::uuid[],'business-trust'),('business-trust.core.connections','connect','released','{}'::uuid[],'business-trust'),('business-trust.shared.contribute','contribute','released','{}'::uuid[],'business-trust'),('business-trust.admin.manage','admin','released','{}'::uuid[],'business-trust'),('business-trust.admin.import','admin','released','{}'::uuid[],'business-trust'),
 ('franchise.core.home','core','released','{}'::uuid[],'franchise'),('franchise.shared.explorer','discover','released','{}'::uuid[],'franchise'),('franchise.core.directory','discover','released','{}'::uuid[],'franchise'),('franchise.shared.community','community','released','{}'::uuid[],'franchise'),('franchise.shared.places','discover','released','{}'::uuid[],'franchise'),('franchise.core.connections','connect','released','{}'::uuid[],'franchise'),('franchise.shared.contribute','contribute','released','{}'::uuid[],'franchise'),('franchise.admin.manage','admin','released','{}'::uuid[],'franchise'),('franchise.admin.import','admin','released','{}'::uuid[],'franchise')
on conflict(feature_key) do update set vertical_kind=excluded.vertical_kind,bundle_key=excluded.bundle_key;
insert into public.platform_playground_features(feature_key,enabled)
select feature_key,case when bundle_key='admin' then false else true end from public.platform_feature_flags where vertical_kind in ('organization','business-trust','franchise') on conflict(feature_key) do nothing;
