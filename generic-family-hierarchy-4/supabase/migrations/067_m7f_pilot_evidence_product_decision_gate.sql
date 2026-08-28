-- M7-F — Pilot Evidence Review & Product Decision Gate
-- Turns de-identified pilot feedback into explicit admin product decisions.
-- Decisions are evidence snapshots, not automatic roadmap mutations.

create table if not exists public.pilot_product_decisions(
 id uuid primary key default gen_random_uuid(),
 network_id uuid null references public.networks(id) on delete cascade,
 decided_by uuid not null references auth.users(id) on delete cascade,
 moment_type varchar(32) not null check(moment_type in('launch','participation','claim','bridge','discovery','introduction','outcome','general')),
 disposition varchar(12) not null check(disposition in('invest','fix','hold','stop')),
 evidence_days integer not null check(evidence_days between 7 and 90),
 evidence_snapshot jsonb not null default '{}'::jsonb,
 rationale varchar(800) not null,
 next_action varchar(300),
 created_at timestamptz not null default now()
);
create index if not exists m7f_product_decision_actor_created_idx on public.pilot_product_decisions(decided_by,created_at desc);
alter table public.pilot_product_decisions enable row level security;
revoke all on public.pilot_product_decisions from anon,authenticated;

create or replace function public.get_my_pilot_product_decision_gate(p_days integer default 30) returns jsonb
language sql security definer stable set search_path=public as $$
 with cfg as(select greatest(7,least(coalesce(p_days,30),90)) d,5 minimum_evidence),
 admin_networks as(
  select distinct n.id,n.name from public.network_memberships nm join public.networks n on n.id=nm.network_id
  where nm.user_id=auth.uid() and nm.status='active' and nm.role in('owner','admin') and n.status='active'
 ),f as(
  select pf.* from public.pilot_feedback pf join admin_networks an on an.id=pf.network_id,cfg
  where pf.created_at>=now()-(cfg.d||' days')::interval
 ),moments as(
  select unnest(array['launch','participation','claim','bridge','discovery','introduction','outcome','general'])::text moment_type
 ),agg as(
  select m.moment_type,
   count(f.id)::int feedback,
   count(f.id) filter(where f.outcome='helpful')::int helpful,
   count(f.id) filter(where f.outcome='partial')::int partial,
   count(f.id) filter(where f.outcome='blocked')::int blocked
  from moments m left join f on f.moment_type=m.moment_type group by m.moment_type
 ),friction as(
  select moment_type,friction_code,count(*) c,row_number() over(partition by moment_type order by count(*) desc,friction_code) rn
  from f where friction_code<>'none' group by moment_type,friction_code
 ),scored as(
  select a.*,
   case when a.feedback=0 then 0 else round(100.0*a.helpful/a.feedback)::int end helpful_rate,
   fr.friction_code top_friction,
   case
    when a.feedback<(select minimum_evidence from cfg) then 'hold'
    when a.blocked::numeric/a.feedback>=0.40 then 'fix'
    when a.helpful::numeric/a.feedback>=0.70 then 'invest'
    when (a.partial+a.blocked)::numeric/a.feedback>=0.60 then 'fix'
    else 'hold'
   end recommendation,
   case when a.feedback>=12 then 'high' when a.feedback>=(select minimum_evidence from cfg) then 'medium' else 'low' end confidence,
   case
    when a.feedback=0 then 'No pilot evidence yet.'
    when a.feedback<(select minimum_evidence from cfg) then 'Evidence is still too thin for a durable product decision.'
    when a.blocked::numeric/a.feedback>=0.40 then 'Blocked feedback is high enough to fix friction before expanding capability.'
    when a.helpful::numeric/a.feedback>=0.70 then 'Helpful feedback is strong enough to justify deeper investment.'
    when (a.partial+a.blocked)::numeric/a.feedback>=0.60 then 'Most feedback still contains friction; improve the existing experience first.'
    else 'Evidence is mixed; hold scope until the signal becomes clearer.'
   end reason
  from agg a left join friction fr on fr.moment_type=a.moment_type and fr.rn=1
 ),latest as(
  select d.* from public.pilot_product_decisions d
  where d.decided_by=auth.uid()
  order by d.created_at desc limit 10
 )
 select jsonb_build_object(
  'days',(select d from cfg),
  'totalFeedback',(select count(*) from f),
  'minimumEvidence',(select minimum_evidence from cfg),
  'readyForDecision',(select count(*) from f)>=(select minimum_evidence from cfg),
  'evidence',coalesce((select jsonb_agg(jsonb_build_object(
    'moment',moment_type,'feedback',feedback,'helpful',helpful,'partial',partial,'blocked',blocked,
    'helpfulRate',helpful_rate,'topFriction',top_friction,'recommendation',recommendation,
    'confidence',confidence,'reason',reason
   ) order by feedback desc,moment_type) from scored),'[]'::jsonb),
  'latestDecisions',coalesce((select jsonb_agg(jsonb_build_object(
    'id',id,'moment',moment_type,'disposition',disposition,'evidenceDays',evidence_days,
    'rationale',rationale,'nextAction',next_action,'createdAt',created_at
   )) from latest),'[]'::jsonb)
 );
