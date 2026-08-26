-- A6 — Release 2 completion: Remember, Connect, Celebrate
-- Additive, tenant-scoped foundations for quiet digests and gathering follow-up.

create table if not exists public.notification_preferences(
  network_id uuid not null references public.networks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  digest varchar(12) not null default 'weekly' check(digest in ('off','weekly','monthly')),
  special_days boolean not null default true,
  memories boolean not null default false,
  gatherings boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key(network_id,user_id)
);
alter table public.notification_preferences enable row level security;
drop policy if exists "users manage own notification preferences" on public.notification_preferences;
create policy "users manage own notification preferences" on public.notification_preferences for all to authenticated
using(user_id=auth.uid() and network_id=public.current_network_id())
with check(user_id=auth.uid() and network_id=public.current_network_id());

create or replace function public.get_my_notification_preferences() returns jsonb
language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.current_network_id(); result jsonb;
begin
 if auth.uid() is null or nid is null then raise exception 'Active family is required.' using errcode='42501'; end if;
 select jsonb_build_object('digest',digest,'special_days',special_days,'memories',memories,'gatherings',gatherings) into result
 from public.notification_preferences where network_id=nid and user_id=auth.uid();
 return coalesce(result,jsonb_build_object('digest','weekly','special_days',true,'memories',false,'gatherings',true));
end;$$;
revoke all on function public.get_my_notification_preferences() from public;
grant execute on function public.get_my_notification_preferences() to authenticated;

create or replace function public.save_my_notification_preferences(p_digest text,p_special_days boolean,p_memories boolean,p_gatherings boolean) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
 if auth.uid() is null or nid is null then raise exception 'Active family is required.' using errcode='42501'; end if;
 if p_digest not in ('off','weekly','monthly') then raise exception 'Invalid digest preference.' using errcode='22023'; end if;
 insert into public.notification_preferences(network_id,user_id,digest,special_days,memories,gatherings)
 values(nid,auth.uid(),p_digest,p_special_days,p_memories,p_gatherings)
 on conflict(network_id,user_id) do update set digest=excluded.digest,special_days=excluded.special_days,memories=excluded.memories,gatherings=excluded.gatherings,updated_at=now();
end;$$;
revoke all on function public.save_my_notification_preferences(text,boolean,boolean,boolean) from public;
grant execute on function public.save_my_notification_preferences(text,boolean,boolean,boolean) to authenticated;

alter table public.memories add column if not exists event_id uuid references public.community_events(id) on delete set null;
create index if not exists memories_network_event_idx on public.memories(network_id,event_id,created_at desc);

create or replace function public.link_memory_to_event(p_memory_id uuid,p_event_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
 if auth.uid() is null or nid is null then raise exception 'Active family is required.' using errcode='42501'; end if;
 if not exists(select 1 from public.community_events where id=p_event_id and network_id=nid) then raise exception 'Gathering not found.' using errcode='22023'; end if;
 update public.memories set event_id=p_event_id where id=p_memory_id and network_id=nid and (created_by=auth.uid() or public.is_network_admin(nid));
 if not found then raise exception 'Memory not found or not editable.' using errcode='42501'; end if;
end;$$;
revoke all on function public.link_memory_to_event(uuid,uuid) from public;
grant execute on function public.link_memory_to_event(uuid,uuid) to authenticated;

create or replace function public.get_community_event_attendees(p_event_id uuid)
returns table(member_id uuid,full_name text,response text,guest_count integer)
language sql security definer stable set search_path=public as $$
 select p.member_id,coalesce(fm.full_name,'Family member')::text,r.response::text,r.guest_count
 from public.community_event_responses r
 join public.community_events e on e.id=r.event_id and e.network_id=public.current_network_id()
 left join public.profiles p on p.id=r.user_id
 left join public.family_members fm on fm.id=p.member_id and fm.network_id=e.network_id
 where r.event_id=p_event_id and auth.uid() is not null
 order by case r.response when 'going' then 0 when 'interested' then 1 else 2 end,coalesce(fm.full_name,'');
$$;
revoke all on function public.get_community_event_attendees(uuid) from public;
grant execute on function public.get_community_event_attendees(uuid) to authenticated;

-- Canonical memory-to-people links (Release 2 source referenced these before the table shipped).
create table if not exists public.memory_people(
  network_id uuid not null references public.networks(id) on delete cascade,
  memory_id uuid not null references public.memories(id) on delete cascade,
  member_id uuid not null references public.family_members(id) on delete cascade,
  primary key(memory_id,member_id)
);
alter table public.memory_people enable row level security;
drop policy if exists "members read family memory people" on public.memory_people;
create policy "members read family memory people" on public.memory_people for select to authenticated using(network_id=public.current_network_id());

create or replace function public.set_memory_people(p_memory_id uuid,p_member_ids uuid[]) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
 if auth.uid() is null or nid is null then raise exception 'Active family is required.' using errcode='42501'; end if;
 if not exists(select 1 from public.memories where id=p_memory_id and network_id=nid and (created_by=auth.uid() or public.is_network_admin(nid))) then raise exception 'Memory not found or not editable.' using errcode='42501'; end if;
 delete from public.memory_people where memory_id=p_memory_id and network_id=nid;
 insert into public.memory_people(network_id,memory_id,member_id)
 select nid,p_memory_id,x from unnest(coalesce(p_member_ids,array[]::uuid[])) x
 where exists(select 1 from public.family_members fm where fm.id=x and fm.network_id=nid)
 on conflict do nothing;
end;$$;
revoke all on function public.set_memory_people(uuid,uuid[]) from public;
grant execute on function public.set_memory_people(uuid,uuid[]) to authenticated;

create or replace function public.get_memory_people(p_memory_ids uuid[])
returns table(memory_id uuid,member_id uuid)
language sql security definer stable set search_path=public as $$
 select mp.memory_id,mp.member_id from public.memory_people mp
 where mp.network_id=public.current_network_id() and mp.memory_id=any(coalesce(p_memory_ids,array[]::uuid[])) and auth.uid() is not null;
$$;
revoke all on function public.get_memory_people(uuid[]) from public;
grant execute on function public.get_memory_people(uuid[]) to authenticated;
