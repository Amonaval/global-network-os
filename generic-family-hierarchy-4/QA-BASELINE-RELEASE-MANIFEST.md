# QA Mega Mission — Implementation Release Manifest

Baseline source: `global-network-os-QA-mega-mission-baseline.zip` only.
Implementation date: 2026-09-08.
Feature development status: **paused**.
Runtime certification status: **ready for owner execution; not pre-claimed**.

## Mission implementation delivered

The repository now contains the complete QA execution architecture requested by `NEW-SESSION-QA-MASTER-PROMPT.md`:

1. `npm run qa:preflight` summarized prerequisite/regression report.
2. deterministic dedicated role authentication and nine-vertical staging seeding.
3. stable `data-testid` selectors on shared runtime/import/admin surfaces.
4. all-nine-vertical × owner/admin/member runtime smoke.
5. owner/admin/member authorization matrix plus cross-tenant API substitution.
6. staging migration rerun, fresh 001→historical checkpoint→latest replay, DB integrity and RPC runtime coverage.
7. two-tenant RLS adversarial suite including direct tables, storage and invitation-token replay/revocation.
8. shared golden E2E paths.
9. vertical capability/deep flows with Housing Society, Family Association, Family and Alumni prioritized.
10. expert crawler producing per-role×vertical control inventory and action graphs with expected coverage assertions.
11. axe/keyboard/mobile and Firefox/WebKit smoke.
12. destructive lifecycle/import/media/purge plus residue verification and controlled volume/idempotency tests.
13. evidence-backed `BUG-REPORT.md`, JSON findings, role×vertical `COVERAGE-MATRIX`, `CERTIFICATION-SUMMARY` and prioritized `REMEDIATION-PLAN`.

## Primary operator command

After `npm ci`, `npm run qa:setup`, `.env.qa` staging configuration and application startup:

```bash
npm run qa:certify
```

See `qa/LOCAL-RUNTIME-CERTIFICATION-GUIDE.md`.

## Safety

Mutating suites require both `QA_MODE=staging` and `QA_ALLOW_MUTATION=true`; production-like targets are rejected. Hosted Supabase targets must match `QA_STAGING_PROJECT_REF`. Fresh replay requires explicit opt-in and refuses a DB where `public.networks` already exists.

## Verification performed while building this artifact

- QA structural audit: PASS (mandatory suites/harnesses/selectors present).
- QA runtime guard unit tests: PASS.
- syntax checks performed on new Node/TypeScript QA harness files.
- migration static audit was previously PASS across 95 migrations in this baseline.

Full database/RLS/API/browser certification is deliberately **not claimed here** because it belongs on the owner's local/staging environment with real QA credentials and browser/runtime tooling.
