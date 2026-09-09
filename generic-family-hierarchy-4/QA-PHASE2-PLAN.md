# QA Phase 2 — Representative Platform Capability Certification

Baseline: `global-network-os-QA-PHASE1-CLEAN-POC-CERTIFIED.zip` only. Phase 1 is closed and is not re-opened by this mission.

## Architecture found

The certified baseline already separates QA into deterministic staging setup, cheap contract/unit inspection, DB integrity, RPC/RLS runtime proof, Playwright browser suites, evidence/reporting and full-future expensive suites. Phase 1 intentionally executes only a compact subset through `qa/run-poc-certification.mjs`.

Reusable assets used directly in Phase 2:
- deterministic 9-vertical + Tenant-B seed;
- `login`, `activate`, `authenticatedClient`, seed-state helpers;
- staging mutation guards and `.env.qa` authority;
- DB integrity, compact RPC smoke, compact RLS adversarial proof;
- stable `qa-*` browser selectors;
- existing axe dependency and Playwright evidence/reporters;
- strict RPC backlog retained separately from POC/Phase-2 advisory treatment.

## Compact matrix

| Capability | Deep representative | Evidence |
|---|---|---|
| Owner/admin regression | Family | retained Phase-1 proof + owner axe screen |
| Member browser journey | Organization | shell, directory, seeded entity, no admin control |
| Cross-tenant negative | Tenant-A owner → Tenant-B Family | authenticated browser fetch of known Tenant-B export ID must be denied and leak no tenant name |
| API mutation/readback/cleanup | Disposable Organization | API create, API export/readback, API purge, DB zero-residue proof |
| Lifecycle CRUD | Disposable Organization entity | bootstrap create, table read, governed RPC update, purge/delete, zero residue |
| Accessibility | Family owner admin + Organization member directory | serious/critical WCAG axe gate |
| Mobile | Organization member, Chromium 390×844 | shell/nav/content/search action/overflow/fatal-error smoke |
| Remaining vertical parity | all 9 | cheap static/runtime-contract parity, not 9×role browser Cartesian |

## Execution sequence

1. Cheap local contracts/parity.
2. Reuse existing deterministic seed when present.
3. DB integrity + compact RPC/RLS foundation.
4. One headed Chromium Phase-2 representative suite, one worker.
5. Only after focused failures are classified/fixed, run the Phase-2 certification runner.

## Failure policy

Before changing assertions classify each failure as product defect, QA harness defect, environment/configuration issue, known RPC/security finding, or third-party/runtime issue. Product defects require evidence, root-cause class audit, fix and permanent regression coverage. Assertions must not be weakened merely to make certification green.

## Deferred by Phase-2 policy

Fresh migration replay, stress/load, 1,000-row volume, all-browser matrix, broad accessibility crawl, every-role × every-vertical browser matrix and headless CI strategy remain outside Phase 2.
