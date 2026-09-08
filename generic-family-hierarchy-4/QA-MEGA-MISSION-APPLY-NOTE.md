# QA Mega Mission — Affected Files Package

This package contains only files added or modified by the QA Mega Mission, preserving repository-relative paths.

## Apply

1. Extract this ZIP into the repository root, allowing files to overwrite matching paths.
2. Delete each path listed in `QA-MEGA-MISSION-DELETE-OBSOLETE-FILES.txt`.
3. Follow `qa/LOCAL-RUNTIME-CERTIFICATION-GUIDE.md`.
4. Run the full runtime certification locally with `npm run qa:certify` after configuring the staging QA environment.

Generated `qa-results/` and TypeScript build cache files are intentionally excluded.

## Locked-down machine / database certification

Database migration replay, integrity checks, and RPC privilege audits use the project-local Node PostgreSQL driver (`pg`). A Windows PostgreSQL/`psql` installation is **not required**. `npm run qa:setup` installs `pg` with `--no-save` alongside the QA browser tooling, so no administrator rights or local PostgreSQL server are required.

`QA_PSQL_BIN` is legacy and no longer used. Keep `QA_DATABASE_URL` for the current staging Supabase/Postgres database and optionally `QA_FRESH_DATABASE_URL` for the disposable fresh-replay database.
