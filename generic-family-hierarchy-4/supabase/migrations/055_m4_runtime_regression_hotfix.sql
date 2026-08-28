-- Mission 4 runtime regression hotfix
-- Fixes legacy RPC ambiguity observed during post-Mission-4 regression and
-- hardens quiet-digest preference lookup. No schema or permission expansion.

create or replace function public.create_bulk_member_invitations(p_items jsonb,p_expires_days integer default 7)
returns table(invitation_id uuid,member_id uuid,token text)
language plpgsql security definer set search_path=public,extensions as $$
declare item jsonb; raw_token text; target uuid; created uuid; channel text; hint text; nid uuid:=public.current_network_id();
begin
  if nid is null or not public.is_network_admin(nid) then raise exception 'Family administrator access is required.' using errcode='42501'; end if;
  if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 or jsonb_array_length(p_items)>200 then
    raise exception 'Provide between 1 and 200 invitation items.' using errcode='22023';
  end if;
  for item in select value from jsonb_array_elements(p_items) loop
    begin target := (item->>'member_id')::uuid; exception when others then
      raise exception 'Every invitation needs a valid member ID.' using errcode='22023'; end;
    raw_token:=item->>'token'; channel:=coalesce(nullif(item->>'channel',''),'link');
    hint:=nullif(left(trim(item->>'recipient_hint'),160),'');
    if length(coalesce(raw_token,''))<32 then raise exception 'Every invitation needs a strong token.' using errcode='22023'; end if;
    if channel not in ('link','email','whatsapp','sms','print','other') then raise exception 'Invalid delivery channel.' using errcode='22023'; end if;
    if not exists(select 1 from public.family_members fm where fm.id=target and fm.network_id=nid and fm.profile_status='approved') then
      raise exception 'Approved family member not found.' using errcode='P0002'; end if;
    if exists(select 1 from public.network_memberships nm where nm.network_id=nid and nm.member_id=target and nm.status='active') then
      raise exception 'A selected member profile is already claimed.' using errcode='23505'; end if;
    update public.member_invitations mi set revoked_at=now(),revoked_by=auth.uid()
      where mi.network_id=nid and mi.member_id=target and mi.used_at is null and mi.revoked_at is null and mi.expires_at>now();
    insert into public.member_invitations(network_id,member_id,token_hash,created_by,expires_at,last_sent_at,delivery_channel,recipient_hint)
    values(nid,target,encode(digest(raw_token,'sha256'),'hex'),auth.uid(),
      now()+make_interval(days=>greatest(1,least(coalesce(p_expires_days,7),30))),now(),channel,hint)
    returning id into created;
    insert into public.audit_log(network_id,actor_id,action,details)
      values(nid,auth.uid(),'member_invitation_created',jsonb_build_object('invitation_id',created,'member_id',target,'channel',channel));
    invitation_id:=created; member_id:=target; token:=raw_token; return next;
  end loop;
end;
$$;
revoke all on function public.create_bulk_member_invitations(jsonb,integer) from public;
grant execute on function public.create_bulk_member_invitations(jsonb,integer) to authenticated;

create or replace function public.get_my_notification_preferences() returns jsonb
language plpgsql security definer stable set search_path=public as $$
declare nid uuid:=public.current_network_id(); result jsonb;
begin
 if auth.uid() is null or nid is null then raise exception 'Active family is required.' using errcode='42501'; end if;
 select jsonb_build_object(
   'digest',np.digest,'special_days',np.special_days,'memories',np.memories,'gatherings',np.gatherings,
   'contributions',np.contributions,'introductions',np.introductions,'family_changes',np.family_changes,
   'preferred_weekday',np.preferred_weekday
 ) into result
 from public.notification_preferences np
 where np.network_id=nid and np.user_id=auth.uid();
 return coalesce(result,jsonb_build_object(
   'digest','weekly','special_days',true,'memories',false,'gatherings',true,
   'contributions',true,'introductions',true,'family_changes',true,'preferred_weekday',0
 ));
end;$$;
revoke all on function public.get_my_notification_preferences() from public;
grant execute on function public.get_my_notification_preferences() to authenticated;
