-- XP-6 Invitation, claiming and correction parity. Rerunnable.
create table if not exists public.network_participation_invitations(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 email text not null,
 target_ref uuid,
 target_kind varchar(40),
 invited_role varchar(20) not null default 'member' check(invited_role in ('admin','member')),
 token uuid not null default gen_random_uuid() unique,
 status varchar(20) not null default 'pending' check(status in ('pending','accepted','revoked','expired')),
 expires_at timestamptz not null default(now()+interval '14 days'),
 created_by uuid references auth.users(id) on delete set null,
 accepted_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),accepted_at timestamptz,
 resend_count integer not null default 0
);
create index if not exists idx_network_participation_invites on public.network_participation_invitations(network_id,status,created_at desc);
create index if not exists idx_network_participation_email on public.network_participation_invitations(network_id,lower(email));
alter table public.network_participation_invitations enable row level security;
revoke all on public.network_participation_invitations from anon,authenticated;

create table if not exists public.network_contribution_audit(
 id uuid primary key default gen_random_uuid(),network_id uuid not null references public.networks(id) on delete cascade,
 contribution_id uuid not null references public.network_contributions(id) on delete cascade,
 from_status varchar(20),to_status varchar(20) not null,actor_user_id uuid references auth.users(id) on delete set null,
 at timestamptz not null default now()
);
create index if not exists idx_network_contribution_audit on public.network_contribution_audit(network_id,contribution_id,at desc);
alter table public.network_contribution_audit enable row level security;revoke all on public.network_contribution_audit from anon,authenticated;

create or replace function public.create_network_participation_invitation(p_network_id uuid,p_email text,p_target_ref uuid default null,p_target_kind text default null,p_invited_role text default 'member',p_expires_days integer default 14)
returns jsonb language plpgsql security definer set search_path=public as $$
declare actor text; v public.network_participation_invitations%rowtype;begin
 select role into actor from public.network_memberships where network_id=p_network_id and user_id=auth.uid() and status='active';
 if actor not in ('owner','admin') then raise exception 'Network admin access required.' using errcode='42501';end if;
 if position('@' in trim(coalesce(p_email,'')))<2 then raise exception 'Valid email required.' using errcode='22023';end if;
 if p_invited_role='admin' and actor<>'owner' then raise exception 'Only owner can invite an admin.' using errcode='42501';end if;
 update public.network_participation_invitations set status='expired',updated_at=now() where network_id=p_network_id and status='pending' and expires_at<=now();
 select * into v from public.network_participation_invitations where network_id=p_network_id and lower(email)=lower(trim(p_email)) and status='pending' order by created_at desc limit 1;
 if found then return jsonb_build_object('id',v.id,'token',v.token,'email',v.email,'expiresAt',v.expires_at,'status',v.status);end if;
 insert into public.network_participation_invitations(network_id,email,target_ref,target_kind,invited_role,expires_at,created_by)
 values(p_network_id,lower(trim(p_email)),p_target_ref,nullif(trim(coalesce(p_target_kind,'')),''),case when p_invited_role='admin' then 'admin' else 'member' end,now()+make_interval(days=>greatest(1,least(30,coalesce(p_expires_days,14)))),auth.uid()) returning * into v;
 return jsonb_build_object('id',v.id,'token',v.token,'email',v.email,'expiresAt',v.expires_at,'status',v.status);
end $$;

create or replace function public.list_network_participation_invitations(p_network_id uuid)
returns table(id uuid,email text,target_ref uuid,target_kind varchar,invited_role varchar,status varchar,expires_at timestamptz,created_at timestamptz,resend_count integer)
language plpgsql security definer stable set search_path=public as $$begin
 if not exists(select 1 from public.network_memberships nm where nm.network_id=p_network_id and nm.user_id=auth.uid() and nm.status='active' and nm.role in ('owner','admin')) then raise exception 'Network admin access required.' using errcode='42501';end if;
 return query select i.id,i.email,i.target_ref,i.target_kind,i.invited_role,case when i.status='pending' and i.expires_at<=now() then 'expired'::varchar else i.status end,i.expires_at,i.created_at,i.resend_count from public.network_participation_invitations i where i.network_id=p_network_id order by i.created_at desc;
end $$;

