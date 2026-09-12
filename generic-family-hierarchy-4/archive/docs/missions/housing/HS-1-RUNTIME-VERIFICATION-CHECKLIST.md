# HS-1 Runtime Verification Checklist

## Database
- [ ] Apply migrations through `083_hs1_property_household_resident_core.sql` on clean/staging DB.
- [ ] Rerun 083 and confirm no table/index/function conflict.
- [ ] Confirm HS-0/FCA compatibility assertions still pass.

## 20–50 unit onboarding gate
- [ ] Create a Housing Society network.
- [ ] Upload a realistic CSV/XLSX with 20–50 units.
- [ ] Map unit + resident name and several optional columns.
- [ ] Commit import without SQL/manual DB work.
- [ ] Verify units, people, households and residency graph.
- [ ] Verify import batch counts and audit entry.

## Property lifecycle
- [ ] Record owner and tenant periods for a unit.
- [ ] Change tenant with a later effective date.
- [ ] Verify prior tenant row remains and gets an end date.
- [ ] Confirm non-admin cannot call `hs1_set_occupancy`.

## Invitation / claiming
- [ ] Admin prepares resident invitation and copies society invitation link.
- [ ] Wrong signed-in email is rejected.
- [ ] Correct email joins society and claims exactly the intended resident entity.
- [ ] Reuse/expired/revoked invitation is rejected.
- [ ] Claimed resident sees My Flat.

## Vehicles / parking
- [ ] Claimed resident adds a vehicle to current flat.
- [ ] Resident cannot add vehicle to unrelated flat.
- [ ] Admin adds parking slot and allocation.
- [ ] Reallocation preserves prior allocation history.

## Privacy / regression
- [ ] Ordinary member cannot see invitation token list.
- [ ] Ordinary member cannot rewrite ownership/tenancy.
- [ ] Family Association pilot still loads.
- [ ] Family vertical still loads.
- [ ] Housing advanced platform/federation surfaces remain hidden.
