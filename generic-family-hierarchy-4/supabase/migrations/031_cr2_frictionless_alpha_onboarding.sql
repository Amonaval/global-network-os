-- CR2 — Frictionless Family Entry & Alpha Exploration
-- Keeps Supabase/auth intact while removing alpha onboarding dead ends.

create table if not exists public.platform_onboarding_settings (
  id text primary key default 'default',
  family_creation_approval_required boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
insert into public.platform_onboarding_settings(id,family_creation_approval_required)
values('default',false) on conflict(id) do update set family_creation_approval_required=false,updated_at=now();
alter table public.platform_onboarding_settings enable row level security;
revoke all on public.platform_onboarding_settings from anon,authenticated;

create or replace function public.get_family_creation_policy()
returns boolean language sql security definer stable set search_path=public as $$
  select coalesce((select family_creation_approval_required from public.platform_onboarding_settings where id='default'),false);
$$;
revoke all on function public.get_family_creation_policy() from public;
grant execute on function public.get_family_creation_policy() to authenticated;

create or replace function public.set_family_creation_policy(p_approval_required boolean)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_platform_owner() then raise exception 'Platform-owner access required.' using errcode='42501'; end if;
  insert into public.platform_onboarding_settings(id,family_creation_approval_required,updated_at,updated_by)
  values('default',coalesce(p_approval_required,true),now(),auth.uid())
  on conflict(id) do update set family_creation_approval_required=excluded.family_creation_approval_required,updated_at=now(),updated_by=auth.uid();
end;$$;
revoke all on function public.set_family_creation_policy(boolean) from public;
grant execute on function public.set_family_creation_policy(boolean) to authenticated;

-- Direct creation is permitted for platform owners OR while Alpha auto-approval is enabled.
create or replace function public.create_family(p_name text,p_slug text default null,p_description text default '')
returns uuid language plpgsql security definer set search_path=public as $$
declare
  uid uuid:=auth.uid(); nid uuid; base_slug text; final_slug text; suffix integer:=1; approval_required boolean:=false;
begin
  if uid is null then raise exception 'Sign in is required to create a family.' using errcode='42501'; end if;
  select coalesce(family_creation_approval_required,false) into approval_required from public.platform_onboarding_settings where id='default';
  if not public.is_platform_owner() and approval_required then
    raise exception 'Family creation requires platform-owner approval.' using errcode='42501';
  end if;
  if length(trim(coalesce(p_name,'')))<2 then raise exception 'Please give your family a name.' using errcode='22023'; end if;
  base_slug:=public.slugify_family_name(coalesce(nullif(trim(p_slug),''),p_name));
  if length(base_slug)<2 then base_slug:='family'; end if;
  base_slug:=left(base_slug,60); final_slug:=base_slug;
  while exists(select 1 from public.networks where slug=final_slug) loop suffix:=suffix+1; final_slug:=left(base_slug,54)||'-'||suffix::text; end loop;
  insert into public.networks(name,slug,created_by,photo_upload_enabled)
  values(left(trim(p_name),180),final_slug,uid,false) returning id into nid;
  insert into public.network_memberships(network_id,user_id,role,status) values(nid,uid,'owner','active');
  insert into public.network_settings(id,network_id,name,description,entity_label,entity_label_plural,level_label,level_label_plural,parent_label,child_label,peer_label,network_template,photo_upload_enabled)
  values('network',nid,left(trim(p_name),180),coalesce(p_description,''),'Member','Members','Generation','Generations','Parent','Child','Spouse','family',false);
  update public.profiles set active_network_id=nid,member_id=null,updated_at=now() where id=uid;
  return nid;
end;$$;
revoke all on function public.create_family(text,text,text) from public;
grant execute on function public.create_family(text,text,text) to authenticated;

-- A short, regeneratable family code gives Alpha users an easy read-only/member entry path.
create table if not exists public.family_join_codes (
  network_id uuid primary key references public.networks(id) on delete cascade,
  code varchar(12) not null unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.family_join_codes enable row level security;
revoke all on public.family_join_codes from anon,authenticated;

create or replace function public.generate_family_join_code() returns text
language plpgsql volatile set search_path=public as $$
declare c text;
begin
 loop
  c:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
  exit when not exists(select 1 from public.family_join_codes where code=c);
 end loop;
 return c;
end;$$;

create or replace function public.get_or_create_family_join_code()
returns text language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); c text;
begin
 if nid is null or not public.is_network_admin(nid) then raise exception 'Family administrator access required.' using errcode='42501'; end if;
 select code into c from public.family_join_codes where network_id=nid;
 if c is null then c:=public.generate_family_join_code(); insert into public.family_join_codes(network_id,code,created_by) values(nid,c,auth.uid()); end if;
 return c;
end;$$;
revoke all on function public.get_or_create_family_join_code() from public;
grant execute on function public.get_or_create_family_join_code() to authenticated;

create or replace function public.regenerate_family_join_code()
returns text language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); c text;
begin
 if nid is null or not public.is_network_admin(nid) then raise exception 'Family administrator access required.' using errcode='42501'; end if;
 c:=public.generate_family_join_code();
 insert into public.family_join_codes(network_id,code,created_by,updated_at) values(nid,c,auth.uid(),now())
 on conflict(network_id) do update set code=excluded.code,created_by=auth.uid(),updated_at=now();
 return c;