create or replace function public.resend_network_participation_invitation(p_network_id uuid,p_invitation_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$declare v public.network_participation_invitations%rowtype;begin
 if not exists(select 1 from public.network_memberships where network_id=p_network_id and user_id=auth.uid() and status='active' and role in ('owner','admin')) then raise exception 'Network admin access required.' using errcode='42501';end if;
 update public.network_participation_invitations set token=gen_random_uuid(),status='pending',expires_at=now()+interval '14 days',resend_count=resend_count+1,updated_at=now() where id=p_invitation_id and network_id=p_network_id and status<>'accepted' returning * into v;
 if not found then raise exception 'Invitation not found or already accepted.' using errcode='P0002';end if;
 return jsonb_build_object('id',v.id,'token',v.token,'email',v.email,'expiresAt',v.expires_at,'status',v.status);
end $$;

create or replace function public.revoke_network_participation_invitation(p_network_id uuid,p_invitation_id uuid)
returns void language plpgsql security definer set search_path=public as $$begin
 if not exists(select 1 from public.network_memberships where network_id=p_network_id and user_id=auth.uid() and status='active' and role in ('owner','admin')) then raise exception 'Network admin access required.' using errcode='42501';end if;
 update public.network_participation_invitations set status='revoked',updated_at=now() where id=p_invitation_id and network_id=p_network_id and status='pending';
end $$;

create or replace function public.accept_network_participation_invitation(p_token uuid)
returns uuid language plpgsql security definer set search_path=public as $$declare v public.network_participation_invitations%rowtype; uid uuid:=auth.uid();begin
 if uid is null then raise exception 'Sign in required.' using errcode='42501';end if;
 select * into v from public.network_participation_invitations where token=p_token for update;if not found then raise exception 'Invitation not found.' using errcode='P0002';end if;
 if v.status<>'pending' then raise exception 'Invitation is no longer active.' using errcode='22023';end if;if v.expires_at<=now() then update public.network_participation_invitations set status='expired',updated_at=now() where id=v.id;raise exception 'Invitation expired.' using errcode='22023';end if;
 insert into public.network_memberships(network_id,user_id,role,status,joined_at) values(v.network_id,uid,v.invited_role,'active',now()) on conflict(network_id,user_id) do update set status='active',role=case when network_memberships.role='owner' then 'owner' else excluded.role end;
 if v.target_ref is not null and v.target_kind='network_entity' then
  if exists(select 1 from public.network_entities where network_id=v.network_id and owner_user_id=uid and id<>v.target_ref) then raise exception 'This account already claims another identity in this network.' using errcode='23505';end if;
  update public.network_entities set owner_user_id=uid where id=v.target_ref and network_id=v.network_id and owner_user_id is null;
 end if;
 update public.profiles set active_network_id=v.network_id,updated_at=now() where id=uid;
 update public.network_participation_invitations set status='accepted',accepted_by=uid,accepted_at=now(),updated_at=now() where id=v.id;
 return v.network_id;
end $$;

create or replace function public.xp6_log_contribution_review() returns trigger language plpgsql security definer set search_path=public as $$begin
 if old.status is distinct from new.status then insert into public.network_contribution_audit(network_id,contribution_id,from_status,to_status,actor_user_id) values(new.network_id,new.id,old.status,new.status,auth.uid());end if;return new;end $$;
drop trigger if exists trg_xp6_contribution_review on public.network_contributions;
create trigger trg_xp6_contribution_review after update of status on public.network_contributions for each row execute function public.xp6_log_contribution_review();

revoke all on function public.create_network_participation_invitation(uuid,text,uuid,text,text,integer),public.list_network_participation_invitations(uuid),public.resend_network_participation_invitation(uuid,uuid),public.revoke_network_participation_invitation(uuid,uuid),public.accept_network_participation_invitation(uuid) from public;
grant execute on function public.create_network_participation_invitation(uuid,text,uuid,text,text,integer),public.list_network_participation_invitations(uuid),public.resend_network_participation_invitation(uuid,uuid),public.revoke_network_participation_invitation(uuid,uuid),public.accept_network_participation_invitation(uuid) to authenticated;

do $$begin if to_regclass('public.network_participation_invitations') is null or to_regclass('public.network_contribution_audit') is null then raise exception 'XP-6 tables missing';end if;if to_regprocedure('public.accept_network_participation_invitation(uuid)') is null then raise exception 'XP-6 accept function missing';end if;end $$;
