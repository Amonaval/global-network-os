# XP-1 Runtime Closure Checklist

## Deployment
- [ ] Apply `090_xp0_network_lifecycle_safety.sql` if not already applied.
- [ ] Apply `091_xp01_runtime_closure.sql`.
- [ ] Set server-only `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Confirm the key is NOT exposed as `NEXT_PUBLIC_*`.
- [ ] Deploy/restart the Next.js server after adding the secret.

## Choose how to start matrix
For each vertical below, create a temporary network and verify the Basics screen is replaced by the choice screen after clicking **Choose how to start**.

- [ ] Housing Society
- [ ] Family Association
- [ ] Association / Community
- [ ] Organization
- [ ] Business Trust
- [ ] Franchise
- [ ] Professional
- [ ] Alumni

For each applicable vertical verify:
- [ ] Build together creates the network and opens an actionable admin/invite path.
- [ ] Excel creates the network and exposes the guided workbook importer.
- [ ] Start small creates the network without requiring import.
- [ ] Back from the choice step returns to editable basics.

## Workbook path
- [ ] Download workbook.
- [ ] Workbook opens without illegal sheet-name error.
- [ ] Upload the same generated workbook.
- [ ] Validation/preview appears.
- [ ] Confirm import persists expected records.

## Permanent delete
- [ ] Add at least one profile photo.
- [ ] Add at least one community-media object.
- [ ] Type exact network name and hard-delete as Owner.
- [ ] No `Direct deletion from storage tables is not allowed` error appears.
- [ ] Network disappears from active/archived lists.
- [ ] `profile-photos/<network-id>/...` has zero objects.
- [ ] `community-media/<network-id>/...` has zero objects.
- [ ] `xp0_network_residue_report(<network-id>)` reports clean/zero residue.
- [ ] Purge receipt reports zero relational and storage residue.
- [ ] Repeat against an archived network.
- [ ] Temporarily remove/invalid service key and verify hard-delete fails safely without relational deletion.
