# QA Phase 3 — Expanded Platform Parity & Role/Security Certification

Baseline: formally certified Phase 2 (`PHASE2_CERTIFIED`). Feature development remains paused.

## Objective
Move from representative capability proof to broad released-platform parity without production-scale cost. Phase 3 expands role and vertical coverage while preserving the Supabase Free-Tier operating model.

## Certification matrix

| Area | Phase-3 proof |
|---|---|
| Owner parity | All 9 released verticals, one browser login/session, deterministic active-network switching |
| Admin parity | All 9 released verticals, one browser login/session, admin surface present |
| Member parity | All 9 released verticals, one browser login/session, no admin leakage; governed directory marker checks |
| Distinct vertical depth | Housing Society + Family Association directory/guide runtime paths |
| Invitee lifecycle | Owner governed RPC create → resend/token rotation → stale token denial → invitee accept → replay denial → member browser entry → cleanup |
| Tenant isolation | Retain Phase-2 read denial + add cross-tenant invitation mutation denial |
| RLS | Promote full existing adversarial RLS suite into required Phase-3 certification |
| RPC permissions | Preserve advisory findings and add non-regression ceiling: findings must not exceed Phase-2-certified 331 |
| Phase-2 regression | Re-run representative Phase-2 browser suite before Phase-3 expansion |

## Free-Tier rules retained
- one Playwright worker;
- headed Chromium locally;
- session reuse rather than role × vertical login multiplication;
- deterministic tiny seed reused where present;
- cleanup after invitation mutations;
- no stress/load/1,000-row volume;
- no Firefox/WebKit matrix;
- no fresh database replay in this phase;
- no strict RPC mass-remediation in this phase.

## New commands

```bash
npm run qa:phase3:local
npm run qa:phase3:browser
npm run qa:certify:phase3
```

Run incrementally: local → browser → certification. Do not jump directly to certification after a failure.

## Success criteria
Phase 3 closes when `qa:certify:phase3` ends with `PHASE3_CERTIFIED` and evidence proves all 9 verticals across owner/admin/member parity, invitee lifecycle, cross-tenant mutation denial, full RLS adversarial checks, Phase-2 regression, and RPC privilege-debt non-regression.

## Deferred after Phase 3
- clean disposable migration replay and existing-instance upgrade sanity;
- strict RPC remediation to zero unexpected grants;
- headless/CI stabilization;
- wider accessibility crawl;
- broader browser/device matrix;
- performance/volume/resilience/stress testing.
