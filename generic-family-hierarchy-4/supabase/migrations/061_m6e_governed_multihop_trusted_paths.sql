-- M6-E — Governed Multi-Hop Trusted Paths
-- Adds explicit path-traversal consent and privacy-safe depth-2 graph reasoning.
-- One-hop M6-C behavior remains valid. No unrestricted graph traversal is introduced.

alter table public.cross_network_discovery_candidates
 add column if not exists path_depth smallint not null default 1 check(path_depth in(1,2)),
 add column if not exists path_bridge_ids uuid[] not null default '{}'::uuid[],
 add column if not exists path_network_ids uuid[] not null default '{}'::uuid[],
 add column if not exists path_summary varchar(260) not null default 'Direct trusted bridge';

update public.cross_network_discovery_candidates c
set path_bridge_ids=array[c.bridge_id],path_network_ids=array[c.source_network_id,c.target_network_id],path_summary='Direct trusted bridge'
where cardinality(c.path_bridge_ids)=0;

alter table public.trusted_introduction_requests
 add column if not exists path_depth smallint not null default 1 check(path_depth in(1,2)),
 add column if not exists path_bridge_ids uuid[] not null default '{}'::uuid[],
 add column if not exists path_summary varchar(260) not null default 'Direct trusted bridge';

update public.trusted_introduction_requests i
set path_bridge_ids=array[i.bridge_id],path_summary='Direct trusted bridge'
where cardinality(i.path_bridge_ids)=0;

-- Bridge capability normalizer now includes explicit transitive/path-traversal consent.
create or replace function public.m6b_bridge_capabilities(p_value jsonb) returns jsonb
language sql immutable set search_path=public as $$
 select jsonb_build_object(
  'discovery',coalesce((p_value->>'discovery')::boolean,false),
  'introductions',coalesce((p_value->>'introductions')::boolean,false),
  'pathTraversal',coalesce((p_value->>'pathTraversal')::boolean,false)
 );
$$;

-- Return the new path-traversal consent flag to My Networks.
drop function if exists public.get_my_network_trust_bridges();
create function public.get_my_network_trust_bridges()
returns table(id uuid,requester_network_id uuid,requester_network_name varchar,recipient_network_id uuid,recipient_network_name varchar,relationship_type varchar,status varchar,context_label varchar,discovery_enabled boolean,introductions_enabled boolean,path_traversal_enabled boolean,direction varchar,can_review boolean,can_revoke boolean,created_at timestamptz,updated_at timestamptz)
language sql security definer stable set search_path=public as $$
 with mine as (
  select nm.network_id,nm.role from public.network_memberships nm where nm.user_id=auth.uid() and nm.status='active'
 )
 select b.id,b.requester_network_id,rn.name,b.recipient_network_id,tn.name,b.relationship_type,b.status,b.context_label,
  coalesce((b.capabilities->>'discovery')::boolean,false),coalesce((b.capabilities->>'introductions')::boolean,false),coalesce((b.capabilities->>'pathTraversal')::boolean,false),
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
revoke all on function public.get_my_network_trust_bridges() from public;grant execute on function public.get_my_network_trust_bridges() to authenticated;

