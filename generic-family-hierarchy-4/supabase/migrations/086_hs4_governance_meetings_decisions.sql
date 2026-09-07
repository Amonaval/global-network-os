-- HS-4 — Governance, Meetings & Decisions
-- Additive + rerunnable. This is controlled governance history, not an election-grade secret-ballot engine.

create table if not exists public.hs_committee_terms(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 label varchar(180) not null,
 starts_on date not null,
 ends_on date,
 status varchar(20) not null default 'active' check(status in ('planned','active','completed','cancelled')),
 notes text,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(network_id,label,starts_on),
 check(ends_on is null or ends_on>=starts_on)
);

create table if not exists public.hs_committee_assignments(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 term_id uuid not null references public.hs_committee_terms(id) on delete cascade,
 person_entity_id uuid not null references public.network_entities(id) on delete cascade,
 role_key varchar(40) not null check(role_key in ('chairperson','secretary','treasurer','committee_member','manager','auditor','other')),
 role_label varchar(120),
 starts_on date not null,
 ends_on date,
 notes text,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 check(ends_on is null or ends_on>=starts_on)
);
create index if not exists idx_hs_committee_assignments_term on public.hs_committee_assignments(network_id,term_id,starts_on desc);

create table if not exists public.hs_governance_meetings(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 meeting_type varchar(24) not null default 'committee' check(meeting_type in ('committee','agm','sgm','general','other')),
 title varchar(220) not null,
 scheduled_at timestamptz not null,
 location varchar(220),
 status varchar(20) not null default 'scheduled' check(status in ('draft','scheduled','completed','cancelled')),
 quorum_required integer check(quorum_required is null or quorum_required>=0),
 attendee_count integer check(attendee_count is null or attendee_count>=0),
 minutes_text text,
 minutes_published_at timestamptz,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists idx_hs_governance_meetings_network_date on public.hs_governance_meetings(network_id,scheduled_at desc);

create table if not exists public.hs_meeting_agenda_items(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 meeting_id uuid not null references public.hs_governance_meetings(id) on delete cascade,
 item_order integer not null default 1 check(item_order>0),
 title varchar(220) not null,
 description text,
 outcome_text text,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(meeting_id,item_order)
);

create table if not exists public.hs_governance_action_items(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 meeting_id uuid references public.hs_governance_meetings(id) on delete set null,
 agenda_item_id uuid references public.hs_meeting_agenda_items(id) on delete set null,
 title varchar(220) not null,
 owner_user_id uuid references auth.users(id) on delete set null,
 owner_label varchar(160),
 due_on date,
 status varchar(20) not null default 'open' check(status in ('open','in_progress','done','cancelled')),
 completion_note text,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), completed_at timestamptz
);
create index if not exists idx_hs_governance_actions on public.hs_governance_action_items(network_id,status,due_on);

create table if not exists public.hs_resolutions(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 meeting_id uuid references public.hs_governance_meetings(id) on delete set null,
 resolution_number varchar(80),
 title varchar(240) not null,
 body text not null,
 vote_mode varchar(20) not null default 'approval' check(vote_mode in ('advisory','approval')),
 status varchar(20) not null default 'draft' check(status in ('draft','open','approved','rejected','withdrawn','closed')),
 opens_at timestamptz,
 closes_at timestamptz,
 quorum_percent numeric(5,2) not null default 0 check(quorum_percent>=0 and quorum_percent<=100),
 result_note text,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), closed_at timestamptz,
 unique(network_id,resolution_number),
 check(closes_at is null or opens_at is null or closes_at>=opens_at)
);
create index if not exists idx_hs_resolutions_network_status on public.hs_resolutions(network_id,status,created_at desc);

create table if not exists public.hs_resolution_votes(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 resolution_id uuid not null references public.hs_resolutions(id) on delete cascade,
 voter_user_id uuid not null references auth.users(id) on delete cascade,
 choice varchar(12) not null check(choice in ('yes','no','abstain')),
 cast_at timestamptz not null default now(),
 unique(resolution_id,voter_user_id)
);

create table if not exists public.hs_governance_documents(
 id uuid primary key default gen_random_uuid(),
 network_id uuid not null references public.networks(id) on delete cascade,
 meeting_id uuid references public.hs_governance_meetings(id) on delete set null,
 resolution_id uuid references public.hs_resolutions(id) on delete set null,
 document_type varchar(40) not null default 'minutes' check(document_type in ('agenda','minutes','resolution','notice','supporting','other')),
 title varchar(220) not null,
 version_label varchar(80),
 document_url text,
 visibility varchar(20) not null default 'members' check(visibility in ('admin','members')),
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);

