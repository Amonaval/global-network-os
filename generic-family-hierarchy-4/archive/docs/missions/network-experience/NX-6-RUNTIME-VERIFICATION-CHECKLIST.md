# NX-6 — Runtime Verification Checklist

Use this for the milestone check. Do not re-test the entire application.

## 1. Family Home — 3 minutes
- [ ] Home opens without a giant vertical stack of feature sections.
- [ ] Hero, family snapshot and first useful action are understandable without explanation.
- [ ] **Today · People · Legacy** tabs switch cleanly.
- [ ] Today shows the Living Family experience and digest when enabled.
- [ ] People shows a real relationship-aware relative/path.
- [ ] Legacy shows the Time Machine/preservation experience.
- [ ] Family moments can show the next birthday **or anniversary** from real data.
- [ ] Tree, preserve-memory and add-relative actions still navigate correctly.

## 2. Global shell — 2 minutes
- [ ] Family has one clear account/menu trigger rather than scattered Profile/Guide/Sign out buttons.
- [ ] Account menu opens Profile, My Networks and Guide and can Sign out.
- [ ] Open one Alumni and one Organization/Business/Franchise sample; account/menu placement feels consistent.
- [ ] Playground surfaces say Explore / Playground and do not imply a real signed-in profile.
- [ ] Network switching still works and Browser Back returns to the prior Network OS surface.

## 3. Profile — 2 minutes
- [ ] Desktop/tablet profile appears as an elevated panel with background separation.
- [ ] **Overview · Story · Family** tabs work and do not lose existing content.
- [ ] Relationship/profile actions still work.
- [ ] On mobile, profile becomes a usable bottom sheet without horizontal overflow.

## 4. My Networks / onboarding — 2 minutes
- [ ] Network memberships are the primary content and fit the available width.
- [ ] Safe Playgrounds is collapsed until requested and opens correctly.
- [ ] Privacy/identity detail is collapsed until requested and remains understandable.
- [ ] Setup/onboarding has no empty left column, giant 1300px option card or nested Playground/product sections.

## 5. Trust / responsive smoke — 1 minute
- [ ] No profile, Family graph or vertical-specific data leaks between networks while switching.
- [ ] Desktop and mobile have no obvious overlap, clipped controls or excessive blank columns.
- [ ] Dark/light themes remain readable on Home, account menu, profile and My Networks.

**Pass criterion:** the product feels materially easier to understand and navigate than NX-1→NX-5 stacked together. Log genuine blockers/regressions for the milestone hardening window; do not turn minor taste differences into another feature mission.
