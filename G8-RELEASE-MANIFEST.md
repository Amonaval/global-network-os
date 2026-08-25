# G8 Release Manifest — Productized Business Verticals

**Release:** G8 — Organizational Intelligence + Business Trust + Franchise
**Status:** SOURCE CERTIFIED / READY FOR DEPLOYED SMOKE
**Baseline:** G7 Generic Network OS Certified R2
**Date:** 2026-08-25
**Database migration:** `048_g8_productized_verticals.sql` after 047

## Release result

G8 promotes three G7 template proofs into real user-creatable products:
- Organizational Intelligence
- Business Trust Network
- Franchise Network

They share the Generic Network OS affiliation/projection/activity/governance foundations and the productized UI/runtime while retaining domain-specific dimensions, projections, typed relationships and copy.

## Exact affected-file delta

- **Total affected files:** 51
- **Added:** 23
- **Modified:** 28
- **Deleted accepted baseline files:** 0

The release ZIP contains only these affected files and preserves their original folder hierarchy.

### Added files

- `G8-AFFECTED-FILES.txt`
- `G8-IMPLEMENTATION-DASHBOARD.html`
- `G8-PRODUCTIZED-BUSINESS-VERTICALS.md`
- `G8-RELEASE-MANIFEST.md`
- `G8-RUNTIME-VERIFICATION-CHECKLIST.md`
- `capabilities/template-product/composition.ts`
- `capabilities/template-product/features.ts`
- `capabilities/template-product/remote.ts`
- `components/TemplateNetworkApp.tsx`
- `scripts/g8-accepted-g7-baseline.txt`
- `scripts/g8-productized-verticals-gate.mjs`
- `scripts/g8-protected-existing-vertical-foundations.json`
- `supabase/migrations/048_g8_productized_verticals.sql`
- `templates/productized/config.ts`
- `verticals/business-trust/definition.ts`
- `verticals/business-trust/features/catalog.ts`
- `verticals/business-trust/runtime/composition.ts`
- `verticals/franchise/definition.ts`
- `verticals/franchise/features/catalog.ts`
- `verticals/franchise/runtime/composition.ts`
- `verticals/organization/definition.ts`
- `verticals/organization/features/catalog.ts`
- `verticals/organization/runtime/composition.ts`

### Modified files

- `CODEBASE.md`
- `DEVELOPMENT-RULES.md`
- `Family-Network-Complete-User-Admin-Guide.docx`
- `G0-TRUSTED-NETWORK-ARCHITECTURE-BLUEPRINT.md`
- `MISSION-STATUS.md`
- `NEXT-SESSION-PROMPT.md`
- `PROJECT-VISION.md`
- `ROADMAP.md`
- `SUPABASE-SETUP-GUIDE.md`
- `USER-GUIDE.md`
- `VALIDATION.md`
- `app-shell/vertical-capabilities.ts`
- `app-shell/vertical-registry.ts`
- `app-shell/vertical-runtime.ts`
- `app/globals.css`
- `capabilities/affiliation/remote.ts`
- `components/FounderLaunchConsole.tsx`
- `components/NetworkApp.tsx`
- `components/SetupScreen.tsx`
- `components/shared/NetworkActivityHub.tsx`
- `components/shared/NetworkProjectionExplorer.tsx`
- `components/shared/NetworkSwitcher.tsx`
- `core/verticals/contracts.ts`
- `lib/network.ts`
- `package.json`
- `templates/business-trust/definition.ts`
- `templates/franchise/definition.ts`
- `templates/organization/definition.ts`

### Deleted files

- None.

## User-visible capabilities

- normal create flow for all three verticals;
- read-only Playground for all three;
- Home / Explorer / Directory / Community / Places / Connections / Contribute / Admin / Guide;
- Excel/CSV import with multi-value affiliation support;
- Network OS join code;
- verified-email `This is me` claiming;
- claimed-record self edit for ordinary members;
- typed relationships + connection paths;
- events/RSVP, memories/history, milestones, announcements and groups;
- governed contribution/review;
- owner/admin member lifecycle;
- independent Launch Control catalogs/bundles for five active verticals.

