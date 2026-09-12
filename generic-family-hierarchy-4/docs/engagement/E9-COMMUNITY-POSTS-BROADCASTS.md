# E9 — Community Posts & Important Broadcasts

## Purpose

E9 turns the existing shared activity engine into a stronger community engagement surface without introducing a second social-feed subsystem. It is designed for Family Community / Cultural Association and Residential Community, while remaining reusable by other productized verticals.

## What E9 adds

- member-created community posts
- optional compressed post photo through the E5 shared media pipeline
- normal / important / urgent importance levels
- admin-only notify-everyone broadcasts
- admin pin / unpin
- `@role` and named-member mention routing through E3
- likes using the existing activity reaction model
- comments using the existing activity comment model
- notification to the post author when another member comments
- persisted notification + Web Push handoff for broadcasts and comments
- exact-post deep linking through the E1 notification route
- deep-linked post highlighting
- MPF and Residential deterministic showcase examples

## Architecture decision

Posts are stored as `network_activities` with `activity_type = 'announcement'` and `metadata.content_kind = 'post'`.

This deliberately avoids creating a competing post/feed data model. Events, memories, announcements and posts continue to share the same activity infrastructure, while the Community UI gives posts a dedicated presentation.

## Governance

Any active network member may publish a normal post.

Only network administrators may:

- publish an Important or Urgent post
- enable Notify everyone
- pin or unpin a post

Those actions are audited where appropriate.

## Notifications

Notify-everyone broadcasts create one persisted notification per active member except the actor. The notification points to:

- the correct network
- the Community surface
- the exact activity/post ID

Comment notifications point the original post author to the same exact post.

Mentions are resolved by the E3 network-scoped mention/role-routing engine.

## Media

Post images use the E5 `post` media preset. The image is browser-reencoded/compressed, stored privately, registered in `network_media_assets`, and bound to the activity entity.

## Migration

Apply:

`supabase/migrations/111_engagement_community_posts_broadcasts.sql`

This migration is additive.

## Validation

Run:

```bash
npm run validate:engage-e9
```

Dedicated E9 source gate: 16/16 PASS at implementation closure.

## Preservation rule

E9 does not remove Notices, Events, Memories, Announcements or the existing activity hub. Posts are filtered into their own Community presentation so the same activity is not rendered twice.
