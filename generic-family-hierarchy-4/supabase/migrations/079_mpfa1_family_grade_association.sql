-- MPF-A1 — Family-grade Association hardening
-- Adds Family-grade relationship semantics, personal surface release, and scoped household co-admin maintenance.

create or replace function public.g8_allowed_relationship(p_kind text,p_rel text) returns boolean language sql immutable as $$
 select case p_kind
  when 'association' then p_rel in ('represented_by','member_of_household','spouse_of','parent_of','serves_on','supports')
  when 'organization' then p_rel in ('reports_to','works_with','owns','depends_on')
  when 'business-trust' then p_rel in ('recommends','verified_by','supplies_to','worked_with')
  when 'franchise' then p_rel in ('owns','operates','manages','supports')
  when 'professional' then p_rel in ('worked_with','referred_by','collaborates_with','mentors')
  else false end;
$$;

insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind)
values ('association.core.me','core','released','{}'::uuid[],'association')
on conflict(feature_key) do update set bundle_key=excluded.bundle_key,rollout_state=excluded.rollout_state,vertical_kind=excluded.vertical_kind;
insert into public.platform_playground_features(feature_key,enabled) values('association.core.me',true)
on conflict(feature_key) do update set enabled=excluded.enabled;

create table if not exists public.association_household_admins(
 network_id uuid not null references public.networks(id) on delete cascade,
 household_entity_id uuid not null,
 user_id uuid not null references auth.users(id) on delete cascade,
 granted_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 primary key(network_id,household_entity_id,user_id),
 constraint association_household_admin_entity_fk foreign key(household_entity_id,network_id) references public.network_entities(id,network_id) on delete cascade
);
alter table public.association_household_admins enable row level security;
revoke all on table public.association_household_admins from anon,authenticated;

create or replace function public.can_manage_association_household(p_household_id uuid,p_user_id uuid default auth.uid()) returns boolean
language sql security definer stable set search_path=public as $$
 select exists(
  select 1 from public.network_entities h join public.networks n on n.id=h.network_id
  where h.id=p_household_id and h.kind='household' and n.vertical_kind='association' and h.network_id=public.current_network_id()
    and public.is_network_member(h.network_id)
    and (
      public.is_network_admin(h.network_id)
      or exists(select 1 from public.association_household_admins a where a.network_id=h.network_id and a.household_entity_id=h.id and a.user_id=p_user_id)
      or exists(
        select 1 from public.network_entity_relationships r join public.network_entities person on person.id=r.to_entity_id and person.network_id=r.network_id
        where r.network_id=h.network_id and r.from_entity_id=h.id and r.relationship_type='represented_by' and person.owner_user_id=p_user_id
      )
    )
 );
$$;
revoke all on function public.can_manage_association_household(uuid,uuid) from public;
grant execute on function public.can_manage_association_household(uuid,uuid) to authenticated;

create or replace function public.get_my_association_household_admin_context()
returns table(household_id uuid,household_label varchar,can_manage boolean,user_id uuid,entity_label varchar,is_household_admin boolean,is_representative boolean)
language sql security definer stable set search_path=public as $$
 with me as (
  select e.id person_id,e.network_id from public.network_entities e where e.network_id=public.current_network_id() and e.owner_user_id=auth.uid() and e.kind='person' limit 1
 ), household as (
  select h.id,h.label,h.network_id from me join public.network_entity_relationships r on r.network_id=me.network_id and r.from_entity_id=me.person_id and r.relationship_type='member_of_household' join public.network_entities h on h.id=r.to_entity_id and h.network_id=r.network_id and h.kind='household' limit 1
 ), people as (
  select p.id,p.label,p.owner_user_id from household h join public.network_entity_relationships r on r.network_id=h.network_id and r.to_entity_id=h.id and r.relationship_type='member_of_household' join public.network_entities p on p.id=r.from_entity_id and p.network_id=r.network_id and p.kind='person'
 )
 select h.id,h.label,public.can_manage_association_household(h.id,auth.uid()),p.owner_user_id,p.label,
   exists(select 1 from public.association_household_admins a where a.network_id=h.network_id and a.household_entity_id=h.id and a.user_id=p.owner_user_id),
   exists(select 1 from public.network_entity_relationships rr where rr.network_id=h.network_id and rr.from_entity_id=h.id and rr.to_entity_id=p.id and rr.relationship_type='represented_by')
 from household h join people p on p.owner_user_id is not null
 where public.is_network_member(h.network_id)
 order by 7 desc,p.label;
