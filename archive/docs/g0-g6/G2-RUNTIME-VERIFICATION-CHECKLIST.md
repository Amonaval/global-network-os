# G2 — Very Short Runtime Smoke Check

G2 is architecture-only. Do **not** run a full manual regression unless one of these checks fails.

1. **Open an existing Family** and open one profile / Me view. Normal Family navigation should look unchanged.
2. **Open Participation / Invite**: the invitation list and contribution prompts should load. If convenient, create one private invitation link; no new wording/workflow should appear.
3. If your account naturally shows **“We may have found you / This is me”**, claim it once and confirm it still enters the correct Family. Do not create special test data just for this check.
4. Reload once and glance at the console. There should be no identity-adapter, participation-adapter, missing-export, or `Unknown feature key` error.

**Supabase:** no G2 migration to apply. Your database should already be through migration `044_g1_3_feature_catalog_integrity.sql` from G1.3.
