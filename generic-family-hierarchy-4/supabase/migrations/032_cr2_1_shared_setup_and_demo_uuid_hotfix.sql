-- CR2.1: eliminate direct RLS write after family creation and keep settings tenant-scoped.

create or replace function public.save_network_settings(
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
declare nid uuid:=public.current_network_id();
begin
  if nid is null then raise exception 'No active family selected.' using errcode='42501'; end if;
  if not public.is_network_admin(nid) then raise exception 'Family administrator access required.' using errcode='42501'; end if;

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
    raise exception 'Family settings were not initialized. Re-run migration 031 or recreate the family.' using errcode='P0002';
  end if;
end;$$;

revoke all on function public.save_network_settings(text,text,text,text,text,text,text,text,text,text,text,boolean,boolean) from public;
grant execute on function public.save_network_settings(text,text,text,text,text,text,text,text,text,text,text,boolean,boolean) to authenticated;
