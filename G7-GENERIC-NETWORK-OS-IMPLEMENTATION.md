# G7 — Generic Network OS Productization & Template Architecture

**Status:** IMPLEMENTED IN SOURCE / SOURCE CERTIFIED / DEPLOYED SMOKE REQUIRED
**Baseline:** Certified G6
**Migration:** `047_g7_generic_network_os.sql` after 046

## What G7 changes

G7 converts the Family + Alumni architecture proof into an executable Network OS foundation.

### 1. Generic affiliation model

New generic persistence:
- `network_entities`
- `network_dimensions`
- `network_dimension_values`
- `network_entity_affiliations`
- `network_projections`

The generic layer is additive. Family kinship and Alumni profiles remain authoritative vertical stores.

Alumni currently synchronizes profile identity into the generic affiliation layer through a database trigger. A profile can simultaneously belong to:
- Institution
- Program / School (`department` in the existing Alumni profile store)
- Batch / Graduation year
- Stream / Course (`program` in the existing Alumni profile store)
- City
- Company

### 2. Configurable hierarchy projections

The same underlying Alumni affiliations support multiple navigations:

```text
MET → Engineering → 2011 → Computer Engineering
MET → 2011 → Engineering → Computer Engineering
Pune → MET → 2011
Company → MET → 2011
```

No duplicate people dataset is created for a different hierarchy order.

Reusable runtime:
- `core/network-os/contracts.ts`
- `capabilities/affiliation/runtime.ts`
- `capabilities/affiliation/remote.ts`
- `components/shared/NetworkProjectionExplorer.tsx`

### 3. Shared network-life capability

G7 introduces a generic activity/group foundation:
- `network_activities`
- `network_activity_rsvps`
- `network_groups`
- `network_group_memberships`

Activities support:
- events
- memories
- milestones
- announcements

Members can contribute memories/milestones. Admins create events/announcements. Event RSVP is member-scoped. Groups can be joined/left by members and created by admins.

Reusable UI/runtime:
- `capabilities/activity/runtime.ts`
- `capabilities/activity/remote.ts`
- `components/shared/NetworkActivityHub.tsx`

Alumni surfaces this as **Community** with Alumni language such as reunions, memories and chapters.

### 4. Alumni product reuse proof

Alumni navigation now includes:
- Home
- Explore
- Directory
- Community
- Places
- Connections
- Guide
- Admin

`Explore` demonstrates projection-based hierarchy.
`Community` demonstrates shared events/RSVP/memories/milestones/groups.
`Places` demonstrates a generic location dimension.
Directory/claiming/connections/import continue using Alumni-specific identity and persistence.

### 5. First-class template architecture

New template contracts:
- `core/templates/contracts.ts`
- `core/templates/runtime.ts`
- `app-shell/template-registry.ts`

Active templates:
- Family
- Alumni

Architecture/future templates:
- Organizational Intelligence
- Business Trust Network
- Franchise Network
- Education Graph
- Professional / Industry Network
- Association / Member Organization
- Residential / Society Network
- Supply Chain / Partner Ecosystem
- Investor / Startup Ecosystem
- Customer / Account Intelligence
- Custom Network

These templates define dimensions, relationships, projections and capability selection. They are not active products and cannot silently inherit Family/Alumni runtime behavior.

### 6. Security model

G7 preserves the G5/G6 security philosophy:
- generic tables have RLS enabled;
- direct `anon`/`authenticated` table access is revoked;
- application access uses audited RPCs;
- internal SECURITY DEFINER sync helpers are revoked from PUBLIC;
- composite `(id, network_id)` foreign keys prevent cross-tenant entity/dimension/activity linkage;
- read RPCs require active-network membership;
- write RPCs enforce member/admin policy;
- Family foundations remain hash-protected by the G7 gate.

## What G7 intentionally does not do

- It does not replace Family tables with universal entity storage.
- It does not replace Alumni profile persistence.
- It does not make Family kinship an affiliation tree.
- It does not make Organization/Trust/Franchise/Education live production products.
- It does not introduce a universal React renderer.
- It does not implement speculative AI/trust/performance scoring in Core.

## G7 acceptance proof

The automated G7 gate executes the real affiliation runtime against one MET dataset and proves both:

```text
MET → Engineering → 2011 → Computer
MET → 2011 → Engineering → Computer
```

with the same entity count and no data duplication.
