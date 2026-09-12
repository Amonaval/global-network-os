# TrustWeave Engagement E1 → E5 Verification Guide

Use this guide to apply and verify the engagement stack one checkpoint at a time.

## 0. Which path should I use?

### If E1–E4 are already applied and working

You only need to:

1. Replace code with the **E5 FULL** ZIP.
2. Apply migration `107_shared_media_pipeline.sql` to the same main Supabase project.
3. `npm install` if you have not already installed the E2 `web-push` dependency.
4. Restart the app and hard refresh.
5. Run the E5 verification section below.

The E1 notification drawer visual repair is included in E5.

### If starting from the pre-engagement stabilization baseline

Apply strictly in this order:

| Mission | Code checkpoint | Migration |
| --- | --- | --- |
| E1 | E1 Notification Core | `103_engagement_notification_core.sql` |
| E2 | E2 Web Push | `104_engagement_web_push.sql` |
| E3 | E3 Mentions + Role Routing | `105_engagement_mentions_role_routing.sql` |
| E4 | E4 Residential Complaints + Media | `106_residential_complaint_routing_media.sql` |
| E5 | E5 Shared Media | `107_shared_media_pipeline.sql` |

Apply a migration to the **main development Supabase project**, not the disposable QA database, then start that mission's code and verify before moving to the next checkpoint.

---

# E1 — Notification Core

## What should exist

- Notification bell in the normal authenticated shell.
- Persistent inbox.
- Unread count.
- Mark-all-read.
- Network-aware notifications.
- Notification click can activate the target network and open a deep-linked surface/item.

## Important E1 visual repair included in E5

The original E1 drawer could appear underneath app UI and its list could be very short. E5 repairs this.

### Desktop test

1. Sign in to any real network.
2. Click the bell.
3. Expected: drawer appears **above every normal app surface**, aligned to the right.
4. Expected: drawer occupies the full viewport height.
5. If many notifications exist, only the notification list scrolls; the header remains usable.
6. Press `Esc`, reopen it, then click outside the drawer. Both should close it.

### Mobile test

1. Open the same bell on a narrow/mobile viewport.
2. Expected: a large bottom sheet, roughly 92% of the dynamic viewport and never a tiny notification strip.
3. The list should scroll independently.
4. Bottom content must remain above the device safe area.

### Data sanity query

In Supabase SQL Editor:

```sql
select id, user_id, network_id, title, priority, read_at, created_at
from public.notifications
order by created_at desc
limit 25;
```

An empty result is valid before any workflow has generated notifications.

---

# E2 — PWA / Web Push

E2 is a **delivery channel**. The E1 in-app notification remains the source of truth.

## One-time local/deployment setup

After applying E2 code:

```bash
npm install
npx web-push generate-vapid-keys
```

Put the generated values in `.env.local` / deployment environment:

```env
NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY=<public key>
WEB_PUSH_VAPID_PRIVATE_KEY=<private key>
WEB_PUSH_VAPID_SUBJECT=mailto:<your email/domain contact>
SUPABASE_SERVICE_ROLE_KEY=<server-only Supabase service role key>
```

Never expose `WEB_PUSH_VAPID_PRIVATE_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to browser code.

Restart the Next.js server after changing environment variables.

## Verify

1. Use HTTPS or localhost. Web Push requires a secure context.
2. Open the notification drawer.
3. `Device notifications` should show **Enable** on a supported browser.
4. Click Enable and grant browser permission.
5. Reopen the drawer; it should show enabled/subscribed.
6. After E3/E4 generates a notification, verify an OS/browser notification arrives.
7. Click the OS notification; TrustWeave should open and route to its stored deep link.
8. Disable device notifications and verify the browser subscription is removed/deactivated.

For initial verification, desktop Chrome/Edge or Android Chrome is the simplest target. iOS Web Push should be tested as an installed Home Screen web app on supported iOS versions.

---

# E3 — Mentions + Responsibility Routing

Use two accounts for the cleanest test: **Admin/Owner A** and **Member B**.

## Configure routing

1. Login as A.
2. Open a Family Community or Residential network.
3. Open the network's Admin/Manage area.
4. Find **Responsibility routing**.
5. Assign B to one or more roles, for example President, Chairman, Treasurer, Facilities, Security or Complaint resolver depending on the vertical.

## Verify role mention

1. From another account/member, create a Community event/memory/announcement or workflow text containing a role mention such as `@President` or `@Chairman`.
2. Login as B.
3. B should have a new in-app notification.
4. If E2 is configured, B should also receive Web Push.
5. Clicking the notification should open the correct network/surface.

## Verify named mention

Use a supported member handle derived from their network identity/email name, for example `@amit`.

Expected: routing remains **inside the active network**. A President or member in another TrustWeave network must not be notified simply because the role/name matches.

---

# E4 — Residential Complaint Routing + Photo

Use three roles if possible:

- Resident R
- Resolver/Facilities F
- Society Admin/Chairman A

## Configure

1. A → Residential → Admin/Manage.
2. Assign F to a responsibility such as Facilities or Complaint resolver.
3. In **Complaint routing**, map a category such as Plumbing/Lift to that responsibility.

## Resident flow

1. R creates a complaint.
2. Add title + description + priority.
3. Attach JPG/PNG/WebP photo.
4. Optionally mention `@Chairman` or another role.
5. Submit.

Expected:

- Complaint appears immediately.
- F is assigned/routed where configured.
- F receives an E1 inbox notification and E2 push when enabled.
- Notification click opens Residential → Complaints and highlights/lands on the exact complaint.
- Complaint image renders through a private signed URL.

## Resolver flow

1. F opens the notification.
2. Add comment and/or change status.
3. Resolve the complaint.

Expected: R receives workflow updates back.

## Privacy test

Use another ordinary resident X who is neither raiser nor assigned resolver.

Expected: TrustWeave must not generate complaint-photo access for X. Complaint media remains restricted to raiser, assigned resolver and society admin according to the E4 policy.

---

# E5 — Shared Media Pipeline

Migration: `107_shared_media_pipeline.sql`.

E5 deliberately uses the existing private Storage buckets instead of introducing a third media store.

## 1. Profile/DP

Test at least one Family member and one productized-network person.

1. Upload a JPG/PNG/WebP portrait.
2. Save.
3. Reload the directory/profile.

Expected:

- Upload works without storing the original binary unchanged.
- Display uses a signed private URL.
- Directory cards can use the generated thumbnail.
- Replacing a registered profile photo removes the old registered object where the integration has replacement cleanup.

## 2. Family memory

1. Add a Family memory with a photo.
2. Reload Family memories.

Expected: memory renders a lightweight thumbnail first and remains private to the Family rules.

## 3. Community / MPF event or memory

1. Open Family Community → Community Life.
2. Create an event, memory or announcement.
3. Select `Photo (optional)`.
4. Publish.

Expected: thumbnail appears in the activity card and survives reload.

## 4. Alumni shared activity

If Alumni is enabled in Launch Control, repeat an event/memory photo test there. E5 uses the same activity media engine rather than a separate Alumni uploader.

## 5. Residential complaint regression

Repeat one E4 complaint photo after migration 107.

Expected: complaint privacy remains unchanged. E5 must not broaden complaint images to every network member.

## 6. Inspect media registry

Supabase SQL Editor:

```sql
select
  network_id,
  media_kind,
  entity_type,
  entity_id,
  bucket,
  object_path,
  thumbnail_path,
  round(bytes / 1024.0, 1) as main_kb,
  round(thumbnail_bytes / 1024.0, 1) as thumb_kb,
  width,
  height,
  created_at
