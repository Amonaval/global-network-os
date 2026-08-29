-- NF-7 Governed Introduction & Consent
-- Converts a shortlisted NF-6 route into a consent handshake. No contact note crosses to the target until acceptance.
create table if not exists public.federated_introductions(
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references public.federated_requests(id) on delete cascade,
 route_id uuid not null references public.federated_request_routes(id) on delete cascade,
 target_scope_profile_id uuid not null references public.federated_scope_profiles(id) on delete cascade,
 requester_user_id uuid not null references auth.users(id) on delete cascade,
 target_user_id uuid not null references auth.users(id) on delete cascade,
 requester_alias varchar(180) not null,
 message varchar(800) not null,
 requester_contact_note varchar(320) not null,
 target_response_note varchar(800),
 target_contact_note varchar(320),
 trust_path_snapshot text not null,
 status varchar(20) not null default 'pending' check(status in ('pending','accepted','declined','cancelled')),
 created_at timestamptz not null default now(),
 responded_at timestamptz,
 updated_at timestamptz not null default now(),
 unique(route_id),
 check(length(trim(requester_alias)) between 2 and 180),
 check(length(trim(message)) between 3 and 800),
 check(length(trim(requester_contact_note)) between 3 and 320)
);
create index if not exists idx_federated_introductions_requester on public.federated_introductions(requester_user_id,status,updated_at desc);
create index if not exists idx_federated_introductions_target on public.federated_introductions(target_user_id,status,updated_at desc);
alter table public.federated_introductions enable row level security;
revoke all on public.federated_introductions from anon,authenticated;

create or replace function public.get_my_shortlisted_federated_routes()
returns table(route_id uuid,request_id uuid,request_title varchar,scope_key varchar,target_scope_profile_id uuid,target_display_name varchar,target_headline varchar,target_network_name varchar,umbrella_name varchar,score integer,trust_path_label text)
language sql security definer stable set search_path=public as $$
 select rr.id,r.id,r.title,r.scope_key,sp.id,sp.display_name,sp.headline,n.name,u.name,rr.score,rr.trust_path_label
 from public.federated_request_routes rr
 join public.federated_requests r on r.id=rr.request_id and r.requester_user_id=auth.uid() and r.status='open'
 join public.federated_scope_profiles sp on sp.id=rr.target_scope_profile_id and sp.active and sp.owner_user_id<>auth.uid()
 join public.networks n on n.id=sp.network_id and n.status='active'
 join public.federation_umbrellas u on u.id=r.umbrella_id and u.status='active'
 join public.network_umbrella_affiliations a on a.network_id=sp.network_id and a.umbrella_id=r.umbrella_id and a.status='approved'
 join public.network_passports p on p.network_id=sp.network_id and p.visibility in ('federation','public')
 where rr.status='shortlisted'
   and sp.umbrella_id=r.umbrella_id
   and lower(sp.scope_key)=lower(r.scope_key)
   and exists(select 1 from unnest(p.participation_scopes) x where lower(x)=lower(r.scope_key))
   and not exists(select 1 from public.federated_introductions fi where fi.route_id=rr.id)
 order by rr.score desc,rr.generated_at desc;
$$;
revoke all on function public.get_my_shortlisted_federated_routes() from public;
grant execute on function public.get_my_shortlisted_federated_routes() to authenticated;

