# P3 validation checklist

## Fresh local installation
1. Remove old localStorage if testing an older build.
2. Start the app.
3. Confirm the setup screen appears.
4. Confirm no demo/random data appears automatically.
5. Enter a network name and choose Start Empty.
6. Confirm the header uses that exact network name.
7. Import a CSV containing non-UUID IDs such as `s1787065934735` and parent/spouse references to those IDs.
8. Confirm import succeeds and relationships render.
9. Confirm browser storage contains generated UUIDs, not `s178...` IDs as database IDs.

## Shared Supabase
1. Run migrations 001 → 004 in Supabase SQL Editor.
2. Create the first user.
3. Confirm the first user is `admin`.
4. Sign in.
5. Confirm setup screen appears if `network_settings` is empty.
6. Choose Empty, Demo, or Import.
7. Confirm all members and relationships are shared from Supabase.
8. Open a second browser/session and verify the same data is visible.
9. Test profile submission and admin approval.
10. Test relationship add/remove.

## Production
```bash
npm install
npm run build
```
Then deploy to Vercel and configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Production, Preview and Development as required.

# P4.1 validation checklist

## Integrity
1. Load the fixed 150-member demo.
2. Confirm Administration → Data Integrity reports zero blocking errors.
3. Confirm the three existing mixed-generation spouse records appear only as warnings.
4. Try adding a member as their own parent; it must be rejected.
5. Try adding a parent relationship that reverses an existing ancestry path; it must be rejected.
6. Try adding a duplicate spouse in the opposite direction; it must be rejected/merged by database uniqueness.

## Import validation
1. Import a file with a missing name; import must be blocked.
2. Import a duplicate source ID; import must be blocked.
3. Import a source ID that collides with an existing UUID but a different person; import must be blocked.
4. Import a possible duplicate name + DOB; import should show a warning, not silently create a merge.
5. Import an existing relationship; import should warn that it will be upserted, not delete anything.
6. Import a parent/child cycle; import must be blocked before writes.

## Privacy
1. Sign in as a normal member.
2. Confirm the application can show the hierarchy but phone/email are unavailable.
3. In Supabase, verify direct `select` access to `family_members` from the browser authenticated role is revoked.
4. Confirm `get_visible_family_members()` returns null phone/email for a member.
5. Sign in as admin and confirm phone/email are available in the profile drawer.

## Governance
1. Submit a profile.
2. Confirm one profile submission and one pending change request are created.
3. Confirm an audit event is created.
4. Approve/reject the submission and confirm the linked change request moves to the same status.
5. Confirm Administration shows recent change requests and audit events.

## Build
Run locally with dependencies installed:

```bash
npm install
npm run build
```

The current source review environment did not have project dependencies installed; `npm install` exceeded the available execution window, so a full Next.js production build could not be completed here.

# V1 Family Alpha release certification

Use `V1-FAMILY-ALPHA-RELEASE-CERTIFICATION.md` as the binding release gate.

Local source sanity:

```bash
npm run validate:v1
```

Before the first real-family pilot, additionally verify in the deployed Supabase/Vercel environment:

1. migrations `001 → 028` on a clean database;
2. existing database upgrade through 028;
3. signup → confirmation/resend → sign in;
4. forgot password → email reset link → new password → sign in;
5. invitation → identity confirmation → claim → Simple Home/Family/Me;
6. Member vs Family Admin vs Platform Owner permission matrix;
7. multiple Launch Control owners by email and final-owner protection;
8. Hidden/Test/Pilot/Released behavior across at least two families;
9. cross-family RLS/private-media isolation;
10. Android/iOS + narrow-screen + slow-network core journey;
11. real novice-user no-coaching gate.

## S1-C cumulative validation — 2026-08-23

Source gates passed on the cumulative S1-A/B + S1-C baseline:
- `validate:s1-ab` 13/13
- `validate:cr1` 12/12
- `validate:cr2` 10/10
- `validate:cr2.1` 9/9
- `validate:cr2.2` 10/10
- `validate:cr2.3` 12/12
- `validate:v1` PASS
- `validate:d1` PASS (35 migrations)
- `validate:s1-c` 18/18

Changed TypeScript/TSX files also pass TypeScript `transpileModule` syntax parsing.

Full `tsc --noEmit` / `next build` remains unverified in this environment because dependency restoration timed out and required type packages were unavailable. Do not treat source/syntax gates as production certification.

## S1 Update Candidate validation
- `node scripts/s1-hardening-source-gate.mjs` → 21/21 PASS.
- `node validate-demo.mjs` → 60 members / 142 relationships / generations 1–5 PASS.
- Changed TS/TSX files pass TypeScript `transpileModule` syntax diagnostics.
- Full `npm run build` is still environment-blocked here because dependency restoration timed out and local `node_modules/.bin/next` is absent. The original reported `State.memories` type mismatch itself is fixed in source.
- Deployed behavior verification remains required before S1 can be marked VERIFIED.

## S1-D interaction/privacy validation — 2026-08-23

Source gate: `npm run validate:s1-d` → **17/17 PASS**.

Live verification required:
- open each ordinary popup and activate only the backdrop; verify it closes without saving;
- interact inside each popup; verify it remains open;
- verify blocking sign-in/password recovery is not accidentally dismissible into an unusable state;
- as Family Owner/admin, compare Public visitor / Family member / Family admin profile privacy previews using records with different profile/contact/event/memory visibility;
- verify a normal member cannot access the admin-only preview selector;
- repeat modal and preview checks at 360/390/430 widths.

S1 remains LIVE VERIFY; this source gate does not replace deployed behaviour QA.

## S2-A validation — 2026-08-23

Run `npm run validate:s2-a` after migration 037 is present. Live verify: Family Pulse relevance, memory reaction add/change/remove, Playground reaction no-save behavior, memory sharing, contribution completion tracking, admin 30-day Living Loop scorecard, tenant isolation, and mobile Home/memory behavior at 360/390/430px.

## S2-B residual live validation
Run migration 038, create/link at least two test families under one city community, approve the links, opt in one profile in each family, and prove cross-family search returns only the published snapshot. Verify direct family profile/tree/contact access remains denied. Test marriage consent guard, unpublish, service post, Platform Owner highlighting, and 360/390/430 mobile behavior.

## S2-C validation
Source gate: `node scripts/s2-c-source-gate.mjs` → **16/16 PASS**.

Still requires deployed multi-family behavior testing after migration 039:
1. Family A requests trust with Family B; only B Owner/admin can approve.
2. Accepted A↔B edge creates a one-hop path; declined/revoked edge does not.
3. With accepted B↔C, Family A gets A→B→C and no invented person-level relation wording.
4. Normal member cannot create/revoke family trust edges.
5. Introduction request persists against an opt-in community card; target owner can accept/decline and requester can cancel while pending.
6. Private phone/email/tree data remain unavailable across families.
7. Playground demonstrates paths and introduction lifecycle without writes.
8. 360/390/430 mobile tabs, path badges, trust actions and introduction modal remain usable.

## S2-D validation
Source gate: `npm run validate:s2-d`.

Live verify must cover: digest content after real family changes, category preferences, weekly/monthly/off semantics, 360/390/430px expansion, native share + clipboard fallback, no Playground writes, introduction privacy, and Family Owner digest-return metrics. External scheduled delivery is not certified by the S2-D source gate.
