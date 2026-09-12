# NF-2 Release Manifest

## Release
- Mission: NF-2 — Governed Network ↔ Umbrella Affiliation
- Date: 2026-08-29
- State: source implemented; deployed DB/runtime smoke required
- Launch Control: TEST by default

## Product changes
- New governed umbrella/federation entity model.
- New Passport-gated affiliation request/review lifecycle.
- New My Networks admin affiliation manager.
- Advanced My Networks capability modules now use dynamic imports as CR-1 first slice.

## Database
- `071_nf2_governed_network_umbrella_affiliation.sql`
- tables: `federation_umbrellas`, `federation_umbrella_admins`, `network_umbrella_affiliations`
- governed RPCs for create/search/request/review/suspend/revoke/read
- feature registration `*.advanced.network_affiliation`

## Security/privacy
- no reuse of M6 peer bridge rows;
- affiliation request requires Federation/Public Network Passport;
- no private member/profile/contact/graph sources are read by the NF-2 migration;
- server-side admin checks are authoritative;
- dynamic imports are not treated as security controls.

## Strategic roadmap additions
- CR-1..CR-4 — Composable Runtime & Lean Capability Delivery
- NC-0..NC-5 — No-Code / Composable Network Type Studio
