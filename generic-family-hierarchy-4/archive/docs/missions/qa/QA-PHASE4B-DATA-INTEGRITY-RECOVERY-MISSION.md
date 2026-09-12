# QA Phase 4B — Data Integrity, Import/Export & Recovery Certification

## Objective

Prove that TrustWeave can create, review, reject, export and recover portable network data without silently corrupting or mutating governed application data. Phase 4B deliberately stays away from the unresolved Phase-3 Storage/RLS issue and from destructive database operations.

## Certified layers

1. **All-nine vertical import contracts** — generated guided workbooks are deterministic and round-trip through the real parser.
2. **Structural rejection** — every released vertical rejects missing required sheets and missing required columns.
3. **Forward-compatible review** — unknown workbook sheets generate warnings while otherwise valid data remains reviewable.
4. **Family portable exports** — browser-generated JSON and CSV downloads are readable and contain the seeded network data.
5. **Logical backup contract** — Organization API export is validated as a TrustWeave network backup with manifest-only media semantics.
6. **Malformed import containment** — malformed Organization workbook reaches review, commit remains disabled, and governed entity count does not change.
7. **Interrupted review recovery** — a valid Organization workbook can be reviewed, then browser reload discards the uncommitted client-side review while governed data remains unchanged.

## Safety boundary

Phase 4B does not execute Supabase migrations, RLS/RPC security audits, Storage mutations, network create/archive/delete/purge operations, import commits, QA seed or cleanup. It reuses the existing deterministic certified seed fixture and runs one headed Chromium worker.

## Commands

```bash
npm run qa:phase4b:local
npm run qa:phase4b:browser
npm run qa:certify:phase4b
```

## Certification rule

Phase 4B is certified only when both local data contracts and the headed browser recovery suite pass. The unresolved Phase-3 Storage/RLS blocker remains explicitly open and is neither waived nor evaluated by this phase.

## Deferred

Actual import commit/rollback on disposable staging data, automatic full restore, storage blocker reconciliation, strict RPC privilege remediation, clean migration replay, production upgrade-path testing, volume/performance/stress/load testing.
