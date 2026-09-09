# QA Phase 4A — Runtime Robustness, Recovery & Failure Handling

## Mission
Prove that the application remains usable and recoverable through reloads, browser-history transitions, slow backend responses, transient backend outages and mobile recovery states without touching the unresolved Phase-3 Storage/RLS hardening path.

## Safety boundary
Phase 4A does not execute Supabase migrations, RLS/RPC audits, Storage mutations, network create/delete/purge, QA seed or QA cleanup. The existing deterministic seed fixture is reused. Browser failure injection is local to Playwright routing and removed before recovery verification.

## Browser coverage
1. Family owner — Admin navigation → full reload → authenticated shell recovery.
2. Organization member — Directory/search → reload → directory recovery with no admin leakage.
3. Organization member — query-string entry → browser back/forward → session and shell recovery.
4. Professional member — intentionally delayed REST calls → shell remains healthy.
5. Professional member — simulated REST 503 during reload → no raw stack leakage → route restored → clean reload recovers without re-login.
6. Organization member mobile 390×844 — directory → reload → mobile navigation remains usable and horizontal layout remains bounded.
7. Organization mobile post-recovery — WCAG A/AA/2.1AA serious/critical axe gate.

## Evidence and certification
- `qa-results/PHASE4A-CERTIFICATION-SUMMARY.json`
- `qa-results/PHASE4A-CERTIFICATION-SUMMARY.md`
- Playwright HTML/JUnit/JSON artifacts on failure.

## Commands
```bash
npm run qa:phase4a:local
npm run qa:phase4a:browser
npm run qa:certify:phase4a
```

## Certification rule
Phase 4A certifies only when all local contracts and the dedicated headed-Chromium recovery suite pass. Its result does not override or waive the open Phase-3 P3-STORAGE-002 blocker.

## Explicitly deferred
- P3-STORAGE-002 root-cause closure and migration 096/097 review.
- Strict RPC privilege remediation.
- Fresh disposable migration replay and upgrade-path certification.
- Headless/CI stabilization and Firefox/WebKit expansion.
- Performance, volume, stress and load testing.
