# XP-1 Workbook Sheet-Name Hotfix

Date: 2026-09-08

## Defect
`XLSX.utils.book_append_sheet` rejected registry display names containing Excel-forbidden worksheet characters. Housing Society exposed the defect through `Occupancy / Ownership / Tenancy`. The previous implementation only truncated names to 31 characters.

## Fix
- Added shared `core/import/sheet-names.ts`.
- Replaces `: \ / ? * [ ]` with a readable separator.
- Enforces Excel's 31-character worksheet-name limit.
- Removes invalid edge apostrophes and supplies a safe fallback.
- Resolves case-insensitive collisions after sanitization/truncation with deterministic numeric suffixes.
- Reserves `README` and `Column Guide`.
- Workbook generation and workbook parsing now use the same mapping.
- Parser still accepts the original schema display name where that name is a valid workbook sheet name, preserving manual/legacy compatibility.

## Validation
- XP-1 gate: 31/31.
- Full `npm run validate:xp1` inherited chain passes through XP-0, platform parity, HS-6 → HS-0, and FCA-0.
- Browser download/re-upload smoke remains a runtime verification item.
