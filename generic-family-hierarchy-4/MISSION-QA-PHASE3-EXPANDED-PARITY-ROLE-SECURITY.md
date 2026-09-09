# Mission QA Phase 3 — Expanded Platform Parity & Role/Security Certification

## Mission state
Implementation started from the formally certified Phase-2 baseline. Product feature work remains paused.

## Why this phase exists
Phase 1 proved a compact Free-Tier POC. Phase 2 proved representative platform capabilities deeply. Phase 3 broadens that assurance across every released vertical and the important role transitions without introducing expensive all-browser, load, stress, or full Cartesian execution.

## What is being certified
1. Owner, admin and member runtime parity across all 9 released verticals using session reuse.
2. Deeper distinct behavior for Housing Society and Family Association.
3. Governed invitation claiming from owner creation through invitee acceptance and replay protection.
4. Cross-tenant mutation denial in addition to the Phase-2 read-denial proof.
5. Full adversarial RLS suite as a required gate.
6. RPC permission debt non-regression against the Phase-2-certified 331-finding ceiling.
7. The complete Phase-2 representative browser suite as a regression layer.

## Security posture
The 331 known RPC findings are not suppressed, globally allowed, or discarded. Phase 3 prevents the known debt from silently increasing. Strict production certification will still require explicit privilege review and remediation, especially for SECURITY DEFINER functions.

## Runtime discipline
One Chromium worker, headed mode, deterministic tiny fixtures, reused authenticated sessions, focused mutations with cleanup, and no fresh replay/load/stress/browser matrix.

## Exit gate
`npm run qa:certify:phase3` must end in `PHASE3_CERTIFIED`. Failures must continue to be classified before fixing tests or product code.
