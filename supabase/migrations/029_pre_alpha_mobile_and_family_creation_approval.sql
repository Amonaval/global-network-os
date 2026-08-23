-- Pre-alpha launch hardening
-- 1) Family creation requires platform-owner approval.
-- 2) The requester becomes Owner after approval.

create table if not exists public.family_creation_requests (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references auth.users(id) on delete cascade,
  name varchar(180) not null,
  slug varchar(80),
  description text not null default '',
  status varchar(20) not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  network_id uuid references public.networks(id) on delete set null,
  decision_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_family_creation_pending_user
  on public.family_creation_requests(requester_user_id)
  where status='pending';

alter table public.family_creation_requests enable row level security;
drop policy if exists "requester reads own family requests" on public.family_creation_requests;
create policy "requester reads own family requests" on public.family_creation_requests
for select to authenticated using (requester_user_id=auth.uid() or public.is_platform_owner());

-- Direct family creation is a platform-owner operation only. This prevents UI bypass.
create or replace function public.create_family(p_name text,p_slug text default null,p_description text default '')
returns uuid
language plpgsql security definer set search_path=public as $$
declare
  uid uuid:=auth.uid(); nid uuid; base_slug text; final_slug text; suffix integer:=1;
begin
  if uid is null then raise exception 'Sign in is required to create a family.' using errcode='42501'; end if;
  if not public.is_platform_owner() then
    raise exception 'Family creation requires platform-owner approval.' using errcode='42501';
  end if;
  if length(trim(coalesce(p_name,'')))<2 then raise exception 'Please give your family a name.' using errcode='22023'; end if;

  base_slug:=public.slugify_family_name(coalesce(nullif(trim(p_slug),''),p_name));
  if length(base_slug)<2 then base_slug:='family'; end if;
  base_slug:=left(base_slug,60); final_slug:=base_slug;
  while exists(select 1 from public.networks where slug=final_slug) loop
    suffix:=suffix+1; final_slug:=left(base_slug,54)||'-'||suffix::text;
  end loop;

  insert into public.networks(name,slug,created_by,photo_upload_enabled)
  values(left(trim(p_name),180),final_slug,uid,false) returning id into nid;

  insert into public.network_memberships(network_id,user_id,role,status)
  values(nid,uid,'owner','active');

  insert into public.network_settings(
    id,network_id,name,description,entity_label,entity_label_plural,level_label,level_label_plural,
    parent_label,child_label,peer_label,network_template,photo_upload_enabled
  ) values(
    'network',nid,left(trim(p_name),180),coalesce(p_description,''),'Member','Members','Generation','Generations',
    'Parent','Child','Spouse','family',false
  );

  update public.profiles set active_network_id=nid,member_id=null,updated_at=now() where id=uid;
  return nid;
end;
$$;
revoke all on function public.create_family(text,text,text) from public;
grant execute on function public.create_family(text,text,text) to authenticated;

create or replace function public.request_family_creation(p_name text,p_description text default '')
returns uuid
language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); rid uuid;
begin
  if uid is null then raise exception 'Sign in is required.' using errcode='42501'; end if;
  if length(trim(coalesce(p_name,'')))<2 then raise exception 'Please give your family a name.' using errcode='22023'; end if;
  if exists(select 1 from public.family_creation_requests where requester_user_id=uid and status='pending') then
    select id into rid from public.family_creation_requests where requester_user_id=uid and status='pending' order by created_at desc limit 1;
    return rid;
  end if;
  insert into public.family_creation_requests(requester_user_id,name,description,slug)
  values(uid,left(trim(p_name),180),coalesce(p_description,''),left(public.slugify_family_name(p_name),60))
  returning id into rid;
  return rid;
end;
$$;
revoke all on function public.request_family_creation(text,text) from public;
grant execute on function public.request_family_creation(text,text) to authenticated;

