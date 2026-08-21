# P5-S0 Verification

## Implemented

- Migration chain extended to `014_p5_s0_media_authorization.sql`.
- Both buckets remain private.
- Authenticated Storage SELECT now checks profile/memory visibility, uploader ownership, or admin role.
- Non-admin memory creation and profile submissions cannot reference another user's media path.
- Signed URL TTL reduced from 24 hours to 10 minutes.
- Legacy public Storage URLs remain resolvable while records are migrated to bare paths.

## Local verification

- Source/docs/migration dependency inspection: passed.
- `node validate-demo.mjs`: run as part of release verification when dependencies are available (script itself has no external service requirement).
- Clean `npm ci` / `npm run build`: attempted, but dependency extraction repeatedly failed in the current execution workspace because npm attempted to use an unavailable cache path. This is an environment failure, not a passing build.

## Required staging gate

Apply `001`--`014` to a fresh Supabase staging project, then verify:

| Actor | Expected profile media | Expected community media |
|---|---|---|
| Anonymous | No direct/private object read; `/public` still has no photos | No direct object read |
| Member | Own upload; approved public/member profile photos | Own upload; non-admin visible memories attached to visible profiles |
| Member with guessed path | Denied for admin-only/unapproved/other unreferenced objects | Denied for admin-only/hidden-profile/other unreferenced objects |
| Admin | All objects in both buckets | All objects in both buckets |
| Invited user before claim | Normal member visibility only | Normal member visibility only |
| Invited user after claim | Own upload/claimed visible profile plus normal member visibility | Own upload plus normal member visibility |

Also verify that a URL already signed before a visibility change expires within 10 minutes, and that minting a new URL after the change is denied.

## Release decision

Do not mark P5-S0 fully closed until clean build, fresh migration, upgrade migration, and the real-account matrix pass. Then begin P5.1 with the privacy-aware network timeline as the first end-to-end slice.
