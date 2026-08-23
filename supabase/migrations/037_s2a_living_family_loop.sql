-- S2-A — Living Family Loop
-- Adds lightweight memory reactions and privacy-safe engagement instrumentation.

create table if not exists public.memory_reactions(
  network_id uuid not null references public.networks(id) on delete cascade,
  memory_id uuid not null references public.memories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction varchar(16) not null check(reaction in ('heart','smile','pray','celebrate')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(memory_id,user_id)
);
alter table public.memory_reactions enable row level security;
revoke all on public.memory_reactions from anon,authenticated;
create index if not exists memory_reactions_network_idx on public.memory_reactions(network_id,memory_id);

create table if not exists public.family_engagement_events(
  id bigserial primary key,
  network_id uuid not null references public.networks(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  event_type varchar(48) not null,
  entity_type varchar(32),
  entity_id uuid,
  channel varchar(32),
  created_at timestamptz not null default now()
);
alter table public.family_engagement_events enable row level security;
revoke all on public.family_engagement_events from anon,authenticated;
create index if not exists family_engagement_network_created_idx on public.family_engagement_events(network_id,created_at desc);

create or replace function public.set_memory_reaction(p_memory_id uuid,p_reaction text)
returns void language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
  if auth.uid() is null or nid is null then raise exception 'Active family is required.' using errcode='42501'; end if;
  if p_reaction not in ('heart','smile','pray','celebrate') then raise exception 'Invalid reaction.' using errcode='22023'; end if;
  if not exists(select 1 from public.memories where id=p_memory_id and network_id=nid) then raise exception 'Memory not found.' using errcode='22023'; end if;
  insert into public.memory_reactions(network_id,memory_id,user_id,reaction)
  values(nid,p_memory_id,auth.uid(),p_reaction)
  on conflict(memory_id,user_id) do update set reaction=excluded.reaction,updated_at=now();
  insert into public.family_engagement_events(network_id,user_id,event_type,entity_type,entity_id)
  values(nid,auth.uid(),'memory_reaction','memory',p_memory_id);
end $$;
revoke all on function public.set_memory_reaction(uuid,text) from public;
grant execute on function public.set_memory_reaction(uuid,text) to authenticated;

create or replace function public.clear_memory_reaction(p_memory_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
  if auth.uid() is null or nid is null then raise exception 'Active family is required.' using errcode='42501'; end if;
  delete from public.memory_reactions where network_id=nid and memory_id=p_memory_id and user_id=auth.uid();
end $$;
revoke all on function public.clear_memory_reaction(uuid) from public;
grant execute on function public.clear_memory_reaction(uuid) to authenticated;

create or replace function public.get_memory_reactions(p_memory_ids uuid[])
returns table(memory_id uuid,heart bigint,smile bigint,pray bigint,celebrate bigint,my_reaction text)
language sql security definer stable set search_path=public as $$
  select m.id,
    count(*) filter(where r.reaction='heart')::bigint,
    count(*) filter(where r.reaction='smile')::bigint,
    count(*) filter(where r.reaction='pray')::bigint,
    count(*) filter(where r.reaction='celebrate')::bigint,
    max(r.reaction) filter(where r.user_id=auth.uid())::text
  from public.memories m
  left join public.memory_reactions r on r.memory_id=m.id and r.network_id=m.network_id
  where auth.uid() is not null and m.network_id=public.current_network_id()
    and m.id=any(coalesce(p_memory_ids,array[]::uuid[]))
  group by m.id;
$$;
revoke all on function public.get_memory_reactions(uuid[]) from public;
grant execute on function public.get_memory_reactions(uuid[]) to authenticated;

create or replace function public.track_family_engagement(p_event_type text,p_entity_type text default null,p_entity_id uuid default null,p_channel text default null)
returns void language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
  if auth.uid() is null or nid is null then return; end if;
  if length(coalesce(p_event_type,''))<2 or length(p_event_type)>48 then raise exception 'Invalid event type.' using errcode='22023'; end if;
  insert into public.family_engagement_events(network_id,user_id,event_type,entity_type,entity_id,channel)
  values(nid,auth.uid(),p_event_type,nullif(left(coalesce(p_entity_type,''),32),''),p_entity_id,nullif(left(coalesce(p_channel,''),32),''));
end $$;
revoke all on function public.track_family_engagement(text,text,uuid,text) from public;
grant execute on function public.track_family_engagement(text,text,uuid,text) to authenticated;

create or replace function public.get_living_loop_metrics(p_days integer default 30)
returns jsonb language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.current_network_id(); result jsonb;
begin
  if not public.is_network_admin(nid) then raise exception 'Family administrator access is required.' using errcode='42501'; end if;
  select jsonb_build_object(
    'shares',count(*) filter(where event_type like '%share%'),
    'memory_reactions',count(*) filter(where event_type='memory_reaction'),
    'contributions',count(*) filter(where event_type like 'contribution%'),
    'pulse_actions',count(*) filter(where event_type like 'pulse_%'),
    'active_people',count(distinct user_id),
    'returning_people',count(distinct user_id) filter(where user_id in (
      select user_id from public.family_engagement_events where network_id=nid and created_at>=now()-(greatest(1,least(coalesce(p_days,30),365))||' days')::interval group by user_id having count(distinct created_at::date)>1
    ))
  ) into result
  from public.family_engagement_events
  where network_id=nid and created_at>=now()-(greatest(1,least(coalesce(p_days,30),365))||' days')::interval;
  return coalesce(result,'{}'::jsonb);
end $$;
revoke all on function public.get_living_loop_metrics(integer) from public;
grant execute on function public.get_living_loop_metrics(integer) to authenticated;
