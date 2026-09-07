-- HS-3 — Maintenance, Dues & Finance
-- Additive + rerunnable. Payment gateway/accounting integration intentionally deferred.

create table if not exists public.hs_charge_heads(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 code varchar(60) not null,
 label varchar(180) not null,
 category varchar(40) not null default 'maintenance' check(category in ('maintenance','sinking_fund','repair_fund','parking','water','common_electricity','non_occupancy','special_assessment','other')),
 calculation_mode varchar(24) not null default 'fixed_per_unit' check(calculation_mode in ('fixed_per_unit','manual')),
 default_amount numeric(14,2) not null default 0 check(default_amount>=0),
 taxable boolean not null default false,
 active boolean not null default true,
 metadata jsonb not null default '{}'::jsonb,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(network_id,code)
);

create table if not exists public.hs_billing_cycles(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 label varchar(180) not null,
 period_start date not null, period_end date not null, due_on date not null,
 status varchar(20) not null default 'draft' check(status in ('draft','issued','closed','cancelled')),
 grace_days integer not null default 0 check(grace_days>=0 and grace_days<=90),
 penalty_rate_monthly numeric(7,4) not null default 0 check(penalty_rate_monthly>=0),
 issued_at timestamptz, closed_at timestamptz,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(network_id,period_start,period_end),
 check(period_end>=period_start)
);

create table if not exists public.hs_unit_bills(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 billing_cycle_id uuid not null references public.hs_billing_cycles(id) on delete cascade,
 unit_entity_id uuid not null references public.network_entities(id) on delete cascade,
 subtotal numeric(14,2) not null default 0,
 penalty_amount numeric(14,2) not null default 0,
 adjustment_amount numeric(14,2) not null default 0,
 total_amount numeric(14,2) not null default 0,
 paid_amount numeric(14,2) not null default 0,
 balance_amount numeric(14,2) not null default 0,
 status varchar(20) not null default 'unpaid' check(status in ('unpaid','partial','paid','waived','void')),
 issued_at timestamptz, due_on date not null,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(network_id,billing_cycle_id,unit_entity_id)
);
create index if not exists idx_hs_unit_bills_network_unit on public.hs_unit_bills(network_id,unit_entity_id,due_on desc,status);

create table if not exists public.hs_bill_line_items(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 bill_id uuid not null references public.hs_unit_bills(id) on delete cascade,
 charge_head_id uuid references public.hs_charge_heads(id) on delete set null,
 label varchar(180) not null,
 amount numeric(14,2) not null,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists idx_hs_bill_line_items_bill on public.hs_bill_line_items(network_id,bill_id);

create table if not exists public.hs_bill_adjustments(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 bill_id uuid not null references public.hs_unit_bills(id) on delete cascade,
 adjustment_type varchar(20) not null check(adjustment_type in ('credit','debit','waiver','penalty')),
 amount numeric(14,2) not null check(amount>=0),
 reason text not null,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);

create table if not exists public.hs_payments(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 bill_id uuid not null references public.hs_unit_bills(id) on delete cascade,
 unit_entity_id uuid not null references public.network_entities(id) on delete cascade,
 amount numeric(14,2) not null check(amount>0),
 paid_on date not null default current_date,
 payment_mode varchar(30) not null default 'manual' check(payment_mode in ('manual','cash','cheque','bank_transfer','upi','other')),
 payment_reference varchar(180),
 receipt_number varchar(120),
 notes text,
 status varchar(20) not null default 'recorded' check(status in ('recorded','reversed')),
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), reversed_at timestamptz
);
create index if not exists idx_hs_payments_network_unit on public.hs_payments(network_id,unit_entity_id,paid_on desc);

create table if not exists public.hs_funds(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 code varchar(60) not null,
 label varchar(180) not null,
 opening_balance numeric(16,2) not null default 0,
 current_balance numeric(16,2) not null default 0,
 visibility varchar(20) not null default 'members' check(visibility in ('admin','members')),
 active boolean not null default true,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(network_id,code)
);

create table if not exists public.hs_budget_lines(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 financial_year varchar(12) not null,
 category varchar(100) not null,
 label varchar(180) not null,
 budget_amount numeric(16,2) not null default 0,
 visibility varchar(20) not null default 'members' check(visibility in ('admin','members')),
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(network_id,financial_year,category,label)
);