alter table public.hs_committee_terms enable row level security;
alter table public.hs_committee_assignments enable row level security;
alter table public.hs_governance_meetings enable row level security;
alter table public.hs_meeting_agenda_items enable row level security;
alter table public.hs_governance_action_items enable row level security;
alter table public.hs_resolutions enable row level security;
alter table public.hs_resolution_votes enable row level security;
alter table public.hs_governance_documents enable row level security;

do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_committee_terms' and policyname='hs_committee_terms_member_read') then create policy hs_committee_terms_member_read on public.hs_committee_terms for select using(public.is_network_member(network_id)); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_committee_assignments' and policyname='hs_committee_assignments_member_read') then create policy hs_committee_assignments_member_read on public.hs_committee_assignments for select using(public.is_network_member(network_id)); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_governance_meetings' and policyname='hs_governance_meetings_member_read') then create policy hs_governance_meetings_member_read on public.hs_governance_meetings for select using(public.is_network_member(network_id)); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_meeting_agenda_items' and policyname='hs_meeting_agenda_member_read') then create policy hs_meeting_agenda_member_read on public.hs_meeting_agenda_items for select using(public.is_network_member(network_id)); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_governance_action_items' and policyname='hs_governance_actions_member_read') then create policy hs_governance_actions_member_read on public.hs_governance_action_items for select using(public.is_network_member(network_id)); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_resolutions' and policyname='hs_resolutions_member_read') then create policy hs_resolutions_member_read on public.hs_resolutions for select using(public.is_network_member(network_id)); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_resolution_votes' and policyname='hs_resolution_votes_member_read') then create policy hs_resolution_votes_member_read on public.hs_resolution_votes for select using(public.is_network_member(network_id)); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='hs_governance_documents' and policyname='hs_governance_documents_visibility_read') then create policy hs_governance_documents_visibility_read on public.hs_governance_documents for select using(public.is_network_admin(network_id) or (visibility='members' and public.is_network_member(network_id))); end if;
end $$;

create or replace function public.hs4_assert_network() returns uuid language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
 if nid is null or not public.is_network_member(nid) then raise exception 'Housing Society membership required.' using errcode='42501'; end if;
 if coalesce((select vertical_kind from public.networks where id=nid),'')<>'housing-society' then raise exception 'HS-4 is available only for housing-society networks.' using errcode='22023'; end if;
 return nid;
end $$;
revoke all on function public.hs4_assert_network() from public; grant execute on function public.hs4_assert_network() to authenticated;

