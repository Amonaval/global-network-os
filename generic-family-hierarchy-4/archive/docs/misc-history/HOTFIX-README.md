# M3 i18n token + rejected Mission-1 residue hotfix

## Why
A local leftover `components/FamilySignatureExperience.tsx` from the rejected Mission-1 UI uses obsolete ad-hoc i18n keys such as `yourFamilyTogether`, `people`, and `addRelative`. TypeScript includes the file in compilation even when it is no longer imported, so it can break `next build`.

The accepted reconstructed STABILITY-1 → Mission 2 → Mission 3 tree does not contain this component.

## Changes
- Adds `scripts/i18n-token-integrity-gate.mjs`.
- Adds `npm run audit:i18n:tokens`.
- Adds that audit to `validate:m3`.
- Provides a guarded PowerShell cleanup for rejected Mission-1 residue.
- Does not change active UI/components or add compatibility aliases for obsolete translation keys.

## Verified on reconstructed baseline
- Mission 3 source gate: 11/11 PASS
- Mission 2 source gate: 19/19 PASS
- STABILITY-1 source gate: 14/14 PASS
- Canonical English tokens: 1,933
- Literal typed `t("...")` calls checked: 257
- Unknown tokens: 0

## Apply
1. Extract ZIP into repository root, preserving paths and overwriting `package.json`.
2. Run `powershell -ExecutionPolicy Bypass -File .\\APPLY-HOTFIX.ps1`.
3. Run `npm run validate:m3`.
4. Run `npm run build`.

Important: you already fixed the `use client` ordering locally. This hotfix deliberately does not overwrite those component files.
