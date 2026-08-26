# G4 Release Manifest — Vertical Runtime & App Composition

**Release date:** 2026-08-25  
**Release type:** consolidated High-effort architecture batch  
**Family behavior target:** exact compatibility / no intended user-facing change

## Architecture introduced

- `core/verticals/app-composition.ts` — neutral contracts for app surface composition.
- `app-shell/vertical-runtime.ts` — validated vertical app/capability composition root.
- `verticals/family/runtime/composition.ts` — Family navigation, Guide, Playground, Launch and What's New registry.
- `verticals/alumni/runtime/composition.ts` — fail-closed non-user-visible Alumni skeleton.
- `components/NetworkApp.tsx` — consumes Family runtime registration while retaining existing Family renderers.
- `components/FounderLaunchConsole.tsx` — consumes registered Family launch metadata.
- `scripts/g4-vertical-runtime-gate.mjs` — consolidated G4 architecture/regression guard.
- `scripts/g4-accepted-source-baseline.txt` — accepted G3 deletion baseline.

## Compatibility locks

- 147/147 historical `lib/remote.ts` exports preserved.
- 260/260 accepted G3 files preserved.
- existing Family primary navigation order/labels/features preserved.
- all 23 Family feature definitions/defaults preserved.
- existing Guide/Playground/Launch Control/What's New behavior preserved.
- G2 identity/participation and G3 construction seams preserved.
- Alumni has no Family-only app surfaces.
- no migration added after 044.

## Automated validation

- every historical D1/V1/CR/S1/S2/S3-A1 gate: PASS;
- G1.1/G1.2/G1.3/G1.4/G2/G3: PASS;
- `validate:g4`: PASS;
- focused TypeScript 5.8.3 composition compile: PASS;
- changed TS/TSX syntax transpilation: PASS;
- executable Family/Alumni composition assertion: PASS;
- accepted source deletion audit: 0 deleted files.

Full Next.js build is not certified in this workspace because installed dependencies are absent.

## Deployment/runtime requirement

No G4 database action. Use only `G4-RUNTIME-VERIFICATION-CHECKLIST.md` for the short smoke.

## Next architecture/product batch

**G5 — Alumni Network V1**.

## Affected-file release contents

G4 changes **25 files** relative to the accepted G3 baseline: **9 new files + 16 modified files, 0 deleted accepted files**. The release ZIP preserves original hierarchy and excludes dependencies/build output.

New files:
- `G4-VERTICAL-RUNTIME-APP-COMPOSITION.md`
- `G4-RELEASE-MANIFEST.md`
- `G4-RUNTIME-VERIFICATION-CHECKLIST.md`
- `core/verticals/app-composition.ts`
- `app-shell/vertical-runtime.ts`
- `verticals/family/runtime/composition.ts`
- `verticals/alumni/runtime/composition.ts`
- `scripts/g4-vertical-runtime-gate.mjs`
- `scripts/g4-accepted-source-baseline.txt`

Modified files are the Family render consumers, typed vertical definitions/contracts, two historical source gates updated to follow moved canonical metadata, package validation script, architecture/status/validation/handoff documents, and no database files.
