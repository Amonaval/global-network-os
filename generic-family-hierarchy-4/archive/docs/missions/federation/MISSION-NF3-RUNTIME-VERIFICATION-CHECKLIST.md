# NF-3 Runtime Verification Checklist

> Integrated verification is intentionally deferred until the founder applies the federation mission ZIPs sequentially. Keep this checklist with the release so NF-3 can be tested independently after NF-1 and NF-2 are verified.

## Source validation completed here
- [x] NF-3 dedicated source architecture gate passes.
- [x] i18n visible-literal audit command completes with no reported candidates.
- [x] NF-3 migration does not reference known child-network member/profile/relationship tables.
- [x] NF-3 UI is dynamically imported from My Networks.
- [x] NF-3 has an independent TEST-by-default Launch Control key.
- [ ] Full `tsc --noEmit` in this extracted workspace: blocked by missing third-party type definitions (`react`, `node`, `leaflet`, D3 types, etc.), not an NF-3-specific diagnostic.

## Prerequisite migration/order
- [ ] Apply/verify NF-1 migration `070_nf1_network_passport.sql`.
- [ ] Apply/verify NF-2 migration `071_nf2_governed_network_umbrella_affiliation.sql`.
- [ ] Apply migration `072_nf3_umbrella_network_runtime.sql`.
- [ ] Confirm `*.advanced.umbrella_runtime` appears in Launch Control as TEST.

## Happy-path runtime
1. [ ] Create Umbrella U as an authorized umbrella owner/admin.
2. [ ] Approve at least two NF-2 affiliations from different network types.
3. [ ] Ensure those networks expose `federation` or `public` Passports.
4. [ ] Enable NF-3 for the testing vertical/cohort.
5. [ ] Open My Networks and confirm Umbrella Runtime loads only for an authorized umbrella administrator.
6. [ ] Confirm approved/pending/suspended metrics match affiliation state.
7. [ ] Confirm vertical count reflects approved network participants.
8. [ ] Confirm capability and declared-scope chips derive from permitted Passports.
9. [ ] Search/filter participating networks and verify results.
10. [ ] Confirm no person/member rows are shown anywhere in NF-3.

## Dynamic Passport privacy test
- [ ] With an approved affiliation active, change one source Network Passport from `federation/public` to `private`.
- [ ] Refresh NF-3.
- [ ] Confirm the network remains an approved institutional participant.
- [ ] Confirm its tagline, summary, geography, external link, capabilities and scopes are withheld.
- [ ] Restore Passport to `federation`; confirm outward fields return.

## Authorization/privacy negative tests
- [ ] Non-admin of Umbrella U cannot call either NF-3 RPC.
- [ ] A different umbrella admin cannot request U's runtime by ID.
- [ ] Requested/declined/revoked affiliations do not appear as participating-network directory entries.
- [ ] Suspended affiliations do not appear as active directory entries.
- [ ] No NF-3 action creates `network_memberships` or `network_trust_bridges`.
- [ ] Inspect SQL/query logs if desired: no child member/profile/contact/relationship source is queried by NF-3 RPCs.

## Lean runtime/regression
- [ ] With `umbrella_runtime` disabled, its client chunk is not loaded by the basic My Networks path.
- [ ] Enabling the capability loads NF-3 when rendered.
- [ ] Family/Alumni/Organization/Business Trust/Franchise/Professional basic network opening remains unaffected.
- [ ] M6 peer bridges/discovery remain unaffected.
- [ ] NF-1 public Passport remains unaffected.
- [ ] NF-2 request/review/suspend/revoke lifecycle remains unaffected.
