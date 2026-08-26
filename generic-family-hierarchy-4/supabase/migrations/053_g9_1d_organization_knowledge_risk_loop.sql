-- G9.1-D Organizational Knowledge Risk Loop. Additive telemetry + admin read model.
create table if not exists public.organization_intelligence_query_signals(
 id uuid primary key default gen_random_uuid(),network_id uuid not null references public.networks(id) on delete cascade,user_id uuid not null,
 question text not null,intent text not null,confidence text not null check(confidence in ('high','medium','low')),evidence_count integer not null default 0,
 matched_entity_ids uuid[] not null default '{}',created_at timestamptz not null default now()
);
create index if not exists idx_org_intel_query_network_created on public.organization_intelligence_query_signals(network_id,created_at desc);
alter table public.organization_intelligence_query_signals enable row level security;
-- No direct client policies: writes and admin reads use governed RPCs only.

create or replace function public.record_organization_intelligence_query(p_question text,p_intent text,p_confidence text,p_evidence_count integer default 0,p_matched_entity_ids text[] default '{}') returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();ids uuid[];
begin
 perform public.g91b_assert_organization_network(nid);
 if not exists(select 1 from public.network_memberships m where m.network_id=nid and m.user_id=auth.uid() and m.status='active') then raise exception 'Active membership required.' using errcode='42501';end if;
 if trim(coalesce(p_question,''))='' then return;end if;
 ids:=coalesce(array(select x::uuid from unnest(coalesce(p_matched_entity_ids,'{}')) x where x~*'^[0-9a-f-]{36}$' and exists(select 1 from public.network_entities e where e.id=x::uuid and e.network_id=nid)),'{}');
 insert into public.organization_intelligence_query_signals(network_id,user_id,question,intent,confidence,evidence_count,matched_entity_ids)
 values(nid,auth.uid(),left(trim(p_question),500),coalesce(nullif(trim(p_intent),''),'general'),case when p_confidence in ('high','medium','low') then p_confidence else 'low' end,greatest(0,coalesce(p_evidence_count,0)),ids);
end $$;
revoke all on function public.record_organization_intelligence_query(text,text,text,integer,text[]) from public;grant execute on function public.record_organization_intelligence_query(text,text,text,integer,text[]) to authenticated;

create or replace function public.get_organization_knowledge_risk_signals() returns jsonb
language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.current_network_id();result jsonb;
begin
 perform public.g91b_assert_organization_network(nid);if not public.is_network_admin(nid) then raise exception 'Network admin access required.' using errcode='42501';end if;
 select jsonb_build_object(
  'evidenceCount',(select count(*) from public.network_evidence_records e where e.network_id=nid and e.visibility='network'),
  'staleEvidenceCount',(select count(*) from public.network_evidence_records e where e.network_id=nid and e.visibility='network' and coalesce(e.source_updated_at,e.captured_at)<now()-interval '365 days'),
  'verifiedAssertionCount',(select count(*) from public.network_candidate_assertions a where a.network_id=nid and a.status='verified'),
  'conflictedAssertionCount',(select count(*) from public.network_candidate_assertions a where a.network_id=nid and a.status='conflicted'),
  'unansweredQuestions',coalesce((select jsonb_agg(jsonb_build_object('question',x.question,'count',x.cnt,'lastAskedAt',x.last_asked,'intent',x.intent) order by x.cnt desc,x.last_asked desc) from (
    select lower(trim(q.question)) question,count(*) cnt,max(q.created_at) last_asked,(array_agg(q.intent order by q.created_at desc))[1] intent
    from public.organization_intelligence_query_signals q where q.network_id=nid and q.created_at>now()-interval '90 days' and (q.confidence='low' or q.evidence_count=0)
    group by lower(trim(q.question)) having count(*)>=2 order by count(*) desc,max(q.created_at) desc limit 10
  ) x),'[]'::jsonb)
 ) into result;return result;
end $$;
revoke all on function public.get_organization_knowledge_risk_signals() from public;grant execute on function public.get_organization_knowledge_risk_signals() to authenticated;
