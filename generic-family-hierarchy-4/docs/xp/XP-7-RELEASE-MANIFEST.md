# XP-7 Release Manifest

Mission: **XP-7 — Guide, What's New & Readiness Closure**

Checkpoint status: **SOURCE CLOSED / RUNTIME CERTIFICATION PENDING**

## Major XP-7 additions

- `core/guide/contextual-guide.ts`
- `core/readiness/network-health.ts`
- `core/readiness/regression-matrix.ts`
- `components/shared/NetworkContextualGuide.tsx`
- `components/shared/NetworkWhatsNew.tsx`
- `components/shared/NetworkHealthPanel.tsx`
- `scripts/xp7-guide-whatsnew-readiness-gate.mjs`
- XP-7 i18n tokens in English, Hindi and Marathi
- shared Admin Center health integration
- Productized + Alumni guide/What's New integration
- final 216-cell cross-vertical regression matrix

## Cumulative closure repairs bundled in final full checkpoint

- Missing `components/shared/NetworkParticipationAdmin.tsx` included.
- `core/participation/contracts.ts` preserves mature capability contracts while adding XP-6 invitation contracts.
- `lib/api-client.ts` discriminated-union error handling narrowed explicitly.
- XP-2 machine-value translation regressions corrected in Family/Productized/Family Intake logic.
- Migration `091_xp01_runtime_closure.sql` present.

## Database

No XP-7 migration is introduced. Final expected XP migration tail is 090, 091, 092, 093, 094.

## Validation

- XP-7 gate: see command output in checkpoint validation run.
- Visible-literal audit: zero unexplained production TSX candidates at checkpoint generation.
- Inherited XP/platform/HS/FCA source chain: passing at checkpoint generation.
- Relative local import audit: zero missing imports at checkpoint generation.
- Changed TS/TSX parse/transpile: passing at checkpoint generation.
- Full Next build: **not certified in packaging environment** because npm registry DNS was unavailable and no dependency cache existed.

## Deployment prerequisites

1. Clean dependency install.
2. `npm run build`.
3. Apply/verify migrations through 094.
4. Configure server-only `SUPABASE_SERVICE_ROLE_KEY`.
5. Execute `XP-7-RUNTIME-VERIFICATION-CHECKLIST.md`.
