-- E3 — network-scoped mentions + responsibility role routing.

create table if not exists public.network_notification_roles(
  network_id uuid not null references public.networks(id) on delete cascade,
  role_key varchar(60) not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  label varchar(100) not null,
  active boolean not null default true,
  set_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key(network_id,role_key,user_id)
);
create index if not exists idx_network_notification_roles_lookup on public.network_notification_roles(network_id,role_key,active);
alter table public.network_notification_roles enable row level security;
revoke all on public.network_notification_roles from anon,authenticated;

create or replace function public.get_network_notification_roles()
returns table(role_key varchar,label varchar,user_id uuid,email text,member_label text,active boolean,updated_at timestamptz)
language sql security definer stable set search_path=public as $$
 select r.role_key,r.label,r.user_id,u.email::text,coalesce(p.full_name,u.raw_user_meta_data->>'full_name',split_part(coalesce(u.email,''),'@',1))::text,r.active,r.updated_at
 from public.network_notification_roles r
 join auth.users u on u.id=r.user_id left join public.profiles p on p.id=r.user_id
 where r.network_id=public.current_network_id() and public.is_network_member(r.network_id)
 order by r.role_key,member_label;
$$;
revoke all on function public.get_network_notification_roles() from public;grant execute on function public.get_network_notification_roles() to authenticated;

create or replace function public.set_network_notification_role(p_role_key text,p_label text,p_user_id uuid,p_active boolean default true) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); v_key text;
begin
 if nid is null or not public.is_network_admin(nid) then raise exception 'Network admin access required.' using errcode='42501';end if;
 if not exists(select 1 from public.network_memberships nm where nm.network_id=nid and nm.user_id=p_user_id and nm.status='active') then raise exception 'Role assignee must be an active network member.' using errcode='22023';end if;
 v_key:=trim(both '-' from regexp_replace(lower(trim(p_role_key)),'[^a-z0-9]+','-','g'));if length(v_key)<2 then raise exception 'Invalid responsibility role.' using errcode='22023';end if;
 insert into public.network_notification_roles(network_id,role_key,user_id,label,active,set_by,updated_at) values(nid,v_key,p_user_id,left(coalesce(nullif(trim(p_label),''),initcap(replace(v_key,'-',' '))),100),p_active,auth.uid(),now())
 on conflict(network_id,role_key,user_id) do update set label=excluded.label,active=excluded.active,set_by=auth.uid(),updated_at=now();
end $$;
revoke all on function public.set_network_notification_role(text,text,uuid,boolean) from public;grant execute on function public.set_network_notification_role(text,text,uuid,boolean) to authenticated;

create or replace function public.remove_network_notification_role(p_role_key text,p_user_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin if nid is null or not public.is_network_admin(nid) then raise exception 'Network admin access required.' using errcode='42501';end if;delete from public.network_notification_roles where network_id=nid and role_key=trim(both '-' from regexp_replace(lower(trim(p_role_key)),'[^a-z0-9]+','-','g')) and user_id=p_user_id;end $$;
revoke all on function public.remove_network_notification_role(text,uuid) from public;grant execute on function public.remove_network_notification_role(text,uuid) to authenticated;

create or replace function public.route_network_mentions(
 p_mentions text[],p_title text,p_body text,p_surface text,p_entity_type text default null,p_entity_id uuid default null,p_priority text default 'normal'
) returns uuid[]
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); token text; key text; target uuid; ids uuid[]:='{}'; nid_out uuid;
begin
 if nid is null or not public.is_network_member(nid) then raise exception 'Active network required.' using errcode='42501';end if;
 foreach token in array coalesce(p_mentions,'{}'::text[]) loop
  key:=trim(both '-' from regexp_replace(lower(trim(leading '@' from token)),'[^a-z0-9]+','-','g'));
  if key='' then continue;end if;
  for target in
    select distinct x.user_id from (
      select nm.user_id from public.network_memberships nm where nm.network_id=nid and nm.status='active' and ((key in ('owner','owners') and nm.role='owner') or (key in ('admin','admins','board') and nm.role in ('owner','admin')))
      union all
      select r.user_id from public.network_notification_roles r where r.network_id=nid and r.active and r.role_key=key
      union all
      select nm.user_id from public.network_memberships nm join auth.users u on u.id=nm.user_id left join public.profiles p on p.id=nm.user_id
       where nm.network_id=nid and nm.status='active' and (trim(both '-' from regexp_replace(lower(split_part(coalesce(u.email,''),'@',1)),'[^a-z0-9]+','-','g'))=key or trim(both '-' from regexp_replace(lower(coalesce(p.full_name,'')),'[^a-z0-9]+','-','g'))=key)
    ) x
  loop
    if target=auth.uid() then continue;end if;
    nid_out:=public.create_network_notification(nid,target,'mention',p_title,p_body,p_surface,p_entity_type,p_entity_id,p_priority,jsonb_build_object('mention',key,'surface',p_surface),auth.uid());ids:=array_append(ids,nid_out);
  end loop;
 end loop;
 return (select coalesce(array_agg(distinct i),'{}'::uuid[]) from unnest(ids) i);
end $$;
revoke all on function public.route_network_mentions(text[],text,text,text,text,uuid,text) from public;grant execute on function public.route_network_mentions(text[],text,text,text,text,uuid,text) to authenticated;
