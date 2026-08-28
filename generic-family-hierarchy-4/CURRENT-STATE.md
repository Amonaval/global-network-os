# Generic Network OS — Current State

**Updated:** 2026-08-27  
**Purpose:** compact operational truth. Keep this short; move history to roadmap/status/archive.

## Active milestone — Mission 1: Signature Product Experience & Quality Gate

**Source implementation:** complete. **Runtime verification:** open.

Family Home now uses **My Family, Through Me** as the primary experience instead of the NX-6 `Today / People / Legacy` stack. The viewer, one wider-family connection, explicit relationship path, closest-family context and exactly one Family Moment form the primary composition. Advanced Family destinations are progressively disclosed under More.

A pure `lib/family-signature.ts` domain seam keeps spotlight/moment logic independent of React/DOM for future native reuse. The critical Family journey now has source-level English/Hindi/Marathi coverage across auth/recovery, setup/join/import, Home, Tree, Profile, Memories, shell and appearance controls. Deep Explorer/Admin and non-Family locale completeness are **not yet certified**.

Source gates pass **11/11 + 9/9 + 8/8**. A production build remains open because dependency installation could not complete in the implementation workspace. See `MISSION-1-RUNTIME-VERIFICATION-CHECKLIST.md`.

## Product

Five product verticals exist on the Generic Network OS foundation:
- Family
- Alumni
- Organizational Intelligence
- Business Trust
- Franchise

Family is the strongest real-user/product-quality proving ground. The platform already contains substantial cross-cutting capability: structured networks, vertical runtime/composition, claiming/membership foundations, participation, guides, Playground/showcase support, themes/mobile work, internationalization foundations, community concepts, trusted introductions and network intelligence experiments.

## Architecture direction

- Core + reusable capabilities + explicit vertical semantics.
- Network isolation is non-negotiable.
- Membership and network-scoped profile/entity are distinct concepts.
- Prefer additive, decoupled modules and preserve existing standalone behavior.
- One person may eventually participate in many isolated networks through a trusted identity layer.

## Intelligence status

G9/G9.1 demonstrated Network Intelligence plus a decoupled Network OS ↔ Knowledge Hub/RAG integration hypothesis.

**Decision:** park further intelligence-quality hardening until real data, repeated usage and meaningful evidence justify re-entry. Preserve the foundations; do not make RAG/Ollama mandatory for Network OS.

## Strategic focus now

1. Raise the product from capable to **remarkable/self-explanatory**, exposing substantially less UI.
2. Preserve the Family signature direction (**My Family, Through Me** + **One Family Moment**) without allowing Family to consume the entire roadmap.
3. Evaluate globally relevant commercial verticals, beginning with **Professional Expertise & Referral** and **Industry / Trade Ecosystem** concepts; treat Healthcare Provider Collaboration as high-potential/higher-regulation.
4. Treat complete internationalization, mobile-first/native portability and accessibility as product-quality gates.
5. Evolve hierarchy into a broader typed graph platform only when validated use cases require it; never create a universal readable graph.
6. Prefer institutional-anchor distribution and measurable paid outcomes over expensive founder-by-founder persuasion.
7. Reconcile the Network Effect track with this broader portfolio before selecting the next implementation mission.

## NE track snapshot

- **NE-1:** Multi-Network Identity & Membership Experience
- **NE-2:** Trusted Network-to-Network Linking
- **NE-3:** Cross-Network Discovery & Introductions
- **NE-4:** Community Umbrella Model
- **NE-5:** Mass Onboarding & Network Seeding
- **NE-6:** Organic Growth Engine
- **NE-7:** Product Storytelling / Market Education
- **NE-8:** Network Operations & Institutional Anchor Growth

The sequence is **not automatically accepted**. Before implementation, compare it with current code/contracts and challenge dependencies, privacy boundaries and product value.

## Current product consolidation

NX-1 through NX-5 established Family return, preservation, participation and belonging primitives. NX-6 consolidated them into `Today / People / Legacy`, but the post-NX review found that composition still exposed too much product structure. **Mission 1 supersedes the NX-6 Home composition** while retaining its useful underlying capabilities, account/menu simplification and profile hierarchy. No new schema/RLS/cross-network exposure is introduced by Mission 1.

## Validation / release discipline

For meaningful missions use the existing lifecycle:

**IMPLEMENT → VALIDATE → GUIDE → PLAYGROUND (where useful) → LAUNCH CONTROL → WHAT'S NEW → ROADMAP/STATUS → CLOSE**

Deliver affected/new files only where practical and preserve repository hierarchy.

## NX-1 — current implementation
- `My Networks` is now a first-class cross-vertical experience.
- The signed-in account acts as the minimum trusted-person anchor; no global profile merge is introduced.
- Network-local profiles/entities remain vertical-owned and privacy-isolated.
- Family shell now uses the neutral cross-vertical switcher.
- My Networks includes a five-vertical Playground entry and explicit identity/privacy explanation.
- Neutral membership projection now preserves all five registered `vertical_kind` values.

## NX-2 current product state
Family Home now includes an additive Living Family loop: a daily meaningful family action, graph-aware relative rediscovery, generational connection and preservation signals. It reuses existing Family data/permissions and introduces no new persistence or cross-network exposure. Runtime milestone verification remains pending.

## NX-3 current product state
Family Home now includes Family Time Machine & Generational Legacy: evidence-bound eras from existing births/life events/memories plus a preservation-risk layer showing what family context may otherwise be lost. No generated history, schema migration or cross-network exposure. Runtime milestone verification remains pending.

## NX-4 current product state
Family Participation now starts with a Family Growth Relay: one prioritized useful gap, relationship-aware context, privacy-safe “ask someone” hand-off, and a direct admin seam into secure invitations. Existing governed contribution/claiming permissions remain authoritative; no schema or cross-network change. Runtime milestone verification pending.

## NX-5 current product state
Family Home now includes Family Connection & Belonging: a relationship-aware wider-family spotlight, plain-language kinship, a clickable `You → … → relative` path, and derived Family Circles for generation/place/close-family context. It reuses current Family graph data only; no new persistence, contact exposure or social-feed mechanics. Runtime milestone verification pending.

## NX-6 current product state — SUPERSEDED ON FAMILY HOME
NX-6 introduced `Today · People · Legacy`, shared account actions, focused Profile tabs and My Networks progressive disclosure. Mission 1 intentionally supersedes only the Family Home composition with **My Family, Through Me**; the underlying NX primitives remain available and the compatibility source gate continues to pass.

## 2026-08-27 — Mission 1 runtime hardening milestone

Mission 1 now passes source/static hardening: 11/11 signature checks, 9/9 critical Family EN/HI/MR checks, 8/8 NX-6 compatibility, the full NX-5→NX-2/G1.3/G2 source regression chain, 170-file TS/TSX syntax-transpile, 483 relative-import integrity checks and a pure-domain Family signature smoke. Live Next.js build/browser certification remains open only because the execution environment could not restore dependencies (`EAI_AGAIN`; no local `next`). Do not call Mission 1 runtime VERIFIED until `npm ci`, `npm run build` and the manual viewport/language checklist pass in a normal environment.

