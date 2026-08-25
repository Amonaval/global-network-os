# Next Session Prompt — G4 Vertical Runtime & App Composition

Use the latest cumulative codebase containing G0 + G1.1 + G1.2 + G1.3 + G1.4 + G2 + G3.

Read first:
1. `G3-NETWORK-CONSTRUCTION-ENGINE-EXTRACTION.md`
2. `G2-SHARED-IDENTITY-CLAIMING-PARTICIPATION-FOUNDATION.md`
3. `G0-TRUSTED-NETWORK-ARCHITECTURE-BLUEPRINT.md`
4. `DEVELOPMENT-RULES.md`
5. `CODEBASE-UPDATE-RULE.md`
6. `ROADMAP.md`
7. `MISSION-STATUS.md`
8. `CODEBASE.md`

## Mission

Implement **G4 — Vertical Runtime & App Composition** as one consolidated High-effort architecture batch. Do not split it into minor G4.x missions unless a genuine safety/migration boundary requires it.

## Binding objective

Move composition responsibility out of scattered Family assumptions and into explicit vertical-owned runtime definitions while preserving the current Family product exactly.

G4 should use the seams already proven by G1–G3:
- Core network/membership;
- feature runtime + vertical catalogs;
- identity claiming;
- participation;
- network construction;
- app-shell composition.

Target composition areas, where the current code proves the boundary is safe:
- vertical capability manifest/runtime;
- navigation registration;
- feature catalog registration;
- Guide/help registration;
- Playground/demo registration;
- Launch Control registration/classification;
- What's New/release-discovery registration;
- vertical-specific route/surface descriptors where useful.

Family remains the active/default vertical and must look/behave the same. Alumni remains a skeleton unless G4 needs minimal metadata to prove composition; do not start Alumni V1 features here.

## Safety constraints

- No Family UX redesign in G4.
- No broad `NetworkApp.tsx` rewrite merely to make folders look clean.
- Prefer façade/registry composition around stable existing components.
- Preserve all historical `lib/remote.ts` exports and G2/G3 adapters.
- Preserve every Family feature key/default and Launch Control behavior.
- Preserve current Guide/Playground/What's New content and visibility.
- Do not invent generic navigation labels by relabeling Family semantics.
- Core/shared code must not import vertical implementations.
- Family and Alumni implementations must not import one another.
- App-shell is the composition root.
- No database migration unless clearly additive and necessary; prefer none.
- No user/admin guide change unless visible behavior changes.

## Validation requirements

Create one consolidated `validate:g4` gate that at minimum verifies:
- vertical manifests compose capabilities/navigation/features/help/demo/release surfaces without reverse dependencies;
- Family runtime registration preserves current navigation and feature catalog contracts;
- Alumni skeleton does not inherit Family-only surfaces;
- current Family callers/components remain usable through compatibility paths;
- all 147 historical remote exports remain present;
- G2 identity/participation and G3 construction contracts/adapters remain intact;
- accepted G3 files are not silently removed;
- no unplanned migration/schema rewrite occurs.

Run the full historical source/regression suite through G4, focused TypeScript/runtime assertions, and full `next build` only if dependencies are actually available.

## Closure requirements

In the same batch:
- create `G4-VERTICAL-RUNTIME-APP-COMPOSITION.md`;
- create a very short `G4-RUNTIME-VERIFICATION-CHECKLIST.md`;
- create `G4-RELEASE-MANIFEST.md`;
- update G0 blueprint, CODEBASE, PROJECT-VISION, ROADMAP, MISSION-STATUS, VALIDATION and DEVELOPMENT-RULES if applicable;
- update this handoff to G5 only after G4 closes;
- update User/Admin Guide only if user-visible Family behavior changes;
- create an affected-files-only G4 ZIP preserving hierarchy.

## Target result

At G4 closure, the platform should have a clean vertical composition layer that can assemble Family from explicit capabilities/surfaces without scattering Family assumptions through the reusable app shell. Family must remain stable. Alumni should be ready to become a real second product in G5 without inheriting Family UI semantics.

The next planned batch after successful G4 is **G5 — Alumni Network V1**.
