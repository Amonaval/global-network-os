-- MPF-A0 — Community / Association vertical foundation
-- Activates a reusable household/member association vertical without hard-coding any specific association.

alter table public.networks drop constraint if exists networks_vertical_kind_check;
alter table public.networks add constraint networks_vertical_kind_check
 check (vertical_kind in ('family','alumni','association','organization','business-trust','franchise','professional'));

alter table public.network_settings drop constraint if exists network_settings_vertical_kind_check;
alter table public.network_settings add constraint network_settings_vertical_kind_check
 check (vertical_kind in ('family','alumni','association','organization','business-trust','franchise','professional'));

alter table public.platform_feature_flags drop constraint if exists platform_feature_flags_vertical_kind_check;
alter table public.platform_feature_flags add constraint platform_feature_flags_vertical_kind_check
 check(vertical_kind in ('family','alumni','association','organization','business-trust','franchise','professional'));

alter table public.productized_network_settings drop constraint if exists productized_network_settings_template_id_check;
alter table public.productized_network_settings add constraint productized_network_settings_template_id_check
 check(template_id in ('association','organization','business-trust','franchise','professional'));

create or replace function public.g8_productized_vertical(p_kind text) returns boolean language sql immutable as $$
 select p_kind in ('association','organization','business-trust','franchise','professional');
$$;

create or replace function public.g8_allowed_entity_kind(p_kind text,p_entity_kind text) returns boolean language sql immutable as $$
 select case p_kind
  when 'association' then p_entity_kind in ('household','person','committee','organization','location')
  when 'organization' then p_entity_kind in ('person','team','project','product','location')
  when 'business-trust' then p_entity_kind in ('person','organization','location','product')
  when 'franchise' then p_entity_kind in ('branch','person','organization','location')
  when 'professional' then p_entity_kind in ('person','organization','location')
  else false end;
$$;

create or replace function public.g8_allowed_relationship(p_kind text,p_rel text) returns boolean language sql immutable as $$
 select case p_kind
  when 'association' then p_rel in ('represented_by','member_of_household','serves_on','supports')
  when 'organization' then p_rel in ('reports_to','works_with','owns','depends_on')
  when 'business-trust' then p_rel in ('recommends','verified_by','supplies_to','worked_with')
  when 'franchise' then p_rel in ('owns','operates','manages','supports')
  when 'professional' then p_rel in ('worked_with','referred_by','collaborates_with','mentors')
  else false end;
$$;

create or replace function public.g8_seed_productized_structure(p_network uuid,p_kind text) returns void
language plpgsql security definer set search_path=public as $$
begin
 if p_kind='association' then
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
declare v_id uuid; v_slug text; v_base text; v_entity text; v_entities text; v_level text; v_parent text; v_child text; v_peer text; v_context_label text;
begin
 if auth.uid() is null then raise exception 'Sign in required.' using errcode='42501'; end if;
 if not public.g8_productized_vertical(p_vertical_kind) then raise exception 'Unsupported productized network template.' using errcode='22023'; end if;
 if length(trim(coalesce(p_name,'')))<2 then raise exception 'Network name is required.'; end if;
 if length(trim(coalesce(p_context_value,'')))<2 then raise exception 'Network context is required.'; end if;
 v_base:=lower(regexp_replace(trim(p_name),'[^a-zA-Z0-9]+','-','g')); v_base:=trim(both '-' from v_base); if v_base='' then v_base:='network'; end if; v_slug:=v_base;
 while exists(select 1 from public.networks where slug=v_slug) loop v_slug:=v_base||'-'||substr(gen_random_uuid()::text,1,6); end loop;
 if p_vertical_kind='association' then v_entity:='Family / Household';v_entities:='Families / Households';v_level:='Membership';v_parent:='Representative';v_child:='Member';v_peer:='Community peer';v_context_label:='Association / chapter';
 elsif p_vertical_kind='organization' then v_entity:='Person';v_entities:='People';v_level:='Team';v_parent:='Manager';v_child:='Direct report';v_peer:='Colleague';v_context_label:='Organization / company';
 elsif p_vertical_kind='business-trust' then v_entity:='Business';v_entities:='Businesses';v_level:='Category';v_parent:='Recommender';v_child:='Recommended';v_peer:='Partner';v_context_label:='Network purpose / ecosystem';
 elsif p_vertical_kind='franchise' then v_entity:='Location';v_entities:='Locations';v_level:='Region';v_parent:='Owner';v_child:='Location';v_peer:='Peer location';v_context_label:='Brand / franchise system';
 else v_entity:='Professional';v_entities:='Professionals';v_level:='Expertise';v_parent:='Referrer';v_child:='Referred professional';v_peer:='Collaborator';v_context_label:='Association / professional community'; end if;
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

