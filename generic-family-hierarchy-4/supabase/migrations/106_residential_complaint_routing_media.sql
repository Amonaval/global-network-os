-- E4 — Residential complaint routing, private photos and workflow notifications.

update public.networks set photo_upload_enabled=true,photo_max_bytes=greatest(photo_max_bytes,262144),updated_at=now()
where vertical_kind='housing-society';

create table if not exists public.hs_complaint_routes(
 network_id uuid not null references public.networks(id) on delete cascade,
 category_key varchar(80) not null,
 role_key varchar(60) not null,
 updated_by uuid references auth.users(id) on delete set null,
 updated_at timestamptz not null default now(),
 primary key(network_id,category_key)
);
alter table public.hs_complaint_routes enable row level security;
revoke all on public.hs_complaint_routes from anon,authenticated;

create or replace function public.hs4_category_key(p_category text) returns text language sql immutable as $$
 select trim(both '-' from regexp_replace(lower(trim(coalesce(p_category,'other'))),'[^a-z0-9]+','-','g'));
$$;

create or replace function public.hs4_get_complaint_routes()
returns table(category_key varchar,role_key varchar,role_label text,assignee_count bigint)
language sql security definer stable set search_path=public as $$
 select r.category_key,r.role_key,initcap(replace(r.role_key,'-',' '))::text,
        (select count(*) from public.network_notification_roles nr where nr.network_id=r.network_id and nr.role_key=r.role_key and nr.active)
 from public.hs_complaint_routes r where r.network_id=public.hs2_assert_network() order by r.category_key;
$$;
revoke all on function public.hs4_get_complaint_routes() from public;grant execute on function public.hs4_get_complaint_routes() to authenticated;

create or replace function public.hs4_set_complaint_route(p_category text,p_role_key text) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs2_assert_network(); ckey text:=public.hs4_category_key(p_category); rkey text:=trim(both '-' from regexp_replace(lower(trim(p_role_key)),'[^a-z0-9]+','-','g'));
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501';end if;
 if length(rkey)<2 then raise exception 'Responsibility role is required.' using errcode='22023';end if;
 insert into public.hs_complaint_routes(network_id,category_key,role_key,updated_by,updated_at) values(nid,ckey,rkey,auth.uid(),now())
 on conflict(network_id,category_key) do update set role_key=excluded.role_key,updated_by=auth.uid(),updated_at=now();
end $$;
revoke all on function public.hs4_set_complaint_route(text,text) from public;grant execute on function public.hs4_set_complaint_route(text,text) to authenticated;

-- Seed sensible role routes only when a society has not configured them.
insert into public.hs_complaint_routes(network_id,category_key,role_key)
select n.id,x.category_key,x.role_key from public.networks n cross join (values
 ('common-area','complaint-resolver'),('lift','facilities'),('electrical','facilities'),('plumbing','facilities'),('security','security'),('housekeeping','facilities'),('parking','complaint-resolver'),('other','complaint-resolver')
) x(category_key,role_key) where n.vertical_kind='housing-society'
on conflict(network_id,category_key) do nothing;

-- Private community-media reads now include complaint attachments, but only for the raiser,
-- assigned resolver or society admin. Existing memory authorization is preserved.
create or replace function public.can_read_community_media(object_name text) returns boolean
language sql security definer stable set search_path=public as $$
 select auth.uid() is not null and (
   (object_name like public.current_network_id()::text||'/%' and public.is_network_member(public.current_network_id()))
   or object_name like 'community/'||auth.uid()::text||'/%'
 ) and (
   public.is_network_admin()
   or object_name like public.current_network_id()::text||'/community/'||auth.uid()::text||'/%'
   or object_name like 'community/'||auth.uid()::text||'/%'
   or exists(select 1 from public.memories m left join public.family_members fm on fm.id=m.member_id and fm.network_id=m.network_id
     where m.network_id=public.current_network_id() and (m.photo_url=object_name or m.photo_url like '%/community-media/'||object_name)
       and m.visibility<>'admin' and (m.member_id is null or (fm.profile_status='approved' and fm.profile_visibility<>'admin')))
   or exists(select 1 from public.hs_complaints c cross join lateral jsonb_array_elements(c.attachments) a
     where c.network_id=public.current_network_id() and coalesce(a->>'path',a->>'url')=object_name
       and (c.created_by=auth.uid() or c.assigned_to=auth.uid() or public.is_network_admin(c.network_id)))
 );
