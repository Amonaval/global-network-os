# S2-C — Trusted Introductions & Connection Paths

Status: **IMPLEMENTED IN SOURCE / LIVE VERIFY**

## Product thesis
Community discovery becomes defensible when the product can answer **“Who can introduce us, and why is that path trusted?”** without exposing the private family graph.

## Implemented
- Explicit family-to-family trust requests inside an approved community space.
- Receiving Family Owner/admin must accept before an edge can power connection paths.
- Accepted edges are bidirectional and revocable.
- Explainable shortest family-level paths up to four trusted hops.
- No relationship/surname/community inference.
- Discovery cards surface a path such as `Nawal Family → Rathi Family → Somani Family` where one exists.
- Persisted introduction requests against opt-in community profile cards.
- Optional respectful note, 500-character limit.
- Incoming request accept/decline and outgoing cancellation.
- Path snapshot stored with the request so its original trust context remains explainable.
- Private phone/email are never exposed by this flow.
- Playground includes simulated trust edges, connection path and introduction request.

## Deliberate boundary
S2-C paths are **family-level**, not named-person paths. We will not claim “your uncle knows her cousin” until bridge people explicitly opt into being named connectors. Same surname, city, caste/community or inferred similarity never creates an edge.

## Next intelligence layer
Potential later S2 work:
1. opt-in named bridge contacts;
2. accepted introduction hand-off and completion state;
3. introduction quality/reliability signals without popularity ranking;
4. abuse/reporting and rate limits before broad community scale;
5. graph analytics that measure trusted network density without exposing private relationships.

## Live behavior gate
Test with at least three real test families in one approved community:
- A requests trust with B; B sees pending and accepts;
- A now sees one-hop path to B profiles;
- B trusts C; A sees A→B→C path to C;
- decline/revoke removes the usable path;
- introduction request persists and target can accept/decline;
- unrelated family/private family data remains unavailable;
- normal members cannot create/revoke family trust edges;
- 360/390/430 mobile tabs/cards/modal remain usable.
