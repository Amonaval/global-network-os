# HS-3 — Maintenance, Dues & Finance

Status: **SOURCE IMPLEMENTED / RUNTIME VERIFY**

## Purpose
Represent one complete Housing Society maintenance billing cycle accurately without turning TrustWeave into a payment gateway or full accounting replacement.

## Build regression fixed
The Housing Society template introduced HS-2 capability IDs (`notices`, `complaints`, `vendors`, `amenities`, `bookings`) without extending the shared `CapabilityId` union. `core/templates/contracts.ts` is now exhaustive for HS-2 and HS-3 (`maintenance`, `billing`, `dues`, `finance`). The housing template type-checks against the shared contract without casts.

## Delivered
- Configurable charge heads for maintenance, sinking/repair funds, parking, water, common electricity, non-occupancy and special assessments.
- Billing cycles with period, due date, grace days and penalty-rate configuration.
- Unit/flat bills generated from active fixed charge heads.
- Immutable bill line items and separate adjustment/waiver/penalty history.
- Paid / partial / unpaid / waived bill states recalculated from recorded facts.
- Manual payment records with payment reference and receipt number; payment gateway deliberately deferred.
- Resident Maintenance surface showing only the signed-in resident's currently occupied flat ledger and receipts.
- Admin flat ledger, payment recording, adjustments/waivers and arrears watch.
- Society funds with controlled member/admin visibility.
- Budget lines plus actual expense recording and budget-vs-actual visibility.
- Society-scoped RLS and admin-only official finance mutations.
- Migration 085, feature flags, runtime adapter, navigation, source gate and closure artifacts.

## Data/history doctrine
Bills, bill lines, adjustments and payments are separate records. Historical bills are not reconstructed from today's charge-head values. Payment and waiver changes append evidence and trigger deterministic bill balance/status recalculation.

## Security doctrine
Residents can read only bills/payments for a unit they currently occupy through a claimed person identity. Committee/admin users may operate society-wide billing. Fund/budget/expense visibility is independently member/admin scoped.

## Deferred
- payment gateway / automated reconciliation
- Tally/accounting integration
- GST/tax engine beyond basic charge metadata
- bank statement ingestion
- automated penalty scheduler
- invoice PDF/email automation

## Validation
- `validate:hs3`: 28/28 HS-3 checks.
- Full chain: HS-2 26/26, HS-1 27/27, HS-0 24/24, FCA-0 27/27.
- Isolated `CapabilityId` + housing template TypeScript type-check passes.
- Changed TS/TSX syntax/transpile pass: 7/7.

## Runtime certification gate
Apply migration 085 on staging, rerun it, configure at least two charge heads, issue one real/sanitized cycle across 20–50 units, record full + partial payment + waiver, verify resident isolation, and reconcile totals against a known spreadsheet/sample ledger.

## Next mission
**HS-4 — Governance, Meetings & Decisions** after HS-3 runtime verification.
