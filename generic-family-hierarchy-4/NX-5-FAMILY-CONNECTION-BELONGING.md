# NX-5 — Family Connection & Belonging

## Outcome
Make a large private family feel understandable and personally relevant: names become people, relationship paths become explainable, and younger generations can see where they belong.

## Experience
- **Know the people behind the family tree**: one wider-family relative with a plain-language relationship and a visual `You → … → relative` path.
- **Reconnect**: deterministic rotation across real reachable relatives; no feed or popularity ranking.
- **Family circles**: derived, read-only views such as your generation, family around your city, and close family within two relationship steps.
- **Context signals**: shared ancestor when known, family place, and preserved memories/events connected to the highlighted relative.

## Architecture
NX-5 is additive and reuses `Member`, `Relationship`, `Memory`, `LifeEvent` and the existing relationship-intelligence functions. No new persistence model, RLS policy or cross-network identity behavior is introduced.

## Privacy
- Circles are derived inside the current Family network; they are not public groups.
- No hidden membership list is published.
- No contact field is surfaced by NX-5.
- No relationship is inferred outside the stored Family graph.
- No engagement ranking, follower model, likes or infinite feed.

## Product test
A user should be able to answer: **“Who is this person to me?”** without manually traversing the tree, and a younger family member should be able to understand wider-family belonging without memorizing hundreds of names.
