# QA Phase 4C — Apply Note

Apply this patch on top of the Phase-4B-certified working tree.

## Added
- `qa/e2e/21-phase4c-governance-permissions-destructive.spec.ts`
- `qa/unit/phase4c-governance-contracts.test.mjs`
- `qa/run-phase4c-certification.mjs`
- `qa/report-phase4c-summary.mjs`
- `QA-PHASE4C-GOVERNANCE-PERMISSIONS-DESTRUCTIVE-SAFETY-MISSION.md`
- `QA-PHASE4C-GOVERNANCE-PERMISSIONS-DESTRUCTIVE-SAFETY-MISSION.docx`
- `QA-PHASE4C-APPLY-NOTE.md`

## Updated
- `package.json`
- `components/FamilyAdminCenter.tsx` — QA test IDs only
- `components/TemplateNetworkApp.tsx` — QA test IDs only
- `QA-CURRENT-STATUS.md`
- `qa/README.md`
- `qa/TEST-CASE-CATALOG.md`

## Important safety boundary
No migration or SQL file is part of this patch. Do not reopen or rerun the experimental Phase-3 096/097 Storage migrations as part of Phase 4C.

Phase 4C performs one reversible Organization admin-role mutation only when `QA_MODE=staging` and `QA_ALLOW_MUTATION=true`; the test restores `admin` in `finally`. No purge/permanent-delete action is executed.

## Execution
```bash
npm run qa:phase4c:local
npm run qa:phase4c:browser
```

Run `npm run qa:certify:phase4c` only after both are green.
