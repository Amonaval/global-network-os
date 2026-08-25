# G5 — Alumni Network V1

Status: **CERTIFIED**

## Objective
Prove the generic network platform with a real second vertical while preserving Family behavior and keeping Alumni persistence/domain semantics independent.

## Delivered
- Durable `vertical_kind` persisted on `networks` and `network_settings`; all existing rows backfill to `family`.
- Separate Alumni persistence: `alumni_profiles`, `alumni_connections`, `alumni_invitations`.
- Alumni network creation and switching through the shared network context.
- Alumni Home, Directory, Cohorts, Connections/Profile, Guide, Admin and read-only Playground.
- Verified-email Alumni claiming through the G2 identity seam.
- Explicit Alumni invitation acceptance through the G2 participation seam.
- Excel/CSV import preview and governed commit through the G3 construction seam.
- Alumni feature catalog and active G4 app composition.
- Family repository hydration is skipped when the active vertical is Alumni.

## Security and privacy
- Alumni application tables expose no direct anon/authenticated table privileges; security-definer RPCs are the application boundary.
- Directory email is returned only for the profile owner or network admins.
- Hidden/private Alumni profiles are not exposed to ordinary members.
- One account cannot silently claim two Alumni profiles in the same network.
- Invitations require explicit acceptance; opening a link does not auto-join.
- Alumni code does not use `family_members`, `family_relationships`, Family intake RPCs, or kinship semantics.

## Compatibility
- Existing Family data remains `family` after migration 045.
- Existing Family RPC names and UI flows remain unchanged.
- 147 historical `lib/remote.ts` exports remain present.
- 269 accepted G4 files remain present; no accepted file is deleted.

## Migration
Apply after migration 044:

`045_g5_alumni_network_v1.sql`

## Validation
- Full historical source gates D1→S3-A1: PASS during G5 certification.
- G1.1→G5 architecture gates: PASS.
- Changed G5 TS/TSX syntax/transpile under TypeScript 5.8.3: PASS.
- Full `next build` is not certified in this artifact workspace because project dependencies are not installed here.

## Known V1 boundaries
- Alumni invitation resend/revoke UI is deferred until pilot feedback.
- Alumni connections are represented in the domain schema, while richer connection editing/recommendations remain post-V1.
- Construction matching remains intentionally simple for Alumni V1; G6 will harden cross-vertical behavior using real Family + Alumni evidence.

## Next
**G6 — Two-Vertical Architecture Proof & Hardening**

## G5 certification hotfix — vertical feature dispatch

A post-certification runtime smoke test found that opening the active Alumni vertical could throw `Unknown feature key: alumni.core.home` before the Alumni workspace rendered. The strict unknown-key exception in `core/features/runtime.ts` was correct; the caller was wrong.

Root cause: `NetworkApp` resolved the Alumni composition, but still derived Family navigation/announcement visibility through the historical Family-only `lib/features.ts` compatibility facade before handing rendering to `AlumniNetworkApp`.

Correction:

- `NetworkApp` resolves `activeVerticalKind` once and hands an active Alumni network to `AlumniNetworkApp` before Family-only feature evaluation.
- the Family `hasFeature` helper additionally fails closed unless `activeVerticalKind === "family"`, protecting transient setup/network-switch states.
- the generic feature runtime continues throwing on unknown keys so future cross-catalog misuse remains visible rather than silently accepted.
- the G5 gate now enforces dispatch ordering and the Family-only feature guard.
- the G4 historical gate was updated only for the equivalent `activeVerticalKind` refactor; its composition guarantees remain unchanged.

Certification after the fix: complete D1 → G5 source gate chain PASS; focused TypeScript 5.8.3 transpile PASS.

## Superseded baseline note — G6

G5 Certified R2 remains the accepted historical Alumni V1 baseline. G6 subsequently adds shared UX composition, polished Alumni presentation, vertical-scoped Launch Control and additional tenant hardening. Use the G6 release as the current source baseline after applying migration 046.