-- M6-E discovery: max depth = 2. A two-hop path exists only when BOTH edges explicitly opt into pathTraversal.
-- Results remain anonymous opportunity handles; this function never returns person identity/profile data.
drop function if exists public.discover_across_trusted_networks(uuid,text,integer);
create function public.discover_across_trusted_networks(p_source_network_id uuid,p_query text,p_limit integer default 8)
returns table(candidate_id uuid,target_network_id uuid,target_network_name varchar,bridge_id uuid,relationship_type varchar,match_hint varchar,path_depth smallint,path_summary varchar)
language plpgsql security definer set search_path=public as $$
declare q text:=trim(coalesce(p_query,'')); lim integer:=greatest(1,least(coalesce(p_limit,8),12)); rec record; v_candidate uuid; found_count integer:=0; multihop_count integer:=0;
begin
 if auth.uid() is null or not public.is_network_member(p_source_network_id) then raise exception 'Membership in the source network is required.' using errcode='42501';end if;
 if length(q)<2 then raise exception 'Enter at least 2 characters to discover relevant people.' using errcode='22023';end if;
 delete from public.cross_network_discovery_candidates c where c.requester_user_id=auth.uid() and c.expires_at<now();
 for rec in
  with edges as(
   select b.id,b.relationship_type,b.requester_network_id a,b.recipient_network_id z,
    coalesce((b.capabilities->>'pathTraversal')::boolean,false) path_ok
   from public.network_trust_bridges b
   where b.status='accepted' and coalesce((b.capabilities->>'discovery')::boolean,false)
  ),
  direct_paths as(
   select e.id first_bridge_id,array[e.id]::uuid[] bridge_ids,array[p_source_network_id,case when e.a=p_source_network_id then e.z else e.a end]::uuid[] network_ids,
    (case when e.a=p_source_network_id then e.z else e.a end) target_id,1::smallint depth,e.relationship_type,
    'Direct trusted bridge'::varchar(260) summary
   from edges e where p_source_network_id in(e.a,e.z)
  ),
  two_hop_paths as(
   select e1.id first_bridge_id,array[e1.id,e2.id]::uuid[] bridge_ids,array[p_source_network_id,mid.mid_id,case when e2.a=mid.mid_id then e2.z else e2.a end]::uuid[] network_ids,
    case when e2.a=mid.mid_id then e2.z else e2.a end target_id,2::smallint depth,'trusted_path'::varchar relationship_type,
    ('2 governed bridges via '||mn.name)::varchar(260) summary
   from edges e1
   cross join lateral (select case when e1.a=p_source_network_id then e1.z else e1.a end mid_id) mid
   join public.networks mn on mn.id=mid.mid_id
   join edges e2 on mid.mid_id in(e2.a,e2.z) and e2.id<>e1.id
   where p_source_network_id in(e1.a,e1.z) and e1.path_ok and e2.path_ok
     and (case when e2.a=mid.mid_id then e2.z else e2.a end)<>p_source_network_id
  ),
  paths as(select * from direct_paths union all select * from two_hop_paths),
  matches as(
   select p.*,e.id entity_id,e.owner_user_id,n.name network_name,e.updated_at,
    row_number() over(partition by e.owner_user_id order by p.depth asc,e.updated_at desc) rn
   from paths p join public.networks n on n.id=p.target_id join public.network_entities e on e.network_id=p.target_id
   where e.kind='person' and e.owner_user_id is not null and e.owner_user_id<>auth.uid() and e.visibility='members'
    and lower(e.label||' '||coalesce(e.metadata::text,'')) like '%'||lower(q)||'%'
  )
  select * from matches where rn=1 order by depth asc,updated_at desc limit lim
 loop
  insert into public.cross_network_discovery_candidates(requester_user_id,source_network_id,bridge_id,target_network_id,target_entity_id,target_user_id,query_text,path_depth,path_bridge_ids,path_network_ids,path_summary)
  values(auth.uid(),p_source_network_id,rec.first_bridge_id,rec.target_id,rec.entity_id,rec.owner_user_id,q,rec.depth,rec.bridge_ids,rec.network_ids,rec.summary) returning id into v_candidate;
  found_count:=found_count+1;if rec.depth=2 then multihop_count:=multihop_count+1;end if;
  candidate_id:=v_candidate;target_network_id:=rec.target_id;target_network_name:=rec.network_name;bridge_id:=rec.first_bridge_id;relationship_type:=rec.relationship_type;match_hint:='Relevant member found through a governed trusted path.';path_depth:=rec.depth;path_summary:=rec.summary;return next;
 end loop;
 insert into public.network_effect_events(actor_user_id,source_network_id,event_type,event_count) values(auth.uid(),p_source_network_id,'discovery_search',1);
 if found_count>0 then insert into public.network_effect_events(actor_user_id,source_network_id,event_type,event_count) values(auth.uid(),p_source_network_id,'discovery_opportunity',found_count); end if;
 if multihop_count>0 then insert into public.network_effect_events(actor_user_id,source_network_id,event_type,event_count) values(auth.uid(),p_source_network_id,'trusted_path_opportunity',multihop_count); end if;
