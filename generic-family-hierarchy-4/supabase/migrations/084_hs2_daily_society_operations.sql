-- HS-2 — Daily Society Operations
-- Additive + rerunnable. HS-3 billing intentionally excluded.

create table if not exists public.hs_notices(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 title varchar(220) not null,
 body text,
 notice_type varchar(20) not null default 'general' check(notice_type in ('general','urgent','targeted')),
 audience jsonb not null default '{}'::jsonb,
 pinned boolean not null default false,
 expires_at timestamptz,
 attachments jsonb not null default '[]'::jsonb,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists idx_hs_notices_network_active on public.hs_notices(network_id,pinned desc,created_at desc);

create table if not exists public.hs_vendors(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 name varchar(220) not null,
 category varchar(100) not null,
 contact_name varchar(160), phone varchar(60), email varchar(320),
 status varchar(20) not null default 'active' check(status in ('active','inactive','blocked')),
 metadata jsonb not null default '{}'::jsonb,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(network_id,name,category)
);

create table if not exists public.hs_vendor_contracts(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 vendor_id uuid not null references public.hs_vendors(id) on delete cascade,
 title varchar(220) not null,
 starts_on date, ends_on date, sla text, amount numeric(14,2),
 status varchar(20) not null default 'active' check(status in ('draft','active','expired','terminated')),
 documents jsonb not null default '[]'::jsonb,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists idx_hs_vendor_contracts_network_vendor on public.hs_vendor_contracts(network_id,vendor_id,ends_on);

create table if not exists public.hs_complaints(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 unit_entity_id uuid references public.network_entities(id) on delete set null,
 category varchar(100) not null,
 title varchar(220) not null,
 description text,
 attachments jsonb not null default '[]'::jsonb,
 priority varchar(20) not null default 'normal' check(priority in ('low','normal','high','urgent')),
 status varchar(20) not null default 'open' check(status in ('open','in_progress','resolved','closed','reopened')),
 assigned_to uuid references auth.users(id) on delete set null,
 assigned_vendor_id uuid references public.hs_vendors(id) on delete set null,
 sla_due_at timestamptz,
 resolution_note text,
 resolved_at timestamptz,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists idx_hs_complaints_network_status on public.hs_complaints(network_id,status,priority,created_at desc);

create table if not exists public.hs_complaint_comments(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 complaint_id uuid not null references public.hs_complaints(id) on delete cascade,
 body text not null,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);
create index if not exists idx_hs_complaint_comments_complaint on public.hs_complaint_comments(network_id,complaint_id,created_at);

create table if not exists public.hs_amenities(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 name varchar(180) not null,
 description text, location varchar(220), capacity integer,
 booking_mode varchar(20) not null default 'approval' check(booking_mode in ('approval','instant','disabled')),
 status varchar(20) not null default 'active' check(status in ('active','maintenance','inactive')),
 rules jsonb not null default '{}'::jsonb,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(network_id,name)
);

create table if not exists public.hs_amenity_bookings(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 amenity_id uuid not null references public.hs_amenities(id) on delete cascade,
 unit_entity_id uuid references public.network_entities(id) on delete set null,
 starts_at timestamptz not null, ends_at timestamptz not null,
 purpose varchar(300),
 status varchar(20) not null default 'pending' check(status in ('pending','approved','rejected','cancelled','completed')),
 created_by uuid references auth.users(id) on delete set null,
 reviewed_by uuid references auth.users(id) on delete set null,
 reviewed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(ends_at>starts_at)
);
create index if not exists idx_hs_amenity_bookings_network_time on public.hs_amenity_bookings(network_id,amenity_id,starts_at,status);

alter table public.hs_notices enable row level security;
alter table public.hs_vendors enable row level security;
alter table public.hs_vendor_contracts enable row level security;
alter table public.hs_complaints enable row level security;
alter table public.hs_complaint_comments enable row level security;
alter table public.hs_amenities enable row level security;
alter table public.hs_amenity_bookings enable row level security;

do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_notices' and policyname='hs_notices_member_read') then create policy hs_notices_member_read on public.hs_notices for select using(public.is_network_member(network_id)); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_vendors' and policyname='hs_vendors_member_read') then create policy hs_vendors_member_read on public.hs_vendors for select using(public.is_network_member(network_id)); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_vendor_contracts' and policyname='hs_vendor_contracts_admin_read') then create policy hs_vendor_contracts_admin_read on public.hs_vendor_contracts for select using(public.is_network_admin(network_id)); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_complaints' and policyname='hs_complaints_member_read') then create policy hs_complaints_member_read on public.hs_complaints for select using(public.is_network_member(network_id) and (created_by=auth.uid() or public.is_network_admin(network_id))); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_complaint_comments' and policyname='hs_comments_member_read') then create policy hs_comments_member_read on public.hs_complaint_comments for select using(public.is_network_member(network_id) and exists(select 1 from public.hs_complaints c where c.id=complaint_id and c.network_id=network_id and (c.created_by=auth.uid() or public.is_network_admin(c.network_id)))); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_amenities' and policyname='hs_amenities_member_read') then create policy hs_amenities_member_read on public.hs_amenities for select using(public.is_network_member(network_id)); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_amenity_bookings' and policyname='hs_bookings_member_read') then create policy hs_bookings_member_read on public.hs_amenity_bookings for select using(public.is_network_member(network_id) and (created_by=auth.uid() or public.is_network_admin(network_id))); end if;
end $$;

