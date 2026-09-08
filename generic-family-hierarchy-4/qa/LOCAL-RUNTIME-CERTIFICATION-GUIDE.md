# TrustWeave QA Mega Mission — Local / Staging Runtime Certification Guide

This repository contains the QA implementation. The application owner runs the runtime certification locally or against a dedicated staging environment and returns `qa-results/` for remediation.

## 1. Preconditions

Use **dedicated QA infrastructure only**. Never point mutating QA at production.

Required locally:
- Node/npm supported by the application.
- No local PostgreSQL server or `psql` installation is required. `npm run qa:setup` installs the project-local Node PostgreSQL driver used by database certification.
- A running TrustWeave application, or allow Playwright to start `npm run dev`.
- A dedicated staging Supabase project with anon + service-role credentials.
- A disposable Supabase-compatible database whose application schema is empty for fresh/checkpoint migration replay. Supabase platform schemas such as `auth` and `storage` must exist.

## 2. Install once

```bash
npm ci
npm run qa:setup
```

`qa:setup` installs pinned QA-only Playwright/axe packages plus the Node PostgreSQL driver (`pg`) into local `node_modules` without changing `package.json`/`package-lock.json`, then installs Chromium, Firefox and WebKit browser binaries. It requires no Windows administrator rights and no local PostgreSQL server.

## 3. Create `.env.qa`

Copy `.env.qa.example` to `.env.qa` and fill at least:

```dotenv
QA_BASE_URL=http://127.0.0.1:3000
QA_EXTERNAL_SERVER=true
QA_MODE=staging
QA_ALLOW_MUTATION=true
QA_RUN_NAMESPACE=local-cert
QA_STAGING_PROJECT_REF=your_staging_supabase_project_ref

NEXT_PUBLIC_SUPABASE_URL=https://your_staging_project_ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

QA_DATABASE_URL=postgresql://...current-staging-database...
QA_FRESH_DATABASE_URL=postgresql://...disposable-supabase-compatible-empty-application-db...
QA_DB_ALLOW_FRESH_REPLAY=true
QA_DB_UPGRADE_CHECKPOINT=80
QA_DB_RERUN_FROM=90

QA_RUN_LARGE_VOLUME=false
```

Optional QA identities can be supplied explicitly. If left blank, `qa:seed` creates deterministic dedicated QA users for owner/admin/member/invitee/tenant-B and writes their generated credentials only under `qa-results/fixtures/generated.env` for the run.

## 4. Start the application

If `QA_EXTERNAL_SERVER=true`, start the app in another terminal:

```bash
npm run dev
```

For a production-build style run:

```bash
npm run build
npm run start
```

Then ensure `QA_BASE_URL` points at that running instance.

If `QA_EXTERNAL_SERVER=false`, Playwright starts `npm run dev` when its browser phase begins.

## 5. Run the complete certification

```bash
npm run qa:certify
```

This is the primary command. It intentionally runs independent layers even when an earlier layer fails, so one defect does not hide the rest of the product.

Execution order:
1. Unit/contracts + suite structure + TypeScript + production build + migration static audit + source regression gate.
2. Deterministic nine-vertical / five-identity staging seed.
3. Existing staging migration rerun (default 090→latest).
4. Disposable fresh DB 001→historical checkpoint (default 080)→latest, then latest rerun.
5. Database integrity/residue checks.
6. RPC privilege/exposure audit.
7. Runtime RPC role/vertical matrix.
8. Two-tenant RLS/storage/invitation-token adversarial attacks.
9. Playwright: authentication, 9×3 role/vertical smoke, owner/admin/member authorization, API contracts, golden paths, browser workbook round-trip, vertical capability/deep flows, expert crawler, accessibility/mobile, lifecycle/import/purge, volume/idempotency/pagination, resilience, Firefox and WebKit smoke.
10. Evidence aggregation and prioritized remediation report.

A non-zero command exit means **FAILED or BLOCKED**, not that evidence collection was useless. Always inspect/send the generated reports.

## 6. What to send back to ChatGPT

Zip the entire `qa-results/` directory after the run. The most important files are:
- `qa-results/CERTIFICATION-SUMMARY.json`
- `qa-results/BUG-REPORT.md`
- `qa-results/REMEDIATION-PLAN.md`
- `qa-results/COVERAGE-MATRIX.md`
- `qa-results/findings.json`
- `qa-results/playwright.json`
- `qa-results/db/*`
- `qa-results/security/*`
- `qa-results/crawl/*`
- `qa-results/artifacts/*` (screenshots/traces/videos for failures)

I can then fix defects in priority order and each runtime defect must receive a permanent regression assertion before being considered closed.

## 7. Useful focused commands

```bash
npm run qa:preflight
npm run qa:seed
npm run qa:db-replay
npm run qa:db-integrity
npm run qa:db-permissions
npm run qa:rpc
npm run qa:rls
npm run qa:verticals
npm run qa:crawl
npm run qa:security
npm run qa:accessibility
npm run qa:lifecycle
npm run qa:cross-browser
npm run qa:report
```

Use these only to shorten a fix/retest loop. Release certification remains `npm run qa:certify`.

## 8. Safety behavior

Mutating DB/browser suites require both:

```dotenv
QA_MODE=staging
QA_ALLOW_MUTATION=true
```

The runner additionally refuses production-looking application/DB hosts. Hosted Supabase mutation must match `QA_STAGING_PROJECT_REF`. Fresh replay requires `QA_DB_ALLOW_FRESH_REPLAY=true` and refuses a target where `public.networks` already exists.

No production bypass is provided.

## 9. Optional 1,000+ entity stress

Default certification creates/verifies 100 entities. Enable the extra two 500-row batches with:

```dotenv
QA_RUN_LARGE_VOLUME=true
```

Keep this off for rapid fix/retest cycles and enable it for release-candidate hardening.

## 10. Cleanup

Disposable lifecycle/volume networks clean themselves. The deterministic seeded nine-vertical fixtures are intentionally retained for reproducible reruns. To remove those networks after you are finished:

```bash
npm run qa:cleanup
```

Dedicated QA auth users are preserved for reuse.