end $$;
revoke all on function public.discover_across_trusted_networks(uuid,text,integer) from public;grant execute on function public.discover_across_trusted_networks(uuid,text,integer) to authenticated;

-- Extend privacy-safe telemetry with only the fact that a depth-2 opportunity existed.
alter table public.network_effect_events drop constraint if exists network_effect_events_event_type_check;
alter table public.network_effect_events add constraint network_effect_events_event_type_check check(event_type in('discovery_search','discovery_opportunity','trusted_path_opportunity','introduction_requested','introduction_accepted','introduction_declined'));

-- Introduction request re-validates every path edge at request time. A revoked/downgraded path cannot be used.
create or replace function public.request_trusted_introduction(p_candidate_id uuid,p_message text) returns uuid
language plpgsql security definer set search_path=public as $$
declare c public.cross_network_discovery_candidates%rowtype;rid uuid;msg text:=trim(coalesce(p_message,''));valid_edges integer;
begin
 select * into c from public.cross_network_discovery_candidates where id=p_candidate_id and requester_user_id=auth.uid() and expires_at>now();
 if c.id is null then raise exception 'Discovery result expired or is unavailable.' using errcode='P0002';end if;
 if length(msg)<3 then raise exception 'Add a short reason for the introduction.' using errcode='22023';end if;
 select count(*) into valid_edges from public.network_trust_bridges b
 where b.id=any(c.path_bridge_ids) and b.status='accepted'
  and coalesce((b.capabilities->>'introductions')::boolean,false)
  and (c.path_depth=1 or coalesce((b.capabilities->>'pathTraversal')::boolean,false));
 if valid_edges<>cardinality(c.path_bridge_ids) then raise exception 'This trusted path no longer permits introductions.' using errcode='42501';end if;
 insert into public.trusted_introduction_requests(candidate_id,bridge_id,source_network_id,target_network_id,requester_user_id,target_user_id,target_entity_id,message,path_depth,path_bridge_ids,path_summary)
 values(c.id,c.bridge_id,c.source_network_id,c.target_network_id,auth.uid(),c.target_user_id,c.target_entity_id,msg,c.path_depth,c.path_bridge_ids,c.path_summary) returning id into rid;
 insert into public.network_effect_events(actor_user_id,source_network_id,bridge_id,event_type) values(auth.uid(),c.source_network_id,c.bridge_id,'introduction_requested');
 insert into public.audit_log(network_id,actor_id,action,details) values(c.source_network_id,auth.uid(),'cross_network_introduction_requested',jsonb_build_object('introduction_id',rid,'bridge_id',c.bridge_id,'target_network_id',c.target_network_id,'path_depth',c.path_depth));
 return rid;
end $$;
revoke all on function public.request_trusted_introduction(uuid,text) from public;grant execute on function public.request_trusted_introduction(uuid,text) to authenticated;