$$;
revoke all on function public.get_my_association_household_admin_context() from public;
grant execute on function public.get_my_association_household_admin_context() to authenticated;

create or replace function public.set_association_household_admin(p_household_id uuid,p_user_id uuid,p_enabled boolean) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
 if not public.can_manage_association_household(p_household_id,auth.uid()) then raise exception 'Household manager access required.' using errcode='42501'; end if;
 if not exists(
   select 1 from public.network_entities p join public.network_entity_relationships r on r.network_id=p.network_id and r.from_entity_id=p.id and r.to_entity_id=p_household_id and r.relationship_type='member_of_household'
   where p.network_id=nid and p.owner_user_id=p_user_id and p.kind='person'
 ) then raise exception 'Co-admin must be a claimed member of this household.' using errcode='22023'; end if;
 if p_enabled then
  insert into public.association_household_admins(network_id,household_entity_id,user_id,granted_by) values(nid,p_household_id,p_user_id,auth.uid()) on conflict do nothing;
 else
  delete from public.association_household_admins where network_id=nid and household_entity_id=p_household_id and user_id=p_user_id;
 end if;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'association_household_admin_changed',jsonb_build_object('household_id',p_household_id,'user_id',p_user_id,'enabled',p_enabled));
end $$;
revoke all on function public.set_association_household_admin(uuid,uuid,boolean) from public;
grant execute on function public.set_association_household_admin(uuid,uuid,boolean) to authenticated;

-- Extend the existing productized edit gate only for Association household maintainers.
create or replace function public.upsert_productized_network_entity(p_entity_id uuid,p_kind text,p_label text,p_metadata jsonb default '{}'::jsonb,p_affiliations jsonb default '{}'::jsonb,p_visibility text default 'members') returns uuid
language plpgsql security definer set search_path=public as $$
declare v_network uuid:=public.current_network_id(); v_kind text; v_id uuid; pair record; v_household uuid; v_allowed boolean:=false;
begin
 select vertical_kind into v_kind from public.networks where id=v_network;
 if not public.g8_productized_vertical(v_kind) then raise exception 'Active network does not use the productized entity runtime.'; end if;
 if p_entity_id is null then
  if not public.is_network_admin(v_network) then raise exception 'Network admin access required.' using errcode='42501'; end if;
 else
  v_allowed:=public.is_network_admin(v_network) or exists(select 1 from public.network_entities own where own.id=p_entity_id and own.network_id=v_network and own.owner_user_id=auth.uid());
  if not v_allowed and v_kind='association' then
   select case when e.kind='household' then e.id else (
     select r.to_entity_id from public.network_entity_relationships r where r.network_id=v_network and r.from_entity_id=e.id and r.relationship_type='member_of_household' limit 1
   ) end into v_household from public.network_entities e where e.id=p_entity_id and e.network_id=v_network;
   v_allowed:=v_household is not null and public.can_manage_association_household(v_household,auth.uid());
  end if;
  if not v_allowed then raise exception 'You can edit only your claimed entity or a household you are allowed to maintain.' using errcode='42501'; end if;
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
 for pair in select key,value from jsonb_each(coalesce(p_affiliations,'{}'::jsonb)) loop perform public.g8_set_entity_affiliations(v_id,v_network,pair.key,pair.value); end loop;
 return v_id;
end $$;
revoke all on function public.upsert_productized_network_entity(uuid,text,text,jsonb,jsonb,text) from public;
grant execute on function public.upsert_productized_network_entity(uuid,text,text,jsonb,jsonb,text) to authenticated;
