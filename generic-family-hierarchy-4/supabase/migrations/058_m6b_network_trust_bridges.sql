-- M6-B — Trusted Network-to-Network Linking & Governed Bridges
-- Neutral network-of-networks trust edges. No member/profile/graph sharing is enabled here.

create table if not exists public.network_bridge_codes(
 network_id uuid primary key references public.networks(id) on delete cascade,
 code text not null unique,
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 rotated_at timestamptz
);

create table if not exists public.network_trust_bridges(
 id uuid primary key default gen_random_uuid(),
 requester_network_id uuid not null references public.networks(id) on delete cascade,
 recipient_network_id uuid not null references public.networks(id) on delete cascade,
 relationship_type varchar(40) not null check(relationship_type in ('affiliation','community','partner','parent_child','trusted_peer')),
 status varchar(20) not null default 'pending' check(status in ('pending','accepted','declined','revoked')),
 context_label varchar(200),
 capabilities jsonb not null default '{"discovery":false,"introductions":false}'::jsonb,
 requested_by uuid not null references auth.users(id),
 reviewed_by uuid references auth.users(id),
 reviewed_at timestamptz,
 revoked_by uuid references auth.users(id),
 revoked_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(requester_network_id<>recipient_network_id),
 check(jsonb_typeof(capabilities)='object')
);
create index if not exists network_trust_bridges_requester_idx on public.network_trust_bridges(requester_network_id,status);
create index if not exists network_trust_bridges_recipient_idx on public.network_trust_bridges(recipient_network_id,status);
create index if not exists network_trust_bridges_pair_idx on public.network_trust_bridges(least(requester_network_id,recipient_network_id),greatest(requester_network_id,recipient_network_id),relationship_type);

alter table public.network_bridge_codes enable row level security;
alter table public.network_trust_bridges enable row level security;
revoke all on public.network_bridge_codes from anon,authenticated;
revoke all on public.network_trust_bridges from anon,authenticated;

create or replace function public.m6b_bridge_capabilities(p_value jsonb) returns jsonb
language sql immutable set search_path=public as $$
 select jsonb_build_object(
  'discovery',coalesce((p_value->>'discovery')::boolean,false),
  'introductions',coalesce((p_value->>'introductions')::boolean,false)
 );
$$;

create or replace function public.get_or_create_network_bridge_code(p_network_id uuid) returns text
language plpgsql security definer set search_path=public,extensions as $$
declare result text;
begin
 if auth.uid() is null or not public.is_network_admin(p_network_id) then raise exception 'Network administrator access is required.' using errcode='42501'; end if;
 select code into result from public.network_bridge_codes where network_id=p_network_id;
 if result is null then
  result:=upper(substr(encode(gen_random_bytes(8),'hex'),1,12));
  insert into public.network_bridge_codes(network_id,code,created_by) values(p_network_id,result,auth.uid())
  on conflict(network_id) do nothing;
  select code into result from public.network_bridge_codes where network_id=p_network_id;
 end if;
 return result;
end $$;
revoke all on function public.get_or_create_network_bridge_code(uuid) from public;
grant execute on function public.get_or_create_network_bridge_code(uuid) to authenticated;

create or replace function public.regenerate_network_bridge_code(p_network_id uuid) returns text
language plpgsql security definer set search_path=public,extensions as $$
declare result text;
begin
 if auth.uid() is null or not public.is_network_admin(p_network_id) then raise exception 'Network administrator access is required.' using errcode='42501'; end if;
 result:=upper(substr(encode(gen_random_bytes(8),'hex'),1,12));
 insert into public.network_bridge_codes(network_id,code,created_by,rotated_at) values(p_network_id,result,auth.uid(),now())
 on conflict(network_id) do update set code=excluded.code,created_by=auth.uid(),rotated_at=now();
 return result;
end $$;
revoke all on function public.regenerate_network_bridge_code(uuid) from public;
grant execute on function public.regenerate_network_bridge_code(uuid) to authenticated;

