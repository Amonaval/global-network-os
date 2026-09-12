-- E7 — Elections, nominations, voting and polls.
-- Formal ballots keep eligibility + participation identity separate from secret vote choices.

create table if not exists public.network_ballots(
 id uuid primary key default gen_random_uuid(),network_id uuid not null references public.networks(id) on delete cascade,
 ballot_type varchar(20) not null default 'poll',title varchar(180) not null,description text,status varchar(20) not null default 'draft',
 eligibility_mode varchar(30) not null default 'members',max_choices int not null default 1,secret_ballot boolean not null default true,
 allow_nominations boolean not null default false,opens_at timestamptz,closes_at timestamptz,results_published_at timestamptz,
 created_by uuid references auth.users(id) on delete set null,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 constraint network_ballot_type_check check(ballot_type in ('poll','election')),
 constraint network_ballot_status_check check(status in ('draft','open','closed','published','cancelled')),
 constraint network_ballot_eligibility_check check(eligibility_mode in ('members','admins','family_representatives')),
 constraint network_ballot_choices_check check(max_choices between 1 and 10)
);
create index if not exists idx_network_ballots_network on public.network_ballots(network_id,status,created_at desc);

create table if not exists public.network_ballot_options(
 id uuid primary key default gen_random_uuid(),network_id uuid not null references public.networks(id) on delete cascade,ballot_id uuid not null references public.network_ballots(id) on delete cascade,
 label varchar(180) not null,description text,candidate_entity_id uuid,sort_order int not null default 10,created_at timestamptz not null default now(),unique(ballot_id,id)
);
create index if not exists idx_ballot_options_ballot on public.network_ballot_options(ballot_id,sort_order);

create table if not exists public.network_ballot_nominations(
 id uuid primary key default gen_random_uuid(),network_id uuid not null references public.networks(id) on delete cascade,ballot_id uuid not null references public.network_ballots(id) on delete cascade,
 nominee_entity_id uuid not null,nominee_label varchar(180) not null,statement text,nominated_by uuid not null references auth.users(id) on delete cascade,
 status varchar(20) not null default 'pending',reviewed_by uuid references auth.users(id) on delete set null,reviewed_at timestamptz,created_at timestamptz not null default now(),
 constraint network_ballot_nomination_status_check check(status in ('pending','approved','rejected')),unique(ballot_id,nominee_entity_id)
);

