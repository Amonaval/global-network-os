# NF-2 Runtime Verification Checklist

## Source validation completed here
- [x] NF-2 dedicated source gate passes.
- [x] i18n visible-literal audit: 0 candidates.
- [x] New/modified NF-2 TS/TSX files pass isolated TypeScript syntax transpilation.
- [x] M6 peer bridge table is not reused by migration 071.
- [x] Migration 071 has no Family/Alumni/Organization person-table dependency.
- [x] Advanced My Networks components are dynamically imported.
- [ ] Full `tsc --noEmit` in this extracted workspace: blocked by missing installed third-party type definitions (`react`, `node`, `leaflet`, D3 types, etc.), not an NF-2 source diagnostic.

## Database migration smoke
- [ ] Apply migration `070_nf1_network_passport.sql` if not already applied.
- [ ] Apply migration `071_nf2_governed_network_umbrella_affiliation.sql`.
- [ ] Confirm `*.advanced.network_affiliation` appears as TEST in Launch Control.
- [ ] Confirm direct table access remains unavailable to normal clients.

## Happy-path scenario
1. [ ] Network A Owner/Admin has a Network Passport set to `federation` or `public`.
2. [ ] Create Umbrella U; creator becomes Umbrella Owner.
3. [ ] From another Network B admin context, search U by name/slug.
4. [ ] Request `member` or `chapter` affiliation.
5. [ ] As Umbrella U Owner/Admin, see the incoming request with Network B Passport summary only.
6. [ ] Approve the request.
7. [ ] Confirm both authorized sides see status `approved`.
8. [ ] Suspend as Umbrella Admin; verify status `suspended`.
9. [ ] Re-request or create another approved affiliation and revoke it; verify status `revoked`.

## Privacy/authorization negative tests
- [ ] Set Passport to `private`; affiliation request must fail.
- [ ] Non-admin of a network cannot request its affiliation.
- [ ] Non-admin of an umbrella cannot approve/decline/suspend its requests.
- [ ] Approval does not create `network_memberships` for umbrella participants.
- [ ] Approval does not expose member names, contacts, relationships or source graph rows.
- [ ] No NF-2 action creates/updates `network_trust_bridges`.

## Lean runtime check
- [ ] With advanced features disabled, inspect browser network/chunks: advanced M6/M7/NF modules should not load merely by visiting basic My Networks.
- [ ] Enable `network_affiliation`; its chunk should load when the capability is rendered.
- [ ] Confirm server/RLS still denies unauthorized RPCs regardless of client bundle state.

## Regression
- [ ] Family basic flow unaffected.
- [ ] Alumni/Organization/Business Trust/Franchise/Professional network opening unaffected.
- [ ] M6 peer bridges/discovery unaffected.
- [ ] NF-1 public Passport route unaffected.
- [ ] Launch Control continues to fail closed.
