-- G9.1-C Graph-Aware RAG. Additive read boundary only.
create or replace function public.get_organization_graph_aware_evidence(p_query text,p_limit integer default 12)
returns table(id uuid,title text,excerpt text,uri text,section text,source_updated_at timestamptz,predicate text,subject jsonb,object jsonb,confidence numeric,created_at timestamptz)
language sql security definer stable set search_path=public as $$
 with ctx as (select public.current_network_id() nid),
 q as (select lower(trim(coalesce(p_query,''))) value),
 docs as (
  select e.id,coalesce(e.title,'Knowledge evidence') title,coalesce(e.excerpt,'') excerpt,e.uri,e.section,e.source_updated_at,null::text predicate,null::jsonb subject,null::jsonb object,null::numeric confidence,e.captured_at created_at,
   case when q.value='' then 0 else ts_rank_cd(to_tsvector('simple',coalesce(e.title,'')||' '||coalesce(e.excerpt,'')),plainto_tsquery('simple',q.value)) end rank
  from public.network_evidence_records e,ctx,q
  where e.network_id=ctx.nid and e.visibility='network' and exists(select 1 from public.network_memberships m where m.network_id=ctx.nid and m.user_id=auth.uid() and m.status='active')
 ), assertions as (
  select a.id,coalesce(a.metadata->>'title',a.predicate) title,coalesce(a.metadata->>'summary',concat_ws(' ',a.subject->>'label',a.predicate,a.object->>'label',a.object->>'value')) excerpt,null::text uri,null::text section,a.reviewed_at source_updated_at,a.predicate,a.subject,a.object,a.confidence,a.created_at,
   case when q.value='' then 0 else ts_rank_cd(to_tsvector('simple',coalesce(a.subject::text,'')||' '||a.predicate||' '||coalesce(a.object::text,'')||' '||coalesce(a.metadata::text,'')),plainto_tsquery('simple',q.value)) end rank
  from public.network_candidate_assertions a,ctx,q
  where a.network_id=ctx.nid and a.status='verified' and exists(select 1 from public.network_memberships m where m.network_id=ctx.nid and m.user_id=auth.uid() and m.status='active') and exists(select 1 from unnest(a.evidence_ids) evid join public.network_evidence_records er on er.id=evid and er.network_id=ctx.nid where er.visibility='network')
 )
 select x.id,x.title,x.excerpt,x.uri,x.section,x.source_updated_at,x.predicate,x.subject,x.object,x.confidence,x.created_at from (select * from assertions union all select * from docs) x
 where (select value from q)='' or x.rank>0 order by x.rank desc,x.created_at desc limit greatest(1,least(coalesce(p_limit,12),50));
$$;
revoke all on function public.get_organization_graph_aware_evidence(text,integer) from public;
grant execute on function public.get_organization_graph_aware_evidence(text,integer) to authenticated;
