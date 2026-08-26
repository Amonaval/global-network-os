# P5 Roadmap — Family Network → Living Family Platform

> **Deferred technical reference:** Family Releases 1 and 2 in `ROADMAP.md` are
> the binding product priority. Preserve this plan, but do not start generic
> platform, second-vertical or SaaS work until real family usage has been reviewed
> and the founder explicitly reopens it. Privacy, integrity, performance and
> deployment blockers still apply to every family release.

## Product thesis

P4 establishes a trustworthy hierarchy, profiles, relationship intelligence, community memories, discovery and governance foundation.

P5 should not add another layer of filters. The major leap is to turn the hierarchy from a **database people browse** into a **living family/community platform people contribute to and return to**.

The architecture should remain simple for older/non-technical users:

- relationship-first
- invitation-driven
- visual
- photo/story-oriented
- mobile-first
- privacy-aware

AI should remain optional and should only be introduced where the underlying family knowledge model is mature enough to make it useful.

---

## P5.1 — Family Circles & Ownership

### Goal

Make contribution and privacy first-class concepts instead of treating the whole hierarchy as one shared space.

### User value

Families often contain branches, households and smaller trusted groups. People should be able to contribute safely without understanding technical permissions.

### Features

- Family branches / households
- Private circles
- Circle membership
- Circle-scoped memories and events
- Invite people into a circle
- Member-owned profile sections
- Simple contributor/moderator roles
- "My family" / "My branch" experience
- Privacy presets rather than complicated permission screens

### Architecture changes

- Introduce first-class `family_branch` / `circle` domain concepts.
- Move visibility decisions toward reusable authorization helpers.
- Extend repository boundary for scoped queries.
- Avoid arbitrary RBAC; keep a small capability model.

### Database changes

- circles
- circle_members
- branch metadata
- scoped ownership references
- circle-aware memories/events

### Security impact

High.

Authorization must be enforced by RPC/RLS and must not depend on React visibility.

### Dependencies

P4 hardening, especially storage/privacy and repository correctness.

### Risk

High if permissions become too complicated.

### Why now

P4 already has profiles, invitations, memories and governance. Circles turn these into a coherent contribution model.

---

## P5.2 — Family Life & Memories

### Goal

Create the reason people return to the application regularly.

### User value

The product becomes about the family's life, not only its structure.

### Features

- Family events
- Birthdays
- Anniversaries
- Reunions
- Milestones
- Shared stories
- Richer memory media
- Memory comments/reactions kept deliberately simple
- Event invitations
- Upcoming family activity
- Timeline views by person, branch and community
- Reminder notifications

### Architecture changes

- First-class event domain.
- Unified activity/notification model.
- Media metadata and lifecycle management.
- Better timeline query boundaries.

### Database changes

- events
- event_members
- event_invites
- reminders
- richer memory metadata/media

### Security impact

High.

Event attendance, private memories and media need explicit access policies.

### Dependencies

P5.1 circles/ownership and private Storage.

### Risk

Medium.

The product must avoid becoming a generic social network.

### Why now

P4 already contains life events, memories and notifications. P5.2 turns those isolated capabilities into a useful recurring experience.

---

## P5.3 — Family Knowledge & History

### Goal

Turn accumulated family data into something meaningful and explorable.

### User value

Instead of merely asking "Who is related to whom?", users can explore the story of their family.

### Features

- Historical family timeline
- Branch history
- Places the family has lived
- Family journeys
- Relationship-aware history views
- Important people/events
- Historical snapshots
- Genealogy-grade lineage exploration
- Story generation from verified structured data
- Search such as:
  - "Who lived in Pune?"
  - "Show my grandfather's descendants."
  - "Where did this branch move over time?"
  - "Which family members studied in the same city?"

### Architecture changes

- Dedicated graph/query service layer.
- Materialized relationship/lineage views where evidence shows they are needed.
- Event and geography indexing.
- Natural-language query layer should sit above deterministic family-domain queries rather than replace them.

### Database changes

- historical place records
- lineage/query projections
- timeline indexes
- provenance metadata for generated narratives

### Security impact

Very high.

Natural-language queries must inherit the same member/circle/profile visibility rules as normal queries.

### Dependencies

P5.1 + P5.2 and a mature privacy model.

### Risk

High.

AI must never invent family facts or bypass permissions.

### Why now

Once the network contains enough verified people, relationships, memories and events, the stored data becomes a valuable family knowledge base.

---

## P5.4 — Large Network & Mobile Experience

### Goal

Make the platform work naturally as the network grows from hundreds to thousands of people.

### User value

Users should be able to explore a large family without loading or understanding the entire graph.

### Features

- Focused graph windows
- Expand parent/child/spouse neighborhoods
- Progressive graph loading
- Branch navigation
- Search → open person → expand neighborhood
- Mobile-optimized profile/relationship exploration
- Installable PWA improvements
- Better offline read experience
- Background refresh

### Architecture changes

Move from:

```text
load entire network
      ↓
render entire graph
```

to:

```text
search / selected person
        ↓
server query
        ↓
focused graph window
        ↓
expand neighbors
        ↓
load more on demand
```

The existing repository boundary makes this a natural evolution rather than a complete rewrite.

### Database changes

- graph-neighborhood RPCs
- indexed relationship traversal
- search/count pagination
- branch/window query support

### Security impact

Medium/high.

Every neighborhood query must apply the same visibility rules as profile/search RPCs.

### Dependencies

P4.4 server discovery and P5 domain scoping.

### Risk

Medium/high.

Premature graph optimization should be avoided until measured at real network sizes.

### Why now

This is the point where P4's scale foundation becomes a real user-facing capability.

---

# Recommended P5 order

```text
P4 Production Hardening
        ↓
P5.1 Family Circles & Ownership
        ↓
P5.2 Family Life & Memories
        ↓
P5.3 Family Knowledge & History
        ↓
P5.4 Large Network & Mobile Experience
```

## What should NOT enter P5 immediately

- Generic enterprise RBAC
- Chat
- Social-feed mechanics
- Marketplace/mentorship modules
- Native mobile apps
- AI chatbot as a standalone feature
- Excessive profile fields
- Complex dashboards
- Dozens of notification types

## Highest-leverage architectural decisions

1. Make **ownership + circles** first-class.
2. Make **private media** first-class.
3. Make **events/memories** first-class family objects.
4. Keep authorization centralized in database/RPC boundaries.
5. Keep graph loading incremental.
6. Keep AI downstream of verified family data.

## P5 success definition

P5 should make a user feel:

> "This is where my family lives and remembers things."

rather than:

> "This is a better family-tree viewer."
