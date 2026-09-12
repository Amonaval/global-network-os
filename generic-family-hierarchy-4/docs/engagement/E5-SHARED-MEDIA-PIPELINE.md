# E5 — Shared Media Pipeline

## Mission
Create one private, storage-efficient image pipeline for TrustWeave instead of separate upload implementations per vertical.

E5 preserves all existing business capabilities. It upgrades how images are prepared, stored, linked and rendered.

## What E5 adds

- One `network_media_assets` registry for profile, memory, event, announcement, complaint, post and future media.
- Browser-side resizing and WebP re-encoding before upload.
- A lightweight thumbnail generated beside every main image.
- Re-encoding strips EXIF/camera metadata rather than uploading the original file unchanged.
- Existing private `profile-photos` and `community-media` Supabase buckets are reused.
- Stable network/user-prefixed object paths.
- Signed private URLs for display.
- Entity binding so media can follow a member, memory, activity or complaint.
- Existing network storage quota/accounting remains authoritative.
- Family Community and Housing Society media are enabled at a 256 KB per-object ceiling; Family's existing per-network photo setting is deliberately left unchanged.

## Media targets

| Kind | Main max dimension | Main target | Thumbnail | Thumbnail target |
| --- | ---: | ---: | ---: | ---: |
| Profile / DP | 640 px | 128 KB | 160 px | 24 KB |
| Memory | 1600 px | 220 KB | 360 px | 42 KB |
| Event | 1600 px | 220 KB | 360 px | 42 KB |
| Announcement/Post | 1280 px | 180 KB | 320 px | 36 KB |
| Complaint | 1600 px | 240 KB | 360 px | 44 KB |

The active network's `photo_max_bytes` is still a hard upper bound, so older Family networks configured for 100 KB remain within that limit.

## Integrated surfaces

- Family member/profile photo.
- Family memories.
- Productized member profiles, including Family Community and Residential directory people.
- Shared Community activity engine: events, memories and announcements.
- Alumni shared activities.
- Residential complaint photos.

Activity/profile lists prefer thumbnails and use lazy image loading. Full image objects remain available for detail experiences.

## Privacy rules

- Media stays in private buckets.
- Registry queries are active-network scoped.
- Profile/event/memory/announcement media can be displayed to authorized active-network members.
- Complaint media is intentionally excluded from the broad registered-media read path. Existing complaint authorization remains: complaint raiser, assigned resolver, or network admin.
- Signed URLs are short-lived display credentials; raw storage URLs are not made public.

## E1 notification UI repair included

This release also repairs the E1 notification drawer regression reported during real testing:

- Drawer renders through a React portal into `document.body`, escaping transformed/stacked app shells.
- Backdrop uses a top-layer z-index (`2147483000`).
- Desktop drawer uses the full dynamic viewport height.
- Mobile uses a large bottom sheet (`92dvh`, minimum `70dvh`).
- Notification list owns its scroll region and no longer collapses to a small strip.
- Escape, close button and backdrop dismissal remain supported.

## Database

Apply after migration 106:

`supabase/migrations/107_shared_media_pipeline.sql`

It is additive. No E8 archive/cleanup lifecycle is included here; that remains a later mission.

## Validation

`npm run validate:engage-e5`

The E5 gate also executes the E4 → E1 dependency gate chain.
