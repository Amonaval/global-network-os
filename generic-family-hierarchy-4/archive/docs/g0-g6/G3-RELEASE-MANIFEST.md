# G3 Release Manifest — Network Construction Engine Extraction

**Release date:** 2026-08-25  
**Release type:** consolidated High-effort architecture batch  
**Family behavior target:** exact compatibility / no intended user-facing change

## Architecture introduced

- `core/construction/contracts.ts` — neutral construction workflow contracts.
- `capabilities/construction/runtime.ts` — adapter-independent construction orchestration.
- `verticals/family/construction/types.ts` — historical S3-A1 Family/Kinship DTO ownership.
- `verticals/family/construction/adapter.ts` — existing Family intake RPC transport + generic mapping.
- `verticals/alumni/construction/types.ts` — institutional/batch/program construction semantics.
- `verticals/alumni/construction/adapter.ts` — explicit unavailable skeleton until Alumni persistence/RLS exists.
- `app-shell/vertical-capabilities.ts` — construction runtime composition.
- `lib/remote.ts` — unchanged public Family API surface through compatibility re-exports.
- `lib/family-intake-types.ts` — unchanged public Family type path through compatibility re-export.

## Compatibility locks

- 147/147 historical `lib/remote.ts` exports preserved.
- 234/234 accepted G2 baseline files preserved.
- all eight existing S3-A1 RPC names preserved.
- migration 043 tables/RLS/token/commit behavior preserved.
- existing S3-A1 UI imports preserved.
- existing Family feature key/default/navigation preserved.
- no migration added after 044.

## Automated validation

- Historical D1/V1/CR1/CR2/S1/S2/S3-A1 gates: PASS.
- G1.1/G1.2/G1.3/G1.4/G2 gates: PASS.
- `validate:g3`: PASS.
- focused strict TypeScript 5.8.3 no-emit check: PASS.
- focused construction-runtime execution assertion: PASS.
- G3 source-gate syntax check: PASS.
- accepted source deletion audit: 0 deleted files.

Full Next.js build is not certified in this workspace because installed dependencies are absent.

## Deployment/runtime requirement

No G3 database action. Use only `G3-RUNTIME-VERIFICATION-CHECKLIST.md` for the short smoke.

## Next architecture batch

**G4 — Vertical Runtime & App Composition**.

## Affected-file release contents

G3 changes **28 files** relative to the accepted G2 baseline: 11 new files and 17 modified files, with **0 deleted accepted files**. The release ZIP preserves original folder hierarchy and excludes dependency/build directories.

New files:
- `G3-NETWORK-CONSTRUCTION-ENGINE-EXTRACTION.md`
- `G3-RELEASE-MANIFEST.md`
- `G3-RUNTIME-VERIFICATION-CHECKLIST.md`
- `capabilities/construction/runtime.ts`
- `core/construction/contracts.ts`
- `scripts/g3-accepted-source-baseline.txt`
- `scripts/g3-network-construction-gate.mjs`
- `verticals/alumni/construction/adapter.ts`
- `verticals/alumni/construction/types.ts`
- `verticals/family/construction/adapter.ts`
- `verticals/family/construction/types.ts`

Modified files include the vertical capability definitions/composition, Family compatibility facades, historical S3/G1.4 gates, package validation script, architecture/status/validation documents, and `NEXT-SESSION-PROMPT.md`.
