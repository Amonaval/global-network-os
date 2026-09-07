-- FCA-0 — Family Community / Cultural Association foundation
-- Adds a precise family-centric association vertical while leaving generic Association unchanged.

alter table public.networks drop constraint if exists networks_vertical_kind_check;
alter table public.networks add constraint networks_vertical_kind_check check (vertical_kind in ('family','alumni','association','family-association','organization','business-trust','franchise','professional'));
alter table public.network_settings drop constraint if exists network_settings_vertical_kind_check;
alter table public.network_settings add constraint network_settings_vertical_kind_check check (vertical_kind in ('family','alumni','association','family-association','organization','business-trust','franchise','professional'));
alter table public.platform_feature_flags drop constraint if exists platform_feature_flags_vertical_kind_check;
alter table public.platform_feature_flags add constraint platform_feature_flags_vertical_kind_check check(vertical_kind in ('family','alumni','association','family-association','organization','business-trust','franchise','professional'));
alter table public.productized_network_settings drop constraint if exists productized_network_settings_template_id_check;
alter table public.productized_network_settings add constraint productized_network_settings_template_id_check check(template_id in ('association','family-association','organization','business-trust','franchise','professional'));

create or replace function public.g8_productized_vertical(p_kind text) returns boolean language sql immutable as $$
 select p_kind in ('association','family-association','organization','business-trust','franchise','professional');
$$;

create or replace function public.g8_allowed_entity_kind(p_kind text,p_entity_kind text) returns boolean language sql immutable as $$
 select case p_kind
  when 'association' then p_entity_kind in ('household','person','committee','organization','location')
  when 'family-association' then p_entity_kind in ('family','person','committee','organization','location')
  when 'organization' then p_entity_kind in ('person','team','project','product','location')
  when 'business-trust' then p_entity_kind in ('person','organization','location','product')
  when 'franchise' then p_entity_kind in ('branch','person','organization','location')
  when 'professional' then p_entity_kind in ('person','organization','location') else false end;
$$;

create or replace function public.g8_allowed_relationship(p_kind text,p_rel text) returns boolean language sql immutable as $$
 select case p_kind
  when 'association' then p_rel in ('represented_by','member_of_household','spouse_of','parent_of','serves_on','supports')
  when 'family-association' then p_rel in ('represented_by','member_of_family','spouse_of','parent_of','serves_on','supports')
  when 'organization' then p_rel in ('reports_to','works_with','owns','depends_on')
  when 'business-trust' then p_rel in ('recommends','verified_by','supplies_to','worked_with')
  when 'franchise' then p_rel in ('owns','operates','manages','supports')
  when 'professional' then p_rel in ('worked_with','referred_by','collaborates_with','mentors') else false end;
$$;

create or replace function public.g8_seed_productized_structure(p_network uuid,p_kind text) returns void
language plpgsql security definer set search_path=public as $$
begin
 if p_kind='family-association' then
  perform public.g7_ensure_dimension(p_network,'membership_year','Membership Year',10);
  perform public.g7_ensure_dimension(p_network,'membership_status','Membership Status',20);
  perform public.g7_ensure_dimension(p_network,'chapter','Chapter',30);
  perform public.g7_ensure_dimension(p_network,'city','City',40);
  perform public.g7_ensure_dimension(p_network,'area','Area / Locality',50);
  perform public.g7_ensure_dimension(p_network,'profession','Profession',60);
  perform public.g7_ensure_dimension(p_network,'committee','Committee / Role',70);
  perform public.g7_ensure_dimension(p_network,'interest','Interest / Activity',80);
  insert into public.network_projections(network_id,projection_key,label,levels,is_default,sort_order) values
   (p_network,'families','Chapter → Family',array['chapter','membership_status'],true,10),
   (p_network,'renewal','Membership Year → Status',array['membership_year','membership_status'],false,20),
   (p_network,'area','City → Area',array['city','area'],false,30),
   (p_network,'profession','Profession → Area',array['profession','area'],false,40),
   (p_network,'committee','Committee → Chapter',array['committee','chapter'],false,50)
  on conflict(network_id,projection_key) do update set label=excluded.label,levels=excluded.levels,is_default=excluded.is_default,sort_order=excluded.sort_order;
 elsif p_kind='association' then
  perform public.g7_ensure_dimension(p_network,'membership_year','Membership Year',10);
  perform public.g7_ensure_dimension(p_network,'membership_status','Membership Status',20);
  perform public.g7_ensure_dimension(p_network,'chapter','Chapter',30);
  perform public.g7_ensure_dimension(p_network,'city','City',40);
  perform public.g7_ensure_dimension(p_network,'committee','Committee / Role',50);
  perform public.g7_ensure_dimension(p_network,'interest','Interest / Activity',60);
  insert into public.network_projections(network_id,projection_key,label,levels,is_default,sort_order) values
   (p_network,'households','Chapter → Household',array['chapter','membership_status'],true,10),
   (p_network,'renewal','Membership Year → Status',array['membership_year','membership_status'],false,20),
   (p_network,'committee','Committee → Chapter',array['committee','chapter'],false,30),
   (p_network,'city','City → Chapter',array['city','chapter'],false,40)
  on conflict(network_id,projection_key) do update set label=excluded.label,levels=excluded.levels,is_default=excluded.is_default,sort_order=excluded.sort_order;
 elsif p_kind='organization' then
  perform public.g7_ensure_dimension(p_network,'region','Region',10); perform public.g7_ensure_dimension(p_network,'business_unit','Business Unit',20); perform public.g7_ensure_dimension(p_network,'department','Department',30); perform public.g7_ensure_dimension(p_network,'team','Team',40); perform public.g7_ensure_dimension(p_network,'project','Project',50); perform public.g7_ensure_dimension(p_network,'skill','Skill / Expertise',60);
  insert into public.network_projections(network_id,projection_key,label,levels,is_default,sort_order) values
   (p_network,'org-structure','Region → Business Unit → Department → Team',array['region','business_unit','department','team'],true,10),(p_network,'project-structure','Project → Team → Skill',array['project','team','skill'],false,20),(p_network,'expertise-structure','Skill → Department → Team',array['skill','department','team'],false,30)
  on conflict(network_id,projection_key) do update set label=excluded.label,levels=excluded.levels,is_default=excluded.is_default,sort_order=excluded.sort_order;
 elsif p_kind='business-trust' then
  perform public.g7_ensure_dimension(p_network,'region','Region',10); perform public.g7_ensure_dimension(p_network,'category','Business Category',20); perform public.g7_ensure_dimension(p_network,'service','Product / Service',30);
  insert into public.network_projections(network_id,projection_key,label,levels,is_default,sort_order) values (p_network,'region-category','Region → Category → Service',array['region','category','service'],true,10),(p_network,'category-region','Category → Region',array['category','region'],false,20)
  on conflict(network_id,projection_key) do update set label=excluded.label,levels=excluded.levels,is_default=excluded.is_default,sort_order=excluded.sort_order;
 elsif p_kind='franchise' then
  perform public.g7_ensure_dimension(p_network,'country','Country',10); perform public.g7_ensure_dimension(p_network,'state','State',20); perform public.g7_ensure_dimension(p_network,'city','City',30); perform public.g7_ensure_dimension(p_network,'store_type','Store Type',40); perform public.g7_ensure_dimension(p_network,'owner','Franchise Owner',50);
  insert into public.network_projections(network_id,projection_key,label,levels,is_default,sort_order) values (p_network,'geography','Country → State → City → Store Type',array['country','state','city','store_type'],true,10),(p_network,'ownership','Owner → State → City',array['owner','state','city'],false,20)
  on conflict(network_id,projection_key) do update set label=excluded.label,levels=excluded.levels,is_default=excluded.is_default,sort_order=excluded.sort_order;
 elsif p_kind='professional' then
  perform public.g7_ensure_dimension(p_network,'profession','Profession',10); perform public.g7_ensure_dimension(p_network,'specialty','Specialty / Expertise',20); perform public.g7_ensure_dimension(p_network,'industry','Industry',30); perform public.g7_ensure_dimension(p_network,'service','Service',40); perform public.g7_ensure_dimension(p_network,'country','Country',50); perform public.g7_ensure_dimension(p_network,'city','City',60); perform public.g7_ensure_dimension(p_network,'credential','Credential / Qualification',70);
  insert into public.network_projections(network_id,projection_key,label,levels,is_default,sort_order) values (p_network,'expertise-location','Expertise → Country → City',array['specialty','country','city'],true,10),(p_network,'profession-service','Profession → Service → Specialty',array['profession','service','specialty'],false,20),(p_network,'industry-expertise','Industry → Expertise → City',array['industry','specialty','city'],false,30)
  on conflict(network_id,projection_key) do update set label=excluded.label,levels=excluded.levels,is_default=excluded.is_default,sort_order=excluded.sort_order;
 end if;
