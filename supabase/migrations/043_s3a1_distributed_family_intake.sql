-- S3-A1 — Distributed Family Intake & Branch Assembly V1
-- Independent staged intake pipeline. Anonymous contribution tokens never authorize family reads.
-- Run after 042.

insert into public.platform_feature_flags(feature_key,bundle_key,rollout_state,pilot_network_ids)
values ('contribute.branch_intake','contribute','pilot','{}'::uuid[])
on conflict(feature_key) do nothing;

insert into public.platform_playground_features(feature_key,enabled)
values ('contribute.branch_intake',true)
on conflict(feature_key) do update set enabled=excluded.enabled,updated_at=now();

create table if not exists public.family_intake_sessions (
  id uuid primary key default gen_random_uuid(),
  network_id uuid not null references public.networks(id) on delete cascade,
  title varchar(180) not null default 'Build our family together',
  status varchar(20) not null default 'collecting' check(status in ('draft','collecting','review','completed','closed')),
  created_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_family_intake_sessions_network on public.family_intake_sessions(network_id,created_at desc);

create table if not exists public.family_intake_access (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.family_intake_sessions(id) on delete cascade,
  network_id uuid not null references public.networks(id) on delete cascade,
  token_hash bytea not null unique,
  representative_label varchar(120),
  status varchar(20) not null default 'active' check(status in ('active','submitted','committed','revoked','expired')),
  max_submissions integer not null default 1 check(max_submissions between 1 and 10),
  submission_count integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null default (now()+interval '30 days'),
  last_opened_at timestamptz,
  submitted_at timestamptz,
  committed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_family_intake_access_session on public.family_intake_access(session_id,status);

create table if not exists public.family_intake_people (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.family_intake_sessions(id) on delete cascade,
  access_id uuid not null references public.family_intake_access(id) on delete cascade,
  network_id uuid not null references public.networks(id) on delete cascade,
  client_ref varchar(80) not null,
  full_name varchar(150) not null,
  normalized_name varchar(180) not null,
  date_of_birth date,
  birth_year integer check(birth_year is null or birth_year between 1800 and 2200),
  gender varchar(10) check(gender is null or gender in ('Male','Female','Other')),
  city varchar(100),
  role_from_anchor varchar(60),
  generation_offset integer not null default 0 check(generation_offset between -5 and 5),
  status varchar(20) not null default 'staged' check(status in ('staged','matched','new','ambiguous','committed','rejected')),
  matched_member_id uuid references public.family_members(id) on delete set null,
  match_confidence integer check(match_confidence is null or match_confidence between 0 and 100),
  created_at timestamptz not null default now(),
  unique(access_id,client_ref)
);
create index if not exists idx_family_intake_people_access on public.family_intake_people(access_id);
create index if not exists idx_family_intake_people_session_name on public.family_intake_people(session_id,normalized_name);

create table if not exists public.family_intake_relationships (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.family_intake_sessions(id) on delete cascade,
  access_id uuid not null references public.family_intake_access(id) on delete cascade,
  network_id uuid not null references public.networks(id) on delete cascade,
  from_staged_person_id uuid not null references public.family_intake_people(id) on delete cascade,
  to_staged_person_id uuid not null references public.family_intake_people(id) on delete cascade,
  relationship_type varchar(20) not null check(relationship_type in ('parent','child','spouse')),
  reported_relationship varchar(80),
  status varchar(20) not null default 'staged' check(status in ('staged','committed','rejected')),
  canonical_relationship_id uuid references public.family_relationships(id) on delete set null,
  created_at timestamptz not null default now(),
  check(from_staged_person_id<>to_staged_person_id)
);
create index if not exists idx_family_intake_relationships_access on public.family_intake_relationships(access_id);

create table if not exists public.family_intake_match_candidates (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.family_intake_sessions(id) on delete cascade,
  network_id uuid not null references public.networks(id) on delete cascade,
  staged_person_id uuid not null references public.family_intake_people(id) on delete cascade,
  candidate_member_id uuid references public.family_members(id) on delete cascade,
  candidate_staged_person_id uuid references public.family_intake_people(id) on delete cascade,
  score integer not null check(score between 0 and 100),
  confidence_band varchar(12) not null check(confidence_band in ('high','medium','low')),
  reasons jsonb not null default '{}'::jsonb,
  status varchar(20) not null default 'open' check(status in ('open','accepted','rejected','unsure')),
  created_at timestamptz not null default now(),
  check((candidate_member_id is not null)::int + (candidate_staged_person_id is not null)::int = 1)
);
create index if not exists idx_family_intake_candidates_person on public.family_intake_match_candidates(staged_person_id,score desc);

create table if not exists public.family_intake_decisions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.family_intake_sessions(id) on delete cascade,
  network_id uuid not null references public.networks(id) on delete cascade,
  candidate_id uuid references public.family_intake_match_candidates(id) on delete set null,
  staged_person_id uuid not null references public.family_intake_people(id) on delete cascade,
  decision varchar(20) not null check(decision in ('same','different','not_sure','create_new')),
  decision_source varchar(30) not null default 'owner' check(decision_source in ('automatic_high_confidence','contributor','owner')),
  decided_by uuid references auth.users(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.family_intake_conflicts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.family_intake_sessions(id) on delete cascade,
  network_id uuid not null references public.networks(id) on delete cascade,
  staged_person_id uuid not null references public.family_intake_people(id) on delete cascade,
  member_id uuid not null references public.family_members(id) on delete cascade,
  field_name varchar(50) not null,
  existing_value text,
  reported_value text,
  status varchar(20) not null default 'open' check(status in ('open','kept_existing','accepted_reported','unresolved')),
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  unique(staged_person_id,member_id,field_name)
);

create table if not exists public.family_intake_events (
  id bigint generated always as identity primary key,
  network_id uuid not null references public.networks(id) on delete cascade,
  session_id uuid references public.family_intake_sessions(id) on delete cascade,
  access_id uuid references public.family_intake_access(id) on delete cascade,
  event_name varchar(60) not null,
  properties jsonb not null default '{}'::jsonb,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_family_intake_events_network on public.family_intake_events(network_id,event_name,created_at desc);

alter table public.family_intake_sessions enable row level security;
alter table public.family_intake_access enable row level security;
alter table public.family_intake_people enable row level security;
alter table public.family_intake_relationships enable row level security;
alter table public.family_intake_match_candidates enable row level security;
alter table public.family_intake_decisions enable row level security;
alter table public.family_intake_conflicts enable row level security;
alter table public.family_intake_events enable row level security;
-- Intentionally no direct client policies. All access is through narrow SECURITY DEFINER RPCs.

create or replace function public.normalize_intake_name(p_name text) returns text
language sql immutable as $$
  select trim(regexp_replace(lower(regexp_replace(coalesce(p_name,''),'[^a-zA-Z0-9 ]','','g')),'\\s+',' ','g'));
$$;

create or replace function public.s3a_intake_enabled(p_network_id uuid, p_allow_creator uuid default null) returns boolean
language sql security definer stable set search_path=public as $$
  select exists(
    select 1 from public.platform_feature_flags f
    where f.feature_key='contribute.branch_intake' and (
      f.rollout_state='released'
      or (f.rollout_state='pilot' and p_network_id=any(f.pilot_network_ids))
      or (p_allow_creator is not null and exists(select 1 from public.platform_owners po where po.user_id=p_allow_creator))
    )
  );
$$;
revoke all on function public.s3a_intake_enabled(uuid,uuid) from public;

create or replace function public.create_family_intake_session(p_title text default null)
returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); sid uuid;
begin
  if nid is null or not public.is_network_admin(nid) then raise exception 'Family admin access is required.' using errcode='42501'; end if;
  if not public.s3a_intake_enabled(nid,auth.uid()) then raise exception 'Distributed family intake is not enabled for this family yet.' using errcode='42501'; end if;
  insert into public.family_intake_sessions(network_id,title,created_by)
  values(nid,coalesce(nullif(trim(p_title),''),'Build our family together'),auth.uid()) returning id into sid;
  insert into public.family_intake_events(network_id,session_id,event_name,actor_id) values(nid,sid,'intake_created',auth.uid());
  return sid;
end $$;
revoke all on function public.create_family_intake_session(text) from public;
grant execute on function public.create_family_intake_session(text) to authenticated;

create or replace function public.create_family_intake_link(p_session_id uuid,p_representative_label text default null,p_days integer default 30)
returns text language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); raw_token text; aid uuid;
begin
  if nid is null or not public.is_network_admin(nid) then raise exception 'Family admin access is required.' using errcode='42501'; end if;
  if not exists(select 1 from public.family_intake_sessions s where s.id=p_session_id and s.network_id=nid and s.status in ('draft','collecting','review')) then raise exception 'Intake session not found.' using errcode='P0002'; end if;
  raw_token:=encode(gen_random_bytes(32),'hex');
  insert into public.family_intake_access(session_id,network_id,token_hash,representative_label,created_by,expires_at)
  values(p_session_id,nid,digest(raw_token,'sha256'),nullif(trim(p_representative_label),''),auth.uid(),now()+make_interval(days=>greatest(1,least(coalesce(p_days,30),90)))) returning id into aid;
  insert into public.family_intake_events(network_id,session_id,access_id,event_name,actor_id) values(nid,p_session_id,aid,'intake_link_created',auth.uid());
  return raw_token;
end $$;
revoke all on function public.create_family_intake_link(uuid,text,integer) from public;
grant execute on function public.create_family_intake_link(uuid,text,integer) to authenticated;

create or replace function public.get_family_intake_preview(p_token text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare a public.family_intake_access%rowtype; s public.family_intake_sessions%rowtype; family_name text;
begin
  select * into a from public.family_intake_access where token_hash=digest(coalesce(p_token,''),'sha256') limit 1;
  if a.id is null or a.status not in ('active','submitted') or a.expires_at<=now() then raise exception 'This contribution link is invalid or expired.' using errcode='42501'; end if;
  if not public.s3a_intake_enabled(a.network_id,a.created_by) then raise exception 'This family intake is not currently available.' using errcode='42501'; end if;
  select * into s from public.family_intake_sessions where id=a.session_id;
  if s.status not in ('collecting','review') then raise exception 'This family intake is closed.' using errcode='42501'; end if;
  select n.name into family_name from public.networks n where n.id=a.network_id;
  update public.family_intake_access set last_opened_at=now() where id=a.id;
  insert into public.family_intake_events(network_id,session_id,access_id,event_name,properties)
  values(a.network_id,a.session_id,a.id,'intake_link_opened',jsonb_build_object('representative_label',a.representative_label));
  return jsonb_build_object('family_name',family_name,'title',s.title,'representative_label',a.representative_label,'status',a.status,'already_submitted',a.submission_count>0,'expires_at',a.expires_at);
end $$;
revoke all on function public.get_family_intake_preview(text) from public;
grant execute on function public.get_family_intake_preview(text) to anon,authenticated;

create or replace function public.score_intake_person(p_name text,p_dob date,p_year integer,p_gender text,p_city text,p_other_name text,p_other_dob date,p_other_year integer,p_other_gender text,p_other_city text)
returns integer language sql immutable as $$
  select least(100,
    case when public.normalize_intake_name(p_name)=public.normalize_intake_name(p_other_name) and public.normalize_intake_name(p_name)<>'' then 45 else 0 end
    + case when p_dob is not null and p_other_dob is not null and p_dob=p_other_dob then 35 else 0 end
    + case when coalesce(p_year,extract(year from p_dob)::int) is not null and coalesce(p_other_year,extract(year from p_other_dob)::int) is not null and coalesce(p_year,extract(year from p_dob)::int)=coalesce(p_other_year,extract(year from p_other_dob)::int) then 15 else 0 end
    + case when p_gender is not null and p_other_gender is not null and p_gender=p_other_gender then 3 else 0 end
    + case when nullif(lower(trim(p_city)),'') is not null and lower(trim(p_city))=lower(trim(p_other_city)) then 2 else 0 end
  );
$$;

create or replace function public.refresh_family_intake_matches(p_session_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare p record; c record; sc integer; reason jsonb;
begin
  delete from public.family_intake_match_candidates where session_id=p_session_id and status='open';
  for p in select * from public.family_intake_people where session_id=p_session_id and status in ('staged','new','ambiguous') loop
    for c in select fm.* from public.family_members fm where fm.network_id=p.network_id and public.normalize_intake_name(fm.full_name)=p.normalized_name loop
      sc:=public.score_intake_person(p.full_name,p.date_of_birth,p.birth_year,p.gender,p.city,c.full_name,c.date_of_birth,extract(year from c.date_of_birth)::int,c.gender,c.city);
      -- Relationship context: reported parent/spouse names matching canonical neighbours is stronger than demographics alone.
      if exists(
        select 1 from public.family_intake_relationships ir
        join public.family_intake_people ip on ip.id=case when ir.from_staged_person_id=p.id then ir.to_staged_person_id else ir.from_staged_person_id end
        join public.family_relationships fr on fr.network_id=p.network_id and (fr.person_id=c.id or fr.related_person_id=c.id)
        join public.family_members cm on cm.network_id=p.network_id and cm.id=case when fr.person_id=c.id then fr.related_person_id else fr.person_id end
        where ir.session_id=p_session_id and (ir.from_staged_person_id=p.id or ir.to_staged_person_id=p.id) and public.normalize_intake_name(cm.full_name)=ip.normalized_name
      ) then sc:=least(100,sc+20); end if;
      if sc>=45 and not exists(select 1 from public.family_intake_match_candidates x where x.staged_person_id=p.id and x.candidate_member_id=c.id and x.status<>'open') then
        reason:=jsonb_build_object('name','exact','dob',p.date_of_birth is not null and c.date_of_birth=p.date_of_birth,'birth_year',coalesce(p.birth_year,extract(year from p.date_of_birth)::int)=extract(year from c.date_of_birth)::int,'city',lower(coalesce(p.city,''))=lower(coalesce(c.city,'')));
        insert into public.family_intake_match_candidates(session_id,network_id,staged_person_id,candidate_member_id,score,confidence_band,reasons)
        values(p_session_id,p.network_id,p.id,c.id,sc,case when sc>=90 then 'high' when sc>=65 then 'medium' else 'low' end,reason);
        if sc>=95 and p.matched_member_id is null then
          update public.family_intake_people set matched_member_id=c.id,match_confidence=sc,status='matched' where id=p.id;
          insert into public.family_intake_decisions(session_id,network_id,staged_person_id,decision,decision_source,reason)
          values(p_session_id,p.network_id,p.id,'same','automatic_high_confidence','Deterministic score >= 95');
        elsif sc>=65 and p.status='staged' then update public.family_intake_people set status='ambiguous',match_confidence=sc where id=p.id; end if;
      end if;
    end loop;
    -- Cross-branch exact-name candidates. Never auto-merge these.
    for c in select q.* from public.family_intake_people q where q.session_id=p_session_id and q.id<>p.id and q.access_id<>p.access_id and q.normalized_name=p.normalized_name and q.created_at<p.created_at loop
      sc:=public.score_intake_person(p.full_name,p.date_of_birth,p.birth_year,p.gender,p.city,c.full_name,c.date_of_birth,c.birth_year,c.gender,c.city);
      if sc>=45 and not exists(select 1 from public.family_intake_match_candidates x where x.staged_person_id=p.id and x.candidate_staged_person_id=c.id) then
        insert into public.family_intake_match_candidates(session_id,network_id,staged_person_id,candidate_staged_person_id,score,confidence_band,reasons)
        values(p_session_id,p.network_id,p.id,c.id,sc,case when sc>=90 then 'high' when sc>=65 then 'medium' else 'low' end,jsonb_build_object('name','exact','cross_branch',true));
        if sc>=65 and p.status='staged' then update public.family_intake_people set status='ambiguous',match_confidence=sc where id=p.id; end if;
      end if;
    end loop;
  end loop;
end $$;
revoke all on function public.refresh_family_intake_matches(uuid) from public;

create or replace function public.submit_family_intake(p_token text,p_people jsonb,p_relationships jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare a public.family_intake_access%rowtype; s public.family_intake_sessions%rowtype; item jsonb; rid jsonb; person_count int; rel_count int; from_id uuid; to_id uuid;
begin
  select * into a from public.family_intake_access where token_hash=digest(coalesce(p_token,''),'sha256') for update;
  if a.id is null or a.status<>'active' or a.expires_at<=now() or a.submission_count>=a.max_submissions then raise exception 'This contribution link is no longer accepting submissions.' using errcode='42501'; end if;
  if not public.s3a_intake_enabled(a.network_id,a.created_by) then raise exception 'This family intake is not currently available.' using errcode='42501'; end if;
  select * into s from public.family_intake_sessions where id=a.session_id;
  if s.status not in ('collecting','review') then raise exception 'This family intake is not accepting submissions.' using errcode='42501'; end if;
  if jsonb_typeof(p_people)<>'array' or jsonb_typeof(p_relationships)<>'array' then raise exception 'Invalid intake payload.' using errcode='22023'; end if;
  person_count:=jsonb_array_length(p_people); rel_count:=jsonb_array_length(p_relationships);
  if person_count<1 or person_count>60 or rel_count>100 then raise exception 'This branch is too large for the guided intake.' using errcode='22023'; end if;
  for item in select * from jsonb_array_elements(p_people) loop
    if length(trim(coalesce(item->>'full_name','')))<2 or length(trim(item->>'full_name'))>150 then raise exception 'Every person needs a valid name.' using errcode='22023'; end if;
    insert into public.family_intake_people(session_id,access_id,network_id,client_ref,full_name,normalized_name,date_of_birth,birth_year,gender,city,role_from_anchor,generation_offset)
    values(a.session_id,a.id,a.network_id,left(item->>'client_ref',80),left(trim(item->>'full_name'),150),public.normalize_intake_name(item->>'full_name'),nullif(item->>'date_of_birth','')::date,nullif(item->>'birth_year','')::int,nullif(item->>'gender',''),left(nullif(trim(item->>'city'),''),100),left(nullif(item->>'role_from_anchor',''),60),coalesce((item->>'generation_offset')::int,0));
  end loop;
  for rid in select * from jsonb_array_elements(p_relationships) loop
    select id into from_id from public.family_intake_people where access_id=a.id and client_ref=rid->>'from_ref';
    select id into to_id from public.family_intake_people where access_id=a.id and client_ref=rid->>'to_ref';
    if from_id is null or to_id is null or rid->>'relationship_type' not in ('parent','child','spouse') then raise exception 'Invalid relationship in intake payload.' using errcode='22023'; end if;
    insert into public.family_intake_relationships(session_id,access_id,network_id,from_staged_person_id,to_staged_person_id,relationship_type,reported_relationship)
    values(a.session_id,a.id,a.network_id,from_id,to_id,rid->>'relationship_type',left(nullif(rid->>'reported_relationship',''),80));
  end loop;
  update public.family_intake_access set status='submitted',submission_count=submission_count+1,submitted_at=now() where id=a.id;
  update public.family_intake_sessions set status='review',updated_at=now() where id=a.session_id and status='collecting';
  perform public.refresh_family_intake_matches(a.session_id);
  insert into public.family_intake_events(network_id,session_id,access_id,event_name,properties)
  values(a.network_id,a.session_id,a.id,'intake_submitted',jsonb_build_object('people_reported',person_count,'relationships_reported',rel_count));
  return jsonb_build_object('people_reported',person_count,'relationships_reported',rel_count,'message','Thank you — your family branch has been sent for review.');
end $$;
revoke all on function public.submit_family_intake(text,jsonb,jsonb) from public;
grant execute on function public.submit_family_intake(text,jsonb,jsonb) to anon,authenticated;

create or replace function public.get_family_intake_admin_dashboard()
returns jsonb language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.current_network_id(); result jsonb;
begin
  if nid is null or not public.is_network_admin(nid) then raise exception 'Family admin access is required.' using errcode='42501'; end if;
  select jsonb_build_object(
    'sessions',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'title',s.title,'status',s.status,'created_at',s.created_at,'access_count',(select count(*) from public.family_intake_access a where a.session_id=s.id),'submitted_count',(select count(*) from public.family_intake_access a where a.session_id=s.id and a.status in ('submitted','committed')),'committed_count',(select count(*) from public.family_intake_access a where a.session_id=s.id and a.status='committed')) order by s.created_at desc) from public.family_intake_sessions s where s.network_id=nid),'[]'::jsonb),
    'branches',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'session_id',a.session_id,'representative_label',a.representative_label,'status',a.status,'expires_at',a.expires_at,'submitted_at',a.submitted_at,'people_count',(select count(*) from public.family_intake_people p where p.access_id=a.id),'relationship_count',(select count(*) from public.family_intake_relationships r where r.access_id=a.id)) order by a.created_at desc) from public.family_intake_access a where a.network_id=nid),'[]'::jsonb),
    'people',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'access_id',p.access_id,'full_name',p.full_name,'birth_year',coalesce(p.birth_year,extract(year from p.date_of_birth)::int),'gender',p.gender,'city',p.city,'role_from_anchor',p.role_from_anchor,'generation_offset',p.generation_offset,'status',p.status,'matched_member_id',p.matched_member_id,'match_confidence',p.match_confidence) order by p.created_at) from public.family_intake_people p where p.network_id=nid),'[]'::jsonb),
    'candidates',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'staged_person_id',c.staged_person_id,'candidate_member_id',c.candidate_member_id,'candidate_staged_person_id',c.candidate_staged_person_id,'candidate_name',coalesce(fm.full_name,sp.full_name),'score',c.score,'confidence_band',c.confidence_band,'status',c.status,'reasons',c.reasons) order by c.score desc) from public.family_intake_match_candidates c left join public.family_members fm on fm.id=c.candidate_member_id left join public.family_intake_people sp on sp.id=c.candidate_staged_person_id where c.network_id=nid),'[]'::jsonb),
    'conflicts',coalesce((select jsonb_agg(jsonb_build_object('id',x.id,'staged_person_id',x.staged_person_id,'member_id',x.member_id,'field_name',x.field_name,'existing_value',x.existing_value,'reported_value',x.reported_value,'status',x.status) order by x.created_at desc) from public.family_intake_conflicts x where x.network_id=nid),'[]'::jsonb),
    'metrics',jsonb_build_object('links_opened',(select count(*) from public.family_intake_events e where e.network_id=nid and e.event_name='intake_link_opened'),'submissions',(select count(*) from public.family_intake_events e where e.network_id=nid and e.event_name='intake_submitted'),'people_reported',coalesce((select sum((e.properties->>'people_reported')::int) from public.family_intake_events e where e.network_id=nid and e.event_name='intake_submitted'),0),'branches_committed',(select count(*) from public.family_intake_access a where a.network_id=nid and a.status='committed'))
  ) into result;
  return result;
