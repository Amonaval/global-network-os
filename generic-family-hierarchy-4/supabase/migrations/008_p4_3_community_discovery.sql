-- P4.3: Community, Memories & Discovery
-- Run after 001 -> 007 on an existing project.
create extension if not exists pgcrypto;

/* -------------------------------------------------------------------------- */
/* 1. Community media                                                         */
/* -------------------------------------------------------------------------- */
insert into storage.buckets (id,name,public) values ('community-media','community-media',true)
on conflict (id) do update set public=excluded.public;
drop policy if exists "authenticated can upload community media" on storage.objects;
create policy "authenticated can upload community media" on storage.objects for insert to authenticated
with check (bucket_id='community-media' and (storage.foldername(name))[1]='community' and (storage.foldername(name))[2]=auth.uid()::text);
drop policy if exists "authenticated can delete community media" on storage.objects;
create policy "authenticated can delete community media" on storage.objects for delete to authenticated
using (bucket_id='community-media' and ((storage.foldername(name))[1]='community' and (storage.foldername(name))[2]=auth.uid()::text or public.is_admin()));
drop policy if exists "public can view community media" on storage.objects;
create policy "public can view community media" on storage.objects for select to public using (bucket_id='community-media');

/* -------------------------------------------------------------------------- */
/* 2. Memories                                                                */
/* -------------------------------------------------------------------------- */
create table if not exists public.memories (
 id uuid primary key default gen_random_uuid(),
 member_id uuid references public.family_members(id) on delete cascade,
 title varchar(180) not null,
 story text,
 photo_url text,
 visibility varchar(20) not null default 'member' check (visibility in ('public','member','admin')),
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);
create index if not exists idx_memories_member_created on public.memories(member_id,created_at desc);
alter table public.memories enable row level security;
revoke all on public.memories from authenticated;

create or replace function public.get_memories(p_member_id uuid default null)
returns table(id uuid,member_id uuid,title varchar,story text,photo_url text,visibility varchar,created_by uuid,created_at timestamptz)
language sql security definer stable set search_path=public as $$
 select m.id,m.member_id,m.title,m.story,m.photo_url,m.visibility,m.created_by,m.created_at
 from public.memories m
 where (p_member_id is null or m.member_id=p_member_id)
 and (public.is_admin() or m.visibility <> 'admin');
$$;
revoke all on function public.get_memories(uuid) from public;
grant execute on function public.get_memories(uuid) to authenticated;

create or replace function public.create_memory(p_member_id uuid,p_title varchar,p_story text default null,p_photo_url text default null,p_visibility varchar default 'member') returns uuid
language plpgsql security definer set search_path=public as $$
declare memory_id uuid;
begin
 if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
 if nullif(trim(p_title),'') is null then raise exception 'Memory title is required.' using errcode='22023'; end if;
 if p_visibility not in ('public','member','admin') then raise exception 'Invalid visibility.' using errcode='22023'; end if;
 if p_visibility='admin' and not public.is_admin() then raise exception 'Only administrators can create admin-only memories.' using errcode='42501'; end if;
 if not public.is_admin() and p_member_id is not null and not exists(select 1 from public.profiles where id=auth.uid() and member_id=p_member_id) then
   raise exception 'You can only create memories for your own profile.' using errcode='42501';
 end if;
 insert into public.memories(member_id,title,story,photo_url,visibility,created_by) values(p_member_id,trim(p_title),p_story,p_photo_url,p_visibility,auth.uid()) returning id into memory_id;
 insert into public.audit_log(actor_id,action,details) values(auth.uid(),'memory_created',jsonb_build_object('memory_id',memory_id,'member_id',p_member_id));
 return memory_id;
end; $$;
revoke all on function public.create_memory(uuid,varchar,text,text,varchar) from public;
grant execute on function public.create_memory(uuid,varchar,text,text,varchar) to authenticated;

