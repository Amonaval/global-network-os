# TRUSTWEAVE / GENERIC NETWORK OS — QA MEGA MISSION MASTER PROMPT

Use the attached `global-network-os-QA-mega-mission-baseline.zip` as the ONLY implementation baseline. Do not reconstruct from older XP ZIPs.

## Mission
Feature development is paused. Lead end-to-end testing, runtime certification and hardening of the entire product.

The owner has no separate QA team. ChatGPT is the primary QA architect/engineer and should build and maintain automated unit, contract, database/RPC, RLS/security, API/integration, Playwright E2E, exploratory crawler, accessibility, responsive and data-volume suites.

## Operating model
The user will run the application and QA commands locally/staging. Tests must generate machine-readable and human-readable bug evidence that can be returned to ChatGPT for remediation.

Do not rely on source-string gates as proof of runtime behavior. Existing source gates are regression assets but are only one layer.

## Start by reading
- `QA-MEGA-MISSION-ROADMAP.md`
- `qa/README.md`
- `qa/TEST-CASE-CATALOG.md`
- `FUTURE-TECHNICAL-ROADMAP.md`
- latest CURRENT-STATE / ROADMAP / MISSION-STATUS
- current migrations 090-095 and all released vertical registries

## First implementation sequence
1. Make `npm run qa:preflight` run build/type/source/migration checks with one summarized report.
2. Complete Playwright role authentication fixtures and deterministic staging test-data seeding.
3. Bind stable `data-testid` selectors to shared shell/admin/start/import/lifecycle surfaces where semantic roles are insufficient.
4. Implement all-9-vertical smoke matrix.
5. Implement owner/admin/member authorization matrix.
6. Implement DB migration replay + RPC smoke against staging.
7. Implement RLS two-tenant adversarial suite.
8. Implement shared golden E2E flows.
9. Implement deep vertical-specific flows, starting Housing Society, Family Association, Family, Alumni, then generic verticals.
10. Upgrade expert crawler to produce coverage inventory and action graph, not random clicking.
11. Add axe accessibility and mobile viewport smoke.
12. Add controlled destructive lifecycle and import tests with cleanup.
13. Produce `qa-results/BUG-REPORT.md`, JSON findings, coverage matrix and prioritized remediation plan.

## Safety
Never run destructive QA against production. Mutating suites require `QA_MODE=staging` and `QA_ALLOW_MUTATION=true`. Keep a hard production guard. Dedicated QA accounts only.

## Definition of done
For a certified scope:
- clean install/build/type check passes;
- fresh/upgrade migrations pass;
- source/contract gates pass;
- RPC tests pass;
- RLS tenant isolation passes;
- API integration passes;
- Playwright golden path passes;
- all released verticals smoke pass;
- no open P0/P1 defects;
- evidence/report artifacts generated;
- every fixed runtime bug gets a permanent regression test.

Do not ask the user to manually test things that can be automated. When environment credentials are genuinely required, expose the exact `.env.qa` fields and continue implementing everything else.
