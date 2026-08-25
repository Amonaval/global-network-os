# D1 Gate A — Staging and Production Closure

Do not run destructive reset commands against production. Use a separate Supabase staging project for the clean-chain test and a production clone/backup for upgrade rehearsal.

## A. Clean staging migration

1. Set staging environment values from `.env.example`; never expose a service-role key in Vercel or browser variables.
2. Apply `supabase/migrations/001_initial.sql` through `016_d1_production_participation.sql` in numeric order.
3. Apply `supabase/seed-demo.sql` only in staging.
4. Run `node scripts/d1-source-gate.mjs`, `node validate-demo.mjs`, `npx tsc --noEmit`, and `npm run build`.
5. Create four real staging accounts: admin, ordinary member, invited-unclaimed, and invited-claimed. Keep anonymous testing in a signed-out private window.

## B. Existing-instance upgrade sanity

1. Take a database backup or clone immediately before the rehearsal.
2. Confirm migrations `001`–`015` are already present and the app works before upgrade.
3. Apply only `016_d1_production_participation.sql`.
4. Confirm existing member/profile/relationship/memory/life-event counts are unchanged.
5. Confirm existing invitation acceptance still works, then test revoke and resend with new invitations.

## C. Required actor matrix

| Surface | Anonymous | Member | Admin | Invited user |
|---|---|---|---|---|
| Private hierarchy/RPC | Denied | Approved/redacted data | Full governed data | Normal member visibility |
| Profile/community storage | Denied | Own upload + visible referenced media | All | Before/after claim follows member rules |
| Public directory/deep link | Public profiles; no contacts/photos | Same public result | Same public result | Same public result |
| Invitation management | Denied | Denied | List/create/resend/revoke | Token preview, then own claim only |
| Contribution suggestions | Denied | Own linked profile only | All network prompts | Own prompts only after claim |
| Groups/events | Denied | Read + own RSVP | Create/manage + aggregates | Member access after authentication |
| Participation metrics | Denied | Denied | Aggregate dashboard | Denied |

Test guessed object paths, revoked/expired/reused tokens, claim of another already-linked member, non-public member deep links, manipulated suggestion IDs, manipulated RSVP user IDs, and direct table access in addition to the happy paths.

## D. Signed-media closure

1. Mint a signed profile and community-media URL as an allowed member.
2. Change the related record to admin-only or remove the reference.
3. Confirm a new URL cannot be minted.
4. Confirm the earlier URL expires within the configured 10-minute TTL.
5. Confirm anonymous direct reads and guessed authenticated paths fail.

## E. Vercel production smoke

1. Configure only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Deploy the exact verified ZIP/commit; check build logs and security headers on `/public`.
3. Smoke: sign-in, hierarchy, own profile, timeline, community, Participate, one invitation claim, one contribution, one QR scan, public deep link, embed, one RSVP, metrics refresh, and sign-out.
4. Watch Supabase auth/database/storage logs and Vercel function/browser errors during the first real invitation cohort.
5. Roll back the Vercel deployment if core navigation/auth fails. For database issues, stop invitations and restore/repair from the pre-migration backup; never reverse by deleting D1 tables blindly.

Gate A is closed only when every matrix row has dated evidence. Source implementation alone is not production-deployment evidence.
