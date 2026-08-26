# G4 — Vertical Runtime & App Composition

**Date:** 2026-08-25  
**Status:** IMPLEMENTED IN SOURCE / CLOSED AS CONSOLIDATED NON-USER-FACING ARCHITECTURE BATCH / SHORT DEPLOYED SMOKE RECOMMENDED

## Objective

Make vertical composition explicit for app surfaces without rewriting the Family product renderer. G4 moves responsibility for navigation metadata, Guide routing, Playground identity/settings, Launch Control bundle metadata and What's New routing into vertical-owned composition definitions, while keeping the existing Family components, routes, feature keys, RPCs and visible behavior unchanged.

## Architecture introduced

```text
core/verticals/app-composition.ts
        │
        ▼
app-shell/vertical-runtime.ts
        │
        ├──────── verticals/family/runtime/composition.ts
        │
        └──────── verticals/alumni/runtime/composition.ts

existing Family renderers
  components/NetworkApp.tsx
  components/FounderLaunchConsole.tsx
        │
        └── consume app-shell composition instead of owning registries inline
```

The app-shell remains the only composition root allowed to import explicit vertical implementations.

## What Family now registers

`FAMILY_APP_COMPOSITION` owns the current Family product metadata for:
- primary navigation order, labels, feature keys, icons and experience thresholds;
- mobile More navigation and bottom-navigation membership;
- contextual Guide key per view and Guide action-to-view routing;
- Playground network metadata, preferred sample viewer and starting surface;
- Launch Control bundle definitions and Playground bundle exclusions;
- current Day-1 launch explanatory copy;
- What's New feature-to-surface routing and fallback copy.

All current Family values were copied exactly from the accepted G3 implementation. G4 changes ownership, not product semantics.

## Family renderer strategy

G4 deliberately does **not** create a generic React component renderer. `NetworkApp.tsx` still renders the proven Family components such as `FamilyHome`, `TreeView`, `CommunityHub`, `FamilyAdminCenter`, `ParticipationCenter` and `GuidePortal`.

The change is narrower and safer:
- the renderer asks the vertical runtime what surfaces exist;
- Family supplies Family semantics;
- shared app-shell code validates the composition;
- future verticals can supply different surfaces instead of inheriting Family labels/components by default.

This avoids a big-bang rewrite while removing the highest-value scattered registries from `NetworkApp.tsx`.

## Guide/help registration

G4 registers:
- view → Guide key mapping;
- Guide action → app surface mapping;
- surfaces safe to open after entering Playground;
- Launch Control Guide key.

The existing Family guide content source remains unchanged. This is intentional: G4 changes composition ownership, not user-facing documentation content.

## Playground registration

The Family runtime now owns both existing sample identities/settings:
- public anonymous `Sample Family Playground`;
- setup/lobby `Sample Family` read-only sample.

The preferred sample viewer remains `m37`; fallback selection remains the midpoint member; Family Playground still starts on Home, uses explorer experience and saves nothing.

No database or demo-data format change was introduced.

## Launch Control registration

`FounderLaunchConsole.tsx` now consumes the Family vertical launch composition for:
- Core / Remember / Celebrate / Connect / Contribute / Share / Administration bundles;
- Playground exclusion of admin-only features;
- current Playground explanation/recommendation;
- Day-1 preset explanation;
- pilot-target copy;
- founder/family-control footnote.

The backend rollout mechanics, feature keys, bundle keys, states, defaults and platform-owner RPCs are unchanged.

## What's New registration

The historical routing rules are preserved but now vertical-owned:
- Family Tree / Relationship Explorer → Family;
- Directory → Find Family;
- Memories / Community / Gatherings → Memories;
- History → Timeline;
- Places → Map;
- Contributions → Participation;
- admin features → Manage family;
- everything else → Home.

Existing announcement persistence and dismissal behavior is unchanged.

## Alumni isolation

`ALUMNI_APP_COMPOSITION` is explicitly `skeleton`:
- no primary navigation;
- no mobile navigation;
- no Playground;
- no launch bundles;
- no What's New routes;
- no Family feature keys/copy.

`getRenderableVerticalRuntime()` fails closed for skeleton verticals. Alumni therefore does not silently inherit Family screens merely because Family is the current default product.

G5 must provide real Alumni surfaces before Alumni becomes user-visible.

## Feature/runtime composition integrity

`app-shell/vertical-runtime.ts` validates at module initialization that:
- app composition kind matches the registered vertical;
- composition render status matches the vertical definition status;
- composition `featureCatalogId` matches the vertical feature catalog;
- every navigation feature key exists in that vertical's catalog;
- every referenced capability belongs to that vertical.

This turns configuration drift into an immediate architecture failure rather than a hidden UI regression.

## Compatibility and database safety

G4 adds **no Supabase migration** and changes no RLS/RPC/schema behavior.

Preserved:
- all 23 Family feature keys/defaults;
- existing Family navigation labels/order/experience gating;
- existing Guide content and contextual destinations;
- existing Playground sample data and no-save behavior;
- existing Launch Control backend and rollout precedence;
- existing What's New announcements;
- all 147 historical `lib/remote.ts` exports;
- G2 identity/participation adapters;
- G3 construction adapters and all S3-A1 RPCs.

## Automated validation

`validate:g4` verifies:
- Core app-composition contracts have no vertical implementation dependency;
- app-shell composes both Family and Alumni explicitly;
- Family primary navigation order + feature keys are preserved;
- Family surface feature keys all exist in the Family catalog;
- Guide/Playground/Launch/What's New are composition-driven;
- Alumni skeleton contains no Family-only surfaces/content;
- skeleton vertical rendering fails closed;
- all 147 historical remote exports remain present;
- G2/G3 architecture markers remain intact;
- all 260 accepted G3 files remain present;
- no post-044 migration was added.

Every historical source/regression gate through G4 passes.

Focused strict TypeScript 5.8.3 compilation of the pure G4 composition/contracts layer: PASS. Syntax transpilation of changed app-shell/TSX files: PASS. Executable Family/Alumni composition assertion: PASS.

Full Next.js production build is not certified in this workspace because installed application dependencies are not present.

## User/Admin documentation decision

No normal Family User/Admin Guide change is required. Family navigation, labels, permissions, Guide content, Playground behavior and Launch Control behavior are intentionally unchanged.

## Closure lifecycle

- [x] CLASSIFY
- [x] IMPLEMENT
- [x] VALIDATE
- [x] GUIDE — existing Family content preserved; registration moved
- [x] PLAYGROUND — existing Family behavior preserved; metadata registered vertically
- [x] LAUNCH CONTROL — existing behavior preserved; bundle metadata registered vertically
- [x] WHAT'S NEW — existing behavior preserved; routing registered vertically
- [x] ROADMAP / STATUS
- [x] CLOSE
- [ ] SHORT DEPLOYED SMOKE

## Next consolidated batch

**G5 — Alumni Network V1**.

G5 is the first user-visible proof of the second vertical. It must supply real Alumni identity, persistence/RLS, onboarding/import, directory/search, cohort/institution semantics, basic Home/Admin, Guide/Playground/Launch Control coverage and privacy without reusing Family kinship persistence.
