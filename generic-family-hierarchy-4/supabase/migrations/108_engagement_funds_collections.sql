-- E6 — Membership funds, pool funds and event collections.
-- Additive, generic network finance layer. Existing FCA and Housing finance tables remain intact.

create table if not exists public.network_funds(
  id uuid primary key default gen_random_uuid(),
  network_id uuid not null references public.networks(id) on delete cascade,
  name varchar(160) not null,
  fund_kind varchar(30) not null default 'general',
  purpose text,
  membership_year_id uuid,
  activity_id uuid,
  target_amount numeric(14,2),
  opening_balance numeric(14,2) not null default 0,
  visibility varchar(20) not null default 'members',
  status varchar(20) not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint network_funds_kind_check check(fund_kind in ('general','membership','event','donation','reserve','maintenance','other')),
  constraint network_funds_visibility_check check(visibility in ('admins','members','highlighted')),
  constraint network_funds_status_check check(status in ('active','closed','archived')),
  constraint network_funds_target_check check(target_amount is null or target_amount>=0)
);
create index if not exists idx_network_funds_network_status on public.network_funds(network_id,status,created_at desc);

create table if not exists public.network_fund_transactions(
  id uuid primary key default gen_random_uuid(),
  network_id uuid not null references public.networks(id) on delete cascade,
  fund_id uuid not null references public.network_funds(id) on delete cascade,
  transaction_kind varchar(30) not null,
  amount numeric(14,2) not null,
  source_entity_id uuid,
  activity_id uuid,
  membership_year_id uuid,
  receipt_no varchar(80),
  payment_method varchar(40),
  reference varchar(160),
  note text,
  visibility varchar(20) not null default 'members',
  occurred_on date not null default current_date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint network_fund_tx_kind_check check(transaction_kind in ('collection','expense','refund','transfer_in','transfer_out','adjustment')),
  constraint network_fund_tx_amount_check check(amount>0),
  constraint network_fund_tx_visibility_check check(visibility in ('admins','members','highlighted'))
);
create index if not exists idx_network_fund_transactions_fund_date on public.network_fund_transactions(network_id,fund_id,occurred_on desc,created_at desc);
create unique index if not exists idx_network_fund_receipt_unique on public.network_fund_transactions(network_id,receipt_no) where receipt_no is not null;

alter table public.network_funds enable row level security;
alter table public.network_fund_transactions enable row level security;
revoke all on public.network_funds,public.network_fund_transactions from anon,authenticated;

create or replace function public.e6_fund_signed_amount(p_kind text,p_amount numeric) returns numeric
language sql immutable as $$
 select case when p_kind in ('expense','refund','transfer_out') then -abs(coalesce(p_amount,0)) else abs(coalesce(p_amount,0)) end;
$$;

create or replace function public.create_network_fund(
  p_name text,p_fund_kind text default 'general',p_purpose text default null,p_target_amount numeric default null,
  p_opening_balance numeric default 0,p_visibility text default 'members',p_membership_year_id uuid default null,p_activity_id uuid default null
) returns uuid
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); rid uuid;
begin
 if nid is null or not public.is_network_admin(nid) then raise exception 'Network admin access required.' using errcode='42501'; end if;
 if length(trim(coalesce(p_name,'')))<2 then raise exception 'Fund name is required.' using errcode='22023'; end if;
 if p_fund_kind not in ('general','membership','event','donation','reserve','maintenance','other') then raise exception 'Invalid fund kind.' using errcode='22023'; end if;
 if p_visibility not in ('admins','members','highlighted') then raise exception 'Invalid fund visibility.' using errcode='22023'; end if;
 if p_activity_id is not null and not exists(select 1 from public.network_activities a where a.id=p_activity_id and a.network_id=nid) then raise exception 'Event/activity not found in this network.' using errcode='22023'; end if;
 insert into public.network_funds(network_id,name,fund_kind,purpose,membership_year_id,activity_id,target_amount,opening_balance,visibility,created_by)
 values(nid,left(trim(p_name),160),p_fund_kind,nullif(trim(coalesce(p_purpose,'')),''),p_membership_year_id,p_activity_id,p_target_amount,coalesce(p_opening_balance,0),p_visibility,auth.uid()) returning id into rid;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'network_fund_created',jsonb_build_object('fund_id',rid,'kind',p_fund_kind,'name',trim(p_name)));
 return rid;
end $$;
revoke all on function public.create_network_fund(text,text,text,numeric,numeric,text,uuid,uuid) from public;
grant execute on function public.create_network_fund(text,text,text,numeric,numeric,text,uuid,uuid) to authenticated;

