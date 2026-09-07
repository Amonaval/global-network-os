# XP-1 Runtime Verification Checklist

Use a staging project and test network for every released vertical. Do not certify XP-1 from source gates alone.

## 1. Build / browser baseline

- [ ] Install repository dependencies from the lockfile.
- [ ] `npm run check:types` passes.
- [ ] `npm run build` passes.
- [ ] Open admin import UX in desktop and mobile widths.
- [ ] No console errors when opening or dismissing Guided Workbook Import.

## 2. Generated workbook contract — every vertical

For Family, Alumni, Association, Family Association, Housing Society, Organization, Business Trust, Franchise and Professional:

- [ ] Download the workbook.
- [ ] Workbook opens in Excel/LibreOffice/Google Sheets without repair warnings.
- [ ] README identifies vertical and schema version.
- [ ] Column Guide shows required/optional fields, types, accepted values/references, examples and descriptions.
- [ ] Required domain sheets exist.
- [ ] Sample rows are understandable without external documentation.
- [ ] Stable IDs are clearly non-sensitive friendly IDs.
- [ ] Privacy notes are visible.

## 3. Validation behavior

For each schema:

- [ ] Valid sample workbook reaches confirm state.
- [ ] Remove a required sheet → exact blocking error.
- [ ] Remove a required column → exact blocking error.
- [ ] Blank a required cell → row/column error.
- [ ] Duplicate a stable ID → rejected row.
- [ ] Reuse a stable ID in another sheet → ambiguous-ID error.
- [ ] Break a cross-sheet reference → unresolved-reference error.
- [ ] Enter invalid enum → accepted-values error.
- [ ] Enter malformed email/date/number/boolean → type-specific error.
- [ ] Add unknown worksheet → non-blocking warning.
- [ ] Confirm is disabled while any blocking error remains.

## 4. Commit behavior

### Generic productized verticals

- [ ] Valid entity rows create records in the active network only.
- [ ] Re-import same stable IDs updates instead of duplicating records.
- [ ] Typed relationships are created only when allowed by the vertical contract.
- [ ] Re-import does not duplicate an existing identical relationship.
- [ ] Another network cannot observe imported records.

### Alumni

- [ ] Alumni profiles create/update through the Alumni domain importer.
- [ ] Cohort rows can be persisted.
- [ ] Connection references resolve to the imported alumni profiles.
- [ ] Existing Alumni claiming/directory behavior still works after import.

### Housing Society

- [ ] Units + residents + occupancy commit through HS-1 importer.
- [ ] Owner/tenant history is appended/preserved rather than destructively overwritten.
- [ ] Vehicle rows map to resident/unit.
- [ ] Parking rows map to unit/vehicle where supplied.
- [ ] Resident email produces the existing claiming/invitation behavior.
- [ ] Re-import updates matching domain data without duplicate active occupancy records.

### Family

- [ ] Existing mature Family guided workbook flow remains unchanged.
- [ ] Family relationship/cycle/duplicate validation still passes.
- [ ] No Family-specific kinship behavior is forced into other verticals.

## 5. Security / privacy

- [ ] Member/non-admin cannot commit bulk import where admin is required.
- [ ] Imported rows remain active-network scoped under RLS.
- [ ] No workbook is uploaded to public Storage as part of validation.
- [ ] Error messages do not expose another tenant's data.
- [ ] Sensitive government identifiers are not requested by any generated schema.

## 6. Regression

- [ ] `npm run validate:xp1`
- [ ] XP-0 leave/archive/restore/hard-delete behavior remains intact.
- [ ] Launch Control still gates vertical capabilities as before.
- [ ] Existing manual add/edit flows remain available.
- [ ] Playground/demo experiences remain read-only where intended.

Record network IDs, browser, workbook version, exact command outputs and screenshots for failed cases before marking XP-1 runtime verified.
