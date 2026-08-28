# M7-E — Showcase Runtime Hardening & Demo Certification

## Mission outcome
Close the M6/M7 trusted-network track by making the WOW showcase dependable in a real runtime, diagnosable when discovery returns no candidates, and explicitly certifiable before a demo or pilot.

## What changed
- Added **Showcase Runtime Health** preflight in My Networks.
- Added counts-only certification for active networks, claimed identity contexts, accepted bridges, discovery/introduction/path-traversal permissions, and accepted outcomes.
- Hardened zero-result discovery UX with privacy-safe diagnostics.
- A 0-result search now differentiates: no discovery bridge, matching profile exists but is unclaimed, no claimed people are eligible, or no eligible claimed match exists.
- Diagnostics never reveal the target person, adjacent member list, search-result count, contact information, or graph export.
- Synthetic M7-B theater remains read-only and separate from live certification.

## Demo certification rule
A live trusted-network demonstration is considered READY when the signed-in user has at least two active networks, at least one claimed identity context, and at least one accepted bridge permitting both discovery and introductions. Two-hop scenarios additionally require `pathTraversal` on every bridge edge.

## Runtime certification sequence
1. Apply migration `066_m7e_showcase_runtime_hardening.sql`.
2. Open My Networks → Showcase Runtime Health.
3. Confirm live runtime is Ready or follow the missing setup counts.
4. Use two real users for discovery: requester in source network; claimed/active target identity in connected network.
5. Search an obvious target profession/expertise. Identity must remain hidden before introduction acceptance.
6. Test a deliberately unclaimed matching profile and confirm the UX explains why it is ineligible.
7. For a two-hop demo, verify pathTraversal is enabled on both edges and disabling either edge removes the path.

## Closure
M7-E is a hardening/certification mission, not new product scope. After certification, additional M6/M7 graph or showcase work should be driven by pilot evidence rather than architecture imagination.
