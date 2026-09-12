# FCA-0.2 — Rerun-safe database recovery

## Root cause
Migration `080_fca0_family_community_association.sql` expanded the row returned by `public.get_network_activities(text)` with reaction/comment fields. PostgreSQL does not allow `CREATE OR REPLACE FUNCTION` to change OUT columns / a `RETURNS TABLE` row type. The old migration therefore stopped with `42P13`, leaving FCA foundation objects unavailable and `/api/v1/networks/create` returning 400 for `family-association`.

## Fix
- `080` now explicitly executes `drop function if exists public.get_network_activities(text);` immediately before recreating it with the expanded return shape.
- The function is recreated and its authenticated execute grant is restored in the same migration.
- `081` now checks that FCA-0 foundation tables and `fca_seed_defaults(uuid)` actually exist before claiming compatibility.
- The network service classifies missing FCA foundation functions as `FCA_DATABASE_MIGRATION_REQUIRED` instead of an opaque 400.

## Recovery order
Run the corrected files in this exact order:

1. `080_fca0_family_community_association.sql`
2. `081_fca01_family_association_runtime_compatibility.sql`

Both are intended to be safe to rerun. Do not run the old copy of `080` again.

## Verify database contract
After both complete successfully, run:

```sql
select
  public.g8_productized_vertical('family-association') as productized,
  public.g8_allowed_entity_kind('family-association','family') as family_kind,
  public.g8_allowed_entity_kind('family-association','person') as person_kind,
  public.g8_allowed_relationship('family-association','member_of_family') as member_link,
  to_regprocedure('public.fca_seed_defaults(uuid)') is not null as fca_seed_defaults,
  to_regprocedure('public.create_productized_network(text,text,text,text)') is not null as create_rpc;
```

All six values should be `true`.

Also verify the template constraints/runtime rows:

```sql
select vertical_kind from public.networks where vertical_kind='family-association' limit 1;
select count(*) from public.platform_feature_flags where vertical_kind='family-association';
```

The first query may return zero rows before the first network is created; it must not error. The feature count should be greater than zero after `080`.

## Retry creation
Retry the same API payload only after the SQL above succeeds:

```json
{"kind":"family-association","name":"MPF East Family12","contextValue":"MPF East Family","description":""}
```
