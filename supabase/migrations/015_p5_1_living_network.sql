-- P5.1 Living Network
-- CORE: privacy-aware network event stream and controlled self-edit.
-- FAMILY MODULE + CONFIG: recurring family milestones.
-- Run after 001 -> 014.

alter table public.network_settings
  add column if not exists self_edit_mode varchar(30) not null default 'review'
    check (self_edit_mode in ('review','safe_fields_direct')),
  add column if not exists family_milestones_enabled boolean not null default true;

/* Privacy-aware, network-wide event stream. */
create or replace function public.get_network_timeline(
  p_limit integer default 300,
  p_offset integer default 0
)
returns table(
  id uuid, member_id uuid, event_type varchar, title varchar, event_date date,
  location varchar, description text, visibility varchar, created_by uuid,
  created_at timestamptz, updated_at timestamptz
)
language sql security definer stable set search_path=public as $$
  select e.id,e.member_id,e.event_type,e.title,e.event_date,e.location,e.description,
         e.visibility,e.created_by,e.created_at,e.updated_at
  from public.member_life_events e
  join public.family_members fm on fm.id=e.member_id
  where public.is_admin()
     or (
       fm.profile_status='approved'
       and fm.profile_visibility <> 'admin'
       and e.visibility <> 'admin'
     )
  order by e.event_date desc nulls last,e.created_at desc
  limit greatest(1,least(coalesce(p_limit,300),500))
  offset greatest(coalesce(p_offset,0),0);
$$;
revoke all on function public.get_network_timeline(integer,integer) from public;
grant execute on function public.get_network_timeline(integer,integer) to authenticated;

/*
 * Field-aware self-edit. Only low-risk descriptive/contact fields can be
 * direct-saved. Identity, lifecycle, visibility, status and relationships are
 * deliberately absent from this RPC and therefore remain governed.
 */
create or replace function public.update_own_profile_safe_fields(
  p_profession varchar default null,
  p_city varchar default null,
  p_country varchar default null,
  p_bio text default null,
  p_phone varchar default null,
  p_email varchar default null,
  p_photo_url text default null
)
returns public.family_members
language plpgsql security definer set search_path=public as $$
declare
  target_member uuid;
  result public.family_members;
  mode varchar;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode='42501';
  end if;

  select p.member_id into target_member
  from public.profiles p where p.id=auth.uid();
  if target_member is null then
    raise exception 'Your account is not linked to a member profile.' using errcode='42501';
  end if;

  select coalesce(ns.self_edit_mode,'review') into mode
  from public.network_settings ns where ns.id='network';
  if coalesce(mode,'review') <> 'safe_fields_direct' then
    raise exception 'This network requires administrator review for profile changes.' using errcode='42501';
  end if;

  if p_email is not null and p_email <> '' and position('@' in p_email)=0 then
    raise exception 'Enter a valid email address.' using errcode='22023';
  end if;
  if p_photo_url is not null and p_photo_url <> ''
     and p_photo_url not like 'profiles/' || auth.uid()::text || '/%'
     and not exists(select 1 from public.family_members fm where fm.id=target_member and fm.photo_url=p_photo_url) then
    raise exception 'You can only use your current photo or one uploaded by your account.' using errcode='42501';
  end if;

  update public.family_members
  set profession=nullif(trim(p_profession),''), city=nullif(trim(p_city),''),
      country=coalesce(nullif(trim(p_country),''),'India'), bio=nullif(p_bio,''),
      phone=nullif(trim(p_phone),''), email=nullif(trim(p_email),''),
      photo_url=coalesce(nullif(p_photo_url,''),photo_url), updated_at=now()
  where id=target_member
  returning * into result;

  if result.id is null then raise exception 'Linked member profile was not found.' using errcode='P0002'; end if;
  insert into public.audit_log(actor_id,action,details)
  values(auth.uid(),'own_profile_safe_fields_updated',
         jsonb_build_object('member_id',target_member,'fields',jsonb_build_array('profession','city','country','bio','phone','email','photo_url')));
  return result;
end;
$$;
revoke all on function public.update_own_profile_safe_fields(varchar,varchar,varchar,text,varchar,varchar,text) from public;
grant execute on function public.update_own_profile_safe_fields(varchar,varchar,varchar,text,varchar,varchar,text) to authenticated;

