# XP-7 Type Closure Hotfix — Dynamic What's New Routing

## Runtime/build symptom

`components/shared/NetworkWhatsNew.tsx` failed TypeScript compilation when indexing `composition.whatsNew.featureToView[current.feature_key]` because `getVerticalAppComposition()` preserved a narrow union of each vertical's literal composition object.

## Root cause

`VerticalWhatsNewComposition.featureToView` is intentionally `Readonly<Record<string, string>>`, because feature announcement keys are runtime strings. However, the generic accessor returned `(typeof appCompositions)[K]`, re-narrowing `featureToView` to literal object shapes and losing the string index signature at the call site.

## Fix

`getVerticalAppComposition(kind)` now returns the declared shared `VerticalAppComposition` contract. This preserves the intended dynamic `Record<string, string>` routing contract while retaining exhaustive validation of the underlying `appCompositions` registry through `satisfies Record<NetworkVerticalKind, VerticalAppComposition>`.

No `as any`, suppression, or unsafe cast was introduced.

## Validation

- XP-7 source gate: 65/65.
- Strict TypeScript harness using `current.feature_key: string`: PASS.
- The gate now explicitly asserts that the vertical-app accessor widens to the shared composition contract and that What's New routes dynamic feature keys.
- Full Next build remains environment-pending because dependency installation timed out before the Next CLI was completely installed in this execution environment.
