-- Discovery runtime hotfix — vertical-neutral claimed-person discovery.
-- Fixes M6-C/M6-E assumption that every discoverable person lives in network_entities.
-- Family uses family_members + network_memberships.member_id; Alumni uses alumni_profiles.claimed_by;
-- generic/productized verticals continue to use network_entities.owner_user_id.

alter table public.cross_network_discovery_candidates
  alter column target_entity_id drop not null,
  add column if not exists target_subject_kind varchar(20) not null default 'entity',
  add column if not exists target_ref_id uuid;

update public.cross_network_discovery_candidates
set target_subject_kind='entity', target_ref_id=target_entity_id
where target_ref_id is null and target_entity_id is not null;

alter table public.trusted_introduction_requests
  alter column target_entity_id drop not null,
  add column if not exists target_subject_kind varchar(20) not null default 'entity',
  add column if not exists target_ref_id uuid;

update public.trusted_introduction_requests
set target_subject_kind='entity', target_ref_id=target_entity_id
where target_ref_id is null and target_entity_id is not null;

-- Replace discovery with a vertical-neutral claimed-person source while preserving M6-E max-depth=2 governance.
drop function if exists public.discover_across_trusted_networks(uuid,text,integer);
create function public.discover_across_trusted_networks(p_source_network_id uuid,p_query text,p_limit integer default 8)
returns table(candidate_id uuid,target_network_id uuid,target_network_name varchar,bridge_id uuid,relationship_type varchar,match_hint varchar,path_depth smallint,path_summary varchar)
language plpgsql security definer set search_path=public as $$
declare q text:=trim(coalesce(p_query,'')); lim integer:=greatest(1,least(coalesce(p_limit,8),12)); rec record; v_candidate uuid; found_count integer:=0; multihop_count integer:=0;
begin
 if auth.uid() is null or not public.is_network_member(p_source_network_id) then raise exception 'Membership in the source network is required.' using errcode='42501'; end if;
 if length(q)<2 then raise exception 'Enter at least 2 characters to discover relevant people.' using errcode='22023'; end if;
 delete from public.cross_network_discovery_candidates c where c.requester_user_id=auth.uid() and c.expires_at<now();

 for rec in
  with edges as(
   select b.id,b.relationship_type,b.requester_network_id a,b.recipient_network_id z,
    coalesce((b.capabilities->>'pathTraversal')::boolean,false) path_ok
   from public.network_trust_bridges b
   where b.status='accepted' and coalesce((b.capabilities->>'discovery')::boolean,false)
  ),
  direct_paths as(
   select e.id first_bridge_id,array[e.id]::uuid[] bridge_ids,
    array[p_source_network_id,case when e.a=p_source_network_id then e.z else e.a end]::uuid[] network_ids,
    case when e.a=p_source_network_id then e.z else e.a end target_id,
    1::smallint depth,e.relationship_type,'Direct trusted bridge'::varchar(260) summary
   from edges e where p_source_network_id in(e.a,e.z)
  ),
  two_hop_paths as(
   select e1.id first_bridge_id,array[e1.id,e2.id]::uuid[] bridge_ids,
    array[p_source_network_id,mid.mid_id,case when e2.a=mid.mid_id then e2.z else e2.a end]::uuid[] network_ids,
    case when e2.a=mid.mid_id then e2.z else e2.a end target_id,
    2::smallint depth,'trusted_path'::varchar relationship_type,
    ('2 governed bridges via '||mn.name)::varchar(260) summary
   from edges e1
   cross join lateral (select case when e1.a=p_source_network_id then e1.z else e1.a end mid_id) mid
   join public.networks mn on mn.id=mid.mid_id
   join edges e2 on mid.mid_id in(e2.a,e2.z) and e2.id<>e1.id
   where p_source_network_id in(e1.a,e1.z) and e1.path_ok and e2.path_ok
     and (case when e2.a=mid.mid_id then e2.z else e2.a end)<>p_source_network_id
  ),
  paths as(select * from direct_paths union all select * from two_hop_paths),
  claimed_people as(
   -- Generic/productized verticals
   select e.network_id,'entity'::varchar(20) subject_kind,e.id ref_id,e.id entity_id,e.owner_user_id target_user_id,
    e.label::text label,(e.label||' '||coalesce(e.metadata::text,''))::text search_blob,e.updated_at
   from public.network_entities e
   where e.kind='person' and e.owner_user_id is not null and e.visibility='members'
   union all
   -- Alumni vertical
   select ap.network_id,'alumni'::varchar(20),ap.id,null::uuid,ap.claimed_by,
    ap.full_name::text,(ap.full_name||' '||coalesce(ap.program,'')||' '||coalesce(ap.department,'')||' '||coalesce(ap.city,'')||' '||coalesce(ap.company,'')||' '||coalesce(ap.job_title,'')||' '||coalesce(ap.bio,''))::text,ap.updated_at
   from public.alumni_profiles ap
   where ap.claimed_by is not null and ap.visibility='members'
   union all
   -- Family vertical: only approved profiles that are actually claimed by an active membership.
   select fm.network_id,'family'::varchar(20),fm.id,null::uuid,nm.user_id,
    fm.full_name::text,(fm.full_name||' '||coalesce(fm.profession,'')||' '||coalesce(fm.city,'')||' '||coalesce(fm.country,'')||' '||coalesce(fm.bio,''))::text,fm.updated_at
   from public.family_members fm
   join public.network_memberships nm on nm.network_id=fm.network_id and nm.member_id=fm.id and nm.status='active'
   where fm.profile_status='approved'
  ),
  matches as(
   select p.*,cp.subject_kind,cp.ref_id,cp.entity_id,cp.target_user_id,n.name network_name,cp.updated_at,
    row_number() over(partition by cp.target_user_id order by p.depth asc,cp.updated_at desc) rn
   from paths p
   join public.networks n on n.id=p.target_id
   join claimed_people cp on cp.network_id=p.target_id
   where cp.target_user_id<>auth.uid() and lower(cp.search_blob) like '%'||lower(q)||'%'
  )
  select * from matches where rn=1 order by depth asc,updated_at desc limit lim
 loop
  insert into public.cross_network_discovery_candidates(
    requester_user_id,source_network_id,bridge_id,target_network_id,target_entity_id,target_user_id,query_text,
    path_depth,path_bridge_ids,path_network_ids,path_summary,target_subject_kind,target_ref_id)
  values(auth.uid(),p_source_network_id,rec.first_bridge_id,rec.target_id,rec.entity_id,rec.target_user_id,q,
    rec.depth,rec.bridge_ids,rec.network_ids,rec.summary,rec.subject_kind,rec.ref_id)
  returning id into v_candidate;
  found_count:=found_count+1; if rec.depth=2 then multihop_count:=multihop_count+1; end if;
  candidate_id:=v_candidate; target_network_id:=rec.target_id; target_network_name:=rec.network_name;
  bridge_id:=rec.first_bridge_id; relationship_type:=rec.relationship_type;
  match_hint:='Relevant member found through a governed trusted path.'; path_depth:=rec.depth; path_summary:=rec.summary; return next;
 end loop;

 insert into public.network_effect_events(actor_user_id,source_network_id,event_type,event_count)
 values(auth.uid(),p_source_network_id,'discovery_search',1);
 if found_count>0 then insert into public.network_effect_events(actor_user_id,source_network_id,event_type,event_count)
 values(auth.uid(),p_source_network_id,'discovery_opportunity',found_count); end if;
 if multihop_count>0 then insert into public.network_effect_events(actor_user_id,source_network_id,event_type,event_count)
 values(auth.uid(),p_source_network_id,'trusted_path_opportunity',multihop_count); end if;