create or replace function public.request_federated_introduction_v2(p_route_id uuid,p_requester_alias text,p_message text,p_contact_note text)
returns uuid language plpgsql security definer set search_path=public as $$
declare rr public.federated_request_routes%rowtype; req public.federated_requests%rowtype; sp public.federated_scope_profiles%rowtype; rid uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required.' using errcode='42501'; end if;
 if length(trim(coalesce(p_requester_alias,'')))<2 then raise exception 'Add the name or alias you want the recipient to see.' using errcode='22023'; end if;
 if length(trim(coalesce(p_message,'')))<3 then raise exception 'Add a short introduction reason.' using errcode='22023'; end if;
 if length(trim(coalesce(p_contact_note,'')))<3 then raise exception 'Add a response channel to reveal only after acceptance.' using errcode='22023'; end if;
 select * into rr from public.federated_request_routes where id=p_route_id and status='shortlisted';
 if not found then raise exception 'Only a shortlisted route can become an introduction.' using errcode='42501'; end if;
 select * into req from public.federated_requests where id=rr.request_id and requester_user_id=auth.uid() and status='open';
 if not found then raise exception 'The source request is not open or not owned by you.' using errcode='42501'; end if;
 select * into sp from public.federated_scope_profiles where id=rr.target_scope_profile_id and active and owner_user_id<>auth.uid();
 if not found then raise exception 'The target purpose opt-in is no longer available.' using errcode='42501'; end if;
 if sp.umbrella_id<>req.umbrella_id or lower(sp.scope_key)<>lower(req.scope_key) then raise exception 'The target no longer matches this request context.' using errcode='42501'; end if;
 if not exists(select 1 from public.federation_umbrellas u where u.id=req.umbrella_id and u.status='active') then raise exception 'The umbrella is no longer active.' using errcode='42501'; end if;
 if not exists(select 1 from public.network_umbrella_affiliations a where a.network_id=req.source_network_id and a.umbrella_id=req.umbrella_id and a.status='approved') then raise exception 'The requester federation path is no longer approved.' using errcode='42501'; end if;
 if not exists(select 1 from public.network_umbrella_affiliations a where a.network_id=sp.network_id and a.umbrella_id=req.umbrella_id and a.status='approved') then raise exception 'The target federation path is no longer approved.' using errcode='42501'; end if;
 if not exists(select 1 from public.network_passports p where p.network_id=sp.network_id and p.visibility in ('federation','public') and exists(select 1 from unnest(p.participation_scopes) x where lower(x)=lower(req.scope_key))) then raise exception 'The target Network Passport no longer permits this purpose.' using errcode='42501'; end if;
 insert into public.federated_introductions(request_id,route_id,target_scope_profile_id,requester_user_id,target_user_id,requester_alias,message,requester_contact_note,trust_path_snapshot)
 values(req.id,rr.id,sp.id,auth.uid(),sp.owner_user_id,trim(p_requester_alias),left(trim(p_message),800),left(trim(p_contact_note),320),rr.trust_path_label)
 returning id into rid;
 return rid;
end $$;
revoke all on function public.request_federated_introduction_v2(uuid,text,text,text) from public;
grant execute on function public.request_federated_introduction_v2(uuid,text,text,text) to authenticated;

create or replace function public.get_my_federated_introductions_v2()
returns table(id uuid,direction text,status varchar,scope_key varchar,request_title varchar,requester_alias varchar,message varchar,requester_contact_note text,target_response_note text,target_contact_note text,target_display_name varchar,target_headline varchar,target_network_name varchar,umbrella_name varchar,trust_path_label text,created_at timestamptz,responded_at timestamptz,updated_at timestamptz)
language sql security definer stable set search_path=public as $$
 select i.id,
  case when i.target_user_id=auth.uid() then 'inbound' else 'outbound' end::text,
  i.status,r.scope_key,r.title,i.requester_alias,i.message,
  case when i.requester_user_id=auth.uid() or i.status='accepted' then i.requester_contact_note else null end::text,
  i.target_response_note::text,
  case when i.target_user_id=auth.uid() or i.status='accepted' then i.target_contact_note else null end::text,
  sp.display_name,sp.headline,n.name,u.name,i.trust_path_snapshot,i.created_at,i.responded_at,i.updated_at
 from public.federated_introductions i
 join public.federated_requests r on r.id=i.request_id
 join public.federated_scope_profiles sp on sp.id=i.target_scope_profile_id
 join public.networks n on n.id=sp.network_id
 join public.federation_umbrellas u on u.id=sp.umbrella_id
 where i.requester_user_id=auth.uid() or i.target_user_id=auth.uid()
 order by case when i.status='pending' then 0 else 1 end,i.updated_at desc;
$$;
revoke all on function public.get_my_federated_introductions_v2() from public;
grant execute on function public.get_my_federated_introductions_v2() to authenticated;

