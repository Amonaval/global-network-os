# Phase 5A — Batch 1 Apply Note

This patch is intentionally local/read-only. It adds a contract-review command only.

It does **not** contain SQL migrations and does **not** modify Supabase.

After overlaying the files, run:

```bash
npm run qa:phase5a:batch1:plan
```

Expected result:

```text
Phase-5A Batch-1 contract review READY_FOR_SOURCE_REVIEW (... zero DB writes)
```

Then inspect `qa-results/security/PHASE5A-BATCH1-CONTRACT-REVIEW.md`.

Do not change RPC grants yet. The next step is source/live-trigger verification for the five high-confidence trigger-only functions before generating the first permission migration.