create or replace function public.hs4_get_governance_snapshot() returns jsonb language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.hs4_assert_network();
begin
 return jsonb_build_object(
  'terms',coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'label',t.label,'startsOn',t.starts_on,'endsOn',t.ends_on,'status',t.status,'notes',t.notes,'assignments',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'personEntityId',a.person_entity_id,'personLabel',p.label,'roleKey',a.role_key,'roleLabel',a.role_label,'startsOn',a.starts_on,'endsOn',a.ends_on) order by a.starts_on desc,p.label) from public.hs_committee_assignments a join public.network_entities p on p.id=a.person_entity_id where a.term_id=t.id),'[]'::jsonb)) order by t.starts_on desc) from public.hs_committee_terms t where t.network_id=nid),'[]'::jsonb),
  'meetings',coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'meetingType',m.meeting_type,'title',m.title,'scheduledAt',m.scheduled_at,'location',m.location,'status',m.status,'quorumRequired',m.quorum_required,'attendeeCount',m.attendee_count,'minutesText',m.minutes_text,'minutesPublishedAt',m.minutes_published_at,'agenda',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'itemOrder',a.item_order,'title',a.title,'description',a.description,'outcomeText',a.outcome_text) order by a.item_order) from public.hs_meeting_agenda_items a where a.meeting_id=m.id),'[]'::jsonb)) order by m.scheduled_at desc) from public.hs_governance_meetings m where m.network_id=nid),'[]'::jsonb),
  'actions',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'meetingId',a.meeting_id,'title',a.title,'ownerLabel',a.owner_label,'dueOn',a.due_on,'status',a.status,'completionNote',a.completion_note) order by case when a.status='done' then 1 else 0 end,a.due_on nulls last,a.created_at desc) from public.hs_governance_action_items a where a.network_id=nid),'[]'::jsonb),
  'resolutions',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'meetingId',r.meeting_id,'resolutionNumber',r.resolution_number,'title',r.title,'body',r.body,'voteMode',r.vote_mode,'status',r.status,'opensAt',r.opens_at,'closesAt',r.closes_at,'quorumPercent',r.quorum_percent,'resultNote',r.result_note,'yesCount',(select count(*) from public.hs_resolution_votes v where v.resolution_id=r.id and v.choice='yes'),'noCount',(select count(*) from public.hs_resolution_votes v where v.resolution_id=r.id and v.choice='no'),'abstainCount',(select count(*) from public.hs_resolution_votes v where v.resolution_id=r.id and v.choice='abstain'),'myVote',(select v.choice from public.hs_resolution_votes v where v.resolution_id=r.id and v.voter_user_id=auth.uid())) order by r.created_at desc) from public.hs_resolutions r where r.network_id=nid),'[]'::jsonb),
  'documents',coalesce((select jsonb_agg(jsonb_build_object('id',d.id,'meetingId',d.meeting_id,'resolutionId',d.resolution_id,'documentType',d.document_type,'title',d.title,'versionLabel',d.version_label,'documentUrl',d.document_url,'visibility',d.visibility,'createdAt',d.created_at) order by d.created_at desc) from public.hs_governance_documents d where d.network_id=nid and (public.is_network_admin(nid) or d.visibility='members')),'[]'::jsonb)
 );
end $$;
revoke all on function public.hs4_get_governance_snapshot() from public; grant execute on function public.hs4_get_governance_snapshot() to authenticated;

create or replace function public.hs4_create_committee_term(p_label text,p_starts_on date,p_ends_on date default null,p_notes text default null) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs4_assert_network(); rid uuid;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 insert into public.hs_committee_terms(network_id,label,starts_on,ends_on,status,notes,created_by) values(nid,trim(p_label),p_starts_on,p_ends_on,case when p_starts_on<=current_date and (p_ends_on is null or p_ends_on>=current_date) then 'active' else 'planned' end,nullif(trim(p_notes),''),auth.uid()) on conflict(network_id,label,starts_on) do update set ends_on=excluded.ends_on,notes=excluded.notes,updated_at=now() returning id into rid; return rid;
end $$;
revoke all on function public.hs4_create_committee_term(text,date,date,text) from public; grant execute on function public.hs4_create_committee_term(text,date,date,text) to authenticated;

create or replace function public.hs4_assign_committee_role(p_term_id uuid,p_person_entity_id uuid,p_role_key text,p_role_label text default null,p_starts_on date default current_date,p_ends_on date default null) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs4_assert_network(); rid uuid;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 if p_role_key not in ('chairperson','secretary','treasurer','committee_member','manager','auditor','other') then raise exception 'Invalid committee role.'; end if;
 if not exists(select 1 from public.hs_committee_terms where id=p_term_id and network_id=nid) then raise exception 'Committee term not found.'; end if;
 if not exists(select 1 from public.network_entities where id=p_person_entity_id and network_id=nid and kind='person') then raise exception 'Resident person not found.'; end if;
 insert into public.hs_committee_assignments(network_id,term_id,person_entity_id,role_key,role_label,starts_on,ends_on,created_by) values(nid,p_term_id,p_person_entity_id,p_role_key,nullif(trim(p_role_label),''),p_starts_on,p_ends_on,auth.uid()) returning id into rid;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'hs4_committee_role_assigned',jsonb_build_object('assignment_id',rid,'role',p_role_key,'person_entity_id',p_person_entity_id)); return rid;
end $$;
revoke all on function public.hs4_assign_committee_role(uuid,uuid,text,text,date,date) from public; grant execute on function public.hs4_assign_committee_role(uuid,uuid,text,text,date,date) to authenticated;

create or replace function public.hs4_create_meeting(p_meeting_type text,p_title text,p_scheduled_at timestamptz,p_location text default null,p_quorum_required integer default null) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs4_assert_network(); rid uuid;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 if p_meeting_type not in ('committee','agm','sgm','general','other') then raise exception 'Invalid meeting type.'; end if;
 insert into public.hs_governance_meetings(network_id,meeting_type,title,scheduled_at,location,quorum_required,status,created_by) values(nid,p_meeting_type,trim(p_title),p_scheduled_at,nullif(trim(p_location),''),p_quorum_required,'scheduled',auth.uid()) returning id into rid; return rid;
