-- NF-2 — Governed Network ↔ Umbrella Affiliation
-- Creates the second network dimension without reusing M6 peer trust bridges.
-- Network Passport is the review boundary; affiliation never grants person-level access.

create table if not exists public.federation_umbrellas(
 id uuid primary key default gen_random_uuid(),
 name varchar(160) not null,
 slug varchar(180) not null unique,
 umbrella_type varchar(32) not null default 'community' check(umbrella_type in ('community','association','federation','institution','ecosystem','other')),
 summary varchar(600) not null default '',
 location_label varchar(120) not null default '',
 status varchar(20) not null default 'active' check(status in ('active','archived')),
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.federation_umbrella_admins(
 umbrella_id uuid not null references public.federation_umbrellas(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role varchar(20) not null default 'admin' check(role in ('owner','admin')),
 status varchar(20) not null default 'active' check(status in ('active','suspended')),
 created_at timestamptz not null default now(),
 primary key(umbrella_id,user_id)
);

create table if not exists public.network_umbrella_affiliations(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 umbrella_id uuid not null references public.federation_umbrellas(id) on delete cascade,
 relationship_type varchar(32) not null default 'member' check(relationship_type in ('member','chapter','affiliate','constituent','franchisee','partner','other')),
 status varchar(20) not null default 'requested' check(status in ('requested','approved','declined','suspended','revoked')),
 context_label varchar(160) not null default '',
 requested_by uuid references auth.users(id) on delete set null,
 reviewed_by uuid references auth.users(id) on delete set null,
 reviewed_at timestamptz,
 suspended_by uuid references auth.users(id) on delete set null,
 suspended_at timestamptz,
 revoked_by uuid references auth.users(id) on delete set null,
 revoked_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(network_id,umbrella_id,relationship_type)
);

create index if not exists idx_federation_umbrellas_name on public.federation_umbrellas(status,name);
create index if not exists idx_network_umbrella_affiliation_network on public.network_umbrella_affiliations(network_id,status,updated_at desc);
create index if not exists idx_network_umbrella_affiliation_umbrella on public.network_umbrella_affiliations(umbrella_id,status,updated_at desc);

alter table public.federation_umbrellas enable row level security;
alter table public.federation_umbrella_admins enable row level security;
alter table public.network_umbrella_affiliations enable row level security;
revoke all on table public.federation_umbrellas,public.federation_umbrella_admins,public.network_umbrella_affiliations from anon,authenticated;

create or replace function public.is_federation_umbrella_admin(p_umbrella_id uuid)
returns boolean language sql security definer stable set search_path=public as $$
 select auth.uid() is not null and exists(
  select 1 from public.federation_umbrella_admins a
  where a.umbrella_id=p_umbrella_id and a.user_id=auth.uid() and a.status='active'
 );
$$;
revoke all on function public.is_federation_umbrella_admin(uuid) from public;
grant execute on function public.is_federation_umbrella_admin(uuid) to authenticated;

create or replace function public.create_federation_umbrella(p_name text,p_slug text,p_umbrella_type text default 'community',p_summary text default '',p_location_label text default '')
returns uuid language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); rid uuid; v_slug text:=lower(trim(coalesce(p_slug,'')));
begin
 if uid is null then raise exception 'Authentication required.' using errcode='42501'; end if;
 if not exists(select 1 from public.network_memberships nm where nm.user_id=uid and nm.status='active' and nm.role in ('owner','admin')) then raise exception 'Administer at least one active network before creating an umbrella.' using errcode='42501'; end if;
 if length(trim(coalesce(p_name,'')))<2 or length(trim(p_name))>160 then raise exception 'Umbrella name must be 2-160 characters.'; end if;
 if v_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' or length(v_slug)>180 then raise exception 'Umbrella slug must use lowercase letters, numbers and hyphens.'; end if;
 if p_umbrella_type not in ('community','association','federation','institution','ecosystem','other') then raise exception 'Unsupported umbrella type.'; end if;
 if length(trim(coalesce(p_summary,'')))>600 or length(trim(coalesce(p_location_label,'')))>120 then raise exception 'Umbrella field exceeds its allowed length.'; end if;
 insert into public.federation_umbrellas(name,slug,umbrella_type,summary,location_label,created_by)
 values(trim(p_name),v_slug,p_umbrella_type,trim(coalesce(p_summary,'')),trim(coalesce(p_location_label,'')),uid) returning id into rid;
 insert into public.federation_umbrella_admins(umbrella_id,user_id,role) values(rid,uid,'owner');
 insert into public.audit_log(actor_id,action,details) values(uid,'federation_umbrella_created',jsonb_build_object('umbrella_id',rid,'slug',v_slug,'umbrella_type',p_umbrella_type));
 return rid;
end $$;
revoke all on function public.create_federation_umbrella(text,text,text,text,text) from public;
grant execute on function public.create_federation_umbrella(text,text,text,text,text) to authenticated;

create or replace function public.get_my_federation_umbrellas()
returns table(id uuid,name varchar,slug varchar,umbrella_type varchar,summary varchar,location_label varchar,status varchar,role varchar,created_at timestamptz)
language sql security definer stable set search_path=public as $$
 select u.id,u.name,u.slug,u.umbrella_type,u.summary,u.location_label,u.status,a.role,u.created_at
 from public.federation_umbrella_admins a join public.federation_umbrellas u on u.id=a.umbrella_id
 where a.user_id=auth.uid() and a.status='active'
 order by u.name;
$$;
revoke all on function public.get_my_federation_umbrellas() from public;
grant execute on function public.get_my_federation_umbrellas() to authenticated;

create or replace function public.search_federation_umbrellas(p_query text default '')
returns table(id uuid,name varchar,slug varchar,umbrella_type varchar,summary varchar,location_label varchar)
language sql security definer stable set search_path=public as $$
 select u.id,u.name,u.slug,u.umbrella_type,u.summary,u.location_label
 from public.federation_umbrellas u
 where auth.uid() is not null and u.status='active'
   and (trim(coalesce(p_query,''))='' or u.name ilike '%'||trim(p_query)||'%' or u.slug ilike '%'||trim(p_query)||'%')
 order by case when lower(u.slug)=lower(trim(coalesce(p_query,''))) then 0 else 1 end,u.name
 limit 20;
$$;
revoke all on function public.search_federation_umbrellas(text) from public;
grant execute on function public.search_federation_umbrellas(text) to authenticated;

create or replace function public.request_network_umbrella_affiliation(p_network_id uuid,p_umbrella_slug text,p_relationship_type text default 'member',p_context_label text default '')
returns uuid language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); u public.federation_umbrellas%rowtype; p public.network_passports%rowtype; existing public.network_umbrella_affiliations%rowtype; rid uuid;
begin
 if uid is null or not public.is_network_admin(p_network_id) then raise exception 'Network owner/admin access required.' using errcode='42501'; end if;
 if p_relationship_type not in ('member','chapter','affiliate','constituent','franchisee','partner','other') then raise exception 'Unsupported affiliation relationship.'; end if;
 if length(trim(coalesce(p_context_label,'')))>160 then raise exception 'Affiliation context is too long.'; end if;
 select * into u from public.federation_umbrellas where slug=lower(trim(p_umbrella_slug)) and status='active';
 if u.id is null then raise exception 'Umbrella not found.' using errcode='P0002'; end if;
 select * into p from public.network_passports where network_id=p_network_id;
 if p.network_id is null or p.visibility not in ('federation','public') then raise exception 'Set the Network Passport visibility to Federation or Public before requesting affiliation.' using errcode='22023'; end if;
 select * into existing from public.network_umbrella_affiliations where network_id=p_network_id and umbrella_id=u.id and relationship_type=p_relationship_type;
 if existing.id is not null and existing.status='approved' then raise exception 'This affiliation is already approved.' using errcode='23505'; end if;
 if existing.id is null then
  insert into public.network_umbrella_affiliations(network_id,umbrella_id,relationship_type,status,context_label,requested_by)
  values(p_network_id,u.id,p_relationship_type,'requested',trim(coalesce(p_context_label,'')),uid) returning id into rid;
 else
  update public.network_umbrella_affiliations set status='requested',context_label=trim(coalesce(p_context_label,'')),requested_by=uid,reviewed_by=null,reviewed_at=null,suspended_by=null,suspended_at=null,revoked_by=null,revoked_at=null,updated_at=now() where id=existing.id returning id into rid;
 end if;
 insert into public.audit_log(actor_id,action,details) values(uid,'network_umbrella_affiliation_requested',jsonb_build_object('affiliation_id',rid,'network_id',p_network_id,'umbrella_id',u.id,'relationship_type',p_relationship_type));
 return rid;
