-- OPTIONAL S2-B showcase seed. Safe for the recognized Nawal/Naval/Sample demo family only.
-- Run after migration 038 when you want the shared demo database to demonstrate the community umbrella.
do $$
declare root_id uuid; pune_id uuid; east_id uuid; demo_network uuid;
begin
  insert into public.community_spaces(name,slug,space_type,country)
  values('Maheshwari Community','maheshwari','community','India')
  on conflict(slug) do update set status='active' returning id into root_id;

  insert into public.community_spaces(parent_id,name,slug,space_type,city,state,country)
  values(root_id,'Pune Maheshwari','maheshwari-pune','city','Pune','Maharashtra','India')
  on conflict(slug) do update set parent_id=excluded.parent_id,status='active' returning id into pune_id;

  insert into public.community_spaces(parent_id,name,slug,space_type,city,state,country)
  values(pune_id,'East Pune Circle','maheshwari-east-pune','chapter','Pune','Maharashtra','India')
  on conflict(slug) do update set parent_id=excluded.parent_id,status='active' returning id into east_id;

  select id into demo_network from public.networks
  where lower(name) ~ '(nawal|naval|sample)' or slug='our-family'
  order by created_at limit 1;

  if demo_network is not null then
    insert into public.community_family_links(space_id,network_id,status)
    values(east_id,demo_network,'approved')
    on conflict(space_id,network_id) do update set status='approved',reviewed_at=now();
  end if;
end $$;