end $$;

create or replace function public.create_productized_network(p_vertical_kind text,p_name text,p_context_value text,p_description text default '') returns uuid
language plpgsql security definer set search_path=public as $$
declare v_id uuid;v_slug text;v_base text;v_entity text;v_entities text;v_level text;v_parent text;v_child text;v_peer text;v_context_label text;
begin
 if auth.uid() is null then raise exception 'Sign in required.' using errcode='42501';end if;
 if not public.g8_productized_vertical(p_vertical_kind) then raise exception 'Unsupported productized network template.' using errcode='22023';end if;
 if length(trim(coalesce(p_name,'')))<2 or length(trim(coalesce(p_context_value,'')))<2 then raise exception 'Network name and context are required.';end if;
 v_base:=lower(regexp_replace(trim(p_name),'[^a-zA-Z0-9]+','-','g'));v_base:=trim(both '-' from v_base);if v_base='' then v_base:='network';end if;v_slug:=v_base;
 while exists(select 1 from public.networks where slug=v_slug) loop v_slug:=v_base||'-'||substr(gen_random_uuid()::text,1,6);end loop;
 if p_vertical_kind='family-association' then v_entity:='Family';v_entities:='Families';v_level:='Membership Year';v_parent:='Representative';v_child:='Family Member';v_peer:='Community member';v_context_label:='Chapter / community';
 elsif p_vertical_kind='association' then v_entity:='Family / Household';v_entities:='Families / Households';v_level:='Membership';v_parent:='Representative';v_child:='Member';v_peer:='Community peer';v_context_label:='Association / chapter';
 elsif p_vertical_kind='organization' then v_entity:='Person';v_entities:='People';v_level:='Team';v_parent:='Manager';v_child:='Direct report';v_peer:='Colleague';v_context_label:='Organization / company';
 elsif p_vertical_kind='business-trust' then v_entity:='Business';v_entities:='Businesses';v_level:='Category';v_parent:='Recommender';v_child:='Recommended';v_peer:='Partner';v_context_label:='Network purpose / ecosystem';
 elsif p_vertical_kind='franchise' then v_entity:='Location';v_entities:='Locations';v_level:='Region';v_parent:='Owner';v_child:='Location';v_peer:='Peer location';v_context_label:='Brand / franchise system';
 else v_entity:='Professional';v_entities:='Professionals';v_level:='Expertise';v_parent:='Referrer';v_child:='Referred professional';v_peer:='Collaborator';v_context_label:='Association / professional community';end if;
 insert into public.networks(name,slug,created_by,vertical_kind) values(trim(p_name),v_slug,auth.uid(),p_vertical_kind) returning id into v_id;
 insert into public.network_memberships(network_id,user_id,role,status) values(v_id,auth.uid(),'owner','active');
 insert into public.network_settings(network_id,id,name,description,entity_label,entity_label_plural,level_label,level_label_plural,parent_label,child_label,peer_label,network_template,vertical_kind) values(v_id,'network',trim(p_name),coalesce(p_description,''),v_entity,v_entities,v_level,v_level||'s',v_parent,v_child,v_peer,p_vertical_kind,p_vertical_kind);
 insert into public.productized_network_settings(network_id,template_id,context_label,context_value,description) values(v_id,p_vertical_kind,v_context_label,trim(p_context_value),nullif(trim(coalesce(p_description,'')),''));
 perform public.g8_seed_productized_structure(v_id,p_vertical_kind);update public.profiles set active_network_id=v_id,updated_at=now() where id=auth.uid();
 insert into public.audit_log(network_id,actor_id,action,details) values(v_id,auth.uid(),'productized_network_created',jsonb_build_object('vertical_kind',p_vertical_kind,'context',trim(p_context_value)));return v_id;
