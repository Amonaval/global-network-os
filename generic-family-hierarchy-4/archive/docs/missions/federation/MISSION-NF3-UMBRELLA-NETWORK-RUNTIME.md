# NF-3 — Umbrella Network Runtime

**Status:** Source implemented · integrated runtime verification intentionally deferred  
**Date:** 2026-08-29  
**Strategic track:** Network Federation & Community Ecosystem

## Mission outcome
NF-3 turns an approved federation from a relationship record into an operating surface. An Umbrella/Federation can now treat **Networks as its governed participants** and see an operational view built only from NF-2 affiliation state plus currently permitted NF-1 Network Passport metadata.

The runtime is deliberately:

`Umbrella → approved Network affiliations → permitted Network Passports → aggregate operational view`

It is **not**:

`Umbrella → child-network people / memberships / relationship graph`.

## Implemented scope
- Launch-Controlled `*.advanced.umbrella_runtime` capability, TEST by default;
- admin-only umbrella operating dashboard;
- approved-network count, pending review count and suspended-affiliation count;
- currently federation/public Passport coverage;
- Passport freshness/readiness signal;
- network-vertical diversity;
- aggregate outward capability mix;
- aggregate declared application-scope mix;
- approved participating-network directory with search and vertical filtering;
- source Network Passport visibility respected at read time;
- if an approved network makes its Passport private, the institutional affiliation remains but outward Passport fields are withheld;
- no child-network member count, person profile, contact, relationship or graph-topology query is used;
- dynamic import from My Networks so the NF-3 client module is not part of the basic initial capability path.

## Federation readiness score
The NF-3 readiness score is an **operational federation-health indicator**, not a rating of people or child networks. It uses only:
- number of approved network participants;
- percentage of approved participants with currently visible federation/public Passports;
- network-type diversity;
- Passport freshness within the operating window;
- pending governance backlog.

This is intentionally privacy-minimal. It does not use child membership counts or private engagement surveillance.

## Privacy constitution
1. **Umbrella participant = Network, not Person.**
2. **Approved affiliation ≠ member inheritance.**
3. **Directory entry = approved Network + permitted Passport fields.**
4. **Passport visibility is evaluated at read time.** A source network can withhold outward fields without destroying the approved affiliation.
5. **Aggregate health ≠ private-network telemetry.** No internal member/profile/relationship graph is queried.
6. **NF-3 does not broaden NF-2 authorization.** Umbrella admin checks remain server-side.

## Architecture significance
NF-3 is the first proof that federation can create useful organizer operations **without centralizing the underlying networks**. The umbrella knows which governed networks participate, their current outward identity/capabilities, and the federation's aggregate operating readiness while each source network remains independently owned and privacy-isolated.

This is also the correct substrate for the Distribution Supernode thesis: one trusted umbrella can coordinate many child networks without becoming their data owner.

## Deliberately deferred
- no person/member directory across the umbrella;
- no cross-umbrella search;
- no opted-in participant discovery yet;
- no automatic person enrollment from affiliation;
- no umbrella-wide jobs/matrimony/business application participation;
- no member-count or private activity telemetry;
- no trust propagation from affiliation;
- no custom umbrella workflow scripting.

## Validation strategy for the current federation batch
The founder has intentionally deferred integrated runtime validation while NF missions are being source-implemented. Each mission remains additive, launch-controlled and independently packaged. After the planned batch, affected-file ZIPs should be applied sequentially and each mission's checklist executed in order so defects can be attributed to the exact change set.

Current source validation:
- NF-3 dedicated source gate passes;
- i18n source audit passes;
- full project TypeScript validation remains blocked in this extracted workspace by missing third-party type packages, consistent with NF-1/NF-2.

## Next mission
**NF-4 — Federated Directory & Discovery** should add discovery across participating networks and only explicitly eligible/opted-in outward participants. It must preserve Network Passport provenance, application-purpose scope and source-network privacy rather than turning NF-3 into a global people directory.
