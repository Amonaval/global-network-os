# QA Free-Tier POC v5

Fixes the POC browser login path without adding extra Supabase auth calls:
- opens the app's Join/Sign in dialog before filling credentials
- adds stable QA auth test IDs
- fixes AuthPanel password field mode comparison to use internal mode keys rather than translated display strings
- retains one login, one worker, and free-tier-safe POC behavior
