-- M6-D — Network Effect Activation & Measurement
-- Privacy-safe behavioral telemetry: no query text, candidate identity, target profile, email or phone is stored here.
create table if not exists public.network_effect_events(
 id bigserial primary key,
 actor_user_id uuid not null references auth.users(id) on delete cascade,
 source_network_id uuid references public.networks(id) on delete cascade,
 bridge_id uuid references public.network_trust_bridges(id) on delete set null,
 event_type varchar(48) not null check(event_type in('discovery_search','discovery_opportunity','introduction_requested','introduction_accepted','introduction_declined')),
 event_count integer not null default 1 check(event_count between 1 and 1000),
 created_at timestamptz not null default now()
);
create index if not exists m6d_effect_actor_idx on public.network_effect_events(actor_user_id,created_at desc);
create index if not exists m6d_effect_network_idx on public.network_effect_events(source_network_id,event_type,created_at desc);
alter table public.network_effect_events enable row level security;
revoke all on public.network_effect_events from anon,authenticated;

create or replace function public.record_network_effect_event(p_source_network_id uuid,p_bridge_id uuid,p_event_type text,p_event_count integer default 1) returns void
language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
 if p_source_network_id is not null and not public.is_network_member(p_source_network_id) then raise exception 'Source network membership is required.' using errcode='42501'; end if;
 if p_event_type not in('discovery_search','discovery_opportunity','introduction_requested','introduction_accepted','introduction_declined') then raise exception 'Unsupported network effect event.' using errcode='22023'; end if;
 insert into public.network_effect_events(actor_user_id,source_network_id,bridge_id,event_type,event_count)
 values(auth.uid(),p_source_network_id,p_bridge_id,p_event_type,greatest(1,least(coalesce(p_event_count,1),1000)));
end $$;
revoke all on function public.record_network_effect_event(uuid,uuid,text,integer) from public;

-- M6-C discovery now records only aggregate search/opportunity facts; query text and candidate identities remain outside analytics.
create or replace function public.discover_across_trusted_networks(p_source_network_id uuid,p_query text,p_limit integer default 8)
returns table(candidate_id uuid,target_network_id uuid,target_network_name varchar,bridge_id uuid,relationship_type varchar,match_hint varchar)
language plpgsql security definer set search_path=public as $$
declare q text:=trim(coalesce(p_query,'')); lim integer:=greatest(1,least(coalesce(p_limit,8),12)); rec record; v_candidate uuid; found_count integer:=0;
begin
 if auth.uid() is null or not public.is_network_member(p_source_network_id) then raise exception 'Membership in the source network is required.' using errcode='42501';end if;
 if length(q)<2 then raise exception 'Enter at least 2 characters to discover relevant people.' using errcode='22023';end if;
 delete from public.cross_network_discovery_candidates c where c.requester_user_id=auth.uid() and c.expires_at<now();
 for rec in
   with bridges as(
    select b.id,b.relationship_type,case when b.requester_network_id=p_source_network_id then b.recipient_network_id else b.requester_network_id end target_id
    from public.network_trust_bridges b where b.status='accepted' and coalesce((b.capabilities->>'discovery')::boolean,false)
      and p_source_network_id in(b.requester_network_id,b.recipient_network_id)
   )
   select br.id bridge_id_value,br.relationship_type relationship_type_value,br.target_id,e.id entity_id,e.owner_user_id,n.name network_name
   from bridges br join public.networks n on n.id=br.target_id join public.network_entities e on e.network_id=br.target_id
   where e.kind='person' and e.owner_user_id is not null and e.owner_user_id<>auth.uid() and e.visibility='members'
     and lower(e.label||' '||coalesce(e.metadata::text,'')) like '%'||lower(q)||'%'
   order by case when lower(e.label)=lower(q) then 0 else 1 end,e.updated_at desc limit lim
 loop
   insert into public.cross_network_discovery_candidates(requester_user_id,source_network_id,bridge_id,target_network_id,target_entity_id,target_user_id,query_text)
   values(auth.uid(),p_source_network_id,rec.bridge_id_value,rec.target_id,rec.entity_id,rec.owner_user_id,q) returning id into v_candidate;
   found_count:=found_count+1;
   candidate_id:=v_candidate;target_network_id:=rec.target_id;target_network_name:=rec.network_name;bridge_id:=rec.bridge_id_value;relationship_type:=rec.relationship_type_value;match_hint:='Relevant member found through a trusted network bridge.';return next;
 end loop;
 insert into public.network_effect_events(actor_user_id,source_network_id,event_type,event_count) values(auth.uid(),p_source_network_id,'discovery_search',1);
 if found_count>0 then insert into public.network_effect_events(actor_user_id,source_network_id,event_type,event_count) values(auth.uid(),p_source_network_id,'discovery_opportunity',found_count); end if;
end $$;
revoke all on function public.discover_across_trusted_networks(uuid,text,integer) from public;grant execute on function public.discover_across_trusted_networks(uuid,text,integer) to authenticated;

