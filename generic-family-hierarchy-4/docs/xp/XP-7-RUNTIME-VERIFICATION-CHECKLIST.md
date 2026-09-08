# XP-7 Runtime Verification Checklist

Use the final XP-7 full checkpoint. Do not certify a row from source inspection alone.

## A. Build and environment

- [ ] `npm ci` succeeds from a clean checkout.
- [ ] `npm run build` succeeds.
- [ ] Environment contains normal public Supabase variables.
- [ ] Server-only `SUPABASE_SERVICE_ROLE_KEY` is configured for permanent purge/export server paths.
- [ ] Migrations 090 → 094 have been applied in order and rerun-safety checked in staging.

## B. Missing-module / cumulative-baseline regression

- [ ] `TemplateNetworkApp.tsx` resolves `./shared/NetworkParticipationAdmin`.
- [ ] Productized Admin opens with the participation module rendered.
- [ ] Family and Alumni participation adapters compile with the cumulative `core/participation/contracts.ts`.
- [ ] No relative TS/TSX/JS import points to a missing local file.

## C. Contextual Guide — each released vertical

Repeat for Family, Alumni, Housing Society, Family Association, Association, Organization, Business Trust, Franchise and Professional.

- [ ] Member sees understandable member tasks only.
- [ ] Admin sees administration tasks.
- [ ] Owner sees owner-appropriate tasks.
- [ ] Platform owner receives Launch Control guidance where supported.
- [ ] Every guide action opens a real working destination.
- [ ] Hindi and Marathi guide copy renders without changing machine role/status behavior.

## D. What's New

- [ ] Relevant unseen announcement appears for the current vertical.
- [ ] Announcement from unrelated vertical capability is not shown.
- [ ] Open Update routes to the configured working surface.
- [ ] Dismiss/mark-read persists after refresh/sign-out/sign-in.
- [ ] A newer announcement version can appear after an older version was seen.
- [ ] Family's existing announcement flow remains intact.

## E. Network Health

- [ ] Profile completion reflects current network data.
- [ ] Pending invitation count reflects XP-6 invitation state.
- [ ] Unclaimed profile signal changes after a valid claim.
- [ ] Pending work changes after correction/contribution resolution.
- [ ] Unknown storage/import signals are omitted rather than fabricated.
- [ ] Health score updates after data/admin setup changes.

## F. Actor/state matrix

For each released vertical, exercise meaningful combinations from the generated 216-cell matrix.

### Actor states
- [ ] Owner
- [ ] Admin/co-admin
- [ ] Member
- [ ] Invited user before acceptance
- [ ] Claimed user
- [ ] Anonymous/public

### Lifecycle states
- [ ] Active
- [ ] Archived
- [ ] Restored
- [ ] Hard-deleted

Expected invariants:

- [ ] Archived network is inactive to normal members but recoverable by owner.
- [ ] Restore returns preserved relational/media data and membership state.
- [ ] Hard-deleted network cannot be reopened and leaves zero network-owned relational/storage residue.
- [ ] Leave removes only the current membership.
- [ ] Public/anonymous access never exposes admin-only guide/readiness actions.

## G. XP-1 → XP-6 runtime regression

- [ ] Choose-how-to-start transitions visibly on first click for Alumni and all productized verticals.
- [ ] Download/fill/upload/validate/preview/confirm workbook round trip works for every released vertical.
- [ ] XLSX sheets with `/`, `:`, `?`, `*`, `[`, `]`, `\\` concepts download with legal deterministic sheet names.
- [ ] Quick Start persists dismiss/progress state and every action works.
- [ ] Shared Admin Center modules navigate to working surfaces.
- [ ] JSON backup and XLSX export download and contain expected network-scoped data.
- [ ] Invitation send/manual-link fallback, resend, revoke, expiry and accept work.
- [ ] Duplicate identity claim is rejected.
- [ ] Correction accept/reject writes audit history.
- [ ] Permanent deletion uses Storage API and does not issue direct SQL deletion against `storage.objects`.

## H. Runtime certification record

Record tested commit/checkpoint, Supabase project/environment, migration versions, browser/device, tester, date, failures and evidence links before changing mission status to runtime-certified.
