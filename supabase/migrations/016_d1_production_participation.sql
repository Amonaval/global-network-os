-- D1 Production Participation Release
-- Run after 001 -> 015. Additive and safe for existing instances.
-- CORE: invitations, deterministic contributions, privacy-safe sharing metrics.
-- FAMILY MODULE: connected groups and lightweight reunion/event validation.

create extension if not exists pgcrypto;

/* -------------------------------------------------------------------------- */
/* 1. Invitation lifecycle and delivery                                        */
/* -------------------------------------------------------------------------- */
alter table public.member_invitations
  add column if not exists revoked_at timestamptz,
  add column if not exists revoked_by uuid references auth.users(id) on delete set null,
  add column if not exists first_opened_at timestamptz,
  add column if not exists last_sent_at timestamptz,
  add column if not exists delivery_channel varchar(20) not null default 'link'
    check (delivery_channel in ('link','email','whatsapp','sms','print','other')),
  add column if not exists recipient_hint varchar(160),
  add column if not exists resend_of uuid references public.member_invitations(id) on delete set null;

create index if not exists idx_member_invitations_status
  on public.member_invitations(revoked_at,used_at,expires_at,created_at desc);

create or replace function public.invitation_status(
  p_used_at timestamptz, p_revoked_at timestamptz, p_expires_at timestamptz
) returns text language sql stable set search_path=public as $$
  select case when p_used_at is not null then 'accepted'
              when p_revoked_at is not null then 'revoked'
              when p_expires_at <= now() then 'expired'
              else 'active' end;
$$;

create or replace function public.create_bulk_member_invitations(
  p_items jsonb,
  p_expires_days integer default 7
) returns table(invitation_id uuid,member_id uuid,token text)
language plpgsql security definer set search_path=public,extensions as $$
declare item jsonb; raw_token text; target uuid; created uuid; channel text; hint text;
begin
  if not public.is_admin() then raise exception 'Administrator access is required.' using errcode='42501'; end if;
  if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 or jsonb_array_length(p_items)>200 then
    raise exception 'Provide between 1 and 200 invitation items.' using errcode='22023';
  end if;
  for item in select value from jsonb_array_elements(p_items) loop
    begin
      target := (item->>'member_id')::uuid;
    exception when others then raise exception 'Every invitation needs a valid member ID.' using errcode='22023'; end;
    raw_token := item->>'token';
    channel := coalesce(nullif(item->>'channel',''),'link');
    hint := nullif(left(trim(item->>'recipient_hint'),160),'');
    if length(coalesce(raw_token,''))<32 then raise exception 'Every invitation needs a strong token.' using errcode='22023'; end if;
    if channel not in ('link','email','whatsapp','sms','print','other') then raise exception 'Invalid delivery channel.' using errcode='22023'; end if;
    if not exists(select 1 from public.family_members fm where fm.id=target and fm.profile_status='approved') then
      raise exception 'Approved member not found.' using errcode='P0002';
    end if;
    if exists(select 1 from public.profiles p where p.member_id=target) then
      raise exception 'A selected member profile is already claimed.' using errcode='23505';
    end if;
    update public.member_invitations set revoked_at=now(),revoked_by=auth.uid()
      where member_id=target and used_at is null and revoked_at is null and expires_at>now();
    insert into public.member_invitations(member_id,token_hash,created_by,expires_at,last_sent_at,delivery_channel,recipient_hint)
    values(target,encode(digest(raw_token,'sha256'),'hex'),auth.uid(),now()+make_interval(days=>greatest(1,least(coalesce(p_expires_days,7),30))),now(),channel,hint)
    returning id into created;
    insert into public.audit_log(actor_id,action,details) values
      (auth.uid(),'member_invitation_created',jsonb_build_object('invitation_id',created,'member_id',target,'channel',channel));
    invitation_id:=created; member_id:=target; token:=raw_token; return next;
  end loop;
end;
$$;
revoke all on function public.create_bulk_member_invitations(jsonb,integer) from public;
grant execute on function public.create_bulk_member_invitations(jsonb,integer) to authenticated;

create or replace function public.get_member_invitations()
returns table(id uuid,member_id uuid,member_name text,status text,expires_at timestamptz,
  created_at timestamptz,first_opened_at timestamptz,last_sent_at timestamptz,
  delivery_channel text,recipient_hint text,resend_of uuid)
