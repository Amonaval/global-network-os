# S1 Update Candidate — Family Access, Playground Showcase & Demo Data Hardening

Status: **IMPLEMENTED IN SOURCE / LIVE VERIFY**

This pass closes S1 discoverability and recovery failures found after S1-A/B/C implementation.

## Implemented
- Fixed local build regression: `State.memories` is now included in local `saveState` persistence.
- Family switcher and Sign out are no longer hidden by Simple experience.
- Family switcher now exposes **Create or join another family**, **Family lobby / choose fresh**, and **Leave this family**.
- Mobile More exposes **Create, join or switch family**, **Leave this family**, and Sign out.
- Setup/family-lobby screen now shows existing family memberships and has Sign out.
- Added a non-destructive **Family Lobby** state so a user can temporarily unlink from the active family and choose/create/join without leaving membership.
- Added guarded leave behavior: an empty/near-empty sole-owner family may be archived; a populated family cannot be orphaned by its only Owner.
- Added independent **Playground feature visibility** controls in Launch Control.
- Anonymous Playground now uses Explorer-level presentation and a Playground-specific feature map, independent of real-family rollout.
- Replaced the old 150-person filler seed with the richer 60-person / 5-generation showcase dataset used by Playground.
- Showcase seed includes 142 relationships, 57 life events, 12 memories, contribution prompts, connected groups, and reunion events.
- Added `sample-data-60.csv/.xlsx` compatibility assets.

## Behavior gate still required
Do not promote S1 to VERIFIED until deployed tests confirm:
1. Simple new user can always see Sign out and family selection.
2. Existing family owner can open Create/Join another family without losing current family.
3. Family Lobby shows existing memberships and allows returning to one.
4. Sole owner of a populated family cannot orphan it.
5. Sole owner of an empty starter family can intentionally leave/archive it.
6. Anonymous Playground shows all founder-enabled Playground features without authentication and writes nothing.
7. Launch Control Playground toggles do not change real-family rollout.
8. 360/390/430 mobile More exposes family switch/create/leave/logout without overflow.
9. Migration 036 applies cleanly after 035.
10. Demo/staging seed replaces the old filler family only when intentionally executed.

S2 remains gated until the S1 deployed behavior gate passes.
