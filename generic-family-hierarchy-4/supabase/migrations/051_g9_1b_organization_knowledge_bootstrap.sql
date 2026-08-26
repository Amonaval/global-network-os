-- G9.1-B Organization Knowledge Bootstrap. Additive; G9/G9.1-A behavior remains intact.

create or replace function public.g91b_assert_organization_network(p_network uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
 if p_network is null or (select vertical_kind from public.networks where id=p_network)<>'organization' then raise exception 'Organization network required.' using errcode='22023'; end if;
end $$;
revoke all on function public.g91b_assert_organization_network(uuid) from public;

create or replace function public.submit_organization_knowledge_evidence(p_source jsonb,p_records jsonb) returns jsonb
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();sid uuid;r jsonb;inserted_count int:=0;existing_source uuid;
begin
 perform public.g91b_assert_organization_network(nid);if not public.is_network_admin(nid) then raise exception 'Network admin access required.' using errcode='42501';end if;
 select id into existing_source from public.network_knowledge_sources where network_id=nid and external_id=nullif(p_source->>'externalId','') order by created_at desc limit 1;
 if existing_source is null then
  insert into public.network_knowledge_sources(network_id,source_type,external_id,title,uri,connector_id,visibility,authorization_refs,content_hash,source_updated_at,last_observed_at,metadata)
  values(nid,coalesce(nullif(p_source->>'type',''),'other'),nullif(p_source->>'externalId',''),coalesce(nullif(p_source->>'title',''),'Knowledge source'),nullif(p_source->>'uri',''),nullif(p_source->>'connectorId',''),case when p_source->>'visibility'='restricted' then 'restricted' else 'network' end,coalesce(array(select jsonb_array_elements_text(coalesce(p_source->'authorizationRefs','[]'::jsonb))),'{}'),nullif(p_source->>'contentHash',''),nullif(p_source->>'sourceUpdatedAt','')::timestamptz,now(),coalesce(p_source->'metadata','{}')) returning id into sid;
 else sid:=existing_source;update public.network_knowledge_sources set last_observed_at=now(),content_hash=coalesce(nullif(p_source->>'contentHash',''),content_hash),source_updated_at=coalesce(nullif(p_source->>'sourceUpdatedAt','')::timestamptz,source_updated_at) where id=sid;end if;
 for r in select * from jsonb_array_elements(coalesce(p_records,'[]'::jsonb)) loop
  insert into public.network_evidence_records(network_id,source_id,document_external_id,chunk_id,title,uri,section,breadcrumb,content_hash,excerpt,source_updated_at,visibility,authorization_refs,extraction_version,metadata)
  values(nid,sid,nullif(r->>'documentExternalId',''),coalesce(nullif(r->>'chunkId',''),md5(coalesce(r->>'excerpt',''))),nullif(r->>'title',''),nullif(r->>'uri',''),nullif(r->>'section',''),coalesce(r->'breadcrumb','[]'),coalesce(nullif(r->>'contentHash',''),md5(coalesce(r->>'excerpt',''))),nullif(r->>'excerpt',''),nullif(r->>'sourceUpdatedAt','')::timestamptz,case when r->>'visibility'='restricted' then 'restricted' else 'network' end,coalesce(array(select jsonb_array_elements_text(coalesce(r->'authorizationRefs',p_source->'authorizationRefs','[]'::jsonb))),'{}'),nullif(r->>'extractionVersion',''),coalesce(r->'metadata','{}')) on conflict(network_id,source_id,chunk_id,content_hash) do nothing;
  if found then inserted_count:=inserted_count+1;end if;
 end loop;
 return jsonb_build_object('sourceId',sid,'insertedEvidence',inserted_count);
end $$;
revoke all on function public.submit_organization_knowledge_evidence(jsonb,jsonb) from public;grant execute on function public.submit_organization_knowledge_evidence(jsonb,jsonb) to authenticated;

create or replace function public.submit_organization_candidate_assertions(p_assertions jsonb) returns integer
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();r jsonb;c int:=0;pred text;kind text;eids uuid[];
begin
 perform public.g91b_assert_organization_network(nid);if not public.is_network_admin(nid) then raise exception 'Network admin access required.' using errcode='42501';end if;
 for r in select * from jsonb_array_elements(coalesce(p_assertions,'[]'::jsonb)) loop
  pred:=r->>'predicate';kind:=r->>'kind';
  if kind not in ('expertise','ownership','dependency','decision') then continue;end if;
  if pred not in ('skill','owns','depends_on','architectural_decision') then continue;end if;
  eids:=coalesce(array(select value::uuid from jsonb_array_elements_text(coalesce(r->'evidenceIds','[]'::jsonb)) x(value) where exists(select 1 from public.network_evidence_records e where e.id=value::uuid and e.network_id=nid)),'{}');
  if cardinality(eids)=0 then continue;end if;
  insert into public.network_candidate_assertions(network_id,subject,predicate,object,evidence_ids,confidence,extraction_method,extractor_version,status,metadata)
  values(nid,coalesce(r->'subject','{}'),pred,coalesce(r->'object','{}'),eids,greatest(0,least(1,coalesce((r->>'confidence')::numeric,0))),coalesce(nullif(r->>'extractionMethod',''),'organization-targeted-extractor'),nullif(r->>'extractorVersion',''),'candidate',coalesce(r->'metadata','{}')||jsonb_build_object('kind',kind));c:=c+1;
 end loop;return c;
end $$;
revoke all on function public.submit_organization_candidate_assertions(jsonb) from public;grant execute on function public.submit_organization_candidate_assertions(jsonb) to authenticated;

create or replace function public.get_organization_knowledge_candidates(p_status text default 'candidate')
returns table(id uuid,network_id uuid,kind text,subject jsonb,predicate text,object jsonb,evidence_ids uuid[],confidence numeric,status text,extraction_method text,extractor_version text,created_at timestamptz,reviewed_at timestamptz,reviewed_by uuid,metadata jsonb)
language sql security definer stable set search_path=public as $$
 select a.id,a.network_id,coalesce(a.metadata->>'kind','decision'),a.subject,a.predicate,a.object,a.evidence_ids,a.confidence,a.status,a.extraction_method,a.extractor_version,a.created_at,a.reviewed_at,a.reviewed_by,a.metadata
 from public.network_candidate_assertions a where a.network_id=public.current_network_id() and public.is_network_admin(a.network_id) and (p_status is null or a.status=p_status) order by a.created_at desc;
$$;
revoke all on function public.get_organization_knowledge_candidates(text) from public;grant execute on function public.get_organization_knowledge_candidates(text) to authenticated;

create or replace function public.review_organization_knowledge_candidate(p_assertion_id uuid,p_action text,p_reason text default '') returns jsonb
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();a public.network_candidate_assertions%rowtype;sid uuid;oid uuid;committed boolean:=false;
begin
 perform public.g91b_assert_organization_network(nid);if not public.is_network_admin(nid) then raise exception 'Network admin access required.' using errcode='42501';end if;
 if p_action not in ('accept','reject') then raise exception 'Invalid review action.' using errcode='22023';end if;
 select * into a from public.network_candidate_assertions where id=p_assertion_id and network_id=nid for update;if a.id is null then raise exception 'Candidate not found.';end if;if a.status not in ('candidate','conflicted') then raise exception 'Candidate already reviewed.';end if;
 if p_action='reject' then update public.network_candidate_assertions set status='rejected',reviewed_by=auth.uid(),reviewed_at=now() where id=a.id;insert into public.network_assertion_decisions(network_id,assertion_id,action,actor_user_id,reason) values(nid,a.id,'reject',auth.uid(),nullif(trim(p_reason),''));return jsonb_build_object('status','rejected','committed',false);end if;
 sid:=nullif(a.subject->>'entityId','')::uuid;oid:=nullif(a.object->>'entityId','')::uuid;
 if sid is not null and not exists(select 1 from public.network_entities e where e.id=sid and e.network_id=nid) then raise exception 'Subject entity is outside active network.' using errcode='42501';end if;
 if oid is not null and not exists(select 1 from public.network_entities e where e.id=oid and e.network_id=nid) then raise exception 'Object entity is outside active network.' using errcode='42501';end if;
 if a.predicate='skill' then
  if sid is null or nullif(trim(coalesce(a.object->>'value',a.object->>'label','')),'') is null then raise exception 'Expertise candidate requires resolved person and skill value.';end if;
  perform public.g7_set_entity_affiliation(sid,nid,'skill',coalesce(a.object->>'value',a.object->>'label'));committed:=true;
 elsif a.predicate in ('owns','depends_on') then
  if sid is null or oid is null then raise exception 'Relationship candidate requires resolved entities.';end if;
  insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata,created_by) values(nid,sid,oid,a.predicate,jsonb_build_object('source','g9.1-b-verified-evidence','assertion_id',a.id,'evidence_ids',a.evidence_ids),auth.uid()) on conflict(network_id,from_entity_id,to_entity_id,relationship_type) do update set metadata=network_entity_relationships.metadata||excluded.metadata;committed:=true;
 elsif a.predicate='architectural_decision' then committed:=false;
 else raise exception 'Unsupported candidate predicate.';end if;
 update public.network_candidate_assertions set status='verified',reviewed_by=auth.uid(),reviewed_at=now() where id=a.id;insert into public.network_assertion_decisions(network_id,assertion_id,action,actor_user_id,reason) values(nid,a.id,'accept',auth.uid(),nullif(trim(p_reason),''));
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'organization_knowledge_candidate_verified',jsonb_build_object('assertion_id',a.id,'predicate',a.predicate,'graph_committed',committed));return jsonb_build_object('status','verified','committed',committed);
end $$;
revoke all on function public.review_organization_knowledge_candidate(uuid,text,text) from public;grant execute on function public.review_organization_knowledge_candidate(uuid,text,text) to authenticated;
