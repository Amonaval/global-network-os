# Phase 5A/5B/5C Stabilization — Apply Note

This patch fixes QA framework/orchestration problems found during the first combined 5A/5B/5C run. It does **not** execute SQL and does not change Supabase.

## Important distinction

- Phase 5A `REMEDIATION_REQUIRED` is still a real security closure state. The corrected audit removes double-counting/intent-history noise; it does not waive remaining findings.
- Phase 5B duplicate migration version 095 is a source-control history defect. Reconcile it locally with the guarded command below.
- Phase 5C must remain blocked until 5A and 5B certify.

## Safe order

1. Apply this patch.
2. Run `npm run qa:phase5b:reconcile-source` once. This performs a local file rename only after verifying the certified migration SHA-256. It never connects to Supabase.
3. Run `npm run qa:phase5b:inventory`.
4. Re-run `npm run qa:phase5a:audit` and review the corrected P0/P1 counts by code. Do not execute the remediation preview automatically.
5. Configure/confirm the disposable Phase-5B project and run `npm run qa:phase5b:replay`. `QA_FRESH_PROJECT_REF` and `QA_FRESH_SUPABASE_URL` are now optional if the ref can be derived from `QA_FRESH_DATABASE_URL`.
6. Only after Phase 5A and 5B are certified, run `npm run qa:phase5c:init`. Fill the disposable project's anon key, service-role key, and explicit confirmation in `.env.qa.release`.
7. Then run Phase 5C runtime/certification.

Versions 096 and 097 are reserved due to the earlier experimental storage work and must not be reused for any future migration.