end $$;
revoke all on function public.get_family_intake_admin_dashboard() from public;
grant execute on function public.get_family_intake_admin_dashboard() to authenticated;

create or replace function public.decide_family_intake_match(p_candidate_id uuid,p_decision text)
returns void language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); c public.family_intake_match_candidates%rowtype; target_member uuid;
begin
  if nid is null or not public.is_network_admin(nid) then raise exception 'Family admin access is required.' using errcode='42501'; end if;
  if p_decision not in ('same','different','not_sure') then raise exception 'Invalid decision.' using errcode='22023'; end if;
  select * into c from public.family_intake_match_candidates where id=p_candidate_id and network_id=nid;
  if c.id is null then raise exception 'Match candidate not found.' using errcode='P0002'; end if;
  update public.family_intake_match_candidates set status=case p_decision when 'same' then 'accepted' when 'different' then 'rejected' else 'unsure' end where id=c.id;
  insert into public.family_intake_decisions(session_id,network_id,candidate_id,staged_person_id,decision,decision_source,decided_by)
  values(c.session_id,nid,c.id,c.staged_person_id,p_decision,'owner',auth.uid());
  if p_decision='same' then
    target_member:=c.candidate_member_id;
    if target_member is null and c.candidate_staged_person_id is not null then select matched_member_id into target_member from public.family_intake_people where id=c.candidate_staged_person_id; end if;
    if target_member is not null then update public.family_intake_people set matched_member_id=target_member,status='matched',match_confidence=c.score where id=c.staged_person_id; elsif c.candidate_staged_person_id is not null then update public.family_intake_people set status='new',match_confidence=c.score where id=c.staged_person_id; end if;
  elsif p_decision='different' then
    if not exists(select 1 from public.family_intake_match_candidates x where x.staged_person_id=c.staged_person_id and x.status='accepted') then update public.family_intake_people set matched_member_id=null,status='new' where id=c.staged_person_id; end if;
  else update public.family_intake_people set status='ambiguous' where id=c.staged_person_id; end if;