create or replace function public.record_network_fund_transaction(
  p_fund_id uuid,p_transaction_kind text,p_amount numeric,p_source_entity_id uuid default null,p_activity_id uuid default null,
  p_membership_year_id uuid default null,p_payment_method text default null,p_reference text default null,p_note text default null,
  p_visibility text default 'members',p_occurred_on date default current_date
) returns uuid
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); rid uuid; fundrow public.network_funds%rowtype; receipt text; recipient uuid; due numeric; paid numeric;
begin
 if nid is null or not public.is_network_admin(nid) then raise exception 'Network admin access required.' using errcode='42501'; end if;
 select * into fundrow from public.network_funds where id=p_fund_id and network_id=nid and status='active'; if not found then raise exception 'Active fund not found.' using errcode='22023'; end if;
 if p_transaction_kind not in ('collection','expense','refund','transfer_in','transfer_out','adjustment') then raise exception 'Invalid transaction kind.' using errcode='22023'; end if;
 if coalesce(p_amount,0)<=0 then raise exception 'Amount must be greater than zero.' using errcode='22023'; end if;
 if p_visibility not in ('admins','members','highlighted') then raise exception 'Invalid transaction visibility.' using errcode='22023'; end if;
 if p_source_entity_id is not null and not exists(select 1 from public.network_entities e where e.id=p_source_entity_id and e.network_id=nid) then raise exception 'Source family/member not found.' using errcode='22023'; end if;
 if p_activity_id is not null and not exists(select 1 from public.network_activities a where a.id=p_activity_id and a.network_id=nid) then raise exception 'Activity not found.' using errcode='22023'; end if;
 receipt:='TW-'||to_char(coalesce(p_occurred_on,current_date),'YYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
 insert into public.network_fund_transactions(network_id,fund_id,transaction_kind,amount,source_entity_id,activity_id,membership_year_id,receipt_no,payment_method,reference,note,visibility,occurred_on,created_by)
 values(nid,p_fund_id,p_transaction_kind,p_amount,p_source_entity_id,p_activity_id,p_membership_year_id,receipt,nullif(trim(coalesce(p_payment_method,'')),''),nullif(trim(coalesce(p_reference,'')),''),nullif(trim(coalesce(p_note,'')),''),p_visibility,coalesce(p_occurred_on,current_date),auth.uid()) returning id into rid;

 -- Keep FCA annual membership status synchronized when a membership fund collection is linked to a family/year.
 if p_transaction_kind='collection' and p_source_entity_id is not null and p_membership_year_id is not null and to_regclass('public.family_association_family_memberships') is not null then
   update public.family_association_family_memberships m
      set amount_paid=m.amount_paid+p_amount,
          payment_status=case when m.amount_paid+p_amount>=m.amount_due then 'paid' when m.amount_paid+p_amount>0 then 'partial' else m.payment_status end,
          renewed_on=current_date,updated_at=now()
    where m.network_id=nid and m.membership_year_id=p_membership_year_id and m.family_entity_id=p_source_entity_id;
 end if;

 -- Notify the member/family representative when a collection or refund is recorded.
 if p_source_entity_id is not null and p_transaction_kind in ('collection','refund') then
   select coalesce(e.owner_user_id,rep.owner_user_id) into recipient
   from public.network_entities e
   left join public.family_association_family_memberships m on m.network_id=nid and m.family_entity_id=e.id and (p_membership_year_id is null or m.membership_year_id=p_membership_year_id)
   left join public.network_entities rep on rep.id=m.representative_entity_id and rep.network_id=nid
   where e.id=p_source_entity_id and e.network_id=nid limit 1;
   if recipient is not null and recipient<>auth.uid() and exists(select 1 from public.network_memberships nm where nm.network_id=nid and nm.user_id=recipient and nm.status='active') then
     perform public.create_network_notification(nid,recipient,'fund_transaction',case when p_transaction_kind='collection' then 'Payment recorded' else 'Refund recorded' end,
       fundrow.name||' · ₹'||to_char(p_amount,'FM999G999G990D00'),'funds','fund_transaction',rid,'normal',jsonb_build_object('fund_id',p_fund_id,'receipt_no',receipt),auth.uid());
   end if;
 end if;

 -- Treasurer/President see meaningful fund movement without relying on someone opening the app.
 if p_transaction_kind in ('expense','collection','refund') then
   perform public.route_network_mentions(array['@treasurer','@president'],
     case when p_transaction_kind='expense' then 'Fund expense recorded' else 'Fund collection updated' end,
     fundrow.name||' · ₹'||to_char(p_amount,'FM999G999G990D00'),'funds','fund_transaction',rid,
     case when p_transaction_kind='expense' and p_amount>=5000 then 'high' else 'normal' end);
 end if;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'network_fund_transaction_recorded',jsonb_build_object('transaction_id',rid,'fund_id',p_fund_id,'kind',p_transaction_kind,'amount',p_amount,'receipt_no',receipt));
 return rid;
