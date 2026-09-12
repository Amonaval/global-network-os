# NX-3 — Family Time Machine & Generational Legacy

**Effort:** Medium  
**Status:** Implemented / source validation pending runtime milestone verification

## Outcome
Make Family Network valuable as a generational record, not just a current directory. A member can move through real recorded family eras and see what context may disappear if nobody preserves it.

## Product experience
- **Family Time Machine** groups real stored births, deaths, life events and memories into readable eras.
- Each era shows only evidence already present in the family data: people, dates, places and stored descriptions.
- **What could be forgotten?** prioritizes profiles with missing story/photo/place/birthday context, with older/deceased generations surfaced first.
- **Generation coverage** highlights the generation with the weakest story/photo coverage.
- Direct actions open the real profile, memories, tree or contribution flow.

## Trust rules
- No AI-generated family narrative.
- No inferred historical claims.
- No cross-network data.
- No new persistence, RLS or identity model.
- Missing data becomes an honest preservation prompt rather than synthetic content.

## Reuse
Uses existing `Member`, `Relationship`, `LifeEvent`, `Memory`, relationship-intelligence and Family engagement telemetry. NX-3 rides on the existing Family Pulse launch-control seam.
