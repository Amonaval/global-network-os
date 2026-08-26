# B0-C — Human-Friendly Family Experience

Status: **IMPLEMENTED IN SOURCE / REAL-USER VERIFY REQUIRED**

## Product goal
Make the first family experience understandable to a person who rarely uses apps, while preserving advanced capabilities underneath progressive disclosure.

## Delivered

### 1. Human-first invitation journey
The invitation screen no longer begins with account mechanics. It now follows:

1. Open private family invitation.
2. See the family name and matched family profile.
3. Answer **“Is this you?”**.
4. Only then create an account or sign in.
5. Successful claim opens with a reassuring welcome and directs the member into the Simple experience.

Invalid/expired invitations use family language and explain what to do next.
Slow invitation loading explicitly says that a slow connection may take a moment.

### 2. Calmer Simple member experience
Simple members remain focused on **Home · Family · Me**.

Additional refinements:
- top-bar account/admin clutter is suppressed for ordinary Simple members;
- adding relatives is not promoted as a primary action to Simple members;
- the Home screen shows one clear family action and, when available, one compact next-family-moment card;
- memory/activity grids remain progressively disclosed instead of crowding Simple Home.

### 3. User-controlled progressive complexity
Ordinary members can move between:
- **Simple — just the essentials**
- **More family — memories & moments**
- **Everything — all member features**

The choice persists through the existing secure `set_my_experience_level` RPC. Family admins still use the separate preview control; a normal member cannot gain admin capability through this setting.

### 4. Mobile and accessibility guardrails
- Minimum 44px interactive target for common mobile controls.
- Larger primary invitation actions and form controls.
- Mobile bottom navigation retained as the primary orientation mechanism.
- Simple mode retains labels, not icon-only primary navigation.
- Family-language labels are used in the newly introduced experience controls.
- More-sheet remains the location for language, Help, sign-out and progressive-experience controls.

### 5. Resilient states
- Human-readable invitation loading state.
- Friendly expired/revoked/invalid invitation guidance.
- Email-confirmation continuation guidance.
- Claim success state explains that nothing else must be configured immediately.
- Existing feature-gating/empty-state behavior remains intact.

## Intentionally not claimed complete
B0-C cannot be truthfully marked VERIFIED until tested with real non-technical users on real mobile devices.

Required acceptance evidence:
1. At least one 50+/60+ low-frequency app user can open an invitation, identify themselves, join and reach Family without coaching.
2. At least one non-technical 30–50 user can find a relative, open a profile and return Home without assistance.
3. Users understand Home / Family / Me without explanation.
4. Users can discover “More family” if interested but do not feel forced to use it.
5. Hindi/Marathi copy is reviewed by fluent family users rather than treated as machine-copy complete.
6. Verify 320–430px mobile widths, Android back behavior, iOS Safari, slow network and large-text/browser-zoom conditions.

## No database migration
B0-C reuses the B0-A experience-level schema and secure RPC. Migrations through `027_b0b_progressive_launch_system.sql` are sufficient.

## Next gate
Do **not** resume broad feature expansion simply because B0-C source work exists. First run the novice-user usability gate. Then use observed friction to prioritize C1/C2/C3 and any B0-C.1 usability corrections.