create or replace function public.get_platform_vertical_launch_console(p_vertical_kind varchar)
returns table(feature_key varchar,bundle_key varchar,rollout_state varchar,pilot_network_ids uuid[],announcement_version integer,updated_at timestamptz)
language plpgsql security definer stable set search_path=public as $$
begin
 if not public.is_platform_owner() then raise exception 'Platform owner access is required.' using errcode='42501';end if;
 if p_vertical_kind not in ('family','alumni','association','organization','business-trust','franchise','professional') then raise exception 'Unknown vertical.' using errcode='22023';end if;
 return query select f.feature_key,f.bundle_key,f.rollout_state,f.pilot_network_ids,f.announcement_version,f.updated_at from public.platform_feature_flags f where f.vertical_kind=p_vertical_kind order by f.bundle_key,f.feature_key;
end $$;

create or replace function public.set_platform_vertical_bundle_rollout(p_vertical_kind varchar,p_bundle_key varchar,p_rollout_state varchar,p_pilot_network_ids uuid[] default '{}',p_announce boolean default false) returns integer
language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
 if not public.is_platform_owner() then raise exception 'Platform owner access is required.' using errcode='42501';end if;
 if p_vertical_kind not in ('family','alumni','association','organization','business-trust','franchise','professional') then raise exception 'Unknown vertical.' using errcode='22023';end if;
 if p_rollout_state not in ('hidden','test','pilot','released') then raise exception 'Invalid rollout state.';end if;
 update public.platform_feature_flags set rollout_state=p_rollout_state,pilot_network_ids=case when p_rollout_state='pilot' then coalesce(p_pilot_network_ids,'{}') else '{}'::uuid[] end,announcement_version=case when p_announce then announcement_version+1 else announcement_version end,updated_by=auth.uid(),updated_at=now() where vertical_kind=p_vertical_kind and bundle_key=p_bundle_key;
 get diagnostics v_count=row_count; return v_count;
end $$;

insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind) values
 ('association.core.home','core','released','{}'::uuid[],'association'),
 ('association.shared.intelligence','intelligence','test','{}'::uuid[],'association'),
 ('association.shared.explorer','discover','released','{}'::uuid[],'association'),
 ('association.core.directory','discover','released','{}'::uuid[],'association'),
 ('association.shared.community','community','released','{}'::uuid[],'association'),
 ('association.shared.places','discover','released','{}'::uuid[],'association'),
 ('association.core.connections','connect','released','{}'::uuid[],'association'),
 ('association.shared.contribute','contribute','released','{}'::uuid[],'association'),
 ('association.admin.manage','admin','released','{}'::uuid[],'association'),
 ('association.admin.import','admin','released','{}'::uuid[],'association')
on conflict(feature_key) do update set bundle_key=excluded.bundle_key,vertical_kind=excluded.vertical_kind;

-- Association advanced features exist for architectural parity but remain TEST by default.
insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind)
select replace(feature_key,'professional.','association.'),bundle_key,'test','{}'::uuid[],'association'
from public.platform_feature_flags where vertical_kind='professional' and feature_key like 'professional.advanced.%'
on conflict(feature_key) do update set bundle_key=excluded.bundle_key,vertical_kind=excluded.vertical_kind;

insert into public.platform_playground_features(feature_key,enabled)
select feature_key,case when bundle_key='admin' then false else true end
from public.platform_feature_flags where vertical_kind='association' and feature_key not like 'association.advanced.%'
on conflict(feature_key) do update set enabled=excluded.enabled;
