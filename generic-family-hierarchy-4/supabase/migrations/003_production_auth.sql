-- Production auth / roles / privacy layer.
alter table public.profile_submissions add column if not exists submitted_by uuid references auth.users(id) on delete set null;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name varchar(150),
  role varchar(20) not null default 'member' check (role in ('member','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,full_name) values(new.id, coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin');
$$;

alter table public.profiles enable row level security;
create policy "users can read own profile" on public.profiles for select to authenticated using (id=auth.uid() or public.is_admin());
create policy "admins can update roles" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Replace the baseline read policy with authenticated-only access.
drop policy if exists "authenticated members can read approved family members" on public.family_members;
create policy "authenticated members can read approved family members"
on public.family_members for select to authenticated using (profile_status='approved' or public.is_admin());

create policy "admins can manage family members" on public.family_members for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins can manage relationships" on public.family_relationships for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Members may submit a profile. They can see only their own submissions.
drop policy if exists "authenticated members can submit profiles" on public.profile_submissions;
create policy "members can create submissions" on public.profile_submissions for insert to authenticated with check (true);
drop policy if exists "members can read own submissions" on public.profile_submissions;
create policy "members can read own submissions" on public.profile_submissions for select to authenticated using (submitted_by=auth.uid() or public.is_admin());
create policy "admins can manage submissions" on public.profile_submissions for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Admin bootstrap: after creating your first account, run:
-- update public.profiles set role='admin' where id='<AUTH USER UUID>';
