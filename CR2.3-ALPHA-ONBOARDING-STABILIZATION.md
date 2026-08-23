# CR2.3 — Alpha Onboarding Stabilization + Behaviour QA

Status: **IMPLEMENTED IN SOURCE / LIVE BEHAVIOUR VERIFY**

## Why this mission exists

CR2.2 made the Alpha entry experience much simpler, but a fresh creator could still receive `Administrator access is required` immediately after creating a family. That is a release-blocking journey failure: the database had created the family and owner membership, while the React closure still held the user's pre-family `member` auth state and later work could depend on legacy admin semantics.

## Source corrections

1. After `create_family()` returns, the exact returned family is explicitly activated.
2. Auth is re-read immediately so the creator's new `family_role=owner` is available before any admin-only hydration/import work.
3. The create path hydrates the new family with explicit admin scope instead of calling the generic refresh helper with stale pre-create auth.
4. The redundant immediate `save_network_settings()` call is removed from the family bootstrap path; `create_family()` already creates the settings row with the supplied name/description and standard family labels.
5. Bulk import authorization now accepts actual family Owner/Admin membership, not only `auth.role` from a potentially stale closure.
6. Audit telemetry is non-blocking after successful creation. A telemetry failure must never turn a created family into an onboarding failure.
7. Migration 034 hardens `current_network_id()` with an active-membership fallback and reasserts family-scoped legacy `is_admin()`/audit semantics.

## User-supplied UI corrections retained

- Special-days card: `padding: 10px` via the matching `.card.home-coming` selector.
- Profile drawer overlay: `z-index: 50`, so relationship/edit modals remain above the profile drawer.

## Mandatory behaviour QA

Do not mark CR2.3 verified from source checks alone. On the deployed Supabase/Vercel build, test with clean/fresh accounts:

### A. Anonymous critic user
1. Open the public URL in incognito.
2. `Try Playground · no login` is immediately visible.
3. Open Home → Family → a profile → Full Tree/My Lineage.
4. No Supabase write/auth error is shown.
5. Returning to Join/Create is obvious.

### B. Fresh creator — minimum input
1. Register a new non-platform-owner account.
2. Choose Create my family.
3. Enter only a family name.
4. Choose `Create now · add people later` or `Start with a few relatives`.
5. The family opens without `Administrator access is required` or `No active family selected`.
6. The same account is visibly Family Owner.
7. Add one relative through UI.
8. Logout/login; the same family opens automatically.

### C. Fresh creator — Excel/CSV
1. Use a new account.
2. Create a family and choose Excel/CSV.
3. Import names-only / partially-filled data.
4. Import succeeds even if optional fields and relationships are blank.
5. Owner can later open Import again without stale-admin rejection.

### D. Joiner
1. New account joins with Family Code or invitation.
2. User enters the intended family as Member, not Admin.
3. Member can browse relationships but cannot structurally edit them.

### E. Returning owner
1. Owner signs out and returns in a new browser session.
2. Active family and owner role resolve without manual family switching.
3. Admin actions work; member-only UI is not mistakenly shown.

## Completion rule

CR2.3 becomes **VERIFIED** only when A–E pass on the deployed environment. Any failure is a CR2.3.x first-impression correction and blocks V1 Alpha certification.

## S1 Batch 1 regression note — 2026-08-23

S1-A/B builds on CR2.3 without changing its verification status. The source now adds a temporary no-save Playground viewer, stronger personal-family entry and relationship-to-me UX. A cumulative check also found that `ImportModal` linked to `/sample-data-150.xlsx` while the file was missing under `public/`; the workbook is now packaged there. CR2.3 remains **IMPLEMENTED / LIVE VERIFY** until deployed fresh-user journeys pass.

## 2026-08-23 follow-on note — S1-C

S1-C adds Add Myself, close-relative creation, richer guided import and migration 035 profile-review closure on top of CR2.3. This **does not change CR2.3 status**.

CR2.3 remains **IMPLEMENTED IN SOURCE / LIVE BEHAVIOUR VERIFY REQUIRED** until the fresh deployed family-creation, join, import, returning Owner and Playground journeys are re-run against the latest cumulative schema including migration 035.
