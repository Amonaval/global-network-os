# QA Phase 5B — Fresh Database Migration & Upgrade Certification

## Purpose
Prove that the accepted TrustWeave database migration chain can construct a clean environment, upgrade a historical checkpoint to the current schema, rerun the latest safety-critical suffix, and preserve core RLS/security structure without experimenting on the normal staging project.

## Safety boundary
Phase 5B runs live migration SQL only through `qa:phase5b:replay`, and that command requires a separate project reference, separate database URL, `QA_DB_ALLOW_FRESH_REPLAY=true`, and the explicit phrase `QA_FRESH_CONFIRM_DISPOSABLE=YES_DELETE_ME`. It refuses a non-empty database and never executes DROP/reset cleanup. The final certification command is evidence-only.

## Closure gates
1. Accepted migration versions start at 001, are contiguous and have no duplicate version prefixes.
2. Experimental storage migrations 096/097 remain quarantined until deliberately reconciled.
3. Fresh 001 → checkpoint replay passes.
4. Checkpoint → latest upgrade passes.
5. Configured latest migration suffix is rerunnable.
6. Core tables exist with RLS enabled and client roles cannot CREATE in the public schema.
7. Replay evidence matches the exact current source fingerprint.

## Commands
- `npm run qa:phase5b:local`
- `npm run qa:phase5b:inventory`
- `npm run qa:phase5b:replay`
- `npm run qa:certify:phase5b`

## Success
`TrustWeave Phase-5B fresh migration certification: PHASE5B_CERTIFIED`
