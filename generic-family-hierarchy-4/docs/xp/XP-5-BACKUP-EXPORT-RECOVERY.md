# XP-5 — Backup / Export / Recovery

## Closure
Administrators can export a versioned `trustweave-network-backup` JSON snapshot and XLSX workbook. The database function discovers public tables carrying `network_id`, so new vertical-scoped tables enter the logical backup automatically. Access credentials/join codes and purge receipts are intentionally excluded. The server adds Supabase Storage object paths for `profile-photos` and `community-media` as a recovery manifest; media bytes are not embedded.

The export contains schema/version, timestamp, network metadata, vertical-aware table datasets, IDs/relationship references and restoration metadata. Full automatic restore is deliberately **not** claimed: provider identity/auth records and security credentials are non-portable. Supported user-facing re-import remains the XP-1 schema-registry workbook path; disaster/full restoration requires a controlled operator migration/recovery procedure.

## Certification
Source/contract closure. Apply migration 093, configure server service role for complete media manifests, then run the runtime checklist against a staging network before calling backup runtime-certified.
