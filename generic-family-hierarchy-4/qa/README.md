# TrustWeave Quality Engineering

This folder is the executable runtime-certification layer for TrustWeave / Generic Network OS.

## Safety modes

- `QA_MODE=readonly` — navigation, rendering, console/network/RPC checks. No destructive actions.
- `QA_MODE=staging` — allows seeded data creation, invitations, imports, archive/restore and disposable hard-delete against a NON-PRODUCTION Supabase project.
- Destructive helpers additionally require `QA_ALLOW_MUTATION=true`.

The runner refuses destructive workflows when the configured base URL looks production-like unless `QA_ALLOW_PRODUCTION=true` is explicitly set. Do not set that flag for ordinary QA.

## First run

```bash
npm ci
npm run qa:install
cp .env.qa.example .env.qa
# fill QA_BASE_URL and test credentials
npm run qa:smoke
npm run qa:crawl
npm run qa:report
```

For full staging certification:

```bash
QA_MODE=staging QA_ALLOW_MUTATION=true npm run qa:certify
```

Artifacts are written to `qa-results/` and include Playwright traces, screenshots, videos on failure, JSON issue events, JUnit, HTML report, and `BUG-REPORT.md`.
