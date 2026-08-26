# G6 Release Manifest — Two-Vertical Architecture Proof, Shared UX Composition & Hardening

**Status:** CERTIFIED

## Release summary

- Baseline: certified G5 Alumni Network V1 R2.
- Mission: G6 — Two-Vertical Architecture Proof, Shared UX Composition & Hardening.
- Scope: shared UX primitives, polished Alumni product surface, vertical-aware Launch Control, switching/isolation hardening, and additive database integrity hardening.
- Database migration: `046_g6_two_vertical_hardening.sql` (apply after migration 045).
- Historical remote compatibility: 147/147 exports preserved.
- Accepted G5 baseline preservation: 280/280 files preserved.
- Critical Family foundations: 7/7 preserved.
- Accepted-file deletions: 0.
- Full automated source gate chain through G6: PASS.
- Changed TS/TSX focused TypeScript transpilation: PASS.

## Affected-file delta

- Added: **10**
- Modified: **23**
- Deleted: **0**
- Total affected/new files: **33**

### Added

- `G6-RELEASE-MANIFEST.md`
- `G6-RUNTIME-VERIFICATION-CHECKLIST.md`
- `G6-TWO-VERTICAL-PROOF-SHARED-UX-HARDENING.md`
- `components/shared/NetworkSwitcher.tsx`
- `components/shared/NetworkTopbar.tsx`
- `components/shared/NetworkUi.tsx`
- `scripts/g6-accepted-g5-baseline.txt`
- `scripts/g6-protected-family-foundations.json`
- `scripts/g6-two-vertical-hardening-gate.mjs`
- `supabase/migrations/046_g6_two_vertical_hardening.sql`

### Modified

- `CODEBASE.md`
- `DEVELOPMENT-RULES.md`
- `G0-TRUSTED-NETWORK-ARCHITECTURE-BLUEPRINT.md`
- `G5-ALUMNI-NETWORK-V1.md`
- `MISSION-STATUS.md`
- `NEXT-SESSION-PROMPT.md`
- `PROJECT-VISION.md`
- `ROADMAP.md`
- `SUPABASE-SETUP-GUIDE.md`
- `USER-GUIDE.md`
- `VALIDATION.md`
- `app/globals.css`
- `capabilities/launch-runtime/remote.ts`
- `components/AlumniNetworkApp.tsx`
- `components/FounderLaunchConsole.tsx`
- `components/NetworkApp.tsx`
- `lib/remote.ts`
- `package.json`
- `scripts/g2-shared-identity-participation-gate.mjs`
- `scripts/g3-network-construction-gate.mjs`
- `scripts/g4-vertical-runtime-gate.mjs`
- `scripts/s1-hardening-source-gate.mjs`
- `verticals/alumni/data/remote.ts`

### Deleted

- None

## Certification gates

- D1/V1/CR1/CR2/CR2.1/CR2.2/CR2.3: PASS.
- S1-A/B, S1-C, S1 hardening, S1-D: PASS.
- S2-A/B/C/D/E and S2-E closure: PASS.
- S3-A1: PASS.
- G1.1/G1.2/G1.3/G1.4: PASS.
- G2/G3/G4/G5/G6: PASS.

## Runtime verification

See `G6-RUNTIME-VERIFICATION-CHECKLIST.md`. Keep manual verification high-level; automated gates cover structural regressions.

## Deployment

1. Apply the affected source files.
2. Apply `supabase/migrations/046_g6_two_vertical_hardening.sql` after migration 045.
3. Deploy the application.
4. Run the short G6 runtime smoke check.

## Next mission

Proceed from this certified G6 baseline only. See `NEXT-SESSION-PROMPT.md` for the authoritative next batch.