create table if not exists public.network_ballot_eligibility(
 network_id uuid not null references public.networks(id) on delete cascade,ballot_id uuid not null references public.network_ballots(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,
 source varchar(40) not null,snapshotted_at timestamptz not null default now(),primary key(ballot_id,user_id)
);
create index if not exists idx_ballot_eligibility_user on public.network_ballot_eligibility(user_id,ballot_id);

create table if not exists public.network_ballot_participation(
 network_id uuid not null references public.networks(id) on delete cascade,ballot_id uuid not null references public.network_ballots(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,
 receipt_id uuid not null default gen_random_uuid(),choice_count int not null,cast_at timestamptz not null default now(),primary key(ballot_id,user_id),unique(receipt_id)
);

create table if not exists public.network_ballot_votes(
 id uuid primary key default gen_random_uuid(),network_id uuid not null references public.networks(id) on delete cascade,ballot_id uuid not null references public.network_ballots(id) on delete cascade,
 option_id uuid not null references public.network_ballot_options(id) on delete cascade,anonymous_token uuid not null,voter_user_id uuid references auth.users(id) on delete cascade,cast_at timestamptz not null default now(),
 unique(ballot_id,anonymous_token,option_id)
);
create index if not exists idx_ballot_votes_results on public.network_ballot_votes(ballot_id,option_id);

alter table public.network_ballots enable row level security;alter table public.network_ballot_options enable row level security;alter table public.network_ballot_nominations enable row level security;alter table public.network_ballot_eligibility enable row level security;alter table public.network_ballot_participation enable row level security;alter table public.network_ballot_votes enable row level security;
revoke all on public.network_ballots,public.network_ballot_options,public.network_ballot_nominations,public.network_ballot_eligibility,public.network_ballot_participation,public.network_ballot_votes from anon,authenticated;

create or replace function public.upsert_network_ballot(p_id uuid,p_ballot_type text,p_title text,p_description text,p_eligibility_mode text,p_max_choices int,p_secret_ballot boolean,p_allow_nominations boolean,p_opens_at timestamptz,p_closes_at timestamptz) returns uuid
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); rid uuid;
begin
 if nid is null or not public.is_network_admin(nid) then raise exception 'Network admin access required.' using errcode='42501';end if;
 if p_ballot_type not in ('poll','election') or p_eligibility_mode not in ('members','admins','family_representatives') then raise exception 'Invalid ballot configuration.' using errcode='22023';end if;
 if length(trim(coalesce(p_title,'')))<3 then raise exception 'Ballot title is required.';end if;
 if p_id is null then insert into public.network_ballots(network_id,ballot_type,title,description,eligibility_mode,max_choices,secret_ballot,allow_nominations,opens_at,closes_at,created_by)
 values(nid,p_ballot_type,left(trim(p_title),180),nullif(trim(coalesce(p_description,'')),''),p_eligibility_mode,greatest(1,least(coalesce(p_max_choices,1),10)),coalesce(p_secret_ballot,true),coalesce(p_allow_nominations,false),p_opens_at,p_closes_at,auth.uid()) returning id into rid;
 else update public.network_ballots set ballot_type=p_ballot_type,title=left(trim(p_title),180),description=nullif(trim(coalesce(p_description,'')),''),eligibility_mode=p_eligibility_mode,max_choices=greatest(1,least(coalesce(p_max_choices,1),10)),secret_ballot=coalesce(p_secret_ballot,true),allow_nominations=coalesce(p_allow_nominations,false),opens_at=p_opens_at,closes_at=p_closes_at,updated_at=now() where id=p_id and network_id=nid and status='draft' returning id into rid;end if;
 if rid is null then raise exception 'Only draft ballots can be edited.';end if;return rid;
end $$;
revoke all on function public.upsert_network_ballot(uuid,text,text,text,text,int,boolean,boolean,timestamptz,timestamptz) from public;grant execute on function public.upsert_network_ballot(uuid,text,text,text,text,int,boolean,boolean,timestamptz,timestamptz) to authenticated;

create or replace function public.add_network_ballot_option(p_ballot_id uuid,p_label text,p_description text default null,p_candidate_entity_id uuid default null) returns uuid
language plpgsql security definer set search_path=public as $$ declare nid uuid:=public.current_network_id();rid uuid;ord int;begin
 if nid is null or not public.is_network_admin(nid) then raise exception 'Network admin access required.' using errcode='42501';end if;
 if not exists(select 1 from public.network_ballots where id=p_ballot_id and network_id=nid and status='draft') then raise exception 'Draft ballot not found.';end if;
 if p_candidate_entity_id is not null and not exists(select 1 from public.network_entities where id=p_candidate_entity_id and network_id=nid and kind='person') then raise exception 'Candidate is not a person in this network.';end if;
 select coalesce(max(sort_order),0)+10 into ord from public.network_ballot_options where ballot_id=p_ballot_id;
 insert into public.network_ballot_options(network_id,ballot_id,label,description,candidate_entity_id,sort_order) values(nid,p_ballot_id,left(trim(p_label),180),nullif(trim(coalesce(p_description,'')),''),p_candidate_entity_id,ord) returning id into rid;return rid;
end $$;
revoke all on function public.add_network_ballot_option(uuid,text,text,uuid) from public;grant execute on function public.add_network_ballot_option(uuid,text,text,uuid) to authenticated;

create or replace function public.submit_network_ballot_nomination(p_ballot_id uuid,p_nominee_entity_id uuid,p_statement text default null) returns uuid
language plpgsql security definer set search_path=public as $$ declare nid uuid:=public.current_network_id();rid uuid;lbl text;begin
 if nid is null or not public.is_network_member(nid) then raise exception 'Network membership required.' using errcode='42501';end if;
 if not exists(select 1 from public.network_ballots where id=p_ballot_id and network_id=nid and ballot_type='election' and allow_nominations and status='draft') then raise exception 'Nominations are not open for this election.';end if;
 select label into lbl from public.network_entities where id=p_nominee_entity_id and network_id=nid and kind='person';if lbl is null then raise exception 'Nominee is not a person in this network.';end if;
 insert into public.network_ballot_nominations(network_id,ballot_id,nominee_entity_id,nominee_label,statement,nominated_by) values(nid,p_ballot_id,p_nominee_entity_id,lbl,nullif(trim(coalesce(p_statement,'')),''),auth.uid()) on conflict(ballot_id,nominee_entity_id) do update set statement=excluded.statement,nominated_by=auth.uid(),status='pending',reviewed_by=null,reviewed_at=null returning id into rid;
 perform public.route_network_mentions(array['@president','@election-officer','@admin'],'Election nomination submitted',lbl||' was nominated.','elections','ballot_nomination',rid,'normal');return rid;
end $$;
revoke all on function public.submit_network_ballot_nomination(uuid,uuid,text) from public;grant execute on function public.submit_network_ballot_nomination(uuid,uuid,text) to authenticated;

create or replace function public.review_network_ballot_nomination(p_nomination_id uuid,p_action text) returns void
language plpgsql security definer set search_path=public as $$ declare nid uuid:=public.current_network_id();n public.network_ballot_nominations%rowtype;begin
 if nid is null or not public.is_network_admin(nid) then raise exception 'Network admin access required.' using errcode='42501';end if;if p_action not in ('approved','rejected') then raise exception 'Invalid review action.';end if;
 update public.network_ballot_nominations set status=p_action,reviewed_by=auth.uid(),reviewed_at=now() where id=p_nomination_id and network_id=nid returning * into n;if not found then raise exception 'Nomination not found.';end if;
 if p_action='approved' and not exists(select 1 from public.network_ballot_options where ballot_id=n.ballot_id and candidate_entity_id=n.nominee_entity_id) then perform public.add_network_ballot_option(n.ballot_id,n.nominee_label,n.statement,n.nominee_entity_id);end if;
end $$;
revoke all on function public.review_network_ballot_nomination(uuid,text) from public;grant execute on function public.review_network_ballot_nomination(uuid,text) to authenticated;

create or replace function public.open_network_ballot(p_ballot_id uuid) returns integer
language plpgsql security definer set search_path=public as $$ declare nid uuid:=public.current_network_id();b public.network_ballots%rowtype;r record;cnt int:=0;begin
 if nid is null or not public.is_network_admin(nid) then raise exception 'Network admin access required.' using errcode='42501';end if;select * into b from public.network_ballots where id=p_ballot_id and network_id=nid and status='draft';if not found then raise exception 'Draft ballot not found.';end if;
 if (select count(*) from public.network_ballot_options where ballot_id=b.id)<2 then raise exception 'At least two ballot choices are required.';end if;
 delete from public.network_ballot_eligibility where ballot_id=b.id;
 if b.eligibility_mode='members' then
  insert into public.network_ballot_eligibility(network_id,ballot_id,user_id,source) select nid,b.id,nm.user_id,'member' from public.network_memberships nm where nm.network_id=nid and nm.status='active' on conflict do nothing;
 elsif b.eligibility_mode='admins' then
  insert into public.network_ballot_eligibility(network_id,ballot_id,user_id,source) select nid,b.id,nm.user_id,'admin' from public.network_memberships nm where nm.network_id=nid and nm.status='active' and nm.role in ('owner','admin') on conflict do nothing;
 else
  insert into public.network_ballot_eligibility(network_id,ballot_id,user_id,source)
  select distinct nid,b.id,rep.owner_user_id,'family_representative' from public.family_association_family_memberships m join public.family_association_membership_years y on y.id=m.membership_year_id and y.network_id=m.network_id join public.network_entities rep on rep.id=m.representative_entity_id and rep.network_id=m.network_id join public.network_memberships nm on nm.network_id=m.network_id and nm.user_id=rep.owner_user_id and nm.status='active' where m.network_id=nid and m.status in ('active','grace') and y.status='open' and rep.owner_user_id is not null on conflict do nothing;
 end if;
 select count(*) into cnt from public.network_ballot_eligibility where ballot_id=b.id;if cnt=0 then raise exception 'No eligible voters were found for this ballot.';end if;
 update public.network_ballots set status='open',opens_at=coalesce(opens_at,now()),updated_at=now() where id=b.id;
 for r in select user_id from public.network_ballot_eligibility where ballot_id=b.id loop perform public.create_network_notification(nid,r.user_id,'ballot_opened',case when b.ballot_type='election' then 'Election voting is open' else 'New poll is open' end,b.title,'elections','ballot',b.id,'high',jsonb_build_object('ballot_type',b.ballot_type),auth.uid());end loop;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'network_ballot_opened',jsonb_build_object('ballot_id',b.id,'eligible_voters',cnt));return cnt;
