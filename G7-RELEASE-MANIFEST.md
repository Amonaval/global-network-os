# G7 — Generic Network OS Productization & Template Architecture — Release Manifest

**Status:** SOURCE CERTIFIED / DEPLOYED SMOKE REQUIRED  
**Baseline:** Certified G6 — Two-Vertical Proof, Shared UX & Hardening  
**Date:** 2026-08-25  
**Database migration:** `047_g7_generic_network_os.sql` after 046

## Certification summary

- Complete historical source/regression chain **D1 → G7: PASS**.
- `validate:g7`: PASS.
- **147** historical `lib/remote.ts` exports preserved.
- **289** accepted G6 baseline files preserved.
- **7** protected Family foundations remain SHA-256 identical.
- Dual MET projection acceptance test passes with one dataset:
  - `MET → Engineering → 2011 → Computer`
  - `MET → 2011 → Engineering → Computer`
- Changed G7 TS/TSX files pass TypeScript transpile validation.
- CSS brace-integrity validation: PASS.
- No accepted G6 file deleted.

## Release delta

- Added: **44** files
- Modified: **20** files
- Deleted: **0** files
- Total affected: **64** files

The exact list is also stored in `G7-AFFECTED-FILES.txt`.

## Major runtime additions

### Generic Network OS core
- generic entity registry;
- network dimensions and dimension values;
- entity affiliations;
- multiple projection definitions;
- shared activity, RSVP, group and group-membership persistence;
- composite tenant-integrity foreign keys;
- internal SECURITY DEFINER helper lockdown.

### Shared capability/UI engines
- `NetworkProjectionExplorer`;
- generic affiliation runtime/remote adapter;
- `NetworkActivityHub`;
- shared network activity/group runtime/remote adapter.

### Alumni reuse proof
- Explore with configurable projections;
- Community with events/RSVP, memories, milestones, announcements and groups;
- Places from city affiliations;
- profile/import updates synchronize affiliation projections automatically.

### Template architecture
Active:
- Family
- Alumni

Proof/future definitions:
- Organizational Intelligence
- Business Trust
- Franchise
- Education
- Professional
- Association
- Residential
- Supply Chain
- Investor
- Customer Intelligence
- Custom Network

## Migration order

For an environment already on G6:

```text
045_g5_alumni_network_v1.sql
046_g6_two_vertical_hardening.sql
047_g7_generic_network_os.sql
```

Only 047 is new in G7.

## Short deployed verification

Use `G7-RUNTIME-VERIFICATION-CHECKLIST.md`. The intended smoke is Family sanity + both Alumni projection orders + Community activity/RSVP/group + Places + one Alumni↔Family switch.

## Added files

- `G7-AFFECTED-FILES.txt`
- `G7-CAPABILITY-ARCHITECTURE.md`
- `G7-CAPABILITY-REUSE-MATRIX.md`
- `G7-FUTURE-IDEATION-BACKLOG.md`
- `G7-GENERIC-NETWORK-OS-IMPLEMENTATION.md`
- `G7-GENERIC-NETWORK-OS-VISION.md`
- `G7-IMPLEMENTATION-DASHBOARD.html`
- `G7-PLATFORM-TEMPLATE-CONTRACT.md`
- `G7-RELEASE-MANIFEST.md`
- `G7-ROADMAP-TIMELINE.html`
- `G7-ROADMAP-TIMELINE.md`
- `G7-RUNTIME-VERIFICATION-CHECKLIST.md`
- `G7-STRATEGY-PACK-INDEX.html`
- `G7-TEMPLATE-EXPLORER.html`
- `G7-VERTICAL-TEMPLATE-CATALOG.md`
- `GENERIC-NETWORK-OS-VISION.html`
- `app-shell/network-os-runtime.ts`
- `app-shell/template-registry.ts`
- `capabilities/activity/remote.ts`
- `capabilities/activity/runtime.ts`
- `capabilities/affiliation/remote.ts`
- `capabilities/affiliation/runtime.ts`
- `components/shared/NetworkActivityHub.tsx`
- `components/shared/NetworkProjectionExplorer.tsx`
- `core/network-os/contracts.ts`
- `core/templates/catalog.ts`
- `core/templates/contracts.ts`
- `core/templates/runtime.ts`
- `scripts/g7-accepted-g6-baseline.txt`
- `scripts/g7-network-os-gate.mjs`
- `supabase/migrations/047_g7_generic_network_os.sql`
- `templates/association/definition.ts`
- `templates/business-trust/definition.ts`
- `templates/custom/definition.ts`
- `templates/customer-intelligence/definition.ts`
- `templates/education/definition.ts`
- `templates/franchise/definition.ts`
- `templates/investor/definition.ts`
- `templates/organization/definition.ts`
- `templates/professional/definition.ts`
- `templates/residential/definition.ts`
- `templates/supply-chain/definition.ts`
- `verticals/alumni/template.ts`
- `verticals/family/template.ts`

## Modified files

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
- `app/globals.css`
- `components/AlumniNetworkApp.tsx`
- `package.json`
- `scripts/g2-shared-identity-participation-gate.mjs`
- `scripts/g3-network-construction-gate.mjs`
- `scripts/g4-vertical-runtime-gate.mjs`
- `scripts/g6-two-vertical-hardening-gate.mjs`
- `verticals/alumni/features/catalog.ts`
- `verticals/alumni/runtime/composition.ts`

## Deleted files

- None