create table if not exists public.hs_expenses(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 fund_id uuid references public.hs_funds(id) on delete set null,
 vendor_id uuid references public.hs_vendors(id) on delete set null,
 category varchar(100) not null,
 description varchar(260) not null,
 amount numeric(16,2) not null check(amount>0),
 incurred_on date not null default current_date,
 payment_reference varchar(180),
 visibility varchar(20) not null default 'members' check(visibility in ('admin','members')),
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);
create index if not exists idx_hs_expenses_network_date on public.hs_expenses(network_id,incurred_on desc,category);

alter table public.hs_charge_heads enable row level security;
alter table public.hs_billing_cycles enable row level security;
alter table public.hs_unit_bills enable row level security;
alter table public.hs_bill_line_items enable row level security;
alter table public.hs_bill_adjustments enable row level security;
alter table public.hs_payments enable row level security;
alter table public.hs_funds enable row level security;
alter table public.hs_budget_lines enable row level security;
alter table public.hs_expenses enable row level security;

do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_charge_heads' and policyname='hs_charge_heads_member_read') then create policy hs_charge_heads_member_read on public.hs_charge_heads for select using(public.is_network_member(network_id)); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_billing_cycles' and policyname='hs_billing_cycles_member_read') then create policy hs_billing_cycles_member_read on public.hs_billing_cycles for select using(public.is_network_member(network_id)); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_unit_bills' and policyname='hs_unit_bills_scoped_read') then create policy hs_unit_bills_scoped_read on public.hs_unit_bills for select using(public.is_network_admin(network_id) or exists(select 1 from public.hs_unit_occupancy_history o join public.network_entities p on p.id=o.subject_entity_id where o.network_id=hs_unit_bills.network_id and o.unit_entity_id=hs_unit_bills.unit_entity_id and o.ends_on is null and p.owner_user_id=auth.uid())); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_bill_line_items' and policyname='hs_bill_line_items_scoped_read') then create policy hs_bill_line_items_scoped_read on public.hs_bill_line_items for select using(exists(select 1 from public.hs_unit_bills b where b.id=bill_id and b.network_id=network_id and (public.is_network_admin(b.network_id) or exists(select 1 from public.hs_unit_occupancy_history o join public.network_entities p on p.id=o.subject_entity_id where o.network_id=b.network_id and o.unit_entity_id=b.unit_entity_id and o.ends_on is null and p.owner_user_id=auth.uid())))); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_bill_adjustments' and policyname='hs_bill_adjustments_scoped_read') then create policy hs_bill_adjustments_scoped_read on public.hs_bill_adjustments for select using(exists(select 1 from public.hs_unit_bills b where b.id=bill_id and b.network_id=network_id and (public.is_network_admin(b.network_id) or exists(select 1 from public.hs_unit_occupancy_history o join public.network_entities p on p.id=o.subject_entity_id where o.network_id=b.network_id and o.unit_entity_id=b.unit_entity_id and o.ends_on is null and p.owner_user_id=auth.uid())))); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_payments' and policyname='hs_payments_scoped_read') then create policy hs_payments_scoped_read on public.hs_payments for select using(public.is_network_admin(network_id) or exists(select 1 from public.hs_unit_occupancy_history o join public.network_entities p on p.id=o.subject_entity_id where o.network_id=hs_payments.network_id and o.unit_entity_id=hs_payments.unit_entity_id and o.ends_on is null and p.owner_user_id=auth.uid())); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_funds' and policyname='hs_funds_visibility_read') then create policy hs_funds_visibility_read on public.hs_funds for select using(public.is_network_admin(network_id) or (visibility='members' and public.is_network_member(network_id))); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_budget_lines' and policyname='hs_budget_visibility_read') then create policy hs_budget_visibility_read on public.hs_budget_lines for select using(public.is_network_admin(network_id) or (visibility='members' and public.is_network_member(network_id))); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_expenses' and policyname='hs_expenses_visibility_read') then create policy hs_expenses_visibility_read on public.hs_expenses for select using(public.is_network_admin(network_id) or (visibility='members' and public.is_network_member(network_id))); end if;
end $$;