end $$;

-- Family-association features: ordinary member UX is intentionally lean; intelligence/advanced features are not seeded.
insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind) values
 ('family-association.core.home','core','released','{}'::uuid[],'family-association'),
 ('family-association.core.me','core','released','{}'::uuid[],'family-association'),
 ('family-association.core.membership','core','released','{}'::uuid[],'family-association'),
 ('family-association.shared.explorer','discover','released','{}'::uuid[],'family-association'),
 ('family-association.core.directory','discover','released','{}'::uuid[],'family-association'),
 ('family-association.shared.community','community','released','{}'::uuid[],'family-association'),
 ('family-association.community.our-year','community','released','{}'::uuid[],'family-association'),
 ('family-association.core.connections','connect','released','{}'::uuid[],'family-association'),
 ('family-association.shared.contribute','contribute','released','{}'::uuid[],'family-association'),
 ('family-association.admin.manage','admin','released','{}'::uuid[],'family-association'),
 ('family-association.admin.import','admin','released','{}'::uuid[],'family-association'),
 ('family-association.admin.governance','admin','released','{}'::uuid[],'family-association'),
 ('family-association.admin.finance','admin','test','{}'::uuid[],'family-association')
on conflict(feature_key) do update set bundle_key=excluded.bundle_key,rollout_state=excluded.rollout_state,vertical_kind=excluded.vertical_kind;
insert into public.platform_playground_features(feature_key,enabled)
select feature_key,case when bundle_key='admin' then false else true end from public.platform_feature_flags where vertical_kind='family-association'
on conflict(feature_key) do update set enabled=excluded.enabled;

-- Reuse the proven household co-admin machinery for both household-based association forms.
create or replace function public.can_manage_association_household(p_household_id uuid,p_user_id uuid default auth.uid()) returns boolean
language sql security definer stable set search_path=public as $$
 select exists(select 1 from public.network_entities h join public.networks n on n.id=h.network_id where h.id=p_household_id and ((n.vertical_kind='association' and h.kind='household') or (n.vertical_kind='family-association' and h.kind='family')) and h.network_id=public.current_network_id() and public.is_network_member(h.network_id) and (public.is_network_admin(h.network_id) or exists(select 1 from public.association_household_admins a where a.network_id=h.network_id and a.household_entity_id=h.id and a.user_id=p_user_id) or exists(select 1 from public.network_entity_relationships r join public.network_entities person on person.id=r.to_entity_id and person.network_id=r.network_id where r.network_id=h.network_id and r.from_entity_id=h.id and r.relationship_type='represented_by' and person.owner_user_id=p_user_id)));
$$;

create or replace function public.get_my_association_household_admin_context()
returns table(household_id uuid,household_label varchar,can_manage boolean,user_id uuid,entity_label varchar,is_household_admin boolean,is_representative boolean)
language sql security definer stable set search_path=public as $$
 with me as (select e.id person_id,e.network_id from public.network_entities e where e.network_id=public.current_network_id() and e.owner_user_id=auth.uid() and e.kind='person' limit 1),
 household as (select h.id,h.label,h.network_id from me join public.network_entity_relationships r on r.network_id=me.network_id and r.from_entity_id=me.person_id and r.relationship_type in ('member_of_household','member_of_family') join public.network_entities h on h.id=r.to_entity_id and h.network_id=r.network_id and h.kind in ('household','family') limit 1),
 people as (select p.id,p.label,p.owner_user_id from household h join public.network_entity_relationships r on r.network_id=h.network_id and r.to_entity_id=h.id and r.relationship_type in ('member_of_household','member_of_family') join public.network_entities p on p.id=r.from_entity_id and p.network_id=r.network_id and p.kind='person')
 select h.id,h.label,public.can_manage_association_household(h.id,auth.uid()),p.owner_user_id,p.label,exists(select 1 from public.association_household_admins a where a.network_id=h.network_id and a.household_entity_id=h.id and a.user_id=p.owner_user_id),exists(select 1 from public.network_entity_relationships rr where rr.network_id=h.network_id and rr.from_entity_id=h.id and rr.to_entity_id=p.id and rr.relationship_type='represented_by') from household h join people p on p.owner_user_id is not null where public.is_network_member(h.network_id) order by 7 desc,p.label;
$$;

create or replace function public.set_association_household_admin(p_household_id uuid,p_user_id uuid,p_enabled boolean) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
 if not public.can_manage_association_household(p_household_id,auth.uid()) then raise exception 'Family manager access required.' using errcode='42501';end if;
 if not exists(select 1 from public.network_entities p join public.network_entity_relationships r on r.network_id=p.network_id and r.from_entity_id=p.id and r.to_entity_id=p_household_id and r.relationship_type in ('member_of_household','member_of_family') where p.network_id=nid and p.owner_user_id=p_user_id and p.kind='person') then raise exception 'Co-admin must be a claimed member of this family.' using errcode='22023';end if;
 if p_enabled then insert into public.association_household_admins(network_id,household_entity_id,user_id,granted_by) values(nid,p_household_id,p_user_id,auth.uid()) on conflict do nothing;else delete from public.association_household_admins where network_id=nid and household_entity_id=p_household_id and user_id=p_user_id;end if;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'family_association_coadmin_changed',jsonb_build_object('family_id',p_household_id,'user_id',p_user_id,'enabled',p_enabled));