end $$;
revoke all on function public.hs4_create_meeting(text,text,timestamptz,text,integer) from public; grant execute on function public.hs4_create_meeting(text,text,timestamptz,text,integer) to authenticated;

create or replace function public.hs4_add_agenda_item(p_meeting_id uuid,p_title text,p_description text default null) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs4_assert_network(); rid uuid; ord integer;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 if not exists(select 1 from public.hs_governance_meetings where id=p_meeting_id and network_id=nid) then raise exception 'Meeting not found.'; end if;
 select coalesce(max(item_order),0)+1 into ord from public.hs_meeting_agenda_items where meeting_id=p_meeting_id;
 insert into public.hs_meeting_agenda_items(network_id,meeting_id,item_order,title,description,created_by) values(nid,p_meeting_id,ord,trim(p_title),nullif(trim(p_description),''),auth.uid()) returning id into rid; return rid;
end $$;
revoke all on function public.hs4_add_agenda_item(uuid,text,text) from public; grant execute on function public.hs4_add_agenda_item(uuid,text,text) to authenticated;

create or replace function public.hs4_publish_minutes(p_meeting_id uuid,p_minutes text,p_attendee_count integer default null) returns void language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs4_assert_network();
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 update public.hs_governance_meetings set minutes_text=trim(p_minutes),attendee_count=p_attendee_count,status='completed',minutes_published_at=now(),updated_at=now() where id=p_meeting_id and network_id=nid;
 if not found then raise exception 'Meeting not found.'; end if;
end $$;
revoke all on function public.hs4_publish_minutes(uuid,text,integer) from public; grant execute on function public.hs4_publish_minutes(uuid,text,integer) to authenticated;

create or replace function public.hs4_create_action_item(p_meeting_id uuid,p_title text,p_owner_label text default null,p_due_on date default null) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs4_assert_network(); rid uuid;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 if p_meeting_id is not null and not exists(select 1 from public.hs_governance_meetings where id=p_meeting_id and network_id=nid) then raise exception 'Meeting not found.'; end if;
 insert into public.hs_governance_action_items(network_id,meeting_id,title,owner_label,due_on,created_by) values(nid,p_meeting_id,trim(p_title),nullif(trim(p_owner_label),''),p_due_on,auth.uid()) returning id into rid; return rid;
end $$;
revoke all on function public.hs4_create_action_item(uuid,text,text,date) from public; grant execute on function public.hs4_create_action_item(uuid,text,text,date) to authenticated;

create or replace function public.hs4_update_action_item(p_action_id uuid,p_status text,p_completion_note text default null) returns void language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs4_assert_network();
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 if p_status not in ('open','in_progress','done','cancelled') then raise exception 'Invalid action status.'; end if;
 update public.hs_governance_action_items set status=p_status,completion_note=nullif(trim(p_completion_note),''),completed_at=case when p_status='done' then now() else null end,updated_at=now() where id=p_action_id and network_id=nid;
 if not found then raise exception 'Action item not found.'; end if;
end $$;
revoke all on function public.hs4_update_action_item(uuid,text,text) from public; grant execute on function public.hs4_update_action_item(uuid,text,text) to authenticated;

create or replace function public.hs4_create_resolution(p_meeting_id uuid,p_resolution_number text,p_title text,p_body text,p_vote_mode text default 'approval',p_opens_at timestamptz default now(),p_closes_at timestamptz default null,p_quorum_percent numeric default 0) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs4_assert_network(); rid uuid;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 if p_vote_mode not in ('advisory','approval') then raise exception 'Invalid vote mode.'; end if;
 insert into public.hs_resolutions(network_id,meeting_id,resolution_number,title,body,vote_mode,status,opens_at,closes_at,quorum_percent,created_by) values(nid,p_meeting_id,nullif(trim(p_resolution_number),''),trim(p_title),trim(p_body),p_vote_mode,'open',coalesce(p_opens_at,now()),p_closes_at,coalesce(p_quorum_percent,0),auth.uid()) returning id into rid; return rid;
