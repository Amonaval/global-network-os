# Showcase S0/S1 Hotfix — Runtime, Visibility Defaults & Palette Feedback

## Fixes

1. Fixed `ReferenceError: Sparkles is not defined` in `FounderLaunchConsole.tsx` by importing the icon actually rendered by the new Showcase section.
2. Corrected showcase defaults. Only these are visible for Create + Playground by default:
   - Family
   - Family Community / Cultural Association (`family-association`)
   - Residential Community / Housing Society (`housing-society`)
3. Alumni, generic Association, Organization, Business Trust, Franchise and Professional remain fully supported but default to hidden from Create + Playground.
4. Added migration `100_showcase_default_visibility_fix.sql` for databases where the earlier migration 099 was already applied. It updates only untouched seed rows (`updated_by is null`) so founder overrides are preserved.
5. Fresh installs are also corrected by updating migration 099 seed values.
6. SetupScreen now has showcase-safe fallback defaults even if the showcase RPC is unavailable, instead of treating missing settings as 'show everything'.
7. `Signature` is now a real visible palette for Family Community and Residential rather than inheriting legacy colors.
8. Launch Control palette selectors now include visible three-color swatches for Signature / Warm / Modern / Classic / Minimal.

## Database action

If migration 099 was already applied to the development Supabase project, apply **migration 100 only** now.

If starting from a fresh database, normal migration replay will apply corrected 099 followed by 100 safely.

## Expected verification

After applying migration 100 and refreshing/restarting the app:

- Launch Control > Network Types & Visual Identity should load without a Sparkles error.
- All verticals remain listed in Launch Control because this is the founder control panel.
- Public Create / Playground should show only Family, Family Community and Residential by default.
- Toggle Alumni / Professional / etc. ON in Launch Control and they should reappear without code changes.
- Switching MPF East or Residential palette should visibly alter its hero/background/accent treatment.

## Validation

- Changed TS/TSX files syntax-transpiled successfully.
- `npm run validate:fca0` — PASS (27 checks).
- `npm run validate:hs5` — PASS, including HS0 → HS5 chained gates.
- Full repository typecheck is not used as the acceptance gate here because the extracted working copy does not contain installed npm dependencies and the baseline also has unrelated QA typecheck blockers documented previously.
