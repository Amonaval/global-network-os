# TrustWeave — Network Activation + Launch Control Repair

## Why this repair exists
A non-owner user could successfully create an approved network, see it in the platform-owner registry, and still remain on the setup screen. The same account could also see an empty My Networks view.

The critical failure mode was an account-level `profiles` row gap:
- network creation RPCs insert the network and creator membership;
- historical activation code only `UPDATE`s `profiles.active_network_id`;
- if that user's profile row is missing, the update affects zero rows without error;
- the migration-101 `get_my_networks()` implementation also inner-joined `profiles`, so valid memberships were hidden;
- the client then hydrated with no active network and still showed “network is ready”.

Migration 101 also allowed the server create service to silently ignore registry/finalization errors, which made a partial success look complete.

## Migration 102 fixes
`supabase/migrations/102_network_creation_activation_repair.sql`

1. Backfills missing `profiles` rows from `auth.users`.
2. Repairs genuinely orphaned creator memberships without overwriting intentional historical role transfers.
3. Adds `finalize_network_creation(network_id, previous_network_id)`.
4. Creation is successful only after creator profile + membership + approval state are consistent.
5. Auto-approved creation persists the new network as active immediately.
6. Manual-approval creation restores the previous active network instead of dropping the user into limbo.
7. `get_my_networks()` is membership-driven and LEFT JOINs `profiles`.
8. `set_active_network()` upserts a missing profile and verifies persistence.
9. Approval self-heals a missing creator membership.

## Application changes
- Family and productized creation use the strict finalization contract through the server API.
- Alumni creation now also uses the same finalization contract.
- Client activation is verified before showing “ready”.
- A failed activation now surfaces an error instead of pretending navigation succeeded.
- Family creation explicitly exits the My Networks/setup state after successful activation.

## Launch Control organization
Launch Control is separated into four owner workspaces:

### Networks & Approvals
- summary counts
- global Auto-approve / Manual approval policy
- vertical tabs for every network type
- status filter
- tabular registry: Network / Creator / Created / Members / Status / Actions

### Showcase
- Create visibility
- Playground visibility
- Featured state
- vertical brand palette
- Playground feature visibility for the selected vertical

### Feature Rollout
- selected vertical
- pilot targets
- bundle/feature Hidden/Test/Pilot/Released controls
- rollout history

### Governance
- platform owners
- guide feedback
- legacy Family creation requests kept only for backward compatibility

## Important semantics
- Showcase visibility NEVER hides a network that a user already belongs to.
- Approval policy NEVER replaces membership authorization.
- Registry is platform inventory; My Networks is the signed-in user's memberships.
- Auto-approval remains ON by default.

## Apply
If migration 101 was already applied, run **102 only**.
Then deploy this code baseline and hard-refresh/re-login the affected non-owner account.

## Validation
- Network approval/activation source gate: 15/15 PASS
- Showcase flow repair: 9/9 PASS
- Showcase S3: 12/12 PASS
- FCA-0: 27/27 PASS
- Housing HS0: 24/24 PASS
- Housing HS1: 27/27 PASS
- Housing HS2: 26/26 PASS
- Housing HS3: 28/28 PASS
- Housing HS4: 28/28 PASS
- Housing HS5: 28/28 PASS

Repository-wide `tsc --noEmit` remains blocked by the pre-existing syntax errors in `qa/e2e/19-phase4b-data-integrity-recovery.spec.ts`. Changed TS/TSX files were syntax-checked independently using the TypeScript parser/transpiler.
