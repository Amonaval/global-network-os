-- XP-5 Backup / Export / Recovery. Rerunnable logical backup boundary.
create or replace function public.get_network_logical_backup(p_network_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
 actor_role text;
 network_row jsonb;
 datasets jsonb:='{}'::jsonb;
 rows jsonb;
 r record;
 excluded text[]:=array['network_join_codes','family_join_codes','network_bridge_codes','network_purge_receipts','alumni_invitations','hs_resident_invitations'];
begin
 select role into actor_role from public.network_memberships where network_id=p_network_id and user_id=auth.uid() and status='active';
 if actor_role is null or actor_role not in ('owner','admin') then raise exception 'Network administrator access required.' using errcode='42501'; end if;
 select to_jsonb(n) into network_row from public.networks n where n.id=p_network_id;
 if network_row is null then raise exception 'Network not found.' using errcode='P0002'; end if;
 for r in
  select distinct c.table_name
  from information_schema.columns c
  where c.table_schema='public' and c.column_name='network_id'
    and c.table_name<>'networks' and not (c.table_name=any(excluded))
  order by c.table_name
 loop
  execute format('select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),''[]''::jsonb) from public.%I t where t.network_id=$1',r.table_name) into rows using p_network_id;
  datasets:=datasets||jsonb_build_object(r.table_name,coalesce(rows,'[]'::jsonb));
 end loop;
 return jsonb_build_object(
  'format','trustweave-network-backup','version','xp5-1','schemaVersion','xp5-1','exportedAt',clock_timestamp(),
  'networkId',p_network_id,'network',network_row,'datasets',datasets,
  'excludedSecurityDatasets',excluded,
  'restore',jsonb_build_object('fullAutomaticRestore',false,'guidedWorkbookReimport',true,'reason','Security credentials and provider-owned identities are deliberately not portable.')
 );
end $$;
revoke all on function public.get_network_logical_backup(uuid) from public;
grant execute on function public.get_network_logical_backup(uuid) to authenticated;

do $$ begin
 if to_regprocedure('public.get_network_logical_backup(uuid)') is null then raise exception 'XP-5 backup function missing'; end if;
end $$;
