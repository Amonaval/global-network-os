# NEXT SESSION PROMPT — Post M6-A

Resume Generic Network OS from the current source state.

## Current status
- Mission 4 application/backend boundary: implemented and broadly runtime accepted.
- Mission 5 production/operational runtime: source implemented; local deployment certification remains.
- Mission 6-A Trusted Identity Unification + Cross-Network Reachability: source implemented; runtime verification pending.

## M6-A architecture
Do not rebuild multi-network identity. NX-1 remains authoritative:
`auth user → neutral memberships → network-local profile/entity contexts`.

M6-A adds only privacy-safe aggregate reach:
- active network count;
- distinct vertical count;
- distinct authenticated member accounts across the user's own networks;
- identity-linked context coverage;
- owned/administered counts.

No global profile table, no graph merge and no cross-network member directory were added.

## Recommended next mission
**M6-B — Trusted Network-to-Network Linking & Governed Bridges — MEDIUM effort.**

Goal: allow independently governed networks to establish explicit, consented trust/affiliation bridges with clear scopes. Build the smallest useful network-of-networks graph without exposing member lists or merging graphs. Reuse existing Network OS graph/governance contracts where semantically valid.

Do not jump directly to unrestricted cross-network search. Privacy-safe discovery/introduction belongs after governed bridges are real.

## Permanent closure rule
Every major mission must include the normal Markdown/release/runtime artifacts **and** a human-readable `.docx` mission document. Follow `MISSION-DOCUMENTATION-RULE.md`.


## Latest completed source mission: M6-B
M6-B adds neutral governed bridges between independently governed networks using private Bridge Codes, recipient-admin approval, explicit relationship types/capability intent, audit events and revocation. Cross-network people discovery and generic trusted introductions are still intentionally disabled. The next strategic mission is **M6-C — Privacy-Safe Cross-Network Discovery & Trusted Introductions**. Reuse `network_trust_bridges`; do not build another bridge subsystem and do not merge network graphs.

## Current handoff after M6-C
M6-C privacy-safe discovery and trusted introductions is source implemented. First certify migration 059 + runtime checklist. Do not weaken the invariant that adjacent-network identity remains hidden until target acceptance.

## Latest state
M6-D is source-implemented. Before a new strategic mission, apply migration 060 and complete the short M6-D runtime checklist. Do not expand telemetry into identity/query surveillance.


## Latest handoff — after M6-E
M6-E Governed Multi-Hop Trusted Paths is source implemented. Apply migration `061_m6e_governed_multihop_trusted_paths.sql`, run `npm run validate:m6e`, typecheck/build and the runtime checklist before closing.

The next recommended product mission is **M7-B — WOW Showcase Universe & Guided Scenario Theater — MEDIUM-HIGH effort**. Read `MISSION-7-REAL-WORLD-ACTIVATION-SHOWCASE.md` first. Build 5–7 concrete synthetic end-to-end scenarios across ~600–900 deliberately interconnected entities/identities. Scenarios must exercise real M6-A identity reach, M6-B bridges, M6-C anonymous discovery/consent, M6-D pulse and selected M6-E two-hop paths. The demo is a product-design test harness: fix genuine UX friction discovered while making stories feel magical.

## Latest state — M7-B WOW Showcase
M7-B is source implemented. Apply the M7-B affected-files package as a self-contained delta; it includes `components/CrossNetworkDiscovery.tsx` specifically to repair the observed missing-module regression. Run `npm run validate:m7b`, typecheck and build. Verify the seven-story Scenario Theater in My Networks. After certification, proceed to M7-A Zero-Friction Network Launch & Activation, using friction discovered in M7-B as input rather than rebuilding onboarding from scratch.

## M7-A — Zero-Friction Network Launch & Activation
M7-A is source implemented. My Networks now gives Owners/Admins a privacy-safe launch-readiness path: seed meaningful people/entities → bring in participants → claim/link identities → establish trusted reach when appropriate → complete a first consented outcome. Migration 062 returns aggregate counts only for networks the caller administers. Existing import/invite/claim/admin experiences are reused rather than duplicated. Validate with `npm run validate:m7a`; runtime/type/build certification is pending in the normal installed workspace. After M7-A, proceed to M7-C Guided Pilot/Admin Activation and then M7-D Pilot Feedback & Learning, using M7-B/M7-A friction as evidence.
