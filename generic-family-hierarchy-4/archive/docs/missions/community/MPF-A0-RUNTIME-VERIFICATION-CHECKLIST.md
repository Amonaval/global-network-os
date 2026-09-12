# MPF-A0 Runtime Verification Checklist

## Database + creation
- [ ] Apply `078_mpfa0_community_association_vertical.sql` in staging.
- [ ] Create `Community / Association` from Create Network.
- [ ] Use a generic name first, then verify `MPF East` works as configuration only.
- [ ] Verify owner membership and active-network switch after creation.

## Household membership
- [ ] Add 5–10 Family / Household entities.
- [ ] Add representative people and `represented_by` relationships.
- [ ] Add spouse/children/person records where required.
- [ ] Verify ordinary members cannot perform owner/admin-only changes.

## Annual membership
- [ ] Set Membership Year (for example 2026-27).
- [ ] Set Active / Renewal Due status.
- [ ] Verify Renewal projection groups households correctly.
- [ ] Confirm renewal does not change unrelated privacy visibility.

## Community life
- [ ] Create an event and verify Going / Maybe / Can't Go RSVP.
- [ ] Verify RSVP counts update.
- [ ] Publish an announcement/update.
- [ ] Add a memory and verify media/photo behavior under configured limits.
- [ ] Create committee/circle groups and join/leave where permitted.

## UX
- [ ] Association appears in Create Network and Playground.
- [ ] Home, Explore, Directory, Community, Places, Connections, Contribute work.
- [ ] Mobile navigation is understandable for a non-technical family representative.
- [ ] Verify Light, Dark and Aurora theme readability.
- [ ] Hide generic multi-network/Federation concepts for the MPF pilot profile.

## Governance safety
- [ ] Use Pulse/polls only for non-binding community questions.
- [ ] Do **not** run official President/committee elections until election-grade voting is implemented and certified.

## Pilot gate
- [ ] Founder can create MPF East and onboard first 5–10 families by link without explaining platform architecture.
- [ ] A family representative can understand registration, events and community participation without training.
