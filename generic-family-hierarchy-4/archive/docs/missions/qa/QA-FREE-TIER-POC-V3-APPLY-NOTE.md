# QA Free-Tier POC v3

Fixes network switching in the compact POC without extra authentication or API calls.

- Adds stable QA test IDs to the existing NetworkSwitcher trigger and seeded network entries.
- POC uses the real application NetworkSwitcher rather than assuming a My Networks sidebar/navigation control exists.
- Still uses one Chromium worker and a single owner login for Family + Housing Society.