end $$;
revoke all on function public.hs4_create_resolution(uuid,text,text,text,text,timestamptz,timestamptz,numeric) from public; grant execute on function public.hs4_create_resolution(uuid,text,text,text,text,timestamptz,timestamptz,numeric) to authenticated;

create or replace function public.hs4_cast_resolution_vote(p_resolution_id uuid,p_choice text) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs4_assert_network(); rid uuid; r public.hs_resolutions%rowtype;
begin
 if p_choice not in ('yes','no','abstain') then raise exception 'Invalid vote choice.'; end if;
 select * into r from public.hs_resolutions where id=p_resolution_id and network_id=nid;
 if r.id is null then raise exception 'Resolution not found.'; end if;
 if r.status<>'open' or (r.opens_at is not null and r.opens_at>now()) or (r.closes_at is not null and r.closes_at<=now()) then raise exception 'Voting is not open.'; end if;
 insert into public.hs_resolution_votes(network_id,resolution_id,voter_user_id,choice) values(nid,p_resolution_id,auth.uid(),p_choice) on conflict(resolution_id,voter_user_id) do update set choice=excluded.choice,cast_at=now() returning id into rid; return rid;
end $$;
revoke all on function public.hs4_cast_resolution_vote(uuid,text) from public; grant execute on function public.hs4_cast_resolution_vote(uuid,text) to authenticated;

create or replace function public.hs4_close_resolution(p_resolution_id uuid,p_result_status text,p_result_note text default null) returns void language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs4_assert_network();
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 if p_result_status not in ('approved','rejected','closed','withdrawn') then raise exception 'Invalid resolution result.'; end if;
 update public.hs_resolutions set status=p_result_status,result_note=nullif(trim(p_result_note),''),closed_at=now(),updated_at=now() where id=p_resolution_id and network_id=nid;
 if not found then raise exception 'Resolution not found.'; end if;
end $$;
revoke all on function public.hs4_close_resolution(uuid,text,text) from public; grant execute on function public.hs4_close_resolution(uuid,text,text) to authenticated;

create or replace function public.hs4_add_governance_document(p_meeting_id uuid,p_resolution_id uuid,p_document_type text,p_title text,p_version_label text default null,p_document_url text default null,p_visibility text default 'members') returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.hs4_assert_network(); rid uuid;
begin
 if not public.is_network_admin(nid) then raise exception 'Society admin access required.' using errcode='42501'; end if;
 if p_document_type not in ('agenda','minutes','resolution','notice','supporting','other') or p_visibility not in ('admin','members') then raise exception 'Invalid document settings.'; end if;
 insert into public.hs_governance_documents(network_id,meeting_id,resolution_id,document_type,title,version_label,document_url,visibility,created_by) values(nid,p_meeting_id,p_resolution_id,p_document_type,trim(p_title),nullif(trim(p_version_label),''),nullif(trim(p_document_url),''),p_visibility,auth.uid()) returning id into rid; return rid;
end $$;
revoke all on function public.hs4_add_governance_document(uuid,uuid,text,text,text,text,text) from public; grant execute on function public.hs4_add_governance_document(uuid,uuid,text,text,text,text,text) to authenticated;

insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids,vertical_kind) values
 ('housing-society.governance.committee','core','released','{}'::uuid[],'housing-society'),
 ('housing-society.governance.meetings','community','released','{}'::uuid[],'housing-society'),
 ('housing-society.governance.resolutions','community','released','{}'::uuid[],'housing-society'),
 ('housing-society.governance.documents','community','released','{}'::uuid[],'housing-society')
on conflict(feature_key) do update set bundle_key=excluded.bundle_key,rollout_state=excluded.rollout_state,vertical_kind=excluded.vertical_kind;

do $$ begin
 if to_regclass('public.hs_committee_terms') is null or to_regclass('public.hs_governance_meetings') is null or to_regclass('public.hs_resolutions') is null or to_regclass('public.hs_resolution_votes') is null then raise exception 'HS-4 compatibility check failed: governance tables missing.'; end if;
 if to_regprocedure('public.hs4_get_governance_snapshot()') is null or to_regprocedure('public.hs4_cast_resolution_vote(uuid,text)') is null or to_regprocedure('public.hs4_publish_minutes(uuid,text,integer)') is null then raise exception 'HS-4 compatibility check failed: governance RPCs missing.'; end if;
end $$;
