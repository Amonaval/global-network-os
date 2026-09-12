# NF-6 — Trusted Request Routing

**Status:** Source implemented; integrated runtime verification intentionally deferred  
**Date:** 2026-08-29

## Mission
Move federation from directory browsing toward a request-first outcome loop. A member should be able to state a need inside one governed Network → Umbrella → Purpose context and receive explainable routes to people who explicitly opted into that same purpose through NF-5.

## Before NF-6
NF-4 could discover eligible Networks and NF-5 could discover explicit person-owned purpose profiles, but the user still had to browse/search manually. There was no durable request object, route evidence, shortlist state or foundation for later outcome learning.

## After NF-6
TrustWeave can persist a user-owned request, generate deterministic route candidates from current NF-5 opt-ins, explain why each candidate is reachable, and preserve requester decisions. NF-6 deliberately stops before recipient contact or introduction.

## Architecture
### Persisted entities
- `federated_requests` — one requester-owned need scoped to source network, umbrella and exact purpose.
- `federated_request_routes` — route evidence referencing an NF-5 outward purpose profile, deterministic relevance score/reasons, institutional Trust Receipt path and requester-owned route state.

### Eligibility path
`Requester → active source Network membership → approved Umbrella affiliation → source Passport declares purpose → target active NF-5 purpose opt-in → target approved affiliation + current Passport purpose visibility`.

### Deterministic route evidence
NF-6 uses only selective outward NF-5 data such as purpose tags, broad location, headline/summary and freshness. It records human-readable relevance reasons. The score is a relevance hint, not a public reputation score.

## Privacy / governance guardrails
1. Requests are not global broadcasts.
2. Target routes require explicit active NF-5 purpose consent.
3. No private vertical member/profile/relationship/contact tables are queried.
4. A route suggestion does not notify the target.
5. A route suggestion does not reveal email/phone/private source profile.
6. A route suggestion does not imply endorsement.
7. Request close/cancel does not modify memberships, affiliations or target consent.
8. Current affiliation, umbrella, Passport and purpose consent are rechecked before route display.

## User experience
The Launch-Controlled `Trusted Request Routing` surface lets a user:
- choose an eligible source Network → Umbrella → Purpose context;
- enter title/context/broad location/tags;
- create and immediately route the request;
- review relevance score + reasons + institutional Trust Receipt;
- shortlist or dismiss routes;
- refresh routes against current consent/state;
- close or cancel the request.

## Launch Control
Feature key: `*.advanced.trusted_request_routing`  
Bundle: `federation`  
Default: `TEST`  
Delivery: lazy-loaded through `next/dynamic` from My Networks.

## Database
Migration: `075_nf6_trusted_request_routing.sql`

RPCs:
- `get_my_trusted_request_contexts()`
- `get_my_federated_requests()`
- `create_my_federated_request(...)`
- `set_my_federated_request_status(...)`
- `refresh_my_federated_request_routes(...)`
- `get_my_federated_request_routes(...)`
- `set_my_federated_request_route_status(...)`

Direct table privileges remain revoked from `anon`/`authenticated`; audited RPCs form the access boundary.

## Validation completed
- NF-6 dedicated source/architecture gate: PASS.
- i18n visible-literal audit: PASS (0 candidates).
- isolated TypeScript syntax transpilation of NF-6 contract, remote adapter and UI: PASS.
- migration gate verifies no known private vertical/contact tables and no reuse of M6 `network_trust_bridges`.

Full project typecheck/runtime/database verification remains deferred to the planned sequential federation ZIP validation pass.

## Strategic value
NF-6 begins the durable moat sequence:

`request → route evidence → NF-7 introduction consent → NF-8 outcome → NF-9 adaptive trust intelligence`.

This is stronger than a static directory because real needs create measurable demand, route decisions and eventually outcome evidence.

## Related strategic addition — controlled-reveal documentation
This mission also updates the roadmap with a `DR-*` Documentation & Controlled-Reveal track and creates `DOCUMENTATION-CONTROLLED-REVEAL-ARCHITECTURE.md`. The future standalone documentation repository will separate User, Community Head, Agent/Operator, Partner, Developer, Architecture and Founder guides, with private founder material excluded from external build artifacts.

## Next mission
**NF-7 — Governed Introduction & Consent**: convert a shortlisted route into a recipient-controlled introduction request without exposing private contact details before acceptance.
