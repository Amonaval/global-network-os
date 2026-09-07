-- HS-1 — Property, Household & Resident Core
-- Additive, history-preserving, rerunnable housing-society domain persistence.

create table if not exists public.hs_unit_occupancy_history(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 unit_entity_id uuid not null references public.network_entities(id) on delete cascade,
 subject_entity_id uuid not null references public.network_entities(id) on delete cascade,
 occupancy_role varchar(30) not null check(occupancy_role in ('owner','co-owner','tenant','occupant')),
 starts_on date not null default current_date,
 ends_on date,
 is_primary boolean not null default false,
 notes text,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 check(ends_on is null or ends_on>=starts_on)
);
create index if not exists idx_hs_unit_occupancy_network_unit on public.hs_unit_occupancy_history(network_id,unit_entity_id,starts_on desc);
create index if not exists idx_hs_unit_occupancy_subject on public.hs_unit_occupancy_history(network_id,subject_entity_id,starts_on desc);
create unique index if not exists uq_hs_current_primary_role on public.hs_unit_occupancy_history(network_id,unit_entity_id,occupancy_role) where ends_on is null and is_primary;

create table if not exists public.hs_parking_slots(
 id uuid primary key default gen_random_uuid(),network_id uuid not null references public.networks(id) on delete cascade,
 slot_code varchar(80) not null,zone varchar(120),slot_type varchar(30) not null default 'car' check(slot_type in ('car','two-wheeler','visitor','accessible','other')),
 status varchar(20) not null default 'available' check(status in ('available','allocated','blocked','inactive')),metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(network_id,slot_code)
);
create table if not exists public.hs_vehicles(
 id uuid primary key default gen_random_uuid(),network_id uuid not null references public.networks(id) on delete cascade,
 unit_entity_id uuid not null references public.network_entities(id) on delete cascade,owner_entity_id uuid references public.network_entities(id) on delete set null,
 registration_no varchar(32) not null,vehicle_type varchar(24) not null default 'car' check(vehicle_type in ('car','two-wheeler','cycle','other')),
 make_model varchar(160),color varchar(80),is_ev boolean not null default false,status varchar(20) not null default 'active' check(status in ('active','inactive')),
 created_by uuid references auth.users(id) on delete set null,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(network_id,registration_no)
);
create table if not exists public.hs_parking_allocations(
 id uuid primary key default gen_random_uuid(),network_id uuid not null references public.networks(id) on delete cascade,
 parking_slot_id uuid not null references public.hs_parking_slots(id) on delete cascade,vehicle_id uuid references public.hs_vehicles(id) on delete set null,
 unit_entity_id uuid not null references public.network_entities(id) on delete cascade,starts_on date not null default current_date,ends_on date,
 allocation_type varchar(20) not null default 'assigned' check(allocation_type in ('assigned','temporary','visitor')),notes text,created_by uuid references auth.users(id) on delete set null,created_at timestamptz not null default now(),
 check(ends_on is null or ends_on>=starts_on)
);
create unique index if not exists uq_hs_active_parking_slot on public.hs_parking_allocations(network_id,parking_slot_id) where ends_on is null;

create table if not exists public.hs_resident_invitations(
 id uuid primary key default gen_random_uuid(),network_id uuid not null references public.networks(id) on delete cascade,
 person_entity_id uuid not null references public.network_entities(id) on delete cascade,unit_entity_id uuid references public.network_entities(id) on delete set null,
 email text not null,token uuid not null default gen_random_uuid(),status varchar(20) not null default 'pending' check(status in ('pending','claimed','revoked','expired')),
 expires_at timestamptz not null default (now()+interval '14 days'),created_by uuid references auth.users(id) on delete set null,created_at timestamptz not null default now(),claimed_at timestamptz,unique(network_id,person_entity_id),unique(token)
);
create index if not exists idx_hs_invites_email on public.hs_resident_invitations(network_id,lower(email),status);

create table if not exists public.hs_import_batches(
 id uuid primary key default gen_random_uuid(),network_id uuid not null references public.networks(id) on delete cascade,
 file_name text,column_mapping jsonb not null default '{}'::jsonb,row_count integer not null default 0,inserted_count integer not null default 0,updated_count integer not null default 0,skipped_count integer not null default 0,
 status varchar(20) not null default 'preview' check(status in ('preview','committed','failed')),created_by uuid references auth.users(id) on delete set null,created_at timestamptz not null default now(),committed_at timestamptz
);

