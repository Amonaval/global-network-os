# Mission 4 — Runtime Regression Hotfix

Post-Mission-4 manual regression found three runtime/legacy issues.

1. **Alumni Connect** now gives an actionable path when the signed-in user has not completed or claimed an Alumni profile, and uses busy state while connecting.
2. **Quiet Digest preferences** are no longer fetched from surfaces where the feature is disabled.
3. **Bulk family invitations**: migration `055` fixes the PL/pgSQL `member_id` ambiguity by qualifying invitation-table columns. The same migration hardens notification preference lookup with explicit aliases.

## Runtime retest
1. Apply migration `055_m4_runtime_regression_hotfix.sql`.
2. Alumni: click Connect both before and after owning/claiming an Alumni profile.
3. Family Community: verify no unexpected notification-preference 400; open Quiet Digest preferences and save.
4. Family Admin → Invite members in a batch: create one or more links; verify no ambiguous `member_id` error.
5. Run `npm run validate:m4` and `npm run build`.
