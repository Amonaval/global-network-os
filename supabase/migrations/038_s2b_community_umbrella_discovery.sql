-- S2-B — Community umbrella + opt-in cross-family discovery
-- Families stay private. Only explicitly published community cards/posts cross family boundaries.

create table if not exists public.community_spaces(
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.community_spaces(id) on delete set null,
  name varchar(160) not null,
  slug varchar(180) not null unique,
  space_type varchar(32) not null default 'community' check(space_type in ('community','city','chapter','association','other')),
  city varchar(120), state varchar(120), country varchar(120),
  status varchar(20) not null default 'active' check(status in ('active','archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.community_family_links(
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.community_spaces(id) on delete cascade,
  network_id uuid not null references public.networks(id) on delete cascade,
  status varchar(20) not null default 'pending' check(status in ('pending','approved','rejected')),
  requested_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(space_id,network_id)
);

create table if not exists public.community_profile_cards(
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.community_spaces(id) on delete cascade,
  network_id uuid not null references public.networks(id) on delete cascade,
  member_id uuid not null references public.family_members(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  category varchar(40) not null check(category in ('marriage','professional','service','mentor','speaker','education','social_service','business','arts','other')),
  display_name varchar(180) not null,
  photo_url text,
  profession varchar(160),
  city varchar(120),
  headline varchar(180),
  summary text,
  contact_mode varchar(24) not null default 'family_intro' check(contact_mode in ('family_intro','direct_request')),
  featured boolean not null default false,
  featured_label varchar(120),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(space_id,member_id,category)
);

create table if not exists public.community_posts(
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.community_spaces(id) on delete cascade,
  network_id uuid not null references public.networks(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  target_member_id uuid references public.family_members(id) on delete set null,
  category varchar(40) not null check(category in ('marriage','professional','service','event','opportunity','announcement','help','other')),
  title varchar(220) not null,
  body text,
  city varchar(120),
  status varchar(20) not null default 'open' check(status in ('open','closed','expired')),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_community_family_links_network on public.community_family_links(network_id,status);
create index if not exists idx_community_profile_cards_space on public.community_profile_cards(space_id,category,active);
create index if not exists idx_community_posts_space on public.community_posts(space_id,category,status,created_at desc);

alter table public.community_spaces enable row level security;
alter table public.community_family_links enable row level security;
alter table public.community_profile_cards enable row level security;
alter table public.community_posts enable row level security;

-- No direct client table access. Security-definer RPCs below expose only governed snapshots.
revoke all on public.community_spaces,public.community_family_links,public.community_profile_cards,public.community_posts from anon,authenticated;

create or replace function public.community_space_is_allowed(p_space_id uuid,p_network_id uuid default public.current_network_id()) returns boolean
language sql security definer stable set search_path=public as $$
  with recursive ancestors as (
    select s.id,s.parent_id from public.community_spaces s where s.id=p_space_id
    union all select p.id,p.parent_id from public.community_spaces p join ancestors a on a.parent_id=p.id
  )
  select exists(
    select 1 from public.community_family_links l
    where l.network_id=p_network_id and l.status='approved' and l.space_id in (select id from ancestors)
  ) or exists(
    with recursive linked_ancestors as (
      select s.id,s.parent_id from public.community_spaces s
      join public.community_family_links l on l.space_id=s.id
      where l.network_id=p_network_id and l.status='approved'
      union all select p.id,p.parent_id from public.community_spaces p join linked_ancestors a on a.parent_id=p.id
    ) select 1 from linked_ancestors where id=p_space_id
  );
$$;
revoke all on function public.community_space_is_allowed(uuid,uuid) from public;
grant execute on function public.community_space_is_allowed(uuid,uuid) to authenticated;

create or replace function public.get_community_spaces()
returns table(id uuid,parent_id uuid,name varchar,slug varchar,space_type varchar,city varchar,state varchar,country varchar,family_status varchar,family_count bigint)
language sql security definer stable set search_path=public as $$
  with recursive tree(root_id,id) as (
    select id,id from public.community_spaces where status='active'
    union all
    select t.root_id,s.id from tree t join public.community_spaces s on s.parent_id=t.id where s.status='active'
  ), counts as (
    select t.root_id,count(distinct l.network_id)::bigint family_count
    from tree t left join public.community_family_links l on l.space_id=t.id and l.status='approved' group by t.root_id
  )
  select s.id,s.parent_id,s.name,s.slug,s.space_type,s.city,s.state,s.country,
    coalesce(l.status,case when public.community_space_is_allowed(s.id,public.current_network_id()) then 'approved'::varchar end),coalesce(c.family_count,0)
  from public.community_spaces s
  left join public.community_family_links l on l.space_id=s.id and l.network_id=public.current_network_id()
  left join counts c on c.root_id=s.id
  where s.status='active' and auth.uid() is not null
  order by coalesce(s.parent_id,s.id),s.parent_id nulls first,s.name;
$$;
revoke all on function public.get_community_spaces() from public;
grant execute on function public.get_community_spaces() to authenticated;

create or replace function public.create_community_space(p_name text,p_slug text,p_space_type text default 'community',p_parent_id uuid default null,p_city text default null,p_state text default null,p_country text default 'India') returns uuid
language plpgsql security definer set search_path=public as $$
declare rid uuid;
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access required.' using errcode='42501'; end if;
  if length(trim(p_name))<2 or length(trim(p_slug))<2 then raise exception 'Community name and slug are required.' using errcode='22023'; end if;
  insert into public.community_spaces(parent_id,name,slug,space_type,city,state,country,created_by)
  values(p_parent_id,trim(p_name),lower(regexp_replace(trim(p_slug),'[^a-zA-Z0-9]+','-','g')),p_space_type,p_city,p_state,p_country,auth.uid()) returning id into rid;
  return rid;
end $$;
revoke all on function public.create_community_space(text,text,text,uuid,text,text,text) from public;
grant execute on function public.create_community_space(text,text,text,uuid,text,text,text) to authenticated;

create or replace function public.request_family_community_link(p_space_id uuid) returns uuid
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); rid uuid;
begin
  if nid is null or not public.is_network_admin(nid) then raise exception 'Family Owner/admin access required.' using errcode='42501'; end if;
  if not exists(select 1 from public.community_spaces where id=p_space_id and status='active') then raise exception 'Community not found.' using errcode='22023'; end if;
  insert into public.community_family_links(space_id,network_id,status,requested_by)
  values(p_space_id,nid,case when public.is_platform_owner() then 'approved' else 'pending' end,auth.uid())
  on conflict(space_id,network_id) do update set status=excluded.status,requested_by=auth.uid(),created_at=now()
  returning id into rid;
  return rid;
end $$;
revoke all on function public.request_family_community_link(uuid) from public;
grant execute on function public.request_family_community_link(uuid) to authenticated;

create or replace function public.get_pending_community_links()
returns table(id uuid,space_id uuid,space_name varchar,network_id uuid,family_name varchar,created_at timestamptz)
language sql security definer stable set search_path=public as $$
  select l.id,l.space_id,s.name,l.network_id,n.name,l.created_at
  from public.community_family_links l join public.community_spaces s on s.id=l.space_id join public.networks n on n.id=l.network_id
  where l.status='pending' and public.is_platform_owner() order by l.created_at;
$$;
revoke all on function public.get_pending_community_links() from public;
grant execute on function public.get_pending_community_links() to authenticated;

create or replace function public.review_community_link(p_link_id uuid,p_approve boolean) returns void
language plpgsql security definer set search_path=public as $$
begin
 if not public.is_platform_owner() then raise exception 'Platform owner access required.' using errcode='42501'; end if;
 update public.community_family_links set status=case when p_approve then 'approved' else 'rejected' end,reviewed_by=auth.uid(),reviewed_at=now() where id=p_link_id;
end $$;
revoke all on function public.review_community_link(uuid,boolean) from public;
grant execute on function public.review_community_link(uuid,boolean) to authenticated;

create or replace function public.publish_my_community_profile(p_member_id uuid,p_space_id uuid,p_category text,p_headline text default null,p_summary text default null,p_contact_mode text default 'family_intro') returns uuid
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); mine uuid; m public.family_members%rowtype; rid uuid;
begin
 select member_id into mine from public.network_memberships where network_id=nid and user_id=auth.uid() and status='active';
 if mine is null or mine<>p_member_id then raise exception 'You can publish only your own community profile.' using errcode='42501'; end if;
 if not public.community_space_is_allowed(p_space_id,nid) then raise exception 'Your family is not connected to this community.' using errcode='42501'; end if;
 select * into m from public.family_members where id=p_member_id and network_id=nid;
 if m.id is null then raise exception 'Family profile not found.' using errcode='22023'; end if;
 insert into public.community_profile_cards(space_id,network_id,member_id,owner_user_id,category,display_name,photo_url,profession,city,headline,summary,contact_mode,active,updated_at)
 values(p_space_id,nid,p_member_id,auth.uid(),p_category,m.full_name,m.photo_url,m.profession,m.city,nullif(trim(p_headline),''),nullif(trim(p_summary),''),p_contact_mode,true,now())
 on conflict(space_id,member_id,category) do update set display_name=excluded.display_name,photo_url=excluded.photo_url,profession=excluded.profession,city=excluded.city,headline=excluded.headline,summary=excluded.summary,contact_mode=excluded.contact_mode,active=true,updated_at=now()
 returning id into rid;
 return rid;
end $$;
revoke all on function public.publish_my_community_profile(uuid,uuid,text,text,text,text) from public;
grant execute on function public.publish_my_community_profile(uuid,uuid,text,text,text,text) to authenticated;

create or replace function public.unpublish_my_community_profile(p_card_id uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
 update public.community_profile_cards set active=false,updated_at=now() where id=p_card_id and owner_user_id=auth.uid();
 if not found then raise exception 'Profile card not found or not owned by you.' using errcode='42501'; end if;
end $$;
revoke all on function public.unpublish_my_community_profile(uuid) from public;
grant execute on function public.unpublish_my_community_profile(uuid) to authenticated;

create or replace function public.search_community_profiles(p_space_id uuid,p_category text default null,p_query text default null)
returns table(id uuid,space_id uuid,space_name varchar,network_id uuid,family_name varchar,member_id uuid,category varchar,display_name varchar,photo_url text,profession varchar,city varchar,headline varchar,summary text,contact_mode varchar,featured boolean,featured_label varchar,is_mine boolean)
language sql security definer stable set search_path=public as $$
  with recursive scope as (
    select id from public.community_spaces where id=p_space_id
    union all select s.id from public.community_spaces s join scope p on s.parent_id=p.id
  )
  select c.id,c.space_id,s.name,c.network_id,n.name,c.member_id,c.category,c.display_name,c.photo_url,c.profession,c.city,c.headline,c.summary,c.contact_mode,c.featured,c.featured_label,(c.owner_user_id=auth.uid())
  from public.community_profile_cards c join public.community_spaces s on s.id=c.space_id join public.networks n on n.id=c.network_id
  where c.active and c.space_id in(select id from scope)
    and public.community_space_is_allowed(p_space_id,public.current_network_id())
    and (p_category is null or p_category='' or c.category=p_category)
    and (p_query is null or p_query='' or concat_ws(' ',c.display_name,c.profession,c.city,c.headline,c.summary,n.name) ilike '%'||p_query||'%')
  order by c.featured desc,c.updated_at desc limit 200;
$$;
revoke all on function public.search_community_profiles(uuid,text,text) from public;
grant execute on function public.search_community_profiles(uuid,text,text) to authenticated;

create or replace function public.publish_community_post(p_space_id uuid,p_category text,p_title text,p_body text default null,p_city text default null,p_target_member_id uuid default null) returns uuid
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id(); mine uuid; rid uuid;
begin
 if nid is null or not public.community_space_is_allowed(p_space_id,nid) then raise exception 'Your family is not connected to this community.' using errcode='42501'; end if;
 select member_id into mine from public.network_memberships where network_id=nid and user_id=auth.uid() and status='active';
 if length(trim(p_title))<3 then raise exception 'A clear title is required.' using errcode='22023'; end if;
 if p_target_member_id is not null and p_target_member_id<>mine and not public.is_network_admin(nid) then raise exception 'Only a Family Owner/admin can publish for another member.' using errcode='42501'; end if;
 if p_category='marriage' and p_target_member_id is not null and not exists(select 1 from public.community_profile_cards c where c.member_id=p_target_member_id and c.space_id=p_space_id and c.category='marriage' and c.active) then
   raise exception 'The person must first opt in with a marriage community profile.' using errcode='42501';
 end if;
 insert into public.community_posts(space_id,network_id,author_user_id,target_member_id,category,title,body,city)
 values(p_space_id,nid,auth.uid(),p_target_member_id,p_category,trim(p_title),nullif(trim(p_body),''),nullif(trim(p_city),'')) returning id into rid;
 return rid;
end $$;
revoke all on function public.publish_community_post(uuid,text,text,text,text,uuid) from public;
grant execute on function public.publish_community_post(uuid,text,text,text,text,uuid) to authenticated;

create or replace function public.get_community_posts(p_space_id uuid,p_category text default null)
returns table(id uuid,space_id uuid,space_name varchar,network_id uuid,family_name varchar,target_member_id uuid,category varchar,title varchar,body text,city varchar,status varchar,created_at timestamptz)
language sql security definer stable set search_path=public as $$
  with recursive scope as (select id from public.community_spaces where id=p_space_id union all select s.id from public.community_spaces s join scope p on s.parent_id=p.id)
  select p.id,p.space_id,s.name,p.network_id,n.name,p.target_member_id,p.category,p.title,p.body,p.city,p.status,p.created_at
  from public.community_posts p join public.community_spaces s on s.id=p.space_id join public.networks n on n.id=p.network_id
  where p.status='open' and p.space_id in(select id from scope) and public.community_space_is_allowed(p_space_id,public.current_network_id())
    and (p_category is null or p_category='' or p.category=p_category)
  order by p.created_at desc limit 200;
$$;
revoke all on function public.get_community_posts(uuid,text) from public;
grant execute on function public.get_community_posts(uuid,text) to authenticated;

create or replace function public.set_community_profile_featured(p_card_id uuid,p_featured boolean,p_label text default null) returns void
language plpgsql security definer set search_path=public as $$
begin
 if not public.is_platform_owner() then raise exception 'Platform owner access required.' using errcode='42501'; end if;
 update public.community_profile_cards set featured=p_featured,featured_label=case when p_featured then nullif(trim(p_label),'') else null end,updated_at=now() where id=p_card_id;
end $$;
revoke all on function public.set_community_profile_featured(uuid,boolean,text) from public;
grant execute on function public.set_community_profile_featured(uuid,boolean,text) to authenticated;

comment on table public.community_profile_cards is 'S2-B opt-in cross-family discovery snapshots. No private family graph/contact fields are exposed.';
comment on function public.publish_my_community_profile(uuid,uuid,text,text,text,text) is 'A user can opt in only their own claimed family profile to community discovery.';
