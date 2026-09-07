# MPF-A1 Runtime Verification Checklist

## Build
- [ ] Apply migration `079_mpfa1_family_grade_association.sql`.
- [ ] `npm ci`
- [ ] `npm run check:types`
- [ ] `npm run build`
- [ ] `npm run validate:mpfa1`

## Association experience
- [ ] Create/open a Community / Association network.
- [ ] Verify dedicated Association Home appears.
- [ ] Verify theme in Light, Dark and Aurora.
- [ ] Verify desktop, tablet and mobile layout.
- [ ] Verify Families & Members, Family Structure, Community Life, Relationships, Update Network and Explore & Guide labels.
- [ ] Verify Me & My Family is visible for members.

## Family-grade profiles
- [ ] Open a person and verify relationship, age, DOB, phone, email, profession and city.
- [ ] Edit own profile and save.
- [ ] Verify spouse/parent/household relationships in structure/relationship views.
- [ ] Verify household privacy remains network-scoped.

## Home / community life
- [ ] Verify upcoming birthdays render from DOB.
- [ ] Verify upcoming events and RSVP counts render.
- [ ] Verify memories/milestones contribute to history/timeline.
- [ ] Verify photos/media continue through shared Community capability.

## Family co-admin
- [ ] Representative sees Family co-admin controls.
- [ ] Representative can grant a claimed spouse/family member as co-admin.
- [ ] Co-admin can edit existing profiles in that household.
- [ ] Co-admin cannot edit another household.
- [ ] Co-admin is not promoted to network admin.
- [ ] Revoking co-admin immediately removes scoped maintenance access.

## Regression
- [ ] Existing Organization, Franchise, Business Trust and Professional verticals unchanged.
- [ ] Family vertical unchanged.
- [ ] MPF-A0 source gate passes.
- [ ] Federation/advanced features remain controlled independently.
