# CR1 — Core Family Simplicity & Trust

Date: 2026-08-23
Status: **IMPLEMENTED IN SOURCE / DEVICE + SUPABASE VERIFICATION REQUIRED**

CR1 is the pre-family-launch simplification/trust batch. It does not mark adjacent privacy/recovery work complete merely because related UI exists.

## Implemented in CR1

### 1. Strict Personal Lineage
- New canonical `getStrictLineageIds(...)` helper.
- Includes the focused person, all direct ancestors, all direct descendants, and the focused person's spouse(s).
- Deliberately excludes siblings, cousins, cousins' spouses, uncles/aunts and side branches by default.
- Simple members entering **Family** default to their own Personal Lineage when their profile is linked; on mobile, all signed-in member experience levels default to their own lineage because the full graph is an explicit opt-in.
- **Full Tree** remains an explicit escape for broader exploration.

### 2. Mobile lineage-first family view
- When Personal Lineage is active on mobile, the XYFlow canvas is replaced by a simple tap-friendly lineage list grouped into:
  - Parents & ancestors
  - You & partner
  - Children & descendants
- Whole-family graph remains available through Full Tree.
- This avoids forcing novice mobile users to understand pan/zoom before they can understand their family.

### 3. Focus clarity
- Signed-in member gets a visible **You** marker.
- Focused person gets a distinct **Viewing** marker.
- Focused lineage edges are thicker/darker in graph mode.
- Profile → View in Family Tree enters Personal Lineage for that person.

### 4. Predictable profile navigation
- Profile-to-profile navigation keeps a small history stack.
- A visible **Back** action returns to the previous profile.
- Profile → tree preserves a **Back to profile** route.
- Relationship rows use labeled `View <first name>` controls rather than an unexplained arrow-only action.

### 5. Human relationship language
- Profile hero attempts to describe the selected person relative to the signed-in user's linked profile (`parent`, `child`, `spouse`, `grandparent`, `grandchild`, `sibling`, cousin/extended path fallback).
- Simple mode no longer foregrounds technical generation numbering in the profile hero/detail grid.

### 6. Member relationships are read-only in the UI
- A normal member may edit their own profile information, but **Manage Relationships** is no longer offered merely because they are editing themselves.
- Relationship management is a Family Owner/Admin action.
- Relationship exploration can remain visible separately when the advanced feature is released.

### 7. Foundational lineage deletion protection
Migration: `030_cr1_core_family_trust.sql`

- Parent/child lineage deletion is Family-Owner-only at the database trigger layer.
- Co-admins see `Protected · Family Owner only` rather than a destructive Remove button for parent/child relationships.
- Co-admins can still help manage less foundational data such as spouse connections under existing permissions.
- Existing audit logging remains in the delete path.

This is intentionally stricter than the old generic `is_admin()` delete permission.

### 8. Older-user readability option
- Mobile More menu includes **Larger text / Normal text size**.
- Preference persists locally on the device.
- Common content, navigation, buttons and helper text are enlarged without changing authorization or experience tier.

## Explicitly NOT complete in CR1

These are preserved as open work and must not be marked complete:

1. **Verified Contact Consent / API-level privacy — PARTIAL.** UI hides contact for ordinary users, but family-member row retrieval still contains underlying contact fields. True completion requires sanitized data access/RPC/view plus member verification/consent and audit.
2. **“Something is wrong?” governed submission — PARTIAL.** CR1 gives clear guidance and keeps members read-only, but does not yet provide a single simplified relationship-error submission flow backed by the governance queue.
3. **Owner lock/provenance per relationship — PARTIAL.** CR1 protects all parent/child deletes from co-admins. It does not yet record which relationship was explicitly locked/defined by an Owner or support Owner unlock/provenance metadata.
4. **Safe member/profile deletion/archive — OPEN.** Genealogy records need archive/recovery semantics before destructive cleanup can be considered complete.
5. **Real-device and real-user certification — OPEN.** Source implementation is not equivalent to novice usability evidence.
6. **Hindi/Marathi dynamic kinship wording — OPEN.** Static/new controls support the existing language structure, but generated relationship descriptions currently fall back to English.

## Verification gate

Run:

```bash
npm run validate:cr1
npm run build
```

After applying migration 030, verify with separate accounts:

1. Simple linked member taps Family → own direct lineage, no siblings/cousins.
2. Member can view relationships but never sees Manage Relationships.
3. Co-admin cannot remove a parent/child relation in UI or via direct delete/API.
4. Family Owner can remove a parent/child relation and audit entry remains.
5. View a relative → selected person is clear; View in Family Tree → highlighted direct lineage.
6. Navigate Person A → Person B → Back → Person A.
7. On 360/390/430px phone widths, Personal Lineage is readable without pan/zoom.
8. Larger text does not create horizontal overflow or hide primary controls.

## Completion rule

CR1 may only become **VERIFIED** after the source gate, production build, migration 030 behavior and real-device checks pass. The six explicitly open items above remain separately tracked even after CR1 verification.
