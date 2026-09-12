# XP-0 Pre-Implementation Audit

## Exact existing lifecycle behavior
- **Family:** `leave_current_family()` removed membership, but for a sole-account/near-empty Family it silently changed the network to `archived`. Family Admin Center exposed permanent delete through the migration-089 neutral owner-delete RPC.
- **Productized verticals:** migration 080 exposed leave, archive and permanent delete. Leave rejected the sole owner. Archive marked `networks.status='archived'`, suspended active memberships and cleared active profile pointers. Permanent delete trusted `DELETE FROM networks` + FK cascade.
- **Alumni:** its admin UI exposed permanent delete, while the cross-network My Networks surface also offered creator deletion.
- **Restore:** no first-class shared restore RPC/UI existed.

## Database/storage deletion gaps
- Static migration history contains 104 tables with explicit `network_id` FKs. Most cascade from `networks(id)`; historical `family_creation_requests` and `guide_feedback` use `SET NULL`.
- FK cascade did not cover Supabase Storage. A5 storage enforcement establishes network-prefixed object ownership (`<network_uuid>/...`) for `profile-photos` and `community-media`.
- The old delete path had no post-delete residue proof and no future-proof audit across differently named FKs referencing `networks(id)`.

## Reusable Family/shared primitives
- Neutral `NetworkMembership` / active-network contracts and `get_my_networks()` context.
- Family Admin Center lifecycle/danger-zone UX pattern.
- My Networks cross-vertical ownership surface.
- Productized lifecycle RPC entry points from migration 080, retained as compatibility wrappers.
- Family mature guided import validation/construction patterns (`lib/validation.ts`, Family construction/intake adapters) and generic construction runtime; these are more directly relevant to XP-1.
- Existing network-prefixed Storage convention and quota/accounting triggers.

## XP-0 affected implementation
- New rerunnable migration 090 with archive-state snapshot, restore, neutral leave/archive/delete, metadata-driven FK residue scanner, explicit Storage purge and minimal purge receipts.
- Shared lifecycle client adapter expanded.
- My Networks adds Leave/Archive/Delete on active networks plus Archived/Restore/Delete Permanently.
- Family Admin Center changes danger zone from delete-only to Archive + Permanent Delete.
- Source gate + living docs + runtime checklist.

## Regression risks
- Manual tables that contain network ownership but no FK to `networks(id)` cannot be discovered automatically.
- Network-owned Storage using a path convention other than `<network_uuid>/...` must be explicitly added before certification.
- Pre-XP-0 archived networks lack a saved membership-status snapshot, so restore uses a compatibility fallback.
- Runtime/database/storage behavior remains pending until migration 090 is exercised in staging.
