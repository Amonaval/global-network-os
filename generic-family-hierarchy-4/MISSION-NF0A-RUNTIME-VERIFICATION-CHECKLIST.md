# NF-0A — Runtime Verification Checklist

## Source / architecture
- [x] Federation contracts are separate from M6 trusted-bridge contracts.
- [x] Constitutional privacy invariants are encoded in code.
- [x] Distribution score is aggregate-only and deterministic.
- [x] Feature defaults to TEST through Launch Control.
- [x] Source gate passes.

## Runtime after migration 069
- [ ] Apply migration `069_nf0_federation_distribution_supernode.sql`.
- [ ] Sign in as Platform Owner.
- [ ] Open My Networks and confirm **Federation Distribution Lab** appears for a TEST-enabled active vertical.
- [ ] Confirm ordinary non-platform Alpha users cannot see the TEST feature.
- [ ] Confirm Launch Control contains the **Federation growth** bundle and `Federation distribution supernode` feature.
- [ ] Confirm cards show only synthetic aggregate scenarios; no real member/profile data is displayed.
- [ ] Verify mobile layout collapses to one column cleanly.

## Regression
- [ ] My Networks existing M6/M7 surfaces still render according to their own rollout flags.
- [ ] Existing Network Bridge Manager behavior remains unchanged.
- [ ] No database schema for real umbrella affiliation is created by this mission.
- [ ] Existing family/alumni/organization/business/franchise/professional flows remain unchanged when the new feature is hidden.

## Validation note
The mission-specific source gate passes. Full TypeScript/build validation in the extracted workspace was blocked by an incomplete dependency installation in the execution environment; rerun `npm ci` followed by `npm run validate:nf0a` in the normal project environment.