end $$;

-- Launch Control must recognize the new vertical, but advanced capabilities remain absent/hidden from its ordinary composition.
create or replace function public.get_platform_vertical_launch_console(p_vertical_kind varchar)
returns table(feature_key varchar,bundle_key varchar,rollout_state varchar,pilot_network_ids uuid[],announcement_version integer,updated_at timestamptz)
language plpgsql security definer stable set search_path=public as $$ begin if not public.is_platform_owner() then raise exception 'Platform owner access is required.' using errcode='42501';end if;if p_vertical_kind not in ('family','alumni','association','family-association','organization','business-trust','franchise','professional') then raise exception 'Unknown vertical.' using errcode='22023';end if;return query select f.feature_key,f.bundle_key,f.rollout_state,f.pilot_network_ids,f.announcement_version,f.updated_at from public.platform_feature_flags f where f.vertical_kind=p_vertical_kind order by f.bundle_key,f.feature_key;end $$;
create or replace function public.set_platform_vertical_bundle_rollout(p_vertical_kind varchar,p_bundle_key varchar,p_rollout_state varchar,p_pilot_network_ids uuid[] default '{}',p_announce boolean default false) returns integer language plpgsql security definer set search_path=public as $$ declare v_count integer;begin if not public.is_platform_owner() then raise exception 'Platform owner access is required.' using errcode='42501';end if;if p_vertical_kind not in ('family','alumni','association','family-association','organization','business-trust','franchise','professional') then raise exception 'Unknown vertical.' using errcode='22023';end if;if p_rollout_state not in ('hidden','test','pilot','released') then raise exception 'Invalid rollout state.';end if;update public.platform_feature_flags set rollout_state=p_rollout_state,pilot_network_ids=case when p_rollout_state='pilot' then coalesce(p_pilot_network_ids,'{}') else '{}'::uuid[] end,announcement_version=case when p_announce then announcement_version+1 else announcement_version end,updated_by=auth.uid(),updated_at=now() where vertical_kind=p_vertical_kind and bundle_key=p_bundle_key;get diagnostics v_count=row_count;return v_count;end $$;

-- Extend productized edit permissions to family-association family co-admins.
create or replace function public.upsert_productized_network_entity(p_entity_id uuid,p_kind text,p_label text,p_metadata jsonb default '{}'::jsonb,p_affiliations jsonb default '{}'::jsonb,p_visibility text default 'members') returns uuid
language plpgsql security definer set search_path=public as $$
declare v_network uuid:=public.current_network_id();v_kind text;v_id uuid;pair record;v_family uuid;v_allowed boolean:=false;
begin
 select vertical_kind into v_kind from public.networks where id=v_network;
 if not public.g8_productized_vertical(v_kind) then raise exception 'Active network does not use the productized entity runtime.';end if;
 if p_entity_id is null then
  if not public.is_network_admin(v_network) then raise exception 'Network admin access required.' using errcode='42501';end if;
 else
  v_allowed:=public.is_network_admin(v_network) or exists(select 1 from public.network_entities own where own.id=p_entity_id and own.network_id=v_network and own.owner_user_id=auth.uid());
  if not v_allowed and v_kind in ('association','family-association') then
   select case when e.kind in ('household','family') then e.id else (select r.to_entity_id from public.network_entity_relationships r where r.network_id=v_network and r.from_entity_id=e.id and r.relationship_type in ('member_of_household','member_of_family') limit 1) end into v_family from public.network_entities e where e.id=p_entity_id and e.network_id=v_network;
   v_allowed:=v_family is not null and public.can_manage_association_household(v_family,auth.uid());
  end if;
  if not v_allowed then raise exception 'You can edit only your claimed profile or a family you are allowed to maintain.' using errcode='42501';end if;
 end if;
 if not public.g8_allowed_entity_kind(v_kind,p_kind) then raise exception 'Entity kind is not allowed for this network.' using errcode='22023';end if;
 if length(trim(coalesce(p_label,'')))<2 then raise exception 'Entity name is required.';end if;
 if p_visibility not in ('members','private') then raise exception 'Invalid visibility.';end if;
 if p_entity_id is null then insert into public.network_entities(network_id,kind,label,metadata,visibility,owner_user_id) values(v_network,p_kind,trim(p_label),coalesce(p_metadata,'{}'),p_visibility,null) returning id into v_id;
 else update public.network_entities set kind=p_kind,label=trim(p_label),metadata=coalesce(p_metadata,'{}'),visibility=p_visibility,updated_at=now() where id=p_entity_id and network_id=v_network returning id into v_id;if v_id is null then raise exception 'Entity not found.';end if;end if;
 for pair in select key,value from jsonb_each(coalesce(p_affiliations,'{}'::jsonb)) loop perform public.g8_set_entity_affiliations(v_id,v_network,pair.key,pair.value);end loop;
 return v_id;
end $$;

-- Temporal family-association domain foundation. Direct table access stays closed; governed RPC/UI comes in FCA-1/FCA-2.
create table if not exists public.family_association_settings(
 network_id uuid primary key references public.networks(id) on delete cascade,
 membership_cycle_start_month smallint not null default 4 check(membership_cycle_start_month between 1 and 12),
 dependent_age_limit smallint not null default 22 check(dependent_age_limit between 16 and 40),
 grace_period_days smallint not null default 30 check(grace_period_days between 0 and 90),
 max_auto_children smallint not null default 2 check(max_auto_children between 0 and 10),
 onboarding_policy varchar(24) not null default 'join_review_later' check(onboarding_policy in ('join_review_later','approval_required','invitation_only')),
 voting_eligibility varchar(32) not null default 'representative_spouse' check(voting_eligibility in ('one_per_family','representative_spouse','all_adult_members','custom')),
 default_profile_visibility varchar(16) not null default 'members' check(default_profile_visibility in ('members','private')),
 default_contact_visibility varchar(16) not null default 'members' check(default_contact_visibility in ('members','private')),
 finance_visibility varchar(16) not null default 'admins' check(finance_visibility in ('admins','members','highlighted')),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);