$$;
revoke all on function public.can_read_community_media(text) from public;grant execute on function public.can_read_community_media(text) to authenticated;

create or replace function public.hs4_get_operations_snapshot() returns jsonb language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.hs2_assert_network(); isadm boolean:=public.is_network_admin(nid);
begin
 return jsonb_build_object(
  'notices',coalesce((select jsonb_agg(jsonb_build_object('id',n.id,'title',n.title,'body',n.body,'noticeType',n.notice_type,'pinned',n.pinned,'expiresAt',n.expires_at,'createdAt',n.created_at,'createdBy',n.created_by) order by n.pinned desc,n.created_at desc) from public.hs_notices n where n.network_id=nid and (n.expires_at is null or n.expires_at>now())),'[]'::jsonb),
  'complaints',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'unitEntityId',c.unit_entity_id,'unitLabel',u.label,'category',c.category,'title',c.title,'description',c.description,'attachments',c.attachments,'priority',c.priority,'status',c.status,'slaDueAt',c.sla_due_at,'assignedTo',c.assigned_to,'assignedToLabel',coalesce(ae.label,au.email),'assignedVendorId',c.assigned_vendor_id,'resolutionNote',c.resolution_note,'createdAt',c.created_at,'updatedAt',c.updated_at,'createdBy',c.created_by,'comments',coalesce((select jsonb_agg(jsonb_build_object('id',cc.id,'body',cc.body,'createdAt',cc.created_at,'authorLabel',coalesce(ne.label,cu.email,'Member')) order by cc.created_at) from public.hs_complaint_comments cc left join auth.users cu on cu.id=cc.created_by left join public.network_entities ne on ne.network_id=nid and ne.owner_user_id=cc.created_by where cc.complaint_id=c.id),'[]'::jsonb)) order by c.created_at desc)
    from public.hs_complaints c left join public.network_entities u on u.id=c.unit_entity_id and u.network_id=nid left join auth.users au on au.id=c.assigned_to left join public.network_entities ae on ae.network_id=nid and ae.owner_user_id=c.assigned_to
    where c.network_id=nid and (isadm or c.created_by=auth.uid() or c.assigned_to=auth.uid())),'[]'::jsonb),
  'vendors',coalesce((select jsonb_agg(jsonb_build_object('id',v.id,'name',v.name,'category',v.category,'contactName',v.contact_name,'phone',case when isadm then v.phone else null end,'email',case when isadm then v.email else null end,'status',v.status,'contractCount',(select count(*) from public.hs_vendor_contracts vc where vc.vendor_id=v.id)) order by v.name) from public.hs_vendors v where v.network_id=nid and (isadm or v.status='active')),'[]'::jsonb),
  'amenities',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'name',a.name,'description',a.description,'location',a.location,'capacity',a.capacity,'bookingMode',a.booking_mode,'status',a.status) order by a.name) from public.hs_amenities a where a.network_id=nid),'[]'::jsonb),
  'bookings',coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'amenityId',b.amenity_id,'amenityName',a.name,'unitEntityId',b.unit_entity_id,'startsAt',b.starts_at,'endsAt',b.ends_at,'status',b.status,'purpose',b.purpose,'createdBy',b.created_by) order by b.starts_at desc) from public.hs_amenity_bookings b join public.hs_amenities a on a.id=b.amenity_id where b.network_id=nid and (isadm or b.created_by=auth.uid()) and b.starts_at>now()-interval '30 days'),'[]'::jsonb)
 );
end $$;
revoke all on function public.hs4_get_operations_snapshot() from public;grant execute on function public.hs4_get_operations_snapshot() to authenticated;

