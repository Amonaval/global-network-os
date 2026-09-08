# XP-7 — Guide, What's New & Readiness Closure

Status: **SOURCE CLOSED / RUNTIME CERTIFICATION PENDING**

XP-7 closes the cross-vertical product-parity program at source level without replacing mature vertical-specific experiences with generic copies.

## 1. Contextual Guide

A shared `core/guide/contextual-guide.ts` registry now covers all released verticals:

- Family
- Alumni
- Housing Society
- Family Association
- Association / Community
- Organization
- Business Trust
- Franchise
- Professional

The registry is role-aware (`owner`, `admin`, `member`), vertical-aware and task-based. Productized verticals and Alumni render it through `NetworkContextualGuide`. Family keeps its mature `GuidePortal` and existing richer guide flow.

Guide actions route to real application surfaces such as Explorer, Connections, Community, Admin, Contribute and Launch Control rather than dead help cards.

## 2. What's New

`NetworkWhatsNew` reuses the existing persisted feature-announcement infrastructure:

- `fetchMyFeatureAnnouncements`
- `markFeatureAnnouncementSeen`
- existing feature-announcement versions/read state
- vertical feature catalogs and `featureToView` routing

Only announcements relevant to the current vertical are surfaced. Opening or dismissing an announcement records its seen state. Family's mature announcement behavior is preserved.

No migration `095` is required because XP-7 does not create a second announcement/read-state persistence model.

## 3. Network Health / Readiness

`core/readiness/network-health.ts` evaluates only signals already available to the current application surface. Potential checks include:

- profile completion
- pending invitations
- unclaimed profiles
- structural setup
- pending admin/contribution work
- import issues when known
- active administrators
- storage usage when known
- active capabilities

Unknown signals are omitted rather than guessed. The shared Admin Center renders the result through `NetworkHealthPanel`.

## 4. Final regression matrix

`buildXp7RegressionMatrix()` generates the final cross-vertical matrix from:

- 9 released verticals
- 6 actor states: Owner, Admin, Member, Invited, Claimed, Anonymous
- 4 lifecycle states: Active, Archived, Restored, Hard-deleted

This produces **216 explicit matrix cells**. The source gate certifies that the matrix remains exhaustive. Runtime verification of each meaningful state transition remains part of the staging checklist.

## 5. Cumulative build-closure repairs included

The final XP-7 checkpoint is deliberately cumulative and contains fixes for handoff defects found after affected-only XP-2 → XP-6 packages:

1. `components/shared/NetworkParticipationAdmin.tsx` is present, fixing the reported Next.js module-not-found error from `TemplateNetworkApp.tsx`.
2. `core/participation/contracts.ts` is additive: mature Family/Alumni participation contracts and XP-6 generic invitation contracts coexist. XP-6 no longer replaces exports older adapters still import.
3. `lib/api-client.ts` uses explicit `payload.ok === false` narrowing before accessing failure payload fields.
4. XP-2 semantic i18n regressions were corrected so machine values such as `owner`, `unsure` and `low` are never replaced by translated display strings in authorization/status comparisons.
5. Migration `091_xp01_runtime_closure.sql` is present in the final full baseline.

## 6. Migration sequence

The intended cumulative sequence is:

- `090_xp0_network_lifecycle_safety.sql`
- `091_xp01_runtime_closure.sql`
- `092_xp3_quick_start_activation.sql`
- `093_xp5_backup_export_recovery.sql`
- `094_xp6_participation_parity.sql`

XP-7 requires no new schema migration.

## 7. Validation status

Source validation includes:

- XP-7 source/contract gate
- AST visible-literal i18n audit
- XP-6 → XP-0 inherited XP gates
- platform parity gate
- HS-0 → HS-6 chain
- FCA-0 chain
- TS/TSX parse/transpile validation
- relative-import existence audit

The final source gate additionally rejects translated display tokens in role/status/kind machine comparisons.

An actual dependency-installed `next build` could not be completed in the packaging environment because npm registry DNS was unavailable (`EAI_AGAIN registry.npmjs.org`) and the environment had no package cache. Therefore this checkpoint is not labelled Next-build/runtime certified. Run `npm ci` and `npm run build` in a dependency-connected environment before staging deployment.

## 8. Closure stance

XP-0 → XP-7 are now **source-complete** as a cumulative checkpoint. Broad production readiness still requires the runtime verification checklist, staging migrations, Storage/email integrations and representative cross-vertical browser tests. No runtime certification is implied by source-gate completion.
