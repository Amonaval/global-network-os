-- CR2.2 — Explicit family context after creation + progressive onboarding support.
-- Fixes the fresh-family race where save_network_settings depended on current_network_id()
-- immediately after create_family(), producing "No active family selected.".

create or replace function public.save_network_settings(
  p_network_id uuid,
  p_name text,
  p_description text default '',
  p_entity_label text default 'Member',
  p_entity_label_plural text default 'Members',
  p_level_label text default 'Generation',
  p_level_label_plural text default 'Generations',
  p_parent_label text default 'Parent',
  p_child_label text default 'Child',
  p_peer_label text default 'Spouse',
  p_network_template text default 'family',
  p_self_edit_mode text default 'review',
  p_family_milestones_enabled boolean default true,
  p_photo_upload_enabled boolean default false
) returns void
language plpgsql security definer set search_path=public as $$
declare
  nid uuid:=coalesce(p_network_id,public.current_network_id());
begin
  if nid is null then raise exception 'No family selected.' using errcode='42501'; end if;
  if not exists(
    select 1 from public.network_memberships nm
    where nm.network_id=nid and nm.user_id=auth.uid() and nm.status='active' and nm.role in ('owner','admin')
  ) and not public.is_platform_owner() then
    raise exception 'Family administrator access required.' using errcode='42501';
  end if;

  update public.network_settings
  set name=left(coalesce(nullif(trim(p_name),''),name),180),
      description=coalesce(p_description,''),
      entity_label=coalesce(nullif(trim(p_entity_label),''),'Member'),
      entity_label_plural=coalesce(nullif(trim(p_entity_label_plural),''),'Members'),
      level_label=coalesce(nullif(trim(p_level_label),''),'Generation'),
      level_label_plural=coalesce(nullif(trim(p_level_label_plural),''),'Generations'),
      parent_label=coalesce(nullif(trim(p_parent_label),''),'Parent'),
      child_label=coalesce(nullif(trim(p_child_label),''),'Child'),
      peer_label=coalesce(nullif(trim(p_peer_label),''),'Spouse'),
      network_template=coalesce(nullif(trim(p_network_template),''),'family'),
      self_edit_mode=coalesce(nullif(trim(p_self_edit_mode),''),'review'),
      family_milestones_enabled=coalesce(p_family_milestones_enabled,true),
      photo_upload_enabled=coalesce(p_photo_upload_enabled,false)
  where network_id=nid;

  if not found then
    insert into public.network_settings(
      id,network_id,name,description,entity_label,entity_label_plural,level_label,level_label_plural,
      parent_label,child_label,peer_label,network_template,self_edit_mode,family_milestones_enabled,photo_upload_enabled
    ) values(
      'network',nid,left(trim(coalesce(p_name,'Our Family')),180),coalesce(p_description,''),
      coalesce(nullif(trim(p_entity_label),''),'Member'),coalesce(nullif(trim(p_entity_label_plural),''),'Members'),
      coalesce(nullif(trim(p_level_label),''),'Generation'),coalesce(nullif(trim(p_level_label_plural),''),'Generations'),
      coalesce(nullif(trim(p_parent_label),''),'Parent'),coalesce(nullif(trim(p_child_label),''),'Child'),
      coalesce(nullif(trim(p_peer_label),''),'Spouse'),coalesce(nullif(trim(p_network_template),''),'family'),
      coalesce(nullif(trim(p_self_edit_mode),''),'review'),coalesce(p_family_milestones_enabled,true),coalesce(p_photo_upload_enabled,false)
    );
  end if;

  -- Keep the new family active for the creator even if the previous client session was stale.
  update public.profiles set active_network_id=nid,updated_at=now() where id=auth.uid();
end;$$;

revoke all on function public.save_network_settings(uuid,text,text,text,text,text,text,text,text,text,text,text,boolean,boolean) from public;
grant execute on function public.save_network_settings(uuid,text,text,text,text,text,text,text,text,text,text,text,boolean,boolean) to authenticated;