create table if not exists public.family_association_membership_years(
 id uuid primary key default gen_random_uuid(),network_id uuid not null references public.networks(id) on delete cascade,
 label varchar(20) not null,start_date date not null,end_date date not null,family_fee numeric(12,2) not null default 0,
 grace_period_days smallint not null default 30,status varchar(16) not null default 'planned' check(status in ('planned','open','closed','archived')),
 created_by uuid references auth.users(id) on delete set null,created_at timestamptz not null default now(),unique(network_id,label)
);

create table if not exists public.family_association_family_memberships(
 id uuid primary key default gen_random_uuid(),network_id uuid not null references public.networks(id) on delete cascade,
 membership_year_id uuid not null references public.family_association_membership_years(id) on delete cascade,
 family_entity_id uuid not null,representative_entity_id uuid,
 status varchar(24) not null default 'active' check(status in ('pending','active','grace','inactive','removed','transferred')),
 payment_status varchar(20) not null default 'unpaid' check(payment_status in ('unpaid','paid','waived','partial','not_required')),
 amount_due numeric(12,2) not null default 0,amount_paid numeric(12,2) not null default 0,payment_reference varchar(120),
 joined_on date,renewed_on date,inactive_on date,transfer_to_network_id uuid references public.networks(id) on delete set null,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(network_id,membership_year_id,family_entity_id),
 foreign key(family_entity_id,network_id) references public.network_entities(id,network_id) on delete cascade,
 foreign key(representative_entity_id,network_id) references public.network_entities(id,network_id) on delete set null
);

create table if not exists public.family_association_role_catalog(
 id uuid primary key default gen_random_uuid(),network_id uuid not null references public.networks(id) on delete cascade,
 role_key varchar(80) not null,label varchar(120) not null,role_type varchar(24) not null check(role_type in ('office_bearer','director','chairperson','committee','volunteer','mentor','other')),
 portfolio varchar(120),active boolean not null default true,sort_order integer not null default 100,unique(network_id,role_key)
);

create table if not exists public.family_association_role_history(
 id uuid primary key default gen_random_uuid(),network_id uuid not null references public.networks(id) on delete cascade,
 membership_year_id uuid references public.family_association_membership_years(id) on delete set null,
 person_entity_id uuid not null,role_catalog_id uuid not null references public.family_association_role_catalog(id) on delete restrict,
 starts_on date,ends_on date,notes text,created_at timestamptz not null default now(),
 foreign key(person_entity_id,network_id) references public.network_entities(id,network_id) on delete cascade
);

create table if not exists public.family_association_awards(
 id uuid primary key default gen_random_uuid(),network_id uuid not null references public.networks(id) on delete cascade,
 person_entity_id uuid not null,award_key varchar(80) not null,award_label varchar(160) not null,membership_year_id uuid references public.family_association_membership_years(id) on delete set null,
 awarded_on date,event_activity_id uuid,description text,created_at timestamptz not null default now(),
 foreign key(person_entity_id,network_id) references public.network_entities(id,network_id) on delete cascade
);

create table if not exists public.family_association_finance_ledger(
 id uuid primary key default gen_random_uuid(),network_id uuid not null references public.networks(id) on delete cascade,
 membership_year_id uuid not null references public.family_association_membership_years(id) on delete cascade,
 entry_type varchar(28) not null check(entry_type in ('opening_balance','membership_collection','donation','event_contribution','sponsorship','event_allocation','good_cause','expense','carry_forward','adjustment')),
 amount numeric(14,2) not null,activity_id uuid,description text,visibility varchar(16) not null default 'admins' check(visibility in ('admins','members','highlighted')),
 created_by uuid references auth.users(id) on delete set null,created_at timestamptz not null default now()
);

alter table public.family_association_settings enable row level security;
alter table public.family_association_membership_years enable row level security;
alter table public.family_association_family_memberships enable row level security;
alter table public.family_association_role_catalog enable row level security;
alter table public.family_association_role_history enable row level security;
alter table public.family_association_awards enable row level security;
alter table public.family_association_finance_ledger enable row level security;
revoke all on public.family_association_settings,public.family_association_membership_years,public.family_association_family_memberships,public.family_association_role_catalog,public.family_association_role_history,public.family_association_awards,public.family_association_finance_ledger from anon,authenticated;

-- Create default settings/catalog for every new family-association network via the create flow audit hook.
create or replace function public.fca_seed_defaults(p_network uuid) returns void language plpgsql security definer set search_path=public as $$
begin
 insert into public.family_association_settings(network_id) values(p_network) on conflict(network_id) do nothing;
 insert into public.family_association_role_catalog(network_id,role_key,label,role_type,sort_order) values
  (p_network,'president','President','office_bearer',10),(p_network,'president-elect','President Elect','office_bearer',20),(p_network,'past-president','Past President','office_bearer',30),(p_network,'secretary','Secretary','office_bearer',40),(p_network,'treasurer','Treasurer','office_bearer',50),(p_network,'director','Director','director',60),(p_network,'chairperson','Chairperson','chairperson',70),(p_network,'committee-member','Committee Member','committee',80),(p_network,'volunteer','Volunteer','volunteer',90),(p_network,'mentor','Mentor','mentor',100)
 on conflict(network_id,role_key) do nothing;
end $$;

create or replace function public.fca_seed_network_defaults_trigger() returns trigger language plpgsql security definer set search_path=public as $$
begin if new.vertical_kind='family-association' then perform public.fca_seed_defaults(new.id);end if;return new;end $$;
drop trigger if exists trg_fca_seed_network_defaults on public.networks;
create trigger trg_fca_seed_network_defaults after insert on public.networks for each row execute function public.fca_seed_network_defaults_trigger();

