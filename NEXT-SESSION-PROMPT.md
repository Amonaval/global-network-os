# NEXT SESSION — G7 Generic Platform Productization

Use the latest **G6 certified affected-files release** on top of the accepted G5 R2/full baseline. Read these first:

1. `G0-TRUSTED-NETWORK-ARCHITECTURE-BLUEPRINT.md`
2. `G6-TWO-VERTICAL-PROOF-SHARED-UX-HARDENING.md`
3. `G6-RELEASE-MANIFEST.md`
4. `ROADMAP.md`
5. `MISSION-STATUS.md`
6. `CODEBASE.md`
7. `DEVELOPMENT-RULES.md`
8. `VALIDATION.md`

## Authoritative next mission

**G7 — Generic Platform Productization**

Treat G7 as one consolidated High-effort batch, not micro-missions.

### Goal

Turn the architecture proven by Family + Alumni into a productizable platform layer without reducing either vertical to a generic lowest-common-denominator UX.

### Scope

- vertical-aware network creation/selection contract rather than ad-hoc Family/Alumni onboarding branches;
- reusable capability-pack registration and runtime eligibility;
- reusable admin shell patterns where Family + Alumni prove common behavior;
- reusable import/claim/invite composition contracts where proven;
- platform-level network/vertical metadata and operational visibility;
- clear extension contract for a future third vertical;
- dependency guards preventing Core/shared code from importing vertical implementations;
- preserve Family + Alumni routes/data/RPC behavior unless a migration is explicitly additive and justified;
- keep Launch Control vertical-scoped;
- keep G5/G6 vertical dispatch invariant strict;
- retain G6 shared UX rule: shared quality system, vertical-specific experience.

### Do not

- create a third vertical merely to prove an interface;
- rename Family/Alumni database tables for cosmetic genericity;
- force Family and Alumni page models into one universal renderer;
- weaken unknown-feature, RLS, tenant-isolation or compatibility gates;
- split G7 into tiny G7.1/G7.2 missions unless a genuine blocking risk requires it.

### Delivery

After implementation:
- run every historical automated source gate plus a new G7 gate;
- preserve accepted files and historical remote facade exports;
- update architecture/roadmap/status/handoff docs;
- update User/Admin Guide only for actual user/admin-visible changes;
- create a G7 release architecture note, manifest and very short runtime checklist;
- deliver affected files only, preserving folder hierarchy.
