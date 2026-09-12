# HS-2 Runtime Verification Checklist

## Database / rerun safety
- [ ] Apply migrations through `084_hs2_daily_society_operations.sql` on staging.
- [ ] Rerun 084 and confirm no table/index/policy/function conflict.
- [ ] Confirm HS-1, HS-0 and FCA source/runtime smoke remain healthy.

## Regression fixes
- [ ] Open Housing Society Home with `shared.intelligence` absent; no `Unknown feature key` runtime error.
- [ ] Run project type-check with dependencies installed; confirm no `NetworkIntelligenceCenter.tsx` `IntelligenceVerticalKind` indexing error.

## Notices
- [ ] Admin publishes general + urgent notice.
- [ ] Member sees active notice; expired notice drops from resident snapshot.
- [ ] Non-admin cannot publish through `hs2_create_notice`.

## Complaint desk
- [ ] Claimed resident creates complaint; current flat is inferred when unit is omitted.
- [ ] Optional photo/evidence URL is retained in attachments.
- [ ] Resident sees only their complaint; admin sees all.
- [ ] Resident and admin can comment.
- [ ] Admin assigns vendor + SLA and moves open → in progress → resolved.
- [ ] Reopen and close preserve the complaint record/history/audit trail.

## Vendors / contracts
- [ ] Admin creates vendor and AMC/contract.
- [ ] Non-admin cannot create/update vendor/contract.

## Amenities
- [ ] Admin creates an amenity.
- [ ] Resident requests booking; current flat is inferred.
- [ ] Overlapping pending/approved booking is rejected.
- [ ] Admin approves/rejects booking.

## Shared community reuse
- [ ] Admin creates event from HS-2 panel.
- [ ] Existing Community screen supports RSVP.
- [ ] Memory, like/comment and timeline functionality still work.
- [ ] Coming Up shows active notice + future event.

## Pilot gate
- [ ] Run one week of real/sanitized society operations with at least 20 units: 2 notices, 3 complaints, 1 vendor/AMC, 1 amenity booking and 1 event.
