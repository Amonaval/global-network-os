# A5 — 100 MB Family Storage Enforcement

Status: **IMPLEMENTED IN SOURCE — LIVE SUPABASE VERIFICATION PENDING**

## User outcome
Each family has a predictable Alpha media allowance: 100 MB total and 100 KB per image. The browser helps images fit; the database/storage boundary remains authoritative.

## Implemented
- Migration `023_a5_family_storage_enforcement.sql` adds atomic `networks.media_usage_bytes` accounting.
- Storage objects use tenant-first paths: `<network_id>/profiles/<user_id>/...` and `<network_id>/community/<user_id>/...`.
- Storage trigger locks the family row and rejects uploads that exceed the active family's quota or per-image cap, protecting direct API and concurrent uploads.
- Insert/update/delete storage events maintain the family usage counter.
- Existing A3 Admin Center reads the counter and shows near-limit/limit-reached guidance.
- Browser resize/compression attempts WebP conversion before upload; files still above the server-configured limit are rejected.
- Failed profile/memory saves remove the newly uploaded object; memory deletion removes its media; direct self-profile photo replacement removes the previous object.
- Existing legacy non-prefixed media remains readable for compatibility and is not silently reassigned to a tenant.

## Verification gate (user-run)
1. Run migrations `001–023` clean and upgrade an existing A4 database through `023`.
2. Confirm a normal <=100 KB upload succeeds and path begins with active `network_id`.
3. Direct Storage API upload >100 KB must fail.
4. Set a test family's quota low and confirm an upload crossing the quota fails.
5. Fire two concurrent uploads near the remaining quota; at most the amount within entitlement may commit.
6. Delete media and confirm `media_usage_bytes` falls.
7. Switch families and confirm media cannot be uploaded/read/deleted across family boundaries.
8. Confirm legacy A4 media still renders.

## Deliberate compatibility note
Governed profile submissions may retain an old replaced photo until the approval flow knows the replacement is committed. A later maintenance pass can add an authenticated orphan sweep through the Storage API; A5 already prevents failed uploads and ordinary direct replacements/deletions from accumulating orphan media.

## Next
A6 — Release 2 completion: Remember, Connect, Celebrate.
