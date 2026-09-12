# TrustWeave QA Mega Mission — Manager Brief

## What we changed

Feature development was intentionally paused and a dedicated QA/certification layer was added around the existing TrustWeave / Generic Network OS application. The goal is not just to run a few Playwright scripts; it is to create a repeatable release-certification system that checks code contracts, database integrity, RPC/security behavior, RLS tenant isolation, browser journeys, vertical parity, evidence generation, and later lifecycle/accessibility/volume coverage.

## Why the approach changed during this session

The first version was broad and would have authenticated many roles and exercised many verticals repeatedly. Because the project is currently developed on Supabase Free Tier, that approach caused Auth rate limiting. We therefore made Free-Tier-safe POC certification the default. The full suite is preserved, but expansion happens only after compact certification is stable.

## Current default certification model

`npm run qa:certify` now runs the Free-Tier POC path. It uses a tiny deterministic dataset, one Playwright worker, one owner browser login, two representative verticals (Family and Housing Society), and only the minimum Supabase role sessions required for RPC/RLS checks. `npm run qa:certify:full` preserves the larger future certification suite.

## What has already been proven

The deterministic seed successfully creates all 9 released verticals plus an isolated Tenant B. Database integrity passed 7 checks. RPC POC passed 12 checks using only 2 authenticated sessions. RLS POC passed 7 checks using owner + Tenant B. The browser POC successfully exercised Family owner/admin navigation and Housing Society shell navigation with one browser login. The local QA unit-contract suite now passes after fixing import/workbook contracts.

## Product defects found by QA, not just QA harness defects

The QA work already found genuine application issues. Hosted vertical membership transport recognized only 6 vertical kinds, causing `association`, `family-association`, and `housing-society` to silently fall back to `family`; this was fixed for all 9 verticals. `AuthPanel` also compared internal auth mode values against translated labels, which could break password rendering; this was fixed. Organization import relationships required references to multiple possible sheets, but the contract supported only one reference sheet; the import contract/parser was enhanced rather than weakening the test.

## QA harness defects found and hardened

We removed unsupported synthetic affiliation dimensions from seed data, corrected invalid per-vertical entity-kind assumptions, made `.env.qa` authoritative over stale shell variables, removed the local `psql` dependency by using project-local Node `pg`, fixed Next.js SSR loading of Leaflet geography, fixed Playwright login to open the actual sign-in dialog and wait for authenticated state, added stable test IDs, and fixed stale POC-report status handling.

## Security finding intentionally not hidden

The RPC permission audit currently reports 386 public functions and 331 unexpected privilege findings. In Free-Tier POC mode these are recorded as advisory so they do not cause repeated expensive runtime activity or block proving the QA architecture. They must be investigated as a dedicated security-hardening mission before production certification. Full certification should remain strict about this layer.

## Current status at handover

The latest local `npm run qa:unit` is PASS. The prior runtime POC was also PASS for DB integrity, RPC POC, RLS POC, and the one-browser Family + Housing Society journey. The complete `npm run qa:certify` has **not yet been rerun after the final unit-contract fixes**, so Phase 1 is not formally closed until that command ends with `POC_CERTIFIED`.

## Immediate next milestone

First rerun `npm run qa:certify`. If it returns `POC_CERTIFIED`, close QA POC Phase 1. Then begin Phase 2 while staying Free-Tier safe: add member browser coverage, one browser/RLS negative path, one API mutation/readback path, one small lifecycle/import cleanup path, and basic accessibility coverage. Do not expand all 9 vertical browser flows or volume/stress testing until the compact layers are stable.
