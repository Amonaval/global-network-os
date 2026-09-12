# Mission NF-5 — Community Applications / Purpose Scope Framework

**Status:** Source implemented — 2026-08-29  
**Validation strategy:** Integrated runtime verification intentionally deferred until the current federation batch is applied sequentially.

## Mission intent
Turn federation from Network-level capability declarations into a reusable **person-level application consent contract** without weakening the private-network boundary.

NF-5 closes the gap between:
- a Network Passport saying `jobs`, `business`, `mentoring`, `matrimony`, etc. may be supported; and
- a specific person explicitly agreeing to be discoverable for one of those purposes.

## Binding privacy model
`Network declares purpose ≠ Person consents.`

`Person consents to Purpose A ≠ Person consents to Purpose B.`

`Approved affiliation ≠ Person discovery.`

A person-level scope profile is bound to:
`owner user + source network + approved umbrella + purpose`.

## Implemented source scope
- Generic application-purpose catalog for jobs/referrals, business, expertise, mentoring, matrimony, relocation, events, volunteering and community help.
- `federated_scope_profiles` table: a selective outward snapshot owned by the authenticated person.
- Eligibility requires active source-network membership, approved NF-2 affiliation, active umbrella, and an NF-1 Passport currently visible to federation/public that declares the exact purpose.
- Selective fields only: display name, purpose headline, summary, broad location, tags and contact mode.
- No direct email/phone publication and no inheritance of private vertical member/profile/contact/relationship data.
- Withdraw/republish independent from underlying network membership.
- Scoped participant search only across approved federation reach.
- Trust Receipt path: `requester's source network → umbrella → opted-in participant's source network`.
- TEST-by-default Launch Control through `*.advanced.application_scopes`.
- Dynamic client import keeps the advanced module out of the basic My Networks delivery path unless rendered.

## Why this matters
NF-4 intentionally stopped at Network discovery. NF-5 provides the missing reusable consent primitive needed for future application verticals. Jobs, expertise, business, mentoring, matrimony and community assistance can now share one federation-safe publication model rather than each inventing a different privacy mechanism.

## What NF-5 does not do
- It does not implement a full Jobs, Matrimony or Business product.
- It does not expose private contacts.
- It does not treat a Network Passport declaration as person consent.
- It does not create a global people directory.
- It does not create reputation or endorsement from the Trust Receipt.
- It does not replace vertical-specific eligibility rules required by sensitive applications such as Matrimony.

## Runtime verification position
Source/architecture gates and isolated TypeScript transpilation pass. The repository's full `tsc --noEmit` remains blocked by the previously recorded incomplete local dependency/type installation (React/Node/D3/Leaflet/etc.). Per founder instruction, integrated functional verification is deferred until the federation ZIPs are applied sequentially.

## Next strategic step
NF-6 can now build one high-value application or trusted request-routing loop on top of this consent contract instead of bypassing it.
