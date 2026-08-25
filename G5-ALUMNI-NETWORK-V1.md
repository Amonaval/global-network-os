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
