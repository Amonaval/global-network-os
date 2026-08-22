# A6 — Release 2 Completion: Remember, Connect, Celebrate

Status: **IMPLEMENTED IN SOURCE / LIVE VERIFICATION PENDING**

## Delivered
- **On This Day** on the family home from privacy-visible life events.
- **Special days** now combine birthdays and marriage anniversaries, with mobile-friendly share actions suitable for WhatsApp/native sharing.
- **Memory story cards** have privacy-safe share copy and multi-relative attribution. A6 also closes the previously referenced-but-missing `memory_people` persistence/RPC foundation.
- **Gathering follow-through** adds attendee lists and post-event story capture linked to the gathering.
- **Printable reunion directory** provides a privacy-safe name/city/profession/generation summary with no phone/email.
- **Quiet updates** provide Off/Weekly/Monthly digest preferences plus separate special-day, memory and gathering controls.
- **Guided contribution feedback** explicitly confirms when a contribution improved the family network.
- Migration `024_a6_remember_connect_celebrate.sql` is tenant-scoped to the active family for preferences, memory people, event links and attendee reads.

## Verification gate
1. Apply migrations through `024` on a clean Supabase staging project and an upgraded existing instance.
2. Verify two-family isolation for notification preferences, memory people, event attendees and event-linked memories.
3. Verify member/admin permissions for memory links and attendee lists.
4. Test native Share on Android/iOS WhatsApp flows and clipboard fallback on desktop.
5. Print reunion directory on A4 and mobile browser Save-as-PDF.
6. Run real-device visual/usability pass before marking A6 VERIFIED/RELEASED.

## Exit intent
Relatives have genuine reasons to return between data-maintenance sessions: remember family history, celebrate upcoming days, participate in gatherings, share stories, and contribute small improvements without noisy notifications.

## Verification hotfix — migration 025
A6 verification exposed a pre-existing A3/A5 compatibility defect in `get_family_admin_summary()`: it referenced `member_invitations.status`, but invitation state is derived from `used_at`, `revoked_at`, and `expires_at`. Migration `025_fix_family_admin_invitation_status.sql` replaces that invalid reference with `public.invitation_status(...)` without changing invitation semantics.

### Fast visible validation
After applying migrations through `025` and refreshing the app:
- **Family Settings/Admin Center** opens without `column i.status does not exist` and shows member, claimed-profile, active-invitation, admin and storage metrics.
- **Home** shows the A6 **On This Day** section when a visible historical event matches today's month/day; upcoming special days include birthdays/anniversaries and expose Share actions.
- **Community / Gatherings** exposes attendee visibility and post-event story/memory capture for applicable events.
- **Memories** can attribute a story to multiple relatives and share privacy-safe story text.
- **Family/Community print flow** exposes the privacy-safe reunion directory (name/city/profession/generation only).
- **Quiet updates** exposes Off / Weekly / Monthly plus special-day, memories and gatherings preferences.
- Completing a guided contribution shows explicit positive family-network improvement feedback.

A6 should be marked VERIFIED only after these flows plus the two-family isolation checks in the verification gate pass on the deployed Supabase instance.
