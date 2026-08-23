# Family Release 2A — Lightweight Media Controls

Implemented now:
- Family Admin has an **Allow photo uploads** switch in Family settings / Living Network.
- Default is OFF after migration 018.
- Profile edit shows initials-avatar guidance when uploads are disabled.
- Memory creation remains story-first and hides/disables photo upload when family uploads are disabled.
- When enabled, profile and memory uploads are hard-limited in application code to 100 KB.
- Existing photos remain viewable; disabling uploads prevents new uploads rather than destructively deleting history.

Run `supabase/migrations/018_alpha_storage_controls.sql` after 017.

100 MB per-family total storage is a locked Alpha product rule but cannot be correctly enforced until Mission A1 introduces first-class `network_id` tenancy and Mission A5 adds per-network byte accounting. Do not implement a fake client-only quota.

Future: optional public social-profile links and selectable lightweight avatars/icons reduce the need for stored photos.
