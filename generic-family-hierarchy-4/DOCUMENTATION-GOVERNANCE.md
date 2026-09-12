# TrustWeave Documentation Governance

## Canonical living documents

The following must be updated at the close of every material mission:

1. `CURRENT-STATE.md` — compact operational truth.
2. `MISSION-STATUS.md` — current milestone and latest closed missions.
3. `ROADMAP.md` — active sequence and intentionally deferred work.
4. `docs/product/TRUSTWEAVE-MISSION-JOURNEY.md` — append-only chronological mission ledger.
5. `docs/product/CTO-PRODUCT-CAPABILITY-BOOK.md` — capability/architecture truth when capability materially changes.
6. `docs/product/USER-EXPERIENCE-HANDBOOK.md` — when a visible user/admin flow changes.
7. `TRUSTWEAVE-PUBLIC-PRODUCT-PROFILE.html` — after meaningful public-facing product expansion.
8. `TRUSTWEAVE-PRODUCT-EVOLUTION-JOURNEY.html` — after milestone-family completion.
9. `TRUSTWEAVE-PRODUCT-FEATURE-HANDBOOK.html` — PM-facing feature/state/index view.

## Evidence vs living documentation

- **Living docs** explain the product as it exists now.
- **Mission docs** explain what a specific change set achieved.
- **Release manifests/checklists** are evidence and belong in the archive after closure.
- **Affected-file lists** are release evidence, not product documentation.
- **Old session prompts** are historical artifacts, not current instructions.

## Mission closure rule

A mission is not documentation-complete until it has:

`IMPLEMENT → VALIDATE → GUIDE → PLAYGROUND if applicable → LAUNCH CONTROL if applicable → WHAT'S NEW if applicable → ROADMAP/STATUS → MISSION LEDGER → ARCHIVE CLOSED EVIDENCE`

## Root-folder rule

The repository root is reserved for:

- code/configuration entry files,
- current operational documents,
- public/evolution/PM HTML artifacts,
- gate-referenced compatibility documents that cannot be moved without changing accepted certification contracts.

Historical artifacts go under `archive/`. Product documentation goes under `docs/product/`. Current engagement documentation goes under `docs/engagement/`.

## Status vocabulary

Use only these lifecycle states unless a mission needs a narrower qualifier:

- PLANNED
- ACTIVE
- IMPLEMENTED
- SOURCE-GATED
- RUNTIME-VERIFIED
- PILOT-VALIDATED
- RELEASED
- PAUSED
- SUPERSEDED

Never mark runtime/pilot verification merely because source tests pass.
