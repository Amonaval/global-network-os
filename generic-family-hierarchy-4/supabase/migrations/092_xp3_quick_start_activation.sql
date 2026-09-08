-- XP-3 Quick Start & Activation parity. Rerunnable.
create table if not exists public.network_quick_start_state(
 network_id uuid not null references public.networks(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 dismissed boolean not null default false,
 completed_step_ids text[] not null default '{}',
 updated_at timestamptz not null default now(),
 primary key(network_id,user_id)
);
alter table public.network_quick_start_state enable row level security;
drop policy if exists network_quick_start_state_self on public.network_quick_start_state;
create policy network_quick_start_state_self on public.network_quick_start_state for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create or replace function public.get_network_quick_start_state(p_network_id uuid)
returns table(dismissed boolean,completed_step_ids text[],updated_at timestamptz)
language sql security definer set search_path=public as $$
 select q.dismissed,q.completed_step_ids,q.updated_at from public.network_quick_start_state q
 where q.network_id=p_network_id and q.user_id=auth.uid() and exists(select 1 from public.network_memberships m where m.network_id=p_network_id and m.user_id=auth.uid() and m.status='active');
$$;
create or replace function public.save_network_quick_start_state(p_network_id uuid,p_dismissed boolean,p_completed_step_ids text[])
returns void language plpgsql security definer set search_path=public as $$
begin
 if not exists(select 1 from public.network_memberships m where m.network_id=p_network_id and m.user_id=auth.uid() and m.status='active') then raise exception 'Active network membership required.'; end if;
 insert into public.network_quick_start_state(network_id,user_id,dismissed,completed_step_ids,updated_at)
 values(p_network_id,auth.uid(),coalesce(p_dismissed,false),coalesce(p_completed_step_ids,'{}'),now())
 on conflict(network_id,user_id) do update set dismissed=excluded.dismissed,completed_step_ids=excluded.completed_step_ids,updated_at=now();
end $$;
do $$ begin
 if to_regclass('public.network_quick_start_state') is null then raise exception 'XP-3 compatibility check failed: quick start state missing.'; end if;
end $$;
