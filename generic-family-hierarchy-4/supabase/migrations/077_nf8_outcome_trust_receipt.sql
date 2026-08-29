-- NF-8 Outcome + Trust Receipt
-- Closes the governed request -> route -> introduction loop with bilateral, private outcome evidence.
-- Outcomes are evidence for one introduction, never public person reputation scores.

create table if not exists public.federated_trust_receipts(
 id uuid primary key default gen_random_uuid(),
 introduction_id uuid not null unique references public.federated_introductions(id) on delete cascade,
 request_id uuid not null references public.federated_requests(id) on delete cascade,
 route_id uuid not null references public.federated_request_routes(id) on delete cascade,
 scope_key varchar(80) not null,
 request_title varchar(220) not null,
 source_network_name varchar(180) not null,
 target_network_name varchar(180) not null,
 umbrella_name varchar(180) not null,
 trust_path_snapshot text not null,
 routed_at timestamptz,
 introduction_requested_at timestamptz not null,
 accepted_at timestamptz not null,
 created_at timestamptz not null default now()
);
create index if not exists idx_federated_trust_receipts_request on public.federated_trust_receipts(request_id,created_at desc);
alter table public.federated_trust_receipts enable row level security;
revoke all on public.federated_trust_receipts from anon,authenticated;

create table if not exists public.federated_introduction_outcomes(
 id uuid primary key default gen_random_uuid(),
 introduction_id uuid not null references public.federated_introductions(id) on delete cascade,
 receipt_id uuid not null references public.federated_trust_receipts(id) on delete cascade,
 actor_user_id uuid not null references auth.users(id) on delete cascade,
 actor_role varchar(20) not null check(actor_role in ('requester','recipient')),
 outcome_code varchar(30) not null check(outcome_code in ('connected','helpful','resolved','not_resolved','no_follow_up')),
 note varchar(800),
 recorded_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(introduction_id,actor_user_id)
);
create index if not exists idx_federated_introduction_outcomes_intro on public.federated_introduction_outcomes(introduction_id,recorded_at desc);
alter table public.federated_introduction_outcomes enable row level security;
revoke all on public.federated_introduction_outcomes from anon,authenticated;

