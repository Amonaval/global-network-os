# Mission 6-B — Trusted Network-to-Network Linking & Governed Bridges

## Outcome
Turn isolated networks into a privacy-safe **network of networks** by allowing administrators to create explicit, bilateral, revocable trust bridges without merging memberships, profiles or graphs.

## Starting point reused
M6-A/NX-1 already provide one authenticated person, many independently governed network memberships, network switching and privacy-safe reach aggregates. M6-B does not rebuild identity or membership.

## Delivered
- Neutral `network_trust_bridges` persistence across Family, Alumni, Organization, Business Trust, Franchise and Professional networks.
- Private per-network Bridge Codes. There is intentionally no public network directory/search.
- Governed lifecycle: request → recipient-admin review → accepted/declined → revocation by either side.
- Relationship types: affiliation, community, partner, parent/child, trusted peer.
- Explicit capability intent for future `discovery` and `introductions`.
- My Networks → **Trusted Network Bridges** UI for code generation, requests, review, activity and revocation.
- All bridge writes use the M4/M5 `/api/v1` command runtime; reads remain RLS/security-definer scoped.
- Audit-log events for request, acceptance/decline and revocation.

## Privacy and governance invariant
An accepted bridge does **not** expose another network's member list, profiles, relationships, activity or graph. `discovery` and `introductions` are stored as bilateral policy intent only. They remain inert until M6-C implements capability-specific privacy and consent checks.

## Why Bridge Codes
Searching every network by name would silently create a directory of private networks. Bridge Codes require an administrator to intentionally share an invitation out-of-band. The receiving administrator still must approve the relationship.

## What M6-B proves
Network OS can now model a graph **of independently governed networks** rather than only graphs inside each network. This is the structural prerequisite for privacy-safe cross-network discovery and consent-based introductions.

## Deliberately deferred
- cross-network people search/results;
- cross-network profile disclosure;
- introduction request workflow across generic bridges;
- portable reputation/trust scoring;
- transitive multi-hop discovery;
- automatic bridge creation or identity inference.

## Next strategic mission
**M6-C — Privacy-Safe Cross-Network Discovery & Trusted Introductions.**
