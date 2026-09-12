# Stability Hotfix — Anonymous Sign-in + Association i18n

## Fixes

1. SetupScreen now exposes a Sign in CTA when Supabase is configured but the user is anonymous.
2. If Supabase is not configured, SetupScreen shows an explicit configuration warning instead of silently presenting local-only Family actions.
3. Added `FamilyCommunityTxt` to EN/HI/MR catalogs, fixing the AssociationHome typed-i18n build failure.

## Why the screenshot showed no Sign in

The dedicated anonymous sign-in landing in `NetworkApp.tsx` only renders when `isSupabaseConfigured === true` and no authenticated user exists. The screenshot showed SetupScreen with no account action, which is the local/offline branch. That means the running build evaluated `NEXT_PUBLIC_SUPABASE_URL` and/or `NEXT_PUBLIC_SUPABASE_ANON_KEY` as missing.

For Next.js these `NEXT_PUBLIC_*` values must be available to the build/dev process. After correcting `.env.local` / deployment variables, restart the dev server or rebuild the app.

## Verify

Configured cloud build, signed out:
- Dedicated TrustWeave sign-in landing should appear.
- If setup shell is reached while anonymous, Sign in is still visible in its top bar and auth-required callout.

Unconfigured build:
- Setup shell explicitly reports that cloud sign-in is not configured and names the two required variables.

Association build:
- `t("FamilyCommunityTxt")` is a valid typed token in EN/HI/MR.

## Regression

`npm run validate:showcase-flow-repair` => 9/9 PASS in this extracted baseline.
