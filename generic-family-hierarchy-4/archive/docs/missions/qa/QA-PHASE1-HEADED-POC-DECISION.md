# Phase-1 Local Browser Certification Decision

## Decision

The compact Free-Tier POC browser certification runs the existing `qa/e2e/15-free-tier-poc.spec.ts` in **headed Chromium** with exactly one worker.

## Why

On the current Windows/local Next.js development runtime, the identical spec repeatedly passes in headed Chromium while headless Chromium can remain on server-rendered loading HTML before client hydration. Repeated locator and timeout changes did not resolve that runtime-specific behavior.

This is a browser-runtime execution difference, not a reduction in QA assertions or product scope. Phase-1 therefore uses the stable, directly observable mode proven on the target developer machine.

## What remains unchanged

- same Playwright spec and assertions
- same real Join/sign-in flow
- same single browser login/session reuse
- one Playwright worker
- same tiny deterministic datasets
- no added auth loops
- no added Supabase operations
- RPC/RLS/DB certification unchanged

## Headless policy

Headless execution is **not discarded**. It becomes a separate runtime/CI hardening item and must not be confused with product-flow correctness. Full production/CI certification may require headless stability later, but it is not a blocker for local Free-Tier Phase-1 POC closure.

## Commands

Focused browser POC:

```bash
npm run qa:poc:browser
```

Formal Phase-1 certification:

```bash
npm run qa:certify
```