alter table public.hs_unit_occupancy_history enable row level security;alter table public.hs_parking_slots enable row level security;alter table public.hs_vehicles enable row level security;alter table public.hs_parking_allocations enable row level security;alter table public.hs_resident_invitations enable row level security;alter table public.hs_import_batches enable row level security;
revoke all on table public.hs_unit_occupancy_history,public.hs_parking_slots,public.hs_vehicles,public.hs_parking_allocations,public.hs_resident_invitations,public.hs_import_batches from anon,authenticated;

create or replace function public.hs1_assert_network() returns uuid language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.current_network_id();begin if nid is null or not public.is_network_member(nid) then raise exception 'Housing society membership required.' using errcode='42501';end if;if coalesce((select vertical_kind from public.networks where id=nid),'')<>'housing-society' then raise exception 'Active network is not a housing society.' using errcode='22023';end if;return nid;end $$;
revoke all on function public.hs1_assert_network() from public;grant execute on function public.hs1_assert_network() to authenticated;

create or replace function public.hs1_set_occupancy(p_unit_id uuid,p_subject_id uuid,p_role text,p_starts_on date default current_date,p_ends_on date default null,p_is_primary boolean default false,p_notes text default null) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs1_assert_network();rid uuid;subject_kind text;begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501';end if;
 if p_role not in ('owner','co-owner','tenant','occupant') then raise exception 'Invalid occupancy role.' using errcode='22023';end if;
 if not exists(select 1 from public.network_entities where id=p_unit_id and network_id=nid and kind='unit') then raise exception 'Unit not found.' using errcode='22023';end if;
 select kind into subject_kind from public.network_entities where id=p_subject_id and network_id=nid;if subject_kind is null or (p_role in ('owner','co-owner') and subject_kind<>'person') or (p_role in ('tenant','occupant') and subject_kind not in ('person','household')) then raise exception 'Subject kind is incompatible with role.' using errcode='22023';end if;
 if p_ends_on is null then update public.hs_unit_occupancy_history set ends_on=greatest(starts_on,p_starts_on-1) where network_id=nid and unit_entity_id=p_unit_id and subject_entity_id=p_subject_id and occupancy_role=p_role and ends_on is null;end if;
 insert into public.hs_unit_occupancy_history(network_id,unit_entity_id,subject_entity_id,occupancy_role,starts_on,ends_on,is_primary,notes,created_by) values(nid,p_unit_id,p_subject_id,p_role,coalesce(p_starts_on,current_date),p_ends_on,p_is_primary,nullif(trim(coalesce(p_notes,'')),''),auth.uid()) returning id into rid;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'hs1_occupancy_recorded',jsonb_build_object('unit_id',p_unit_id,'subject_id',p_subject_id,'role',p_role,'history_id',rid));return rid;
end $$;
revoke all on function public.hs1_set_occupancy(uuid,uuid,text,date,date,boolean,text) from public;grant execute on function public.hs1_set_occupancy(uuid,uuid,text,date,date,boolean,text) to authenticated;