end $$;
revoke all on function public.decide_family_intake_match(uuid,text) from public;
grant execute on function public.decide_family_intake_match(uuid,text) to authenticated;

create or replace function public.commit_family_intake_branch(p_access_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); a public.family_intake_access%rowtype; p record; r record; canonical_id uuid; other_id uuid; rel_id uuid; base_generation integer:=4; matched_base integer; created_count integer:=0; matched_count integer:=0; rel_count integer:=0;
begin
  if nid is null or not public.is_network_admin(nid) then raise exception 'Family admin access is required.' using errcode='42501'; end if;
  select * into a from public.family_intake_access where id=p_access_id and network_id=nid for update;
  if a.id is null or a.status<>'submitted' then raise exception 'This branch is not waiting for commit.' using errcode='P0002'; end if;
  if exists(select 1 from public.family_intake_people p0 where p0.access_id=a.id and p0.status='ambiguous' and p0.matched_member_id is null) or exists(select 1 from public.family_intake_match_candidates c join public.family_intake_people p0 on p0.id=c.staged_person_id where p0.access_id=a.id and c.score>=65 and c.status in ('open','unsure')) then raise exception 'Resolve medium/high identity matches before committing this branch.' using errcode='23514'; end if;
  select fm.generation_level-p0.generation_offset into matched_base
  from public.family_intake_people p0 join public.family_members fm on fm.id=p0.matched_member_id
  where p0.access_id=a.id and p0.matched_member_id is not null limit 1;
  if matched_base is not null then base_generation:=greatest(3,matched_base); end if;
  if base_generation + (select coalesce(min(generation_offset),0) from public.family_intake_people where access_id=a.id) < 1 then base_generation:=1-(select min(generation_offset) from public.family_intake_people where access_id=a.id); end if;

  for p in select * from public.family_intake_people where access_id=a.id order by generation_offset,id loop
    canonical_id:=p.matched_member_id;
    if canonical_id is null then
      -- Accepted cross-branch identity can reuse/establish one canonical person.
      select sp.matched_member_id into canonical_id
      from public.family_intake_match_candidates c join public.family_intake_people sp on sp.id=c.candidate_staged_person_id
      where c.staged_person_id=p.id and c.status='accepted' and c.candidate_staged_person_id is not null limit 1;
    end if;
    if canonical_id is null then
      insert into public.family_members(network_id,full_name,date_of_birth,generation_level,city,gender,profile_status,profile_visibility,contact_visibility)
      values(nid,p.full_name,p.date_of_birth,greatest(1,base_generation+p.generation_offset),p.city,p.gender,'approved','member','admin') returning id into canonical_id;
      created_count:=created_count+1;
      -- If owner accepted a cross-branch duplicate, bind that other staged record to the same new member too.
      update public.family_intake_people sp set matched_member_id=canonical_id,status='matched',match_confidence=100
      where sp.id in (select c.candidate_staged_person_id from public.family_intake_match_candidates c where c.staged_person_id=p.id and c.status='accepted' and c.candidate_staged_person_id is not null) and sp.matched_member_id is null;
    else
      matched_count:=matched_count+1;
      -- Preserve contradictory facts instead of overwriting canonical data.
      insert into public.family_intake_conflicts(session_id,network_id,staged_person_id,member_id,field_name,existing_value,reported_value)
      select a.session_id,nid,p.id,canonical_id,'date_of_birth',fm.date_of_birth::text,p.date_of_birth::text from public.family_members fm where fm.id=canonical_id and p.date_of_birth is not null and fm.date_of_birth is not null and fm.date_of_birth<>p.date_of_birth on conflict do nothing;
      insert into public.family_intake_conflicts(session_id,network_id,staged_person_id,member_id,field_name,existing_value,reported_value)
      select a.session_id,nid,p.id,canonical_id,'city',fm.city,p.city from public.family_members fm where fm.id=canonical_id and nullif(trim(p.city),'') is not null and nullif(trim(fm.city),'') is not null and lower(trim(fm.city))<>lower(trim(p.city)) on conflict do nothing;
      insert into public.family_intake_conflicts(session_id,network_id,staged_person_id,member_id,field_name,existing_value,reported_value)
      select a.session_id,nid,p.id,canonical_id,'gender',fm.gender,p.gender from public.family_members fm where fm.id=canonical_id and p.gender is not null and fm.gender is not null and fm.gender<>p.gender on conflict do nothing;
    end if;
    update public.family_intake_people set matched_member_id=canonical_id,status='committed' where id=p.id;
  end loop;

  for r in select * from public.family_intake_relationships where access_id=a.id and status='staged' loop
    select matched_member_id into canonical_id from public.family_intake_people where id=r.from_staged_person_id;
    select matched_member_id into other_id from public.family_intake_people where id=r.to_staged_person_id;
    if canonical_id is null or other_id is null then raise exception 'Branch identity mapping is incomplete.' using errcode='23514'; end if;
    if canonical_id<>other_id then
      begin
        insert into public.family_relationships(network_id,person_id,related_person_id,relationship_type)
        values(nid,case when r.relationship_type='spouse' and canonical_id::text>other_id::text then other_id else canonical_id end,case when r.relationship_type='spouse' and canonical_id::text>other_id::text then canonical_id else other_id end,r.relationship_type)
        on conflict(person_id,related_person_id,relationship_type) do nothing
        returning id into rel_id;
        if rel_id is not null then rel_count:=rel_count+1; update public.family_intake_relationships set status='committed',canonical_relationship_id=rel_id where id=r.id; else update public.family_intake_relationships set status='committed' where id=r.id; end if;
      exception when check_violation or foreign_key_violation then
        raise exception 'A staged relationship conflicts with the existing family graph. Review this branch before committing.' using errcode='23514';
      end;
    else update public.family_intake_relationships set status='rejected' where id=r.id; end if;
  end loop;
  update public.family_intake_access set status='committed',committed_at=now() where id=a.id;
  if not exists(select 1 from public.family_intake_access x where x.session_id=a.session_id and x.status='submitted') then update public.family_intake_sessions set status='review',updated_at=now() where id=a.session_id; end if;
  insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'family_intake_branch_committed',jsonb_build_object('session_id',a.session_id,'access_id',a.id,'created_people',created_count,'matched_people',matched_count,'relationships',rel_count));
  insert into public.family_intake_events(network_id,session_id,access_id,event_name,properties,actor_id) values(nid,a.session_id,a.id,'branch_committed',jsonb_build_object('created_people',created_count,'matched_people',matched_count,'relationships',rel_count),auth.uid());
  return jsonb_build_object('created_people',created_count,'matched_people',matched_count,'relationships',rel_count);
