-- Replace YOUR_ORGANIZATION_NETWORK_UUID, then run after CSV import.
do $$
declare nid uuid := 'YOUR_ORGANIZATION_NETWORK_UUID'::uuid;
begin
 if not exists(select 1 from public.networks where id=nid and vertical_kind='organization') then
   raise exception 'Supplied id is not an Organization network';
 end if;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'reports_to',jsonb_build_object('source','northstar-demo','purpose','Reporting line')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Rahul Verma') and lower(t.label)=lower('Arjun Desai')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'reports_to',jsonb_build_object('source','northstar-demo','purpose','Reporting line')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Priya Nair') and lower(t.label)=lower('Arjun Desai')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'reports_to',jsonb_build_object('source','northstar-demo','purpose','Reporting line')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Aman Shah') and lower(t.label)=lower('Arjun Desai')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'reports_to',jsonb_build_object('source','northstar-demo','purpose','Reporting line')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Arjun Desai') and lower(t.label)=lower('Kavita Rao')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'reports_to',jsonb_build_object('source','northstar-demo','purpose','Reporting line')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Ishita Sen') and lower(t.label)=lower('Kavita Rao')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'reports_to',jsonb_build_object('source','northstar-demo','purpose','Reporting line')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Vikram Joshi') and lower(t.label)=lower('Kavita Rao')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'reports_to',jsonb_build_object('source','northstar-demo','purpose','Reporting line')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Rohan Kulkarni') and lower(t.label)=lower('Kavita Rao')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'reports_to',jsonb_build_object('source','northstar-demo','purpose','Reporting line')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Neha Iyer') and lower(t.label)=lower('Kavita Rao')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'reports_to',jsonb_build_object('source','northstar-demo','purpose','Reporting line')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Karan Malhotra') and lower(t.label)=lower('Neha Iyer')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'reports_to',jsonb_build_object('source','northstar-demo','purpose','Reporting line')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Sana Khan') and lower(t.label)=lower('Karan Malhotra')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'reports_to',jsonb_build_object('source','northstar-demo','purpose','Reporting line')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Nikhil Bansal') and lower(t.label)=lower('Neha Iyer')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'reports_to',jsonb_build_object('source','northstar-demo','purpose','Reporting line')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Meera Rao') and lower(t.label)=lower('Kavita Rao')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'reports_to',jsonb_build_object('source','northstar-demo','purpose','Reporting line')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Dev Patel') and lower(t.label)=lower('Kavita Rao')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'reports_to',jsonb_build_object('source','northstar-demo','purpose','Reporting line')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Ananya Gupta') and lower(t.label)=lower('Neha Iyer')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'works_with',jsonb_build_object('source','northstar-demo','purpose','Identity architecture pairing')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Rahul Verma') and lower(t.label)=lower('Priya Nair')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'works_with',jsonb_build_object('source','northstar-demo','purpose','Authentication security reviews')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Rahul Verma') and lower(t.label)=lower('Ishita Sen')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'works_with',jsonb_build_object('source','northstar-demo','purpose','Reliability rotation')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Vikram Joshi') and lower(t.label)=lower('Rohan Kulkarni')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'works_with',jsonb_build_object('source','northstar-demo','purpose','Project Phoenix leadership')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Neha Iyer') and lower(t.label)=lower('Ananya Gupta')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'works_with',jsonb_build_object('source','northstar-demo','purpose','Checkout event integration')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Sana Khan') and lower(t.label)=lower('Meera Rao')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;

 insert into public.network_entity_relationships(network_id,from_entity_id,to_entity_id,relationship_type,metadata)
 select nid,f.id,t.id,'works_with',jsonb_build_object('source','northstar-demo','purpose','Event Mesh architecture')
 from public.network_entities f
 join public.network_entities t on t.network_id=f.network_id
 where f.network_id=nid and lower(f.label)=lower('Dev Patel') and lower(t.label)=lower('Meera Rao')
 on conflict(network_id,from_entity_id,to_entity_id,relationship_type)
 do update set metadata=network_entity_relationships.metadata||excluded.metadata;
end $$;
