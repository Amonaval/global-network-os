# QA Free-Tier POC v4

Fixes a race in `qa/lib/login.ts`: the helper previously returned immediately after clicking Sign in. It now waits until an authenticated application state (vertical shell, My Networks, or setup shell) is visibly hydrated before E2E continues.

The compact POC remains one worker, one owner browser login, tiny seeded data, and no volume/stress loops.
