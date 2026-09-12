# NF-7 — Governed Introduction & Consent

## Mission outcome
NF-7 converts a shortlisted NF-6 route into a person-to-person consent handshake without weakening federation privacy. A route is only a suggestion; a connection is created only when the target explicitly accepts.

## Implemented flow
1. Requester creates an NF-6 purpose-scoped request.
2. Requester explicitly shortlists an eligible NF-6 route.
3. NF-7 revalidates the current purpose opt-in, Passport visibility, approved source/target affiliation, active umbrella and open request.
4. Requester supplies an alias, introduction reason and a response channel intended only for this introduction.
5. Target receives the alias, request context, message and institutional Trust Receipt, but not the requester response channel.
6. Target explicitly accepts or declines.
7. On acceptance, the requester response channel becomes visible and the target may deliberately provide a response channel of their own.

## Privacy and governance invariants
- `route != introduction` and `introduction request != accepted connection`.
- Only shortlisted NF-6 routes can create NF-7 introductions.
- NF-7 never reads phone/email/contact fields from Family, Alumni, Organization or other source profiles.
- Contact notes are deliberately supplied for one introduction and cross parties only after acceptance.
- Acceptance does not create a reusable membership, friendship, endorsement or global contact permission.
- Acceptance is revalidated against current NF-5 opt-in, Passport purpose/visibility and NF-2 federation paths.
- Decline/cancel reveals no cross-party private response channel.

## Runtime architecture
Added:
- `core/federation/governed-introductions.ts`
- `capabilities/federation/governed-introductions-remote.ts`
- `components/GovernedFederatedIntroductions.tsx`
- `supabase/migrations/076_nf7_governed_federated_introductions.sql`
- `scripts/nf7-governed-introductions-gate.mjs`

Launch Control capability: `*.advanced.governed_introductions`, bundle `federation`, default `test`.
The component is dynamically imported so basic My Networks runtime does not eagerly load NF-7.

## Persistence
`federated_introductions` stores request/route provenance, target scoped profile, requester/target identities, deliberately supplied introduction data, trust-path snapshot, status and timestamps. Direct table privileges remain revoked; audited RPCs are the boundary.

## Validation status
- NF-7 source/privacy architecture gate: PASS.
- i18n visible-literal audit: PASS.
- Full NF-1 through NF-8 TypeScript/import/build sweep: intentionally deferred to NF-8 closure per founder validation plan.
- Integrated Supabase/browser runtime verification: intentionally deferred until NF-8 is implemented and the federation ZIPs are applied sequentially.

## Next mission
NF-8 — Outcome + Trust Receipt. Capture whether an accepted introduction produced useful progress/outcome, without converting outcomes into a simplistic public reputation score.