create or replace function public.hs2_assert_network() returns uuid language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
 if nid is null or not public.is_network_member(nid) then raise exception 'Housing Society membership required.' using errcode='42501'; end if;
 if coalesce((select vertical_kind from public.networks where id=nid),'')<>'housing-society' then raise exception 'HS-2 is available only for housing-society networks.' using errcode='22023'; end if;
 return nid;
end $$;
revoke all on function public.hs2_assert_network() from public; grant execute on function public.hs2_assert_network() to authenticated;

create or replace function public.hs2_get_operations_snapshot() returns jsonb language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.hs2_assert_network(); isadm boolean:=public.is_network_admin(nid);
begin
 return jsonb_build_object(
  'notices',coalesce((select jsonb_agg(jsonb_build_object('id',n.id,'title',n.title,'body',n.body,'noticeType',n.notice_type,'pinned',n.pinned,'expiresAt',n.expires_at,'createdAt',n.created_at,'createdBy',n.created_by) order by n.pinned desc,n.created_at desc) from public.hs_notices n where n.network_id=nid and (n.expires_at is null or n.expires_at>now())),'[]'::jsonb),
  'complaints',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'unitEntityId',c.unit_entity_id,'unitLabel',u.label,'category',c.category,'title',c.title,'description',c.description,'priority',c.priority,'status',c.status,'slaDueAt',c.sla_due_at,'assignedTo',c.assigned_to,'assignedVendorId',c.assigned_vendor_id,'resolutionNote',c.resolution_note,'createdAt',c.created_at,'updatedAt',c.updated_at,'createdBy',c.created_by,'comments',coalesce((select jsonb_agg(jsonb_build_object('id',cc.id,'body',cc.body,'createdAt',cc.created_at,'authorLabel',coalesce(ne.label,au.email,'Member')) order by cc.created_at) from public.hs_complaint_comments cc left join auth.users au on au.id=cc.created_by left join public.network_entities ne on ne.network_id=nid and ne.owner_user_id=cc.created_by where cc.complaint_id=c.id),'[]'::jsonb)) order by c.created_at desc) from public.hs_complaints c left join public.network_entities u on u.id=c.unit_entity_id and u.network_id=nid where c.network_id=nid and (isadm or c.created_by=auth.uid())),'[]'::jsonb),
  'vendors',coalesce((select jsonb_agg(jsonb_build_object('id',v.id,'name',v.name,'category',v.category,'contactName',v.contact_name,'phone',case when isadm then v.phone else null end,'email',case when isadm then v.email else null end,'status',v.status,'contractCount',(select count(*) from public.hs_vendor_contracts vc where vc.vendor_id=v.id)) order by v.name) from public.hs_vendors v where v.network_id=nid and (isadm or v.status='active')),'[]'::jsonb),
  'amenities',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'name',a.name,'description',a.description,'location',a.location,'capacity',a.capacity,'bookingMode',a.booking_mode,'status',a.status) order by a.name) from public.hs_amenities a where a.network_id=nid),'[]'::jsonb),
  'bookings',coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'amenityId',b.amenity_id,'amenityName',a.name,'unitEntityId',b.unit_entity_id,'startsAt',b.starts_at,'endsAt',b.ends_at,'status',b.status,'purpose',b.purpose,'createdBy',b.created_by) order by b.starts_at desc) from public.hs_amenity_bookings b join public.hs_amenities a on a.id=b.amenity_id where b.network_id=nid and (isadm or b.created_by=auth.uid()) and b.starts_at>now()-interval '30 days'),'[]'::jsonb)
 );