create or replace function public.request_network_trust_bridge(
 p_source_network_id uuid,p_target_code text,p_relationship_type text,p_context_label text default null,p_capabilities jsonb default '{}'::jsonb
) returns uuid
language plpgsql security definer set search_path=public as $$
declare target_id uuid; existing public.network_trust_bridges%rowtype; rid uuid; caps jsonb;
begin
 if auth.uid() is null or not public.is_network_admin(p_source_network_id) then raise exception 'Network administrator access is required.' using errcode='42501'; end if;
 if p_relationship_type not in ('affiliation','community','partner','parent_child','trusted_peer') then raise exception 'Unsupported network bridge relationship.' using errcode='22023'; end if;
 select c.network_id into target_id from public.network_bridge_codes c join public.networks n on n.id=c.network_id where upper(c.code)=upper(trim(p_target_code)) and n.status='active';
 if target_id is null then raise exception 'Bridge code was not found.' using errcode='P0002'; end if;
 if target_id=p_source_network_id then raise exception 'A network cannot bridge to itself.' using errcode='22023'; end if;
 caps:=public.m6b_bridge_capabilities(coalesce(p_capabilities,'{}'::jsonb));
 select * into existing from public.network_trust_bridges b
  where least(b.requester_network_id,b.recipient_network_id)=least(p_source_network_id,target_id)
    and greatest(b.requester_network_id,b.recipient_network_id)=greatest(p_source_network_id,target_id)
    and b.relationship_type=p_relationship_type order by b.updated_at desc limit 1;
 if existing.id is not null and existing.status='accepted' then raise exception 'These networks already have an accepted bridge of this type.' using errcode='23505'; end if;
 if existing.id is not null then
  update public.network_trust_bridges set requester_network_id=p_source_network_id,recipient_network_id=target_id,status='pending',context_label=nullif(trim(p_context_label),''),capabilities=caps,requested_by=auth.uid(),reviewed_by=null,reviewed_at=null,revoked_by=null,revoked_at=null,updated_at=now() where id=existing.id returning id into rid;
 else
  insert into public.network_trust_bridges(requester_network_id,recipient_network_id,relationship_type,context_label,capabilities,requested_by)
  values(p_source_network_id,target_id,p_relationship_type,nullif(trim(p_context_label),''),caps,auth.uid()) returning id into rid;
 end if;
 insert into public.audit_log(network_id,actor_id,action,details) values(p_source_network_id,auth.uid(),'network_trust_bridge_requested',jsonb_build_object('bridge_id',rid,'target_network_id',target_id,'relationship_type',p_relationship_type,'capabilities',caps));
 return rid;
end $$;
revoke all on function public.request_network_trust_bridge(uuid,text,text,text,jsonb) from public;
grant execute on function public.request_network_trust_bridge(uuid,text,text,text,jsonb) to authenticated;

create or replace function public.review_network_trust_bridge(p_bridge_id uuid,p_accept boolean) returns void
language plpgsql security definer set search_path=public as $$
declare b public.network_trust_bridges%rowtype;
begin
 select * into b from public.network_trust_bridges where id=p_bridge_id;
 if b.id is null then raise exception 'Network bridge request not found.' using errcode='P0002'; end if;
 if b.status<>'pending' then raise exception 'Only pending bridge requests can be reviewed.' using errcode='22023'; end if;
 if not public.is_network_admin(b.recipient_network_id) then raise exception 'Only an administrator of the receiving network can review this bridge.' using errcode='42501'; end if;
 update public.network_trust_bridges set status=case when p_accept then 'accepted' else 'declined' end,reviewed_by=auth.uid(),reviewed_at=now(),updated_at=now() where id=p_bridge_id;
 insert into public.audit_log(network_id,actor_id,action,details) values(b.recipient_network_id,auth.uid(),case when p_accept then 'network_trust_bridge_accepted' else 'network_trust_bridge_declined' end,jsonb_build_object('bridge_id',b.id,'source_network_id',b.requester_network_id,'capabilities',b.capabilities));
