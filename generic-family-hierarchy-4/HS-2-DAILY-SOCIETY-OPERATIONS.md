# HS-2 — Daily Society Operations

## Status
**SOURCE IMPLEMENTED / RUNTIME VERIFY**

## Mission goal
Turn the Housing Society graph into weekly/daily resident and committee utility without pulling HS-3 billing forward.

## Delivered
- fixed HS-0 unknown `housing-society.shared.intelligence` runtime crash by making optional unknown feature probes fail closed;
- fixed intelligence vertical exhaustiveness so `housing-society` is represented in `IntelligenceVerticalKind`, copy and engine maps;
- persistent society notices: general / urgent / targeted, pinned and expiring;
- resident complaint/service desk with category, priority, current-flat association, optional photo/evidence URL, comments and status history;
- committee complaint controls: assignment to vendor, SLA due time, resolution/reopen/close lifecycle and audit events;
- vendor directory plus contract / AMC records;
- amenity catalog plus resident booking requests, committee approval/rejection and overlap protection;
- resident navigation surfaces for Notices, Complaints and Amenities;
- committee HS-2 dashboard inside Manage Society;
- Coming Up aggregation of active notices + upcoming shared events;
- existing shared event/RSVP/memory/comment/like/timeline engine remains authoritative for community life;
- read-only Housing Society playground examples for HS-2 surfaces;
- Launch Control feature rows for all HS-2 capabilities.

## Data model
Migration `084_hs2_daily_society_operations.sql` adds `hs_notices`, `hs_complaints`, `hs_complaint_comments`, `hs_vendors`, `hs_vendor_contracts`, `hs_amenities`, and `hs_amenity_bookings`. Tables are society-scoped, RLS-enabled, and reached through permission-aware HS-2 RPCs.

## Authorization boundaries
- notices: committee/admin creates; members read active notices;
- complaints: member creates and sees their own; committee/admin sees and manages all;
- complaint comments: complainant + committee/admin;
- vendor contacts/contracts: admin-managed; vendor contact detail is withheld from ordinary snapshot consumers;
- amenities: members can browse/request; admin manages catalog and approves/rejects;
- event creation continues to use shared activity authorization;
- billing/payment/accounting remains outside HS-2.

## Reuse decisions
Events, RSVP, memories, likes, comments and community timeline were not reimplemented. HS-2 composes the existing mature Network Activity engine and adds only housing-specific operational primitives.

## Validation
- `npm run validate:hs2`: 26 HS-2 source checks;
- chained HS-1: 27 checks;
- chained HS-0: 24 checks;
- chained FCA-0: 27 checks;
- all 10 changed/new TypeScript/TSX files pass TypeScript syntax/transpile validation;
- project-wide `tsc --noEmit` cannot be certified from this ZIP because React/Next/Supabase/Node dependencies are absent. The previously reported `NetworkIntelligenceCenter.tsx` index error no longer appears in the filtered type-check output.

## Runtime verification still required
Apply migration 084 after 083 on staging, rerun it once, and execute `HS-2-RUNTIME-VERIFICATION-CHECKLIST.md`.

## Explicitly not included
Maintenance bills, dues, arrears, receipts and society finance remain HS-3. Governance/meeting records remain HS-4. Visitor/security/compliance/assets remain HS-5.

## Next mission
**HS-3 — Maintenance, Dues & Finance**, after HS-2 runtime smoke verifies one real notice, one complaint closure, one vendor/AMC and one amenity booking flow.