from public.network_media_assets
order by created_at desc
limit 50;
```

Expected:

- Main path ends in `.webp`.
- Thumbnail path ends in `.webp` and contains `/thumbs/`.
- Event/memory/profile/complaint rows are bound to an entity where applicable.
- Stored main file is normally much smaller than the phone-camera original.

## 7. Storage accounting

```sql
select id, name, vertical_kind,
       media_usage_bytes,
       storage_limit_bytes,
       photo_upload_enabled,
       photo_max_bytes
from public.networks
where media_usage_bytes > 0
order by media_usage_bytes desc;
```

Expected: media usage includes both main images and thumbnails because the existing Storage accounting trigger remains authoritative.

For E5, existing Family Community and Housing Society networks are media-enabled with at least a 256 KB per-object ceiling. Family's existing per-network setting is intentionally not overridden.

## 8. Quality/storage expectations

Approximate E5 targets before the active network hard limit is applied:

- DP/profile: 128 KB, 640 px.
- Event/memory: 220 KB, 1600 px.
- Announcement/post: 180 KB, 1280 px.
- Complaint: 240 KB, 1600 px.
- Thumbnail: about 24–44 KB depending on kind.

Every image is re-encoded to WebP. This is also how EXIF/camera metadata is removed.

---

# Source validation commands

Run after E5:

```bash
npm run validate:engage-e5
```

This executes the E5 source gate and then E4 → E3 → E2 → E1 gates.

For the broader showcase regression later:

```bash
npm run validate:showcase-stabilization
npm run validate:showcase-s3
```

Use the existing headed Playwright workflow when you are ready for browser certification rather than treating source gates as a substitute for real UI testing.

---

# Troubleshooting checkpoints

## Notification bell opens but drawer is hidden/short

You are not on the E5 code baseline or stale CSS/JS is cached. Confirm:

- `NotificationCenter.tsx` uses `createPortal(..., document.body)`.
- `.notification-drawer-backdrop` has the E5 top-layer z-index.
- Hard refresh / restart Next.js.

## Push says Web Push is not configured

Check all VAPID variables and restart the server. Public and private VAPID keys must be from the same generated pair.

## Push works in-app but not outside app

Check browser permission, service-worker registration, secure context and push subscription. The in-app notification can succeed even if the push delivery channel is unavailable.

## Photo upload says disabled

Check the active network's `photo_upload_enabled`. Migration 107 enables this for Family Community and Housing Society, but deliberately preserves existing Family-specific settings.

## Photo exceeds the network limit

The browser compressor attempts multiple WebP quality/size passes, but the database still enforces `photo_max_bytes`. A very complex image can require a smaller source or a higher explicitly configured network ceiling.

## Media row exists but image does not render

Check that the active network is correct, the object still exists in the private bucket, and the media entity binding points to the correct entity ID.

---

# Safe checkpoint/rollback principle

Each mission ZIP is cumulative. If E4 passed but E5 has an environment-specific issue, restore the E4 FULL code checkpoint while investigating. The engagement migrations are additive; do not casually drop tables/functions to "rollback" a code issue. Prefer moving code back to the last known-good checkpoint and reconcile the additive database state deliberately.