end $$;
revoke all on function public.hs2_get_operations_snapshot() from public; grant execute on function public.hs2_get_operations_snapshot() to authenticated;

create or replace function public.hs2_create_notice(p_title text,p_body text default null,p_notice_type text default 'general',p_pinned boolean default false,p_expires_at timestamptz default null) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs2_assert_network(); rid uuid;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 if p_notice_type not in ('general','urgent','targeted') then raise exception 'Invalid notice type.'; end if;
 if length(trim(coalesce(p_title,'')))<2 then raise exception 'Notice title is required.'; end if;
 insert into public.hs_notices(network_id,title,body,notice_type,pinned,expires_at,created_by) values(nid,trim(p_title),nullif(trim(p_body),''),p_notice_type,p_pinned,p_expires_at,auth.uid()) returning id into rid;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'hs2_notice_published',jsonb_build_object('notice_id',rid,'type',p_notice_type)); return rid;
end $$;
revoke all on function public.hs2_create_notice(text,text,text,boolean,timestamptz) from public; grant execute on function public.hs2_create_notice(text,text,text,boolean,timestamptz) to authenticated;

create or replace function public.hs2_create_complaint(p_unit_entity_id uuid,p_category text,p_title text,p_description text default null,p_priority text default 'normal',p_photo_url text default null) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs2_assert_network(); rid uuid; resolved_unit uuid:=p_unit_entity_id; person_id uuid;
begin
 if resolved_unit is null then select id into person_id from public.network_entities where network_id=nid and kind='person' and owner_user_id=auth.uid() order by updated_at desc limit 1; if person_id is not null then select unit_entity_id into resolved_unit from public.hs_unit_occupancy_history where network_id=nid and subject_entity_id=person_id and ends_on is null order by is_primary desc,starts_on desc limit 1; end if; end if;
 if p_priority not in ('low','normal','high','urgent') then raise exception 'Invalid priority.'; end if;
 if resolved_unit is not null and not exists(select 1 from public.network_entities where id=resolved_unit and network_id=nid and kind='unit') then raise exception 'Unit not found in this society.'; end if;
 insert into public.hs_complaints(network_id,unit_entity_id,category,title,description,attachments,priority,created_by) values(nid,resolved_unit,coalesce(nullif(trim(p_category),''),'Other'),trim(p_title),nullif(trim(p_description),''),case when nullif(trim(p_photo_url),'') is null then '[]'::jsonb else jsonb_build_array(jsonb_build_object('kind','photo','url',trim(p_photo_url))) end,p_priority,auth.uid()) returning id into rid;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'hs2_complaint_created',jsonb_build_object('complaint_id',rid,'priority',p_priority)); return rid;
end $$;
revoke all on function public.hs2_create_complaint(uuid,text,text,text,text,text) from public; grant execute on function public.hs2_create_complaint(uuid,text,text,text,text,text) to authenticated;

create or replace function public.hs2_update_complaint(p_complaint_id uuid,p_status text default null,p_assigned_to uuid default null,p_assigned_vendor_id uuid default null,p_sla_due_at timestamptz default null,p_resolution_note text default null) returns void language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs2_assert_network();
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 if p_status is not null and p_status not in ('open','in_progress','resolved','closed','reopened') then raise exception 'Invalid complaint status.'; end if;
 if p_assigned_vendor_id is not null and not exists(select 1 from public.hs_vendors where id=p_assigned_vendor_id and network_id=nid) then raise exception 'Vendor not found.'; end if;
 update public.hs_complaints set status=coalesce(p_status,status),assigned_to=coalesce(p_assigned_to,assigned_to),assigned_vendor_id=coalesce(p_assigned_vendor_id,assigned_vendor_id),sla_due_at=coalesce(p_sla_due_at,sla_due_at),resolution_note=coalesce(nullif(trim(p_resolution_note),''),resolution_note),resolved_at=case when coalesce(p_status,status) in ('resolved','closed') then coalesce(resolved_at,now()) when p_status='reopened' then null else resolved_at end,updated_at=now() where id=p_complaint_id and network_id=nid;
 if not found then raise exception 'Complaint not found.'; end if;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'hs2_complaint_updated',jsonb_build_object('complaint_id',p_complaint_id,'status',p_status));
end $$;
revoke all on function public.hs2_update_complaint(uuid,text,uuid,uuid,timestamptz,text) from public; grant execute on function public.hs2_update_complaint(uuid,text,uuid,uuid,timestamptz,text) to authenticated;

