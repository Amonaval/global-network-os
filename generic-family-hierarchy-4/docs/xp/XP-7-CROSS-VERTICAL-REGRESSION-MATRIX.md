# XP-7 Cross-Vertical Regression Matrix

The executable source of truth is `core/readiness/regression-matrix.ts`.

## Dimensions

### Released verticals (9)
Family; Alumni; Housing Society; Family Association; Association / Community; Organization; Business Trust; Franchise; Professional.

### Actor states (6)
Owner; Admin/co-admin; Member; Invited; Claimed; Anonymous/public.

### Lifecycle states (4)
Active; Archived; Restored; Hard-deleted.

Total generated matrix size: **9 × 6 × 4 = 216 cells**.

## Required interpretation

Not every actor/lifecycle cell represents a permitted interactive state. A valid regression result may be an intentional denial/redirect. The test records whether the product enforces the expected invariant, not whether every cell opens an application screen.

| Lifecycle | Owner | Admin | Member | Invited | Claimed | Anonymous |
|---|---|---|---|---|---|---|
| Active | Full owner operations | Allowed admin operations | Member experience | Invite acceptance only until joined | Member identity linked after valid claim | Public surface only where enabled |
| Archived | Restore/read owner recovery surface | No normal active use | No normal active use | Cannot activate into archived network | No normal active use | No active network exposure |
| Restored | Owner operations restored | Admin access according to preserved state | Member access according to preserved state | Normal invite rules resume | Claimed identity remains consistent | Public rules resume where enabled |
| Hard-deleted | Network absent; purge receipt only if platform-owned | Network absent | Network absent | Invite unusable | Network-owned claim data absent | Network absent |

Run this interpretation for all nine verticals and attach browser/database/storage evidence to the runtime checklist.
