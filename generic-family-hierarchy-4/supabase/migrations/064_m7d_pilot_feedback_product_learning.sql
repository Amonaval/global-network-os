-- M7-D — Pilot Feedback & Product Learning Loop
-- Lightweight contextual feedback. Operational analytics remain aggregate-only;
-- optional qualitative notes are user-authored, admin-scoped, and never joined to discovery candidates/search text.

create table if not exists public.pilot_feedback(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 network_id uuid not null references public.networks(id) on delete cascade,
 moment_type varchar(32) not null check(moment_type in('launch','participation','claim','bridge','discovery','introduction','outcome','general')),
 outcome varchar(16) not null check(outcome in('helpful','partial','blocked')),
 friction_code varchar(24) not null default 'none' check(friction_code in('none','next_step','setup','data','permission','discovery','consent','technical','other')),
 note varchar(600),
 created_at timestamptz not null default now()
);
create index if not exists m7d_feedback_network_created_idx on public.pilot_feedback(network_id,created_at desc);
create index if not exists m7d_feedback_user_created_idx on public.pilot_feedback(user_id,created_at desc);
alter table public.pilot_feedback enable row level security;
revoke all on public.pilot_feedback from anon,authenticated;

create or replace function public.submit_pilot_feedback(p_network_id uuid,p_moment_type text,p_outcome text,p_friction_code text default 'none',p_note text default null)
returns uuid language plpgsql security definer set search_path=public as $$
declare rid uuid;clean_note text:=nullif(trim(coalesce(p_note,'')),'');
begin
 if auth.uid() is null or not public.is_network_member(p_network_id) then raise exception 'Active network membership is required.' using errcode='42501';end if;
 if p_moment_type not in('launch','participation','claim','bridge','discovery','introduction','outcome','general') then raise exception 'Unsupported feedback moment.' using errcode='22023';end if;
 if p_outcome not in('helpful','partial','blocked') then raise exception 'Choose whether the experience helped, partly helped, or blocked you.' using errcode='22023';end if;
 if p_friction_code not in('none','next_step','setup','data','permission','discovery','consent','technical','other') then raise exception 'Unsupported friction category.' using errcode='22023';end if;
 if p_outcome<>'helpful' and p_friction_code='none' then raise exception 'Choose the main friction when the experience did not fully help.' using errcode='22023';end if;
 if length(coalesce(clean_note,''))>600 then raise exception 'Keep feedback notes under 600 characters.' using errcode='22023';end if;
 if (select count(*) from public.pilot_feedback f where f.user_id=auth.uid() and f.created_at>=now()-interval '1 day')>=20 then raise exception 'Feedback limit reached for today.' using errcode='42901';end if;
 insert into public.pilot_feedback(user_id,network_id,moment_type,outcome,friction_code,note)
 values(auth.uid(),p_network_id,p_moment_type,p_outcome,case when p_outcome='helpful' then 'none' else p_friction_code end,clean_note)
 returning id into rid;
 return rid;
end $$;
revoke all on function public.submit_pilot_feedback(uuid,text,text,text,text) from public;
grant execute on function public.submit_pilot_feedback(uuid,text,text,text,text) to authenticated;

create or replace function public.get_my_pilot_feedback_context()
returns table(network_id uuid,network_name varchar,vertical_kind varchar,role varchar,suggested_moment varchar,last_signal_at timestamptz)
language sql security definer stable set search_path=public as $$
 with mine as(
  select n.id,n.name,n.vertical_kind,nm.role
  from public.network_memberships nm join public.networks n on n.id=nm.network_id
  where nm.user_id=auth.uid() and nm.status='active' and n.status='active'
 ),last_signal as(
  select distinct on(e.source_network_id) e.source_network_id,e.event_type,e.created_at
  from public.network_effect_events e join mine m on m.id=e.source_network_id
  where e.actor_user_id=auth.uid() and e.created_at>=now()-interval '30 days'
  order by e.source_network_id,e.created_at desc
 )
 select m.id,m.name,m.vertical_kind,m.role,
  case ls.event_type when 'introduction_accepted' then 'outcome' when 'introduction_declined' then 'introduction' when 'introduction_requested' then 'introduction' when 'discovery_opportunity' then 'discovery' when 'discovery_search' then 'discovery' else 'general' end::varchar,
  ls.created_at
 from mine m left join last_signal ls on ls.source_network_id=m.id
 order by ls.created_at desc nulls last,m.name;
$$;
revoke all on function public.get_my_pilot_feedback_context() from public;
grant execute on function public.get_my_pilot_feedback_context() to authenticated;

create or replace function public.get_my_pilot_learning_summary(p_days integer default 30) returns jsonb
language sql security definer stable set search_path=public as $$
 with cfg as(select greatest(7,least(coalesce(p_days,30),90)) d),
 admin_networks as(
  select n.id,n.name from public.network_memberships nm join public.networks n on n.id=nm.network_id
  where nm.user_id=auth.uid() and nm.status='active' and nm.role in('owner','admin') and n.status='active'
 ),f as(
  select pf.*,an.name network_name from public.pilot_feedback pf join admin_networks an on an.id=pf.network_id,cfg
  where pf.created_at>=now()-(cfg.d||' days')::interval
 ),friction as(
  select friction_code,count(*) c from f where friction_code<>'none' group by friction_code order by c desc,friction_code limit 1
 ),per_network as(
  select network_id,network_name,count(*) feedback,count(*) filter(where outcome='helpful') helpful,count(*) filter(where outcome='partial') partial,count(*) filter(where outcome='blocked') blocked
  from f group by network_id,network_name order by blocked desc,feedback desc,network_name
 ),notes as(
  select network_name,moment_type,outcome,friction_code,note,created_at from f where note is not null order by created_at desc limit 5
 )
 select jsonb_build_object(
  'days',(select d from cfg),
  'feedback',(select count(*) from f),
  'helpful',(select count(*) from f where outcome='helpful'),
  'partial',(select count(*) from f where outcome='partial'),
  'blocked',(select count(*) from f where outcome='blocked'),
  'helpfulRate',case when (select count(*) from f)=0 then 0 else round(100.0*(select count(*) from f where outcome='helpful')/(select count(*) from f))::int end,
  'topFriction',(select friction_code from friction),
  'networks',coalesce((select jsonb_agg(jsonb_build_object('networkId',network_id,'networkName',network_name,'feedback',feedback,'helpful',helpful,'partial',partial,'blocked',blocked)) from per_network),'[]'::jsonb),
  'recentNotes',coalesce((select jsonb_agg(jsonb_build_object('networkName',network_name,'moment',moment_type,'outcome',outcome,'friction',friction_code,'note',note,'createdAt',created_at)) from notes),'[]'::jsonb)
 );
$$;
revoke all on function public.get_my_pilot_learning_summary(integer) from public;
grant execute on function public.get_my_pilot_learning_summary(integer) to authenticated;
comment on function public.get_my_pilot_learning_summary(integer) is 'M7-D admin-scoped pilot learning summary. Aggregates feedback and returns recent de-identified user-authored notes; never exposes feedback author, search text, candidate identity or contact data.';
