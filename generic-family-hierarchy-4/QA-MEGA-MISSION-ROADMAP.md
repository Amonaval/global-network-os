# QA Mega Mission — Runtime Certification & Product Hardening

## Purpose
Stop feature expansion. Turn the existing feature-rich Network OS into a runtime-certified, regression-protected product that a very small team can operate safely.

## Quality architecture

### Q0 — Build & deterministic source closure
- `npm ci`, TypeScript, Next production build, lint.
- existing mission gates.
- static SQL anti-pattern audit.
- migration numbering/replay audit.
- local import/module closure.

### Q1 — Unit & contract tests
- import schema registry/workbook naming/validation.
- vertical registries and exhaustive mappings.
- graph relationship rules.
- readiness calculations.
- lifecycle/backup contracts.
- error normalization.

### Q2 — Database/RPC tests
- fresh migration replay 001→latest.
- upgrade replay from representative historical checkpoints.
- every public RPC happy-path + authorization failure.
- residue verifier and storage boundary.
- transaction/constraint tests.

### Q3 — RLS/security isolation
- two-network adversarial matrix.
- owner/admin/member/anonymous direct REST and RPC calls.
- cross-network ID substitution.
- storage path isolation.
- invite/claim token replay/expiry/revocation.

### Q4 — API/integration tests
- health/ready.
- backup/export API.
- hard-purge API safety.
- auth/session failure cases.
- network-scoped errors and status codes.

### Q5 — Playwright golden paths
- stable fixtures and dedicated QA identities.
- shared generic flows across all 9 verticals.
- vertical-specific deep flows.
- role and lifecycle matrices.
- downloadable workbook roundtrip.

### Q6 — Expert exploratory crawler
- authenticated crawl for owner/admin/member.
- discover visible tabs/buttons/links.
- skip destructive actions unless staging mode.
- capture JS errors, failed requests, HTTP 5xx, fatal UI strings.
- screenshots/traces/videos.
- compare visited surface inventory against expected registry.

### Q7 — Data-volume & resilience
- 10 / 100 / 1,000+ entity fixtures where appropriate.
- import large workbook.
- pagination/filter/search once implemented.
- concurrency/double-submit/idempotency.
- offline/retry/slow network behavior.

### Q8 — Accessibility/responsive/browser
- keyboard and focus.
- axe integration.
- desktop/mobile layouts.
- Chromium primary; Firefox/WebKit smoke after stabilization.

### Q9 — Certification report
One command outputs:
- PASS/FAIL by vertical × role × capability.
- bug severity P0/P1/P2/P3.
- exact reproduction.
- screenshot/trace/video.
- console/network evidence.
- suspected subsystem.
- regression test ID to add after fix.
- action plan ordered by blast radius.

## Test data strategy
Use synthetic, explicitly non-real data by default. Dedicated QA users should be created in a staging Supabase project via admin API only when `QA_MODE=staging` and mutation guard is enabled. Real production-like datasets can later be ingested through the same Playwright/import flows after anonymization or explicit authorization.

## Certification rule
A mission is not complete because source gates pass. "Runtime certified" requires build + DB replay + RLS + API + Playwright golden path + cross-vertical smoke + zero open P0/P1 defects for the certified scope.
