# NF-6 Runtime Verification Checklist

> Run after applying federation migrations sequentially through `075_nf6_trusted_request_routing.sql`. Per founder decision, integrated validation is intentionally deferred until the federation batch is applied one mission at a time.

## Migration / Launch Control
- [ ] Apply migration `075` after `074`.
- [ ] Confirm `*.advanced.trusted_request_routing` exists for all six verticals.
- [ ] Confirm default rollout is TEST and playground default remains disabled.
- [ ] Confirm basic My Networks still loads when NF-6 is disabled.

## Request eligibility
- [ ] User with an active membership + approved affiliation + Federation/Public Passport purpose sees eligible request contexts.
- [ ] Private Passport blocks context/request creation.
- [ ] Missing/removed purpose declaration blocks request creation.
- [ ] Non-member cannot create a request for that network.

## Request lifecycle
- [ ] Create a request with title/context/location/tags.
- [ ] Request persists after refresh.
- [ ] Close works and prevents route refresh.
- [ ] Cancel works and leaves memberships/affiliations unchanged.

## Route generation
- [ ] Seed at least two active NF-5 opt-ins for the same umbrella/purpose.
- [ ] Refresh produces eligible candidates only.
- [ ] Requester's own purpose profile is excluded.
- [ ] Scores/reasons are deterministic for the same current data.
- [ ] Tag/location/profile freshness reasons render correctly.
- [ ] Shortlist/dismiss persists.

## Dynamic privacy recheck
- [ ] Withdraw target NF-5 opt-in → target disappears from displayed routes.
- [ ] Make target Passport Private → target disappears.
- [ ] Remove target purpose from Passport → target disappears.
- [ ] Suspend/revoke target affiliation → target disappears.
- [ ] Deactivate umbrella → routes no longer display.

## Privacy / consent
- [ ] Inspect RPC payload: no email, phone or private vertical profile fields.
- [ ] Creating/shortlisting route does not notify target.
- [ ] No introduction/contact action exists in NF-6.
- [ ] Trust Receipt clearly says reachability is not endorsement.

## UI quality
- [ ] Desktop layout.
- [ ] Mobile layout.
- [ ] Light/dark theme.
- [ ] Long request title/summary/tags do not overflow.
- [ ] Empty/no-route/error states are understandable.

## Regression
- [ ] NF-4 network directory unchanged.
- [ ] NF-5 purpose opt-in/search unchanged.
- [ ] M6 bridge/discovery behavior unchanged.
- [ ] Existing Family/Alumni/Organization/Business/Franchise/Professional runtime remains unaffected.
- [ ] Full build + `npm run check:types` in normal dependency-complete workspace.
