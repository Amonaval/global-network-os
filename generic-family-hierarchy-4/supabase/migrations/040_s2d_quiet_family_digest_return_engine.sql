-- S2-D — Quiet Family Digest + Return Engine
-- A calm, per-user summary of meaningful family changes. No noisy feed and no
-- contact/private-tree leakage. External delivery can be layered on later.

alter table public.notification_preferences add column if not exists contributions boolean not null default true;
alter table public.notification_preferences add column if not exists introductions boolean not null default true;
alter table public.notification_preferences add column if not exists family_changes boolean not null default true;
alter table public.notification_preferences add column if not exists preferred_weekday smallint not null default 0 check(preferred_weekday between 0 and 6);

create table if not exists public.family_digest_state(
  network_id uuid not null references public.networks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_opened_at timestamptz,
  last_shared_at timestamptz,
  open_count integer not null default 0,
  share_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key(network_id,user_id)
);
alter table public.family_digest_state enable row level security;
revoke all on public.family_digest_state from anon,authenticated;

create or replace function public.get_my_notification_preferences() returns jsonb
language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.current_network_id(); result jsonb;
begin
 if auth.uid() is null or nid is null then raise exception 'Active family is required.' using errcode='42501'; end if;
 select jsonb_build_object(
   'digest',digest,'special_days',special_days,'memories',memories,'gatherings',gatherings,
   'contributions',contributions,'introductions',introductions,'family_changes',family_changes,
   'preferred_weekday',preferred_weekday
 ) into result
 from public.notification_preferences where network_id=nid and user_id=auth.uid();
 return coalesce(result,jsonb_build_object(
   'digest','weekly','special_days',true,'memories',false,'gatherings',true,
   'contributions',true,'introductions',true,'family_changes',true,'preferred_weekday',0
 ));
end;$$;
revoke all on function public.get_my_notification_preferences() from public;
grant execute on function public.get_my_notification_preferences() to authenticated;

create or replace function public.save_my_digest_preferences(
 p_digest text,p_special_days boolean,p_memories boolean,p_gatherings boolean,
 p_contributions boolean,p_introductions boolean,p_family_changes boolean,p_preferred_weekday smallint
) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
 if auth.uid() is null or nid is null then raise exception 'Active family is required.' using errcode='42501'; end if;
 if p_digest not in ('off','weekly','monthly') then raise exception 'Invalid digest preference.' using errcode='22023'; end if;
 if p_preferred_weekday<0 or p_preferred_weekday>6 then raise exception 'Invalid digest day.' using errcode='22023'; end if;
 insert into public.notification_preferences(network_id,user_id,digest,special_days,memories,gatherings,contributions,introductions,family_changes,preferred_weekday)
 values(nid,auth.uid(),p_digest,p_special_days,p_memories,p_gatherings,p_contributions,p_introductions,p_family_changes,p_preferred_weekday)
 on conflict(network_id,user_id) do update set
  digest=excluded.digest,special_days=excluded.special_days,memories=excluded.memories,gatherings=excluded.gatherings,
  contributions=excluded.contributions,introductions=excluded.introductions,family_changes=excluded.family_changes,
  preferred_weekday=excluded.preferred_weekday,updated_at=now();
end;$$;
revoke all on function public.save_my_digest_preferences(text,boolean,boolean,boolean,boolean,boolean,boolean,smallint) from public;
grant execute on function public.save_my_digest_preferences(text,boolean,boolean,boolean,boolean,boolean,boolean,smallint) to authenticated;

create or replace function public.get_my_family_digest(p_days integer default 7)
returns jsonb language plpgsql security definer stable set search_path=public as $$
declare
 nid uuid:=public.current_network_id(); uid uuid:=auth.uid(); days integer:=greatest(1,least(coalesce(p_days,7),31));
 prefs public.notification_preferences; last_open timestamptz; result jsonb;
