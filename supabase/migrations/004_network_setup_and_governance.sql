-- Network configuration and safer first-admin bootstrap.
create table if not exists public.network_settings (
  id text primary key check (id = 'network'),
  name varchar(180) not null,
  description text default '',
  initialized_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.network_settings enable row level security;
drop policy if exists "authenticated can read network settings" on public.network_settings;
create policy "authenticated can read network settings" on public.network_settings for select to authenticated using (true);
drop policy if exists "admins can manage network settings" on public.network_settings;
create policy "admins can manage network settings" on public.network_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- On a fresh project the first registered account becomes admin automatically.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path=public as $$
declare first_user boolean;
begin
  select not exists(select 1 from public.profiles) into first_user;
  insert into public.profiles(id,full_name,role)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),case when first_user then 'admin' else 'member' end)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Basic audit trail for administrative operations.
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action varchar(80) not null,
  details jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.audit_log enable row level security;
drop policy if exists "admins can read audit log" on public.audit_log;
create policy "admins can read audit log" on public.audit_log for select to authenticated using (public.is_admin());
drop policy if exists "admins can write audit log" on public.audit_log;
create policy "admins can write audit log" on public.audit_log for insert to authenticated with check (public.is_admin());
