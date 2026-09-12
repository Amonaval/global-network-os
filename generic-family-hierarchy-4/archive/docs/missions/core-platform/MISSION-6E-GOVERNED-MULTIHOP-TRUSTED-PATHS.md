# Mission 6-E — Governed Multi-Hop Trusted Paths

## Purpose
Extend the M6 trusted-network model from direct A↔B bridges to carefully bounded A→B→C reach without turning Network OS into an unrestricted global social graph.

## Core product idea
A useful person may be two trusted network relationships away. M6-E lets the system discover that opportunity only when every bridge on the path explicitly permits discovery **and** explicitly opts into path traversal.

Example:

`Family A → MET Alumni → UI Leaders Community → relevant expert`

The requester still receives an anonymous opportunity, not the person's profile. M6-C consent remains the identity-disclosure gate.

## Implemented
- explicit `pathTraversal` bridge capability, OFF by default;
- bridge-request UX for proposing trusted path traversal;
- maximum graph depth of 2 bridge edges;
- direct paths ranked before two-hop paths;
- duplicate target identities de-duplicated in favor of the shortest path;
- short-lived candidate provenance records containing the governed bridge/network path;
- path-aware discovery result explanation;
- introduction request re-validates every path edge at request time;
- all path edges must still be accepted and allow introductions;
- two-hop introductions additionally require path traversal on every edge;
- consent inbox/outbox carries path provenance while preserving M6-C identity rules;
- M6-D pulse adds privacy-safe `multiHopOpportunities` measurement.

## Privacy and governance rules
1. One-hop bridges do not automatically become transitive.
2. `pathTraversal=false` is the default.
3. Every edge in a two-hop path must opt in.
4. Maximum path depth is 2; no A→B→C→D traversal.
5. Discovery still returns opportunity handles, never a cross-network member directory.
6. The target identity is still disclosed only after target acceptance.
7. Revocation or capability downgrade invalidates the path before an introduction can be created.
8. Analytics stores only the count of multi-hop opportunities, not search text or candidate identity.

## Why depth 2
Depth 2 is enough to prove the network-of-networks thesis and create meaningful reach while preserving understandable trust provenance. Deeper traversal would introduce path explosion, complex consent semantics, harder explanations, abuse risk and unclear intermediary expectations. It should require real usage evidence before consideration.

## Relationship to M7
M6-E completes the advanced trusted-graph foundation needed for the M7 WOW Showcase Universe. M7 should intentionally create scenario data where some useful answers are direct, some are one-hop, and a few are governed two-hop paths so evaluators can visibly experience why Network OS is different.
