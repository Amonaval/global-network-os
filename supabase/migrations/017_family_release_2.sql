-- Family Release 2 — Remember, Connect and Celebrate
-- Run after 001 -> 016. Additive: richer memories + restrained notification preferences.
create table if not exists public.memory_people (
  memory_id uuid not null references public.memories(id) on delete cascade,
  member_id uuid not null references public.family_members(id) on delete cascade,
  primary key(memory_id,member_id)
);
create index if not exists idx_memory_people_member on public.memory_people(member_id,memory_id);
alter table public.memory_people enable row level security;
revoke all on public.memory_people from anon,authenticated;

create or replace function public.set_memory_people(p_memory_id uuid,p_member_ids uuid[]) returns void
language plpgsql security definer set search_path=public as $$
declare owner_id uuid; mid uuid;
begin
 if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
 select created_by into owner_id from public.memories where id=p_memory_id;
 if owner_id is null then raise exception 'Memory not found.' using errcode='P0002'; end if;
 if not public.is_admin() and owner_id<>auth.uid() then raise exception 'You can only tag people in your own memory.' using errcode='42501'; end if;
 if coalesce(array_length(p_member_ids,1),0)>30 then raise exception 'A memory can include up to 30 relatives.' using errcode='22023'; end if;
 delete from public.memory_people where memory_id=p_memory_id;
 foreach mid in array coalesce(p_member_ids,array[]::uuid[]) loop
   if exists(select 1 from public.family_members where id=mid and profile_status='approved') then
     insert into public.memory_people(memory_id,member_id) values(p_memory_id,mid) on conflict do nothing;
   end if;
 end loop;
end; $$;
revoke all on function public.set_memory_people(uuid,uuid[]) from public;
grant execute on function public.set_memory_people(uuid,uuid[]) to authenticated;

-- Extend memory reads with all tagged relatives without exposing private profile fields.
drop function if exists public.get_memories(uuid);
create function public.get_memories(p_member_id uuid default null)
returns table(id uuid,member_id uuid,title varchar,story text,photo_url text,visibility varchar,created_by uuid,created_at timestamptz,related_member_ids uuid[])
language sql security definer stable set search_path=public as $$
 select m.id,m.member_id,m.title,m.story,m.photo_url,m.visibility,m.created_by,m.created_at,
   coalesce((select array_agg(mp.member_id order by mp.member_id) from public.memory_people mp where mp.memory_id=m.id),array[]::uuid[])
 from public.memories m
 where (p_member_id is null or m.member_id=p_member_id or exists(select 1 from public.memory_people mp where mp.memory_id=m.id and mp.member_id=p_member_id))
 and (public.is_admin() or m.visibility <> 'admin')
 order by m.created_at desc;
$$;
revoke all on function public.get_memories(uuid) from public;
grant execute on function public.get_memories(uuid) to authenticated;

create table if not exists public.notification_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 birthdays boolean not null default true,
 anniversaries boolean not null default true,
 invitations boolean not null default true,
 memories boolean not null default false,
 gatherings boolean not null default true,
 contributions boolean not null default false,
 updated_at timestamptz not null default now()
);
alter table public.notification_preferences enable row level security;
revoke all on public.notification_preferences from anon,authenticated;
create or replace function public.get_notification_preferences() returns public.notification_preferences
language plpgsql security definer stable set search_path=public as $$ declare r public.notification_preferences; begin
 if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
 select * into r from public.notification_preferences where user_id=auth.uid();
 if r.user_id is null then r.user_id:=auth.uid(); r.birthdays:=true;r.anniversaries:=true;r.invitations:=true;r.memories:=false;r.gatherings:=true;r.contributions:=false;r.updated_at:=now(); end if;
 return r;
end $$;
revoke all on function public.get_notification_preferences() from public; grant execute on function public.get_notification_preferences() to authenticated;
create or replace function public.save_notification_preferences(p_birthdays boolean,p_anniversaries boolean,p_invitations boolean,p_memories boolean,p_gatherings boolean,p_contributions boolean) returns void
language plpgsql security definer set search_path=public as $$ begin
 if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
 insert into public.notification_preferences(user_id,birthdays,anniversaries,invitations,memories,gatherings,contributions,updated_at)
 values(auth.uid(),p_birthdays,p_anniversaries,p_invitations,p_memories,p_gatherings,p_contributions,now())
 on conflict(user_id) do update set birthdays=excluded.birthdays,anniversaries=excluded.anniversaries,invitations=excluded.invitations,memories=excluded.memories,gatherings=excluded.gatherings,contributions=excluded.contributions,updated_at=now();
end $$;
revoke all on function public.save_notification_preferences(boolean,boolean,boolean,boolean,boolean,boolean) from public; grant execute on function public.save_notification_preferences(boolean,boolean,boolean,boolean,boolean,boolean) to authenticated;