end $$;
revoke all on function public.commit_family_intake_branch(uuid) from public;
grant execute on function public.commit_family_intake_branch(uuid) to authenticated;

create or replace function public.revoke_family_intake_link(p_access_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
  if nid is null or not public.is_network_admin(nid) then raise exception 'Family admin access is required.' using errcode='42501'; end if;
  update public.family_intake_access set status='revoked' where id=p_access_id and network_id=nid and status='active';
end $$;
revoke all on function public.revoke_family_intake_link(uuid) from public;
grant execute on function public.revoke_family_intake_link(uuid) to authenticated;

comment on table public.family_intake_people is 'S3-A1 staged people reported through distributed branch forms. Never canonical until admin commit.';
comment on table public.family_intake_match_candidates is 'Explainable deterministic identity candidates across canonical members and other staged branches.';
comment on function public.get_family_intake_preview(text) is 'Token-safe public preview. Returns family name/intake label only; never family-member data.';


-- Keep the pilot-freeze preset aware of S3-A1 instead of demoting this new activation experiment to Test.
create or replace function public.apply_alpha_day1_launch_preset()
returns integer
language plpgsql security definer set search_path=public as $$
declare v_changed integer:=0; r record; v_new_state varchar;
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access is required.' using errcode='42501'; end if;
  for r in select feature_key,rollout_state from public.platform_feature_flags loop
    v_new_state:=case
      when r.feature_key in ('core.home','core.family','core.directory','core.profile','core.guide','celebrate.special_days','remember.memories','remember.history','remember.family_pulse','remember.quiet_digest','contribute.help_family','advanced.relationships','admin.center','admin.import','admin.governance') then 'released'
      when r.feature_key in ('connect.gatherings','share.family','contribute.branch_intake') then 'pilot'
      else 'test'
    end;
    if r.rollout_state is distinct from v_new_state then
      update public.platform_feature_flags set rollout_state=v_new_state,pilot_network_ids=case when v_new_state='pilot' then pilot_network_ids else '{}'::uuid[] end,updated_by=auth.uid(),updated_at=now() where feature_key=r.feature_key;
      v_changed:=v_changed+1;
    end if;
  end loop;
  return v_changed;
end $$;
revoke all on function public.apply_alpha_day1_launch_preset() from public;
grant execute on function public.apply_alpha_day1_launch_preset() to authenticated;