create or replace function public.delete_memory(p_memory_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare owner_id uuid;
begin
 select created_by into owner_id from public.memories where id=p_memory_id;
 if owner_id is null then raise exception 'Memory not found.' using errcode='P0002'; end if;
 if not public.is_admin() and owner_id<>auth.uid() then raise exception 'You can only delete your own memories.' using errcode='42501'; end if;
 delete from public.memories where id=p_memory_id;
 insert into public.audit_log(actor_id,action,details) values(auth.uid(),'memory_deleted',jsonb_build_object('memory_id',p_memory_id));
end; $$;
revoke all on function public.delete_memory(uuid) from public;
grant execute on function public.delete_memory(uuid) to authenticated;

/* -------------------------------------------------------------------------- */
/* 3. Notifications                                                           */
/* -------------------------------------------------------------------------- */
create table if not exists public.notifications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 type varchar(50) not null,
 title varchar(180) not null,
 body text,
 href text,
 read_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user_created on public.notifications(user_id,created_at desc);
create index if not exists idx_notifications_unread on public.notifications(user_id,read_at);
alter table public.notifications enable row level security;
revoke all on public.notifications from authenticated;

create or replace function public.get_my_notifications()
returns table(id uuid,user_id uuid,type varchar,title varchar,body text,href text,read_at timestamptz,created_at timestamptz)
language sql security definer stable set search_path=public as $$
 select n.id,n.user_id,n.type,n.title,n.body,n.href,n.read_at,n.created_at from public.notifications n
 where n.user_id=auth.uid() order by n.created_at desc limit 50;
$$;
revoke all on function public.get_my_notifications() from public;
grant execute on function public.get_my_notifications() to authenticated;

create or replace function public.mark_notification_read(p_notification_id uuid) returns void
language sql security definer set search_path=public as $$
 update public.notifications set read_at=coalesce(read_at,now()) where id=p_notification_id and user_id=auth.uid();
$$;
revoke all on function public.mark_notification_read(uuid) from public;
grant execute on function public.mark_notification_read(uuid) to authenticated;

create or replace function public.notify_user(p_user_id uuid,p_type varchar,p_title varchar,p_body text default null,p_href text default null) returns uuid
language plpgsql security definer set search_path=public as $$
declare nid uuid;
begin
 if not public.is_admin() and auth.uid()<>p_user_id then raise exception 'Not authorized.' using errcode='42501'; end if;
 insert into public.notifications(user_id,type,title,body,href) values(p_user_id,p_type,p_title,p_body,p_href) returning id into nid; return nid;
end; $$;
revoke all on function public.notify_user(uuid,varchar,varchar,text,text) from public;
grant execute on function public.notify_user(uuid,varchar,varchar,text,text) to authenticated;

/* Notify submitter after an admin review. */
drop function if exists public.review_change_request(uuid,varchar,text);

create or replace function public.review_change_request(p_request_id uuid,p_status varchar,p_review_note text default null) returns uuid
language plpgsql security definer set search_path=public as $$
declare r public.change_requests; nid uuid; target_user uuid;
begin
 if not public.is_admin() then raise exception 'Administrator access is required.' using errcode='42501'; end if;
 if p_status not in ('approved','rejected','cancelled') then raise exception 'Invalid review status.' using errcode='22023'; end if;
 select * into r from public.change_requests where id=p_request_id for update;
 if r.id is null then raise exception 'Change request not found.' using errcode='P0002'; end if;
 update public.change_requests set status=p_status,review_note=p_review_note,reviewed_by=auth.uid(),reviewed_at=now() where id=p_request_id;
 insert into public.audit_log(actor_id,action,details) values(auth.uid(),'change_request_reviewed',jsonb_build_object('request_id',p_request_id,'status',p_status));
 target_user:=r.submitted_by;
 if target_user is not null then
   insert into public.notifications(user_id,type,title,body) values(target_user,'change_request_reviewed',case when p_status='approved' then 'Your change was approved' else 'Your change was not approved' end,coalesce(p_review_note,'Your submitted change request has been reviewed.')) returning id into nid;
 end if;
 return nid;
end; $$;
revoke all on function public.review_change_request(uuid,varchar,text) from public;
grant execute on function public.review_change_request(uuid,varchar,text) to authenticated;

/* Notify member when an invitation is accepted by a different account. */
create or replace function public.accept_member_invitation(p_token text) returns uuid
language plpgsql security definer set search_path=public,extensions as $$
declare invite public.member_invitations; uid uuid; owner_user uuid;
begin
 uid:=auth.uid(); if uid is null then raise exception 'Sign in is required to accept this invitation.' using errcode='42501'; end if;
 select * into invite from public.member_invitations where token_hash=encode(digest(p_token,'sha256'),'hex') and used_at is null and expires_at>now() for update;
 if invite.id is null then raise exception 'This invitation is invalid, expired or already used.' using errcode='22023'; end if;
 if exists(select 1 from public.profiles where member_id=invite.member_id and id<>uid) then raise exception 'This member profile is already claimed.' using errcode='23505'; end if;
 update public.profiles set member_id=invite.member_id,updated_at=now() where id=uid;
 if not found then raise exception 'User profile was not initialized.' using errcode='P0002'; end if;
 update public.member_invitations set used_at=now(),accepted_by=uid where id=invite.id;
 insert into public.audit_log(actor_id,action,details) values(uid,'member_invitation_accepted',jsonb_build_object('invitation_id',invite.id,'member_id',invite.member_id));
 select created_by into owner_user from public.member_invitations where id=invite.id;
 if owner_user is not null and owner_user<>uid then insert into public.notifications(user_id,type,title,body) values(owner_user,'invitation_accepted','Invitation accepted','A member has accepted your invitation link.'); end if;
 return invite.member_id;
end; $$;
revoke all on function public.accept_member_invitation(text) from public;
grant execute on function public.accept_member_invitation(text) to authenticated;
