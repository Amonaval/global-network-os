-- Mission 5 — Production & Operational Runtime
-- Durable idempotency for server commands. No service-role dependency.

create table if not exists public.api_command_idempotency(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  command_name text not null,
  idempotency_key text not null,
  request_hash text not null,
  status text not null default 'pending' check(status in ('pending','completed')),
  response_body jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,command_name,idempotency_key)
);
create index if not exists idx_api_command_idempotency_updated_at on public.api_command_idempotency(updated_at);
alter table public.api_command_idempotency enable row level security;
revoke all on table public.api_command_idempotency from public,anon,authenticated;

create or replace function public.begin_api_command_idempotency(p_command text,p_key text,p_request_hash text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); r public.api_command_idempotency; claimed boolean:=false;
begin
 if uid is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
 if length(trim(coalesce(p_command,'')))<1 or length(trim(coalesce(p_key,'')))<8 or length(trim(coalesce(p_key,'')))>128 or length(trim(coalesce(p_request_hash,'')))<16 then
  raise exception 'Invalid idempotency request.' using errcode='22023';
 end if;
 insert into public.api_command_idempotency(user_id,command_name,idempotency_key,request_hash)
 values(uid,trim(p_command),trim(p_key),trim(p_request_hash)) on conflict do nothing;
 select * into r from public.api_command_idempotency i
 where i.user_id=uid and i.command_name=trim(p_command) and i.idempotency_key=trim(p_key);
 if r.request_hash<>trim(p_request_hash) then
  raise exception 'Idempotency key was already used with a different request.' using errcode='23505';
 end if;
 if r.status='completed' then return jsonb_build_object('state','cached','response',r.response_body); end if;
 if r.created_at= r.updated_at and r.updated_at > now()-interval '5 minutes' then
  -- Freshly inserted by this or a competing request. Try to claim by changing updated_at once.
  update public.api_command_idempotency i set updated_at=clock_timestamp()
   where i.id=r.id and i.updated_at=r.updated_at returning true into claimed;
  if claimed then return jsonb_build_object('state','execute'); end if;
 end if;
 if r.updated_at <= now()-interval '5 minutes' then
  update public.api_command_idempotency i set updated_at=clock_timestamp()
   where i.id=r.id and i.status='pending' and i.updated_at=r.updated_at returning true into claimed;
  if claimed then return jsonb_build_object('state','execute'); end if;
 end if;
 return jsonb_build_object('state','in_progress');
end;$$;

create or replace function public.complete_api_command_idempotency(p_command text,p_key text,p_response jsonb)
returns void language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
 update public.api_command_idempotency i set status='completed',response_body=p_response,updated_at=now()
 where i.user_id=auth.uid() and i.command_name=trim(p_command) and i.idempotency_key=trim(p_key);
 if not found then raise exception 'Idempotency record not found.' using errcode='P0002'; end if;
end;$$;

create or replace function public.release_api_command_idempotency(p_command text,p_key text)
returns void language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is null then return; end if;
 delete from public.api_command_idempotency i where i.user_id=auth.uid() and i.command_name=trim(p_command) and i.idempotency_key=trim(p_key) and i.status='pending';
end;$$;

revoke all on function public.begin_api_command_idempotency(text,text,text) from public;
revoke all on function public.complete_api_command_idempotency(text,text,jsonb) from public;
revoke all on function public.release_api_command_idempotency(text,text) from public;
grant execute on function public.begin_api_command_idempotency(text,text,text) to authenticated;
grant execute on function public.complete_api_command_idempotency(text,text,jsonb) to authenticated;
grant execute on function public.release_api_command_idempotency(text,text) to authenticated;
