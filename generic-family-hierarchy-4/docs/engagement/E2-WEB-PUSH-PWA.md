# E2 — PWA & Web Push Delivery

**Status:** IMPLEMENTED / SOURCE-GATED / ENVIRONMENT CONFIGURATION REQUIRED

## Product job
Allow TrustWeave to bring a user back even when the application is not open.

## Delivered
- Service-worker based PWA runtime.
- Explicit per-device push opt-in.
- Private push-subscription persistence.
- VAPID-based browser push delivery.
- Notification-click deep links back into TrustWeave.
- Dead/expired subscription cleanup.
- Push remains a delivery channel; the persisted in-app notification is authoritative.
- Notification preferences include push enablement, timezone and quiet-hour foundations.

## Core migration
`supabase/migrations/104_engagement_web_push.sql`

## Environment
Requires Web Push VAPID public/private configuration before browser delivery can be validated.

## Source gate
`scripts/engagement-e2-web-push-gate.mjs`
