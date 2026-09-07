# XP-0 Runtime Verification Checklist

Status: **pending user/staging runtime**.

- [ ] Apply migrations through `090_xp0_network_lifecycle_safety.sql` twice; second run succeeds.
- [ ] Owner + admin + member network: Member Leave changes only that membership to `left`; network and other members remain usable.
- [ ] Sole Owner Leave is rejected with the explicit owner-safety message.
- [ ] Multi-owner network: one Owner can Leave while another Owner remains.
- [ ] Archive as Owner: network status becomes `archived`; active memberships become suspended; all domain row counts remain unchanged; Storage objects remain unchanged.
- [ ] Archived network is absent from active `get_my_networks()` and visible in `get_my_archived_networks()` only to its Owner.
- [ ] Normal member cannot actively use archived network via stale UI/session context.
- [ ] Restore as Owner: network returns to `active`; membership statuses equal the pre-archive snapshot; data/media are intact.
- [ ] Non-owner cannot archive, restore or hard-delete.
- [ ] Wrong confirmation name rejects archive/delete.
- [ ] Hard-delete a seeded Family network containing members, relationships, invitations, activities, audit/history and both Storage buckets; transaction succeeds.
- [ ] Hard-delete a seeded Housing Society network containing HS-1→HS-6 records; transaction succeeds.
- [ ] Hard-delete at least one other productized vertical.
- [ ] `get_my_network_purge_receipt(network_uuid)` returns `clean=true`, relationalResidue `0`, storageResidue `0` for the actor.
- [ ] Direct SQL catalog query confirms no public FK row still references the purged `networks(id)` UUID.
- [ ] Direct Storage query confirms no object path begins `<purged-network-uuid>/`.
- [ ] Auth user/profile survives and another network owned by the same user remains intact.
- [ ] Attempt an injected failure before transaction commit and confirm the purge rolls back rather than leaving a partial relational/storage state.
- [ ] Audit any table containing network-like ownership columns but no FK to `public.networks(id)`; either add the FK or document/extend verifier handling.
- [ ] Audit any network-owned Storage convention not using first path segment `<network_uuid>`; migrate or explicitly extend purge handling.
- [ ] Run `npm run validate:xp0` in a fully installed repository.
- [ ] Run `npm run check:types` and `npm run build` with dependencies installed.