create or replace function public.hs3_assert_network() returns uuid language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
 if nid is null or not public.is_network_member(nid) then raise exception 'Housing Society membership required.' using errcode='42501'; end if;
 if coalesce((select vertical_kind from public.networks where id=nid),'')<>'housing-society' then raise exception 'HS-3 is available only for housing-society networks.' using errcode='22023'; end if;
 return nid;
end $$;
revoke all on function public.hs3_assert_network() from public; grant execute on function public.hs3_assert_network() to authenticated;

create or replace function public.hs3_recalculate_bill(p_bill_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare nid uuid; sub numeric; adj numeric; paid numeric; total numeric; bal numeric; st text;
begin
 select network_id into nid from public.hs_unit_bills where id=p_bill_id;
 if nid is null then raise exception 'Bill not found.'; end if;
 sub:=coalesce((select sum(amount) from public.hs_bill_line_items where bill_id=p_bill_id and network_id=nid),0);
 adj:=coalesce((select sum(case when adjustment_type in ('credit','waiver') then -amount else amount end) from public.hs_bill_adjustments where bill_id=p_bill_id and network_id=nid),0);
 paid:=coalesce((select sum(case when status='recorded' then amount else 0 end) from public.hs_payments where bill_id=p_bill_id and network_id=nid),0);
 total:=greatest(sub+adj,0); bal:=greatest(total-paid,0);
 st:=case when total=0 and exists(select 1 from public.hs_bill_adjustments where bill_id=p_bill_id and adjustment_type='waiver') then 'waived' when bal=0 then 'paid' when paid>0 then 'partial' else 'unpaid' end;
 update public.hs_unit_bills set subtotal=sub,adjustment_amount=adj,total_amount=total,paid_amount=paid,balance_amount=bal,status=st,updated_at=now() where id=p_bill_id;
end $$;
revoke all on function public.hs3_recalculate_bill(uuid) from public; grant execute on function public.hs3_recalculate_bill(uuid) to authenticated;

create or replace function public.hs3_upsert_charge_head(p_id uuid,p_code text,p_label text,p_category text,p_default_amount numeric,p_active boolean default true) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs3_assert_network(); rid uuid;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 if p_default_amount<0 then raise exception 'Charge amount cannot be negative.'; end if;
 if p_id is null then insert into public.hs_charge_heads(network_id,code,label,category,default_amount,active,created_by) values(nid,upper(trim(p_code)),trim(p_label),p_category,p_default_amount,p_active,auth.uid()) on conflict(network_id,code) do update set label=excluded.label,category=excluded.category,default_amount=excluded.default_amount,active=excluded.active,updated_at=now() returning id into rid;
 else update public.hs_charge_heads set code=upper(trim(p_code)),label=trim(p_label),category=p_category,default_amount=p_default_amount,active=p_active,updated_at=now() where id=p_id and network_id=nid returning id into rid; end if;
 return rid;
end $$;
revoke all on function public.hs3_upsert_charge_head(uuid,text,text,text,numeric,boolean) from public; grant execute on function public.hs3_upsert_charge_head(uuid,text,text,text,numeric,boolean) to authenticated;

create or replace function public.hs3_create_billing_cycle(p_label text,p_period_start date,p_period_end date,p_due_on date,p_grace_days integer default 0,p_penalty_rate_monthly numeric default 0) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs3_assert_network(); rid uuid;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 if p_period_end<p_period_start or p_due_on<p_period_start then raise exception 'Invalid billing dates.'; end if;
 insert into public.hs_billing_cycles(network_id,label,period_start,period_end,due_on,grace_days,penalty_rate_monthly,created_by) values(nid,trim(p_label),p_period_start,p_period_end,p_due_on,greatest(coalesce(p_grace_days,0),0),greatest(coalesce(p_penalty_rate_monthly,0),0),auth.uid()) on conflict(network_id,period_start,period_end) do update set label=excluded.label,due_on=excluded.due_on,grace_days=excluded.grace_days,penalty_rate_monthly=excluded.penalty_rate_monthly,updated_at=now() returning id into rid;
 return rid;
end $$;
revoke all on function public.hs3_create_billing_cycle(text,date,date,date,integer,numeric) from public; grant execute on function public.hs3_create_billing_cycle(text,date,date,date,integer,numeric) to authenticated;

create or replace function public.hs3_generate_cycle_bills(p_cycle_id uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs3_assert_network(); cyc public.hs_billing_cycles%rowtype; u record; h record; bid uuid; created_count int:=0; head_count int:=0;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 select * into cyc from public.hs_billing_cycles where id=p_cycle_id and network_id=nid;
 if cyc.id is null then raise exception 'Billing cycle not found.'; end if;
 if cyc.status='cancelled' then raise exception 'Cancelled cycle cannot be generated.'; end if;
 select count(*) into head_count from public.hs_charge_heads where network_id=nid and active and calculation_mode='fixed_per_unit';
 if head_count=0 then raise exception 'Create at least one active fixed charge head before generating bills.'; end if;
 for u in select id,label from public.network_entities where network_id=nid and kind='unit' loop
  insert into public.hs_unit_bills(network_id,billing_cycle_id,unit_entity_id,due_on,issued_at,created_by) values(nid,p_cycle_id,u.id,cyc.due_on,now(),auth.uid()) on conflict(network_id,billing_cycle_id,unit_entity_id) do update set due_on=excluded.due_on,issued_at=coalesce(public.hs_unit_bills.issued_at,excluded.issued_at),updated_at=now() returning id into bid;
  delete from public.hs_bill_line_items where bill_id=bid and network_id=nid;
  for h in select id,label,default_amount,category from public.hs_charge_heads where network_id=nid and active and calculation_mode='fixed_per_unit' order by label loop
   insert into public.hs_bill_line_items(network_id,bill_id,charge_head_id,label,amount,metadata) values(nid,bid,h.id,h.label,h.default_amount,jsonb_build_object('category',h.category));
  end loop;
  perform public.hs3_recalculate_bill(bid); created_count:=created_count+1;
 end loop;
 update public.hs_billing_cycles set status='issued',issued_at=coalesce(issued_at,now()),updated_at=now() where id=p_cycle_id;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'hs3_billing_cycle_issued',jsonb_build_object('cycle_id',p_cycle_id,'unit_count',created_count,'charge_head_count',head_count));
 return jsonb_build_object('cycleId',p_cycle_id,'unitCount',created_count,'chargeHeadCount',head_count);
end $$;
revoke all on function public.hs3_generate_cycle_bills(uuid) from public; grant execute on function public.hs3_generate_cycle_bills(uuid) to authenticated;

create or replace function public.hs3_add_bill_adjustment(p_bill_id uuid,p_type text,p_amount numeric,p_reason text) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs3_assert_network(); rid uuid;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 if p_type not in ('credit','debit','waiver','penalty') or p_amount<0 then raise exception 'Invalid adjustment.'; end if;
 if not exists(select 1 from public.hs_unit_bills where id=p_bill_id and network_id=nid) then raise exception 'Bill not found.'; end if;
 insert into public.hs_bill_adjustments(network_id,bill_id,adjustment_type,amount,reason,created_by) values(nid,p_bill_id,p_type,p_amount,trim(p_reason),auth.uid()) returning id into rid;
 perform public.hs3_recalculate_bill(p_bill_id); return rid;
end $$;
revoke all on function public.hs3_add_bill_adjustment(uuid,text,numeric,text) from public; grant execute on function public.hs3_add_bill_adjustment(uuid,text,numeric,text) to authenticated;

create or replace function public.hs3_record_payment(p_bill_id uuid,p_amount numeric,p_paid_on date default current_date,p_payment_mode text default 'manual',p_payment_reference text default null,p_receipt_number text default null,p_notes text default null) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs3_assert_network(); rid uuid; uid uuid;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 if p_amount<=0 then raise exception 'Payment amount must be positive.'; end if;
 select unit_entity_id into uid from public.hs_unit_bills where id=p_bill_id and network_id=nid;
 if uid is null then raise exception 'Bill not found.'; end if;
 insert into public.hs_payments(network_id,bill_id,unit_entity_id,amount,paid_on,payment_mode,payment_reference,receipt_number,notes,created_by) values(nid,p_bill_id,uid,p_amount,coalesce(p_paid_on,current_date),p_payment_mode,nullif(trim(p_payment_reference),''),nullif(trim(p_receipt_number),''),nullif(trim(p_notes),''),auth.uid()) returning id into rid;
 perform public.hs3_recalculate_bill(p_bill_id);
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'hs3_payment_recorded',jsonb_build_object('payment_id',rid,'bill_id',p_bill_id,'amount',p_amount)); return rid;
end $$;
revoke all on function public.hs3_record_payment(uuid,numeric,date,text,text,text,text) from public; grant execute on function public.hs3_record_payment(uuid,numeric,date,text,text,text,text) to authenticated;

