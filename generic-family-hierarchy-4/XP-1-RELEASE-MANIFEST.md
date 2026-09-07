# XP-1 Release Manifest

Mission: **Guided Excel / Workbook Onboarding Platform**

Schema migration: **none required**. XP-1 reuses existing network/entity/relationship and vertical domain persistence contracts.

Primary source changes:
- `core/import/contracts.ts`
- `core/import/registry.ts`
- `core/import/workbook.ts`
- `core/import/parser.ts`
- `components/shared/GuidedWorkbookImport.tsx`
- `capabilities/import/productized-workbook.ts`
- `capabilities/import/alumni-workbook.ts`
- `capabilities/import/housing-workbook.ts`
- `components/TemplateNetworkApp.tsx`
- `components/AlumniNetworkApp.tsx`
- `components/HousingSocietyCorePanel.tsx`
- `scripts/xp1-guided-workbook-onboarding-gate.mjs`
- `scripts/hs1-property-resident-core-gate.mjs` (updated to certify the new shared guided HS-1 import path)
- `package.json`

Closure artifacts:
- `XP-1-GUIDED-WORKBOOK-ONBOARDING.md`
- `XP-1-RUNTIME-VERIFICATION-CHECKLIST.md`
- `XP-1-RELEASE-MANIFEST.md`
- `XP-1-AFFECTED-FILES.txt`
- updates to `CURRENT-STATE.md`, `ROADMAP.md`, `MISSION-STATUS.md`, `USER-GUIDE.md`

Certification: **source checkpoint only**. Dependency-installed Next.js/browser/staging persistence verification remains pending.