## Security hardening

- productized RPCs reject non-G8 verticals;
- direct access to productized tables is revoked;
- internal SECURITY DEFINER helpers remain non-public;
- composite tenant constraints protect entity relationships/contributions;
- one account cannot claim multiple entities in one productized network;
- ordinary users can edit only their claimed entity;
- member removal clears stale active-network state and claimed ownership;
- Family and Alumni foundations are hash-protected by the G8 gate.

## Automated certification

Final complete source chain: **PASS**

`D1 → V1 → CR1/CR2 → S1 → S2 → S3-A1 → G1.1/G1.2/G1.3/G1.4 → G2 → G3 → G4 → G5 → G6 → G7 → G8`

G8 gate:
- 147 historical remote exports preserved;
- 333 accepted G7 files preserved;
- 12 protected Family/Alumni foundations preserved;
- 3 released business verticals verified;
- changed G8 TypeScript/TSX transpile checks pass;
- CSS integrity checks pass.

Full Next.js production build is not claimed because the artifact workspace does not contain installed application dependencies. Vercel/CI build remains a deployment gate.

## User/Admin Guide

`Family-Network-Complete-User-Admin-Guide.docx` was updated for G8 and rendered to 22 pages. All pages were visually inspected after the final edit; the new G8 section renders cleanly.

## Short deployed verification

Use `G8-RUNTIME-VERIFICATION-CHECKLIST.md`.

## Next mission

**G9 — Network Intelligence Layer & Five-Vertical Proof**.

Commercial Platform Foundation moves to G10 and remains evidence-gated.

## Certification hotfix — Alumni navigation typing + membership timestamp

The authoritative G8 release now includes two release-blocking corrections found during real deployment validation:

1. `AlumniNetworkApp.tsx` widens merged navigation surfaces to `VerticalSurfaceDescriptor[]`, fixing the Next.js TypeScript `adminOnly` error.
2. migration 048 uses `network_memberships.joined_at` rather than nonexistent `network_memberships.created_at`.

`validate:g8` includes permanent guards for both regressions. The complete D1→G8 source chain passed after these fixes.

Use the refreshed G8 Certified R2 artifact as the baseline going forward.

## Certification hotfix — Launch Control bundle typing

Real Next.js build validation exposed a TypeScript narrow-literal inference issue in `FounderLaunchConsole.tsx`: calling `.includes(f.bundle)` directly on a concrete vertical's `playgroundExcludedBundles` could infer the parameter as `never`, especially for compositions declaring an empty exclusion array.

Launch Control now widens the value to the shared `readonly string[]` contract before filtering. `validate:g8` permanently guards this call pattern.

No feature behavior or migration changed. Full D1→G8 source chain passed after the fix.

**G8 Certified R3 supersedes the original G8 and Certified R2 artifacts.**


# Certified R4 — Product Experience Completion

**Status:** CERTIFIED  
**Supersedes:** original G8, R2 and R3  
**Database:** no new migration; continue using corrected `048_g8_productized_verticals.sql`.

## R4 purpose

Close the product-experience gap exposed by real screenshots: responsive shell correctness, five-product Playgrounds, persisted Light/Dark/Aurora appearance, and richer living-network Home experience.

## R3 → R4 delta

- Added: **4**
- Modified: **16**
- Deleted: **0**
- Total affected: **20**

## Certified G7 → G8 R4 cumulative release delta

- Added: **29**
- Modified: **31**
- Deleted: **0**
- Total affected: **60**

Exact cumulative list: `G8-AFFECTED-FILES.txt`.

## R4 additions

- `components/ThemeProvider.tsx`
- `components/ThemeSwitcher.tsx`
- `components/shared/NetworkPulse.tsx`
- corrected productized sidebar class/style contract
- container-safe create-network grids
- unified Safe Playgrounds gallery for all five released products
- root Light / Dark / Aurora theme system
- G8 source-gate protections for UX wiring
- User/Admin Guide G8 Product Experience Completion page

## Certification

Complete D1→G8 source/regression chain: **PASS**.

Protected Family/Alumni foundations remain unchanged.
