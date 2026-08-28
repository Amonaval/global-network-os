# Generic Network OS — Next Session Bootstrap

Use the latest repository as canonical baseline. Ignore `.git` and do not inspect every file blindly.

## Read first

1. `AI-START-HERE.md`
2. `PRODUCT-CONSTITUTION.md`
3. `CURRENT-STATE.md`
4. `AIDLC-OPERATING-RULE.md`

Then load only the code/docs required by the requested mission.

## Current strategic task

Do **not** immediately implement a new G10.

First reconcile the existing multi-network identity/membership architecture with the complete `NE-1`…`NE-8` Network Effect track in `ROADMAP.md`.

Deliver before coding:

**A. Current State** — what already exists for account identity, membership, claiming, network-scoped entity/profile identity, active-network switching, invitations, permissions/RLS, typed relationships, network creation/templates, trusted introductions and Business Trust concepts.

**B. NE Review** — summarize NE-1…NE-8 and their real dependencies.

**C. Reconciliation** — identify what should remain, merge, move, rename, defer or be added versus the existing architecture and historical tentative G10–G15 direction.

**D. Architecture Model** — simple identity → membership → network profile/entity → network → cross-network trust/linking model.

**E. Privacy Model** — what may and may never cross network boundaries; where explicit consent is required.

**F. Next Mission** — recommend one highest-value coherent batch. Challenge the roadmap rather than accepting it mechanically.

## Current product stance

The product may be public, but heavy founder-led outreach is intentionally deferred while the experience/story still requires persuasion. Product work should increasingly make the value self-evident: remarkable UX, strong mobile experience, Playground/showcase, guidance, storytelling, trust, return loops and network effects.

G9/G9.1 intelligence foundations remain preserved but further quality hardening is parked pending real data and usage.

## Implementation invariants

- privacy/network isolation first;
- identity != membership != network profile/entity;
- preserve vertical semantics;
- prefer additive/decoupled changes;
- do not weaken Family or existing vertical behavior;
- avoid speculative enterprise infrastructure and speculative AI;
- follow the established mission closure lifecycle;
- deliver affected/new files only where practical.

The archived prior detailed handoff is available at `docs/history/NEXT-SESSION-PROMPT-pre-wow-doctrine-2026-08-26.md` if rationale recovery is needed; it is **not** default session context.


## Mission 2 handoff
Trusted Expertise & Professional Network is the sixth vertical and is source-gated. First perform/consume the runtime checklist and fix only contained Mission 2 regressions. Do not begin the next graph/platform mission until Professional creation/Playground/network isolation and the production build have been verified. Preserve STABILITY-1 and the NX Review seam. For i18n, English is canonical and EN/HI/MR have 328 current tokens each; use `npm run audit:i18n` to reduce remaining hard-coded visible strings only when touching those screens.
