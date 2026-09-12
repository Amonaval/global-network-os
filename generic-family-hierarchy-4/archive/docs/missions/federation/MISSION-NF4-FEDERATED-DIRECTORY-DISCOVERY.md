# Mission NF-4 — Federated Directory & Discovery

**Status:** Source implemented — 2026-08-29  
**Validation posture:** Integrated runtime verification intentionally deferred until the federation batch is applied sequentially.

## Mission objective
Turn governed federation into useful discovery without creating a federation-wide people directory. NF-4 discovers **Networks** reachable through approved institutional paths and exposes only the target Network Passport fields currently permitted by the source network.

## Eligibility path
`active requester membership → approved source Network↔Umbrella affiliation → active umbrella → approved target affiliation → Federation/Public + directory-discoverable target Passport`

Every result carries an explainable trust receipt:
`your source network → umbrella → target network`

## Delivered
- `search_federated_network_directory(...)` authenticated RPC.
- Search over outward Network Passport identity, summary, geography, capabilities and declared scopes.
- Optional purpose filtering against network-declared capabilities/scopes.
- Institutional trust-path provenance for every result.
- Read-time Passport privacy/directory eligibility.
- `FederatedDirectoryDiscovery` UI dynamically loaded from My Networks.
- independent `*.advanced.federated_directory` Launch Control capability, TEST by default.
- dedicated NF-4 source gate.

## Privacy and consent invariants
1. NF-4 returns Networks, never members/people/resources.
2. A Network Passport scope such as jobs, business, mentoring or matrimony means only that the network may support that purpose.
3. Scope declaration is not participant enrollment or consent.
4. No target-network member/profile/contact/relationship/private graph table is queried.
5. Person/resource discovery must be designed later on top of NF-5 application/purpose contracts with explicit participant eligibility and selective disclosure.

## Architecture significance
NF-4 establishes the first user-facing Trust Receipt pattern. A result is not simply listed; TrustWeave can explain the approved institutional route that made it discoverable. This provenance pattern can later be extended to application-scoped people/resources without weakening private-network boundaries.

## Deferred runtime verification
When the founder applies the federation ZIPs sequentially, verify migration 073 after NF-1/2/3, promote the NF-4 feature to TEST for the chosen vertical/network, create two approved networks under one umbrella with directory-enabled Passports, and confirm search/provenance/purpose filtering plus privacy withdrawal behavior.

## Next mission
**NF-5 — Community Applications / Purpose Scope Framework**: formalize reusable application scopes, participant eligibility/opt-in, selective disclosure and application-specific projections before enabling person/resource federation discovery.
