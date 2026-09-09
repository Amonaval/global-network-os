# QA Headless Bootstrap Hardening — Apply Note

## Evidence

The identical Playwright POC passed in headed Chromium but intermittently failed headless while waiting for `qa-open-auth`. This proved the product flow and locator were valid and isolated the defect to harness synchronization during application bootstrap.

## Root cause

`qa/lib/login.ts` used an instantaneous `emailBox.count()` probe immediately after committed navigation. The UI has a legitimate third state while `NetworkApp` initializes: neither the auth dialog nor the signed-out button exists while `ready === false`. Headless Chromium can expose this race more readily than headed Chromium.

## Fix

- `NetworkApp` publishes `data-qa-app-ready="true|false"` on the document root from the existing `ready` state.
- The loading branch exposes `data-testid="qa-app-loading"`.
- `login.ts` waits for `data-qa-app-ready="true"` before interpreting auth state.
- Removed the `emailBox.count()` synchronization probe.
- Reused authenticated state is accepted without starting another login loop.
- Unexpected bootstrap/auth states include bounded deterministic diagnostics: URL, readiness, loading, landing button, auth dialog, authenticated shell and body text.
- Added a unit/source regression contract preventing reintroduction of the `count()` race and requiring the readiness marker.

## Free-Tier impact

No additional Supabase calls, authentication loops, datasets, workers, destructive operations, stress tests or volume tests were added.

## Verification order

Run the isolated headless browser POC first:

```bash
npx playwright test qa/e2e/15-free-tier-poc.spec.ts --project=chromium-desktop --workers=1
```

If it passes, run formal Phase-1 closure once:

```bash
npm run qa:certify
```

Target:

```text
POC report: POC_CERTIFIED
TrustWeave free-tier POC certification: POC_CERTIFIED
```
