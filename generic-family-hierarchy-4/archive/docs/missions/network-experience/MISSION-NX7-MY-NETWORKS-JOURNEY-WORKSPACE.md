# NX-7 — My Networks Journey Workspace — Iteration 1

**Status:** Source implemented; runtime review pending.

## Problem
My Networks accumulated M6, M7 and NF-0A→NF-8 capabilities as one vertical stack. Even though each capability was independently Launch-Controlled and dynamically imported, enabling several together produced a long, cognitively expensive page with weak category boundaries. The issue was information architecture, not cosmetic styling.

## Product decision
Turn My Networks into an overview-first workspace with progressive disclosure.

### Five journeys
1. **My Spaces** — everyday network entry and identity context.
2. **Trust & Reach** — identity reach, bridges, cross-network discovery and network-effect measurement.
3. **Federation** — Passport → affiliation → umbrella → federated directory, with distribution planning.
4. **Requests & Outcomes** — purpose consent → request routing → governed introduction → outcome/Trust Receipt.
5. **Launch & Learn** — guided launch, showcase, pilot operations, feedback, runtime certification and product decision gates.

## UX architecture
- Only one journey is rendered at a time.
- The overview explains the advanced journey before the user enters it.
- A Network Type Context selector makes the active vertical/Launch Control scope explicit.
- Each journey shows how many relevant capabilities are enabled.
- If none are enabled, the user gets a clear Launch Control explanation instead of an empty or confusing area.
- Federation and Requests & Outcomes include compact flow strips that teach the dependency sequence before showing detailed tools.
- Pilot/admin tooling is separated from ordinary daily network use.

## Performance architecture
All advanced components remain `next/dynamic`. Because components are now mounted only inside the selected journey, My Networks avoids rendering/loading all enabled advanced capability chunks at once.

## Launch Control
NX-7 does not create a new feature flag because it is the organizing shell for already-gated capabilities. Every underlying M6/M7/NF capability keeps its existing independent per-vertical Launch Control key and rollout state. The shell never bypasses server authorization or Launch Control.

## Validation completed
- `MyNetworksHome.tsx` TypeScript/JSX syntax transpilation: PASS.
- English message catalog syntax transpilation: PASS.
- All `tr("...")` tokens used by the new shell exist in the English catalog: PASS.

## Runtime validation pending
- normal workspace production build;
- light/dark theme review;
- desktop/tablet/mobile review;
- switching Network Type Context across multiple memberships;
- verifying disabled journeys and individual features remain hidden;
- confirming advanced chunks load only when their selected journey is opened;
- product feedback on naming/order/density.

## Iteration 2 contract
Iteration 2 should be refinement: labels, spacing, responsive behavior, navigation ergonomics, and feedback-driven clarity. Do not return to the single-page capability stack.
