-- P4.1 Adoption: profile photos + secure member invitation links.
-- Run after 001 -> 005 on an existing project.

/* -------------------------------------------------------------------------- */
/* 1. Profile photo storage                                                   */
/* -------------------------------------------------------------------------- */
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "authenticated can upload profile photos" on storage.objects;
create policy "authenticated can upload profile photos"
on storage.objects for insert to authenticated
with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = 'profiles' and (storage.foldername(name))[2] = auth.uid()::text);

drop policy if exists "authenticated can update own profile photos" on storage.objects;
create policy "authenticated can update own profile photos"
on storage.objects for update to authenticated
using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = 'profiles' and (storage.foldername(name))[2] = auth.uid()::text)
with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = 'profiles' and (storage.foldername(name))[2] = auth.uid()::text);

drop policy if exists "authenticated can delete own profile photos" on storage.objects;
create policy "authenticated can delete own profile photos"
on storage.objects for delete to authenticated
using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = 'profiles' and (storage.foldername(name))[2] = auth.uid()::text);

drop policy if exists "public can view profile photos" on storage.objects;
create policy "public can view profile photos"
on storage.objects for select to public
using (bucket_id = 'profile-photos');

/* -------------------------------------------------------------------------- */
/* 2. Link authenticated users to their hierarchy member                      */
/* -------------------------------------------------------------------------- */
alter table public.profiles add column if not exists member_id uuid references public.family_members(id) on delete set null;
create unique index if not exists uq_profiles_member_id on public.profiles(member_id) where member_id is not null;

/* -------------------------------------------------------------------------- */
/* 3. Invitation records                                                       */
/* -------------------------------------------------------------------------- */
create table if not exists public.member_invitations (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.family_members(id) on delete cascade,
  token_hash text not null unique,
  created_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null,
  used_at timestamptz,
  accepted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_member_invitations_member on public.member_invitations(member_id);
create index if not exists idx_member_invitations_expires on public.member_invitations(expires_at);
alter table public.member_invitations enable row level security;
revoke all on public.member_invitations from authenticated;

create extension if not exists pgcrypto;

create or replace function public.create_member_invitation(
  p_member_id uuid,
  p_token text,
  p_expires_days integer default 7
) returns void
language plpgsql security definer set search_path=public,extensions as $$
begin
  if not public.is_admin() then raise exception 'Administrator access is required.' using errcode='42501'; end if;
  if not exists(select 1 from public.family_members where id=p_member_id and profile_status='approved') then raise exception 'Approved member not found.' using errcode='P0002'; end if;
  if exists(select 1 from public.profiles where member_id=p_member_id) then raise exception 'This member profile is already claimed.' using errcode='23505'; end if;
  if p_token is null or length(p_token) < 24 then raise exception 'Invalid invitation token.' using errcode='22023'; end if;
  insert into public.member_invitations(member_id,token_hash,created_by,expires_at)
  values(p_member_id,encode(digest(p_token,'sha256'),'hex'),auth.uid(),now()+make_interval(days=>greatest(1,least(p_expires_days,30))));
  insert into public.audit_log(actor_id,action,details) values(auth.uid(),'member_invitation_created',jsonb_build_object('member_id',p_member_id,'expires_days',p_expires_days));
end;
$$;
revoke all on function public.create_member_invitation(uuid,text,integer) from public;
grant execute on function public.create_member_invitation(uuid,text,integer) to authenticated;

create or replace function public.accept_member_invitation(p_token text) returns uuid
language plpgsql security definer set search_path=public,extensions as $$
declare invite public.member_invitations; uid uuid;
begin
  uid:=auth.uid(); if uid is null then raise exception 'Sign in is required to accept this invitation.' using errcode='42501'; end if;
  select * into invite from public.member_invitations where token_hash=encode(digest(p_token,'sha256'),'hex') and used_at is null and expires_at>now() for update;
  if invite.id is null then raise exception 'This invitation is invalid, expired or already used.' using errcode='22023'; end if;
  if exists(select 1 from public.profiles where member_id=invite.member_id and id<>uid) then raise exception 'This member profile is already claimed.' using errcode='23505'; end if;
  update public.profiles set member_id=invite.member_id,updated_at=now() where id=uid;
  if not found then raise exception 'User profile was not initialized.' using errcode='P0002'; end if;
  update public.member_invitations set used_at=now(),accepted_by=uid where id=invite.id;
  insert into public.audit_log(actor_id,action,details) values(uid,'member_invitation_accepted',jsonb_build_object('invitation_id',invite.id,'member_id',invite.member_id));
  return invite.member_id;
end;
$$;
revoke all on function public.accept_member_invitation(text) from public;
grant execute on function public.accept_member_invitation(text) to authenticated;
