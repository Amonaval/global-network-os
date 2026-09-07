# HS-1 — Property, Household & Resident Core

## Status
**SOURCE IMPLEMENTED / RUNTIME VERIFY**

## Mission goal
Make the Housing Society people/property graph trustworthy enough for a real 20–50 unit pilot without manual database work.

## Delivered
- append-only owner / co-owner / tenant / occupant lifecycle with effective start/end dates;
- explicit separation between current graph relationships and historical property facts;
- resident **My Flat** surface based on claimed identity + current occupancy;
- resident directory retains profile thumbnails and adds Housing Society filters for units/households/residents, Building/Tower and owner/tenant resident type;
- household membership remains a reusable generic graph primitive;
- resident profile claiming through society-specific, single-resident invitation links bound to the invited verified email;
- vehicle registration scoped to a resident's current flat;
- parking slots and time-bounded parking allocation history;
- committee/admin property snapshot and owner/tenant history table;
- Excel/CSV bulk onboarding with explicit column mapping;
- import processing for units, residents, households, occupancy roles, invitations, vehicles and parking;
- import batch audit records;
- Housing Society-specific feature catalog, guide content and Launch Control feature rows.

## Data model
### `hs_unit_occupancy_history`
The authoritative temporal property lifecycle. A new period is appended; an active prior period is ended rather than erased. Roles: `owner`, `co-owner`, `tenant`, `occupant`.

### `hs_parking_slots`, `hs_vehicles`, `hs_parking_allocations`
Parking slots are society-controlled. Vehicles may be resident-created only for a currently occupied flat. Allocation history is time bounded and admin governed.

### `hs_resident_invitations`
Invitation records bind a person entity, optional unit, email, single token, expiry and claim state. Accepting requires authentication with the invited email; acceptance joins the society and claims only that resident entity.

### `hs_import_batches`
Tracks file name, mapping, row count, inserted/updated/skipped counts and commit/failure state.

## Authorization boundaries
- official ownership, tenancy and occupancy facts: **network owner/admin only**;
- parking slots/allocation: **network owner/admin only**;
- resident claiming: invited verified email only;
- My Flat: derived from the signed-in user's claimed person entity;
- vehicle registration: member may write only against a currently occupied unit;
- invitation list/tokens: admin snapshot only;
- finance, complaints, security records and owner documents remain outside HS-1.

## Bulk onboarding contract
The mapper requires `unit` + `resident_name`. Recommended fields include building, wing, floor, unit type, occupancy role, resident email, phone, household, vehicle registration/type and parking slot. Aliases cover common inputs such as Flat, Flat No, Tower and Parking.

The database importer upserts structure/person records, links households/residency, appends current occupancy history if absent, creates verified-email invitation records, and can seed vehicle/parking data. It also records an import batch so onboarding is auditable.

## Validation
- `npm run validate:hs1`: 25 HS-1 checks.
- chained HS-0 gate: 24 checks.
- chained FCA-0 regression gate: 27 checks.
- 7 changed/new TS/TSX HS-1 files pass TypeScript parse/transpile validation with the installed compiler.
- full project `tsc --noEmit` is not certifiable from this ZIP because `node_modules` is absent; errors begin with missing React/Next/Supabase/Node packages.

## Runtime verification still required
Apply migration `083_hs1_property_household_resident_core.sql` to a disposable/staging Supabase instance and execute `HS-1-RUNTIME-VERIFICATION-CHECKLIST.md` before calling HS-1 runtime certified.

## Not included
Complaints/notices/vendor operations (HS-2), maintenance billing/dues (HS-3), governance (HS-4), visitor/security/compliance/assets (HS-5).

## Next mission
**HS-2 — Daily Society Operations** after one HS-1 pilot import and resident-claiming walkthrough confirms the core graph and authorization model.
