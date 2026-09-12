# Mission 6-A — Trusted Identity Unification + Cross-Network Reachability

## Outcome
Turn the already-working one-account/many-networks model into visible, measurable trusted-person value without creating a second identity system or merging private network graphs.

## Starting point reused
NX-1 already established the correct foundation:
- one authenticated account;
- many neutral network memberships;
- network switching;
- network-local profiles/entities;
- explicit privacy rule that identity != membership != profile/entity != network.

M6-A does **not** rebuild any of that.

## Delivered
- `TrustedNetworkReach` added to the existing `TrustedPersonIdentity` aggregate.
- Privacy-safe `get_my_trusted_network_reach()` aggregate RPC.
- My Networks now shows **Your Network Reach**:
  - active networks;
  - network vertical/types;
  - distinct authenticated member accounts across networks the person belongs to;
  - identity-linked/claimed contexts;
  - owned/administered network counts.
- Existing Family `member_id`, Alumni `claimed_by`, and productized `owner_user_id` bindings are reused to measure identity-context coverage.
- No new global profile table, no universal person directory, no graph merge, and no cross-network member disclosure.

## Privacy invariant
The new RPC returns counts only for networks the signed-in account is already an active member of. It does not return another network's member identities, profile fields, relationships, graph data, or activity.

## What this proves
The platform can now answer not only “which networks do I belong to?” but also “what does my network universe look like collectively?” while preserving network isolation.

## Deliberately deferred
- persistent network-to-network trust edges;
- cross-network discovery;
- introduction requests/consent;
- portable trust signals;
- cross-network profile field portability;
- global/distributed identity resolution.

These are M6-B / M6-C concerns.

## Next strategic mission
**M6-B — Trusted Network-to-Network Linking & Governed Bridges.**