end $$;
revoke all on function public.open_network_ballot(uuid) from public;grant execute on function public.open_network_ballot(uuid) to authenticated;

create or replace function public.cast_network_ballot_vote(p_ballot_id uuid,p_option_ids uuid[]) returns uuid
language plpgsql security definer set search_path=public as $$ declare nid uuid:=public.current_network_id();b public.network_ballots%rowtype;token uuid:=gen_random_uuid();receipt uuid;choice uuid;choices uuid[];begin
 if nid is null or not public.is_network_member(nid) then raise exception 'Network membership required.' using errcode='42501';end if;select * into b from public.network_ballots where id=p_ballot_id and network_id=nid and status='open';if not found then raise exception 'Voting is not open.';end if;
 if b.opens_at is not null and now()<b.opens_at then raise exception 'Voting has not opened yet.';end if;if b.closes_at is not null and now()>b.closes_at then raise exception 'Voting has closed.';end if;
 if not exists(select 1 from public.network_ballot_eligibility where ballot_id=b.id and user_id=auth.uid()) then raise exception 'You are not eligible to vote in this ballot.' using errcode='42501';end if;
 if exists(select 1 from public.network_ballot_participation where ballot_id=b.id and user_id=auth.uid()) then raise exception 'Your vote has already been recorded.' using errcode='23505';end if;
 select array_agg(distinct x) into choices from unnest(coalesce(p_option_ids,'{}'::uuid[])) x;if choices is null or cardinality(choices)<1 or cardinality(choices)>b.max_choices then raise exception 'Choose between 1 and % option(s).',b.max_choices;end if;
 if exists(select 1 from unnest(choices) x where not exists(select 1 from public.network_ballot_options o where o.id=x and o.ballot_id=b.id and o.network_id=nid)) then raise exception 'One or more choices are invalid.';end if;
 insert into public.network_ballot_participation(network_id,ballot_id,user_id,choice_count) values(nid,b.id,auth.uid(),cardinality(choices)) returning receipt_id into receipt;
 foreach choice in array choices loop insert into public.network_ballot_votes(network_id,ballot_id,option_id,anonymous_token,voter_user_id) values(nid,b.id,choice,token,case when b.secret_ballot then null else auth.uid() end);end loop;
 insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'network_ballot_vote_cast',jsonb_build_object('ballot_id',b.id,'choice_count',cardinality(choices),'secret_ballot',b.secret_ballot));return receipt;