create or replace function public.hs3_upsert_fund(p_id uuid,p_code text,p_label text,p_opening_balance numeric default 0,p_visibility text default 'members') returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs3_assert_network(); rid uuid;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 if p_visibility not in ('admin','members') then raise exception 'Invalid visibility.'; end if;
 if p_id is null then insert into public.hs_funds(network_id,code,label,opening_balance,current_balance,visibility,created_by) values(nid,upper(trim(p_code)),trim(p_label),p_opening_balance,p_opening_balance,p_visibility,auth.uid()) on conflict(network_id,code) do update set label=excluded.label,visibility=excluded.visibility,updated_at=now() returning id into rid;
 else update public.hs_funds set code=upper(trim(p_code)),label=trim(p_label),visibility=p_visibility,updated_at=now() where id=p_id and network_id=nid returning id into rid; end if; return rid;
end $$;
revoke all on function public.hs3_upsert_fund(uuid,text,text,numeric,text) from public; grant execute on function public.hs3_upsert_fund(uuid,text,text,numeric,text) to authenticated;

create or replace function public.hs3_upsert_budget_line(p_financial_year text,p_category text,p_label text,p_budget_amount numeric,p_visibility text default 'members') returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs3_assert_network(); rid uuid;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 insert into public.hs_budget_lines(network_id,financial_year,category,label,budget_amount,visibility,created_by) values(nid,trim(p_financial_year),trim(p_category),trim(p_label),p_budget_amount,p_visibility,auth.uid()) on conflict(network_id,financial_year,category,label) do update set budget_amount=excluded.budget_amount,visibility=excluded.visibility,updated_at=now() returning id into rid; return rid;
end $$;
revoke all on function public.hs3_upsert_budget_line(text,text,text,numeric,text) from public; grant execute on function public.hs3_upsert_budget_line(text,text,text,numeric,text) to authenticated;