create or replace function public.hs4_create_complaint(p_unit_entity_id uuid,p_category text,p_title text,p_description text default null,p_priority text default 'normal',p_photo_path text default null) returns jsonb
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs2_assert_network(); rid uuid; resolved_unit uuid:=p_unit_entity_id; person_id uuid; ckey text; rkey text; assignee uuid; target uuid; notification_ids uuid[]:='{}'; notification_id uuid;
begin
 if resolved_unit is null then select id into person_id from public.network_entities where network_id=nid and kind='person' and owner_user_id=auth.uid() order by updated_at desc limit 1; if person_id is not null then select unit_entity_id into resolved_unit from public.hs_unit_occupancy_history where network_id=nid and subject_entity_id=person_id and ends_on is null order by is_primary desc,starts_on desc limit 1; end if;end if;
 if p_priority not in ('low','normal','high','urgent') then raise exception 'Invalid priority.';end if;
 if resolved_unit is not null and not exists(select 1 from public.network_entities where id=resolved_unit and network_id=nid and kind='unit') then raise exception 'Unit not found in this society.';end if;
 if nullif(trim(coalesce(p_photo_path,'')),'') is not null and p_photo_path not like nid::text||'/community/'||auth.uid()::text||'/%' then raise exception 'Complaint photo must be uploaded by the signed-in resident.' using errcode='42501';end if;
 ckey:=public.hs4_category_key(p_category);select role_key into rkey from public.hs_complaint_routes where network_id=nid and category_key=ckey;
 select nr.user_id into assignee from public.network_notification_roles nr where nr.network_id=nid and nr.active and nr.role_key=coalesce(rkey,'complaint-resolver') order by nr.updated_at desc limit 1;
 insert into public.hs_complaints(network_id,unit_entity_id,category,title,description,attachments,priority,assigned_to,created_by)
 values(nid,resolved_unit,coalesce(nullif(trim(p_category),''),'Other'),trim(p_title),nullif(trim(p_description),''),case when nullif(trim(coalesce(p_photo_path,'')),'') is null then '[]'::jsonb else jsonb_build_array(jsonb_build_object('kind','photo','path',trim(p_photo_path))) end,p_priority,assignee,auth.uid()) returning id into rid;
 for target in select distinct x.user_id from (select nr.user_id from public.network_notification_roles nr where nr.network_id=nid and nr.active and nr.role_key=coalesce(rkey,'complaint-resolver') union all select nm.user_id from public.network_memberships nm where nm.network_id=nid and nm.status='active' and nm.role in ('owner','admin') and assignee is null) x loop
  if target=auth.uid() then continue;end if;notification_id:=public.create_network_notification(nid,target,'complaint-created','New complaint · '||trim(p_title),nullif(trim(p_description),''),'complaints','hs_complaint',rid,case when p_priority in ('urgent','high') then p_priority else 'normal' end,jsonb_build_object('surface','complaints','category',p_category),auth.uid());notification_ids:=array_append(notification_ids,notification_id);end loop;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'hs4_complaint_created',jsonb_build_object('complaint_id',rid,'priority',p_priority,'route',rkey,'assignee',assignee));
 return jsonb_build_object('complaint_id',rid,'assigned_to',assignee,'notification_ids',notification_ids);
end $$;
revoke all on function public.hs4_create_complaint(uuid,text,text,text,text,text) from public;grant execute on function public.hs4_create_complaint(uuid,text,text,text,text,text) to authenticated;