begin
 if uid is null or nid is null or not public.is_network_member(nid) then raise exception 'Active family membership is required.' using errcode='42501'; end if;
 select * into prefs from public.notification_preferences where network_id=nid and user_id=uid;
 select last_opened_at into last_open from public.family_digest_state where network_id=nid and user_id=uid;

 select jsonb_build_object(
   'generated_at',now(),
   'network_name',(select name from public.networks where id=nid),
   'days',days,
   'last_opened_at',last_open,
   'new_since_last_open',(
     select count(*) from public.family_engagement_events e
     where e.network_id=nid and e.user_id is distinct from uid and e.created_at>coalesce(last_open,now()-(days||' days')::interval)
   ),
   'recent_memories',case when coalesce(prefs.memories,false) then coalesce((
     select jsonb_agg(x order by x.created_at desc) from (
       select m.id,m.title,left(coalesce(m.story,''),180) body,m.created_at,
              coalesce(fm.full_name,'Family memory') member_name
       from public.memories m left join public.family_members fm on fm.id=m.member_id and fm.network_id=nid
       where m.network_id=nid and m.created_at>=now()-(days||' days')::interval
         and (m.visibility<>'admin' or public.is_network_admin(nid))
       order by m.created_at desc limit 3
     ) x
   ),'[]'::jsonb) else '[]'::jsonb end,
   'new_members',case when coalesce(prefs.family_changes,true) then coalesce((
     select jsonb_agg(x order by x.created_at desc) from (
       select fm.id,fm.full_name,fm.city,fm.profession,fm.created_at
       from public.family_members fm where fm.network_id=nid and fm.profile_status='approved'
         and fm.created_at>=now()-(days||' days')::interval
       order by fm.created_at desc limit 4
     ) x
   ),'[]'::jsonb) else '[]'::jsonb end,
   'gatherings',case when coalesce(prefs.gatherings,true) then coalesce((
     select jsonb_agg(x order by x.event_at) from (
       select ce.id,ce.title,ce.event_at,ce.location,ce.status
       from public.community_events ce where ce.network_id=nid and ce.status in ('planning','open')
         and ce.event_at between now() and now()+interval '30 days'
       order by ce.event_at limit 3
     ) x
   ),'[]'::jsonb) else '[]'::jsonb end,
   'open_contributions',case when coalesce(prefs.contributions,true) then (
     select count(*) from public.contribution_suggestions cs where cs.network_id=nid and cs.status='open'
       and (public.is_network_admin(nid) or cs.member_id=(select member_id from public.profiles where id=uid))
   ) else 0 end,
   'contribution_hint',case when coalesce(prefs.contributions,true) then (
     select cs.title from public.contribution_suggestions cs where cs.network_id=nid and cs.status='open'
       and (public.is_network_admin(nid) or cs.member_id=(select member_id from public.profiles where id=uid))
     order by cs.priority desc,cs.created_at desc limit 1
   ) else null end,
   'introductions',case when coalesce(prefs.introductions,true) and to_regclass('public.community_introduction_requests') is not null then coalesce((
     select jsonb_agg(x order by x.updated_at desc) from (
       select ir.id,ir.status,ir.updated_at,ir.created_at,
              case when ir.target_user_id=uid then 'incoming' else 'outgoing' end direction,
              coalesce(cpc.display_name,'Community introduction') person_name
       from public.community_introduction_requests ir
       left join public.community_profile_cards cpc on cpc.id=ir.target_card_id
       where (ir.requester_user_id=uid or ir.target_user_id=uid)
         and ir.updated_at>=now()-(days||' days')::interval
       order by ir.updated_at desc limit 4
     ) x
   ),'[]'::jsonb) else '[]'::jsonb end
 ) into result;
 return result;
end;$$;
revoke all on function public.get_my_family_digest(integer) from public;
grant execute on function public.get_my_family_digest(integer) to authenticated;

create or replace function public.mark_family_digest_opened()
returns void language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); previous timestamptz;
begin
 if auth.uid() is null or nid is null then return; end if;
 select last_opened_at into previous from public.family_digest_state where network_id=nid and user_id=auth.uid();
 insert into public.family_digest_state(network_id,user_id,last_opened_at,open_count,updated_at)
 values(nid,auth.uid(),now(),1,now())
 on conflict(network_id,user_id) do update set last_opened_at=now(),open_count=family_digest_state.open_count+1,updated_at=now();
 insert into public.family_engagement_events(network_id,user_id,event_type,entity_type,channel)
 values(nid,auth.uid(),case when previous is not null and previous<now()-interval '3 days' then 'digest_return' else 'digest_open' end,'digest','in_app');
end;$$;
revoke all on function public.mark_family_digest_opened() from public;
grant execute on function public.mark_family_digest_opened() to authenticated;

create or replace function public.mark_family_digest_shared(p_channel text default 'copy')
returns void language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
 if auth.uid() is null or nid is null then return; end if;
 insert into public.family_digest_state(network_id,user_id,last_shared_at,share_count,updated_at)
 values(nid,auth.uid(),now(),1,now())
 on conflict(network_id,user_id) do update set last_shared_at=now(),share_count=family_digest_state.share_count+1,updated_at=now();
 insert into public.family_engagement_events(network_id,user_id,event_type,entity_type,channel)
 values(nid,auth.uid(),'digest_share','digest',nullif(left(coalesce(p_channel,'copy'),32),''));
end;$$;
revoke all on function public.mark_family_digest_shared(text) from public;
grant execute on function public.mark_family_digest_shared(text) to authenticated;

-- Extend S2-A metrics without changing its call contract.
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
   'digest_opens',count(*) filter(where event_type in ('digest_open','digest_return')),
   'digest_returns',count(*) filter(where event_type='digest_return'),
   'digest_shares',count(*) filter(where event_type='digest_share'),
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
