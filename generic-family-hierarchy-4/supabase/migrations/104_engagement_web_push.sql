-- E2 — PWA/Web Push subscription foundation.
-- Persist subscriptions privately. In-app notifications remain the source of truth.

create table if not exists public.push_subscriptions(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth_key text not null,
  user_agent text,
  active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,endpoint)
);
create index if not exists idx_push_subscriptions_user_active on public.push_subscriptions(user_id,active,last_seen_at desc);
alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon,authenticated;

alter table public.notification_preferences add column if not exists push_enabled boolean not null default false;
alter table public.notification_preferences add column if not exists quiet_start time;
alter table public.notification_preferences add column if not exists quiet_end time;
alter table public.notification_preferences add column if not exists timezone varchar(80) not null default 'Asia/Kolkata';
alter table public.notification_preferences add column if not exists urgent_bypass_quiet boolean not null default true;

create or replace function public.upsert_my_push_subscription(p_endpoint text,p_p256dh text,p_auth text,p_user_agent text default null) returns uuid
language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
 if auth.uid() is null then raise exception 'Sign in required.' using errcode='42501';end if;
 if length(coalesce(p_endpoint,''))<20 or length(coalesce(p_p256dh,''))<20 or length(coalesce(p_auth,''))<8 then raise exception 'Invalid push subscription.' using errcode='22023';end if;
 insert into public.push_subscriptions(user_id,endpoint,p256dh,auth_key,user_agent,active,last_seen_at,updated_at)
 values(auth.uid(),p_endpoint,p_p256dh,p_auth,left(p_user_agent,500),true,now(),now())
 on conflict(user_id,endpoint) do update set p256dh=excluded.p256dh,auth_key=excluded.auth_key,user_agent=excluded.user_agent,active=true,last_seen_at=now(),updated_at=now()
 returning id into v_id;
 update public.notification_preferences set push_enabled=true,updated_at=now() where user_id=auth.uid();
 return v_id;
end $$;
revoke all on function public.upsert_my_push_subscription(text,text,text,text) from public;grant execute on function public.upsert_my_push_subscription(text,text,text,text) to authenticated;

create or replace function public.disable_my_push_subscription(p_endpoint text default null) returns integer
language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
 update public.push_subscriptions set active=false,updated_at=now() where user_id=auth.uid() and (p_endpoint is null or endpoint=p_endpoint);
 get diagnostics v_count=row_count; return v_count;
end $$;
revoke all on function public.disable_my_push_subscription(text) from public;grant execute on function public.disable_my_push_subscription(text) to authenticated;

create or replace function public.get_my_push_status() returns jsonb
language sql security definer stable set search_path=public as $$
 select jsonb_build_object('active_subscriptions',count(*) filter(where active),'last_seen_at',max(last_seen_at))
 from public.push_subscriptions where user_id=auth.uid();
$$;
revoke all on function public.get_my_push_status() from public;grant execute on function public.get_my_push_status() to authenticated;
