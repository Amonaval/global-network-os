# HS-0 — Housing Society Vertical Foundation & Reuse Audit

## Status
**SOURCE IMPLEMENTED / RUNTIME VERIFY**

## Product outcome
TrustWeave now has a first-class `housing-society` vertical for cooperative housing societies, apartment associations, RWAs and residential communities. HS-0 deliberately stops at the safe foundation: property/resident graph, familiar terminology, synthetic playground, Launch Control and database contracts. It does **not** falsely claim that complaints, maintenance billing, amenities, governance, security or compliance workflows are already implemented.

## Reuse audit
### Reused directly
- productized vertical registry/runtime composition
- generic network entity + affiliation + typed relationship engine
- hierarchy dimensions and projections
- directory/search and relationship explorer
- shared groups/events/RSVP/memories/milestones/community activity
- network membership and tenant-scoped runtime
- Launch Control, Playground and What's New composition
- governed entity/relationship persistence
- guide registry architecture
- shared theme/app-shell infrastructure

### Reuse with society adaptation
- Person/profile: person remains first-class, but resident/owner/tenant semantics are explicit relationships rather than profile inference.
- Household: shared household entity is reused, attached to a Unit/Flat.
- Hierarchy: generic projection engine models Building/Tower → Wing → Floor; the Unit remains the primary entity shown inside that structure.
- Directory: widened for this vertical to include Unit, Household and Person instead of only the primary entity.
- Admin/runtime terminology: familiar society language replaces Network OS terminology on normal resident surfaces.

### Extraction / new domain work deferred to later missions
HS-1 must add temporal property-domain records for ownership, co-ownership, tenancy and occupancy history rather than relying only on current graph edges. Fine-grained domain permissions are also required before finance, complaints, security, staff IDs or owner documents are introduced.

## Binding entity model
### Entity kinds
- `unit` — **primary operating object**
- `household`
- `person`
- `building`
- `wing`
- `organization` — committee/vendor-ready generic organizational object
- `location`

### Hierarchy dimensions
- `building`
- `wing`
- `floor`
- `unit_type`
- `occupancy_status`
- `resident_type`
- `parking_zone`

### Relationship kinds
- `owned_by`: Unit → Person
- `co_owned_by`: Unit → Person
- `occupied_by`: Unit → Household
- `tenanted_by`: Unit → Household
- `member_of_household`: Person → Household
- `resident_of`: Person → Unit
- `serves_on`: Person → Organization
- `supports`: generic directed support relationship

Ownership is never inferred from residency. Tenancy is never allowed to mutate ownership semantics.

## UX delivered in HS-0
Resident-facing composition uses: **Home · Society Structure · Residents · Community · Neighbours · Guide**. Admin appears as **Manage Society**. Intelligence, Places, Contribute and advanced platform/federation machinery are intentionally absent from the ordinary composition.

The synthetic Playground is **Green Meadows Housing Society**, a Pune-style 24-unit community with units, households, residents, owner/tenant occupancy links, committee/community groups and sample activity.

## Database migration
`082_hs0_housing_society_vertical.sql` is additive and rerunnable:
- expands vertical/template constraints safely via `DROP CONSTRAINT IF EXISTS` + recreate;
- extends current G8/FCA productized runtime functions while preserving all prior vertical branches;
- adds housing-specific allowed entity and relationship contracts;
- seeds housing dimensions/projections idempotently;
- seeds Launch Control and Playground feature rows via upsert;
- includes post-migration assertions so partial/incompatible development attempts fail loudly.

No existing table/column is destructively dropped. No previous migration is rewritten.

## Validation
- `npm run validate:hs0` — dedicated HS-0 source gate plus FCA-0 regression gate.
- Dedicated TypeScript syntax/transpile validation passes for all 16 affected TS/TSX files. Full project type/build validation remains required after dependencies are installed.
- Deployed Supabase/Vercel behavior remains **RUNTIME VERIFY** until migration 082 is applied and the creation/playground/member/admin journeys are exercised.

## Regression risks
1. Productized runtime functions are shared across Association, FCA, Organization, Business Trust, Franchise and Professional; every replacement must retain all existing branches.
2. Database constraints must include every prior vertical when adding `housing-society`.
3. Generic productized UI still assumes a common editor; HS-1 must not overfit housing-specific lifecycle into generic metadata fields.
4. A resident directory that includes units/households/people must preserve visibility rules and not reveal owner/contact data indiscriminately.
5. Launch Control must keep future society modules hidden until their domain authorization is real.

## Effort assessment
**Medium effort remains appropriate for HS-0.** The platform already has strong reusable composition primitives, so HS-0 is primarily contract integration and regression protection. HS-1 becomes a higher-complexity mission because temporal property lifecycle, bulk import mapping, claiming, parking/vehicles and field-level authorization must become real domain behavior.

## Next mission
**HS-1 — Property, Household & Resident Core**: temporal ownership/tenancy/occupancy, unit lifecycle, My Flat, owner/tenant history, resident claiming/invitations, parking/vehicles and import mapping suitable for a 20–50 unit real pilot.
