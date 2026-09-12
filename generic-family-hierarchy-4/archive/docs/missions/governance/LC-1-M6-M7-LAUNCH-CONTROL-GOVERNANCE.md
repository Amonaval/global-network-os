# LC-1 — M6/M7 Launch Control Governance Hardening

## Why this correction exists
M6 and M7 introduced advanced cross-network, showcase and pilot-operating capabilities directly on My Networks. They were technically complete, but they bypassed the platform rule that every user-visible capability must be independently controlled by Founder Launch Control. Deployment must never imply release.

## Decision
LC-1 registers every M6/M7 capability in the existing vertical-aware `platform_feature_flags` system. No second flag framework is introduced.

### Advanced Network Effect — M6
- M6-A Trusted identity reach
- M6-B Trusted network bridges
- M6-C Cross-network discovery & introductions
- M6-D Network Effect Pulse
- M6-E Governed multi-hop trusted paths

### Advanced Showcase / Pilot Operations — M7
- M7-A Guided network launch
- M7-B WOW showcase theater
- M7-C Pilot launch console
- M7-D Pilot feedback loop
- M7-E Showcase runtime certification
- M7-F Pilot evidence product decision gate

## Release semantics
Each capability exists once per vertical: Family, Alumni, Organization, Business Trust, Franchise and Professional. Each can independently be `hidden`, `test`, `pilot` or `released` using the existing Launch Control screen.

New rows default to `test`, meaning platform owners can continue runtime certification while ordinary Alpha users do not receive these advanced capabilities.

Existing founder choices are never overwritten by the migration.

## Runtime behavior
`MyNetworksHome` now resolves the effective feature rows for the currently active network vertical and fails closed if the launch registry cannot be read. Every M6/M7 surface is gated before rendering.

M6-E is independently gated inside bridge/discovery UX: when multi-hop is disabled, the path-traversal proposal control disappears and two-hop candidates are not shown.

## Alpha rule
The Alpha preset does not automatically promote any LC-1 advanced bundle. Recommended initial state: keep all M6/M7 capabilities in `test`; explicitly promote only the chosen vertical/capability to `pilot` when a controlled pilot needs it.

## Control example
A founder can configure:
- Family: Bridges = Pilot, Discovery = Pilot, Multi-hop = Hidden
- Alumni: Bridges = Test, Discovery = Test
- Business Trust: all advanced features = Hidden
- Organization: Pilot Console = Pilot, cross-network features = Hidden

This does not require separate deployments.

## Architecture invariant restored
`DEPLOY != RELEASE`.
Every future user-facing capability must be registered in a vertical catalog, have a persisted launch row, be evaluated by runtime feature visibility, and appear in Founder Launch Control before its mission can be considered closed.
