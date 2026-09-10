# Phase 5A RPC Security Contract

Phase 5A converts the historical RPC privilege backlog from an advisory/non-regression metric into a strict production-readiness contract.

## Contract

1. Application RPCs must not rely on PostgreSQL's default `PUBLIC EXECUTE` privilege.
2. Anonymous execution is allowed only when migration history explicitly grants `anon`.
3. Authenticated execution is allowed only when migration history explicitly grants `authenticated`.
4. Internal/helper functions with no client-role grant must not be executable by `anon` or `authenticated`.
5. Every `SECURITY DEFINER` function must have a fixed `search_path` and must not be owned by `anon` or `authenticated`.
6. Live overloads are blocking until access intent is signature-specific; name-only ambiguity is not accepted.
7. No finding is waived because older compact QA phases treated the privilege audit as advisory.

## Safety model

The Phase-5A audit uses PostgreSQL catalog `SELECT` queries only. It does not change ACLs, functions, RLS, Storage, schema objects or application data. A remediation preview is generated for review but is wrapped in `BEGIN` / `ROLLBACK` and is never executed by the certification runner.

## Closure lifecycle

Run the report-only audit first. Review findings by severity and intent. Author small reviewed ACL migrations only after the report is understood. Re-run the audit after each reviewed batch. `PHASE5A_CERTIFIED` requires zero P0 and zero P1 findings.