end $$;
revoke all on function public.cast_network_ballot_vote(uuid,uuid[]) from public;grant execute on function public.cast_network_ballot_vote(uuid,uuid[]) to authenticated;

create or replace function public.close_network_ballot(p_ballot_id uuid) returns void
language plpgsql security definer set search_path=public as $$ declare nid uuid:=public.current_network_id();begin if nid is null or not public.is_network_admin(nid) then raise exception 'Network admin access required.' using errcode='42501';end if;update public.network_ballots set status='closed',closes_at=coalesce(closes_at,now()),updated_at=now() where id=p_ballot_id and network_id=nid and status='open';if not found then raise exception 'Open ballot not found.';end if;insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'network_ballot_closed',jsonb_build_object('ballot_id',p_ballot_id));end $$;
revoke all on function public.close_network_ballot(uuid) from public;grant execute on function public.close_network_ballot(uuid) to authenticated;

create or replace function public.publish_network_ballot_results(p_ballot_id uuid) returns void
language plpgsql security definer set search_path=public as $$ declare nid uuid:=public.current_network_id();b public.network_ballots%rowtype;r record;begin if nid is null or not public.is_network_admin(nid) then raise exception 'Network admin access required.' using errcode='42501';end if;update public.network_ballots set status='published',results_published_at=now(),updated_at=now() where id=p_ballot_id and network_id=nid and status in ('closed','published') returning * into b;if not found then raise exception 'Close the ballot before publishing results.';end if;for r in select user_id from public.network_ballot_eligibility where ballot_id=b.id loop perform public.create_network_notification(nid,r.user_id,'ballot_results',case when b.ballot_type='election' then 'Election results published' else 'Poll results published' end,b.title,'elections','ballot',b.id,'normal','{}'::jsonb,auth.uid());end loop;insert into public.audit_log(network_id,actor_id,action,details) values(nid,auth.uid(),'network_ballot_results_published',jsonb_build_object('ballot_id',b.id));end $$;
revoke all on function public.publish_network_ballot_results(uuid) from public;grant execute on function public.publish_network_ballot_results(uuid) to authenticated;

