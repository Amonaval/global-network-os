# Showcase Network Registry & Approval

## Behavior
- Migration 101 sets platform network creation to auto-approve by default.
- Family and productized verticals now use the same post-create approval registration path.
- Auto-approved networks navigate immediately after creation.
- Manual mode creates the network as pending, clears the creator's active network, and keeps it out of normal My Networks until approved.
- Platform owners get a generic Network Registry & Approvals section in Launch Control, grouped by vertical.
- Existing legacy Family-only requests remain visible only when old pending records exist.

## Apply
Run `supabase/migrations/101_platform_network_registry_approval.sql` on the main development Supabase project before validating this build.

## Validation
1. Keep Auto-approve ON.
2. Sign in with a non-platform-owner account and create Family, Community, or Residential.
3. Creation must navigate into the new network immediately.
4. As platform owner, Launch Control -> Network Registry & Approvals must list the network under its vertical with status `approved`.
5. Switch Manual approval ON, then create another network with the non-owner account.
6. Creator must be returned to the network lobby and see the pending message; the new network should not appear in normal My Networks yet.
7. Owner approves it in Network Registry & Approvals.
8. Refresh the creator account; the network now appears in My Networks and can be opened.
