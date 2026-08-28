# Mission 1 — Runtime Verification Checklist

**Status:** STATIC HARDENING PASS · LIVE RUNTIME OPEN (environment-blocked)  
**Goal:** one coherent founder/runtime milestone verification after source implementation.

## A. Build / startup

- [ ] From a clean dependency state, run `npm install` (or the repository-standard clean install).
- [x] Run `npm run validate:mission1` — PASS (11/11 signature + 9/9 critical Family i18n + 8/8 NX-6 compatibility).
- [ ] Run `npm run build`.
- [ ] Start the app and verify no new console/runtime errors on the Family path.

## B. First 30 seconds — product clarity

Use Family Playground first.

- [ ] Home does **not** look like the old Today/People/Legacy dashboard.
- [ ] “My Family, Through Me” is visually dominant.
- [ ] The viewer identity is obvious.
- [ ] One “connection worth knowing” is obvious without scrolling through multiple feature modules.
- [ ] The relationship explanation is understandable to a novice.
- [ ] The `You → … → relative` path is easy to scan/tap.
- [ ] There is only one Family Moment competing for attention.

## C. Relationship journey

- [ ] Open the spotlight relative.
- [ ] Profile opens cleanly and retains relationship-to-viewer context.
- [ ] “View in Family Tree” focuses the correct person/path.
- [ ] Closest-family buttons open the correct profiles.
- [ ] Empty/small family states remain sensible when no wider-family spotlight is available.

## D. Navigation reduction

- [ ] Desktop primary navigation shows Home, Family and Memories as the principal Family destinations.
- [ ] Advanced destinations are under More rather than permanently crowding the sidebar.
- [ ] Simple users do not unexpectedly receive Explorer-only destinations in mobile More.
- [ ] Admin surfaces remain role controlled.
- [ ] Home is not covered by contextual guide/What's New noise.

## E. Responsive / touch quality

Verify at least:

- [ ] Desktop wide viewport.
- [ ] Tablet / narrow laptop.
- [ ] Mobile around 390–430 px.
- [ ] Small mobile around 360 px if available.

Check:

- [ ] no dead desktop columns;
- [ ] no clipped relationship path;
- [ ] horizontal path scrolling is deliberate and usable on mobile;
- [ ] buttons have comfortable touch targets;
- [ ] no modal/page creates a tiny nested content viewport;
- [ ] closest-family strip and Family Moment remain readable without cramming.

## F. Language quality — critical Family journey

Repeat the critical path in **English, Hindi and Marathi**:

- [ ] sign-in / sign-up / password recovery;
- [ ] setup entry;
- [ ] join-family code path;
- [ ] create-family path;
- [ ] guided Excel import modal;
- [ ] Home signature experience;
- [ ] Family Tree labels/badges;
- [ ] Profile tabs/relationship explanation;
- [ ] Memories primary actions and Quiet Digest controls;
- [ ] appearance/theme accessibility labels;
- [ ] Family shell / Playground / pending-approval messages.

Record any untranslated English found in these paths as a Mission 1 bug.

**Important:** Deep Explorer/Admin and non-Family vertical locale completeness is not certified by this mission and remains future quality work.

## G. Regression sanity

- [ ] Existing Family data loads.
- [ ] Add relative still works.
- [ ] Import still works.
- [ ] Memories still load/create under existing permissions.
- [ ] Relationship profile/tree navigation still works.
- [ ] My Networks/network switching still works.
- [ ] Alumni and productized vertical handoff still opens normally.
- [ ] No schema migration/RLS change is required.

## Automated hardening completed

- [x] TypeScript/TSX syntax-transpile: 170 files.
- [x] Relative import integrity: 483 local imports.
- [x] Family signature pure-domain runtime smoke.
- [x] Full NX compatibility chain through NX-2 / G1.3 / G2.
- [ ] Next.js production build/start — blocked because dependencies cannot be restored in the current execution environment (`EAI_AGAIN`; `next` unavailable locally).

## Runtime decision

- **PASS:** mark Mission 1 VERIFIED and cut the milestone release artifact.
- **ISSUES:** keep the mission open, fix the observed regression/UX/i18n issues as one hardening window, rerun this checklist, then close.
