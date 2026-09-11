# Showcase Flow Repair — post S3

## Why this repair was required
S2/S3 replaced too much of the established network-selection experience. Showcase visibility is a product-discovery concern, not an authorization or membership concern.

## Invariants restored
1. Existing My Networks remains available to every authenticated user, independent of NX feature rollout.
2. Networks a user already belongs to are never hidden by Showcase Create/Playground visibility.
3. The original Setup / Network Selection experience remains intact.
4. Launch Control affects only Create and Playground discovery for a vertical.
5. Authenticated Playground Back returns to My Networks; unauthenticated sample users return to setup/selection.
6. Both selection contexts remain: My Networks lobby and Setup/Create/Join selection.

## UX fixes
- Restored original network selection window and existing-network list.
- My Networks topbar/mobile action is no longer NX-1 feature-gated.
- Family Playground Back returns to My Networks when signed in.
- Productized/Alumni Playground already use the My Networks lobby callback and remain preserved.
- Sign-in modal now has X close, backdrop close, and Escape close.
- Setup async actions display a blocking progress indicator.
- Product navigation, including Build Together, displays a progress indicator before a potentially expensive render.
- Mobile setup shows Choose how to start as a persistent bottom CTA while the first-step form is visible.

## Validation
- `npm run validate:showcase-flow-repair` — 9/9
- `npm run validate:showcase-s2` — 9/9
- `npm run validate:showcase-s3` — 12/12
- `npm run validate:fca0` — 27/27
- `npm run validate:hs5` — HS5 through HS0/FCA chain passed

No database migration is required for this repair.
