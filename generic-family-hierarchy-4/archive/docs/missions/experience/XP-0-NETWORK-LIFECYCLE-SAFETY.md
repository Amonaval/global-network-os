# XP-0 — Network Lifecycle Safety

**Checkpoint:** source implemented / source validated / runtime verification pending.

## Existing behavior found before XP-0

- Family had `leave_current_family()`, including a special case where the sole owner of a tiny family could trigger an implicit archive by choosing Leave.
- Productized verticals had `leave_productized_network()`, `archive_productized_network()` and `delete_productized_network_permanently()` from migration 080.
- Migration 089 added a vertical-neutral owner permanent-delete RPC used by Family, Alumni and My Networks.
- Archive in 080 suspended active memberships and cleared active profile pointers, but had no first-class Restore Network path.
- Permanent deletion relied on deleting `public.networks` and trusting FK cascades.
- Supabase Storage was not part of that cascade. Existing media paths are network-prefixed (`<network_uuid>/...`) in `profile-photos` and `community-media`.

## Database / storage audit

Static migration-history audit found **104 tables declaring an explicit `network_id` FK**. Nearly all declare `ON DELETE CASCADE`; historical `family_creation_requests` and `guide_feedback` use `ON DELETE SET NULL`. This count is useful evidence but is deliberately **not** encoded as the purge contract because future verticals can add more network-owned tables or use differently named FK columns.

XP-0 therefore adds `xp0_network_residue_report(uuid)`, which discovers every single-column FK in `public` referencing `public.networks(id)` through PostgreSQL metadata and counts remaining rows after purge. It separately counts Storage objects whose first path segment is the network UUID.

## Implemented lifecycle contract

### Leave Network

`leave_owned_network(uuid)` removes only the caller's active membership. A sole owner cannot leave; they must add another owner, archive, or permanently delete. This removes the previous Family ambiguity where Leave could silently archive.

### Archive / Soft Delete

`archive_owned_network(uuid,text)` is owner-only and exact-name confirmed. It snapshots every membership's previous status, marks the network archived, suspends active memberships, and moves active profile context away from the archived network. No network-owned domain row or Storage object is deleted.

### Restore Network

`restore_owned_network(uuid)` is owner-only. It reactivates the network and restores membership statuses from the archive snapshot. A compatibility fallback restores suspended memberships for networks archived before XP-0 snapshotting existed. My Networks now has an **Archived networks** section with Restore and Permanent Delete actions.

### Permanent Hard Delete / Purge

`delete_owned_network_permanently(uuid,text)` now:

1. verifies authenticated Owner access (active or archived/suspended owner);
2. verifies exact network name;
3. explicitly deletes every Storage object with `<network_uuid>/...` ownership prefix;
4. detaches profile active-network pointers;
5. deletes `public.networks` so declared FK actions execute;
6. runs the metadata-driven relational + Storage residue verifier in the same transaction;
7. raises an exception if any residue remains, rolling the transaction back;
8. records a minimal platform purge receipt only after zero residue is established.

The old productized lifecycle RPC names remain as compatibility wrappers routed to the new primitives.

## Intentionally preserved after hard purge

`network_purge_receipts` is intentionally platform-owned rather than network-owned. It retains only: purged network UUID, actor UUID, timestamp, relational residue count, Storage residue count and verifier version. It stores no network name, content, membership list or domain data. This is the minimal evidence needed to prove that a purge completed with zero detected residue.

User account/auth identity and data belonging to other networks are also preserved by design.

## Reusable primitives

- Existing shared active-network/profile context and membership contracts.
- Existing Family Admin Center danger zone.
- Existing My Networks owner management surface.
- Existing productized vertical lifecycle entry points, retained through compatibility wrappers.
- Existing network-prefixed Storage ownership convention from A5 storage enforcement.

## Regression risks

- Deployed databases that contain undeclared/manual network-owned tables without an FK to `networks(id)` cannot be automatically discovered by the FK verifier. Runtime checklist includes a catalog audit for such tables.
- Storage objects not following the established `<network_uuid>/...` prefix cannot be attributed safely and therefore require explicit migration/documentation before production certification.
- Restoring an old pre-XP-0 archived network lacks a membership snapshot; compatibility fallback reactivates suspended memberships.
- Full Next/TypeScript certification remains environment-dependent; do not call XP-0 runtime certified until migration 090 and the runtime checklist pass against Supabase.
