# Next Session Prompt — G3 Network Construction Engine Extraction

Use the latest cumulative codebase containing G0 + G1.1 + G1.2 + G1.3 + G1.4 + consolidated G2.

Read first:
1. `G2-SHARED-IDENTITY-CLAIMING-PARTICIPATION-FOUNDATION.md`
2. `G0-TRUSTED-NETWORK-ARCHITECTURE-BLUEPRINT.md`
3. `G1.4-REMOTE-CAPABILITY-SPLIT.md`
4. `DEVELOPMENT-RULES.md`
5. `CODEBASE-UPDATE-RULE.md`
6. `ROADMAP.md`
7. `MISSION-STATUS.md`
8. `CODEBASE.md`

## Mission

Implement **G3 — Network Construction Engine Extraction** as one consolidated High-effort architecture batch. Do not split it into G3.1/G3.2/G3.3 unless a genuine safety boundary makes that unavoidable.

## Binding objective

Extract the reusable workflow proven by S3-A1 without moving Family/kinship semantics into Core and without changing existing Family behavior, security, RPC names or accepted intake flows.

The shared construction capability should cover the reusable process shape where the code proves it is common:

`intake/source -> session -> staged entities/edges -> deterministic matching -> candidate/conflict resolution -> decisions -> provenance -> validation -> commit`

Family remains the authoritative implementation for current production behavior. Alumni supplies only enough second-consumer semantics/types/adapters to prove what is genuinely reusable; do not build a fake Alumni importer or reuse parent/child/spouse semantics.

## Required classification before extraction

Classify every S3-A1 concept into one of:
- CORE/SHARED construction primitive;
- KINSHIP intermediate-domain rule;
- FAMILY vertical behavior;
- ALUMNI second-consumer skeleton/evidence;
- DEFER until a second real implementation proves it.

Examples that must remain Family/Kinship-specific unless evidence proves otherwise:
- parent / child / spouse;
- generation ordering;
- lineage/cycle/kinship validation;
- branch language;
- Family-specific intake copy and activation UX.

Examples that are candidates for shared construction contracts/runtime:
- intake/session identity and lifecycle;
- source metadata;
- staged entity/edge envelopes;
- deterministic matching candidate representation;
- conflict/decision lifecycle;
- provenance/audit metadata;
- validation result envelopes;
- commit-plan/result interfaces.

## Compatibility and safety constraints

- Preserve current S3-A1 Family UI and all `family_intake_*` RPC/table behavior exactly.
- Do not rename current RPCs/tables or weaken RLS/security to make names generic.
- Prefer Family adapters around existing transports over database rewrites.
- Keep `lib/remote.ts` compatibility exports working; preserve all 147 historical G1.4 facade exports.
- Preserve G2 identity/claiming/participation adapters and their dependency direction.
- Alumni construction types must not import/use `family_members`, `parent`, `child`, `spouse`, generations or Family RPCs.
- Shared/Core construction contracts must not import Family or Alumni implementations.
- App-shell may compose vertical adapters; Core/shared capabilities may not compose verticals.
- No big-bang repository rewrite.
- No new database migration unless it is clearly additive, necessary and does not alter existing Family semantics. Prefer no migration for the extraction itself.
- No visible Family UX change unless required to preserve/correct existing behavior.

## Validation requirements

Create one consolidated `validate:g3` architecture/regression gate that at minimum verifies:
- shared construction code has no Family/Alumni implementation dependency;
- Family construction adapter owns/delegates the existing S3-A1 RPC semantics;
- Alumni construction skeleton has zero Family persistence/kinship reuse;
- existing S3-A1 UI still imports through compatible paths;
- all 147 historical `lib/remote.ts` exports remain present;
- G2 identity/participation contracts remain intact;
- no accepted source file is silently removed;
- migration additions, if any, are explicit and justified.

Run the complete historical source-gate suite through G3. Run focused TypeScript/runtime checks. Run the full application build only when dependencies are actually available; never mark it PASS if the environment prevents it.

## Closure/documentation requirements

At the end of the same batch:
- create `G3-NETWORK-CONSTRUCTION-ENGINE-EXTRACTION.md`;
- create only a very short `G3-RUNTIME-VERIFICATION-CHECKLIST.md`;
- update `G0-TRUSTED-NETWORK-ARCHITECTURE-BLUEPRINT.md`, `CODEBASE.md`, `PROJECT-VISION.md`, `ROADMAP.md`, `MISSION-STATUS.md`, `VALIDATION.md`, `DEVELOPMENT-RULES.md` if necessary, and this handoff;
- update User/Admin Guide only if visible Family behavior changed;
- create an affected-files-only G3 release ZIP preserving folder hierarchy.

## Target result

At G3 closure, the platform should have a real shared **Network Construction** workflow contract/runtime, current Family distributed intake should continue through an explicit Family adapter with unchanged behavior, and Alumni should provide enough non-kinship construction semantics to prove the abstraction without becoming a second partially built product.

The next planned batch after successful G3 is **G4 — Vertical Runtime & App Composition**.
