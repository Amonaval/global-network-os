# NF-5 Runtime Verification Checklist

**Current status:** Source validation complete; integrated runtime verification intentionally deferred.

When applying federation changes sequentially later:

1. Apply migration `074_nf5_community_application_scope_framework.sql` after NF-1 through NF-4 migrations.
2. Confirm `*.advanced.application_scopes` is TEST by default and does not appear for normal released users.
3. As a user with an active Network membership, confirm no eligible purpose context appears unless:
   - Network↔Umbrella affiliation is approved;
   - umbrella is active;
   - Network Passport is Federation/Public;
   - Network Passport declares the exact purpose.
4. Publish a scoped profile and verify only the selected outward fields are visible.
5. Confirm no email, phone, private member record, relationship or graph information is returned.
6. From another network under the same approved umbrella, search the exact purpose and verify the opted-in profile appears.
7. Verify the Trust Receipt identifies requester source network → umbrella → participant source network.
8. Search another purpose and confirm the person does not appear unless separately opted in.
9. Withdraw the profile and confirm it disappears from subsequent discovery immediately.
10. Change the source Passport to Private or remove the purpose declaration and confirm the scoped profile becomes ineligible for discovery without deleting the stored opt-in record.
11. Suspend/revoke the source Network↔Umbrella affiliation and confirm discovery is blocked.
12. Verify My Networks dynamically loads the NF-5 component only when Launch Control renders it.
13. Re-run:
    - `node scripts/nf5-application-scope-gate.mjs`
    - `npm run audit:i18n`
    - `npm run check:types` after a clean dependency install.

## Source checks completed 2026-08-29
- NF-5 purpose-scope architecture gate: PASS.
- Isolated TypeScript syntax transpilation for changed NF-5 TS/TSX: PASS.
- i18n audit command: PASS (0 reported candidates by current audit tooling).
- Full `tsc --noEmit`: BLOCKED by missing installed type definitions already affecting the extracted workspace (`react`, `node`, D3, Leaflet, etc.); not treated as an NF-5 source failure.