-- Preserve M6-C request contract while recording one compact event.
create or replace function public.request_trusted_introduction(p_candidate_id uuid,p_message text) returns uuid
language plpgsql security definer set search_path=public as $$
declare c public.cross_network_discovery_candidates%rowtype;b public.network_trust_bridges%rowtype;rid uuid;msg text:=trim(coalesce(p_message,''));
begin
 select * into c from public.cross_network_discovery_candidates where id=p_candidate_id and requester_user_id=auth.uid() and expires_at>now();
 if c.id is null then raise exception 'Discovery result expired or is unavailable.' using errcode='P0002';end if;
 if length(msg)<3 then raise exception 'Add a short reason for the introduction.' using errcode='22023';end if;
 select * into b from public.network_trust_bridges where id=c.bridge_id and status='accepted';
 if b.id is null or not coalesce((b.capabilities->>'introductions')::boolean,false) then raise exception 'Trusted introductions are not enabled on this bridge.' using errcode='42501';end if;
 insert into public.trusted_introduction_requests(candidate_id,bridge_id,source_network_id,target_network_id,requester_user_id,target_user_id,target_entity_id,message)
 values(c.id,c.bridge_id,c.source_network_id,c.target_network_id,auth.uid(),c.target_user_id,c.target_entity_id,msg) returning id into rid;
 insert into public.network_effect_events(actor_user_id,source_network_id,bridge_id,event_type) values(auth.uid(),c.source_network_id,c.bridge_id,'introduction_requested');
 insert into public.audit_log(network_id,actor_id,action,details) values(c.source_network_id,auth.uid(),'cross_network_introduction_requested',jsonb_build_object('introduction_id',rid,'bridge_id',c.bridge_id,'target_network_id',c.target_network_id));
 return rid;
end $$;
revoke all on function public.request_trusted_introduction(uuid,text) from public;grant execute on function public.request_trusted_introduction(uuid,text) to authenticated;

create or replace function public.review_trusted_introduction(p_introduction_id uuid,p_accept boolean) returns void
language plpgsql security definer set search_path=public as $$
declare x public.trusted_introduction_requests%rowtype;
begin
 select * into x from public.trusted_introduction_requests where id=p_introduction_id;
 if x.id is null then raise exception 'Introduction request not found.' using errcode='P0002';end if;
 if x.target_user_id<>auth.uid() then raise exception 'Only the requested person can review this introduction.' using errcode='42501';end if;
 if x.status<>'pending' then raise exception 'Only pending introduction requests can be reviewed.' using errcode='22023';end if;
 update public.trusted_introduction_requests set status=case when p_accept then 'accepted' else 'declined' end,reviewed_at=now(),updated_at=now() where id=x.id;
 insert into public.network_effect_events(actor_user_id,source_network_id,bridge_id,event_type) values(auth.uid(),x.source_network_id,x.bridge_id,case when p_accept then 'introduction_accepted' else 'introduction_declined' end);
 insert into public.audit_log(network_id,actor_id,action,details) values(x.target_network_id,auth.uid(),case when p_accept then 'cross_network_introduction_accepted' else 'cross_network_introduction_declined' end,jsonb_build_object('introduction_id',x.id,'bridge_id',x.bridge_id));
end $$;
revoke all on function public.review_trusted_introduction(uuid,boolean) from public;grant execute on function public.review_trusted_introduction(uuid,boolean) to authenticated;

create or replace function public.get_my_network_effect_pulse(p_days integer default 30) returns jsonb
language sql security definer stable set search_path=public as $$
with cfg as(select greatest(7,least(coalesce(p_days,30),90)) d),
mine as(select network_id from public.network_memberships where user_id=auth.uid() and status='active'),
bridges as(select b.* from public.network_trust_bridges b where b.status='accepted' and exists(select 1 from mine m where m.network_id in(b.requester_network_id,b.recipient_network_id))),
events as(select e.* from public.network_effect_events e,cfg where e.actor_user_id=auth.uid() and e.created_at>=now()-(cfg.d||' days')::interval),
intros as(select i.* from public.trusted_introduction_requests i,cfg where auth.uid() in(i.requester_user_id,i.target_user_id) and i.created_at>=now()-(cfg.d||' days')::interval),
vals as(select
 (select count(*) from mine)::int active_networks,
 (select count(*) from bridges)::int accepted_bridges,
 coalesce((select sum(event_count) from events where event_type='discovery_search'),0)::int discovery_searches,
 coalesce((select sum(event_count) from events where event_type='discovery_opportunity'),0)::int opportunities_found,
 (select count(*) from intros where requester_user_id=auth.uid())::int introductions_requested,
 (select count(*) from intros where requester_user_id=auth.uid() and status='accepted')::int introductions_accepted,
 (select count(*) from intros where target_user_id=auth.uid() and status='pending')::int introductions_waiting,
 (select count(*) from intros where status='declined')::int introductions_declined)
select jsonb_build_object('days',(select d from cfg),'activeNetworks',active_networks,'acceptedBridges',accepted_bridges,'discoverySearches',discovery_searches,'opportunitiesFound',opportunities_found,'introductionsRequested',introductions_requested,'introductionsAccepted',introductions_accepted,'introductionsWaiting',introductions_waiting,'introductionsDeclined',introductions_declined,'acceptanceRate',case when introductions_requested>0 then round((introductions_accepted::numeric/introductions_requested)*100) else 0 end,'activationStage',case when active_networks<2 then 'multi_network' when accepted_bridges=0 then 'bridge' when discovery_searches=0 then 'discover' when introductions_requested=0 then 'introduce' when introductions_accepted=0 then 'consent' else 'proven' end) from vals;
$$;
revoke all on function public.get_my_network_effect_pulse(integer) from public;grant execute on function public.get_my_network_effect_pulse(integer) to authenticated;
comment on table public.network_effect_events is 'M6-D privacy-safe behavioral telemetry. Does not store search text, candidate identity, target profile or contact data.';
