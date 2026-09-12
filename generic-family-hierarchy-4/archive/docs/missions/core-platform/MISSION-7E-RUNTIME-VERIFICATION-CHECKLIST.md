# M7-E Runtime Verification Checklist

- [ ] Apply migration 066.
- [ ] `npm run validate:m7e` passes.
- [ ] `npm run check:types` passes in the complete dependency workspace.
- [ ] `npm run build` passes.
- [ ] My Networks shows Showcase Runtime Health.
- [ ] Certification counts match the signed-in account approximately.
- [ ] Discovery with no enabled bridge explains the bridge prerequisite.
- [ ] Matching but unclaimed Family/Alumni/generic profile explains claim eligibility instead of generic 0 results.
- [ ] Claimed second-user target returns an anonymous opportunity.
- [ ] Target identity remains hidden before consent.
- [ ] Accepted introduction reveals only the consented identity.
- [ ] Two-hop route works only when pathTraversal is enabled on every edge.
- [ ] M7-B synthetic theater remains read-only and all 7 scenarios can be stepped through.
