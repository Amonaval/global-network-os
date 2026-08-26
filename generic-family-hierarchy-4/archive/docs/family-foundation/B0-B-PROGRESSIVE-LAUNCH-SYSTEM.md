# B0-B — Progressive Launch System

**Status:** IMPLEMENTED IN SOURCE / VERIFY ON SUPABASE + DEVICE  
**Date:** 2026-08-22  
**Depends on:** B0-A + migrations through `026`

## Product intent
Deployment and customer release are now separate decisions. The platform can contain advanced capability while each family sees only a deliberately staged subset.

## Delivered

### 1. Founder Launch Control
A new **Platform → Launch Control** surface is visible only to `platform_owners`.

Each capability can be moved through:
- **Hidden** — visible to nobody.
- **Test** — visible only to the platform owner for validation.
- **Pilot** — visible to the platform owner and explicitly selected pilot families.
- **Released** — eligible for all families.

Founder controls work at both bundle and individual-feature level.

### 2. Pilot-family targeting
The founder console lists active families with member counts. A selected family set can be used when moving one feature or an entire bundle to Pilot.

A Pilot rollout with no selected family is blocked in the UI.

### 3. Family-admin member feature controls
Family Admin Center now includes **Member features**.

Family Owner/Admin may hide member-facing capabilities for their own family, but cannot release anything. Admin-only capabilities are excluded from these switches.

Effective visibility remains:

`Founder rollout allows` AND `Family setting allows` AND `experience tier allows` AND `permission allows`.

Therefore **Founder OFF always wins**.

### 4. What's New / progressive discovery
Founder can explicitly announce a feature already in Pilot or Released state.

Each announcement increments a rollout version. Eligible users receive a single **New in your family** card with one explanation and one CTA. `Try it` or `Got it` records that announcement version as seen so the card does not permanently clutter the product.

### 5. Founder audit trail
Every launch-state, Pilot-target or announcement-version change is recorded in `platform_feature_rollout_audit` and shown in **Recent rollout activity** inside Launch Control.

### 6. Security model
- Founder console reads/writes through `security definer` RPCs guarded by `is_platform_owner()`.
- Family member controls use family-admin guarded RPCs.
- No direct client mutation policy is provided for platform launch tables.
- Family controls only narrow visibility; they cannot override founder state.

## Migration
Apply:

`027_b0b_progressive_launch_system.sql`

It adds:
- `network_feature_settings`
- `user_feature_discoveries`
- `platform_feature_rollout_audit`
- announcement versioning on `platform_feature_flags`
- founder console/list/audit RPCs
- bundle rollout RPC
- family feature-control RPCs
- announcement read/acknowledge RPCs
- updated effective-feature calculation

## Validation checklist
1. Sign in as platform owner and confirm **Platform → Launch Control** appears.
2. Sign in as a normal family Admin and confirm Launch Control does **not** appear.
3. Founder: move `remember.memories` to Hidden. Confirm it disappears for everyone.
4. Founder: move it to Test. Confirm only platform owner sees it.
5. Select one family and move it to Pilot. Confirm eligible members of only that family see it.
6. Move it to Released. Confirm eligible families can see it according to experience level.
7. Family Admin → Member features: turn Family memories OFF. Confirm members of that family lose it even while founder state remains Released.
8. Turn it back ON. Confirm founder/experience rules still apply.
9. Founder: Announce a Pilot/Released feature. Confirm an eligible member sees **New in your family** once.
10. Tap `Got it` or `Try it`; reload and confirm the same announcement version does not return.
11. Founder: verify Recent rollout activity records the state/target/announcement changes.
12. Verify family switching recalculates effective feature visibility for the newly active family.

## Verification note
Source-level integration was checked. A real Next build could not be completed in this environment because project dependencies are not installed and offline `npm ci` cannot fetch the missing cache entries. Do not mark VERIFIED until migration 027, production build and cross-role/device checks pass.

## Next
**B0-C — Human-Friendly Family Experience**: radical first visit, Simple Home/Family/Me refinement, family-language audit, larger touch targets, mobile/back-navigation safety, and older/non-technical usability gates.
