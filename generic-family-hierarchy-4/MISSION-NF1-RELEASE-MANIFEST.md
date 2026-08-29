# NF-1 Release Manifest — Network Passport

## Release intent
Introduce a persisted, governed outward identity for independently governed networks so federation can operate on explicit network-level publication rather than private member graphs.

## Database
- `supabase/migrations/070_nf1_network_passport.sql`
  - `network_passports` table
  - admin save RPC
  - member-scoped Passport query RPC
  - anonymous public Passport RPC
  - TEST-by-default Launch Control registration

## Core/runtime
- `core/federation/network-passport.ts`
- `capabilities/federation/passport-remote.ts`
- `core/features/advanced-network.ts`

## Product surfaces
- `components/NetworkPassportManager.tsx`
- `components/PublicNetworkPassport.tsx`
- `components/MyNetworksHome.tsx`
- `app/passport/[slug]/page.tsx`
- `app/globals.css`
- `lib/i18n/messages/en.ts`
- `components/FederationDistributionSupernode.tsx` (i18n hardening inherited from NF-0A)

## Validation
- `scripts/nf1-network-passport-gate.mjs`
- `package.json` adds `validate:nf1`
- Source gate PASS
- i18n AST audit PASS
- new-file TypeScript syntax transpile PASS
- full typecheck pending complete dependency install

## Durable artifacts updated
- `MISSION-NF1-NETWORK-PASSPORT.md/.docx`
- `MISSION-NF1-RUNTIME-VERIFICATION-CHECKLIST.md`
- `USER-GUIDE.md`
- `CURRENT-STATE.md`
- `MISSION-STATUS.md`
- `ROADMAP.md`
- `MASTER-VISION-PLAN.md`
- `STRATEGIC-PRODUCT-REVIEW.md`
- `NEXT-SESSION-PROMPT.md`
- `TRUSTWEAVE-PUBLIC-PRODUCT-PROFILE.html`
- `TRUSTWEAVE-PRODUCT-EVOLUTION-JOURNEY.html`

## Deployment prerequisite
Apply migration 070 before enabling `*.advanced.network_passport` beyond TEST.
