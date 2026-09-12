# RC-1 — Federation Runtime Certification & Product Hardening

## Status
IN PROGRESS — Source certification hardened; integrated runtime/database/browser certification still required.

## Objective
Turn NF-0A/NF-1→NF-8 and NX-7→NX-9 from source-complete into evidence-backed runtime-certified product behavior without adding another architecture layer.

## RC-1 finding 001 — certification gates drifted behind NX-8
NX-8 centralized Launch Control filtering through `enabledTools(section).filter(item => enabled(item.key))`. Older NF-2/3/4/6/7/8 source gates still expected direct `enabled("capability")` calls in `MyNetworksHome.tsx`.

This was a certification defect, not a reason to regress the guided workspace architecture.

### Fix
Updated the affected mission gates to certify the current centralized Launch Control pattern while still requiring:
- capability registration in My Networks,
- lazy dynamic imports,
- mission-specific privacy/SQL invariants,
- feature registry presence.

## RC-1 finding 002 — NF-4 validation command missing
`nf4-federated-directory-gate.mjs` existed but `package.json` had no `validate:nf4` command.

### Fix
Added `validate:nf4` with the same i18n/type-check chaining convention as neighboring NF missions.

## RC-1 source certification gate
Added `validate:rc1-source`.

It currently certifies:
- NF-1→NF-8 mission gates pass as a batch;
- federation capabilities remain TEST-default in the advanced capability model;
- all NF capabilities are represented in the guided My Networks workspace;
- NX-8 filters tools centrally through Launch Control before rendering;
- advanced federation components remain dynamically imported;
- advanced UI follows journey → focused tool progressive disclosure;
- NX-9 help modal has explicit Dark/Aurora theme contracts and explicit surface/text tokens;
- NF-4 and federation batch commands are exposed in package scripts.

## Build environment note
A clean dependency installation could not complete in the current isolated execution environment, leaving `node_modules` partial. TypeScript consequently reported missing ambient type packages such as React, Node, Leaflet and D3 types. These are installation-state errors, not classified as repository defects.

Do not mark RC-1A build certification complete until a clean `npm ci`/install succeeds in the real repository and both `npm run check:types` and `npm run build` pass.

## Still required before RC-1 closure
1. Clean dependency install and production build.
2. Full TypeScript/import/i18n verification in the real repo.
3. Database migrations 069→077 applied and verified.
4. Launch Control runtime enable/disable tests per vertical.
5. User A / Network A → Umbrella U → Network B / User B Mentoring E2E scenario.
6. Privacy/negative tests from the handover.
7. NX-8/NX-9 UI review in Light, Dark, Aurora and desktop/tablet/mobile.
8. Regression across Family, Alumni, Organization, Business Trust, Franchise, Professional, M6/M7, themes and i18n.

## Decision rule
Do not start NF-9 merely because source certification is green. RC-1 closes only when runtime evidence supports the product behavior and privacy boundaries.