create or replace function public.hs3_record_expense(p_category text,p_description text,p_amount numeric,p_incurred_on date default current_date,p_fund_id uuid default null,p_vendor_id uuid default null,p_payment_reference text default null,p_visibility text default 'members') returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs3_assert_network(); rid uuid;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 insert into public.hs_expenses(network_id,fund_id,vendor_id,category,description,amount,incurred_on,payment_reference,visibility,created_by) values(nid,p_fund_id,p_vendor_id,trim(p_category),trim(p_description),p_amount,coalesce(p_incurred_on,current_date),nullif(trim(p_payment_reference),''),p_visibility,auth.uid()) returning id into rid;
 if p_fund_id is not null then update public.hs_funds set current_balance=current_balance-p_amount,updated_at=now() where id=p_fund_id and network_id=nid; end if;
 return rid;
end $$;
revoke all on function public.hs3_record_expense(text,text,numeric,date,uuid,uuid,text,text) from public; grant execute on function public.hs3_record_expense(text,text,numeric,date,uuid,uuid,text,text) to authenticated;

create or replace function public.hs3_get_finance_snapshot() returns jsonb language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.hs3_assert_network(); isadm boolean:=public.is_network_admin(nid);
begin
 return jsonb_build_object(
  'chargeHeads',case when isadm then coalesce((select jsonb_agg(jsonb_build_object('id',h.id,'code',h.code,'label',h.label,'category',h.category,'amount',h.default_amount,'active',h.active) order by h.label) from public.hs_charge_heads h where h.network_id=nid),'[]'::jsonb) else '[]'::jsonb end,
  'cycles',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'label',c.label,'periodStart',c.period_start,'periodEnd',c.period_end,'dueOn',c.due_on,'status',c.status,'graceDays',c.grace_days,'penaltyRateMonthly',c.penalty_rate_monthly) order by c.period_start desc) from public.hs_billing_cycles c where c.network_id=nid),'[]'::jsonb),
  'bills',coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'cycleId',b.billing_cycle_id,'cycleLabel',c.label,'unitEntityId',b.unit_entity_id,'unitLabel',u.label,'dueOn',b.due_on,'subtotal',b.subtotal,'adjustmentAmount',b.adjustment_amount,'totalAmount',b.total_amount,'paidAmount',b.paid_amount,'balanceAmount',b.balance_amount,'status',b.status,'lineItems',coalesce((select jsonb_agg(jsonb_build_object('id',li.id,'label',li.label,'amount',li.amount) order by li.created_at) from public.hs_bill_line_items li where li.bill_id=b.id),'[]'::jsonb),'payments',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'amount',p.amount,'paidOn',p.paid_on,'paymentMode',p.payment_mode,'paymentReference',p.payment_reference,'receiptNumber',p.receipt_number,'status',p.status) order by p.paid_on desc,p.created_at desc) from public.hs_payments p where p.bill_id=b.id),'[]'::jsonb)) order by b.due_on desc,u.label) from public.hs_unit_bills b join public.hs_billing_cycles c on c.id=b.billing_cycle_id join public.network_entities u on u.id=b.unit_entity_id where b.network_id=nid and (isadm or exists(select 1 from public.hs_unit_occupancy_history o join public.network_entities p on p.id=o.subject_entity_id where o.network_id=nid and o.unit_entity_id=b.unit_entity_id and o.ends_on is null and p.owner_user_id=auth.uid()))),'[]'::jsonb),
  'funds',coalesce((select jsonb_agg(jsonb_build_object('id',f.id,'code',f.code,'label',f.label,'openingBalance',f.opening_balance,'currentBalance',f.current_balance,'visibility',f.visibility) order by f.label) from public.hs_funds f where f.network_id=nid and (isadm or f.visibility='members')),'[]'::jsonb),
  'budget',coalesce((select jsonb_agg(jsonb_build_object('id',bl.id,'financialYear',bl.financial_year,'category',bl.category,'label',bl.label,'budgetAmount',bl.budget_amount,'actualAmount',coalesce((select sum(e.amount) from public.hs_expenses e where e.network_id=nid and e.category=bl.category and e.visibility=case when isadm then e.visibility else 'members' end),0),'visibility',bl.visibility) order by bl.financial_year desc,bl.category,bl.label) from public.hs_budget_lines bl where bl.network_id=nid and (isadm or bl.visibility='members')),'[]'::jsonb),
  'summary',jsonb_build_object('totalBilled',coalesce((select sum(total_amount) from public.hs_unit_bills where network_id=nid),0),'totalCollected',coalesce((select sum(amount) from public.hs_payments where network_id=nid and status='recorded'),0),'totalOutstanding',coalesce((select sum(balance_amount) from public.hs_unit_bills where network_id=nid and status not in ('paid','waived','void')),0),'overdueBills',coalesce((select count(*) from public.hs_unit_bills where network_id=nid and balance_amount>0 and due_on<current_date),0))
 );
