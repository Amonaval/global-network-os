# QA Phase 5A — Security Contract & RPC Closure

## Mission

Phase 5A converts the historical RPC privilege backlog from an advisory/non-regression signal into a strict production-readiness contract. Its first implementation is deliberately evidence-first and read-only against the configured QA database so that the sensitive Supabase project is not changed while access intent is being reconstructed and reviewed.

Phase 5A does **not** execute migrations, GRANT/REVOKE, RLS or Storage policy changes, destructive lifecycle actions, seed, cleanup, or application-data mutations.

## Strict RPC contract

Every public-schema RPC is reconciled against migration-derived intent.

- PostgreSQL default `PUBLIC EXECUTE` is never accepted as application authorization.
- `anon` EXECUTE is allowed only when migration history explicitly grants `anon`.
- `authenticated` EXECUTE is allowed only when migration history explicitly grants `authenticated`.
- Internal/helper functions with no client-role intent must not be executable by client roles.
- Every `SECURITY DEFINER` function must have a fixed `search_path` in live PostgreSQL metadata.
- A `SECURITY DEFINER` function must not be owned by `anon` or `authenticated`.
- anon/authenticated must not have CREATE on the public schema when SECURITY DEFINER name resolution relies on that schema.
- Live overloads are blocking until access intent is signature-specific.
- No Phase-5A P0/P1 finding is downgraded to advisory.

## Evidence produced

`npm run qa:phase5a:audit` creates:

- `qa-results/security/PHASE5A-RPC-MIGRATION-INTENT.json`
- `qa-results/security/PHASE5A-RPC-SECURITY-AUDIT.json`
- `qa-results/security/PHASE5A-RPC-SECURITY-AUDIT.md`
- `qa-results/security/PHASE5A-RPC-REMEDIATION-PREVIEW.sql`

The remediation SQL is **review-only**. It is wrapped in `BEGIN` / `ROLLBACK` and is never executed by any QA command.

## Execution

```bash
npm run qa:phase5a:local
npm run qa:phase5a:audit
```

The audit is expected to expose the historical RPC debt precisely. The first result may therefore be `REMEDIATION_REQUIRED`; that is useful evidence, not a harness failure.

Only after reviewed remediation batches have reduced all blocking findings to zero should the final gate be run:

```bash
npm run qa:certify:phase5a
```

Final closure requires:

```text
Phase-5A report: PHASE5A_CERTIFIED
TrustWeave Phase-5A security contract/RPC closure: PHASE5A_CERTIFIED
```

## Remediation workflow

1. Run the report-only audit.
2. Review P0 first, then P1, with function signature and migration intent.
3. Treat the generated SQL only as evidence/a drafting aid; do not apply it directly.
4. Author small, reviewed, rerunnable ACL migrations only after the intent is understood.
5. Re-run the read-only audit after each approved batch.
6. Do not blanket-revoke or blanket-grant hundreds of functions in one unreviewed change.

## Explicitly separate / deferred

- Phase-3 `P3-STORAGE-002` and experimental staging drift from migrations 096/097.
- Fresh database migration replay and upgrade certification (Phase 5B).
- Production deployment/media/destructive release gate (Phase 5C).
- Load/stress and broad cross-browser matrices.
