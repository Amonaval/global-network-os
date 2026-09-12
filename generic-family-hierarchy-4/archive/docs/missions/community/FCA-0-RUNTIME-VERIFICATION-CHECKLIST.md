# FCA-0 Runtime Verification Checklist

## Apply
- [ ] Apply affected files preserving repository hierarchy.
- [ ] Apply `supabase/migrations/080_fca0_family_community_association.sql` after 079.
- [ ] `npm ci`
- [ ] `npm run validate:fca0`
- [ ] `npm run check:types` (or project TypeScript command)
- [ ] `npm run build`

## Creation / isolation
- [ ] Existing generic Community / Association still creates and behaves exactly as before.
- [ ] Create a new **Family Community / Cultural Association** network.
- [ ] Verify no Alumni/Organization/Franchise terminology leaks into the member experience.
- [ ] Verify Intelligence and generic advanced surfaces are absent from normal Family Community navigation/home.
- [ ] Verify Light/Dark/Aurora theme readability and responsive layout.

## Family + people
- [ ] Add Family.
- [ ] Add Representative and link to Family.
- [ ] Add Spouse and Child and verify they appear independently in Members.
- [ ] Add spouse/parent relationships without `Source entity kind is not allowed` errors.
- [ ] Verify Representatives view contains the representative and Families/Members views are distinct.
- [ ] Verify Area=Kharadi/Hadapsar etc. while City=Pune.
- [ ] Verify Area and Profession filters.
- [ ] Add photo URL and verify thumbnail.
- [ ] Claim/edit own profile; confirm official membership status/year/committee fields are not self-editable.
- [ ] Delegate Family co-admin; verify scoped profile maintenance without network-admin privilege.

## Annual membership / history
- [ ] Admin opens Manage Community.
- [ ] Configure dependent age 22, grace period, onboarding policy and finance visibility.
- [ ] Create April–March membership year and set family fee.
- [ ] Mark a Family Active/Paid with representative.
- [ ] Change payment/renewal status and verify historical row remains year-scoped.
- [ ] Create a second year; verify prior year data remains intact.
- [ ] Assign President / President Elect / Director roles via controlled dropdown and confirm role history.
- [ ] Add finance entries including opening balance, membership collection, expense/good cause and carry-forward.

## Community life
- [ ] Coming Up shows upcoming birthdays and events.
- [ ] Community history/year content renders.
- [ ] Create event/memory/update.
- [ ] Like and comment; counts update after reload.
- [ ] Share action copies/shares content using browser capability.
- [ ] Existing RSVP still works.

## Network lifecycle
- [ ] Ordinary member can Leave network and is switched/unlinked safely.
- [ ] Sole Owner cannot Leave an ownerless network.
- [ ] Owner can Archive & unlink only after exact network-name confirmation; data remains in DB and memberships lose active access.
- [ ] In a disposable test network, Owner can Permanently Delete; network-owned data cascades.
- [ ] Confirm shared auth/profile identity and another network remain intact after deletion.

## Regression
- [ ] Family
- [ ] Alumni
- [ ] Generic Association
- [ ] Organization
- [ ] Business Trust
- [ ] Franchise
- [ ] Professional
- [ ] My Networks / switching
- [ ] Launch Control
- [ ] existing productized projection seeding
