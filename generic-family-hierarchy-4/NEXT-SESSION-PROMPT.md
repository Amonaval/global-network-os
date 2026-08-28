# Generic Network OS — Next Session Bootstrap

Use the latest repository as canonical baseline. Ignore `.git`.

## Read first

1. `AI-START-HERE.md`
2. `PRODUCT-CONSTITUTION.md`
3. `CURRENT-STATE.md`
4. `AIDLC-OPERATING-RULE.md`
5. `MISSION-1-SIGNATURE-PRODUCT-EXPERIENCE.md`
6. `MISSION-1-RUNTIME-VERIFICATION-CHECKLIST.md`

Then inspect only files relevant to observed runtime issues.

## Current exact task

**Mission 1 — Signature Product Experience & Quality Gate is source-implemented but not yet runtime-verified.**

Do not start Mission 2 until the Mission 1 runtime gate is resolved.

### Current source state

- Family Home now uses **My Family, Through Me** rather than the NX `Today / People / Legacy` stack.
- Primary Family navigation is intentionally lean; advanced destinations are progressively disclosed.
- Signature selection lives in `lib/family-signature.ts`, independent of React/DOM/browser storage.
- The critical Family English/Hindi/Marathi journey has a source-level quality gate.
- `npm run validate:mission1` passes 11/11 + 9/9 + 8/8 source checks in the implementation workspace.
- A production build was not completed there because dependency installation timed out and `next` remained unavailable.

## Next execution

1. Run a clean install/build in the normal developer environment.
2. Execute `MISSION-1-RUNTIME-VERIFICATION-CHECKLIST.md`.
3. Record screenshots/issues for desktop, tablet and mobile plus English/Hindi/Marathi critical Family flows.
4. Fix all issues as one Mission 1 hardening window.
5. Re-run source/build/runtime gates.
6. Update status/docs and mark Mission 1 VERIFIED/RELEASED only after the runtime gate passes.

## After Mission 1 closes

Proceed to **Mission 2 — Trusted Expertise & Professional Network** as the first deliberate commercial/global vertical proof. Do not resume Family feature expansion, NE-2 or RAG hardening by default.

## Invariants

- network isolation first;
- identity != membership != network profile/entity;
- preserve vertical semantics;
- less visible UI, stronger primary journey;
- no speculative schema/AI/platform refactor;
- future-native portability without premature native duplication;
- affected/new-files ZIP only where practical.

## Mission 1 runtime closure status

Mission 1 source/static hardening is green. The only remaining closure gate is a real dependency-enabled `npm ci` + `npm run build` + browser verification using `MISSION-1-RUNTIME-VERIFICATION-CHECKLIST.md`. If that pass is clean, mark Mission 1 VERIFIED and proceed to Mission 2. If issues appear, fix them as the Mission 1 hardening window first.

