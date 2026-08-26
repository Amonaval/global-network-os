-- G9.1-A database verification (read-only catalog checks)
-- Run after migration 050. It changes no application data.
do $$
declare
  t text;
  enabled boolean;
  pdef text;
begin
  foreach t in array array[
    'network_knowledge_sources','network_evidence_records',
    'network_candidate_assertions','network_assertion_decisions'
  ] loop
    if to_regclass('public.'||t) is null then
      raise exception 'G9.1-A verification failed: missing table %',t;
    end if;
    select c.relrowsecurity into enabled from pg_class c where c.oid=to_regclass('public.'||t);
    if not coalesce(enabled,false) then
      raise exception 'G9.1-A verification failed: RLS disabled on %',t;
    end if;
  end loop;

  select string_agg(coalesce(qual,''),' ') into pdef
  from pg_policies
  where schemaname='public' and tablename in (
    'network_knowledge_sources','network_evidence_records',
    'network_candidate_assertions','network_assertion_decisions'
  );
  if position('status' in coalesce(pdef,''))=0 or position('active' in coalesce(pdef,''))=0 then
    raise exception 'G9.1-A verification failed: policies do not enforce active membership';
  end if;

  if exists(
    select 1 from pg_policies
    where schemaname='public'
      and tablename in ('network_knowledge_sources','network_evidence_records','network_candidate_assertions','network_assertion_decisions')
      and cmd in ('INSERT','UPDATE','DELETE','ALL')
  ) then
    raise exception 'G9.1-A verification failed: direct write policy exists';
  end if;

  if not exists(select 1 from pg_policies where schemaname='public' and tablename='network_evidence_records' and qual like '%visibility%network%') then
    raise exception 'G9.1-A verification failed: restricted evidence is not excluded from ordinary member SELECT';
  end if;

  raise notice 'G9.1-A database schema verification: PASS';
end $$;
