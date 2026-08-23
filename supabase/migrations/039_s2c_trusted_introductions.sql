-- S2-C — Trusted Introductions & Connection Paths
-- Cross-family paths are explicit, accepted family-to-family trust edges. No surname/community inference.

create table if not exists public.community_trust_edges(
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.community_spaces(id) on delete cascade,
  requester_network_id uuid not null references public.networks(id) on delete cascade,
  recipient_network_id uuid not null references public.networks(id) on delete cascade,
  status varchar(20) not null default 'pending' check(status in ('pending','accepted','declined','revoked')),
  context_label varchar(180),
  requested_by uuid not null references auth.users(id) on delete cascade,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(requester_network_id<>recipient_network_id)
);
create unique index if not exists uq_community_trust_edge_pair on public.community_trust_edges(space_id,least(requester_network_id,recipient_network_id),greatest(requester_network_id,recipient_network_id));
create index if not exists idx_community_trust_edges_networks on public.community_trust_edges(space_id,status,requester_network_id,recipient_network_id);

create table if not exists public.community_introduction_requests(
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.community_spaces(id) on delete cascade,
  requester_network_id uuid not null references public.networks(id) on delete cascade,
  requester_user_id uuid not null references auth.users(id) on delete cascade,
  target_card_id uuid not null references public.community_profile_cards(id) on delete cascade,
  target_network_id uuid not null references public.networks(id) on delete cascade,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  message text,
  status varchar(24) not null default 'pending' check(status in ('pending','accepted','declined','cancelled','connected')),
  path_snapshot jsonb not null default '[]'::jsonb,
  responded_by uuid references auth.users(id) on delete set null,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_intro_requests_requester on public.community_introduction_requests(requester_user_id,status,created_at desc);
create index if not exists idx_intro_requests_target on public.community_introduction_requests(target_user_id,status,created_at desc);

alter table public.community_trust_edges enable row level security;
alter table public.community_introduction_requests enable row level security;
revoke all on public.community_trust_edges,public.community_introduction_requests from anon,authenticated;

create or replace function public.request_family_trust_connection(p_space_id uuid,p_target_network_id uuid,p_context_label text default null) returns uuid
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); rid uuid;
begin
 if nid is null or not public.is_network_admin(nid) then raise exception 'Family Owner/admin access required.' using errcode='42501'; end if;
 if p_target_network_id=nid then raise exception 'Choose another family.' using errcode='22023'; end if;
 if not public.community_space_is_allowed(p_space_id,nid) then raise exception 'Your family is not connected to this community.' using errcode='42501'; end if;
 if not public.community_space_is_allowed(p_space_id,p_target_network_id) then raise exception 'That family is not connected to this community.' using errcode='42501'; end if;
 insert into public.community_trust_edges(space_id,requester_network_id,recipient_network_id,status,context_label,requested_by,updated_at)
 values(p_space_id,nid,p_target_network_id,'pending',nullif(trim(p_context_label),''),auth.uid(),now())
 on conflict(space_id,(least(requester_network_id,recipient_network_id)),(greatest(requester_network_id,recipient_network_id)))
 do update set requester_network_id=nid,recipient_network_id=p_target_network_id,status='pending',context_label=excluded.context_label,requested_by=auth.uid(),reviewed_by=null,reviewed_at=null,updated_at=now()
 returning id into rid;
 return rid;
end $$;
revoke all on function public.request_family_trust_connection(uuid,uuid,text) from public;
grant execute on function public.request_family_trust_connection(uuid,uuid,text) to authenticated;

create or replace function public.get_my_family_trust_connections(p_space_id uuid)
returns table(id uuid,other_network_id uuid,other_family_name varchar,status varchar,direction varchar,context_label varchar,created_at timestamptz)
language sql security definer stable set search_path=public as $$
 select e.id,
   case when e.requester_network_id=public.current_network_id() then e.recipient_network_id else e.requester_network_id end,
   n.name,e.status,
   case when e.requester_network_id=public.current_network_id() then 'outgoing'::varchar else 'incoming'::varchar end,
   e.context_label,e.created_at
 from public.community_trust_edges e
 join public.networks n on n.id=case when e.requester_network_id=public.current_network_id() then e.recipient_network_id else e.requester_network_id end
 where e.space_id=p_space_id and public.current_network_id() in(e.requester_network_id,e.recipient_network_id)
 order by case e.status when 'pending' then 0 when 'accepted' then 1 else 2 end,e.updated_at desc;
$$;
revoke all on function public.get_my_family_trust_connections(uuid) from public;
grant execute on function public.get_my_family_trust_connections(uuid) to authenticated;

create or replace function public.review_family_trust_connection(p_edge_id uuid,p_accept boolean) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); edge public.community_trust_edges%rowtype;
begin
 select * into edge from public.community_trust_edges where id=p_edge_id;
 if edge.id is null or edge.recipient_network_id<>nid or not public.is_network_admin(nid) then raise exception 'Only the receiving Family Owner/admin can review this connection.' using errcode='42501'; end if;
 update public.community_trust_edges set status=case when p_accept then 'accepted' else 'declined' end,reviewed_by=auth.uid(),reviewed_at=now(),updated_at=now() where id=p_edge_id;
end $$;
revoke all on function public.review_family_trust_connection(uuid,boolean) from public;
grant execute on function public.review_family_trust_connection(uuid,boolean) to authenticated;

