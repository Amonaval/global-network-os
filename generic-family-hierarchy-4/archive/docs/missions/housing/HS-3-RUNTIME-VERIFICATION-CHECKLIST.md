# HS-3 Runtime Verification Checklist

## Database / rerun safety
- [ ] Apply migrations through `085_hs3_maintenance_dues_finance.sql` on staging.
- [ ] Rerun 085; confirm no table/index/policy/function conflict.
- [ ] Confirm migrations 082–084 and FCA runtime remain healthy.

## Build regression
- [ ] Run `npm run build` with dependencies installed.
- [ ] Confirm `templates/housing-society/definition.ts` no longer fails on `"notices" is not assignable to CapabilityId`.
- [ ] Confirm no new Housing Society capability contract error.

## Charge catalog + cycle
- [ ] Create Maintenance + Sinking Fund charge heads.
- [ ] Create a billing cycle with due date/grace configuration.
- [ ] Generate bills for 20–50 units.
- [ ] Re-run generation for the same cycle and confirm duplicate bills are not created.

## Resident isolation
- [ ] Claimed resident sees only current flat bill(s), lines and receipt(s).
- [ ] Resident cannot call admin finance write RPCs.
- [ ] Resident from Flat A cannot read Flat B bill/payment rows.

## Ledger / collections
- [ ] Record full payment and verify status becomes `paid`.
- [ ] Record partial payment and verify status becomes `partial`.
- [ ] Apply credit/debit/waiver/penalty and verify history + recalculated balance.
- [ ] Verify payment reference and receipt number display.
- [ ] Verify overdue bill appears in arrears watch.

## Funds / budget
- [ ] Create a member-visible fund and an admin-only fund.
- [ ] Create budget lines and record actual expenses.
- [ ] Verify member visibility respects configured boundary.
- [ ] Reconcile budget/actual totals against a known spreadsheet/sample.

## Pilot gate
- [ ] Represent one complete maintenance cycle without external spreadsheet status tracking.
- [ ] Reconcile total billed, collected and outstanding values to the source ledger.