end $$;
revoke all on function public.review_network_trust_bridge(uuid,boolean) from public;
grant execute on function public.review_network_trust_bridge(uuid,boolean) to authenticated;

create or replace function public.revoke_network_trust_bridge(p_bridge_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare b public.network_trust_bridges%rowtype; actor_network uuid;
begin
 select * into b from public.network_trust_bridges where id=p_bridge_id;
 if b.id is null then raise exception 'Network bridge not found.' using errcode='P0002'; end if;
 if b.status<>'accepted' then raise exception 'Only accepted bridges can be revoked.' using errcode='22023'; end if;
 if public.is_network_admin(b.requester_network_id) then actor_network:=b.requester_network_id;
 elsif public.is_network_admin(b.recipient_network_id) then actor_network:=b.recipient_network_id;
 else raise exception 'Administrator access to one of the bridged networks is required.' using errcode='42501'; end if;
 update public.network_trust_bridges set status='revoked',revoked_by=auth.uid(),revoked_at=now(),updated_at=now() where id=p_bridge_id;
 insert into public.audit_log(network_id,actor_id,action,details) values(actor_network,auth.uid(),'network_trust_bridge_revoked',jsonb_build_object('bridge_id',b.id));
end $$;
revoke all on function public.revoke_network_trust_bridge(uuid) from public;
grant execute on function public.revoke_network_trust_bridge(uuid) to authenticated;

create or replace function public.get_my_network_trust_bridges()
returns table(id uuid,requester_network_id uuid,requester_network_name varchar,recipient_network_id uuid,recipient_network_name varchar,relationship_type varchar,status varchar,context_label varchar,discovery_enabled boolean,introductions_enabled boolean,direction varchar,can_review boolean,can_revoke boolean,created_at timestamptz,updated_at timestamptz)
language sql security definer stable set search_path=public as $$
 with mine as (
  select nm.network_id,nm.role from public.network_memberships nm where nm.user_id=auth.uid() and nm.status='active'
 )
 select b.id,b.requester_network_id,rn.name,b.recipient_network_id,tn.name,b.relationship_type,b.status,b.context_label,
  coalesce((b.capabilities->>'discovery')::boolean,false),coalesce((b.capabilities->>'introductions')::boolean,false),
  case when exists(select 1 from mine m where m.network_id=b.recipient_network_id) and not exists(select 1 from mine m where m.network_id=b.requester_network_id) then 'incoming'::varchar else 'outgoing'::varchar end,
  (b.status='pending' and public.is_network_admin(b.recipient_network_id)),
  (b.status='accepted' and (public.is_network_admin(b.requester_network_id) or public.is_network_admin(b.recipient_network_id))),
  b.created_at,b.updated_at
 from public.network_trust_bridges b
 join public.networks rn on rn.id=b.requester_network_id
 join public.networks tn on tn.id=b.recipient_network_id
 where (exists(select 1 from mine m where m.network_id in(b.requester_network_id,b.recipient_network_id)))
   and (b.status='accepted' or public.is_network_admin(b.requester_network_id) or public.is_network_admin(b.recipient_network_id))
 order by case b.status when 'pending' then 0 when 'accepted' then 1 else 2 end,b.updated_at desc;
$$;
revoke all on function public.get_my_network_trust_bridges() from public;
grant execute on function public.get_my_network_trust_bridges() to authenticated;

comment on table public.network_trust_bridges is 'M6-B neutral governed network-to-network trust edges. Capabilities are consented policy intent only; M6-B does not expose cross-network members, profiles, graphs or discovery results.';
comment on column public.network_trust_bridges.capabilities is 'Approved bridge capability intent. discovery/introductions are inert until later capability-specific runtime enforces them.';
