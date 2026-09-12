# E8 — Media Archive, Quota & Cleanup

## Outcome
E8 turns the E5 media registry into an explicit storage lifecycle. Media can be active, archived, pending deletion, or deleted. Archive is reversible; permanent deletion is deliberate and auditable.

## Safety model
- Normal feature feeds hydrate only `active` registered media.
- Archived media remains privately retrievable in Media & Storage but disappears from normal E5 media hydration.
- Linked media must be archived before permanent deletion, preventing one-click destruction of historical content.
- Deletion is two-step: authorize/request in PostgreSQL, delete the main object + thumbnail from private Supabase Storage, then finalize the registry tombstone.
- If physical Storage deletion fails, the registry returns to archived state rather than pretending the bytes are gone.
- Existing legacy remove helpers now preserve a deleted registry tombstone instead of erasing media history.
- No automatic deletion/cron job was introduced.

## Privacy
Archived media keeps the same tenant/privacy boundaries as active media. Complaint media continues to rely on the E4 raiser / assigned resolver / society-admin authorization. Deleted or delete-pending registered media no longer authorizes private Storage reads.

## UX
- Family: `Manage family → Storage` now includes the shared Media & Storage inventory.
- Family Community / Cultural Association: admin-only `Media & Storage` under More.
- Housing Society: admin-only `Media & Storage` under More.
- Storage meter shows used quota, allowance, archive count and unbound assets.
- Filters: All, Active, Archived, Unbound.
- Archive / Restore / Permanent delete actions are explicit.

## Migration
`supabase/migrations/110_engagement_media_lifecycle.sql`

## Validation
`npm run validate:engage-e8` chains E8 through E1–E7.