end;$$;
revoke all on function public.regenerate_family_join_code() from public;
grant execute on function public.regenerate_family_join_code() to authenticated;

create or replace function public.join_family_by_code(p_code text)
returns uuid language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); nid uuid;
begin
 if uid is null then raise exception 'Sign in is required.' using errcode='42501'; end if;
 select network_id into nid from public.family_join_codes where upper(code)=upper(trim(coalesce(p_code,'')));
 if nid is null then raise exception 'That family code was not found. Check the code and try again.' using errcode='P0002'; end if;
 insert into public.network_memberships(network_id,user_id,role,status) values(nid,uid,'member','active')
 on conflict(network_id,user_id) do update set status='active';
 update public.profiles set active_network_id=nid,member_id=(select member_id from public.network_memberships where network_id=nid and user_id=uid),updated_at=now() where id=uid;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,uid,'family_joined_by_code','{}'::jsonb);
 return nid;
end;$$;
revoke all on function public.join_family_by_code(text) from public;
grant execute on function public.join_family_by_code(text) to authenticated;

-- If an approved unclaimed family profile uses the signed-in user's verified email, surface it as a safe one-tap claim.
create or replace function public.get_my_claimable_profiles()
returns table(network_id uuid,family_name text,member_id uuid,member_name text)
language sql security definer stable set search_path=public as $$
  select fm.network_id,n.name::text,fm.id,fm.full_name::text
  from public.family_members fm
  join public.networks n on n.id=fm.network_id and n.status='active'
  join auth.users u on u.id=auth.uid()
  where u.email_confirmed_at is not null
    and lower(trim(coalesce(fm.email,'')))=lower(trim(coalesce(u.email,'')))
    and fm.profile_status='approved'
    and not exists(select 1 from public.network_memberships x where x.network_id=fm.network_id and x.member_id=fm.id and x.status='active')
  order by n.name,fm.full_name;
$$;
revoke all on function public.get_my_claimable_profiles() from public;
grant execute on function public.get_my_claimable_profiles() to authenticated;

create or replace function public.claim_profile_by_verified_email(p_member_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); nid uuid; mail text;
begin
 select email into mail from auth.users where id=uid and email_confirmed_at is not null;
 if mail is null then raise exception 'Confirm your email before claiming a profile.' using errcode='42501'; end if;
 select network_id into nid from public.family_members where id=p_member_id and profile_status='approved' and lower(trim(coalesce(email,'')))=lower(trim(mail));
 if nid is null then raise exception 'No matching unclaimed profile was found for your verified email.' using errcode='P0002'; end if;
 if exists(select 1 from public.network_memberships where network_id=nid and member_id=p_member_id and user_id<>uid and status='active') then raise exception 'This family profile is already claimed.' using errcode='23505'; end if;
 insert into public.network_memberships(network_id,user_id,role,status,member_id) values(nid,uid,'member','active',p_member_id)
 on conflict(network_id,user_id) do update set status='active',member_id=excluded.member_id;
 update public.profiles set active_network_id=nid,member_id=p_member_id,updated_at=now() where id=uid;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,uid,'profile_claimed_by_verified_email',jsonb_build_object('member_id',p_member_id));
 return nid;
end;$$;
revoke all on function public.claim_profile_by_verified_email(uuid) from public;
grant execute on function public.claim_profile_by_verified_email(uuid) to authenticated;
