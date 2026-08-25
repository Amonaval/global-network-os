# G2 Release Manifest — Shared Identity, Claiming & Participation Foundation

**Release date:** 2026-08-25  
**Release type:** consolidated High-effort architecture batch  
**Family behavior target:** exact compatibility / no intended user-facing change

## Architecture introduced

- `core/identity/contracts.ts` — neutral vertical identity and claiming contracts.
- `core/participation/contracts.ts` — neutral invitation, governed-contribution and participation contracts.
- `capabilities/identity-claiming/runtime.ts` — adapter-independent claiming runtime.
- `capabilities/participation/runtime.ts` — adapter-independent participation runtime.
- `verticals/family/identity/claiming-adapter.ts` — current Family verified-email claim transport behind the shared seam.
- `verticals/family/participation/*` — current Family invitation/contribution/metrics transport and compatibility types.
- `verticals/alumni/identity/*` — explicit institutional identity skeleton, not Family reuse.
- `verticals/alumni/participation/adapter.ts` — explicit unavailable Alumni participation skeleton until its own persistence/RLS exists.
- `app-shell/vertical-capabilities.ts` — composition root for vertical capability runtimes.

## Compatibility locks

- `lib/remote.ts` remains the existing Family-facing compatibility facade.
- `lib/participation-types.ts` remains a compatibility facade for historical Family transport types.
- 147/147 historical G1.4 `lib/remote.ts` exports preserved.
- Existing Family RPC names preserved.
- Existing Family tables/RLS/grants preserved.
- Existing feature keys/defaults/navigation preserved.
- No migration added after `044_g1_3_feature_catalog_integrity.sql`.

## Automated validation

- Historical D1/V1/CR1/CR2/S1/S2/S3-A1 gates: PASS.
- G1.1/G1.2/G1.3/G1.4 gates: PASS.
- `validate:g2`: PASS.
- Focused strict TypeScript 5.8.3 no-emit check: PASS (ES2021 target).
- G2 source-gate syntax check: PASS.
- Accepted source deletion audit: 0 deleted files.

Full Next.js build is not certified in this workspace because dependency installation did not complete within the execution environment.

## Deployment/runtime requirement

No G2 database action. Use only the short checks in `G2-RUNTIME-VERIFICATION-CHECKLIST.md`.

## Next architecture batch

**G3 — Network Construction Engine Extraction**.