end $$;
revoke all on function public.request_network_umbrella_affiliation(uuid,text,text,text) from public;
grant execute on function public.request_network_umbrella_affiliation(uuid,text,text,text) to authenticated;

create or replace function public.review_network_umbrella_affiliation(p_affiliation_id uuid,p_approve boolean)
returns void language plpgsql security definer set search_path=public as $$
declare a public.network_umbrella_affiliations%rowtype;
begin
 select * into a from public.network_umbrella_affiliations where id=p_affiliation_id;
 if a.id is null then raise exception 'Affiliation request not found.' using errcode='P0002'; end if;
 if a.status<>'requested' then raise exception 'Only requested affiliations can be reviewed.'; end if;
 if not public.is_federation_umbrella_admin(a.umbrella_id) then raise exception 'Umbrella administrator access required.' using errcode='42501'; end if;
 update public.network_umbrella_affiliations set status=case when p_approve then 'approved' else 'declined' end,reviewed_by=auth.uid(),reviewed_at=now(),updated_at=now() where id=a.id;
 insert into public.audit_log(actor_id,action,details) values(auth.uid(),case when p_approve then 'network_umbrella_affiliation_approved' else 'network_umbrella_affiliation_declined' end,jsonb_build_object('affiliation_id',a.id,'network_id',a.network_id,'umbrella_id',a.umbrella_id));