create or replace function public.get_network_ballots_snapshot()
returns jsonb language plpgsql security definer stable set search_path=public as $$ declare nid uuid:=public.current_network_id();admin boolean;begin
 if nid is null or not public.is_network_member(nid) then raise exception 'Network membership required.' using errcode='42501';end if;admin:=public.is_network_admin(nid);
 return jsonb_build_object(
  'is_admin',admin,
  'people',coalesce((select jsonb_agg(jsonb_build_object('id',e.id,'label',e.label) order by e.label) from public.network_entities e where e.network_id=nid and e.kind='person'),'[]'::jsonb),
  'ballots',coalesce((select jsonb_agg(jsonb_build_object(
   'id',b.id,'ballot_type',b.ballot_type,'title',b.title,'description',b.description,'status',b.status,'eligibility_mode',b.eligibility_mode,'max_choices',b.max_choices,'secret_ballot',b.secret_ballot,'allow_nominations',b.allow_nominations,'opens_at',b.opens_at,'closes_at',b.closes_at,
   'eligible_count',(select count(*) from public.network_ballot_eligibility e where e.ballot_id=b.id),
   'participation_count',(select count(*) from public.network_ballot_participation p where p.ballot_id=b.id),
   'has_voted',exists(select 1 from public.network_ballot_participation p where p.ballot_id=b.id and p.user_id=auth.uid()),
   'can_vote',(b.status='open' and (b.opens_at is null or now()>=b.opens_at) and (b.closes_at is null or now()<=b.closes_at) and exists(select 1 from public.network_ballot_eligibility e where e.ballot_id=b.id and e.user_id=auth.uid()) and not exists(select 1 from public.network_ballot_participation p where p.ballot_id=b.id and p.user_id=auth.uid())),
   'options',coalesce((select jsonb_agg(jsonb_build_object('id',o.id,'label',o.label,'description',o.description,'candidate_entity_id',o.candidate_entity_id,'votes',case when b.status='published' or (admin and b.status in ('closed','published')) then (select count(*) from public.network_ballot_votes v where v.option_id=o.id) else null end) order by o.sort_order,o.label) from public.network_ballot_options o where o.ballot_id=b.id),'[]'::jsonb),
   'nominations',coalesce((select jsonb_agg(jsonb_build_object('id',n.id,'nominee_entity_id',n.nominee_entity_id,'nominee_label',n.nominee_label,'statement',n.statement,'status',n.status,'nominated_by_me',n.nominated_by=auth.uid()) order by n.created_at desc) from public.network_ballot_nominations n where n.ballot_id=b.id and (admin or n.status='approved' or n.nominated_by=auth.uid())),'[]'::jsonb)
  ) order by b.created_at desc) from public.network_ballots b where b.network_id=nid and (admin or b.status<>'draft' or (b.status='draft' and b.allow_nominations and b.ballot_type='election') or b.created_by=auth.uid())),'[]'::jsonb)
 );
end $$;
revoke all on function public.get_network_ballots_snapshot() from public;grant execute on function public.get_network_ballots_snapshot() to authenticated;
