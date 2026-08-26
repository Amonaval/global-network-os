# B0-A — Product Simplification Foundation

Status: **IMPLEMENTED / VERIFY**

## Why this mission exists

The application accumulated substantial capability from P3/P4/P5/D1/Family Releases/A1–A9. A family member should not have to understand that architecture. B0-A separates what the product *can do* from what a particular person *should see*.

## Implemented

### 1. Canonical capability registry

`lib/features.ts` is now the product-facing capability registry. Every major capability has a stable key, bundle, friendly label, minimum member experience and default founder rollout state.

### 2. Three member experiences + separate admin surface

- **Simple** — Home, Family, Me. Default for shared-family members.
- **Connected** — adds Memories when founder rollout allows it.
- **Explorer** — adds Find family, Family history, Places and Help family when released.
- **Family administration** is not a fourth member navigation mode. Owner/admin gets a separate **Manage family** surface.

Family admins/platform owner can preview Simple/Connected/Explorer without changing ordinary members.

### 3. Founder-controlled rollout architecture

Migration `026_b0a_progressive_experience_founder_flags.sql` adds:

- `platform_owners` — platform authority separate from family owner/admin.
- `platform_feature_flags` — canonical founder rollout state.
- `profiles.experience_level` — member complexity level.
- `is_platform_owner()`.
- `get_effective_platform_features()`.
- `set_platform_feature_rollout(...)` — secure backend primitive for B0-B Launch Console.
- `set_my_experience_level(...)`.

Rollout states: **Hidden → Test → Pilot → Released**.

Precedence is intentionally strict:

`founder rollout allows feature` **AND** `member experience allows feature` **AND** `role/permission allows operation`.

Family-level feature preferences will be inserted in B0-B/B0.4 and will be another restrictive layer; they will never override Founder OFF.

### 4. Safe launch defaults

Core family navigation and special days are `released`.

Existing advanced capabilities are seeded as `test`, so the platform owner can validate them while ordinary families get a calm first release. Family administration remains released but role-gated.

### 5. Role-aware navigation and terminology

Member navigation now uses family language instead of implementation language:

- Family Directory → Find family
- Timeline → Family history
- Places → Family places
- Participate → Help family / Help improve our family
- Family Settings/Administration → Manage family

Simple mobile navigation is intentionally **Home · Family · Me · More**.

### 6. Home/profile progressive disclosure

Family Home hides memory/contribution complexity unless those capabilities are allowed. Profile drawers keep advanced relationship/history/memory actions out of Simple mode while retaining the underlying implementation.

### 7. Historical preservation ledger

`B0-HISTORICAL-CAPABILITY-LEDGER.md` captures pre-A1 through A9 capability history and explicitly protects partial/deferred work from being lost when UI is simplified.

## Platform-owner bootstrap

Migration 026 assigns the first legacy `profiles.role='admin'` account as the initial platform owner. Verify that this is your account after migration.

If the installation has no legacy global admin, insert the intended account into `public.platform_owners` once from the Supabase SQL editor using its Auth user UUID. Do not expose a client-side “become founder” action.

## Validation

1. Apply migrations through **026**.
2. Sign in as a normal family member: primary navigation should be Home / Family / Me, with advanced test capabilities hidden.
3. Sign in as platform owner: admin area should show Manage family and the member-experience preview selector; Test capabilities remain available for founder validation.
4. Preview Simple: Home / Family / Me only as primary member areas.
5. Preview Connected: Memories appears if its founder rollout is Test/Released for the current user.
6. Preview Explorer: Find family, Family history, Family places and Help family appear if founder rollout permits them.
7. Verify a family admin who is **not** platform owner cannot call `set_platform_feature_rollout`.
8. Verify existing advanced features still work for the platform owner; B0-A hides them but does not remove them.

## Not claimed complete in B0-A

- Founder Launch Console UI — B0-B.
- Family-admin member feature controls — B0-B/B0.4.
- What's New / discovery lifecycle — B0-B.
- Radical invitation/first-use journey and full older-user accessibility pass — B0-C.
- A1–A9 partial follow-ups — remain open in the completeness audit.
