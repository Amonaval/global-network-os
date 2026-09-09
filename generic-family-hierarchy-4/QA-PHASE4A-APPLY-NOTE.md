# QA Phase 4A — Apply Note

Apply these files over the current Phase-3 working tree. No SQL or Supabase migration accompanies this patch.

## Run order
1. `npm run qa:phase4a:local`
2. If green: `npm run qa:phase4a:browser`
3. If green: `npm run qa:certify:phase4a`

## Safety
- Do not rerun migrations 096/097 for Phase 4A.
- Do not rerun the Phase-3 RLS/storage diagnostics as part of Phase 4A.
- The existing deterministic `qa-results/fixtures/seed-state.json` is reused; Phase 4A does not seed or cleanup data.
- Browser failure injection uses Playwright request interception only and is removed before each recovery assertion.

## Expected closure
`Phase-4A report: PHASE4A_CERTIFIED`

`TrustWeave Phase-4A runtime robustness certification: PHASE4A_CERTIFIED`

This does not close the separate Phase-3 P3-STORAGE-002 blocker.
