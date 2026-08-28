# NX-2 — Living Network: Daily Value & Generational Connection

## Outcome
Make Family Network worth reopening because it reconnects the user with real people, memories and generational context—not because it imitates a social feed.

## Product rule
No streaks, infinite scrolling, points or engagement pressure. The return loop must come from real family relevance.

## Delivered
- **One meaningful family minute:** one calm daily suggestion derived from real family data.
- **Rediscover someone:** deterministic daily relative discovery using the existing relationship graph and viewer-relative relationship labels.
- **Remember together:** old memories/history can become the day's reason to return.
- **Preserve one story:** prioritizes living relatives whose profile/story context is still incomplete.
- **Across generations:** makes the continuity between older and younger living generations visible.
- **Family continuity:** generations, family cities, and preserved story/life-context counts are visible as a preservation signal.
- Works with existing Family Pulse, Quiet Digest, Memories, Participation and profiles; no new database tables or RLS changes.
- Playground/demo uses the same implementation and remains read-only.

## Architecture
NX-2 is additive. `LivingFamilyLoop` receives already-authorized Family members, relationships, events and memories from `NetworkApp`. Relationship personalization reuses `relationship-intelligence.ts`; it does not build a second graph model.

## Safety / privacy
- No cross-network data is introduced.
- No public sharing is automatic.
- No new tracking beyond the existing family-engagement event seam.
- Sparse families degrade to preservation/help prompts rather than invented relationship claims.

## Success signal
The feature is successful when users can answer “why would I open this again?” with a real family reason: remember, celebrate, rediscover, understand or preserve.
