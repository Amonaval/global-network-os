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
