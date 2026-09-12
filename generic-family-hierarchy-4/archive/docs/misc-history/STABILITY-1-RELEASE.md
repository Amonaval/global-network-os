# STABILITY-1 — NX Review + i18n Architecture + Small Fixes

## Intent
Return to the accepted pre-Mission-1 post-NX UI baseline and make only contained, traceable changes.

## Included
- Mission 1 large signature/Home/nav redesign is not carried forward.
- Separate locale catalog architecture with dynamic locale loading.
- NX review/debug panel via `window.nxFeatures = true` and per-version review toggles.
- NX source/CSS tagging and review map.
- Playground back-to-network-selection action for Family, Alumni and productized vertical demos.
- Autoprefixer `start` warnings changed to `flex-start` where applicable.
- Product hero button spacing: 10px right/top.
- Defensive `window` guards in theme persistence; baseline rollback also removes Mission-1-specific runtime additions.

## Explicitly excluded
- New Family experience redesign.
- Broad CSS redesign.
- Deleting NX features.
- Native mobile implementation.
- Spanish/Chinese implementation now.
- Big-bang migration of all legacy inline translations.
