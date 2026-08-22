# A2 — Autonomous Create / Join / Invite / Claim

## Implemented
1. Signed-in user with no family can use the existing guided setup to create a family.
2. `create_family` creates the tenant, owner membership and family settings atomically.
3. Slugs are normalized and collision-safe.
4. Invitation preview identifies the family and intended person without exposing private family data.
5. Invitation acceptance creates/activates membership in exactly the invitation network and claims the intended member.
6. Claims are stored per family on `network_memberships.member_id`; `profiles.member_id` remains the active-family compatibility pointer.
7. Switching families updates both `active_network_id` and that compatibility pointer.
8. Admin invitation list/revoke/resend/create RPCs are constrained to `current_network_id()`.
9. Family switcher supports accounts in multiple families and offers “Create another family”.

## Required staging verification
- Clean migrations 001–020.
- Upgrade Release 2/2A database 018→019→020.
- Create Family A and Family B from separate accounts.
- Invite an unclaimed A profile; accept from a new account; verify membership + claim only in A.
- Same account joins B with a B invitation; switch A↔B; verify correct profile pointer and data each time.
- Attempt A-admin revoke/resend/list against B invitation UUIDs; must fail/not disclose.
- Expired, revoked, used and already-claimed links show recovery-safe errors.
- Re-run Release 1/2/2A journeys.
