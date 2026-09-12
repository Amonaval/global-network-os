# Apply note — QA Phase 4D

Apply this patch on top of the Phase-4C-certified working tree.

No SQL or migration file is included. Do not reintroduce experimental Phase-3 migrations 096/097 from older patches.

Run in order:

```bash
npm run qa:phase4d:local
npm run qa:phase4d:browser
```

Only after both are green:

```bash
npm run qa:certify:phase4d
```

Phase 4D reuses `qa-results/fixtures/seed-state.json`; it intentionally does not seed or clean the database.
