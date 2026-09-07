# XP-1 — Guided Excel / Workbook Onboarding Platform

**Checkpoint:** source implemented / runtime verification pending  
**Baseline:** XP-0 Network Lifecycle Safety checkpoint

## Goal

Make the mature Family-style guided spreadsheet journey a reusable platform capability for every released vertical without copying Family JSX or flattening domain semantics.

## Implemented

### Shared Import Schema Registry

`core/import/registry.ts` now declares versioned workbook contracts for all released verticals:

- Family
- Alumni
- Association / Community
- Family Association
- Housing Society
- Organization
- Business Trust
- Franchise
- Professional

Every schema declares sheets, columns, required/optional fields, types, enum values, stable IDs, cross-sheet references, examples, privacy notes, importer targets and duplicate policy.

### Registry-driven workbook generation

`core/import/workbook.ts` generates XLSX workbooks directly from the registry. Every generated workbook includes:

- `README`
- workbook/schema version
- usage instructions
- duplicate policy
- privacy notes
- sheet guide
- `Column Guide`
- required/optional markers
- types
- accepted values / reference targets
- examples
- realistic sample rows in each domain sheet

No productized vertical needs a hand-maintained XLSX template.

Family intentionally retains its already-mature static guided workbook and specialized parser for this checkpoint; its matching registry contract is present so a later safe convergence can happen without reducing Family richness.

### Shared parser / validator

`core/import/parser.ts` validates before commit:

- missing required sheets
- missing required columns
- missing required values
- invalid number/date/boolean/email values
- invalid enum values
- duplicate stable IDs
- ambiguous IDs reused across sheets
- unresolved cross-sheet references
- unknown sheets

Rows are classified as `valid`, `warning`, or `rejected`. Blocking errors prevent commit.

### Shared guided import UX

`components/shared/GuidedWorkbookImport.tsx` provides one reusable flow:

**Download template → fill workbook → upload → validate → preview → confirm import**

It shows file name, per-sheet counts, valid/warning/rejected totals, exact row/column issues, privacy guidance and a final explicit confirmation.

### Vertical commit adapters

The shared validation experience does not erase domain semantics.

- **Productized verticals:** stable-ID-aware entity upsert plus typed relationship creation.
- **Housing Society:** workbook sheets are converted into the existing HS-1 history-aware resident/unit/occupancy/vehicle/parking importer.
- **Alumni:** profiles continue through the Alumni domain importer; optional cohorts use shared entities and validated connection rows create graph relationships after profile resolution.
- **Family:** retains the mature Family-specific kinship validator/importer.

## Workbook shapes

### Family
`Family Members`, `Relationships`

### Alumni
`Alumni`, `Cohorts / Chapters`, `Connections`

### Housing Society
`Buildings / Units`, `Residents`, `Occupancy / Ownership / Tenancy`, `Vehicles`, `Parking`

### Family Association
`Families`, `People`, `Household Membership`, `Association Membership`

### Organization
`People`, `Teams`, `Projects`, `Skills`, `Reporting / Relationships`

### Business Trust
`Businesses`, `Contacts`, `Categories`, `Trust / Business Relationships`

### Franchise
`Branches`, `Owners / Operators`, `Geography`, `Organizational Relationships`

### Professional
`Professionals`, `Expertise`, `Affiliations`, `Professional Relationships`

### Association
`Members`, `Chapters / Groups`, `Roles / Affiliations`

## Duplicate behavior

Stable IDs are intentionally user-friendly workbook identifiers such as `P001` or `U001`, never government identifiers. Within the generic productized adapter, previously imported stable IDs are matched through `metadata.importStableId` and updated rather than blindly recreated. Existing typed relationships are detected and skipped. Housing Society and Alumni retain their domain-specific matching/update behavior.

## Architecture decision

XP-1 deliberately separates four jobs:

1. **Schema registry** — what a vertical accepts.
2. **Workbook generator** — how humans receive a usable template.
3. **Parser/validator** — what is valid before persistence.
4. **Commit adapter** — how that vertical safely persists validated data.

This is the binding reusable pattern for future verticals.

## Validation completed

- XP-1 source gate.
- Strict standalone TypeScript check for registry/contracts.
- Independent TypeScript parse/transpile of all XP-1 changed TS/TSX files.
- Existing XP-0/platform/HS/FCA source regression chain is executed through `npm run validate:xp1`.

## Runtime still required

This checkpoint is **not runtime-certified** until the checklist is exercised against a dependency-installed app and staging Supabase environment, including generated XLSX download/open, upload parsing, domain commits, duplicate re-import and cross-sheet error cases for each released vertical.
