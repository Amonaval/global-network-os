# XP-6 baseline repair hotfix

This patch repairs a working tree that applied XP-2 through XP-6 affected-file checkpoints on top of a pre-XP-1-runtime-closure baseline.

It restores the XP-1 runtime-closure contract required by all later missions:
- supported server-side Supabase Storage API hard purge;
- corrected two-argument `deleteProductizedNetworkPermanently(networkId, confirmName)` client contract;
- corrected rerunnable migration 090;
- migration 091 (`091_xp01_runtime_closure.sql`);
- lifecycle/purge endpoint and server service;
- runtime-closure validation gates.

Overlapping `SetupScreen.tsx`, `TemplateNetworkApp.tsx`, and `package.json` are taken from the reconstructed latest XP-6 checkpoint so applying this patch does not roll those files back to XP-1.

After applying, run migrations in order 090, 091, 092, 093, 094 as applicable to the target database, then run the project validation/build commands.
