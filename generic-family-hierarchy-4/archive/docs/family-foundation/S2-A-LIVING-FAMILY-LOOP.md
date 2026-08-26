# S2-A — Living Family Loop: Family Pulse, Memory Interaction & Measurement

Status: **IMPLEMENTED IN SOURCE / LIVE VERIFY**  
Date: 2026-08-23

## Why this batch
S1 established first-session family magic. S2 must prove that the family is worth returning to. This batch intentionally does not add chat or a generic social feed. It connects existing family facts, memories, celebrations and contribution prompts into a restrained return loop.

## Implemented
- **Family Pulse** on Home selects only 1–3 relevant moments: a special day, an on-this-day/recent memory, and one small family contribution.
- **Lightweight memory reactions**: ❤️ 😊 🙏 🎉. One reaction per signed-in user; Playground reactions are simulated locally and never saved.
- **Privacy-safe engagement ledger** for pulse actions, memory reactions, deliberate shares and completed contributions.
- **Living Loop scorecard** for Family Owner/admin: pulse actions, reactions, shares, contributions, active people and returning people over 30 days.
- Existing quiet weekly/monthly notification preferences remain the notification foundation; no noisy realtime feed was introduced.
- Demo showcase includes visible reaction counts so Playground demonstrates the interaction model immediately.

## Safety / privacy
- Reactions are scoped to the active family and can only target memories in that family.
- Engagement events store product interaction metadata, not private browsing content or message text.
- Raw engagement tables remain unavailable to clients; interactions go through scoped RPCs.
- The admin scorecard is aggregate-only.

## Not yet S2 complete
S2's exit gate is behavioral, not source-based. Real pilot families must demonstrate repeatable Discover → Feel → Contribute → Share → Return behavior. Share-card visual assets, digest delivery, and further contextual contribution shortcuts remain candidates for the next S2 batch after this loop is live-tested.

## Deployment
Apply `supabase/migrations/037_s2a_living_family_loop.sql`, then deploy the affected application files. Run `npm run validate:s2-a` and the cumulative source gates. Production build and deployed behavior remain required.
