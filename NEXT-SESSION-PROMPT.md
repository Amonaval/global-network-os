# Next Session Prompt — G5 Alumni Network V1

Use the latest cumulative codebase containing G0 + G1.1 + G1.2 + G1.3 + G1.4 + G2 + G3 + G4.

Read first:
1. `G4-VERTICAL-RUNTIME-APP-COMPOSITION.md`
2. `G3-NETWORK-CONSTRUCTION-ENGINE-EXTRACTION.md`
3. `G2-SHARED-IDENTITY-CLAIMING-PARTICIPATION-FOUNDATION.md`
4. `G0-TRUSTED-NETWORK-ARCHITECTURE-BLUEPRINT.md`
5. `DEVELOPMENT-RULES.md`
6. `ROADMAP.md`
7. `MISSION-STATUS.md`
8. `CODEBASE.md`

## Mission

Implement **G5 — Alumni Network V1** as one consolidated High-effort batch. This is the first real second vertical, not another architecture-only skeleton and not a relabeled Family tree.

## Binding objective

Deliver a genuinely usable Alumni Network V1 on the shared platform seams proven by G1–G4 while keeping the existing Family product stable.

Minimum Alumni V1 scope should include, where technically coherent in one batch:
- explicit Alumni network creation/selection;
- institution identity and Alumni profile persistence/RLS;
- graduation year / batch, program/course and department/branch semantics;
- Alumni Home + directory/search/filter experience;
- onboarding/import using the shared construction lifecycle with an Alumni adapter;
- account↔Alumni profile claiming using shared claiming mechanics;
- invitation/participation basics using shared participation mechanics;
- cohort/classmate/senior-junior or mentor/professional connection semantics only where they are genuine Alumni relationships;
- Alumni Admin basics;
- Alumni Guide/help content for implemented flows;
- read-only Alumni Playground/demo if meaningful;
- Alumni Launch Control feature catalog/classification/defaults;
- What's New registration for shipped Alumni features;
- privacy and tenant-isolation rules.

## Hard constraints

- Do not store Alumni profiles in `family_members`.
- Do not reuse Family parent/child/spouse or generation/lineage semantics as Alumni relationships.
- Do not make Alumni work by only changing `NETWORK_TEMPLATES` labels.
- Family tables/RPCs/components remain untouched unless a proven shared seam needs a backward-compatible adapter change.
- Core/shared code must not import vertical implementations.
- Family and Alumni implementations must not import one another.
- App-shell remains composition root.
- Reuse G2 identity/participation and G3 construction mechanics; add Alumni-specific persistence/adapters rather than parallel ad-hoc flows.
- Prefer additive migrations and explicit RLS. Preserve existing Family schema/RLS.
- Family behavior regression is release-blocking.

## Validation requirements

Create consolidated `validate:g5` covering at minimum:
- Alumni persistence is separate from Family persistence;
- tenant/RLS isolation for Alumni data;
- Alumni identity/profile/claiming/invitation/import flow contracts;
- Alumni construction adapter no longer skeleton and uses Alumni persistence;
- Family construction/claiming/participation adapters remain unchanged;
- G4 Alumni app composition becomes user-visible only with real Alumni surfaces;
- Alumni feature catalog/Guide/Playground/Launch/What's New are internally consistent;
- all historical Family source gates still pass;
- all 147 historical remote exports remain present;
- accepted G4 files are not silently removed.

Run focused TypeScript/runtime tests and full build only if dependencies are available.

## Closure requirements

In the same batch:
- create `G5-ALUMNI-NETWORK-V1.md`;
- create `G5-RELEASE-MANIFEST.md`;
- create a short `G5-RUNTIME-VERIFICATION-CHECKLIST.md`;
- update G0 blueprint, CODEBASE, PROJECT-VISION, ROADMAP, MISSION-STATUS, VALIDATION, DEVELOPMENT-RULES and setup/deployment docs where required;
- update User/Admin Guide because G5 is user-facing;
- add Alumni-specific in-app Guide content for shipped workflows;
- create an affected-files-only G5 ZIP preserving hierarchy;
- advance handoff to G6 only after G5 closes coherently.

## Target result

At G5 closure, Family and Alumni should both be real products using the same platform primitives but different domain semantics/persistence. This is the decisive proof that the architecture is a Trusted Network Platform rather than reorganized Family code.

The next planned batch after successful G5 is **G6 — Two-Vertical Architecture Proof & Hardening**.