end $$;
revoke all on function public.record_network_fund_transaction(uuid,text,numeric,uuid,uuid,uuid,text,text,text,text,date) from public;
grant execute on function public.record_network_fund_transaction(uuid,text,numeric,uuid,uuid,uuid,text,text,text,text,date) to authenticated;

create or replace function public.get_network_funds_snapshot()
returns jsonb
language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.current_network_id(); admin boolean; mode text:='admins'; result jsonb;
begin
 if nid is null or not public.is_network_member(nid) then raise exception 'Network membership required.' using errcode='42501'; end if;
 admin:=public.is_network_admin(nid);
 if exists(select 1 from public.networks where id=nid and vertical_kind='family-association') then
   select coalesce(s.finance_visibility,'admins') into mode from public.family_association_settings s where s.network_id=nid;
 end if;
 result:=jsonb_build_object(
  'is_admin',admin,'visibility_mode',mode,
  'funds',coalesce((select jsonb_agg(jsonb_build_object(
    'id',f.id,'name',f.name,'fund_kind',f.fund_kind,'purpose',f.purpose,'target_amount',f.target_amount,'opening_balance',f.opening_balance,
    'visibility',f.visibility,'status',f.status,'membership_year_id',f.membership_year_id,'activity_id',f.activity_id,
    'activity_title',a.title,'year_label',y.label,
    'collected',coalesce((select sum(t.amount) from public.network_fund_transactions t where t.fund_id=f.id and t.transaction_kind in ('collection','transfer_in')),0),
    'spent',coalesce((select sum(t.amount) from public.network_fund_transactions t where t.fund_id=f.id and t.transaction_kind in ('expense','refund','transfer_out')),0),
    'balance',f.opening_balance+coalesce((select sum(public.e6_fund_signed_amount(t.transaction_kind,t.amount)) from public.network_fund_transactions t where t.fund_id=f.id),0)
   ) order by f.status,f.created_at desc)
   from public.network_funds f left join public.network_activities a on a.id=f.activity_id and a.network_id=f.network_id
   left join public.family_association_membership_years y on y.id=f.membership_year_id and y.network_id=f.network_id
   where f.network_id=nid and (admin or (mode<>'admins' and f.visibility<>'admins'))),'[]'::jsonb),
  'transactions',coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'fund_id',t.fund_id,'fund_name',f.name,'transaction_kind',t.transaction_kind,'amount',t.amount,'signed_amount',public.e6_fund_signed_amount(t.transaction_kind,t.amount),'source_entity_id',t.source_entity_id,'source_label',e.label,'receipt_no',t.receipt_no,'payment_method',t.payment_method,'reference',t.reference,'note',t.note,'visibility',t.visibility,'occurred_on',t.occurred_on,'created_at',t.created_at) order by t.occurred_on desc,t.created_at desc)
   from public.network_fund_transactions t join public.network_funds f on f.id=t.fund_id left join public.network_entities e on e.id=t.source_entity_id and e.network_id=t.network_id
   where t.network_id=nid and (admin or (mode='members' and t.visibility<>'admins') or (mode='highlighted' and t.visibility='highlighted'))),'[]'::jsonb),
  'membership_dues',case when admin then coalesce((select jsonb_agg(jsonb_build_object('membership_id',m.id,'membership_year_id',m.membership_year_id,'year_label',y.label,'family_entity_id',m.family_entity_id,'family_label',f.label,'representative_label',r.label,'amount_due',m.amount_due,'amount_paid',m.amount_paid,'outstanding',greatest(m.amount_due-m.amount_paid,0),'payment_status',m.payment_status,'status',m.status) order by y.start_date desc,f.label)
    from public.family_association_family_memberships m join public.family_association_membership_years y on y.id=m.membership_year_id join public.network_entities f on f.id=m.family_entity_id left join public.network_entities r on r.id=m.representative_entity_id where m.network_id=nid and m.status in ('active','grace','pending')),'[]'::jsonb) else '[]'::jsonb end,
  'events',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'title',a.title,'starts_at',a.starts_at) order by a.starts_at desc nulls last) from public.network_activities a where a.network_id=nid and a.type='event'),'[]'::jsonb)
 );
 return result;
end $$;
revoke all on function public.get_network_funds_snapshot() from public;
grant execute on function public.get_network_funds_snapshot() to authenticated;
