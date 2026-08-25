# A4 — Lightweight Identity & Social Links

Status: IMPLEMENTED IN SOURCE — live Supabase verification remains user-run.

## User outcome
Profiles can be visually recognizable without requiring image storage, and members can optionally share external social/profile links without Family Network copying social media photos.

## Implemented
- Six storage-free avatar choices: initials, leaf, sun, sparkles, heart, person.
- Avatar choice is shown in profile editing, private profile view, public directory and public profile.
- Optional Facebook, Instagram and one labelled external profile/website URL.
- Independent **Show on public profile** opt-in for every link; default is private/off.
- HTTPS-only URL validation in both UI and database; Facebook/Instagram host validation.
- External links open in a new tab with `noopener noreferrer nofollow`.
- UI explicitly states social links are user-provided and are not identity verification.
- No social image fetching, proxying, caching or copying.
- Existing uploaded profile photo remains preferred when present; lightweight avatar is the fallback.
- Governed profile submissions and safe own-profile editing carry A4 fields.
- Public RPC returns only links individually opted into public display.

## Database
Migration: `022_a4_lightweight_identity_social_links.sql` after `021`.

## Verification checklist
1. Run migration 022.
2. Edit a claimed profile and select each avatar style; save and reload.
3. Add valid Facebook/Instagram/other HTTPS links and confirm invalid/non-HTTPS links are rejected.
4. Leave public toggles off and confirm links do not appear while signed out.
5. Enable one link, make the profile public, and confirm only that link appears publicly.
6. Confirm external link opens safely in a new tab.
7. Confirm no social photo/media is created in Supabase Storage.
8. Confirm existing profile-photo, profile edit/review, directory/tree and invitation/claim flows still work.

## Exit condition
A useful profile is visually distinct while consuming essentially no media storage, and external social links are privacy-explicit and never treated as verification.