$$;
revoke all on function public.get_my_pilot_product_decision_gate(integer) from public;
grant execute on function public.get_my_pilot_product_decision_gate(integer) to authenticated;

create or replace function public.record_pilot_product_decision(p_moment_type text,p_disposition text,p_evidence_days integer,p_rationale text,p_next_action text default null) returns uuid
language plpgsql security definer set search_path=public as $$
declare rid uuid; snap jsonb; clean_rationale text:=nullif(trim(coalesce(p_rationale,'')),''); clean_next text:=nullif(trim(coalesce(p_next_action,'')),'');
begin
 if auth.uid() is null then raise exception 'Authentication required.' using errcode='42501';end if;
 if not exists(select 1 from public.network_memberships nm join public.networks n on n.id=nm.network_id where nm.user_id=auth.uid() and nm.status='active' and nm.role in('owner','admin') and n.status='active') then raise exception 'Owner or Admin access is required.' using errcode='42501';end if;
 if p_moment_type not in('launch','participation','claim','bridge','discovery','introduction','outcome','general') then raise exception 'Unsupported decision moment.' using errcode='22023';end if;
 if p_disposition not in('invest','fix','hold','stop') then raise exception 'Unsupported decision.' using errcode='22023';end if;
 if p_evidence_days<7 or p_evidence_days>90 then raise exception 'Evidence window must be between 7 and 90 days.' using errcode='22023';end if;
 if clean_rationale is null or length(clean_rationale)<8 then raise exception 'A short rationale is required.' using errcode='22023';end if;
 if length(clean_rationale)>800 or length(coalesce(clean_next,''))>300 then raise exception 'Decision text is too long.' using errcode='22023';end if;
 select jsonb_build_object(
  'days',p_evidence_days,
  'feedback',count(*),
  'helpful',count(*) filter(where outcome='helpful'),
  'partial',count(*) filter(where outcome='partial'),
  'blocked',count(*) filter(where outcome='blocked'),
  'topFriction',(select pf2.friction_code from public.pilot_feedback pf2 join public.network_memberships nm2 on nm2.network_id=pf2.network_id and nm2.user_id=auth.uid() and nm2.status='active' and nm2.role in('owner','admin') where pf2.moment_type=p_moment_type and pf2.friction_code<>'none' and pf2.created_at>=now()-(p_evidence_days||' days')::interval group by pf2.friction_code order by count(*) desc,pf2.friction_code limit 1)
 ) into snap
 from public.pilot_feedback pf join public.network_memberships nm on nm.network_id=pf.network_id and nm.user_id=auth.uid() and nm.status='active' and nm.role in('owner','admin')
 where pf.moment_type=p_moment_type and pf.created_at>=now()-(p_evidence_days||' days')::interval;
 insert into public.pilot_product_decisions(decided_by,moment_type,disposition,evidence_days,evidence_snapshot,rationale,next_action)
 values(auth.uid(),p_moment_type,p_disposition,p_evidence_days,coalesce(snap,'{}'::jsonb),clean_rationale,clean_next) returning id into rid;
 return rid;
end $$;
revoke all on function public.record_pilot_product_decision(text,text,integer,text,text) from public;
grant execute on function public.record_pilot_product_decision(text,text,integer,text,text) to authenticated;

comment on function public.get_my_pilot_product_decision_gate(integer) is 'M7-F owner/admin decision gate built from de-identified M7-D feedback. Recommendations are advisory and never mutate roadmap or features automatically.';
comment on function public.record_pilot_product_decision(text,text,integer,text,text) is 'M7-F records an explicit human product decision with a bounded evidence snapshot and rationale.';
