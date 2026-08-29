-- NF-6 Trusted Request Routing
-- Requests are purpose/context scoped. Suggested routes are evidence snapshots only; NF-6 does not contact targets or reveal private contacts.
create table if not exists public.federated_requests(
 id uuid primary key default gen_random_uuid(),
 requester_user_id uuid not null references auth.users(id) on delete cascade,
 source_network_id uuid not null references public.networks(id) on delete cascade,
 umbrella_id uuid not null references public.federation_umbrellas(id) on delete cascade,
 scope_key varchar(48) not null,
 title varchar(180) not null,
 description varchar(1200),
 location_label varchar(160),
 tags text[] not null default '{}',
 status varchar(20) not null default 'open' check(status in ('open','closed','cancelled')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(length(trim(scope_key)) between 2 and 48),
 check(length(trim(title)) between 3 and 180),
 check(coalesce(array_length(tags,1),0)<=12)
);
create index if not exists idx_federated_requests_owner on public.federated_requests(requester_user_id,status,updated_at desc);
alter table public.federated_requests enable row level security;
revoke all on public.federated_requests from anon,authenticated;

create table if not exists public.federated_request_routes(
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references public.federated_requests(id) on delete cascade,
 target_scope_profile_id uuid not null references public.federated_scope_profiles(id) on delete cascade,
 score integer not null check(score between 0 and 100),
 reasons text[] not null default '{}',
 trust_path_label text not null,
 status varchar(20) not null default 'suggested' check(status in ('suggested','shortlisted','dismissed')),
 generated_at timestamptz not null default now(),
 unique(request_id,target_scope_profile_id)
);
create index if not exists idx_federated_request_routes_request on public.federated_request_routes(request_id,status,score desc);
alter table public.federated_request_routes enable row level security;
revoke all on public.federated_request_routes from anon,authenticated;

create or replace function public.get_my_trusted_request_contexts()
returns table(network_id uuid,network_name varchar,umbrella_id uuid,umbrella_name varchar,scope_key text,passport_visibility varchar)
language sql security definer stable set search_path=public as $$
 select distinct n.id,n.name,u.id,u.name,s.scope_key,p.visibility
 from public.network_memberships nm
 join public.networks n on n.id=nm.network_id and n.status='active'
 join public.network_umbrella_affiliations a on a.network_id=n.id and a.status='approved'
 join public.federation_umbrellas u on u.id=a.umbrella_id and u.status='active'
 join public.network_passports p on p.network_id=n.id and p.visibility in ('federation','public')
 cross join lateral unnest(p.participation_scopes) s(scope_key)
 where nm.user_id=auth.uid() and nm.status='active'
 order by n.name,u.name,s.scope_key;
$$;
revoke all on function public.get_my_trusted_request_contexts() from public;
grant execute on function public.get_my_trusted_request_contexts() to authenticated;

create or replace function public.get_my_federated_requests()
returns table(id uuid,scope_key varchar,title varchar,description varchar,location_label varchar,tags text[],status varchar,network_id uuid,network_name varchar,umbrella_id uuid,umbrella_name varchar,created_at timestamptz,updated_at timestamptz)
language sql security definer stable set search_path=public as $$
 select r.id,r.scope_key,r.title,r.description,r.location_label,r.tags,r.status,r.source_network_id,n.name,r.umbrella_id,u.name,r.created_at,r.updated_at
 from public.federated_requests r join public.networks n on n.id=r.source_network_id join public.federation_umbrellas u on u.id=r.umbrella_id
 where r.requester_user_id=auth.uid() order by r.updated_at desc;
$$;
revoke all on function public.get_my_federated_requests() from public;
grant execute on function public.get_my_federated_requests() to authenticated;

create or replace function public.create_my_federated_request(p_network_id uuid,p_umbrella_id uuid,p_scope_key text,p_title text,p_description text default null,p_location_label text default null,p_tags text[] default '{}')
returns uuid language plpgsql security definer set search_path=public as $$
declare rid uuid; sk text:=lower(trim(p_scope_key));
begin
 if auth.uid() is null or not public.is_network_member(p_network_id) then raise exception 'Active source-network membership required.' using errcode='42501'; end if;
 if length(trim(coalesce(p_title,'')))<3 then raise exception 'Request title is required.' using errcode='22023'; end if;
 if coalesce(array_length(p_tags,1),0)>12 then raise exception 'Use at most 12 request tags.' using errcode='22023'; end if;
 if not exists(select 1 from public.network_umbrella_affiliations a join public.federation_umbrellas u on u.id=a.umbrella_id and u.status='active' where a.network_id=p_network_id and a.umbrella_id=p_umbrella_id and a.status='approved') then raise exception 'Approved umbrella affiliation required.' using errcode='42501'; end if;
 if not exists(select 1 from public.network_passports p where p.network_id=p_network_id and p.visibility in ('federation','public') and exists(select 1 from unnest(p.participation_scopes) x where lower(x)=sk)) then raise exception 'The source Network Passport must currently declare this purpose.' using errcode='42501'; end if;
 insert into public.federated_requests(requester_user_id,source_network_id,umbrella_id,scope_key,title,description,location_label,tags)
 values(auth.uid(),p_network_id,p_umbrella_id,sk,trim(p_title),left(nullif(trim(coalesce(p_description,'')),''),1200),nullif(trim(coalesce(p_location_label,'')),''),coalesce(p_tags,'{}')) returning id into rid;
 return rid;
end $$;
revoke all on function public.create_my_federated_request(uuid,uuid,text,text,text,text,text[]) from public;
grant execute on function public.create_my_federated_request(uuid,uuid,text,text,text,text,text[]) to authenticated;

create or replace function public.set_my_federated_request_status(p_request_id uuid,p_status text) returns void
language plpgsql security definer set search_path=public as $$
begin
 if p_status not in ('open','closed','cancelled') then raise exception 'Unsupported request status.' using errcode='22023'; end if;
 update public.federated_requests set status=p_status,updated_at=now() where id=p_request_id and requester_user_id=auth.uid();
 if not found then raise exception 'Request not found or not owned by you.' using errcode='42501'; end if;
end $$;
revoke all on function public.set_my_federated_request_status(uuid,text) from public;
grant execute on function public.set_my_federated_request_status(uuid,text) to authenticated;

create or replace function public.refresh_my_federated_request_routes(p_request_id uuid,p_limit integer default 20) returns integer
language plpgsql security definer set search_path=public as $$
declare req public.federated_requests%rowtype; inserted_count integer:=0;
begin
 select * into req from public.federated_requests where id=p_request_id and requester_user_id=auth.uid();
 if not found then raise exception 'Request not found or not owned by you.' using errcode='42501'; end if;
 if req.status<>'open' then raise exception 'Only open requests can be routed.' using errcode='22023'; end if;
 if not exists(select 1 from public.network_umbrella_affiliations a join public.federation_umbrellas u on u.id=a.umbrella_id and u.status='active' where a.network_id=req.source_network_id and a.umbrella_id=req.umbrella_id and a.status='approved') then raise exception 'The source federation path is no longer active.' using errcode='42501'; end if;

 delete from public.federated_request_routes where request_id=req.id and status<>'shortlisted';

 insert into public.federated_request_routes(request_id,target_scope_profile_id,score,reasons,trust_path_label,status,generated_at)
 select req.id,c.id,
  least(100,
   least(45,15*coalesce((select count(*) from unnest(c.tags) ct where exists(select 1 from unnest(req.tags) rt where lower(rt)=lower(ct))),0))
   + case when coalesce(trim(req.location_label),'')<>'' and lower(coalesce(c.location_label,'')) like '%'||lower(trim(req.location_label))||'%' then 15 else 0 end
   + case when lower(concat_ws(' ',c.headline,c.summary,array_to_string(c.tags,' '))) like '%'||lower(req.title)||'%' then 20 else 0 end
   + case when c.updated_at>now()-interval '90 days' then 10 else 0 end
   + 10
  )::integer as score,
  array_remove(array[
   case when exists(select 1 from unnest(c.tags) ct where exists(select 1 from unnest(req.tags) rt where lower(rt)=lower(ct))) then 'Purpose tags overlap' end,
   case when coalesce(trim(req.location_label),'')<>'' and lower(coalesce(c.location_label,'')) like '%'||lower(trim(req.location_label))||'%' then 'Location aligns' end,
   case when lower(concat_ws(' ',c.headline,c.summary,array_to_string(c.tags,' '))) like '%'||lower(req.title)||'%' then 'Published profile matches the request wording' end,
   case when c.updated_at>now()-interval '90 days' then 'Purpose profile is recently refreshed' end,
   'Same approved umbrella and purpose'
  ]::text[],null),
  (src.name||' → '||u.name||' → '||target.name)::text,'suggested',now()
 from public.federated_scope_profiles c
 join public.networks target on target.id=c.network_id and target.status='active'
 join public.networks src on src.id=req.source_network_id and src.status='active'
 join public.federation_umbrellas u on u.id=req.umbrella_id and u.status='active'
 join public.network_umbrella_affiliations ta on ta.network_id=c.network_id and ta.umbrella_id=req.umbrella_id and ta.status='approved'
 join public.network_passports np on np.network_id=c.network_id and np.visibility in ('federation','public')
 where c.umbrella_id=req.umbrella_id and c.active and lower(c.scope_key)=lower(req.scope_key) and c.owner_user_id<>auth.uid()
   and exists(select 1 from unnest(np.participation_scopes) x where lower(x)=lower(req.scope_key))
 order by score desc,c.updated_at desc
 limit least(greatest(coalesce(p_limit,20),1),50)
 on conflict(request_id,target_scope_profile_id) do update set score=excluded.score,reasons=excluded.reasons,trust_path_label=excluded.trust_path_label,generated_at=now();
 get diagnostics inserted_count=row_count;
 update public.federated_requests set updated_at=now() where id=req.id;
 return inserted_count;
end $$;
revoke all on function public.refresh_my_federated_request_routes(uuid,integer) from public;
grant execute on function public.refresh_my_federated_request_routes(uuid,integer) to authenticated;

create or replace function public.get_my_federated_request_routes(p_request_id uuid)
returns table(id uuid,request_id uuid,target_scope_profile_id uuid,display_name varchar,headline varchar,summary varchar,location_label varchar,tags text[],contact_mode varchar,target_network_id uuid,target_network_name varchar,umbrella_id uuid,umbrella_name varchar,score integer,reasons text[],trust_path_label text,status varchar,generated_at timestamptz)
language sql security definer stable set search_path=public as $$
 select rr.id,rr.request_id,rr.target_scope_profile_id,sp.display_name,sp.headline,sp.summary,sp.location_label,sp.tags,sp.contact_mode,sp.network_id,n.name,sp.umbrella_id,u.name,rr.score,rr.reasons,rr.trust_path_label,rr.status,rr.generated_at
 from public.federated_request_routes rr
 join public.federated_requests r on r.id=rr.request_id and r.requester_user_id=auth.uid()
 join public.federated_scope_profiles sp on sp.id=rr.target_scope_profile_id
 join public.networks n on n.id=sp.network_id
 join public.federation_umbrellas u on u.id=sp.umbrella_id
 join public.network_umbrella_affiliations a on a.network_id=sp.network_id and a.umbrella_id=sp.umbrella_id and a.status='approved'
 join public.network_passports np on np.network_id=sp.network_id and np.visibility in ('federation','public')
 where rr.request_id=p_request_id and sp.active and u.status='active' and lower(sp.scope_key)=lower(r.scope_key)
   and exists(select 1 from unnest(np.participation_scopes) x where lower(x)=lower(r.scope_key))
 order by case rr.status when 'shortlisted' then 0 when 'suggested' then 1 else 2 end,rr.score desc,rr.generated_at desc;
$$;
revoke all on function public.get_my_federated_request_routes(uuid) from public;
grant execute on function public.get_my_federated_request_routes(uuid) to authenticated;

create or replace function public.set_my_federated_request_route_status(p_route_id uuid,p_status text) returns void
language plpgsql security definer set search_path=public as $$
begin
 if p_status not in ('suggested','shortlisted','dismissed') then raise exception 'Unsupported route status.' using errcode='22023'; end if;
 update public.federated_request_routes rr set status=p_status
 from public.federated_requests r where rr.id=p_route_id and r.id=rr.request_id and r.requester_user_id=auth.uid();
 if not found then raise exception 'Route not found or not owned by your request.' using errcode='42501'; end if;
end $$;
revoke all on function public.set_my_federated_request_route_status(uuid,text) from public;
grant execute on function public.set_my_federated_request_route_status(uuid,text) to authenticated;

comment on table public.federated_requests is 'NF-6 user-owned, purpose-scoped requests routed only through active approved federation contexts.';
comment on table public.federated_request_routes is 'NF-6 persisted deterministic route evidence. A route suggestion is not an introduction, endorsement or contact disclosure.';

with verticals(vertical_kind) as (values ('family'::varchar),('alumni'),('organization'),('business-trust'),('franchise'),('professional'))
insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind)
select v.vertical_kind||'.advanced.trusted_request_routing','federation','test','{}'::uuid[],v.vertical_kind from verticals v
on conflict(feature_key) do update set bundle_key=excluded.bundle_key,vertical_kind=excluded.vertical_kind;
insert into public.platform_playground_features(feature_key,enabled)
select feature_key,false from public.platform_feature_flags where feature_key like '%.advanced.trusted_request_routing'
on conflict(feature_key) do nothing;
