# G8 Certification Hotfix — Launch Control Bundle Typing

**Date:** 2026-08-25  
**Status:** FIXED / SOURCE CERTIFIED  
**Scope:** Frontend TypeScript hotfix; no database migration change

## Reported failure

Next.js build failed in `components/FounderLaunchConsole.tsx`:

```text
Argument of type 'string' is not assignable to parameter of type 'never'.
LAUNCH_COMPOSITION.playgroundExcludedBundles.includes(f.bundle)
```

## Root cause

Several vertical compositions declare `playgroundExcludedBundles` as literal arrays, including empty `[]` values. In the concrete composition union used by Launch Control, TypeScript can preserve those literal element types so narrowly that `.includes(...)` resolves to a `never` parameter.

The shared contract is intentionally broader:

```ts
playgroundExcludedBundles: readonly string[]
```

The Launch Control caller must therefore widen the concrete composition value back to that shared contract before using `includes`.

## Fix

`FounderLaunchConsole.tsx` now establishes:

```ts
const PLAYGROUND_EXCLUDED_BUNDLES =
  LAUNCH_COMPOSITION.playgroundExcludedBundles as readonly string[];
```

and both Playground filters use:

```ts
!PLAYGROUND_EXCLUDED_BUNDLES.includes(feature.bundle)
```

No rollout behavior, feature key, bundle key, vertical composition or database behavior changed.

## Regression protection

`validate:g8` now fails if:

- Launch Control loses the explicit `readonly string[]` widening; or
- code directly calls `.includes(f.bundle)` on `LAUNCH_COMPOSITION.playgroundExcludedBundles`.

## Certification

After the correction, the complete automated source chain passed:

**D1 → V1 → CR1/CR2 → S1 → S2 → S3-A1 → G1.1/G1.2/G1.3/G1.4 → G2 → G3 → G4 → G5 → G6 → G7 → G8: PASS**

G8 continues to preserve:
- 147 historical remote facade exports;
- 333 accepted G7 files;
- 12 protected Family/Alumni foundations;
- all three released G8 business verticals.

## Deployment

No new SQL migration is required.

If migration 048 has not yet succeeded, use the corrected migration 048 already included in G8 Certified R3.
