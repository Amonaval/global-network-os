# Permanent Mission Documentation Rule

## Principle
Every major TrustWeave mission must leave both **implementation evidence** and an updated **living product narrative**. A mission is not fully closed if the code changed materially but current product documentation still describes an older product.

## Required mission artifacts

For a major mission (or an intentionally grouped batch), produce:

1. `MISSION-X-<NAME>.md` or equivalent technical mission document.
2. Human-readable durable mission artifact (`.docx` for major program milestones when practical/required by the mission family).
3. Release manifest / affected-files record where the delivery process uses them.
4. Runtime verification checklist where runtime verification is meaningful.
5. Affected-files ZIP or equivalent reproducible patch package.
6. Updated current-state/roadmap/status/handoff documentation where affected.

## Living documentation update matrix

At mission closure, explicitly decide whether each of these changed:

- `CURRENT-STATE.md`
- `MISSION-STATUS.md`
- `ROADMAP.md`
- `docs/product/TRUSTWEAVE-MISSION-JOURNEY.md` — **append for every material mission**
- `docs/product/CTO-PRODUCT-CAPABILITY-BOOK.md` — update when architecture/capability changes
- `docs/product/USER-EXPERIENCE-HANDBOOK.md` — update when user/admin behavior changes
- `TRUSTWEAVE-PUBLIC-PRODUCT-PROFILE.html` — update for meaningful public-facing expansion
- `TRUSTWEAVE-PRODUCT-EVOLUTION-JOURNEY.html` — update after mission-family/milestone completion
- `TRUSTWEAVE-PRODUCT-FEATURE-HANDBOOK.html` — update when feature/status/ownership changes

If a file does not need an update, say so in the mission closure note rather than silently ignoring it.

## DOCX guidance

When a durable `.docx` is produced, it should explain in plain language:

- why the mission exists,
- before vs after,
- what was implemented and deliberately not implemented,
- privacy/security/governance decisions,
- user/product value,
- affected areas and compatibility guardrails,
- validation/runtime checklist and known limitations,
- recommended next mission.

Markdown remains the implementation-friendly source of truth; the DOCX must not contradict it.

## Archive rule

Once a mission is superseded/closed and no active gate requires the root path, move its mission artifacts under the appropriate `archive/docs/missions/<program>/` folder. Preserve the original-root mapping in `archive/docs/archive-map.json`.

Affected-file lists and release evidence belong under `archive/evidence/` once closed.

## Closure lifecycle

`IMPLEMENT → VALIDATE → GUIDE → PLAYGROUND where useful → LAUNCH CONTROL where useful → WHAT'S NEW where useful → ROADMAP/STATUS → MISSION JOURNEY → LIVING DOCS → ARCHIVE CLOSED EVIDENCE → CLOSE`
