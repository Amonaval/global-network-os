# QA Phase 4D — Vertical-Specific Workflow & Business-Rule Certification

## Mission

Phase 4D certifies that the nine released TrustWeave verticals do not merely render the shared shell: each one preserves its own operating model, domain vocabulary, relationship constraints and role-scoped surfaces.

This phase is intentionally independent from the unresolved Phase-3 Storage/RLS blocker. It introduces no Supabase migrations, Storage mutations, destructive lifecycle execution, service-role access, QA seed or cleanup.

## Vertical contracts

### Family
- Tree/kinship remains the primary distinct workflow.
- Self-links, duplicate relationships, generation inversion and parent/child cycles are rejected.
- Productized explorer semantics must not replace the Family tree model.

### Housing Society
- `unit` / flat is the operating object.
- Ownership, co-ownership, occupancy, tenancy, household membership and residency remain distinct.
- Directory exposes society-specific resident/unit filters.
- Official property operations live only in the governed society admin surface.
- Residency must never be treated as proof of ownership.

### Family Association
- `family` is the annual paid membership unit.
- Representative, spouse, children and other members remain first-class people.
- Family / Representative / Member directory modes stay distinct.
- Annual membership, leadership and finance operations remain governed admin concerns.

### Association
- Generic Association remains `household`-centric.
- It must not silently inherit Family Association-specific family membership controls.
- Formal election-grade voting remains a separately governed extension.

### Alumni
- Institutional/cohort semantics remain primary.
- Batch and program filters are visible in the directory.
- Alumni must not inherit Family generation/tree semantics.

### Organization
- Relationship vocabulary: Reports to, Works with, Owns, Depends on.

### Business Trust
- Relationship vocabulary: Recommends, Verified by, Supplies to, Worked with.
- Trust relationship language retains provenance orientation.

### Franchise
- Relationship vocabulary: Owns, Operates, Manages, Supports.
- Geography, location/branch and operator/owner dimensions stay independent.

### Professional
- Relationship vocabulary: Worked with, Referred by, Collaborates with, Mentors.
- Mentoring remains person-to-person.
- Healthcare patient data and regulated clinical workflows remain outside the released scope.

## Execution profile

Phase 4D uses headed Chromium with one worker and the existing deterministic seed. The browser suite performs only authenticated reads plus active-network context switching between already-seeded networks. It does not create/delete domain data.

Commands:

```bash
npm run qa:phase4d:local
npm run qa:phase4d:browser
npm run qa:certify:phase4d
```

Expected final status:

```text
Phase-4D report: PHASE4D_CERTIFIED
TrustWeave Phase-4D vertical business-rule certification: PHASE4D_CERTIFIED
```

## Explicitly deferred

- Phase-3 Storage/RLS blocker and staging-drift reconciliation.
- Strict RPC privilege remediation.
- Fresh migration replay and production upgrade-path certification.
- Disposable-environment destructive lifecycle certification.
- Load/stress and broad cross-browser matrices.
- Unreleased domain extensions such as election-grade secret ballots, payment/accounting systems and regulated clinical workflows.