create or replace function public.hs2_add_complaint_comment(p_complaint_id uuid,p_body text) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs2_assert_network(); rid uuid; owner_id uuid;
begin
 select created_by into owner_id from public.hs_complaints where id=p_complaint_id and network_id=nid;
 if owner_id is null and not exists(select 1 from public.hs_complaints where id=p_complaint_id and network_id=nid) then raise exception 'Complaint not found.'; end if;
 if not public.is_network_admin(nid) and owner_id is distinct from auth.uid() then raise exception 'You can comment only on your complaint.' using errcode='42501'; end if;
 if length(trim(coalesce(p_body,'')))<2 then raise exception 'Comment is required.'; end if;
 insert into public.hs_complaint_comments(network_id,complaint_id,body,created_by) values(nid,p_complaint_id,trim(p_body),auth.uid()) returning id into rid; return rid;
end $$;
revoke all on function public.hs2_add_complaint_comment(uuid,text) from public; grant execute on function public.hs2_add_complaint_comment(uuid,text) to authenticated;

create or replace function public.hs2_upsert_vendor(p_id uuid,p_name text,p_category text,p_contact_name text default null,p_phone text default null,p_email text default null,p_status text default 'active') returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs2_assert_network(); rid uuid;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 if p_status not in ('active','inactive','blocked') then raise exception 'Invalid vendor status.'; end if;
 if p_id is null then insert into public.hs_vendors(network_id,name,category,contact_name,phone,email,status,created_by) values(nid,trim(p_name),trim(p_category),nullif(trim(p_contact_name),''),nullif(trim(p_phone),''),nullif(lower(trim(p_email)),''),p_status,auth.uid()) on conflict(network_id,name,category) do update set contact_name=excluded.contact_name,phone=excluded.phone,email=excluded.email,status=excluded.status,updated_at=now() returning id into rid;
 else update public.hs_vendors set name=trim(p_name),category=trim(p_category),contact_name=nullif(trim(p_contact_name),''),phone=nullif(trim(p_phone),''),email=nullif(lower(trim(p_email)),''),status=p_status,updated_at=now() where id=p_id and network_id=nid returning id into rid; end if;
 return rid;
end $$;
revoke all on function public.hs2_upsert_vendor(uuid,text,text,text,text,text,text) from public; grant execute on function public.hs2_upsert_vendor(uuid,text,text,text,text,text,text) to authenticated;

create or replace function public.hs2_create_vendor_contract(p_vendor_id uuid,p_title text,p_starts_on date default null,p_ends_on date default null,p_sla text default null,p_amount numeric default null) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs2_assert_network(); rid uuid;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 if not exists(select 1 from public.hs_vendors where id=p_vendor_id and network_id=nid) then raise exception 'Vendor not found.'; end if;
 insert into public.hs_vendor_contracts(network_id,vendor_id,title,starts_on,ends_on,sla,amount,status,created_by) values(nid,p_vendor_id,trim(p_title),p_starts_on,p_ends_on,nullif(trim(p_sla),''),p_amount,case when p_starts_on is null or p_starts_on<=current_date then 'active' else 'draft' end,auth.uid()) returning id into rid; return rid;
end $$;
revoke all on function public.hs2_create_vendor_contract(uuid,text,date,date,text,numeric) from public; grant execute on function public.hs2_create_vendor_contract(uuid,text,date,date,text,numeric) to authenticated;

create or replace function public.hs2_upsert_amenity(p_id uuid,p_name text,p_description text default null,p_location text default null,p_capacity integer default null,p_booking_mode text default 'approval',p_status text default 'active') returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs2_assert_network(); rid uuid;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 if p_booking_mode not in ('approval','instant','disabled') or p_status not in ('active','maintenance','inactive') then raise exception 'Invalid amenity configuration.'; end if;
 if p_id is null then insert into public.hs_amenities(network_id,name,description,location,capacity,booking_mode,status,created_by) values(nid,trim(p_name),nullif(trim(p_description),''),nullif(trim(p_location),''),p_capacity,p_booking_mode,p_status,auth.uid()) on conflict(network_id,name) do update set description=excluded.description,location=excluded.location,capacity=excluded.capacity,booking_mode=excluded.booking_mode,status=excluded.status,updated_at=now() returning id into rid;
 else update public.hs_amenities set name=trim(p_name),description=nullif(trim(p_description),''),location=nullif(trim(p_location),''),capacity=p_capacity,booking_mode=p_booking_mode,status=p_status,updated_at=now() where id=p_id and network_id=nid returning id into rid; end if; return rid;