language plpgsql security definer stable set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'Administrator access is required.' using errcode='42501'; end if;
  return query select i.id,i.member_id,fm.full_name::text,
    public.invitation_status(i.used_at,i.revoked_at,i.expires_at),i.expires_at,i.created_at,
    i.first_opened_at,i.last_sent_at,i.delivery_channel::text,i.recipient_hint::text,i.resend_of
  from public.member_invitations i join public.family_members fm on fm.id=i.member_id
  order by i.created_at desc limit 1000;
end;
$$;
revoke all on function public.get_member_invitations() from public;
grant execute on function public.get_member_invitations() to authenticated;

create or replace function public.revoke_member_invitation(p_invitation_id uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'Administrator access is required.' using errcode='42501'; end if;
  update public.member_invitations set revoked_at=now(),revoked_by=auth.uid()
    where id=p_invitation_id and used_at is null and revoked_at is null;
  if not found then raise exception 'Active invitation not found.' using errcode='P0002'; end if;
  insert into public.audit_log(actor_id,action,details) values(auth.uid(),'member_invitation_revoked',jsonb_build_object('invitation_id',p_invitation_id));
end;
$$;
revoke all on function public.revoke_member_invitation(uuid) from public;
grant execute on function public.revoke_member_invitation(uuid) to authenticated;

create or replace function public.resend_member_invitation(p_invitation_id uuid,p_token text,p_expires_days integer default 7)
returns uuid language plpgsql security definer set search_path=public,extensions as $$
declare old_invite public.member_invitations; new_id uuid;
begin
  if not public.is_admin() then raise exception 'Administrator access is required.' using errcode='42501'; end if;
  if length(coalesce(p_token,''))<32 then raise exception 'A strong token is required.' using errcode='22023'; end if;
  select * into old_invite from public.member_invitations where id=p_invitation_id for update;
  if old_invite.id is null or old_invite.used_at is not null then raise exception 'Invitation cannot be resent.' using errcode='22023'; end if;
  if exists(select 1 from public.profiles where member_id=old_invite.member_id) then raise exception 'This profile is already claimed.' using errcode='23505'; end if;
  update public.member_invitations set revoked_at=coalesce(revoked_at,now()),revoked_by=coalesce(revoked_by,auth.uid()) where id=old_invite.id;
  insert into public.member_invitations(member_id,token_hash,created_by,expires_at,last_sent_at,delivery_channel,recipient_hint,resend_of)
  values(old_invite.member_id,encode(digest(p_token,'sha256'),'hex'),auth.uid(),now()+make_interval(days=>greatest(1,least(coalesce(p_expires_days,7),30))),now(),old_invite.delivery_channel,old_invite.recipient_hint,old_invite.id)
  returning id into new_id;
  insert into public.audit_log(actor_id,action,details) values(auth.uid(),'member_invitation_resent',jsonb_build_object('invitation_id',new_id,'resend_of',old_invite.id,'member_id',old_invite.member_id));
  return new_id;
end;
$$;
revoke all on function public.resend_member_invitation(uuid,text,integer) from public;
grant execute on function public.resend_member_invitation(uuid,text,integer) to authenticated;

create or replace function public.get_invitation_preview(p_token text)
returns table(member_name text,status text,expires_at timestamptz)
language plpgsql security definer set search_path=public,extensions as $$
declare target_id uuid;
begin
  select i.id into target_id from public.member_invitations i
    where i.token_hash=encode(digest(p_token,'sha256'),'hex') limit 1;
  if target_id is null then return; end if;
  update public.member_invitations set first_opened_at=coalesce(first_opened_at,now()) where id=target_id;
  return query select fm.full_name::text,public.invitation_status(i.used_at,i.revoked_at,i.expires_at),i.expires_at
    from public.member_invitations i join public.family_members fm on fm.id=i.member_id where i.id=target_id;
end;
$$;
revoke all on function public.get_invitation_preview(text) from public;
grant execute on function public.get_invitation_preview(text) to anon,authenticated;

-- Replace acceptance so revoked links cannot be claimed.
create or replace function public.accept_member_invitation(p_token text) returns uuid
language plpgsql security definer set search_path=public,extensions as $$
declare invite public.member_invitations; uid uuid; owner_user uuid; current_member uuid;
begin
  uid:=auth.uid(); if uid is null then raise exception 'Sign in is required to accept this invitation.' using errcode='42501'; end if;
  select * into invite from public.member_invitations
   where token_hash=encode(digest(p_token,'sha256'),'hex') and used_at is null
     and revoked_at is null and expires_at>now() for update;
  if invite.id is null then raise exception 'This invitation is invalid, expired, revoked or already used.' using errcode='22023'; end if;
  select member_id into current_member from public.profiles where id=uid for update;
  if current_member is not null and current_member<>invite.member_id then raise exception 'This account is already linked to a different member.' using errcode='23505'; end if;
  if exists(select 1 from public.profiles where member_id=invite.member_id and id<>uid) then raise exception 'This member profile is already claimed.' using errcode='23505'; end if;
  update public.profiles set member_id=invite.member_id,updated_at=now() where id=uid;
  if not found then raise exception 'User profile was not initialized.' using errcode='P0002'; end if;
  update public.member_invitations set used_at=now(),accepted_by=uid where id=invite.id;
  insert into public.audit_log(actor_id,action,details) values(uid,'member_invitation_accepted',jsonb_build_object('invitation_id',invite.id,'member_id',invite.member_id));
  owner_user:=invite.created_by;
  if owner_user is not null and owner_user<>uid then insert into public.notifications(user_id,type,title,body)
    values(owner_user,'invitation_accepted','Invitation accepted','A member joined and claimed their profile.'); end if;
  return invite.member_id;
end;
$$;
revoke all on function public.accept_member_invitation(text) from public;
grant execute on function public.accept_member_invitation(text) to authenticated;

/* -------------------------------------------------------------------------- */
/* 2. Deterministic contribution engine                                        */
/* -------------------------------------------------------------------------- */
create table if not exists public.contribution_suggestions(
  id uuid primary key default gen_random_uuid(), signature text not null unique,
  member_id uuid references public.family_members(id) on delete cascade,
  kind varchar(40) not null check(kind in ('missing_field','orphan','possible_duplicate','incomplete_relationship')),
  title varchar(180) not null,detail text,action_payload jsonb not null default '{}'::jsonb,
  priority integer not null default 50 check(priority between 1 and 100),
  status varchar(20) not null default 'open' check(status in ('open','accepted','dismissed','resolved')),
  acted_by uuid references auth.users(id) on delete set null,acted_at timestamptz,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index if not exists idx_contribution_suggestions_status on public.contribution_suggestions(status,priority desc,created_at);
alter table public.contribution_suggestions enable row level security;
revoke all on public.contribution_suggestions from anon,authenticated;

create or replace function public.refresh_contribution_suggestions() returns integer
language plpgsql security definer set search_path=public as $$
declare affected integer:=0;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  -- Any previously-open rule result that no longer reproduces becomes resolved.
  update public.contribution_suggestions set status='resolved',updated_at=now()
    where status='open' and kind in ('missing_field','orphan','possible_duplicate','incomplete_relationship');
  insert into public.contribution_suggestions(signature,member_id,kind,title,detail,action_payload,priority,status,updated_at)
  select 'missing:'||fm.id::text,fm.id,'missing_field','Complete '||fm.full_name||'''s profile',
    'Add '||array_to_string(array_remove(array[
      case when fm.date_of_birth is null then 'date of birth' end,
      case when nullif(trim(fm.city),'') is null then 'city' end,
      case when nullif(trim(fm.profession),'') is null then 'profession' end,
      case when nullif(trim(fm.bio),'') is null then 'a short introduction' end
    ],null),', '),jsonb_build_object('member_id',fm.id,'action','edit_profile'),70,'open',now()
  from public.family_members fm where fm.profile_status='approved' and
    (fm.date_of_birth is null or nullif(trim(fm.city),'') is null or nullif(trim(fm.profession),'') is null or nullif(trim(fm.bio),'') is null)
    and (public.is_admin() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.member_id=fm.id))
  on conflict(signature) do update set title=excluded.title,detail=excluded.detail,action_payload=excluded.action_payload,
    priority=excluded.priority,status=case when contribution_suggestions.status in ('dismissed','accepted') then contribution_suggestions.status else 'open' end,updated_at=now();
  get diagnostics affected=row_count;
  if public.is_admin() then
    insert into public.contribution_suggestions(signature,member_id,kind,title,detail,action_payload,priority,status,updated_at)
    select 'orphan:'||fm.id::text,fm.id,'orphan','Connect '||fm.full_name,
      'This profile has no recorded relationship. Add a parent, child or spouse.',jsonb_build_object('member_id',fm.id,'action','manage_relationship'),90,'open',now()
    from public.family_members fm where fm.profile_status='approved' and not exists(
      select 1 from public.family_relationships r where r.person_id=fm.id or r.related_person_id=fm.id)
    on conflict(signature) do update set status=case when contribution_suggestions.status in ('dismissed','accepted') then contribution_suggestions.status else 'open' end,updated_at=now();

    insert into public.contribution_suggestions(signature,member_id,kind,title,detail,action_payload,priority,status,updated_at)
    select 'duplicate:'||least(a.id,b.id)::text||':'||greatest(a.id,b.id)::text,a.id,'possible_duplicate','Review possible duplicate',
      a.full_name||' appears more than once' || case when a.date_of_birth=b.date_of_birth and a.date_of_birth is not null then ' with the same birth date.' else '.' end,
      jsonb_build_object('member_id',a.id,'other_member_id',b.id,'action','review_duplicate'),85,'open',now()
    from public.family_members a join public.family_members b on a.id<b.id and lower(trim(a.full_name))=lower(trim(b.full_name))
    where a.profile_status='approved' and b.profile_status='approved'
    on conflict(signature) do update set detail=excluded.detail,status=case when contribution_suggestions.status in ('dismissed','accepted') then contribution_suggestions.status else 'open' end,updated_at=now();

    insert into public.contribution_suggestions(signature,member_id,kind,title,detail,action_payload,priority,status,updated_at)
    select 'relationship:'||r.id::text,r.person_id,'incomplete_relationship','Review one-way relationship',
      'Confirm that this parent/child relationship is represented consistently.',jsonb_build_object('relationship_id',r.id,'member_id',r.person_id,'action','manage_relationship'),75,'open',now()
    from public.family_relationships r where r.relationship_type in ('parent','child') and not exists(
      select 1 from public.family_relationships back where back.person_id=r.related_person_id and back.related_person_id=r.person_id
        and back.relationship_type=case when r.relationship_type='parent' then 'child' else 'parent' end)
    on conflict(signature) do update set status=case when contribution_suggestions.status in ('dismissed','accepted') then contribution_suggestions.status else 'open' end,updated_at=now();
  end if;
  return affected;
end;
$$;
revoke all on function public.refresh_contribution_suggestions() from public;
grant execute on function public.refresh_contribution_suggestions() to authenticated;

create or replace function public.get_contribution_suggestions(p_status text default 'open')
returns setof public.contribution_suggestions language sql security definer stable set search_path=public as $$
  select s.* from public.contribution_suggestions s
  where auth.uid() is not null and (p_status is null or s.status=p_status)
    and (public.is_admin() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.member_id=s.member_id))
  order by s.priority desc,s.created_at;
$$;
revoke all on function public.get_contribution_suggestions(text) from public;
grant execute on function public.get_contribution_suggestions(text) to authenticated;

create or replace function public.act_on_contribution_suggestion(p_suggestion_id uuid,p_action text) returns void
language plpgsql security definer set search_path=public as $$
declare target_member uuid;
begin
  if p_action not in ('accepted','dismissed','resolved') then raise exception 'Invalid suggestion action.' using errcode='22023'; end if;
  select member_id into target_member from public.contribution_suggestions where id=p_suggestion_id;
  if target_member is null then raise exception 'Suggestion not found.' using errcode='P0002'; end if;
  if not public.is_admin() and not exists(select 1 from public.profiles where id=auth.uid() and member_id=target_member) then
    raise exception 'You cannot act on this suggestion.' using errcode='42501';
  end if;
  update public.contribution_suggestions set status=p_action,acted_by=auth.uid(),acted_at=now(),updated_at=now() where id=p_suggestion_id;
  insert into public.audit_log(actor_id,action,details) values(auth.uid(),'contribution_suggestion_'||p_action,jsonb_build_object('suggestion_id',p_suggestion_id,'member_id',target_member));
end;
$$;
revoke all on function public.act_on_contribution_suggestion(uuid,text) from public;
grant execute on function public.act_on_contribution_suggestion(uuid,text) to authenticated;

/* -------------------------------------------------------------------------- */
/* 3. Public deep links and anonymous share metrics                            */
/* -------------------------------------------------------------------------- */
create table if not exists public.participation_events(
  id bigint generated always as identity primary key,event_type varchar(40) not null,
  public_member_id uuid references public.family_members(id) on delete set null,
  channel varchar(30),session_hash text,created_at timestamptz not null default now()
);
create index if not exists idx_participation_events_type_created on public.participation_events(event_type,created_at desc);
alter table public.participation_events enable row level security;
revoke all on public.participation_events from anon,authenticated;

create or replace function public.track_public_participation(p_event_type text,p_public_member_id uuid default null,p_channel text default null,p_session_token text default null)
returns void language plpgsql security definer set search_path=public,extensions as $$
declare visitor text;
begin
  if p_event_type not in ('public_view','profile_view','share','qr_view','embed_view') then raise exception 'Invalid event type.' using errcode='22023'; end if;
  if p_public_member_id is not null and not exists(select 1 from public.family_members where id=p_public_member_id and profile_status='approved' and profile_visibility='public') then
    raise exception 'Public profile not found.' using errcode='P0002';
  end if;
  visitor:=case when length(coalesce(p_session_token,''))>=16 then encode(digest(p_session_token,'sha256'),'hex') else null end;
  if visitor is null or not exists(select 1 from public.participation_events where event_type=p_event_type and session_hash=visitor
      and public_member_id is not distinct from p_public_member_id and created_at>now()-interval '5 minutes') then
    insert into public.participation_events(event_type,public_member_id,channel,session_hash)
    values(p_event_type,p_public_member_id,left(p_channel,30),visitor);
  end if;
end;
$$;
revoke all on function public.track_public_participation(text,uuid,text,text) from public;
grant execute on function public.track_public_participation(text,uuid,text,text) to anon,authenticated;

create or replace function public.get_public_family_member(p_member_id uuid)
returns table(id uuid,full_name text,generation_level integer,profession text,city text,country text,bio text,date_of_death date)
language sql security definer stable set search_path=public as $$
  select fm.id,fm.full_name::text,fm.generation_level,fm.profession::text,fm.city::text,fm.country::text,fm.bio,fm.date_of_death
  from public.family_members fm where fm.id=p_member_id and fm.profile_status='approved' and fm.profile_visibility='public';
$$;
revoke all on function public.get_public_family_member(uuid) from public;
grant execute on function public.get_public_family_member(uuid) to anon,authenticated;

/* -------------------------------------------------------------------------- */
/* 4. Connected groups and reunion/event validation                           */
/* -------------------------------------------------------------------------- */
create table if not exists public.community_groups(
  id uuid primary key default gen_random_uuid(),name varchar(160) not null,description text,
  group_type varchar(20) not null default 'branch' check(group_type in ('branch','household','circle','other')),
  created_by uuid references auth.users(id) on delete set null,created_at timestamptz not null default now()
);
create table if not exists public.community_group_members(
  group_id uuid references public.community_groups(id) on delete cascade,
  member_id uuid references public.family_members(id) on delete cascade,
  primary key(group_id,member_id)
);
create table if not exists public.community_events(
  id uuid primary key default gen_random_uuid(),group_id uuid references public.community_groups(id) on delete set null,
  title varchar(180) not null,description text,event_at timestamptz,location varchar(180),
  status varchar(20) not null default 'planning' check(status in ('planning','open','closed','cancelled')),
  created_by uuid references auth.users(id) on delete set null,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table if not exists public.community_event_responses(
  event_id uuid references public.community_events(id) on delete cascade,user_id uuid references auth.users(id) on delete cascade,
  response varchar(20) not null check(response in ('going','interested','not_going')),
  guest_count integer not null default 0 check(guest_count between 0 and 20),updated_at timestamptz not null default now(),primary key(event_id,user_id)
);
alter table public.community_groups enable row level security;
alter table public.community_group_members enable row level security;
alter table public.community_events enable row level security;
alter table public.community_event_responses enable row level security;
create policy "members read community groups" on public.community_groups for select to authenticated using(true);
create policy "admins manage community groups" on public.community_groups for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "members read community group members" on public.community_group_members for select to authenticated using(true);
create policy "admins manage community group members" on public.community_group_members for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "members read community events" on public.community_events for select to authenticated using(true);
create policy "admins manage community events" on public.community_events for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "members read own event response" on public.community_event_responses for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy "members create own event response" on public.community_event_responses for insert to authenticated with check(user_id=auth.uid());
create policy "members update own event response" on public.community_event_responses for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "members delete own event response" on public.community_event_responses for delete to authenticated using(user_id=auth.uid());

create or replace function public.get_community_events()
returns table(id uuid,group_id uuid,group_name text,title text,description text,event_at timestamptz,location text,status text,
  going bigint,interested bigint,my_response text,guest_count bigint)
language sql security definer stable set search_path=public as $$
  select e.id,e.group_id,g.name::text,e.title::text,e.description,e.event_at,e.location::text,e.status::text,
    count(*) filter(where r.response='going'),count(*) filter(where r.response='interested'),
    max(r.response) filter(where r.user_id=auth.uid())::text,
    coalesce(sum(case when r.response='going' then r.guest_count else 0 end),0)
  from public.community_events e left join public.community_groups g on g.id=e.group_id
  left join public.community_event_responses r on r.event_id=e.id
  where auth.uid() is not null group by e.id,g.name order by e.event_at nulls last,e.created_at desc;
$$;
revoke all on function public.get_community_events() from public;
grant execute on function public.get_community_events() to authenticated;

create or replace function public.respond_to_community_event(p_event_id uuid,p_response text,p_guest_count integer default 0) returns void
language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  if p_response not in ('going','interested','not_going') then raise exception 'Invalid response.' using errcode='22023'; end if;
  if not exists(select 1 from public.community_events where id=p_event_id and status='open') then raise exception 'This event is not accepting responses.' using errcode='22023'; end if;
  insert into public.community_event_responses(event_id,user_id,response,guest_count)
  values(p_event_id,auth.uid(),p_response,greatest(0,least(coalesce(p_guest_count,0),20)))
  on conflict(event_id,user_id) do update set response=excluded.response,guest_count=excluded.guest_count,updated_at=now();
  insert into public.audit_log(actor_id,action,details) values(auth.uid(),'community_event_response',jsonb_build_object('event_id',p_event_id,'response',p_response));
end;
$$;
revoke all on function public.respond_to_community_event(uuid,text,integer) from public;
grant execute on function public.respond_to_community_event(uuid,text,integer) to authenticated;

create or replace function public.get_participation_metrics() returns jsonb
language plpgsql security definer stable set search_path=public as $$
declare result jsonb;
begin
  if not public.is_admin() then raise exception 'Administrator access is required.' using errcode='42501'; end if;
  select jsonb_build_object(
    'invitations_created',(select count(*) from public.member_invitations),
    'invitations_opened',(select count(*) from public.member_invitations where first_opened_at is not null),
    'invitations_accepted',(select count(*) from public.member_invitations where used_at is not null),
    'claimed_profiles',(select count(*) from public.profiles where member_id is not null),
    'claimable_profiles',(select count(*) from public.family_members where profile_status='approved'),
    'contributions',(select count(*) from public.audit_log where action in ('own_profile_safe_fields_updated','profile_submission_approved','contribution_suggestion_resolved')),
    'activated_members',(select count(distinct actor_id) from public.audit_log where actor_id is not null and action in ('member_invitation_accepted','own_profile_safe_fields_updated','memory_created','community_event_response')),
    'public_views',(select count(*) from public.participation_events where event_type in ('public_view','profile_view','qr_view','embed_view')),
    'shares',(select count(*) from public.participation_events where event_type='share'),
    'returning_members',(select count(*) from (select actor_id from public.audit_log where actor_id is not null group by actor_id having count(distinct created_at::date)>1) x),
    'open_suggestions',(select count(*) from public.contribution_suggestions where status='open'),
    'resolved_suggestions',(select count(*) from public.contribution_suggestions where status='resolved'),
    'event_responses',(select count(*) from public.community_event_responses),
    'admin_actions',(select count(*) from public.audit_log a join public.profiles p on p.id=a.actor_id where p.role='admin')
  ) into result;
  return result;
end;
$$;
revoke all on function public.get_participation_metrics() from public;
grant execute on function public.get_participation_metrics() to authenticated;