create or replace function public.hs1_get_property_snapshot() returns jsonb language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.hs1_assert_network();begin return jsonb_build_object(
 'occupancy',coalesce((select jsonb_agg(jsonb_build_object('id',h.id,'unitId',h.unit_entity_id,'unitLabel',u.label,'subjectId',h.subject_entity_id,'subjectLabel',s.label,'subjectKind',s.kind,'role',h.occupancy_role,'startsOn',h.starts_on,'endsOn',h.ends_on,'isPrimary',h.is_primary) order by u.label,h.starts_on desc) from public.hs_unit_occupancy_history h join public.network_entities u on u.id=h.unit_entity_id join public.network_entities s on s.id=h.subject_entity_id where h.network_id=nid),'[]'::jsonb),
 'parkingSlots',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'slotCode',p.slot_code,'zone',p.zone,'slotType',p.slot_type,'status',p.status) order by p.slot_code) from public.hs_parking_slots p where p.network_id=nid),'[]'::jsonb),
 'vehicles',coalesce((select jsonb_agg(jsonb_build_object('id',v.id,'unitId',v.unit_entity_id,'unitLabel',u.label,'ownerEntityId',v.owner_entity_id,'registrationNo',v.registration_no,'vehicleType',v.vehicle_type,'makeModel',v.make_model,'isEv',v.is_ev,'status',v.status) order by v.registration_no) from public.hs_vehicles v join public.network_entities u on u.id=v.unit_entity_id where v.network_id=nid),'[]'::jsonb),
 'parkingAllocations',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'slotId',a.parking_slot_id,'slotCode',p.slot_code,'vehicleId',a.vehicle_id,'registrationNo',v.registration_no,'unitId',a.unit_entity_id,'unitLabel',u.label,'startsOn',a.starts_on,'endsOn',a.ends_on,'allocationType',a.allocation_type) order by p.slot_code,a.starts_on desc) from public.hs_parking_allocations a join public.hs_parking_slots p on p.id=a.parking_slot_id join public.network_entities u on u.id=a.unit_entity_id left join public.hs_vehicles v on v.id=a.vehicle_id where a.network_id=nid),'[]'::jsonb),
 'invitations',case when public.is_network_admin(nid) then coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'personEntityId',i.person_entity_id,'personLabel',e.label,'unitEntityId',i.unit_entity_id,'email',i.email,'token',i.token,'status',case when i.status='pending' and i.expires_at<now() then 'expired' else i.status end,'expiresAt',i.expires_at) order by i.created_at desc) from public.hs_resident_invitations i join public.network_entities e on e.id=i.person_entity_id where i.network_id=nid),'[]'::jsonb) else '[]'::jsonb end
 );end $$;
revoke all on function public.hs1_get_property_snapshot() from public;grant execute on function public.hs1_get_property_snapshot() to authenticated;

create or replace function public.hs1_get_my_flat() returns jsonb language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.hs1_assert_network();pid uuid;begin
 select id into pid from public.network_entities where network_id=nid and owner_user_id=auth.uid() and kind='person' order by updated_at desc limit 1;
 if pid is null then return jsonb_build_object('claimed',false);end if;
 return jsonb_build_object('claimed',true,'personId',pid,'personLabel',(select label from public.network_entities where id=pid),
 'units',coalesce((select jsonb_agg(distinct jsonb_build_object('unitId',h.unit_entity_id,'unitLabel',u.label,'role',h.occupancy_role,'startsOn',h.starts_on,'endsOn',h.ends_on,'metadata',u.metadata)) from public.hs_unit_occupancy_history h join public.network_entities u on u.id=h.unit_entity_id where h.network_id=nid and h.subject_entity_id=pid and (h.ends_on is null or h.ends_on>=current_date)),'[]'::jsonb),
 'households',coalesce((select jsonb_agg(distinct jsonb_build_object('householdId',r.to_entity_id,'householdLabel',hh.label)) from public.network_entity_relationships r join public.network_entities hh on hh.id=r.to_entity_id where r.network_id=nid and r.from_entity_id=pid and r.relationship_type='member_of_household'),'[]'::jsonb),
 'vehicles',coalesce((select jsonb_agg(jsonb_build_object('id',v.id,'registrationNo',v.registration_no,'vehicleType',v.vehicle_type,'makeModel',v.make_model,'isEv',v.is_ev,'unitId',v.unit_entity_id)) from public.hs_vehicles v where v.network_id=nid and (v.owner_entity_id=pid or v.unit_entity_id in (select h.unit_entity_id from public.hs_unit_occupancy_history h where h.network_id=nid and h.subject_entity_id=pid and (h.ends_on is null or h.ends_on>=current_date)))),'[]'::jsonb)
 );end $$;
revoke all on function public.hs1_get_my_flat() from public;grant execute on function public.hs1_get_my_flat() to authenticated;

create or replace function public.hs1_upsert_parking_slot(p_id uuid,p_slot_code text,p_zone text default null,p_slot_type text default 'car',p_status text default 'available') returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs1_assert_network();rid uuid;begin if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501';end if;if length(trim(coalesce(p_slot_code,'')))<1 then raise exception 'Parking slot code required.';end if;insert into public.hs_parking_slots(id,network_id,slot_code,zone,slot_type,status) values(coalesce(p_id,gen_random_uuid()),nid,upper(trim(p_slot_code)),nullif(trim(coalesce(p_zone,'')),''),p_slot_type,p_status) on conflict(network_id,slot_code) do update set zone=excluded.zone,slot_type=excluded.slot_type,status=excluded.status,updated_at=now() returning id into rid;return rid;end $$;
revoke all on function public.hs1_upsert_parking_slot(uuid,text,text,text,text) from public;grant execute on function public.hs1_upsert_parking_slot(uuid,text,text,text,text) to authenticated;

