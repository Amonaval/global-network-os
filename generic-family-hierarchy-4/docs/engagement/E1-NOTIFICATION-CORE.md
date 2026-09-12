# E1 — Notification Core, Inbox & Deep Links

**Status:** IMPLEMENTED / SOURCE-GATED

## Product job
Make important activity come to the user instead of requiring the user to remember to open every network.

## Delivered
- One persisted, cross-vertical notification source of truth.
- Network-scoped notifications with recipient membership checks.
- Priority levels: low, normal, high and urgent.
- Actor, entity type, entity id and metadata context.
- Cross-network inbox and unread count.
- Mark-read and mark-all-read flows.
- Deep-link contract: network + surface + item.
- Membership re-check when reading or opening a notification.
- Shared notification bell across Family and productized verticals.
- Notification drawer moved to a body-level portal during E5 hardening so app-shell stacking contexts cannot hide it.

## Core migration
`supabase/migrations/103_engagement_notification_core.sql`

## Source gate
`scripts/engagement-e1-notification-core-gate.mjs`

## Design rule
A notification never grants access. It only points to something the current user is already authorized to read.