create or replace function public.hs4_update_complaint(p_complaint_id uuid,p_status text default null,p_assigned_to uuid default null,p_assigned_vendor_id uuid default null,p_sla_due_at timestamptz default null,p_resolution_note text default null) returns uuid[]
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs2_assert_network(); oldrow public.hs_complaints; notification_ids uuid[]:='{}'; notification_id uuid; newstatus text;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501';end if;
 select * into oldrow from public.hs_complaints where id=p_complaint_id and network_id=nid;if oldrow.id is null then raise exception 'Complaint not found.';end if;
 if p_status is not null and p_status not in ('open','in_progress','resolved','closed','reopened') then raise exception 'Invalid complaint status.';end if;
 if p_assigned_to is not null and not exists(select 1 from public.network_memberships nm where nm.network_id=nid and nm.user_id=p_assigned_to and nm.status='active') then raise exception 'Assignee must be an active society member.';end if;
 if p_assigned_vendor_id is not null and not exists(select 1 from public.hs_vendors where id=p_assigned_vendor_id and network_id=nid) then raise exception 'Vendor not found.';end if;
 newstatus:=coalesce(p_status,oldrow.status);
 update public.hs_complaints set status=newstatus,assigned_to=coalesce(p_assigned_to,assigned_to),assigned_vendor_id=coalesce(p_assigned_vendor_id,assigned_vendor_id),sla_due_at=coalesce(p_sla_due_at,sla_due_at),resolution_note=coalesce(nullif(trim(p_resolution_note),''),resolution_note),resolved_at=case when newstatus in ('resolved','closed') then coalesce(resolved_at,now()) when p_status='reopened' then null else resolved_at end,updated_at=now() where id=p_complaint_id and network_id=nid;
 if oldrow.created_by is not null and oldrow.created_by<>auth.uid() and (p_status is not null or p_resolution_note is not null) then notification_id:=public.create_network_notification(nid,oldrow.created_by,'complaint-updated','Complaint updated · '||oldrow.title,'Status: '||replace(newstatus,'_',' '),'complaints','hs_complaint',p_complaint_id,case when newstatus in ('resolved','closed') then 'normal' else oldrow.priority end,jsonb_build_object('surface','complaints','status',newstatus),auth.uid());notification_ids:=array_append(notification_ids,notification_id);end if;
 if p_assigned_to is not null and p_assigned_to is distinct from oldrow.assigned_to and p_assigned_to<>auth.uid() then notification_id:=public.create_network_notification(nid,p_assigned_to,'complaint-assigned','Complaint assigned · '||oldrow.title,coalesce(oldrow.description,'Open the complaint for details.'),'complaints','hs_complaint',p_complaint_id,case when oldrow.priority in ('urgent','high') then oldrow.priority else 'normal' end,jsonb_build_object('surface','complaints'),auth.uid());notification_ids:=array_append(notification_ids,notification_id);end if;
 return notification_ids;
end $$;
revoke all on function public.hs4_update_complaint(uuid,text,uuid,uuid,timestamptz,text) from public;grant execute on function public.hs4_update_complaint(uuid,text,uuid,uuid,timestamptz,text) to authenticated;

create or replace function public.hs4_add_complaint_comment(p_complaint_id uuid,p_body text) returns jsonb
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs2_assert_network(); c public.hs_complaints; rid uuid; target uuid; ids uuid[]:='{}'; nid_out uuid;
begin
 select * into c from public.hs_complaints where id=p_complaint_id and network_id=nid;if c.id is null then raise exception 'Complaint not found.';end if;
 if not public.is_network_admin(nid) and c.created_by is distinct from auth.uid() and c.assigned_to is distinct from auth.uid() then raise exception 'You are not part of this complaint workflow.' using errcode='42501';end if;
 if length(trim(coalesce(p_body,'')))<2 then raise exception 'Comment is required.';end if;
 insert into public.hs_complaint_comments(network_id,complaint_id,body,created_by) values(nid,p_complaint_id,trim(p_body),auth.uid()) returning id into rid;
 for target in select distinct x from unnest(array[c.created_by,c.assigned_to]) x where x is not null and x<>auth.uid() loop nid_out:=public.create_network_notification(nid,target,'complaint-comment','New complaint comment · '||c.title,trim(p_body),'complaints','hs_complaint',p_complaint_id,'normal',jsonb_build_object('surface','complaints','comment_id',rid),auth.uid());ids:=array_append(ids,nid_out);end loop;
 return jsonb_build_object('comment_id',rid,'notification_ids',ids);
end $$;
revoke all on function public.hs4_add_complaint_comment(uuid,text) from public;grant execute on function public.hs4_add_complaint_comment(uuid,text) to authenticated;
