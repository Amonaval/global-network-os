# G9 Release Manifest

## Added
- `core/intelligence/contracts.ts`
- `core/intelligence/engine.ts`
- `components/shared/NetworkIntelligenceCenter.tsx`
- `supabase/migrations/049_g9_network_intelligence.sql`
- `scripts/g9-network-intelligence-gate.mjs`
- G9 documentation/checklist

## Updated
- five vertical capability definitions / feature catalogs / compositions
- Family, Alumni and productized vertical app surfaces
- Guide coverage
- Launch Control bundle metadata
- theme/mobile CSS
- roadmap/status/codebase/validation/handoff docs

## Database
Apply `049_g9_network_intelligence.sql` after 048.

## Rollout
All five Intelligence bundles begin at `test` for real networks and are enabled in Playground.

## Post-release runtime certification / Commercial Reality Gate — 2026-08-26
- Added executable deterministic behavior smoke test: `scripts/g9-intelligence-runtime-smoke.mjs`.
- Added `npm run validate:g9-runtime` and made it part of `validate:g9`.
- Corrected `askNetwork()` single-target warm-introduction reasoning discovered by the smoke test.
- Added `G9-INTELLIGENCE-HOW-IT-WORKS.md`.
- Added `G9-RUNTIME-CERTIFICATION-COMMERCIAL-REALITY-GATE.md`.
- Added `G9.1-ORGANIZATION-PILOT-PLAYBOOK.md`.
- Commercial status: technical PASS; CONDITIONAL PASS to a focused Organization pilot; G10 blocked pending real buyer/data/willingness-to-pay evidence.
