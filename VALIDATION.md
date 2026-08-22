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
