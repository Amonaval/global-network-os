# Post-QA Technical Roadmap

Feature expansion is paused until runtime certification is healthy.

## Immediate after QA stabilization
1. Global Search + filters/saved views.
2. Notifications + Action/Needs-Attention Center.
3. Unified audit log for consequential mutations.
4. Bulk operations.
5. Duplicate detection + governed merge.
6. Entity lifecycle / recycle bin / undo delete.
7. Import history + rollback/lineage.
8. User-friendly error boundary + error IDs + observability.

## Platform maturity
- background jobs/retries/progress.
- notification delivery engine.
- media lifecycle/quota/orphan cleanup.
- performance/index/RLS query audit.
- logical restore from backup.
- disaster-recovery restore drills.
- stronger feature flags and contract versioning.

## Current limitations to keep visible
- Browser/E2E coverage is only beginning; existing source gates are not runtime proof.
- Full logical backup exists, but general one-click logical restore is not yet certified.
- Audit behavior is distributed rather than one universal event ledger.
- Duplicate identity resolution/merge is incomplete as a generic platform capability.
- Bulk admin operations are not consistently available.
- Global search/notifications/action center are missing basic usability primitives.
- Large-scale performance, job queues and notification delivery have not been production-certified.