-- Include path provenance in the consent inbox/outbox; identity disclosure rules are unchanged.
drop function if exists public.get_my_trusted_introductions();
create function public.get_my_trusted_introductions()
returns table(id uuid,direction varchar,source_network_name varchar,target_network_name varchar,other_name varchar,message varchar,status varchar,created_at timestamptz,updated_at timestamptz,can_review boolean,path_depth smallint,path_summary varchar)
language sql security definer stable set search_path=public as $$
 select i.id,case when i.target_user_id=auth.uid() then 'incoming'::varchar else 'outgoing'::varchar end,sn.name,tn.name,
  case when i.target_user_id=auth.uid() then coalesce(nullif(p.full_name,''),'A member of '||sn.name)
       when i.requester_user_id=auth.uid() and i.status='accepted' then e.label else null end::varchar,
  i.message,i.status,i.created_at,i.updated_at,(i.target_user_id=auth.uid() and i.status='pending'),i.path_depth,i.path_summary
 from public.trusted_introduction_requests i join public.networks sn on sn.id=i.source_network_id join public.networks tn on tn.id=i.target_network_id
 join public.network_entities e on e.id=i.target_entity_id left join public.profiles p on p.id=i.requester_user_id
 where auth.uid() in(i.requester_user_id,i.target_user_id) order by i.created_at desc;
$$;
revoke all on function public.get_my_trusted_introductions() from public;grant execute on function public.get_my_trusted_introductions() to authenticated;

-- Keep M6-D pulse compatible and add one privacy-safe graph-depth metric.
create or replace function public.get_my_network_effect_pulse(p_days integer default 30) returns jsonb
language sql security definer stable set search_path=public as $$
with cfg as(select greatest(7,least(coalesce(p_days,30),90)) d),
mine as(select network_id from public.network_memberships where user_id=auth.uid() and status='active'),
bridges as(select b.* from public.network_trust_bridges b where b.status='accepted' and exists(select 1 from mine m where m.network_id in(b.requester_network_id,b.recipient_network_id))),
events as(select e.* from public.network_effect_events e,cfg where e.actor_user_id=auth.uid() and e.created_at>=now()-(cfg.d||' days')::interval),
intros as(select i.* from public.trusted_introduction_requests i,cfg where auth.uid() in(i.requester_user_id,i.target_user_id) and i.created_at>=now()-(cfg.d||' days')::interval),
vals as(select
 (select count(*) from mine)::int active_networks,(select count(*) from bridges)::int accepted_bridges,
 coalesce((select sum(event_count) from events where event_type='discovery_search'),0)::int discovery_searches,
 coalesce((select sum(event_count) from events where event_type='discovery_opportunity'),0)::int opportunities_found,
 coalesce((select sum(event_count) from events where event_type='trusted_path_opportunity'),0)::int multi_hop_opportunities,
 (select count(*) from intros where requester_user_id=auth.uid())::int introductions_requested,
 (select count(*) from intros where requester_user_id=auth.uid() and status='accepted')::int introductions_accepted,
 (select count(*) from intros where target_user_id=auth.uid() and status='pending')::int introductions_waiting,
 (select count(*) from intros where status='declined')::int introductions_declined)
select jsonb_build_object('days',(select d from cfg),'activeNetworks',active_networks,'acceptedBridges',accepted_bridges,'discoverySearches',discovery_searches,'opportunitiesFound',opportunities_found,'multiHopOpportunities',multi_hop_opportunities,'introductionsRequested',introductions_requested,'introductionsAccepted',introductions_accepted,'introductionsWaiting',introductions_waiting,'introductionsDeclined',introductions_declined,'acceptanceRate',case when introductions_requested>0 then round((introductions_accepted::numeric/introductions_requested)*100) else 0 end,'activationStage',case when active_networks<2 then 'multi_network' when accepted_bridges=0 then 'bridge' when discovery_searches=0 then 'discover' when introductions_requested=0 then 'introduce' when introductions_accepted=0 then 'consent' else 'proven' end) from vals;
$$;
revoke all on function public.get_my_network_effect_pulse(integer) from public;grant execute on function public.get_my_network_effect_pulse(integer) to authenticated;

comment on column public.network_trust_bridges.capabilities is 'Governed bridge consent: discovery, introductions, and explicit pathTraversal. Path traversal is OFF by default and required on every edge for M6-E depth-2 discovery.';
comment on column public.cross_network_discovery_candidates.path_bridge_ids is 'M6-E short-lived governed provenance path. Maximum 2 bridge edges; never a public graph traversal token.';
