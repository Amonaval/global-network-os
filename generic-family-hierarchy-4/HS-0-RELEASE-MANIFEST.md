# HS-0 Release Manifest

Mission: Housing Society Vertical Foundation & Reuse Audit
Status: SOURCE IMPLEMENTED / RUNTIME VERIFY
Migration: `082_hs0_housing_society_vertical.sql`
Source gate: `npm run validate:hs0`
Primary key: `housing-society`
Primary operating object: `unit`
No destructive schema operations: yes
Existing verticals renamed/removed: no
Advanced society operations falsely exposed: no
Runtime certification: pending deployed migration + persona verification


## Validation evidence
- `npm run validate:hs0`: PASS — 24/24 HS-0 checks.
- FCA regression gate chained by HS-0: PASS — 27/27 checks.
- TypeScript syntax/transpile pass across affected TS/TSX files: PASS — 16/16 files.
- Full `npm run check:types`: not certified in this environment because the supplied ZIP has no installed dependencies and `npm ci` did not complete.
- Runtime/Supabase verification remains pending by design; use `HS-0-RUNTIME-VERIFICATION-CHECKLIST.md` after applying migration 082.

## Compatibility note
The older `validate:g8` source gate is already stale/failing in the supplied baseline ZIP on assertions unrelated to HS-0. HS-0 therefore uses the current FCA regression gate plus its own explicit cross-vertical contract checks; the pre-existing G8 failures are not represented as HS-0 regressions.
