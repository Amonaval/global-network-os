# NEXT SESSION MASTER PROMPT — TrustWeave QA Certification Phase 2

Use the attached `global-network-os-QA-POC-PHASE1-HANDOVER-FULL.zip` as the **only implementation baseline**. Do not merge from older QA patch ZIPs or an older project snapshot. Read these files first:

- `QA-MANAGER-BRIEF.md`
- `QA-CURRENT-STATUS.md`
- `QA-FREE-TIER-OPERATING-RULE.md`
- `qa/README.md`
- `qa/LOCAL-RUNTIME-CERTIFICATION-GUIDE.md`
- `qa/TEST-CASE-CATALOG.md`

## Mission state

Feature development remains paused. QA/hardening is the top priority.

This project is currently developed on **Supabase Free Tier**. Do not design tests that repeatedly authenticate large role matrices, create large datasets, hammer RPC/API endpoints, or run stress/volume loops by default. The working staging application must remain usable throughout QA.

The compact POC architecture is already implemented. Confirmed before handover:

- deterministic seed: PASS — all 9 released verticals + isolated Tenant B
- `npm run qa:unit`: PASS
- database integrity: PASS (7 checks)
- RPC POC: PASS (12 checks, only 2 authenticated sessions)
- RLS POC: PASS (7 checks, owner + tenantB)
- Playwright POC: PASS for Family owner/admin + Housing Society shell using one browser login
- RPC permission audit currently records 331 advisory findings across 386 public functions; do not hide or discard these findings

The final full `npm run qa:certify` was not rerun after the last unit-contract fix. Therefore the **first action** is to obtain formal `POC_CERTIFIED` status.

## One-time dependency sync after extracting this handover ZIP

Run `npm install` once before the first certification run. The handover persists `tsx` in `package.json`, while the inherited baseline lockfile predates that final dependency persistence. This first `npm install` synchronizes `package-lock.json`; after that normal locked installs can resume.

## First action — close Phase 1

Ask me to run only:

`npm run qa:certify`

Expected ending:

`POC report: POC_CERTIFIED`
`TrustWeave free-tier POC certification: POC_CERTIFIED`

If it fails, inspect the exact failed layer and fix the failure class in one pass. Do not blindly rerun Supabase-heavy steps. Prefer local evidence/results and focused commands first.

## Phase 2 after POC_CERTIFIED

Expand the compact certification carefully, not the infrastructure load.

Add these capabilities while continuing to use one worker, tiny seeded data, and session reuse:

1. Member browser journey on the same representative vertical set.
2. One explicit negative cross-tenant/browser authorization case backed by RLS evidence.
3. One representative API mutation + readback + cleanup path.
4. One compact import/create/update/delete lifecycle with cleanup proof.
5. Basic accessibility scan (axe) on representative authenticated screens.
6. Mobile viewport smoke on representative screens without duplicating the whole suite.
7. Evidence-backed bug output and regression test for every real defect discovered.

Do not yet enable stress/large-volume tests, broad destructive crawling, repeated auth matrices, or all-browser/all-role/all-vertical Cartesian testing.

## Expansion principle

Prove each *capability class* on a representative vertical first. Once the shared platform behavior is stable, add cheap parity checks for the remaining verticals. Only run deep vertical-specific journeys where behavior is genuinely different.

Released verticals are exactly:

- family
- housing-society
- family-association
- association
- alumni
- organization
- business-trust
- franchise
- professional

## Important fixes that must remain intact

- `.env.qa` overrides stale inherited QA shell values.
- mutation requires `QA_MODE=staging` and `QA_ALLOW_MUTATION=true`.
- `QA_STAGING_PROJECT_REF` must match the hosted staging Supabase project ref.
- DB QA uses project-local Node `pg`; no system PostgreSQL/psql install is required.
- seed does not use an invented `qa` affiliation dimension.
- seed entity kinds are correct for all released verticals.
- membership transport preserves all 9 vertical kinds; association/family-association/housing-society must never fall back to family.
- `AuthPanel` internal auth modes are not compared to translated display labels.
- Playwright login opens the real landing sign-in dialog and waits for authenticated UI.
- Organization import `to_id` may reference People, Teams, or Projects through explicit multi-sheet reference support.
- SSR-safe dynamic loading remains in place for Leaflet geography.
- `@playwright/test` and `tsx` remain in `devDependencies`.

## RPC permission audit

The 331 findings are a separate security-hardening backlog. In POC mode they are advisory evidence so they do not prevent proving the compact QA architecture. Do not simply suppress them globally. A later dedicated security mission must classify expected grants vs accidental PUBLIC/anon/authenticated execute privileges, especially `SECURITY DEFINER` functions, and tighten migrations accordingly. Full certification should ultimately fail unresolved critical RPC privilege exposures.

## Database replay

`QA_DATABASE_URL` points to the existing working staging project DB. `QA_FRESH_DATABASE_URL` is only for a separate disposable Supabase-compatible database used for clean migration replay. Fresh replay may remain disabled during compact POC to protect free-tier usage. Do not confuse the two projects.

## How to work with me

I run the application and commands locally and return logs/`qa-results`. You own QA design, code changes, bug diagnosis, hardening, regression tests, and remediation planning. Avoid asking me to manually inspect behavior that Playwright/DB/API automation can prove. When a failure occurs, identify whether it is product code, QA harness, environment, or a genuine security finding before changing assertions.

When making fixes, provide one consolidated affected-files patch for the failure class, not repeated one-line patches for each vertical. Preserve the Free-Tier operating rule throughout.

## Definition of success for the next mission

Phase 2 is complete when the compact certification proves owner + member representative journeys, tenant isolation, representative API mutation/readback, lifecycle cleanup, accessibility, and mobile smoke with deterministic evidence, without triggering infrastructure rate limits or destabilizing the staging application. Then propose the next controlled expansion toward all-vertical production certification.