end $$;
revoke all on function public.review_network_umbrella_affiliation(uuid,boolean) from public;
grant execute on function public.review_network_umbrella_affiliation(uuid,boolean) to authenticated;

create or replace function public.suspend_network_umbrella_affiliation(p_affiliation_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare a public.network_umbrella_affiliations%rowtype;
begin
 select * into a from public.network_umbrella_affiliations where id=p_affiliation_id;
 if a.id is null then raise exception 'Affiliation not found.' using errcode='P0002'; end if;
 if a.status<>'approved' then raise exception 'Only approved affiliations can be suspended.'; end if;
 if not public.is_federation_umbrella_admin(a.umbrella_id) then raise exception 'Umbrella administrator access required.' using errcode='42501'; end if;
 update public.network_umbrella_affiliations set status='suspended',suspended_by=auth.uid(),suspended_at=now(),updated_at=now() where id=a.id;
 insert into public.audit_log(actor_id,action,details) values(auth.uid(),'network_umbrella_affiliation_suspended',jsonb_build_object('affiliation_id',a.id));
end $$;
revoke all on function public.suspend_network_umbrella_affiliation(uuid) from public;
grant execute on function public.suspend_network_umbrella_affiliation(uuid) to authenticated;

create or replace function public.revoke_network_umbrella_affiliation(p_affiliation_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare a public.network_umbrella_affiliations%rowtype;
begin
 select * into a from public.network_umbrella_affiliations where id=p_affiliation_id;
 if a.id is null then raise exception 'Affiliation not found.' using errcode='P0002'; end if;
 if a.status not in ('requested','approved','suspended') then raise exception 'This affiliation cannot be revoked.'; end if;
 if not public.is_network_admin(a.network_id) and not public.is_federation_umbrella_admin(a.umbrella_id) then raise exception 'Network or umbrella administrator access required.' using errcode='42501'; end if;
 update public.network_umbrella_affiliations set status='revoked',revoked_by=auth.uid(),revoked_at=now(),updated_at=now() where id=a.id;
 insert into public.audit_log(actor_id,action,details) values(auth.uid(),'network_umbrella_affiliation_revoked',jsonb_build_object('affiliation_id',a.id,'network_id',a.network_id,'umbrella_id',a.umbrella_id));
end $$;
revoke all on function public.revoke_network_umbrella_affiliation(uuid) from public;
grant execute on function public.revoke_network_umbrella_affiliation(uuid) to authenticated;

create or replace function public.get_my_network_umbrella_affiliations()
returns table(id uuid,network_id uuid,network_name varchar,vertical_kind varchar,umbrella_id uuid,umbrella_name varchar,umbrella_slug varchar,relationship_type varchar,status varchar,context_label varchar,direction varchar,can_review boolean,can_suspend boolean,can_revoke boolean,passport_slug varchar,passport_tagline varchar,passport_summary varchar,passport_location varchar,passport_verification varchar,requested_at timestamptz,updated_at timestamptz)
language sql security definer stable set search_path=public as $$
 with visible as (
  select a.*,
   public.is_network_admin(a.network_id) as network_admin,
   public.is_federation_umbrella_admin(a.umbrella_id) as umbrella_admin
  from public.network_umbrella_affiliations a
  where public.is_network_admin(a.network_id) or public.is_federation_umbrella_admin(a.umbrella_id)
 )
 select a.id,a.network_id,n.name,n.vertical_kind,a.umbrella_id,u.name,u.slug,a.relationship_type,a.status,a.context_label,
  case when a.network_admin and a.umbrella_admin then 'both' when a.umbrella_admin then 'umbrella' else 'network' end::varchar,
  (a.umbrella_admin and a.status='requested'),(a.umbrella_admin and a.status='approved'),((a.network_admin or a.umbrella_admin) and a.status in ('requested','approved','suspended')),
  case when p.visibility in ('federation','public') then p.public_slug else '' end::varchar,
  case when p.visibility in ('federation','public') then p.tagline else '' end::varchar,
  case when p.visibility in ('federation','public') then p.summary else '' end::varchar,
  case when p.visibility in ('federation','public') then p.location_label else '' end::varchar,
  case when p.visibility in ('federation','public') then p.verification_state else 'self_declared' end::varchar,a.created_at,a.updated_at
 from visible a
 join public.networks n on n.id=a.network_id
 join public.federation_umbrellas u on u.id=a.umbrella_id
 join public.network_passports p on p.network_id=a.network_id
 order by case a.status when 'requested' then 0 when 'approved' then 1 when 'suspended' then 2 else 3 end,a.updated_at desc;
$$;
revoke all on function public.get_my_network_umbrella_affiliations() from public;
grant execute on function public.get_my_network_umbrella_affiliations() to authenticated;

-- NF-2 Launch Control: independently TEST-gated across all current verticals.
with verticals(vertical_kind) as (values ('family'::varchar),('alumni'),('organization'),('business-trust'),('franchise'),('professional'))
insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind)
select v.vertical_kind||'.advanced.network_affiliation','federation','test','{}'::uuid[],v.vertical_kind from verticals v
on conflict(feature_key) do update set bundle_key=excluded.bundle_key,vertical_kind=excluded.vertical_kind;
insert into public.platform_playground_features(feature_key,enabled)
select feature_key,false from public.platform_feature_flags where feature_key like '%.advanced.network_affiliation'
on conflict(feature_key) do nothing;

comment on table public.network_umbrella_affiliations is 'NF-2 governed Network↔Umbrella affiliation. Approval is institutional provenance only; it grants no implicit member, profile, contact, relationship, graph, discovery or application access.';