create or replace function public.ensure_federated_trust_receipt(p_introduction_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare rid uuid;
begin
 select tr.id into rid from public.federated_trust_receipts tr where tr.introduction_id=p_introduction_id;
 if rid is not null then return rid; end if;
 insert into public.federated_trust_receipts(introduction_id,request_id,route_id,scope_key,request_title,source_network_name,target_network_name,umbrella_name,trust_path_snapshot,routed_at,introduction_requested_at,accepted_at)
 select i.id,r.id,rr.id,r.scope_key,r.title,src.name,target.name,u.name,i.trust_path_snapshot,rr.generated_at,i.created_at,i.responded_at
 from public.federated_introductions i
 join public.federated_requests r on r.id=i.request_id
 join public.federated_request_routes rr on rr.id=i.route_id
 join public.networks src on src.id=r.source_network_id
 join public.federated_scope_profiles sp on sp.id=i.target_scope_profile_id
 join public.networks target on target.id=sp.network_id
 join public.federation_umbrellas u on u.id=r.umbrella_id
 where i.id=p_introduction_id and i.status='accepted' and i.responded_at is not null
 on conflict(introduction_id) do nothing
 returning id into rid;
 if rid is null then select tr.id into rid from public.federated_trust_receipts tr where tr.introduction_id=p_introduction_id; end if;
 return rid;
end $$;
revoke all on function public.ensure_federated_trust_receipt(uuid) from public;

create or replace function public.nf8_capture_accepted_trust_receipt()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.status='accepted' and (old.status is distinct from new.status or old.responded_at is distinct from new.responded_at) then
  perform public.ensure_federated_trust_receipt(new.id);
 end if;
 return new;
end $$;
revoke all on function public.nf8_capture_accepted_trust_receipt() from public;

drop trigger if exists trg_nf8_capture_accepted_trust_receipt on public.federated_introductions;
create trigger trg_nf8_capture_accepted_trust_receipt after update of status,responded_at on public.federated_introductions
for each row execute function public.nf8_capture_accepted_trust_receipt();

-- Backfill receipts for NF-7 introductions accepted before NF-8 is applied.
insert into public.federated_trust_receipts(introduction_id,request_id,route_id,scope_key,request_title,source_network_name,target_network_name,umbrella_name,trust_path_snapshot,routed_at,introduction_requested_at,accepted_at)
select i.id,r.id,rr.id,r.scope_key,r.title,src.name,target.name,u.name,i.trust_path_snapshot,rr.generated_at,i.created_at,i.responded_at
from public.federated_introductions i
join public.federated_requests r on r.id=i.request_id
join public.federated_request_routes rr on rr.id=i.route_id
join public.networks src on src.id=r.source_network_id
join public.federated_scope_profiles sp on sp.id=i.target_scope_profile_id
join public.networks target on target.id=sp.network_id
join public.federation_umbrellas u on u.id=r.umbrella_id
where i.status='accepted' and i.responded_at is not null
on conflict(introduction_id) do nothing;

create or replace function public.get_my_federated_outcome_candidates()
returns table(introduction_id uuid,request_id uuid,scope_key varchar,request_title varchar,requester_alias varchar,target_display_name varchar,source_network_name varchar,target_network_name varchar,umbrella_name varchar,trust_path_label text,accepted_at timestamptz,my_role text,receipt_id uuid,receipt_created_at timestamptz,my_outcome_code varchar,my_outcome_note varchar,counterparty_outcome_code varchar,counterparty_outcome_recorded_at timestamptz,request_status varchar)
language sql security definer stable set search_path=public as $$
 select i.id,r.id,r.scope_key,r.title,i.requester_alias,sp.display_name,tr.source_network_name,tr.target_network_name,tr.umbrella_name,tr.trust_path_snapshot,i.responded_at,
  case when i.requester_user_id=auth.uid() then 'requester' else 'recipient' end::text,
  tr.id,tr.created_at,mine.outcome_code,mine.note,other.outcome_code,other.recorded_at,r.status
 from public.federated_introductions i
 join public.federated_requests r on r.id=i.request_id
 join public.federated_scope_profiles sp on sp.id=i.target_scope_profile_id
 join public.federated_trust_receipts tr on tr.introduction_id=i.id
 left join public.federated_introduction_outcomes mine on mine.introduction_id=i.id and mine.actor_user_id=auth.uid()
 left join public.federated_introduction_outcomes other on other.introduction_id=i.id and other.actor_user_id<>auth.uid()
 where i.status='accepted' and (i.requester_user_id=auth.uid() or i.target_user_id=auth.uid())
 order by coalesce(mine.updated_at,i.responded_at) desc;
$$;
revoke all on function public.get_my_federated_outcome_candidates() from public;
grant execute on function public.get_my_federated_outcome_candidates() to authenticated;

create or replace function public.record_my_federated_introduction_outcome(p_introduction_id uuid,p_outcome_code text,p_note text default null,p_close_request boolean default false)
returns void language plpgsql security definer set search_path=public as $$
declare i public.federated_introductions%rowtype; rid uuid; role_name varchar(20);
begin
 if p_outcome_code not in ('connected','helpful','resolved','not_resolved','no_follow_up') then raise exception 'Unsupported outcome.' using errcode='22023'; end if;
 if length(trim(coalesce(p_note,'')))>800 then raise exception 'Outcome note is too long.' using errcode='22023'; end if;
 select * into i from public.federated_introductions where id=p_introduction_id and status='accepted' and (requester_user_id=auth.uid() or target_user_id=auth.uid());
 if not found then raise exception 'Accepted introduction not found for this user.' using errcode='42501'; end if;
 role_name:=case when i.requester_user_id=auth.uid() then 'requester' else 'recipient' end;
 rid:=public.ensure_federated_trust_receipt(i.id);
 if rid is null then raise exception 'Trust Receipt could not be established.' using errcode='55000'; end if;
 insert into public.federated_introduction_outcomes(introduction_id,receipt_id,actor_user_id,actor_role,outcome_code,note)
 values(i.id,rid,auth.uid(),role_name,p_outcome_code,left(nullif(trim(coalesce(p_note,'')),''),800))
 on conflict(introduction_id,actor_user_id) do update set outcome_code=excluded.outcome_code,note=excluded.note,updated_at=now();
 if p_close_request and role_name='requester' then
  update public.federated_requests set status='closed',updated_at=now() where id=i.request_id and requester_user_id=auth.uid() and status='open';
 end if;
end $$;
revoke all on function public.record_my_federated_introduction_outcome(uuid,text,text,boolean) from public;
grant execute on function public.record_my_federated_introduction_outcome(uuid,text,text,boolean) to authenticated;

create or replace function public.get_my_federated_trust_receipt(p_introduction_id uuid)
returns table(id uuid,introduction_id uuid,request_id uuid,scope_key varchar,request_title varchar,source_network_name varchar,target_network_name varchar,umbrella_name varchar,trust_path_label text,routed_at timestamptz,introduction_requested_at timestamptz,accepted_at timestamptz,created_at timestamptz,requester_outcome_code varchar,recipient_outcome_code varchar)
language sql security definer stable set search_path=public as $$
 select tr.id,tr.introduction_id,tr.request_id,tr.scope_key,tr.request_title,tr.source_network_name,tr.target_network_name,tr.umbrella_name,tr.trust_path_snapshot,tr.routed_at,tr.introduction_requested_at,tr.accepted_at,tr.created_at,
  reqo.outcome_code,repo.outcome_code
 from public.federated_trust_receipts tr
 join public.federated_introductions i on i.id=tr.introduction_id
 left join public.federated_introduction_outcomes reqo on reqo.introduction_id=i.id and reqo.actor_user_id=i.requester_user_id
 left join public.federated_introduction_outcomes repo on repo.introduction_id=i.id and repo.actor_user_id=i.target_user_id
 where tr.introduction_id=p_introduction_id and (i.requester_user_id=auth.uid() or i.target_user_id=auth.uid());
$$;
revoke all on function public.get_my_federated_trust_receipt(uuid) from public;
grant execute on function public.get_my_federated_trust_receipt(uuid) to authenticated;

comment on table public.federated_trust_receipts is 'NF-8 immutable-style provenance snapshot for an accepted governed introduction: request, route, federation path and consent timestamps. Participant-private by audited RPC.';
comment on table public.federated_introduction_outcomes is 'NF-8 bilateral private outcome evidence. Not a public rating, endorsement or universal trust score.';
comment on function public.record_my_federated_introduction_outcome(uuid,text,text,boolean) is 'NF-8 lets either introduction participant record only their own outcome evidence; requester may optionally close the originating request.';

with verticals(vertical_kind) as (values ('family'::varchar),('alumni'),('organization'),('business-trust'),('franchise'),('professional'))
insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind)
select v.vertical_kind||'.advanced.outcome_trust_receipt','federation','test','{}'::uuid[],v.vertical_kind from verticals v
on conflict(feature_key) do update set bundle_key=excluded.bundle_key,vertical_kind=excluded.vertical_kind;
insert into public.platform_playground_features(feature_key,enabled)
select feature_key,false from public.platform_feature_flags where feature_key like '%.advanced.outcome_trust_receipt'
on conflict(feature_key) do nothing;