create or replace function public.hs1_upsert_vehicle(p_id uuid,p_unit_id uuid,p_owner_entity_id uuid,p_registration_no text,p_vehicle_type text default 'car',p_make_model text default null,p_color text default null,p_is_ev boolean default false) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs1_assert_network();rid uuid;mine boolean:=false;begin
 if not exists(select 1 from public.network_entities where id=p_unit_id and network_id=nid and kind='unit') then raise exception 'Unit not found.' using errcode='22023';end if;
 mine:=exists(select 1 from public.hs_unit_occupancy_history h join public.network_entities p on p.id=h.subject_entity_id where h.network_id=nid and h.unit_entity_id=p_unit_id and p.owner_user_id=auth.uid() and (h.ends_on is null or h.ends_on>=current_date));
 if not public.is_network_admin(nid) and not mine then raise exception 'You can add vehicles only for your current flat.' using errcode='42501';end if;
 insert into public.hs_vehicles(id,network_id,unit_entity_id,owner_entity_id,registration_no,vehicle_type,make_model,color,is_ev,created_by) values(coalesce(p_id,gen_random_uuid()),nid,p_unit_id,p_owner_entity_id,upper(replace(trim(p_registration_no),' ','')),p_vehicle_type,nullif(trim(coalesce(p_make_model,'')),''),nullif(trim(coalesce(p_color,'')),''),p_is_ev,auth.uid()) on conflict(network_id,registration_no) do update set unit_entity_id=excluded.unit_entity_id,owner_entity_id=excluded.owner_entity_id,vehicle_type=excluded.vehicle_type,make_model=excluded.make_model,color=excluded.color,is_ev=excluded.is_ev,status='active',updated_at=now() returning id into rid;return rid;end $$;
revoke all on function public.hs1_upsert_vehicle(uuid,uuid,uuid,text,text,text,text,boolean) from public;grant execute on function public.hs1_upsert_vehicle(uuid,uuid,uuid,text,text,text,text,boolean) to authenticated;

create or replace function public.hs1_allocate_parking(p_slot_id uuid,p_unit_id uuid,p_vehicle_id uuid default null,p_starts_on date default current_date,p_ends_on date default null,p_allocation_type text default 'assigned') returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs1_assert_network();rid uuid;begin if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501';end if;if p_ends_on is null then update public.hs_parking_allocations set ends_on=greatest(starts_on,p_starts_on-1) where network_id=nid and parking_slot_id=p_slot_id and ends_on is null;end if;insert into public.hs_parking_allocations(network_id,parking_slot_id,vehicle_id,unit_entity_id,starts_on,ends_on,allocation_type,created_by) values(nid,p_slot_id,p_vehicle_id,p_unit_id,coalesce(p_starts_on,current_date),p_ends_on,p_allocation_type,auth.uid()) returning id into rid;update public.hs_parking_slots set status=case when p_ends_on is null then 'allocated' else status end,updated_at=now() where id=p_slot_id and network_id=nid;return rid;end $$;
revoke all on function public.hs1_allocate_parking(uuid,uuid,uuid,date,date,text) from public;grant execute on function public.hs1_allocate_parking(uuid,uuid,uuid,date,date,text) to authenticated;

create or replace function public.hs1_create_resident_invitation(p_person_entity_id uuid,p_unit_entity_id uuid default null,p_email text default null,p_expires_days integer default 14) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs1_assert_network();rid uuid;mail text;begin if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501';end if;select coalesce(nullif(trim(p_email),''),nullif(trim(metadata->>'email'),'')) into mail from public.network_entities where id=p_person_entity_id and network_id=nid and kind='person';if mail is null then raise exception 'Resident email required for claiming.';end if;update public.network_entities set metadata=jsonb_set(metadata,'{email}',to_jsonb(lower(mail)),true),updated_at=now() where id=p_person_entity_id and network_id=nid;insert into public.hs_resident_invitations(network_id,person_entity_id,unit_entity_id,email,status,expires_at,created_by) values(nid,p_person_entity_id,p_unit_entity_id,lower(mail),'pending',now()+make_interval(days=>greatest(1,least(coalesce(p_expires_days,14),90))),auth.uid()) on conflict(network_id,person_entity_id) do update set unit_entity_id=excluded.unit_entity_id,email=excluded.email,token=gen_random_uuid(),status='pending',expires_at=excluded.expires_at,created_by=auth.uid(),created_at=now(),claimed_at=null returning id into rid;return rid;end $$;
revoke all on function public.hs1_create_resident_invitation(uuid,uuid,text,integer) from public;grant execute on function public.hs1_create_resident_invitation(uuid,uuid,text,integer) to authenticated;


