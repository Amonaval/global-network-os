# G8 Certification Hotfix — Alumni Navigation Typing + Membership Timestamp

**Date:** 2026-08-25  
**Status:** FIXED / CERTIFIED  
**Scope:** build + migration hotfix; no new migration number

## Failure 1 — Next.js / TypeScript build

Reported error:

```text
Property 'adminOnly' does not exist ...
components/AlumniNetworkApp.tsx
```

### Root cause

`ALUMNI_APP_COMPOSITION` correctly satisfies `VerticalAppComposition`, but because it is exported with `satisfies`, TypeScript preserves the narrower literal union of its individual surface objects. When `primaryNavigation` and `mobileMoreNavigation` are merged, the inferred union does not guarantee that every variant has an `adminOnly` property, even though `VerticalSurfaceDescriptor` defines `adminOnly?: boolean`.

### Fix

`AlumniNetworkApp.tsx` explicitly widens the merged navigation collection to:

```ts
readonly VerticalSurfaceDescriptor[]
```

before filtering. This preserves the canonical composition and makes optional `adminOnly` / `featureKey` access type-safe.

## Failure 2 — Supabase migration 048

Reported error:

```text
column m.created_at does not exist
```

### Root cause

`network_memberships` was created in migration 019 with `joined_at`, not `created_at`.

### Fix

`get_productized_network_memberships()` now returns:

```sql
m.joined_at
```

which matches both the table schema and the RPC return column `joined_at`.

## Regression protection

`validate:g8` now fails if:
- Alumni navigation is not widened to `VerticalSurfaceDescriptor` before reading optional admin fields;
- migration 048 references `m.created_at` for membership listing;
- migration 048 stops returning `m.joined_at`.

The intentional Alumni component hotfix is incorporated into the G8 protected-foundation hash snapshot.

## Certification

After both fixes, the complete automated source chain was rerun:

**D1 → V1 → CR1/CR2 → S1 → S2 → S3-A1 → G1.1 → G1.4 → G2 → G3 → G4 → G5 → G6 → G7 → G8: PASS**

No new Supabase migration number is introduced. If migration 048 previously failed, rerun the corrected `048_g8_productized_verticals.sql` from the start.