create or replace function public.get_my_family_creation_requests()
returns table(id uuid,name varchar,status varchar,decision_note text,created_at timestamptz,reviewed_at timestamptz,network_id uuid)
language sql security definer stable set search_path=public as $$
  select r.id,r.name,r.status,r.decision_note,r.created_at,r.reviewed_at,r.network_id
  from public.family_creation_requests r
  where r.requester_user_id=auth.uid()
  order by r.created_at desc;
$$;
revoke all on function public.get_my_family_creation_requests() from public;
grant execute on function public.get_my_family_creation_requests() to authenticated;

create or replace function public.get_platform_family_creation_requests()
returns table(id uuid,requester_user_id uuid,requester_email text,name varchar,description text,status varchar,created_at timestamptz,reviewed_at timestamptz,decision_note text,network_id uuid)
language sql security definer stable set search_path=public as $$
  select r.id,r.requester_user_id,u.email::text,r.name,r.description,r.status,r.created_at,r.reviewed_at,r.decision_note,r.network_id
  from public.family_creation_requests r
  join auth.users u on u.id=r.requester_user_id
  where public.is_platform_owner()
  order by (r.status='pending') desc,r.created_at desc;
$$;
revoke all on function public.get_platform_family_creation_requests() from public;
grant execute on function public.get_platform_family_creation_requests() to authenticated;

create or replace function public.review_family_creation_request(p_request_id uuid,p_action text,p_note text default null)
returns uuid
language plpgsql security definer set search_path=public as $$
declare
  req public.family_creation_requests%rowtype;
  nid uuid; base_slug text; final_slug text; suffix integer:=1;
begin
  if not public.is_platform_owner() then raise exception 'Platform-owner access required.' using errcode='42501'; end if;
  if p_action not in ('approve','reject') then raise exception 'Action must be approve or reject.' using errcode='22023'; end if;

  select * into req from public.family_creation_requests where id=p_request_id for update;
  if req.id is null then raise exception 'Family creation request not found.' using errcode='P0002'; end if;
  if req.status<>'pending' then raise exception 'This request has already been reviewed.' using errcode='22023'; end if;

  if p_action='reject' then
    update public.family_creation_requests
      set status='rejected',reviewed_by=auth.uid(),reviewed_at=now(),decision_note=nullif(trim(coalesce(p_note,'')),''),updated_at=now()
      where id=req.id;
    return null;
  end if;

  base_slug:=coalesce(nullif(trim(req.slug),''),public.slugify_family_name(req.name));
  if length(base_slug)<2 then base_slug:='family'; end if;
  base_slug:=left(base_slug,60); final_slug:=base_slug;
  while exists(select 1 from public.networks where slug=final_slug) loop
    suffix:=suffix+1; final_slug:=left(base_slug,54)||'-'||suffix::text;
  end loop;

  insert into public.networks(name,slug,created_by,photo_upload_enabled)
  values(req.name,final_slug,req.requester_user_id,false) returning id into nid;

  insert into public.network_memberships(network_id,user_id,role,status)
  values(nid,req.requester_user_id,'owner','active');

  insert into public.network_settings(
    id,network_id,name,description,entity_label,entity_label_plural,level_label,level_label_plural,
    parent_label,child_label,peer_label,network_template,photo_upload_enabled
  ) values(
    'network',nid,req.name,coalesce(req.description,''),'Member','Members','Generation','Generations',
    'Parent','Child','Spouse','family',false
  );

  update public.profiles set active_network_id=nid,member_id=null,updated_at=now() where id=req.requester_user_id;
  update public.family_creation_requests
    set status='approved',reviewed_by=auth.uid(),reviewed_at=now(),network_id=nid,decision_note=nullif(trim(coalesce(p_note,'')),''),updated_at=now()
    where id=req.id;
  return nid;
end;
$$;
revoke all on function public.review_family_creation_request(uuid,text,text) from public;
grant execute on function public.review_family_creation_request(uuid,text,text) to authenticated;
