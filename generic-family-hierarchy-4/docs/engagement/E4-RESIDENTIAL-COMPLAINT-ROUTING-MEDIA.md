# E4 — Residential Complaint Routing & Complaint Media

**Status:** IMPLEMENTED / SOURCE-GATED

## Product job
Turn a complaint into a closed operational loop rather than another passive record.

## End-to-end loop
Resident raises complaint → optional compressed photo → complaint category resolves a responsible person/role → assignee is notified → notification opens the exact complaint → comments/status/resolution notify the resident.

## Delivered
- Complaint-category routing configuration.
- Responsibility-role integration from E3.
- Assignee-aware complaint visibility.
- Notification events for complaint creation, updates and comments.
- Exact complaint deep-link scrolling.
- Private complaint images using the existing compression/private-storage foundation.
- Signed image URLs rather than public storage URLs.
- Admin routing UI.

## Privacy rule
Complaint photos are not general society media. Read access remains limited to the complaint raiser, assigned resolver and authorized society administration.

## Core migration
`supabase/migrations/106_residential_complaint_routing_media.sql`

## Source gate
`scripts/engagement-e4-residential-complaints-gate.mjs`