create or replace function public.revoke_family_trust_connection(p_edge_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); edge public.community_trust_edges%rowtype;
begin
 select * into edge from public.community_trust_edges where id=p_edge_id;
 if edge.id is null or nid not in(edge.requester_network_id,edge.recipient_network_id) or not public.is_network_admin(nid) then raise exception 'Family Owner/admin access required.' using errcode='42501'; end if;
 update public.community_trust_edges set status='revoked',updated_at=now() where id=p_edge_id;
end $$;
revoke all on function public.revoke_family_trust_connection(uuid) from public;
grant execute on function public.revoke_family_trust_connection(uuid) to authenticated;

create or replace function public.get_trusted_connection_path(p_space_id uuid,p_target_network_id uuid)
returns table(path_network_ids uuid[],path_family_names text[],hops integer)
language sql security definer stable set search_path=public as $$
 with recursive walk(path,last_id,depth) as (
   select array[public.current_network_id()]::uuid[],public.current_network_id(),0
   where public.current_network_id() is not null and public.community_space_is_allowed(p_space_id,public.current_network_id())
   union all
   select w.path||x.next_id,x.next_id,w.depth+1
   from walk w
   join lateral(
     select case when e.requester_network_id=w.last_id then e.recipient_network_id else e.requester_network_id end next_id
     from public.community_trust_edges e
     where e.space_id=p_space_id and e.status='accepted' and w.last_id in(e.requester_network_id,e.recipient_network_id)
   ) x on true
   where w.depth<4 and not x.next_id=any(w.path)
 ), best as (
   select path,depth from walk where last_id=p_target_network_id order by depth limit 1
 )
 select b.path,array(select n.name::text from unnest(b.path) with ordinality p(id,ord) join public.networks n on n.id=p.id order by p.ord),b.depth
 from best b;
$$;
revoke all on function public.get_trusted_connection_path(uuid,uuid) from public;
grant execute on function public.get_trusted_connection_path(uuid,uuid) to authenticated;

create or replace function public.request_community_introduction(p_card_id uuid,p_message text default null) returns uuid
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); c public.community_profile_cards%rowtype; rid uuid; path_names text[]; path_ids uuid[]; hop_count integer;
begin
 if nid is null then raise exception 'Choose an active family first.' using errcode='42501'; end if;
 select * into c from public.community_profile_cards where id=p_card_id and active;
 if c.id is null or not public.community_space_is_allowed(c.space_id,nid) then raise exception 'Community profile is not available.' using errcode='42501'; end if;
 if c.network_id=nid then raise exception 'This person is already in your family.' using errcode='22023'; end if;
 select path_network_ids,path_family_names,hops into path_ids,path_names,hop_count from public.get_trusted_connection_path(c.space_id,c.network_id) limit 1;
 insert into public.community_introduction_requests(space_id,requester_network_id,requester_user_id,target_card_id,target_network_id,target_user_id,message,path_snapshot)
 values(c.space_id,nid,auth.uid(),c.id,c.network_id,c.owner_user_id,nullif(trim(p_message),''),
   case when path_names is null then '[]'::jsonb else to_jsonb(path_names) end) returning id into rid;
 return rid;
end $$;
revoke all on function public.request_community_introduction(uuid,text) from public;
grant execute on function public.request_community_introduction(uuid,text) to authenticated;

create or replace function public.get_my_community_introductions()
returns table(id uuid,direction varchar,status varchar,space_name varchar,other_family_name varchar,other_person_name varchar,category varchar,message text,path_snapshot jsonb,created_at timestamptz)
language sql security definer stable set search_path=public as $$
 select r.id,
   case when r.requester_user_id=auth.uid() then 'outgoing'::varchar else 'incoming'::varchar end,
   r.status,s.name,
   case when r.requester_user_id=auth.uid() then tn.name else rn.name end,
   c.display_name,c.category,r.message,r.path_snapshot,r.created_at
 from public.community_introduction_requests r
 join public.community_spaces s on s.id=r.space_id
 join public.community_profile_cards c on c.id=r.target_card_id
 join public.networks rn on rn.id=r.requester_network_id
 join public.networks tn on tn.id=r.target_network_id
 where r.requester_user_id=auth.uid() or r.target_user_id=auth.uid()
 order by r.created_at desc limit 200;
$$;
revoke all on function public.get_my_community_introductions() from public;
grant execute on function public.get_my_community_introductions() to authenticated;

create or replace function public.respond_to_community_introduction(p_request_id uuid,p_accept boolean) returns void
language plpgsql security definer set search_path=public as $$
begin
 update public.community_introduction_requests set status=case when p_accept then 'accepted' else 'declined' end,responded_by=auth.uid(),responded_at=now(),updated_at=now()
 where id=p_request_id and target_user_id=auth.uid() and status='pending';
 if not found then raise exception 'Introduction request not found or not yours to review.' using errcode='42501'; end if;
end $$;
revoke all on function public.respond_to_community_introduction(uuid,boolean) from public;
grant execute on function public.respond_to_community_introduction(uuid,boolean) to authenticated;

create or replace function public.cancel_community_introduction(p_request_id uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
 update public.community_introduction_requests set status='cancelled',updated_at=now() where id=p_request_id and requester_user_id=auth.uid() and status='pending';
 if not found then raise exception 'Pending introduction request not found.' using errcode='42501'; end if;
end $$;
revoke all on function public.cancel_community_introduction(uuid) from public;
grant execute on function public.cancel_community_introduction(uuid) to authenticated;

comment on table public.community_trust_edges is 'S2-C explicit, two-family-approved trust edges. Never inferred from surname/community membership.';
comment on table public.community_introduction_requests is 'S2-C consent-based introduction requests using opt-in community cards; contact details remain private.';
