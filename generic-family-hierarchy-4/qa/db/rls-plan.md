# RLS / tenant isolation executable plan

Automate these with dedicated Owner-A and Member-B sessions against staging:

1. User in Network A cannot select Network B entities, memberships, activities, media metadata or invitations.
2. Direct REST/RPC calls must fail even if UI hides the action.
3. Member cannot invoke owner/admin mutation RPCs.
4. Admin cannot invoke owner-only archive/hard-delete where contract says owner-only.
5. Anonymous session sees only explicit public-profile/public-network surfaces.
6. Archived network access is denied to normal members and remains restorable only by owner.
7. Storage paths from another network cannot be read/listed/removed.
8. Invitation/claim tokens cannot be replayed after use/revocation/expiry.

The staging implementation should create two isolated networks and test cross-network ID substitution for every network-scoped REST/RPC family.
