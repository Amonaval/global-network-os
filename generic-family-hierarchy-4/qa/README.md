# TrustWeave Runtime Certification System

Feature development is paused. This folder implements automated runtime certification; source gates are regression assets but **never runtime proof**.

## Primary command

After one-time QA tooling installation and `.env.qa` staging configuration:

```bash
npm run qa:certify
```

Detailed local/staging instructions: [`qa/LOCAL-RUNTIME-CERTIFICATION-GUIDE.md`](./LOCAL-RUNTIME-CERTIFICATION-GUIDE.md).

## What is implemented

- summarized preflight: Q1 unit/contracts, QA structure, types, production build, migration audit, source regression;
- deterministic dedicated owner/admin/member/invitee/tenant-B users and fixtures for all nine released verticals;
- hard staging/production mutation guard;
- stable shared selectors for shell/admin/start/import/lifecycle and guided-workbook surfaces;
- 9 vertical × 3 role Playwright runtime smoke and authorization matrix;
- HTTP API authentication/validation/export/purge contracts;
- current-staging rerunnable migrations plus disposable fresh 001→checkpoint→latest upgrade certification;
- DB integrity/orphan/storage-residue checks;
- RPC runtime matrix plus DB privilege/exposure audit;
- two-tenant known-ID substitution, direct-table, storage-prefix and invitation-token adversarial suite;
- shared golden flows and vertical-specific capability/deep flows (Housing Society, Family Association, Family, Alumni first);
- guided-workbook browser download→upload→review round-trip;
- expert crawler per role × vertical with expected-vs-discovered control coverage and action graph;
- axe WCAG smoke, keyboard check, nine-vertical mobile overflow smoke;
- controlled create/import/media/archive/restore/purge with zero-residue verification;
- 100-row default volume + pagination/search/idempotency, optional 1,000 additional rows;
- slow-backend/outage resilience smoke;
- Chromium full suite + Firefox/WebKit released-vertical smoke;
- machine/human bug, coverage, certification and prioritized remediation evidence.

## One-time tooling

```bash
npm ci
npm run qa:setup  # installs Playwright/axe/browser binaries plus project-local Node PostgreSQL driver (`pg`); no psql/admin install required
```

`qa:setup` installs exact QA-only Playwright/axe versions plus `pg` with `--no-save --package-lock=false`, then installs Chromium/Firefox/WebKit. It does not mutate the repository dependency manifest and requires no local PostgreSQL/psql installation.

## Certification evidence

`qa-results/` is regenerated for each certification run unless `QA_PRESERVE_RESULTS=true`.

Primary outputs:
- `CERTIFICATION-SUMMARY.json`
- `BUG-REPORT.md`
- `REMEDIATION-PLAN.md`
- `COVERAGE-MATRIX.md/.json`
- `findings.json`
- Playwright JSON/JUnit/HTML + failure traces/screenshots/videos
- crawler role×vertical inventories/action graphs
- DB migration/integrity/RPC evidence
- RLS/security evidence

A release is not certified when a mandatory layer is failed/blocked/not-run, when any P0/P1 remains, or merely because source checks pass. Every fixed runtime bug must retain a regression assertion.

## Phase-1 browser runtime decision

Compact local Free-Tier POC certification runs its single Chromium journey in headed mode. The identical test is proven stable headed on the current Windows/Next.js development runtime; headless hydration stability is tracked separately for later CI/production hardening. See `QA-PHASE1-HEADED-POC-DECISION.md`.

## Phase-4C governance / destructive-action profile

```bash
npm run qa:phase4c:local
npm run qa:phase4c:browser
npm run qa:certify:phase4c
```

Phase 4C is deliberately narrow and staging-safe: no migration execution, Storage mutation, service-role access, seed/cleanup, or permanent purge. It certifies owner/admin/member control visibility, exact-name + confirmation guards, backend role/invitation/destructive denials, stale-session revocation, and duplicate-submit protection. One reversible Organization admin-role downgrade is restored in `finally`.

## Phase-5A strict RPC security profile

```bash
npm run qa:phase5a:local
npm run qa:phase5a:audit
npm run qa:certify:phase5a
```

Phase 5A is intentionally read-only against the configured QA database. It reconciles live PostgreSQL function ACLs and SECURITY DEFINER metadata against migration-derived access intent, produces P0/P1 evidence, and generates a rollback-protected remediation preview. It executes no migration or ACL change itself. Unlike compact Phase-1/Phase-3 handling, unexpected RPC privilege findings are not advisory here: certification requires zero blocking findings.

### Phase 5B — Fresh Database Migration & Upgrade
`qa:phase5b:local` validates the migration-source contract. `qa:phase5b:replay` is intentionally a one-time operation against an explicitly confirmed disposable empty project; it never resets a database. `qa:certify:phase5b` validates the replay evidence fingerprint instead of repeating replay.

### Phase 5C — Production Release Certification
Use a dedicated `.env.qa.release` copied from `.env.qa.release.example`. `qa:phase5c:runtime` is the only mutating command and refuses normal/protected staging. `qa:certify:phase5c` consumes prerequisite and runtime evidence without repeating destructive work.
