# Mission 2 — Runtime Verification Checklist

## Automated/source checks
- [x] `npm run validate:m2` — PASS (19/19 Mission 2 + 14/14 STABILITY-1 chain)
- [x] EN/HI/MR current catalog key completeness — 328/328 each
- [x] All referenced `t("...")` tokens resolve to English canonical catalog
- [x] 181 TS/TSX files parse with 0 syntax errors
- [x] 533 application relative imports checked; 0 missing

## Local build
Run in the normal project environment:

```bash
npm ci
npm run validate:m2
npm run build
npm run dev
```

- [ ] Next.js production build completes.
- [ ] No SSR `window is not defined` regression.
- [ ] No new CSS/autoprefixer warning attributable to Mission 2.

## Professional vertical — creation and isolation
- [ ] Landing/network selection shows Trusted Expertise / Professional Network.
- [ ] Create a professional network and confirm Owner access.
- [ ] Network appears in My Networks and switcher.
- [ ] Data remains isolated from Family, Alumni and other verticals.
- [ ] Professional join code works after migration 054.

## Playground / value journey
- [ ] Open Professional Playground.
- [ ] 30+ realistic professionals are visible across several countries.
- [ ] Explorer can switch profession/specialty/service/industry/location projections.
- [ ] Directory finds experts by expertise and geography.
- [ ] Connections shows trusted referral/collaboration relationships.
- [ ] Practice groups/community activity render meaningfully.
- [ ] Case lessons / professional knowledge appear without patient/client-identifying data.
- [ ] Intelligence can answer expertise/referral questions and shows evidence.
- [ ] Back to network selection works.

## i18n smoke
Check English, Hindi and Marathi on:
- [ ] network selection / onboarding common actions;
- [ ] Professional Home header and common navigation;
- [ ] directory/search common actions;
- [ ] import/member/common buttons;
- [ ] language switching does not require refresh and falls back safely to English for any future missing token.

## Existing-product regression
- [ ] Family opens with accepted post-NX layout unchanged.
- [ ] `window.nxFeatures = true` still enables NX Review Mode.
- [ ] Alumni opens.
- [ ] Organization, Business Trust and Franchise open.
- [ ] Playground → network selection works for existing products.

## Milestone decision
Mark Mission 2 **RUNTIME VERIFIED** only after the build and primary Professional Playground/creation journey pass. Otherwise remain inside Mission 2 hardening; do not start the graph-platform mission merely because source gates are green.
