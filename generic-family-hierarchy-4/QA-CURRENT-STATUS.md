# QA Current Status — Fresh Session Handover

Date: 2026-09-09

## Operating mode
- Feature development paused for QA/hardening.
- Supabase Free Tier: resource conservation is mandatory.
- Default command: `npm run qa:certify` = compact Free-Tier POC.
- Full future command: `npm run qa:certify:full`.
- One worker, tiny deterministic data, session reuse, no stress/large-volume work by default.

## Latest confirmed local results
- `npm run qa:seed`: PASS — 9 released verticals + isolated Tenant B.
- `npm run qa:unit`: PASS after final import/workbook contract fixes.
- Database integrity: PASS (7 checks).
- RPC POC: PASS (12 checks; only 2 authenticated sessions).
- RLS POC: PASS (7 checks; owner + tenantB).
- Browser POC: PASS — Family admin + Housing Society shell using one login.
- RPC permission audit: 331 advisory findings out of 386 public functions; not resolved.

## Formal closure still pending
`npm run qa:certify` must be rerun once after the final unit-contract patch. Expected terminal status:

POC report: POC_CERTIFIED
TrustWeave free-tier POC certification: POC_CERTIFIED

If it does not certify, inspect `qa-results/poc-certification-run.json` and the failing local/runtime layer; do not blindly rerun Supabase-heavy checks.

## Dependency requirement
`package.json` must retain:
- `@playwright/test`: `^1.55.0`
- `tsx`: `^4.23.13`

`tsx` is required because `qa:unit` executes TypeScript tests through `tsx --test`.

## Supabase project separation
Main existing working STAGING project supplies:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- QA_STAGING_PROJECT_REF
- QA_DATABASE_URL

Optional separate disposable project supplies only:
- QA_FRESH_DATABASE_URL

Fresh replay may stay disabled during POC with `QA_DB_ALLOW_FRESH_REPLAY=false`.

## Do not regress these fixes
- `.env.qa` is authoritative over inherited shell QA flags.
- Mutating QA requires `QA_MODE=staging` and `QA_ALLOW_MUTATION=true`.
- Hosted Supabase mutation requires exact `QA_STAGING_PROJECT_REF` match.
- No local/system `psql` requirement; DB QA uses Node `pg`.
- Seed entity kinds are capability/vertical aware.
- QA metadata must not invent an affiliation dimension named `qa`.
- Membership transport must preserve all 9 released vertical kinds.
- Auth automation must open the landing sign-in dialog and use stable test IDs.
- POC RPC privilege findings are advisory evidence; full certification remains strict.

## Handover packaging note
The final consolidated ZIP persists `tsx` in `package.json`. Because the inherited baseline lockfile predates this final persistence, run `npm install` once after extracting the handover ZIP to synchronize `package-lock.json`; do not use `npm ci` for that first dependency sync.

## 2026-09-09 Phase-1 certification hardening patch

A repeated certification-policy defect was corrected after runtime evidence showed the known RPC privilege backlog still printing `FAIL` during compact POC certification. `qa:certify` now invokes the permission audit explicitly in advisory mode while preserving every finding and its strict failure disposition; `qa:certify:full` invokes the same audit explicitly in strict mode. No RPC finding was removed, waived, or globally suppressed.

The initial Playwright login navigation was also hardened: readiness no longer depends on the browser's full `load` event. It waits for navigation commit and then proves the real sign-in/authenticated application state through stable QA test IDs. One worker and single-login POC behavior remain unchanged.

Formal Phase-1 closure is achieved locally with `npm run qa:certify` ending in `POC_CERTIFIED`.

## Phase-1 headless investigation outcome

- The temporary `data-qa-app-ready` / `qa-app-loading` instrumentation and bootstrap-wait login experiment were diagnostic only and did not resolve the local headless Chromium behavior.
- Those experimental product/harness changes were reverted from the clean baseline after headed Chromium proved stable.
- The retained browser hardening is limited to navigation-on-commit plus stable QA test IDs and the headed Chromium certification command.
- Headless execution remains a separate later CI/runtime-hardening item; it does not block the Free-Tier local POC.

## Phase-1 browser runtime decision

Compact local Free-Tier POC certification runs its single Chromium journey in headed mode. The identical test is proven stable headed on the current Windows/Next.js development runtime; headless hydration stability is tracked separately for later CI/production hardening. See `QA-PHASE1-HEADED-POC-DECISION.md`.

## 2026-09-10 — Phase-2 implementation started

Phase 2 now has a dedicated representative capability profile without altering the certified Phase-1 runner. `qa/e2e/16-phase2-representative-capabilities.spec.ts` adds Organization member proof, browser-authenticated Tenant-A→Tenant-B denial, compact API/lifecycle mutation with cleanup, two axe baselines and one 390×844 Chromium mobile smoke. `qa/unit/phase2-parity.test.mjs` adds cheap released-kind parity. `qa/run-phase2-certification.mjs` reuses the deterministic seed and compact DB/RPC/RLS foundation; RPC privilege findings remain advisory in this profile and preserved for strict certification.
