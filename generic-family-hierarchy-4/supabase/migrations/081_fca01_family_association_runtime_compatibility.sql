-- FCA-0.1 — Family Community Association runtime compatibility hardening
-- Reasserts the server/database contracts required by /api/v1/networks/create.

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



-- Reassert FCA entity/relationship contracts as part of the compatibility migration itself.
-- Do not assume migration 080's function definitions are still the active versions.
create or replace function public.g8_allowed_entity_kind(p_kind text,p_entity_kind text) returns boolean language sql immutable as $$
 select case p_kind
  when 'association' then p_entity_kind in ('household','person','committee','organization','location')
  when 'family-association' then p_entity_kind in ('family','person','committee','organization','location')
  when 'organization' then p_entity_kind in ('person','team','project','product','location')
  when 'business-trust' then p_entity_kind in ('person','organization','location','product')
  when 'franchise' then p_entity_kind in ('branch','person','organization','location')
  when 'professional' then p_entity_kind in ('person','organization','location')
  else false end;
$$;

create or replace function public.g8_allowed_relationship(p_kind text,p_rel text) returns boolean language sql immutable as $$
 select case p_kind
  when 'association' then p_rel in ('represented_by','member_of_household','spouse_of','parent_of','serves_on','supports')
  when 'family-association' then p_rel in ('represented_by','member_of_family','spouse_of','parent_of','serves_on','supports')
  when 'organization' then p_rel in ('reports_to','works_with','owns','depends_on')
  when 'business-trust' then p_rel in ('recommends','verified_by','supplies_to','worked_with')
  when 'franchise' then p_rel in ('owns','operates','manages','supports')
  when 'professional' then p_rel in ('worked_with','referred_by','collaborates_with','mentors')
  else false end;
$$;
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
 perform public.g8_seed_productized_structure(v_id,p_vertical_kind);
 if p_vertical_kind='family-association' then perform public.fca_seed_defaults(v_id); end if;
 update public.profiles set active_network_id=v_id,updated_at=now() where id=auth.uid();
 insert into public.audit_log(network_id,actor_id,action,details) values(v_id,auth.uid(),'productized_network_created',jsonb_build_object('vertical_kind',p_vertical_kind,'context',trim(p_context_value)));
 return v_id;
end $$;
revoke all on function public.create_productized_network(text,text,text,text) from public;
grant execute on function public.create_productized_network(text,text,text,text) to authenticated;

-- Reassert launch-control compatibility for the new vertical.
create or replace function public.get_platform_vertical_launch_console(p_vertical_kind varchar)
returns table(feature_key varchar,bundle_key varchar,rollout_state varchar,pilot_network_ids uuid[],announcement_version int,updated_at timestamptz)
language plpgsql security definer stable set search_path=public as $$ begin
 if not public.is_platform_owner() then raise exception 'Platform owner access is required.' using errcode='42501';end if;
 if p_vertical_kind not in ('family','alumni','association','family-association','organization','business-trust','franchise','professional') then raise exception 'Unknown vertical.' using errcode='22023';end if;
 return query select f.feature_key,f.bundle_key,f.rollout_state,f.pilot_network_ids,f.announcement_version,f.updated_at from public.platform_feature_flags f where f.vertical_kind=p_vertical_kind order by f.bundle_key,f.feature_key;
end $$;

create or replace function public.set_platform_vertical_bundle_rollout(p_vertical_kind varchar,p_bundle_key varchar,p_rollout_state varchar,p_pilot_network_ids uuid[] default '{}',p_announce boolean default false) returns integer
language plpgsql security definer set search_path=public as $$ declare v_count integer;begin
 if not public.is_platform_owner() then raise exception 'Platform owner access is required.' using errcode='42501';end if;
 if p_vertical_kind not in ('family','alumni','association','family-association','organization','business-trust','franchise','professional') then raise exception 'Unknown vertical.' using errcode='22023';end if;
 if p_rollout_state not in ('hidden','test','pilot','released') then raise exception 'Invalid rollout state.';end if;
 update public.platform_feature_flags set rollout_state=p_rollout_state,pilot_network_ids=case when p_rollout_state='pilot' then coalesce(p_pilot_network_ids,'{}') else '{}'::uuid[] end,announcement_version=case when p_announce then announcement_version+1 else announcement_version end,updated_by=auth.uid(),updated_at=now() where vertical_kind=p_vertical_kind and bundle_key=p_bundle_key;
 get diagnostics v_count=row_count;return v_count;
end $$;

-- Confirm FCA-0 completed, rather than allowing a partially upgraded database to appear compatible.
do $$ begin
 if to_regprocedure('public.fca_seed_defaults(uuid)') is null then
   raise exception 'FCA runtime compatibility check failed: FCA-0 foundation is incomplete. Rerun the corrected 080_fca0_family_community_association.sql before 081.';
 end if;
 if to_regclass('public.family_association_settings') is null
    or to_regclass('public.family_association_membership_years') is null
    or to_regclass('public.family_association_family_memberships') is null then
   raise exception 'FCA runtime compatibility check failed: FCA-0 tables are missing. Rerun corrected migration 080 before 081.';
 end if;
end $$;

-- Fail migration loudly if the creation contract is not actually active.
do $$ begin
 if not public.g8_productized_vertical('family-association') then raise exception 'FCA runtime compatibility check failed: family-association is not productized.'; end if;
 if not public.g8_allowed_entity_kind('family-association','family')
    or not public.g8_allowed_entity_kind('family-association','person')
    or not public.g8_allowed_entity_kind('family-association','committee')
    or not public.g8_allowed_entity_kind('family-association','organization')
    or not public.g8_allowed_entity_kind('family-association','location') then
   raise exception 'FCA runtime compatibility check failed: entity kinds missing.';
 end if;
 if not public.g8_allowed_relationship('family-association','represented_by')
    or not public.g8_allowed_relationship('family-association','member_of_family')
    or not public.g8_allowed_relationship('family-association','spouse_of')
    or not public.g8_allowed_relationship('family-association','parent_of')
    or not public.g8_allowed_relationship('family-association','serves_on')
    or not public.g8_allowed_relationship('family-association','supports') then
   raise exception 'FCA runtime compatibility check failed: relationship rules missing.';
 end if;
end $$;
