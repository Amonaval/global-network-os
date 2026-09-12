# Mission 1 — Signature Product Experience & Quality Gate

**Date:** 2026-08-27  
**Recommended effort:** HIGH  
**Status:** SOURCE IMPLEMENTED · RUNTIME VERIFICATION OPEN

## Outcome hypothesis

Generic Network OS already contains more Family capability than the primary experience can explain. Mission 1 tests whether substantially less visible UI, centered on one relationship-first journey, can make the product immediately understandable and memorable without adding another Family feature stack.

The signature thesis is:

> **My Family, Through Me** — open the family around the signed-in person's point of view, answer “Who is this person to me?”, show the path, and surface exactly one useful family moment rather than a dashboard of competing modules.

## Included

- Replace the NX-6 `Today / People / Legacy` Home composition with one relationship-first signature experience.
- Elevate wider-family discovery and the explicit `You → … → relative` relationship path.
- Keep a compact closest-family strip and exactly one contextual Family Moment.
- Keep preservation, memories, special days and contribution capability underneath; do not render each as an independent Home module.
- Reduce Family primary navigation and move advanced/explorer destinations behind progressive disclosure.
- Keep Profile aligned to the same relationship language.
- Establish a UI-agnostic Family signature domain model for future native/mobile reuse.
- Strengthen English/Hindi/Marathi completeness across the critical Family journey: auth/recovery, setup/join, import, Home, Tree, Profile, Memories, shell and appearance controls.
- Add automated Mission 1 source gates and make the prior NX-6 regression gate compatible with the intentional successor UX.
- Update user guidance and project truth docs.

## Explicitly excluded

- New RAG/LLM capability.
- NE-2 or cross-network linking.
- New Family schema or RLS changes.
- A native mobile application in this mission.
- New social feed, gamification or engagement mechanics.
- Rebuilding the Family graph engine.
- Full translation of every deep Explorer/Admin surface or every non-Family vertical in this milestone. The critical Family journey is the quality gate established here; broader locale closure remains tracked separately.

## Product changes

### Home

The old Home stack is no longer the primary composition. `FamilyHome` now delegates to `FamilySignatureExperience`.

The signature experience presents:

1. the viewer as the center of the family;
2. one wider-family connection worth understanding;
3. a plain-language relationship description;
4. an explicit relationship path;
5. a compact closest-family strip;
6. exactly one Family Moment;
7. secondary tools only behind a small disclosure.

### Navigation

Primary Family navigation is intentionally small:

- Home
- Family
- Memories

Advanced member destinations move behind **More** and retain experience/feature gating. Admin remains role-controlled.

### Portable domain seam

`lib/family-signature.ts` owns deterministic selection of:

- spotlight relative;
- immediate/closest family;
- daily contextual moment.

It imports no React, DOM, `window`, `document` or `localStorage`. The same behavior can therefore be reused by a later native shell.

### Internationalization quality

`lib/i18n.tsx` now uses the English catalog as the canonical key type and requires Hindi and Marathi catalogs to provide every central key at compile time. Interpolation is supported.

Relationship labels are localized through a pure helper. The critical Family path no longer relies on English-only labels for relationship badges/paths, profile relationship copy, onboarding/bootstrap, auth/recovery, primary Memories actions, import assistance or theme accessibility labels.

English-only contextual Excel guide content is not injected into Hindi/Marathi import flows; the localized modal guidance remains available instead.

## Source acceptance

Run:

```bash
npm run validate:mission1
```

Expected:

- Signature quality gate: **11/11**
- Family critical-journey i18n gate: **9/9**
- NX-6 compatibility gate: **8/8**

All three pass in the implementation workspace.

A TypeScript parser/transpile sanity pass also succeeds for the modified TS/TSX files.

## Build environment note

A production `next build` could not be executed in this workspace because dependency installation timed out and left an incomplete `node_modules`; `next` was therefore unavailable. This is an environment/dependency-install limitation, not a recorded build success or failure.

Full build/runtime verification remains an explicit gate before Mission 1 is marked VERIFIED/RELEASED.

## Runtime acceptance

See `MISSION-1-RUNTIME-VERIFICATION-CHECKLIST.md`.

The most important question is not “does every card render?” It is:

> Does a novice understand within roughly one minute that this product helps them understand **their family through their own relationships**, rather than presenting another family dashboard?
