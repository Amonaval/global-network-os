# XP-0 → XP-7 high-level runtime regression guide

This guide is the browser/staging closure checklist for the cross-vertical parity program. Source gates are necessary but do not replace this runtime matrix.

## Released verticals
Family, Alumni, Housing Society, Family Association, Association / Community, Organization, Business Trust, Franchise, Professional.

## P0 smoke — run for every vertical
1. Create/open network as Owner; switch into it from My Networks.
2. Home renders with correct vertical name/theme and no console/RPC error.
3. `Choose how to start` changes to the next step instead of appending below the fold.
4. Test Build Together, Excel/Workbook, and Start Small where offered.
5. Open Admin. It must load without RPC errors (especially no ambiguous `status`).
6. Open Guide, What's New, Network Health/Readiness and verify actions route to real surfaces.
7. Switch EN → HI → MR and revisit Home/Admin/Guide. Authorization/status behavior must remain unchanged.

## XP-0 lifecycle safety
- Member: Leave removes only own membership and preserves network/member data.
- Owner: Archive makes network inactive, removes normal active use, and shows it under Archived networks.
- Owner: Restore returns network and prior membership states to active where appropriate.
- Owner: Hard Delete requires exact name, uses server Storage API, removes both `profile-photos/<network-id>/...` and `community-media/<network-id>/...`, then relational data.
- Failure test: missing/invalid service role or storage deletion failure must stop relational finalization and leave network archived.
- Verify purge receipt / residue result where exposed.

## XP-1 guided workbook onboarding
For every vertical download the template, open in Excel, upload unchanged, validate, preview and confirm where safe.
- Workbook opens with README / Column Guide and legal sheet names.
- Required/optional fields and accepted values are understandable.
- Invalid email/enum/date/boolean is rejected with exact row/column reason.
- Duplicate stable IDs are rejected or handled per policy.
- Broken cross-sheet reference is rejected.
- Productized vertical commit creates/updates entities and relationships.
- Housing Society commit uses domain history-aware importer.
- Alumni commit preserves alumni profile semantics.
- Family mature workbook behavior still works.

## XP-2 i18n
- EN, HI, MR selector works on released shells.
- No important user-visible English-only copy on Home/Admin/Guide/Import/Lifecycle.
- Role/status/kind logic does not change when language changes.
- Machine statuses remain canonical (`owner`, `admin`, `active`, `pending`, etc.).

## XP-3 Quick Start / activation
- New empty network shows Quick Start.
- Steps are role-aware and actionable.
- Completing real actions updates progress after reload.
- Dismiss survives reload and Resume works.
- Verify vertical-specific first actions (society building/flat, alumni cohort, organization team/project, franchise branch, business profile, professional profile, etc.).

## XP-4 shared Admin Center
Owner and Admin:
- Overview/readiness loads.
- Members/roles load and authorization differs correctly for Owner vs Admin.
- Invitations/claims opens and loads.
- Import opens correct guided importer.
- Corrections/contributions load and review actions work.
- Lifecycle available only with correct permissions.
- Backup/export works for admins.
- Launch controls remain platform-owner governed.
Member: Admin should be hidden/denied.

## XP-5 backup/export/recovery
- Download logical JSON backup.
- Download XLSX human-readable export.
- Verify network metadata, schema version and export timestamp.
- Verify network-scoped datasets are present and access/security credentials are excluded.
- Verify media manifest is present where media exists; do not expect media bytes inside the logical backup.
- Confirm UI/documentation does not claim unsupported one-click full restore.

## XP-6 invitation / claiming / correction
- Owner creates member invitation.
- Owner creates admin invitation; normal Admin cannot invite another Admin if policy says owner-only.
- Email send works when provider is configured; otherwise private link fallback is usable.
- List invitations in Admin (no ambiguous `status`).
- Resend rotates token/extends lifecycle; revoke invalidates invitation.
- Expired invitation is rejected.
- Acceptance activates membership and active network.
- Existing target profile can be claimed once; duplicate identity claim is blocked.
- Correction/contribution accept/reject writes audit history.

## XP-7 Guide / What's New / Readiness
- Contextual Guide changes tasks by vertical and role.
- Guide actions open real screens.
- What's New displays an eligible unread announcement, Open routes correctly, Mark Read persists.
- Dynamic feature keys do not cause TypeScript/runtime routing errors.
- Network Health shows only known signals and does not invent unavailable metrics.
- Readiness reacts to members/profiles/invitations/pending work/admin coverage.

## Housing Society deep regression
In addition to XP flows: units/buildings, residents/households, ownership/tenancy history, vehicles/parking, notices, complaints, vendors/contracts, amenities/bookings, maintenance/dues, funds/budget, committee/meetings/resolutions/votes/documents, visitors/staff/move/NOC/assets/compliance/emergency, pilot metrics/pricing.

## Family Association deep regression
Families + people, household links, annual membership year, representative, renewal/payment/carry-forward, roles/designation history, association admin, activities and media.

## Role matrix
At minimum verify Owner, Admin/co-admin, Member, Invited user, Claimed user, Anonymous/Public. Lifecycle states: Active, Archived, Restored, Hard-deleted.

## Recommended execution order
1. `npm run build`.
2. Apply migrations through `095_xp7_admin_status_ambiguity_hotfix.sql` on staging.
3. Run `npm run validate:xp7` and `npm run validate:xp7-admin-runtime`.
4. P0 smoke all 9 verticals.
5. Deep test Housing Society + Family Association + Family.
6. Test invitation using a second real account/email.
7. Test archive/restore on disposable network.
8. Test hard delete only on a disposable network containing at least one object in each storage bucket.
9. Export backup before destructive tests.

## Runtime certification rule
Do not call the platform runtime-certified until the build, staging migrations, nine-vertical P0 smoke, role matrix, invitation flow, archive/restore and disposable hard-delete/storage residue checks have all passed.