create or replace function public.respond_to_federated_introduction_v2(p_introduction_id uuid,p_accept boolean,p_response_note text default null,p_contact_note text default null)
returns void language plpgsql security definer set search_path=public as $$
declare i public.federated_introductions%rowtype; req public.federated_requests%rowtype; sp public.federated_scope_profiles%rowtype;
begin
 select * into i from public.federated_introductions where id=p_introduction_id and target_user_id=auth.uid() and status='pending';
 if not found then raise exception 'Pending introduction not found.' using errcode='42501'; end if;
 if p_accept then
  if length(trim(coalesce(p_contact_note,'')))<3 then raise exception 'Add a response channel before accepting.' using errcode='22023'; end if;
  select * into req from public.federated_requests where id=i.request_id;
  select * into sp from public.federated_scope_profiles where id=i.target_scope_profile_id and owner_user_id=auth.uid() and active;
  if not found then raise exception 'Your purpose opt-in is no longer active.' using errcode='42501'; end if;
  if req.status<>'open' then raise exception 'The original request is no longer open.' using errcode='42501'; end if;
  if sp.umbrella_id<>req.umbrella_id or lower(sp.scope_key)<>lower(req.scope_key) then raise exception 'The introduction context is no longer valid.' using errcode='42501'; end if;
  if not exists(select 1 from public.federation_umbrellas u where u.id=req.umbrella_id and u.status='active') then raise exception 'The umbrella is no longer active.' using errcode='42501'; end if;
  if not exists(select 1 from public.network_umbrella_affiliations a where a.network_id=req.source_network_id and a.umbrella_id=req.umbrella_id and a.status='approved') then raise exception 'The requester federation path is no longer approved.' using errcode='42501'; end if;
  if not exists(select 1 from public.network_umbrella_affiliations a where a.network_id=sp.network_id and a.umbrella_id=req.umbrella_id and a.status='approved') then raise exception 'Your federation path is no longer approved.' using errcode='42501'; end if;
  if not exists(select 1 from public.network_passports p where p.network_id=sp.network_id and p.visibility in ('federation','public') and exists(select 1 from unnest(p.participation_scopes) x where lower(x)=lower(req.scope_key))) then raise exception 'Your Network Passport no longer permits this purpose.' using errcode='42501'; end if;
 end if;
 update public.federated_introductions set status=case when p_accept then 'accepted' else 'declined' end,
  target_response_note=left(nullif(trim(coalesce(p_response_note,'')),''),800),
  target_contact_note=case when p_accept then left(trim(p_contact_note),320) else null end,
  responded_at=now(),updated_at=now()
 where id=i.id;
end $$;
revoke all on function public.respond_to_federated_introduction_v2(uuid,boolean,text,text) from public;
grant execute on function public.respond_to_federated_introduction_v2(uuid,boolean,text,text) to authenticated;

create or replace function public.cancel_federated_introduction_v2(p_introduction_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
 update public.federated_introductions set status='cancelled',updated_at=now() where id=p_introduction_id and requester_user_id=auth.uid() and status='pending';
 if not found then raise exception 'Pending introduction not found or not owned by you.' using errcode='42501'; end if;
end $$;
revoke all on function public.cancel_federated_introduction_v2(uuid) from public;
grant execute on function public.cancel_federated_introduction_v2(uuid) to authenticated;

comment on table public.federated_introductions is 'NF-7 consent handshake over a shortlisted NF-6 route. Deliberately supplied contact notes are exposed cross-party only after target acceptance.';
comment on function public.request_federated_introduction_v2(uuid,text,text,text) is 'NF-7 creates a pending introduction after revalidating the current federation/purpose path. It does not expose requester contact to the target before acceptance.';

with verticals(vertical_kind) as (values ('family'::varchar),('alumni'),('organization'),('business-trust'),('franchise'),('professional'))
insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind)
select v.vertical_kind||'.advanced.governed_introductions','federation','test','{}'::uuid[],v.vertical_kind from verticals v
on conflict(feature_key) do update set bundle_key=excluded.bundle_key,vertical_kind=excluded.vertical_kind;
insert into public.platform_playground_features(feature_key,enabled)
select feature_key,false from public.platform_feature_flags where feature_key like '%.advanced.governed_introductions'
on conflict(feature_key) do nothing;
