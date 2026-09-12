# Mission 7-A — Zero-Friction Network Launch & Activation

## Mission outcome
Turn the existing collection of create/import/invite/claim/bridge/introduction capabilities into one understandable launch journey. M7-A does not rebuild onboarding. It tells an organizer what matters **next** and progressively moves a network from empty shell to first useful trusted outcome.

## Launch journey
`Seed → Participants → Claims → Trusted Bridge → First Accepted Introduction → Proven`

The launch guide appears in **My Networks** for networks the signed-in person owns or administers. It uses aggregate counts only and recommends one deterministic best next action.

## Readiness signals
For each administered network:
- seeded people/entities;
- active participating accounts;
- claimed/linked identities;
- accepted trusted bridges;
- accepted trusted introductions.

V1 milestones are intentionally small: 5 seeded people/entities, 3 active participants, up to 3 claimed identities, one accepted bridge, and one accepted introduction. These are activation prompts, not universal business KPIs.

## Best-next-action rules
1. **Seed** — add/import the first five meaningful people or entities.
2. **Invite** — bring in at least two more participants so one organizer is not doing all the work.
3. **Claim** — link real people to their network-local identities.
4. **Bridge** — connect to one genuinely related trusted network when appropriate.
5. **Outcome** — try one real need and complete one consented trusted introduction.
6. **Proven** — continue growing around demonstrated member value, not data volume.

## Architecture
M7-A adds a privacy-safe RPC `get_my_network_launch_snapshots()` in migration 062. It is scoped to networks where the caller is an active Owner/Admin. It returns aggregate launch counts only and does not expose member directories or cross-network identities.

Client structure:
`My Networks → NetworkLaunchActivation → launch-activation remote → Supabase RPC`.

No new onboarding database, workflow engine, queue or analytics provider is introduced.

## Product principles
- progressive completeness beats perfect data before launch;
- a few contributors beat one exhausted organizer;
- claimed identity matters more than fully enriched profile fields;
- one useful outcome matters more than large member counts;
- advanced Network OS features should appear after the network has enough context to benefit from them.

## Relationship to M7-B
M7-B explains the WOW outcome using synthetic stories. M7-A gives a real administrator the shortest path to becoming capable of producing those outcomes with a real network.

## Non-goals
- no automatic invitations;
- no forced bridge creation;
- no artificial engagement score;
- no cross-network directory exposure;
- no replacement for existing import/invite/claim/admin screens;
- no assumption that every network must use cross-network features.
