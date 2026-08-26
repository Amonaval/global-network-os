-- S2-E — Guided Family Experience & Living Help System
-- Stores structured, intentionally minimal product feedback. The client never
-- sends memory stories, contact data or arbitrary profile payloads automatically.

create table if not exists public.guide_feedback(
  id uuid primary key default gen_random_uuid(),
  network_id uuid references public.networks(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  member_id uuid references public.family_members(id) on delete set null,
  guide_key text,
  screen text,
  feedback_type text not null check(feedback_type in ('confusing','missing','feature_idea','improvement','bug','family_need','other','helpful_yes','helpful_no','future_interest')),
  message text,
  role text,
  experience_mode text,
  app_version text,
  status text not null default 'new' check(status in ('new','reviewing','planned','already_supported','not_planned','implemented')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists guide_feedback_status_created_idx on public.guide_feedback(status,created_at desc);
create index if not exists guide_feedback_signal_idx on public.guide_feedback(guide_key,feedback_type,created_at desc);
alter table public.guide_feedback enable row level security;
revoke all on public.guide_feedback from anon,authenticated;

create or replace function public.submit_guide_feedback(
 p_guide_key text default null,p_screen text default null,p_feedback_type text default 'other',p_message text default null,
 p_role text default null,p_experience_mode text default null,p_app_version text default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); mid uuid; rid uuid;
begin
 if auth.uid() is null then raise exception 'Sign in to send feedback.' using errcode='42501'; end if;
 if p_feedback_type not in ('confusing','missing','feature_idea','improvement','bug','family_need','other','helpful_yes','helpful_no','future_interest') then raise exception 'Invalid feedback type.' using errcode='22023'; end if;
 if p_message is not null and length(p_message)>2000 then raise exception 'Feedback is too long.' using errcode='22023'; end if;
 select member_id into mid from public.profiles where id=auth.uid();
 insert into public.guide_feedback(network_id,user_id,member_id,guide_key,screen,feedback_type,message,role,experience_mode,app_version)
 values(nid,auth.uid(),mid,nullif(left(trim(coalesce(p_guide_key,'')),120),''),nullif(left(trim(coalesce(p_screen,'')),120),''),p_feedback_type,nullif(trim(p_message),''),nullif(left(trim(coalesce(p_role,'')),40),''),nullif(left(trim(coalesce(p_experience_mode,'')),40),''),nullif(left(trim(coalesce(p_app_version,'')),40),'')) returning id into rid;
 return rid;
end;$$;
revoke all on function public.submit_guide_feedback(text,text,text,text,text,text,text) from public;
grant execute on function public.submit_guide_feedback(text,text,text,text,text,text,text) to authenticated;

create or replace function public.get_platform_guide_feedback(p_status text default null)
returns table(id uuid,network_id uuid,guide_key text,screen text,feedback_type text,message text,role text,experience_mode text,app_version text,status text,created_at timestamptz,updated_at timestamptz)
language sql security definer stable set search_path=public as $$
 select f.id,f.network_id,f.guide_key,f.screen,f.feedback_type,f.message,f.role,f.experience_mode,f.app_version,f.status,f.created_at,f.updated_at
 from public.guide_feedback f
 where public.is_platform_owner() and (p_status is null or f.status=p_status)
 order by case f.status when 'new' then 0 when 'reviewing' then 1 else 2 end,f.created_at desc limit 300;
$$;
revoke all on function public.get_platform_guide_feedback(text) from public;
grant execute on function public.get_platform_guide_feedback(text) to authenticated;

create or replace function public.set_guide_feedback_status(p_feedback_id uuid,p_status text)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_platform_owner() then raise exception 'Platform-owner access required.' using errcode='42501'; end if;
 if p_status not in ('new','reviewing','planned','already_supported','not_planned','implemented') then raise exception 'Invalid feedback status.' using errcode='22023'; end if;
 update public.guide_feedback set status=p_status,updated_at=now() where id=p_feedback_id;
end;$$;
revoke all on function public.set_guide_feedback_status(uuid,text) from public;
grant execute on function public.set_guide_feedback_status(uuid,text) to authenticated;

create or replace function public.get_guide_feedback_signals()
returns table(guide_key text,feedback_type text,family_count bigint,feedback_count bigint)
language sql security definer stable set search_path=public as $$
 select f.guide_key,f.feedback_type,count(distinct f.network_id) filter(where f.network_id is not null),count(*)
 from public.guide_feedback f where public.is_platform_owner()
 group by f.guide_key,f.feedback_type order by count(distinct f.network_id) desc,count(*) desc;
$$;
revoke all on function public.get_guide_feedback_signals() from public;
grant execute on function public.get_guide_feedback_signals() to authenticated;