end $$;
revoke all on function public.hs3_get_finance_snapshot() from public; grant execute on function public.hs3_get_finance_snapshot() to authenticated;

insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind) values
 ('housing-society.finance.maintenance','core','released','{}'::uuid[],'housing-society'),
 ('housing-society.finance.charge-heads','admin','released','{}'::uuid[],'housing-society'),
 ('housing-society.finance.budget','admin','released','{}'::uuid[],'housing-society')
on conflict(feature_key) do update set bundle_key=excluded.bundle_key,rollout_state=excluded.rollout_state,vertical_kind=excluded.vertical_kind;

do $$ begin
 if to_regclass('public.hs_charge_heads') is null or to_regclass('public.hs_billing_cycles') is null or to_regclass('public.hs_unit_bills') is null or to_regclass('public.hs_payments') is null or to_regclass('public.hs_funds') is null then raise exception 'HS-3 compatibility check failed: finance tables missing.'; end if;
 if to_regprocedure('public.hs3_get_finance_snapshot()') is null or to_regprocedure('public.hs3_generate_cycle_bills(uuid)') is null or to_regprocedure('public.hs3_record_payment(uuid,numeric,date,text,text,text,text)') is null then raise exception 'HS-3 compatibility check failed: finance RPCs missing.'; end if;
end $$;