create or replace function public.hs1_get_resident_invitation_preview(p_token uuid)
returns table(status text,society_name varchar,resident_name varchar,email text,unit_label varchar,expires_at timestamptz)
language sql security definer stable set search_path=public as $$
 select case when i.status<>'pending' then i.status when i.expires_at<now() then 'expired' else 'active' end,n.name,e.label,i.email,u.label,i.expires_at
 from public.hs_resident_invitations i join public.networks n on n.id=i.network_id join public.network_entities e on e.id=i.person_entity_id left join public.network_entities u on u.id=i.unit_entity_id
 where i.token=p_token and n.vertical_kind='housing-society';
$$;
revoke all on function public.hs1_get_resident_invitation_preview(uuid) from public;grant execute on function public.hs1_get_resident_invitation_preview(uuid) to anon,authenticated;

create or replace function public.hs1_accept_resident_invitation(p_token uuid) returns uuid language plpgsql security definer set search_path=public as $$
declare inv public.hs_resident_invitations%rowtype;mail text;nid uuid;begin
 if auth.uid() is null then raise exception 'Sign in required.' using errcode='42501';end if;
 select * into inv from public.hs_resident_invitations where token=p_token for update;if not found then raise exception 'Invitation not found.' using errcode='22023';end if;
 if inv.status<>'pending' or inv.expires_at<now() then raise exception 'Invitation is no longer active.' using errcode='22023';end if;
 mail:=lower(trim(coalesce(auth.jwt()->>'email','')));if mail='' or mail<>lower(trim(inv.email)) then raise exception 'Sign in with the invited email address.' using errcode='42501';end if;nid:=inv.network_id;
 if exists(select 1 from public.network_entities e where e.network_id=nid and e.owner_user_id=auth.uid() and e.id<>inv.person_entity_id) then raise exception 'Your account is already linked to another resident profile in this society.' using errcode='23505';end if;
 update public.network_entities set owner_user_id=auth.uid(),updated_at=now() where id=inv.person_entity_id and network_id=nid and (owner_user_id is null or owner_user_id=auth.uid());if not found then raise exception 'Resident profile is already claimed.' using errcode='23505';end if;
 insert into public.network_memberships(network_id,user_id,role,status) values(nid,auth.uid(),'member','active') on conflict(network_id,user_id) do update set status='active';
 update public.profiles set active_network_id=nid,updated_at=now() where id=auth.uid();update public.hs_resident_invitations set status='claimed',claimed_at=now() where id=inv.id;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'hs1_resident_invitation_claimed',jsonb_build_object('invitation_id',inv.id,'person_entity_id',inv.person_entity_id));return nid;end $$;
revoke all on function public.hs1_accept_resident_invitation(uuid) from public;grant execute on function public.hs1_accept_resident_invitation(uuid) to authenticated;

create or replace function public.hs1_get_import_template() returns jsonb language plpgsql security definer stable set search_path=public as $$ begin perform public.hs1_assert_network();return jsonb_build_object('required',jsonb_build_array('unit','resident_name'),'recommended',jsonb_build_array('building','wing','floor','unit_type','occupancy_role','resident_email','phone','household','vehicle_registration','vehicle_type','parking_slot'),'aliases',jsonb_build_object('flat','unit','flat_no','unit','name','resident_name','email','resident_email','tower','building','parking','parking_slot'));end $$;
revoke all on function public.hs1_get_import_template() from public;grant execute on function public.hs1_get_import_template() to authenticated;


