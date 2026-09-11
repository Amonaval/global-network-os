# S2 Apply Note

Base: `TRUSTWEAVE-S0-S1-HOTFIX-FULL.zip`

## Apply

Use the S2 full ZIP as the continuation baseline, or overlay the affected-files ZIP on the S0/S1 hotfix baseline.

No new SQL is required for S2. Ensure migrations 099 and 100 are already applied as appropriate.

## Important

Do not upload the showcase JSON files. They are bundled reference data, not import payloads.

## Quick validation

1. Sign in with a normal/non-owner account.
2. Open any Playground and choose **Back to network selection**.
3. Confirm only Launch-Control-enabled Playgrounds appear.
4. As owner, toggle Alumni Playground ON in Launch Control.
5. Refresh/reopen network selection: Alumni should appear.
6. Toggle it OFF: Alumni should disappear.
7. Confirm the login page explains Family, Community and Residential rather than only Family.
8. Open Create/Join: the primary cards should be Family, Community, Residential and Explore Playground.
