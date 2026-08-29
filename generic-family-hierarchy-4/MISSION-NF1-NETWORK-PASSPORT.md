# NF-1 — Network Passport

**Status:** SOURCE IMPLEMENTED · SOURCE-GATED · RUNTIME/DB VERIFICATION PENDING  
**Date:** 2026-08-29

## Why this mission exists
NF-0A proved federation as a distribution concept, but an umbrella must never need a child network's private member graph in order to understand who that network is. NF-1 introduces a governed outward identity for the network itself: the **Network Passport**.

The Passport is the boundary between a private governed network and future federation/discovery/application participation.

## Before → after
**Before:** networks had internal names/settings and NF-0A synthetic distribution candidates, but no explicit outward identity contract.  
**After:** each administered network can create one persisted Passport with explicit visibility, a stable public slug, network-level description, broad geography/origin, capabilities and declared participation scopes. A Passport may remain private, be federation-only, or be deliberately public.

## Implemented
- New `NetworkPassport` contract in `core/federation/network-passport.ts`.
- New `public.network_passports` table in migration `070_nf1_network_passport.sql`.
- Owner/Admin-only `save_network_passport(...)` RPC.
- Authenticated `get_my_network_passports()` RPC for networks the caller already belongs to.
- Anonymous/authenticated `get_public_network_passport(slug)` RPC that returns only Passports explicitly marked `public`.
- `NetworkPassportManager` in My Networks for administered networks.
- Live preview plus `private / federation / public` visibility selection.
- Shareable read-only `/passport/[slug]` product surface.
- Purpose declarations (`participation_scopes`) are inert metadata only; they do not enroll people into applications.
- `directory_discoverable` is recorded for future federation directory work but does not yet create a directory.
- Independent Launch Control key: `*.advanced.network_passport`, TEST by default.
- NF-0A federation UI copy was tokenized so the federation track passes the existing i18n visible-literal gate.

## Deliberately not implemented
- No Network↔Umbrella affiliation rows. That is NF-2.
- No umbrella directory or cross-federation search.
- No member names, member counts, contacts, profile data, relationships, memories, media, or private graph topology in the Passport persistence/RPC.
- No automatic person participation when a network publishes a Passport.
- No application enrollment or consent derived from participation-scope declarations.
- No federation verification badge from an external umbrella yet. `network_admin_reviewed` means only that an authorized network administrator saved the Passport.

## Privacy and governance invariants
1. A Passport describes a **network**, not its people.
2. `federation` visibility is distinct from `public` visibility.
3. Publishing a Passport never publishes member identities or graph topology.
4. Participation scopes are declarations, not consent grants.
5. Only active Network Owners/Admins can save a Passport.
6. The anonymous RPC returns a row only when `visibility='public'`.

## Product value
A network now has a controlled identity it can carry into future federations without surrendering its internal database. This turns federation from an abstract relationship into a product surface ordinary administrators can understand: *who are we, what do we represent, what can we participate in, and what have we chosen to make visible?*

## Anti-cloning / moat contribution
The visible Passport card itself is copyable. The defensible layer is the governed provenance it will accumulate when NF-2 adds approved affiliations and later missions attach trust receipts, purpose-scoped participation and successful outcomes. NF-1 creates the stable network identity anchor needed for that compounding history.

## Compatibility guardrails
- M6 peer Trust Bridges remain unchanged and semantically separate.
- Existing `networks` and `network_settings` tables are not repurposed.
- No existing public member-page RPC is modified.
- No service-role dependency is introduced.
- NF-1 is hidden from normal users unless enabled through Launch Control.

## Validation
- `node scripts/nf1-network-passport-gate.mjs` — PASS.
- `node scripts/i18n-extraction-audit.mjs` — PASS (0 direct visible literals).
- TypeScript syntax transpile for all new NF-1 TS/TSX files — PASS.
- Full `tsc --noEmit` — **environment blocked** because dependency installation timed out and left missing third-party `@types` packages; failures are missing dependency type libraries, not NF-1 diagnostics.
- Database migration and authenticated/public runtime checks remain required in the deployed Supabase workspace.

## Recommended next mission
**NF-2 — Governed Network ↔ Umbrella Affiliation.** Use Network Passports as the outward identity on both sides of an explicit request/review/approve/suspend/revoke affiliation. Affiliation must grant zero implicit person-level access.
