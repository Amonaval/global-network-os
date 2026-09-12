# E3 — Mentions & Responsibility Routing

**Status:** IMPLEMENTED / SOURCE-GATED

## Product job
Route attention to the person responsible for an issue instead of broadcasting everything to everyone.

## Delivered
- Network-scoped responsibility roles.
- Admin assignment of roles such as President, Chairman, Secretary, Treasurer, Events, Membership, Facilities, Security and Complaint Resolver.
- `@President`, `@Chairman`, `@Treasurer` and similar role mentions.
- Named-member mention resolution.
- Owner/Admin/Board aliases.
- Mention extraction from activity text.
- Notification creation and push handoff after mention resolution.
- Strict active-network scope: a role in one network never resolves into another network.

## Core migration
`supabase/migrations/105_engagement_mentions_role_routing.sql`

## Source gate
`scripts/engagement-e3-mentions-routing-gate.mjs`
