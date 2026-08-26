# G6 — Two-Vertical Architecture Proof, Shared UX Composition & Hardening

**Date:** 2026-08-25  
**Status:** IMPLEMENTED IN SOURCE / CERTIFIED BY SOURCE + TYPE-SYNTAX GATES / DEPLOYED SMOKE REQUIRED  
**Baseline:** G5 Alumni Network V1 Certified R2

## Mission outcome

G6 proves the platform with two real verticals rather than only proving TypeScript abstractions. Family remains the mature kinship product. Alumni is now a polished institutional-network product that uses the same trusted-network platform seams without inheriting Family persistence or relationship meaning.

The batch addresses two concrete defects discovered only after G5 became real:

1. Alumni V1 registered polished semantic class names but did not have the corresponding design-system CSS, so the product rendered like raw HTML.
2. Platform Launch Control used bundle names such as `core` and `admin` without vertical scope. Once both Family and Alumni became active, a future bundle rollout could accidentally change another vertical.

Both are fixed in G6.

## Shared UX composition proven by two products

New shared primitives:

```text
components/shared/
  NetworkTopbar.tsx
  NetworkSwitcher.tsx
  NetworkUi.tsx
```

`NetworkTopbar` is now consumed by both Family and Alumni. It preserves the mature Family topbar classes while providing a neutral title/badge/action contract.

`NetworkSwitcher` uses the neutral `fetchMyNetworkMemberships()` contract rather than the legacy Family-bound membership row. It understands vertical identity without exposing `member_id`.

`NetworkUi` provides neutral metric, section-header, empty-state and initials-avatar primitives. Domain-specific content remains owned by each vertical.

## Alumni product-quality pass

`AlumniNetworkApp` is no longer a thin proof screen. It now includes:

- responsive shared topbar and vertical-aware network switcher;
- polished institution-focused Home hero and network metrics;
- member/avatar activity presentation;
- searchable/filterable Directory cards;
- batch/program Cohort cards;
- own-profile editor and trusted connection suggestions;
- member-to-member connection creation;
- Admin import preview and governed commit;
- Guide/privacy cards;
- mobile navigation;
- dedicated Alumni visual tokens and responsive CSS.

The product remains intentionally different from Family. Family emphasizes lineage, memories and relatives; Alumni emphasizes institution, cohort, career discovery and professional/mentor connections.

## Cross-vertical runtime hardening

The G5 dispatch invariant remains mandatory:

```text
active Alumni network
  -> AlumniNetworkApp handoff
  -> Alumni feature catalog/runtime

active Family network
  -> Family shell
  -> Family compatibility feature runtime
```

The strict `Unknown feature key` exception remains in Core. G6 does not weaken it. Instead, vertical ownership is enforced at callers.

Family repository hydration remains skipped for an active Alumni network.

## Launch Control hardening

Migration `046_g6_two_vertical_hardening.sql` makes `platform_feature_flags` vertical-aware and adds vertical-scoped Platform Owner RPCs.

This prevents collisions such as:

```text
Family bundle: core
Alumni bundle: core
```

from being treated as one global rollout unit.

New RPCs:

- `get_platform_vertical_launch_console(vertical_kind)`
- `set_platform_vertical_bundle_rollout(vertical_kind, bundle, ...)`
- `get_platform_network_targets()`

Alumni feature-registry and Playground rows are seeded additively. Existing Family rollout choices are preserved.

## Alumni persistence / tenant hardening

Migration 046 also:

- adds `alumni_network_settings` so institution identity is durable vertical data rather than overloaded into a profile bio;
- preserves the existing `create_alumni_network(...)` signature while writing the new settings table;
- adds `get_alumni_network_overview()`;
- adds composite profile/network constraints and foreign keys for Alumni connections and invitations;
- adds Alumni profile/connection/invitation indexes;
- adds governed `create_alumni_connection(...)` and `get_my_alumni_connections()` RPCs;
- keeps direct authenticated/anonymous access to Alumni settings revoked.

Family tables, Family relationship semantics and S3-A1 construction persistence are unchanged.

## Architecture proof result

G0–G6 now demonstrates the intended tree:

```text
Trusted Network Platform
├── Core
│   ├── network membership/context
│   ├── vertical registry/runtime
│   ├── feature/runtime contracts
│   ├── identity/claiming contracts
│   ├── participation contracts
│   └── construction contracts
├── Shared capabilities
│   ├── network context
│   ├── launch runtime
│   ├── identity claiming
│   ├── participation
│   └── construction orchestration
├── Shared UX
│   ├── topbar
│   ├── neutral network switcher
│   ├── metrics/section/empty/avatar primitives
│   └── common design tokens/layout conventions
├── Family / Kinship vertical
│   └── lineage + memories + family-specific workflows
└── Alumni vertical
    └── institution + cohorts + alumni directory + trusted connections
```

Reuse is now based on proven common mechanics. Domain semantics remain vertical-owned.

## Validation

- complete historical D1 → G6 source gate chain: PASS;
- `validate:g6`: PASS;
- 147 historical `lib/remote.ts` exports preserved;
- 280 accepted G5 files preserved;
- 7 protected Family foundations hash-identical to the certified G5 baseline;
- changed G6 TS/TSX syntax/transpile under TypeScript 5.8.3: PASS;
- accepted source deletions: 0;
- only new database migration: `046_g6_two_vertical_hardening.sql`.

A full Next.js production build is not claimed in this artifact workspace because `node_modules` is not present. Normal CI/Vercel build remains the production compile gate.

## User-facing documentation

Because G6 materially improves Alumni UX and network switching, `USER-GUIDE.md` and `Family-Network-Complete-User-Admin-Guide.docx` are updated.

## Next

**G7 — Generic Platform Productization** is the next architecture/product batch: generic vertical-aware network creation, reusable capability packs/admin shells, stronger platform-level configuration, extension contracts and third-vertical readiness. It must continue to preserve Family and Alumni as independently valuable products rather than collapsing them into a lowest-common-denominator UI.
