# NF-2 — Governed Network ↔ Umbrella Affiliation

**Status:** Source implemented · runtime/deployed verification required  
**Date:** 2026-08-29  
**Strategic track:** Network Federation & Community Ecosystem

## Mission outcome
NF-2 makes the second structural dimension of TrustWeave real: independently governed Networks can establish explicit, reversible relationships with Umbrellas/Federations without transferring ownership of their people, profiles or private graphs.

The runtime sequence is:

`Network → Federation/Public Network Passport → affiliation request → Umbrella review → approved institutional provenance`

Approval is **not** a data-access grant.

## Why this architecture
M6 already models horizontal peer trust between networks. Federation is different. Reusing `network_trust_bridges` for a hierarchy/affiliation model would blur semantics and make future authorization unsafe. NF-2 therefore introduces first-class Umbrella entities and a separate Network↔Umbrella affiliation table.

## Implemented scope
- first-class `federation_umbrellas`;
- explicit umbrella Owner/Admin governance;
- many-to-many `network_umbrella_affiliations`;
- relationship types: member, chapter, affiliate, constituent, franchisee, partner, other;
- request / approve / decline / suspend / revoke lifecycle;
- NF-1 Network Passport prerequisite: request is rejected unless Passport visibility is `federation` or `public`;
- umbrella reviewers receive only Passport-level network identity/context;
- TEST-by-default Launch Control key: `*.advanced.network_affiliation`;
- My Networks admin experience for creating an umbrella, requesting affiliation and reviewing/reversing affiliation state;
- no member rows, private contacts, graph topology or application enrollment are accessed by NF-2.

## Privacy constitution
1. **Affiliation ≠ access.**
2. **Network participation ≠ person participation.**
3. **Umbrella approval ≠ application enrollment.**
4. **Private source graph stays inside its network.**
5. **Revocation removes provenance; it does not mutate the source network.**

## Architecture review added during NF-2
### CR — Composable Runtime & Lean Capability Delivery
A feature has three independent architecture controls:
- entitlement / rollout;
- code + dependency delivery;
- data/backend activation.

NF-2 starts CR-1 by converting the advanced My Networks cluster to `next/dynamic` imports. Disabled advanced modules are no longer statically imported into the basic My Networks path. This is a performance/delivery boundary only; authorization remains server-side/RLS.

Future CR-2..CR-4 cover route/dependency isolation, backend activation boundaries and capability manifests/deployable packs.

### NC — Network Type Studio
The six current verticals are reference implementations, not a permanent closed catalog. Roadmap NC-0..NC-5 now defines the path to hundreds of configurable network types:
- extract proven primitives from mature verticals;
- versioned Network Type Manifest;
- governed builder for nomenclature, entities, relationships, fields, modules and navigation;
- composable module catalog;
- declarative workflows/permissions/application scopes;
- versioned template packaging and migration.

Do not build the Studio before the primitives are proven across multiple mature verticals and federation.

## Deferred intentionally
- no automatic display of affiliation on a public Passport;
- no person/member inheritance into umbrellas;
- no federated directory/search yet;
- no umbrella-wide application scopes yet;
- no automatic trust propagation from affiliation;
- no custom workflow scripting;
- no separate microservice or graph database.

## Next mission
**NF-3 — Umbrella Network Runtime** should operate only on approved affiliation rows plus Network Passport / explicit aggregate outward data. It must not query child-network private graphs as an umbrella directory.