create or replace function public.hs1_import_resident_rows(p_rows jsonb,p_file_name text default null,p_column_mapping jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs1_assert_network();r jsonb;unit_id uuid;person_id uuid;house_id uuid;slot_id uuid;vehicle_id uuid;batch_id uuid;i int:=0;u int:=0;sk int:=0;unit_label text;person_label text;mail text;house_label text;role text;reg text;slot text;existing boolean;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501';end if;
 if jsonb_typeof(p_rows)<>'array' then raise exception 'Rows must be an array.' using errcode='22023';end if;
 insert into public.hs_import_batches(network_id,file_name,column_mapping,row_count,status,created_by) values(nid,p_file_name,coalesce(p_column_mapping,'{}'),jsonb_array_length(p_rows),'preview',auth.uid()) returning id into batch_id;
 for r in select value from jsonb_array_elements(p_rows) loop
  unit_label:=trim(coalesce(r->>'unit',''));person_label:=trim(coalesce(r->>'resident_name',''));mail:=lower(trim(coalesce(r->>'resident_email','')));house_label:=trim(coalesce(r->>'household',''));role:=lower(trim(coalesce(r->>'occupancy_role','occupant')));reg:=upper(replace(trim(coalesce(r->>'vehicle_registration','')),' ',''));slot:=upper(trim(coalesce(r->>'parking_slot','')));
  if length(unit_label)<1 or length(person_label)<2 then sk:=sk+1;continue;end if;
  select id into unit_id from public.network_entities where network_id=nid and kind='unit' and lower(label)=lower(unit_label) order by created_at limit 1;existing:=unit_id is not null;
  if unit_id is null then insert into public.network_entities(network_id,kind,label,metadata,visibility) values(nid,'unit',unit_label,jsonb_strip_nulls(jsonb_build_object('area',nullif(r->>'area',''))),'members') returning id into unit_id;i:=i+1;else u:=u+1;end if;
  perform public.g8_set_entity_affiliations(unit_id,nid,'building',to_jsonb(coalesce(nullif(r->>'building',''),'Main Building')));if nullif(r->>'wing','') is not null then perform public.g8_set_entity_affiliations(unit_id,nid,'wing',to_jsonb(r->>'wing'));end if;if nullif(r->>'floor','') is not null then perform public.g8_set_entity_affiliations(unit_id,nid,'floor',to_jsonb(r->>'floor'));end if;if nullif(r->>'unit_type','') is not null then perform public.g8_set_entity_affiliations(unit_id,nid,'unit_type',to_jsonb(r->>'unit_type'));end if;
  select id into person_id from public.network_entities where network_id=nid and kind='person' and ((mail<>'' and lower(coalesce(metadata->>'email',''))=mail) or lower(label)=lower(person_label)) order by created_at limit 1;
  if person_id is null then insert into public.network_entities(network_id,kind,label,metadata,visibility) values(nid,'person',person_label,jsonb_strip_nulls(jsonb_build_object('email',nullif(mail,''),'phone',nullif(r->>'phone',''),'profession',nullif(r->>'profession',''),'photo_url',nullif(r->>'photo_url',''),'contact_visibility','members','profile_visibility','members')),'members') returning id into person_id;i:=i+1;else update public.network_entities set metadata=metadata||jsonb_strip_nulls(jsonb_build_object('email',nullif(mail,''),'phone',nullif(r->>'phone',''),'profession',nullif(r->>'profession',''),'photo_url',nullif(r->>'photo_url',''))),updated_at=now() where id=person_id;u:=u+1;end if;
  if house_label<>'' then select id into house_id from public.network_entities where network_id=nid and kind='household' and lower(label)=lower(house_label) order by created_at limit 1;if house_id is null then insert into public.network_entities(network_id,kind,label,metadata,visibility) values(nid,'household',house_label,'{}','members') returning id into house_id;i:=i+1;end if;insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata,created_by) values(nid,person_id,house_id,'member_of_household','{}',auth.uid()) on conflict(network_id,from_entity_id,to_entity_id,relationship_type) do nothing;end if;
  insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata,created_by) values(nid,person_id,unit_id,'resident_of','{}',auth.uid()) on conflict(network_id,from_entity_id,to_entity_id,relationship_type) do nothing;
  if role not in ('owner','co-owner','tenant','occupant') then role:='occupant';end if;perform public.g8_set_entity_affiliations(person_id,nid,'resident_type',to_jsonb(initcap(role)));perform public.g8_set_entity_affiliations(unit_id,nid,'occupancy_status',to_jsonb(case when role in ('tenant','occupant') then 'Occupied' else 'Owner Occupied' end));
  if not exists(select 1 from public.hs_unit_occupancy_history where network_id=nid and unit_entity_id=unit_id and subject_entity_id=person_id and occupancy_role=role and ends_on is null) then insert into public.hs_unit_occupancy_history(network_id,unit_entity_id,subject_entity_id,occupancy_role,starts_on,is_primary,created_by) values(nid,unit_id,person_id,role,coalesce(nullif(r->>'starts_on','')::date,current_date),role in ('owner','tenant'),auth.uid());end if;
  if role='owner' then insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata,created_by) values(nid,unit_id,person_id,'owned_by','{}',auth.uid()) on conflict(network_id,from_entity_id,to_entity_id,relationship_type) do nothing;elsif role='co-owner' then insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata,created_by) values(nid,unit_id,person_id,'co_owned_by','{}',auth.uid()) on conflict(network_id,from_entity_id,to_entity_id,relationship_type) do nothing;end if;
  if mail<>'' then perform public.hs1_create_resident_invitation(person_id,unit_id,mail,14);end if;
  if reg<>'' then select id into vehicle_id from public.hs_vehicles where network_id=nid and registration_no=reg;if vehicle_id is null then insert into public.hs_vehicles(network_id,unit_entity_id,owner_entity_id,registration_no,vehicle_type,make_model,is_ev,created_by) values(nid,unit_id,person_id,reg,coalesce(nullif(lower(r->>'vehicle_type'),''),'car'),nullif(r->>'vehicle_model',''),case when lower(coalesce(r->>'is_ev','')) in ('true','1','yes','y') then true else false end,auth.uid()) returning id into vehicle_id;end if;end if;
  if slot<>'' then insert into public.hs_parking_slots(network_id,slot_code,zone,slot_type,status) values(nid,slot,nullif(r->>'parking_zone',''),coalesce(nullif(lower(r->>'vehicle_type'),''),'car'),'allocated') on conflict(network_id,slot_code) do update set status='allocated',updated_at=now() returning id into slot_id;if not exists(select 1 from public.hs_parking_allocations where network_id=nid and parking_slot_id=slot_id and ends_on is null) then insert into public.hs_parking_allocations(network_id,parking_slot_id,vehicle_id,unit_entity_id,created_by) values(nid,slot_id,vehicle_id,unit_id,auth.uid());end if;end if;
 end loop;
 update public.hs_import_batches set inserted_count=i,updated_count=u,skipped_count=sk,status='committed',committed_at=now() where id=batch_id;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'hs1_bulk_import_committed',jsonb_build_object('batch_id',batch_id,'inserted',i,'updated',u,'skipped',sk));
 return jsonb_build_object('batchId',batch_id,'inserted',i,'updated',u,'skipped',sk);
