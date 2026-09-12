# QA SSR prerender fix

Apply these repository-relative files over the current QA Mega Mission baseline.

## Why
`next build` prerendered `/` on the server and failed with `ReferenceError: window is not defined`.
`TemplateNetworkApp.tsx` statically imported `NetworkGeography`, which imports Leaflet/react-leaflet. Leaflet is browser-only and evaluates `window` during module loading.

## Change
- `components/TemplateNetworkApp.tsx`: load `NetworkGeography` through `next/dynamic` with `{ ssr: false }`.
- `qa/unit/runtime-contracts.test.mjs`: permanent regression assertion preventing a static Leaflet geography import from returning.

## Verify
Run:

```bash
npm run qa:preflight
```

Expected: `next build` should no longer fail prerendering `/` for the Leaflet/window issue.
