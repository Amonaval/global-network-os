-- E9 — Community posts, important broadcasts and engagement routing.
-- Reuses network_activities so the product has one engagement engine instead of a second social feed.

create or replace function public.get_network_activity_social_flags()
returns table(activity_id uuid, metadata jsonb, author_label text, created_at timestamptz)
language sql security definer stable set search_path=public as $$
  select a.id,
         coalesce(a.metadata,'{}'::jsonb),
         coalesce(e.label,'Community member')::text,
         a.created_at
  from public.network_activities a
  left join public.network_entities e
    on e.network_id=a.network_id and e.owner_user_id=a.created_by
  where a.network_id=public.current_network_id()
    and public.is_network_member(a.network_id)
    and (a.visibility='members' or a.created_by=auth.uid() or public.is_network_admin(a.network_id));
$$;
revoke all on function public.get_network_activity_social_flags() from public;
grant execute on function public.get_network_activity_social_flags() to authenticated;

create or replace function public.create_network_post(
  p_title text,
  p_body text default null,
  p_importance text default 'normal',
  p_notify_all boolean default false
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare
  nid uuid:=public.current_network_id();
  activity_id uuid;
  target uuid;
  notification_id uuid;
  notification_ids uuid[]:=array[]::uuid[];
  meta jsonb;
begin
  if auth.uid() is null or nid is null or not public.is_network_member(nid) then
    raise exception 'Network membership required.' using errcode='42501';
  end if;
  if length(trim(coalesce(p_title,'')))<2 then raise exception 'Post title is required.' using errcode='22023'; end if;
  if p_importance not in ('normal','important','urgent') then raise exception 'Invalid importance.' using errcode='22023'; end if;
  if (p_importance<>'normal' or p_notify_all) and not public.is_network_admin(nid) then
    raise exception 'Only a network administrator can publish important or urgent broadcasts.' using errcode='42501';
  end if;

  meta:=jsonb_build_object(
    'content_kind','post',
    'importance',p_importance,
    'notify_all',coalesce(p_notify_all,false),
    'category','posts'
  );
  insert into public.network_activities(network_id,activity_type,title,body,visibility,metadata,created_by)
  values(nid,'announcement',left(trim(p_title),220),nullif(trim(coalesce(p_body,'')),''),'members',meta,auth.uid())
  returning id into activity_id;

  if p_notify_all then
    for target in
      select nm.user_id from public.network_memberships nm
      where nm.network_id=nid and nm.status='active' and nm.user_id<>auth.uid()
    loop
      notification_id:=public.create_network_notification(
        nid,target,'community_post_broadcast',
        case when p_importance='urgent' then 'Urgent community update' else 'Important community update' end,
        left(trim(p_title),180),
        'community','activity',activity_id,
        case when p_importance='urgent' then 'urgent' else 'high' end,
        jsonb_build_object('surface','community','category','posts','importance',p_importance),auth.uid()
      );
      notification_ids:=array_append(notification_ids,notification_id);
    end loop;
  end if;

  insert into public.audit_log(network_id,actor_id,action,details)
  values(nid,auth.uid(),'network_post_created',jsonb_build_object('activity_id',activity_id,'importance',p_importance,'notify_all',p_notify_all));

  return jsonb_build_object('activity_id',activity_id,'notification_ids',to_jsonb(notification_ids));
end $$;
revoke all on function public.create_network_post(text,text,text,boolean) from public;
grant execute on function public.create_network_post(text,text,text,boolean) to authenticated;

create or replace function public.set_network_activity_pinned(p_activity_id uuid,p_pinned boolean) returns void
language plpgsql security definer set search_path=public as $$
declare nid uuid:=public.current_network_id();
begin
  if nid is null or not public.is_network_admin(nid) then raise exception 'Network admin access required.' using errcode='42501'; end if;
  update public.network_activities
  set metadata=case when p_pinned
      then coalesce(metadata,'{}'::jsonb)||jsonb_build_object('pinned_at',now(),'pinned_by',auth.uid())
      else (coalesce(metadata,'{}'::jsonb)-'pinned_at'-'pinned_by') end,
      updated_at=now()
  where id=p_activity_id and network_id=nid and coalesce(metadata->>'content_kind','')='post';
  if not found then raise exception 'Post not found.' using errcode='P0002'; end if;
  insert into public.audit_log(network_id,actor_id,action,details)
  values(nid,auth.uid(),case when p_pinned then 'network_post_pinned' else 'network_post_unpinned' end,jsonb_build_object('activity_id',p_activity_id));
end $$;
revoke all on function public.set_network_activity_pinned(uuid,boolean) from public;
grant execute on function public.set_network_activity_pinned(uuid,boolean) to authenticated;

create or replace function public.add_network_post_comment(p_activity_id uuid,p_body text) returns jsonb
language plpgsql security definer set search_path=public as $$
declare
  nid uuid:=public.current_network_id();
  postrow public.network_activities%rowtype;
  comment_id uuid;
  notification_id uuid;
begin
  if auth.uid() is null or nid is null or not public.is_network_member(nid) then raise exception 'Network membership required.' using errcode='42501'; end if;
  if length(trim(coalesce(p_body,'')))<1 then raise exception 'Comment is required.' using errcode='22023'; end if;
  select * into postrow from public.network_activities
    where id=p_activity_id and network_id=nid and coalesce(metadata->>'content_kind','')='post';
  if not found then raise exception 'Post not found.' using errcode='P0002'; end if;
  insert into public.network_activity_comments(activity_id,network_id,user_id,body)
  values(p_activity_id,nid,auth.uid(),left(trim(p_body),1000)) returning id into comment_id;

  if postrow.created_by is not null and postrow.created_by<>auth.uid() then
    notification_id:=public.create_network_notification(
      nid,postrow.created_by,'community_post_comment','New comment · '||left(postrow.title,120),left(trim(p_body),500),
      'community','activity',p_activity_id,'normal',jsonb_build_object('surface','community','category','posts','comment_id',comment_id),auth.uid()
    );
  end if;
  return jsonb_build_object('comment_id',comment_id,'notification_id',notification_id);
end $$;
revoke all on function public.add_network_post_comment(uuid,text) from public;
grant execute on function public.add_network_post_comment(uuid,text) to authenticated;