exception when others then update public.hs_import_batches set status='failed' where id=batch_id;raise;end $$;
revoke all on function public.hs1_import_resident_rows(jsonb,text,jsonb) from public;grant execute on function public.hs1_import_resident_rows(jsonb,text,jsonb) to authenticated;

insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind) values
 ('housing-society.core.my-flat','core','released','{}'::uuid[],'housing-society'),('housing-society.core.occupancy-history','core','released','{}'::uuid[],'housing-society'),('housing-society.core.parking','core','released','{}'::uuid[],'housing-society'),('housing-society.core.claiming','core','released','{}'::uuid[],'housing-society'),('housing-society.admin.bulk-onboarding','admin','released','{}'::uuid[],'housing-society')
on conflict(feature_key) do update set bundle_key=excluded.bundle_key,rollout_state=excluded.rollout_state,vertical_kind=excluded.vertical_kind;

do $$ begin
 if to_regclass('public.hs_unit_occupancy_history') is null or to_regclass('public.hs_vehicles') is null or to_regclass('public.hs_parking_slots') is null then raise exception 'HS-1 compatibility check failed: core tables missing.';end if;
 if not public.g8_allowed_entity_kind('housing-society','unit') or not public.g8_allowed_entity_kind('housing-society','person') then raise exception 'HS-1 compatibility check failed: HS-0 entity contracts missing.';end if;
end $$;
