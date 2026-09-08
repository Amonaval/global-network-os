# XP-1 Runtime Closure — Cross-Vertical Start Flow + XP-0 Storage Purge Correction

## Why this closure exists

Runtime testing exposed two defects that source gates had missed:

1. Productized/Alumni **Choose how to start** set step 2 but left step 1 rendered above it, so the choices could appear to do nothing below the fold.
2. XP-0 permanent deletion used direct SQL deletion from `storage.objects`, which modern Supabase blocks with `Direct deletion from storage tables is not allowed. Use the Storage API instead.`

These findings reopen the previous source-only closure and strengthen the definition of done.

## Implemented corrections

### Cross-vertical onboarding
- Productized creation is now a real two-step state transition: Basics -> Choose easiest start.
- Step 2 replaces step 1 and includes a Back action.
- Alumni uses the same behavior.
- All productized verticals are explicitly covered by the runtime-closure source matrix:
  - Housing Society
  - Family Association
  - Association / Community
  - Organization
  - Business Trust
  - Franchise
  - Professional
- Build Together, Excel, and Start Small remain connected to network creation.
- Excel wording points to the XP-1 guided workbook/validation flow.

### Permanent hard delete
- Browser code no longer performs direct permanent-delete RPC finalization.
- All shared/productized hard-delete UI routes through `/api/v1/networks/[networkId]/purge`.
- The endpoint authenticates the requesting user with their Supabase access token.
- `prepare_owned_network_for_purge` validates exact-name + owner authorization and archives/freezes an active network before external storage mutation.
- A server-only Supabase service-role client removes network-prefixed objects through the official Storage API from:
  - `profile-photos`
  - `community-media`
- Storage is re-listed after deletion; DB finalization is refused if any object remains.
- `delete_owned_network_permanently` now performs relational finalization only after storage residue is zero.
- Post-delete metadata-driven relational/storage residue verification and the purge receipt remain in place.
- Failure during external storage cleanup leaves the network archived rather than partially relationally deleted.

## Migration safety
- `090_xp0_network_lifecycle_safety.sql` itself was corrected so rerunning 090 cannot reintroduce the unsupported storage-table deletion.
- `091_xp01_runtime_closure.sql` is a rerunnable corrective migration for environments that already applied 090.
- Both avoid `DELETE FROM storage.objects`.

## Deployment requirement

Set `SUPABASE_SERVICE_ROLE_KEY` as a server-only environment variable. Never expose it through `NEXT_PUBLIC_*`.

Apply migration 091 to any database that already has XP-0/XP-1 migrations.

## Validation completed
- `npm run validate:xp1-runtime`: PASS
- XP runtime closure gate: 27/27
- XP-1 gate: 31/31
- XP-0 gate: 17/17
- inherited Platform Parity + HS-0 through HS-6 + FCA-0 chain: PASS
- independent TypeScript parse/transpile for changed TS/TSX runtime files: PASS
- API route relative import resolution: PASS

## Still pending runtime certification
- Apply migration 091 to a Supabase staging/project runtime.
- Configure `SUPABASE_SERVICE_ROLE_KEY` in the Next/Vercel server environment.
- Create each released vertical and exercise all three start modes in browser.
- Upload one generated workbook per vertical and confirm commit results.
- Add media to both buckets, hard-delete the network, and confirm zero storage + relational residue.
- Repeat hard delete for an already archived network.

Until those checks run, the checkpoint is source/regression validated but not staging-certified.
