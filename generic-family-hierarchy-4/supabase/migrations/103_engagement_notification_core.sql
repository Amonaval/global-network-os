-- E1 — Engagement notification core + deep-link contract.
-- Additive upgrade of the existing notification table. Notifications remain the source of truth;
-- push delivery is layered on later.

alter table public.notifications add column if not exists network_id uuid references public.networks(id) on delete cascade;
alter table public.notifications add column if not exists actor_id uuid references auth.users(id) on delete set null;
alter table public.notifications add column if not exists entity_type varchar(60);
alter table public.notifications add column if not exists entity_id uuid;
alter table public.notifications add column if not exists priority varchar(12) not null default 'normal';
alter table public.notifications add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.notifications add column if not exists archived_at timestamptz;

do $$ begin
  alter table public.notifications add constraint notifications_priority_check check(priority in ('low','normal','high','urgent'));
exception when duplicate_object then null; end $$;

create index if not exists idx_notifications_network_user_created on public.notifications(network_id,user_id,created_at desc);
create index if not exists idx_notifications_user_unread_created on public.notifications(user_id,read_at,created_at desc) where archived_at is null;

-- Network-aware persisted notification creator. The recipient must be an active member of the target network.
create or replace function public.create_network_notification(
  p_network_id uuid,
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text default null,
  p_surface text default null,
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_priority text default 'normal',
  p_metadata jsonb default '{}'::jsonb,
  p_actor_id uuid default auth.uid()
) returns uuid
language plpgsql security definer set search_path=public as $$
declare v_id uuid; v_href text;
begin
  if auth.uid() is null then raise exception 'Sign in required.' using errcode='42501'; end if;
  if p_priority not in ('low','normal','high','urgent') then raise exception 'Invalid notification priority.' using errcode='22023'; end if;
  if not public.is_network_member(p_network_id) and not public.is_platform_owner() then
    raise exception 'Not authorized for this network.' using errcode='42501';
  end if;
  if not exists(select 1 from public.network_memberships nm where nm.network_id=p_network_id and nm.user_id=p_user_id and nm.status='active') then
    raise exception 'Notification recipient is not an active network member.' using errcode='22023';
  end if;
  v_href := case when nullif(trim(coalesce(p_surface,'')),'') is null then null
    else '/?twNetwork='||p_network_id::text||'&twSurface='||replace(trim(p_surface),' ','%20')||
      case when p_entity_id is null then '' else '&twItem='||p_entity_id::text end
    end;
  insert into public.notifications(user_id,network_id,actor_id,type,title,body,href,entity_type,entity_id,priority,metadata)
  values(p_user_id,p_network_id,p_actor_id,left(p_type,50),left(p_title,180),p_body,v_href,nullif(p_entity_type,''),p_entity_id,p_priority,coalesce(p_metadata,'{}'::jsonb))
  returning id into v_id;
  return v_id;
end $$;
revoke all on function public.create_network_notification(uuid,uuid,text,text,text,text,text,uuid,text,jsonb,uuid) from public;
grant execute on function public.create_network_notification(uuid,uuid,text,text,text,text,text,uuid,text,jsonb,uuid) to authenticated;

-- Notify every active member holding any one of the requested roles.
create or replace function public.notify_network_roles(
  p_network_id uuid,
  p_roles text[],
  p_type text,
  p_title text,
  p_body text default null,
  p_surface text default null,
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_priority text default 'normal',
  p_metadata jsonb default '{}'::jsonb
) returns integer
language plpgsql security definer set search_path=public as $$
declare r record; v_count integer:=0;
begin
  if auth.uid() is null then raise exception 'Sign in required.' using errcode='42501'; end if;
  if not public.is_network_member(p_network_id) and not public.is_platform_owner() then raise exception 'Not authorized.' using errcode='42501'; end if;
  for r in select distinct nm.user_id from public.network_memberships nm
           where nm.network_id=p_network_id and nm.status='active' and nm.role=any(coalesce(p_roles,array[]::text[])) loop
    perform public.create_network_notification(p_network_id,r.user_id,p_type,p_title,p_body,p_surface,p_entity_type,p_entity_id,p_priority,p_metadata,auth.uid());
    v_count:=v_count+1;
  end loop;
  return v_count;
end $$;
revoke all on function public.notify_network_roles(uuid,text[],text,text,text,text,text,uuid,text,jsonb) from public;
grant execute on function public.notify_network_roles(uuid,text[],text,text,text,text,text,uuid,text,jsonb) to authenticated;

-- Cross-network inbox for the current user. Membership is checked again while reading.
drop function if exists public.get_my_notifications();
create function public.get_my_notifications(p_limit integer default 80,p_unread_only boolean default false)
returns table(
  id uuid,user_id uuid,network_id uuid,network_name text,type varchar,title varchar,body text,href text,
  entity_type varchar,entity_id uuid,priority varchar,metadata jsonb,read_at timestamptz,created_at timestamptz
)
language sql security definer stable set search_path=public as $$
 select n.id,n.user_id,n.network_id,coalesce(net.name,'TrustWeave')::text,n.type,n.title,n.body,n.href,
        n.entity_type,n.entity_id,n.priority,n.metadata,n.read_at,n.created_at
 from public.notifications n
 left join public.networks net on net.id=n.network_id
 where n.user_id=auth.uid() and n.archived_at is null
   and (n.network_id is null or exists(select 1 from public.network_memberships nm where nm.network_id=n.network_id and nm.user_id=auth.uid() and nm.status='active'))
   and (not p_unread_only or n.read_at is null)
 order by case n.priority when 'urgent' then 0 when 'high' then 1 when 'normal' then 2 else 3 end,n.created_at desc
 limit greatest(1,least(coalesce(p_limit,80),200));
$$;
revoke all on function public.get_my_notifications(integer,boolean) from public;
grant execute on function public.get_my_notifications(integer,boolean) to authenticated;

-- Keep no-arg callers working.
create or replace function public.get_my_notifications()
returns table(
  id uuid,user_id uuid,network_id uuid,network_name text,type varchar,title varchar,body text,href text,
  entity_type varchar,entity_id uuid,priority varchar,metadata jsonb,read_at timestamptz,created_at timestamptz
)
language sql security definer stable set search_path=public as $$
 select * from public.get_my_notifications(80,false);
$$;
revoke all on function public.get_my_notifications() from public;
grant execute on function public.get_my_notifications() to authenticated;

create or replace function public.mark_all_notifications_read(p_network_id uuid default null) returns integer
language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
  update public.notifications n set read_at=coalesce(n.read_at,now())
  where n.user_id=auth.uid() and n.archived_at is null and n.read_at is null
    and (p_network_id is null or n.network_id=p_network_id)
    and (n.network_id is null or exists(select 1 from public.network_memberships nm where nm.network_id=n.network_id and nm.user_id=auth.uid() and nm.status='active'));
  get diagnostics v_count=row_count; return v_count;
end $$;
revoke all on function public.mark_all_notifications_read(uuid) from public;
grant execute on function public.mark_all_notifications_read(uuid) to authenticated;

create or replace function public.get_my_notification_unread_count() returns integer
language sql security definer stable set search_path=public as $$
 select count(*)::integer from public.notifications n
 where n.user_id=auth.uid() and n.read_at is null and n.archived_at is null
   and (n.network_id is null or exists(select 1 from public.network_memberships nm where nm.network_id=n.network_id and nm.user_id=auth.uid() and nm.status='active'));
$$;
revoke all on function public.get_my_notification_unread_count() from public;
grant execute on function public.get_my_notification_unread_count() to authenticated;