-- Backfill test networks created before this migration.
select public.fca_seed_defaults(id) from public.networks where vertical_kind='family-association';

-- Shared productized network lifecycle: leave, archive/unlink, or permanently delete network-owned data.
create or replace function public.leave_productized_network() returns uuid
language plpgsql security definer set search_path=public as $$
declare nid uuid; actor_role text; owner_count int; next_id uuid;
begin
 nid:=public.current_network_id();
 if nid is null then raise exception 'No active network.' using errcode='42501'; end if;
 if not exists(select 1 from public.networks n where n.id=nid and public.g8_productized_vertical(n.vertical_kind)) then raise exception 'This lifecycle action is available for productized networks.' using errcode='42501'; end if;
 select role into actor_role from public.network_memberships where network_id=nid and user_id=auth.uid() and status='active';
 if actor_role='owner' then
  select count(*) into owner_count from public.network_memberships where network_id=nid and role='owner' and status='active';
  if owner_count<=1 then raise exception 'The sole owner cannot leave. Add another owner, archive, or permanently delete the network.' using errcode='42501'; end if;
 end if;
 update public.network_memberships set status='left' where network_id=nid and user_id=auth.uid();
 select nm.network_id into next_id from public.network_memberships nm join public.networks n on n.id=nm.network_id and n.status='active' where nm.user_id=auth.uid() and nm.status='active' and nm.network_id<>nid order by nm.joined_at desc limit 1;
 update public.profiles set active_network_id=next_id,updated_at=now() where id=auth.uid();
 return next_id;
end $$;
revoke all on function public.leave_productized_network() from public; grant execute on function public.leave_productized_network() to authenticated;

create or replace function public.archive_productized_network(p_confirm_name text) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid; nname text;
begin
 nid:=public.current_network_id();
 select n.name into nname from public.networks n join public.network_memberships nm on nm.network_id=n.id and nm.user_id=auth.uid() and nm.status='active' and nm.role='owner' where n.id=nid and public.g8_productized_vertical(n.vertical_kind);
 if nname is null then raise exception 'Network owner access required.' using errcode='42501'; end if;
 if trim(coalesce(p_confirm_name,''))<>nname then raise exception 'Network name confirmation does not match.' using errcode='22023'; end if;
 update public.networks set status='archived',updated_at=now() where id=nid;
 update public.network_memberships set status='suspended' where network_id=nid and status='active';
 update public.profiles p set active_network_id=null,updated_at=now() where p.active_network_id=nid;
end $$;
revoke all on function public.archive_productized_network(text) from public; grant execute on function public.archive_productized_network(text) to authenticated;

create or replace function public.delete_productized_network_permanently(p_confirm_name text) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid; nname text;
begin
 nid:=public.current_network_id();
 select n.name into nname from public.networks n join public.network_memberships nm on nm.network_id=n.id and nm.user_id=auth.uid() and nm.status='active' and nm.role='owner' where n.id=nid and public.g8_productized_vertical(n.vertical_kind);
 if nname is null then raise exception 'Network owner access required.' using errcode='42501'; end if;
 if trim(coalesce(p_confirm_name,''))<>nname then raise exception 'Network name confirmation does not match.' using errcode='22023'; end if;
 update public.profiles p set active_network_id=null,updated_at=now() where p.active_network_id=nid;
 delete from public.networks where id=nid; -- network-owned rows cascade; auth/profile identity and other networks do not.
end $$;
revoke all on function public.delete_productized_network_permanently(text) from public; grant execute on function public.delete_productized_network_permanently(text) to authenticated;

-- FCA governed operating RPCs. Official membership/governance/finance data is admin-controlled.
create or replace function public.get_fca_admin_snapshot() returns jsonb
language plpgsql security definer stable set search_path=public as $$
declare nid uuid; result jsonb;
begin
 nid:=public.current_network_id();
 if not public.is_network_admin(nid) then raise exception 'Association admin access required.' using errcode='42501'; end if;
 if not exists(select 1 from public.networks where id=nid and vertical_kind='family-association') then raise exception 'Family Community Association required.' using errcode='22023'; end if;
 select jsonb_build_object(
  'settings',coalesce((select to_jsonb(s)-'network_id'-'created_at'-'updated_at' from public.family_association_settings s where s.network_id=nid),'{}'::jsonb),
  'years',coalesce((select jsonb_agg(to_jsonb(y) order by y.start_date desc) from public.family_association_membership_years y where y.network_id=nid),'[]'::jsonb),
  'memberships',coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'membership_year_id',m.membership_year_id,'year_label',y.label,'family_entity_id',m.family_entity_id,'family_label',f.label,'representative_entity_id',m.representative_entity_id,'representative_label',r.label,'status',m.status,'payment_status',m.payment_status,'amount_due',m.amount_due,'amount_paid',m.amount_paid,'payment_reference',m.payment_reference,'joined_on',m.joined_on,'renewed_on',m.renewed_on,'inactive_on',m.inactive_on) order by y.start_date desc,f.label) from public.family_association_family_memberships m join public.family_association_membership_years y on y.id=m.membership_year_id join public.network_entities f on f.id=m.family_entity_id left join public.network_entities r on r.id=m.representative_entity_id where m.network_id=nid),'[]'::jsonb),
  'roles',coalesce((select jsonb_agg(to_jsonb(rc) order by rc.sort_order,rc.label) from public.family_association_role_catalog rc where rc.network_id=nid and rc.active),'[]'::jsonb),
  'role_history',coalesce((select jsonb_agg(jsonb_build_object('id',h.id,'year_label',y.label,'person_label',p.label,'role_label',rc.label,'portfolio',rc.portfolio,'starts_on',h.starts_on,'ends_on',h.ends_on,'notes',h.notes) order by coalesce(h.starts_on,y.start_date) desc) from public.family_association_role_history h left join public.family_association_membership_years y on y.id=h.membership_year_id join public.network_entities p on p.id=h.person_entity_id join public.family_association_role_catalog rc on rc.id=h.role_catalog_id where h.network_id=nid),'[]'::jsonb),
  'finance',coalesce((select jsonb_agg(to_jsonb(l) order by l.created_at desc) from public.family_association_finance_ledger l where l.network_id=nid),'[]'::jsonb)
 ) into result;
 return result;
