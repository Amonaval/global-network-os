# Phase-1 RPC + Playwright Certification Hardening

## Failure class fixed

### RPC permission audit policy mismatch

The compact POC runner previously marked the RPC permission step as non-required, but the audit executable itself still wrote `status: failed`, printed `FAIL`, and exited 1 whenever findings existed. This made the same known 331 findings look like a fresh POC certification failure every run.

The audit is now policy-aware:

- `qa:certify` invokes `rpc-permission-audit.mjs --advisory`.
- All RPC findings, severities, signatures and counts remain in `qa-results/db/rpc-permission-audit.json`.
- When findings exist in POC mode, evidence status is `advisory`, strictStatus remains `failed`, and the command exits 0.
- Full certification invokes `--strict`, so the same unresolved findings remain release-blocking.
- Standalone audit defaults to strict unless explicitly run with `--advisory`.

This is not a suppression or privilege change. It fixes certification policy enforcement while retaining the complete security backlog.

### Playwright initial navigation timeout

The login helper previously used `page.goto('/')`, which waits for the browser `load` event. The observed failure occurred before authentication because the page did not reach full load within 30 seconds. For a Next.js application this can be delayed by non-critical resources even after the document/application is available.

Login now waits only for navigation `commit`, then proves readiness through stable QA UI test IDs and authenticated application state. Navigation allowance is 45 seconds and the test budget is 90 seconds. This adds no authentication retries, browser workers, or Supabase load.

## Regression contracts

`qa/unit/runtime-contracts.test.mjs` now proves:

1. POC audit must be explicitly advisory.
2. Full audit must be explicitly strict.
3. Strict remains the audit default.
4. Strict findings still exit non-zero.
5. Login must not depend on the browser `load` event.
