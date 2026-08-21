# P5 Active Plan — pick up here next session

## How to resume
1. Read `CODEBASE.md` first (full file map, migration chain, dev rules).
2. Read this file completely.
3. Pick the next OPEN item and implement it end-to-end before moving to the next.

---

## Completed

| Item | What was built |
|---|---|
| P5.0 Configurable entity types | `011_configurable_types.sql` + `lib/network.ts` + `SetupScreen` template picker + all UI labels dynamic |
| P4 Production hardening | `010_p4_production_hardening.sql` — IDOR, invitation, submission ownership, audit, first-admin race |
| Storage privacy fix | `012_private_storage.sql` — private buckets; `lib/storage.ts` — signed URLs (24h); `lib/remote.ts` — batch resolution at fetch time |
| P5.1a Shareable public page | `013_public_page.sql` — anon RPCs; `app/public/page.tsx` + `components/PublicPage.tsx`; Admin panel "Public Page" card with copy + preview |

---

## Next: P1b — Network Timeline View

**One-liner:** New "Timeline" view tab. Query all `member_life_events` with privacy masking. Render chronologically with year markers, person chips, event-type icons, and filters. No schema changes.

### Spec
- New view type `'timeline'` in `NetworkApp.tsx`
- New component `components/TimelineView.tsx`
- Data: use existing `repository.fetchLifeEvents()` — but currently it fetches per member (takes `member_id`). Need a version that fetches all events across all members.
- In `lib/remote.ts` add `fetchAllLifeEvents()` → calls `get_member_life_events` with `p_member_id = null`... wait, check if that RPC accepts null. If not, add a `get_all_life_events()` RPC in a new migration.
- Actually: look at migration 007 / 010 — `get_member_life_events(p_member_id uuid)` is required. Need either a new RPC or to check if passing null works. **Add `014_all_life_events.sql`** with `get_all_life_events()` RPC returning all visible events, granted to `authenticated`.

### TimelineView UI
- Sort events by `event_date` descending (most recent first)
- Group by year with a year marker row
- Each event card: person chip (avatar + name, clickable → opens profile), event type icon, title, date, location
- Filters: event type (birth, marriage, education, career, move, milestone, death, other), generation filter
- Show only events where `event.visibility !== 'admin'` for normal members (RPC already handles this)

### Nav
- Add `<button>` for "Timeline" in the sidebar nav and mobile bottom nav in `NetworkApp.tsx`
- Icon: `Calendar` from lucide-react

### State changes in NetworkApp
- Add `allLifeEvents` state: `useState<LifeEvent[]>([])`
- Load in `hydrate()` alongside existing data
- Refresh in `refresh()`

---

## P1c — Member Self-Edit

**One-liner:** Detect `auth.member_id` match, show inline edit button on own profile drawer. Configurable: direct save or ChangeRequest. Uses existing approval infrastructure.

### Spec
- In `ProfileDrawer.tsx`, already receives `canEdit` prop. Currently `canEdit = canAdmin || selected?.id === auth?.member_id`.
- The edit flow currently routes through `ProfileForm` → submission → admin approval.
- P1c makes this smarter: if the network has a setting `allow_direct_self_edit: boolean`, and the logged-in user is editing their own profile, bypass the approval queue and directly write to `family_members`.
- **Schema:** Add `allow_direct_self_edit boolean NOT NULL DEFAULT false` to `network_settings` in migration `014` (or a new `015`).
- **RPC:** Add `update_own_profile(...)` that checks `auth.uid()` has a `profiles.member_id` match, then updates `family_members` directly if `network_settings.allow_direct_self_edit = true`.
- **UI:** In `ProfileForm.tsx`, if `isOwnProfile && network.allow_direct_self_edit` → submit button label "Save Profile" (immediate) vs "Submit for Review".
- **Admin toggle:** Add a checkbox in the admin panel's network settings area: "Allow members to edit their own profile directly (no admin approval required)".

---

## P2a — Upcoming Milestones

**One-liner:** "Coming up" widget on home/tree view. Query life events within next 30 days. No new DB.

### Spec
- In `NetworkApp.tsx`, compute `upcomingMilestones` from `allLifeEvents` (once P1b lands):
  ```ts
  const upcomingMilestones = allLifeEvents.filter(e => {
    if (!e.event_date) return false;
    const d = new Date(e.event_date);
    // anniversary logic: replace year with current year, check if within 30 days
    const thisYear = new Date(new Date().getFullYear(), d.getMonth(), d.getDate());
    const diff = (thisYear.getTime() - Date.now()) / 86400000;
    return diff >= 0 && diff <= 30;
  });
  ```
- Show as a dismissible banner/widget at the top of the tree view if any upcoming events exist.
- Component: small `UpcomingWidget.tsx` — horizontal scrollable list of person chips with event type + date.

---

## P2b — Smart Suggestions

**One-liner:** Admin-facing suggestion engine. Runs on import and on demand. Surfaces unlinked siblings, probable duplicates, orphan nodes.

### Spec
- New file `lib/graph/suggestions.ts`
- Three detectors:
  1. **Probable duplicates** — pairs with same first name + similar last name + DOB within 2 years
  2. **Orphan nodes** — members with zero relationships
  3. **Unlinked siblings** — members sharing two common parents who are not linked as siblings (they're siblings by derivation but missing the explicit parent relationship for one)
- Surface in admin panel as an "Suggestions" card: run button → list of findings, each with "Dismiss" and a relevant action button (e.g., "Merge", "Add relationship")
- No schema changes needed.

---

## P2c — QR Profile Cards

**One-liner:** Per-member QR code pointing to `/public#{memberId}`. Printable card layout. Surface in ProfileDrawer and admin export.

### Spec
- Add `qrcode` npm package (lightweight, no deps).
- URL format: `{origin}/public#{memberId}` — public page already exists; add anchor scroll to the member card.
- In `ProfileDrawer.tsx`: add "QR Card" button that opens a modal showing the QR + member name + profession + generation. Print button triggers `window.print()` on that modal only.
- In admin export section: "Export QR Cards" button → generates a printable HTML page with all member QR cards in a grid.

---

## Later — Multi-network + Embed

Only after P1a public page is battle-tested. Requires:
- `network_id uuid` column on `family_members`, `family_relationships`, all related tables.
- Network selector dashboard at `/`.
- Current single-network deployment becomes one network instance.
- Embed: thin `<iframe src="/public">` wrapper with a `?embed=1` query param that hides the header.

---

## Ordered queue

```
✅ P5.0  Configurable entity types
✅ P4    Production hardening (storage, security)
✅ P5.1a Shareable public page
→  P1b  Network timeline view        ← START HERE
   P1c  Member self-edit
   P2a  Upcoming milestones
   P2b  Smart suggestions
   P2c  QR profile cards
   —    Multi-network + embed
```

---

## Before any deployment

Run on a staging Supabase project:
1. `npm install`
2. `npm run build` (must pass — previously unverified)
3. Apply migrations 001–013 on a clean DB
4. Verify RLS: test as anon, member, admin using real accounts
5. Verify `/public` route loads without sign-in
6. Verify profile photos are private (signed URL expires, direct public URL returns 403)