end $$;
revoke all on function public.hs2_upsert_amenity(uuid,text,text,text,integer,text,text) from public; grant execute on function public.hs2_upsert_amenity(uuid,text,text,text,integer,text,text) to authenticated;

create or replace function public.hs2_create_amenity_booking(p_amenity_id uuid,p_unit_entity_id uuid,p_starts_at timestamptz,p_ends_at timestamptz,p_purpose text default null) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs2_assert_network(); rid uuid; mode text; st text; resolved_unit uuid:=p_unit_entity_id; person_id uuid;
begin
 if resolved_unit is null then select id into person_id from public.network_entities where network_id=nid and kind='person' and owner_user_id=auth.uid() order by updated_at desc limit 1; if person_id is not null then select unit_entity_id into resolved_unit from public.hs_unit_occupancy_history where network_id=nid and subject_entity_id=person_id and ends_on is null order by is_primary desc,starts_on desc limit 1; end if; end if;
 select booking_mode,status into mode,st from public.hs_amenities where id=p_amenity_id and network_id=nid;
 if mode is null or st<>'active' or mode='disabled' then raise exception 'Amenity is not bookable.'; end if;
 if p_ends_at<=p_starts_at then raise exception 'Booking end must be after start.'; end if;
 if exists(select 1 from public.hs_amenity_bookings where network_id=nid and amenity_id=p_amenity_id and status in ('pending','approved') and tstzrange(starts_at,ends_at,'[)') && tstzrange(p_starts_at,p_ends_at,'[)')) then raise exception 'This amenity already has an overlapping booking.' using errcode='23505'; end if;
 insert into public.hs_amenity_bookings(network_id,amenity_id,unit_entity_id,starts_at,ends_at,purpose,status,created_by) values(nid,p_amenity_id,resolved_unit,p_starts_at,p_ends_at,nullif(trim(p_purpose),''),case when mode='instant' then 'approved' else 'pending' end,auth.uid()) returning id into rid; return rid;
end $$;
revoke all on function public.hs2_create_amenity_booking(uuid,uuid,timestamptz,timestamptz,text) from public; grant execute on function public.hs2_create_amenity_booking(uuid,uuid,timestamptz,timestamptz,text) to authenticated;

create or replace function public.hs2_review_amenity_booking(p_booking_id uuid,p_status text) returns void language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs2_assert_network(); own uuid;
begin
 if p_status not in ('approved','rejected','cancelled') then raise exception 'Invalid booking review.'; end if;
 select created_by into own from public.hs_amenity_bookings where id=p_booking_id and network_id=nid;
 if own is null and not exists(select 1 from public.hs_amenity_bookings where id=p_booking_id and network_id=nid) then raise exception 'Booking not found.'; end if;
 if p_status in ('approved','rejected') and not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 if p_status='cancelled' and not public.is_network_admin(nid) and own is distinct from auth.uid() then raise exception 'You can cancel only your booking.' using errcode='42501'; end if;
 update public.hs_amenity_bookings set status=p_status,reviewed_by=case when public.is_network_admin(nid) then auth.uid() else reviewed_by end,reviewed_at=case when public.is_network_admin(nid) then now() else reviewed_at end,updated_at=now() where id=p_booking_id and network_id=nid;
end $$;
revoke all on function public.hs2_review_amenity_booking(uuid,text) from public; grant execute on function public.hs2_review_amenity_booking(uuid,text) to authenticated;

insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind) values
 ('housing-society.ops.notices','community','released','{}'::uuid[],'housing-society'),
 ('housing-society.ops.complaints','community','released','{}'::uuid[],'housing-society'),
 ('housing-society.ops.vendors','admin','released','{}'::uuid[],'housing-society'),
 ('housing-society.ops.amenities','community','released','{}'::uuid[],'housing-society'),
 ('housing-society.ops.coming-up','community','released','{}'::uuid[],'housing-society')
on conflict(feature_key) do update set bundle_key=excluded.bundle_key,rollout_state=excluded.rollout_state,vertical_kind=excluded.vertical_kind;

do $$ begin
 if to_regclass('public.hs_notices') is null or to_regclass('public.hs_complaints') is null or to_regclass('public.hs_vendors') is null or to_regclass('public.hs_amenities') is null then raise exception 'HS-2 compatibility check failed: daily operations tables missing.'; end if;
 if to_regprocedure('public.hs2_get_operations_snapshot()') is null or to_regprocedure('public.hs2_create_complaint(uuid,text,text,text,text,text)') is null then raise exception 'HS-2 compatibility check failed: RPCs missing.'; end if;
end $$;
