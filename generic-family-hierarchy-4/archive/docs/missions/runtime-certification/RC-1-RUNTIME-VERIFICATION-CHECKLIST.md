# RC-1 Runtime Verification Checklist

## A. Build
- [ ] Clean install completes.
- [ ] `npm run validate:rc1-source` passes.
- [ ] `npm run audit:i18n` passes.
- [ ] `npm run check:types` passes.
- [ ] `npm run build` passes.

## B. Launch Control
For each federation capability: federation_distribution, network_passport, network_affiliation, umbrella_runtime, federated_directory, application_scopes, trusted_request_routing, governed_introductions, outcome_trust_receipt:
- [ ] TEST by default.
- [ ] Independently enable/disable for the selected Network Type.
- [ ] Disabled tool is absent from the guided tool rail.
- [ ] Disabled advanced component is not mounted through ordinary UI flow.
- [ ] Server authorization still rejects unauthorized operations.

## C. Mentoring E2E
- [ ] User A active in Network A.
- [ ] User B active in Network B.
- [ ] Network A and Network B have Federation/Public Passports.
- [ ] Both networks are approved under Umbrella U.
- [ ] Umbrella Runtime shows network-level information only.
- [ ] Network A discovers Network B through U.
- [ ] User B explicitly opts into Mentoring with selective outward fields.
- [ ] User A creates a Mentoring request and User B becomes an eligible route.
- [ ] Route reveals no private contact information.
- [ ] User A requests introduction.
- [ ] Pending introduction hides requester response channel from User B.
- [ ] User B accepts; only deliberately supplied response channel unlocks.
- [ ] Trust Receipt renders the accepted institutional route.
- [ ] Both participants can independently record outcome evidence.

## D. Negative/privacy
- [ ] Private Passport blocks new affiliation.
- [ ] Ordinary member cannot edit governed Passport/affiliation.
- [ ] Suspended/revoked affiliation removes downstream eligibility.
- [ ] Directory OFF removes NF-4 discovery.
- [ ] Network purpose declaration alone exposes no person.
- [ ] NF-5 withdrawal removes participant from new routes.
- [ ] NF-6 route reveals no private contact.
- [ ] NF-7 pending introduction reveals no requester contact.
- [ ] Consent/Passport/affiliation invalidation before acceptance causes acceptance to fail.
- [ ] NF-8 outcome stays contextual/private and never becomes a public score.

## E. NX UX
- [ ] Top-level choices read as interactive and understandable.
- [ ] Active journey/tool is visually obvious.
- [ ] Only one focused advanced tool renders at a time.
- [ ] Page avoids excessive scrolling.
- [ ] Contextual help is useful without permanent FAQ clutter.
- [ ] Help modal is readable in Light, Dark and Aurora.
- [ ] Desktop/tablet/mobile remain usable.
- [ ] Manage & Launch is limited to appropriate admin context.
- [ ] Empty/loading/error states are understandable.

## F. Regression
- [ ] Family + Tree + Directory + profiles.
- [ ] Alumni.
- [ ] Organization.
- [ ] Business Trust.
- [ ] Franchise.
- [ ] Professional.
- [ ] participation/identity.
- [ ] M6 peer bridges remain semantically separate from NF affiliations.
- [ ] M7 pilot/showcase.
- [ ] Launch Control.
- [ ] themes.
- [ ] i18n.
