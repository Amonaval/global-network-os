-- M6-C — Privacy-Safe Cross-Network Discovery & Trusted Introductions
-- Discovery returns anonymous opportunity handles. Identity is disclosed to the requester only after target consent.
create table if not exists public.cross_network_discovery_candidates(
 id uuid primary key default gen_random_uuid(), requester_user_id uuid not null references auth.users(id) on delete cascade,
 source_network_id uuid not null references public.networks(id) on delete cascade, bridge_id uuid not null references public.network_trust_bridges(id) on delete cascade,
 target_network_id uuid not null references public.networks(id) on delete cascade, target_entity_id uuid not null references public.network_entities(id) on delete cascade,
 target_user_id uuid not null references auth.users(id) on delete cascade, query_text varchar(120) not null, match_hint varchar(180) not null default 'Relevant member found through a trusted network bridge.',
 created_at timestamptz not null default now(), expires_at timestamptz not null default (now()+interval '30 minutes')
);
create index if not exists m6c_candidate_requester_idx on public.cross_network_discovery_candidates(requester_user_id,expires_at desc);

create table if not exists public.trusted_introduction_requests(
 id uuid primary key default gen_random_uuid(), candidate_id uuid not null references public.cross_network_discovery_candidates(id) on delete cascade,
 bridge_id uuid not null references public.network_trust_bridges(id) on delete cascade, source_network_id uuid not null references public.networks(id) on delete cascade,
 target_network_id uuid not null references public.networks(id) on delete cascade, requester_user_id uuid not null references auth.users(id) on delete cascade,
 target_user_id uuid not null references auth.users(id) on delete cascade, target_entity_id uuid not null references public.network_entities(id) on delete cascade,
 message varchar(500) not null, status varchar(20) not null default 'pending' check(status in('pending','accepted','declined','cancelled')),
 reviewed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists m6c_intro_requester_idx on public.trusted_introduction_requests(requester_user_id,created_at desc);
create index if not exists m6c_intro_target_idx on public.trusted_introduction_requests(target_user_id,status,created_at desc);
alter table public.cross_network_discovery_candidates enable row level security;alter table public.trusted_introduction_requests enable row level security;
revoke all on public.cross_network_discovery_candidates,public.trusted_introduction_requests from anon,authenticated;

create or replace function public.discover_across_trusted_networks(p_source_network_id uuid,p_query text,p_limit integer default 8)
returns table(candidate_id uuid,target_network_id uuid,target_network_name varchar,bridge_id uuid,relationship_type varchar,match_hint varchar)
language plpgsql security definer set search_path=public as $$
declare q text:=trim(coalesce(p_query,'')); lim integer:=greatest(1,least(coalesce(p_limit,8),12)); rec record; v_candidate uuid;
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
   candidate_id:=v_candidate;target_network_id:=rec.target_id;target_network_name:=rec.network_name;bridge_id:=rec.bridge_id_value;relationship_type:=rec.relationship_type_value;match_hint:='Relevant member found through a trusted network bridge.';return next;
 end loop;
end $$;
revoke all on function public.discover_across_trusted_networks(uuid,text,integer) from public;grant execute on function public.discover_across_trusted_networks(uuid,text,integer) to authenticated;

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
 insert into public.audit_log(network_id,actor_id,action,details) values(x.target_network_id,auth.uid(),case when p_accept then 'cross_network_introduction_accepted' else 'cross_network_introduction_declined' end,jsonb_build_object('introduction_id',x.id,'bridge_id',x.bridge_id));
end $$;
revoke all on function public.review_trusted_introduction(uuid,boolean) from public;grant execute on function public.review_trusted_introduction(uuid,boolean) to authenticated;

create or replace function public.get_my_trusted_introductions()
returns table(id uuid,direction varchar,source_network_name varchar,target_network_name varchar,other_name varchar,message varchar,status varchar,created_at timestamptz,updated_at timestamptz,can_review boolean)
language sql security definer stable set search_path=public as $$
 select i.id,case when i.target_user_id=auth.uid() then 'incoming'::varchar else 'outgoing'::varchar end,sn.name,tn.name,
  case when i.target_user_id=auth.uid() then coalesce(nullif(p.full_name,''),'A member of '||sn.name)
       when i.requester_user_id=auth.uid() and i.status='accepted' then e.label else null end::varchar,
  i.message,i.status,i.created_at,i.updated_at,(i.target_user_id=auth.uid() and i.status='pending')
 from public.trusted_introduction_requests i join public.networks sn on sn.id=i.source_network_id join public.networks tn on tn.id=i.target_network_id
 join public.network_entities e on e.id=i.target_entity_id left join public.profiles p on p.id=i.requester_user_id
 where auth.uid() in(i.requester_user_id,i.target_user_id) order by i.created_at desc;
$$;
revoke all on function public.get_my_trusted_introductions() from public;grant execute on function public.get_my_trusted_introductions() to authenticated;
comment on table public.cross_network_discovery_candidates is 'M6-C ephemeral opaque discovery handles. Candidate identity is intentionally not returned to requester.';
comment on table public.trusted_introduction_requests is 'M6-C consent gate. Target identity becomes visible to requester only after target acceptance.';