end $$;
revoke all on function public.get_fca_admin_snapshot() from public; grant execute on function public.get_fca_admin_snapshot() to authenticated;

create or replace function public.update_fca_settings(p_dependent_age_limit int,p_grace_period_days int,p_max_auto_children int,p_onboarding_policy text,p_finance_visibility text) returns void
language plpgsql security definer set search_path=public as $$ declare nid uuid:=public.current_network_id(); begin
 if not public.is_network_admin(nid) then raise exception 'Association admin access required.' using errcode='42501'; end if;
 insert into public.family_association_settings(network_id,dependent_age_limit,grace_period_days,max_auto_children,onboarding_policy,finance_visibility) values(nid,p_dependent_age_limit,p_grace_period_days,p_max_auto_children,p_onboarding_policy,p_finance_visibility)
 on conflict(network_id) do update set dependent_age_limit=excluded.dependent_age_limit,grace_period_days=excluded.grace_period_days,max_auto_children=excluded.max_auto_children,onboarding_policy=excluded.onboarding_policy,finance_visibility=excluded.finance_visibility,updated_at=now();
end $$;
revoke all on function public.update_fca_settings(int,int,int,text,text) from public; grant execute on function public.update_fca_settings(int,int,int,text,text) to authenticated;

create or replace function public.upsert_fca_membership_year(p_id uuid,p_label text,p_start_date date,p_end_date date,p_family_fee numeric,p_grace_period_days int,p_status text) returns uuid
language plpgsql security definer set search_path=public as $$ declare nid uuid:=public.current_network_id(); rid uuid; begin
 if not public.is_network_admin(nid) then raise exception 'Association admin access required.' using errcode='42501'; end if;
 if p_id is null then insert into public.family_association_membership_years(network_id,label,start_date,end_date,family_fee,grace_period_days,status,created_by) values(nid,trim(p_label),p_start_date,p_end_date,p_family_fee,p_grace_period_days,p_status,auth.uid()) returning id into rid;
 else update public.family_association_membership_years set label=trim(p_label),start_date=p_start_date,end_date=p_end_date,family_fee=p_family_fee,grace_period_days=p_grace_period_days,status=p_status where id=p_id and network_id=nid returning id into rid; end if;
 return rid;
end $$;
revoke all on function public.upsert_fca_membership_year(uuid,text,date,date,numeric,int,text) from public; grant execute on function public.upsert_fca_membership_year(uuid,text,date,date,numeric,int,text) to authenticated;

create or replace function public.set_fca_family_membership(p_year_id uuid,p_family_entity_id uuid,p_representative_entity_id uuid,p_status text,p_payment_status text,p_amount_paid numeric,p_payment_reference text) returns uuid
language plpgsql security definer set search_path=public as $$ declare nid uuid:=public.current_network_id(); fee numeric; rid uuid; begin
 if not public.is_network_admin(nid) then raise exception 'Association admin access required.' using errcode='42501'; end if;
 select family_fee into fee from public.family_association_membership_years where id=p_year_id and network_id=nid; if fee is null then raise exception 'Membership year not found.';end if;
 if not exists(select 1 from public.network_entities where id=p_family_entity_id and network_id=nid and kind='family') then raise exception 'Family not found.';end if;
 insert into public.family_association_family_memberships(network_id,membership_year_id,family_entity_id,representative_entity_id,status,payment_status,amount_due,amount_paid,payment_reference,joined_on,renewed_on)
 values(nid,p_year_id,p_family_entity_id,p_representative_entity_id,p_status,p_payment_status,fee,coalesce(p_amount_paid,0),nullif(trim(coalesce(p_payment_reference,'')),''),current_date,current_date)
 on conflict(network_id,membership_year_id,family_entity_id) do update set representative_entity_id=excluded.representative_entity_id,status=excluded.status,payment_status=excluded.payment_status,amount_due=excluded.amount_due,amount_paid=excluded.amount_paid,payment_reference=excluded.payment_reference,renewed_on=current_date,updated_at=now() returning id into rid;
 return rid;
end $$;
revoke all on function public.set_fca_family_membership(uuid,uuid,uuid,text,text,numeric,text) from public; grant execute on function public.set_fca_family_membership(uuid,uuid,uuid,text,text,numeric,text) to authenticated;

create or replace function public.assign_fca_role(p_year_id uuid,p_person_entity_id uuid,p_role_catalog_id uuid,p_starts_on date,p_ends_on date,p_notes text) returns uuid
language plpgsql security definer set search_path=public as $$ declare nid uuid:=public.current_network_id(); rid uuid; begin
 if not public.is_network_admin(nid) then raise exception 'Association admin access required.' using errcode='42501'; end if;
 if not exists(select 1 from public.network_entities where id=p_person_entity_id and network_id=nid and kind='person') then raise exception 'Person not found.';end if;
 if not exists(select 1 from public.family_association_role_catalog where id=p_role_catalog_id and network_id=nid and active) then raise exception 'Role not found.';end if;
 insert into public.family_association_role_history(network_id,membership_year_id,person_entity_id,role_catalog_id,starts_on,ends_on,notes) values(nid,p_year_id,p_person_entity_id,p_role_catalog_id,p_starts_on,p_ends_on,nullif(trim(coalesce(p_notes,'')),'')) returning id into rid;return rid;
end $$;
revoke all on function public.assign_fca_role(uuid,uuid,uuid,date,date,text) from public; grant execute on function public.assign_fca_role(uuid,uuid,uuid,date,date,text) to authenticated;