end $$;
revoke all on function public.discover_across_trusted_networks(uuid,text,integer) from public;
grant execute on function public.discover_across_trusted_networks(uuid,text,integer) to authenticated;

-- Preserve vertical-neutral target reference when requesting an introduction and revalidate every path edge.
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
 insert into public.trusted_introduction_requests(candidate_id,bridge_id,source_network_id,target_network_id,requester_user_id,target_user_id,target_entity_id,message,path_depth,path_bridge_ids,path_summary,target_subject_kind,target_ref_id)
 values(c.id,c.bridge_id,c.source_network_id,c.target_network_id,auth.uid(),c.target_user_id,c.target_entity_id,msg,c.path_depth,c.path_bridge_ids,c.path_summary,c.target_subject_kind,c.target_ref_id)
 returning id into rid;
 insert into public.network_effect_events(actor_user_id,source_network_id,bridge_id,event_type) values(auth.uid(),c.source_network_id,c.bridge_id,'introduction_requested');
 insert into public.audit_log(network_id,actor_id,action,details) values(c.source_network_id,auth.uid(),'cross_network_introduction_requested',jsonb_build_object('introduction_id',rid,'bridge_id',c.bridge_id,'target_network_id',c.target_network_id,'path_depth',c.path_depth,'target_subject_kind',c.target_subject_kind));
 return rid;
end $$;
revoke all on function public.request_trusted_introduction(uuid,text) from public;
grant execute on function public.request_trusted_introduction(uuid,text) to authenticated;

-- Consent inbox/outbox now resolves the accepted target label from the correct vertical table.
drop function if exists public.get_my_trusted_introductions();
create function public.get_my_trusted_introductions()
returns table(id uuid,direction varchar,source_network_name varchar,target_network_name varchar,other_name varchar,message varchar,status varchar,created_at timestamptz,updated_at timestamptz,can_review boolean,path_depth smallint,path_summary varchar)
language sql security definer stable set search_path=public as $$
 select i.id,
  case when i.target_user_id=auth.uid() then 'incoming'::varchar else 'outgoing'::varchar end,
  sn.name,tn.name,
  case
   when i.target_user_id=auth.uid() then coalesce(nullif(p.full_name,''),'A member of '||sn.name)
   when i.requester_user_id=auth.uid() and i.status='accepted' then
    case i.target_subject_kind
     when 'family' then fm.full_name
     when 'alumni' then ap.full_name
     else ne.label
    end
   else null
  end::varchar,
  i.message,i.status,i.created_at,i.updated_at,(i.target_user_id=auth.uid() and i.status='pending'),i.path_depth,i.path_summary
 from public.trusted_introduction_requests i
 join public.networks sn on sn.id=i.source_network_id
 join public.networks tn on tn.id=i.target_network_id
 left join public.profiles p on p.id=i.requester_user_id
 left join public.network_entities ne on i.target_subject_kind='entity' and ne.id=i.target_ref_id
 left join public.alumni_profiles ap on i.target_subject_kind='alumni' and ap.id=i.target_ref_id
 left join public.family_members fm on i.target_subject_kind='family' and fm.id=i.target_ref_id
 where auth.uid() in(i.requester_user_id,i.target_user_id)
 order by i.created_at desc;
$$;
revoke all on function public.get_my_trusted_introductions() from public;
grant execute on function public.get_my_trusted_introductions() to authenticated;

comment on column public.cross_network_discovery_candidates.target_subject_kind is 'Runtime discovery target kind: entity, alumni, or family. Identity remains opaque until consent.';
comment on column public.cross_network_discovery_candidates.target_ref_id is 'Opaque vertical-local profile/entity reference used only by governed discovery/introduction RPCs.';