create or replace function public.add_fca_finance_entry(p_year_id uuid,p_entry_type text,p_amount numeric,p_description text,p_visibility text) returns uuid
language plpgsql security definer set search_path=public as $$ declare nid uuid:=public.current_network_id(); rid uuid; begin
 if not public.is_network_admin(nid) then raise exception 'Association admin access required.' using errcode='42501'; end if;
 insert into public.family_association_finance_ledger(network_id,membership_year_id,entry_type,amount,description,visibility,created_by) values(nid,p_year_id,p_entry_type,p_amount,nullif(trim(coalesce(p_description,'')),''),p_visibility,auth.uid()) returning id into rid;return rid;
end $$;
revoke all on function public.add_fca_finance_entry(uuid,text,numeric,text,text) from public; grant execute on function public.add_fca_finance_entry(uuid,text,numeric,text,text) to authenticated;

-- Shared lightweight activity engagement for memories/updates/events.
create table if not exists public.network_activity_reactions(
 activity_id uuid not null,network_id uuid not null references public.networks(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,
 reaction varchar(20) not null default 'like' check(reaction in ('like')),created_at timestamptz not null default now(),primary key(activity_id,user_id),
 foreign key(activity_id,network_id) references public.network_activities(id,network_id) on delete cascade
);
create table if not exists public.network_activity_comments(
 id uuid primary key default gen_random_uuid(),activity_id uuid not null,network_id uuid not null references public.networks(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,
 body varchar(1000) not null,created_at timestamptz not null default now(),
 foreign key(activity_id,network_id) references public.network_activities(id,network_id) on delete cascade
);
alter table public.network_activity_reactions enable row level security;alter table public.network_activity_comments enable row level security;
revoke all on public.network_activity_reactions,public.network_activity_comments from anon,authenticated;

create or replace function public.toggle_network_activity_like(p_activity_id uuid) returns boolean
language plpgsql security definer set search_path=public as $$ declare nid uuid:=public.current_network_id(); liked boolean; begin
 if not public.is_network_member(nid) then raise exception 'Network membership required.' using errcode='42501';end if;
 if not exists(select 1 from public.network_activities where id=p_activity_id and network_id=nid) then raise exception 'Activity not found.';end if;
 if exists(select 1 from public.network_activity_reactions where activity_id=p_activity_id and user_id=auth.uid()) then delete from public.network_activity_reactions where activity_id=p_activity_id and user_id=auth.uid();liked:=false;else insert into public.network_activity_reactions(activity_id,network_id,user_id) values(p_activity_id,nid,auth.uid());liked:=true;end if;return liked;
end $$;
revoke all on function public.toggle_network_activity_like(uuid) from public;grant execute on function public.toggle_network_activity_like(uuid) to authenticated;

create or replace function public.add_network_activity_comment(p_activity_id uuid,p_body text) returns uuid
language plpgsql security definer set search_path=public as $$ declare nid uuid:=public.current_network_id(); rid uuid; begin
 if not public.is_network_member(nid) then raise exception 'Network membership required.' using errcode='42501';end if;
 if length(trim(coalesce(p_body,'')))<1 then raise exception 'Comment is required.';end if;
 if not exists(select 1 from public.network_activities where id=p_activity_id and network_id=nid) then raise exception 'Activity not found.';end if;
 insert into public.network_activity_comments(activity_id,network_id,user_id,body) values(p_activity_id,nid,auth.uid(),left(trim(p_body),1000)) returning id into rid;return rid;
end $$;
revoke all on function public.add_network_activity_comment(uuid,text) from public;grant execute on function public.add_network_activity_comment(uuid,text) to authenticated;

create or replace function public.get_network_activity_comments(p_activity_id uuid)
returns table(id uuid,body varchar,created_at timestamptz,author_label text,is_mine boolean)
language sql security definer stable set search_path=public as $$
 select c.id,c.body,c.created_at,coalesce(e.label,'Member')::text,(c.user_id=auth.uid())
 from public.network_activity_comments c
 left join public.network_entities e on e.network_id=c.network_id and e.owner_user_id=c.user_id
 where c.network_id=public.current_network_id() and c.activity_id=p_activity_id and public.is_network_member(c.network_id)
 order by c.created_at asc limit 100;
$$;
revoke all on function public.get_network_activity_comments(uuid) from public;grant execute on function public.get_network_activity_comments(uuid) to authenticated;

-- Return shape changed from G7 (adds reaction/comment aggregates). PostgreSQL cannot
-- CREATE OR REPLACE a function when OUT columns change, so explicitly drop/recreate.
-- This makes FCA-0 safe to rerun on databases that already have the older G7 function.
drop function if exists public.get_network_activities(text);

create or replace function public.get_network_activities(p_activity_type text default null)
returns table(id uuid,activity_type varchar,title varchar,body text,starts_at timestamptz,ends_at timestamptz,place varchar,visibility varchar,created_by uuid,my_rsvp varchar,going_count bigint,my_liked boolean,like_count bigint,comment_count bigint)
language sql security definer stable set search_path=public as $$
 select a.id,a.activity_type,a.title,a.body,a.starts_at,a.ends_at,a.place,a.visibility,a.created_by,r.response,
   (select count(*) from public.network_activity_rsvps rr where rr.activity_id=a.id and rr.response='going'),
   exists(select 1 from public.network_activity_reactions lr where lr.activity_id=a.id and lr.user_id=auth.uid()),
   (select count(*) from public.network_activity_reactions lr where lr.activity_id=a.id),
   (select count(*) from public.network_activity_comments cc where cc.activity_id=a.id)
 from public.network_activities a left join public.network_activity_rsvps r on r.activity_id=a.id and r.user_id=auth.uid()
 where a.network_id=public.current_network_id() and public.is_network_member(a.network_id)
   and (a.visibility='members' or a.created_by=auth.uid() or public.is_network_admin(a.network_id))
   and (p_activity_type is null or p_activity_type='' or a.activity_type=p_activity_type)
 order by coalesce(a.starts_at,a.created_at) desc;
$$;
revoke all on function public.get_network_activities(text) from public;grant execute on function public.get_network_activities(text) to authenticated;
