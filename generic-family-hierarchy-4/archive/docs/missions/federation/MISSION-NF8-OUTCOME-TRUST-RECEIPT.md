# NF-8 — Outcome + Trust Receipt

**Status:** Source implemented; NF-1→NF-8 source batch closed; integrated runtime certification pending.

## Why this mission exists
NF-1 through NF-7 can establish a governed path from Network identity to a consented introduction, but without NF-8 the system still cannot record whether the connection produced value. A defensible trust network should compound governed outcome evidence, not merely profile volume or visible connections.

NF-8 closes the first generic loop while refusing a dangerous shortcut: a universal public person reputation score.

## Before → after
**Before:** Request → route → introduction → acceptance, then the product loses structured evidence.

**After:** Request → route → introduction → acceptance → Trust Receipt + independent requester/recipient outcome evidence.

## Implementation
### 1. Immutable-style Trust Receipt snapshot
`federated_trust_receipts` stores one receipt per accepted introduction and snapshots:
- request and route identifiers;
- exact purpose and request title;
- source Network, target Network and Umbrella names;
- institutional trust path;
- route generation time;
- introduction request time;
- recipient acceptance time.

A trigger creates receipts when an NF-7 introduction becomes accepted. Migration 077 also backfills receipts for introductions accepted before NF-8 is applied.

### 2. Bilateral private outcome evidence
`federated_introduction_outcomes` stores one record per introduction + participant. Supported evidence codes are:
- connected;
- helpful;
- resolved;
- not_resolved;
- no_follow_up.

Requester and recipient author their own evidence independently. One party cannot write the other's record.

### 3. Optional request closure
When the requester records an outcome, they may optionally close their originating NF-6 request. This does not alter Network membership, affiliation, purpose opt-in or the accepted introduction record.

### 4. Outcome & Trust Receipt UI
A lazy-loaded My Networks capability lists accepted introductions, allows the current participant to record/update their outcome, shows counterparty evidence when present, and displays the Trust Receipt route/timeline.

### 5. Launch Control
New capability: `*.advanced.outcome_trust_receipt`.
Bundle: `federation`.
Default rollout: `TEST` for Family, Alumni, Organization, Business Trust, Franchise and Professional.

## Privacy and governance invariants
- Outcome evidence is scoped to one accepted introduction and exact purpose path.
- It is participant-private by audited RPC; direct table privileges remain revoked.
- NF-8 does not query Family/Alumni/Organization private member/contact tables.
- NF-8 does not create or reuse M6 Network↔Network trust bridges.
- Outcome evidence is not a public endorsement or universal trust score.
- NF-8 does not automatically alter NF-6 routing weights. NF-9 owns any future adaptive learning and must add purpose scope, explainability and anti-gaming controls.

## Strategic value
NF-8 creates the first durable evidence substrate for a future Trust + Outcome Graph. The defensible asset is not that two people became connected; it is that a governed need traveled through a known institutional path, consent occurred, and both sides can independently attest what happened.

## NF-1→NF-8 closure validation
Completed in this source round:
- NF-1, NF-2, NF-3, NF-4, NF-5, NF-6, NF-7 and NF-8 dedicated source/architecture gates: PASS.
- i18n AST visible-literal audit: PASS, zero candidates.
- federation/NF relative import audit: PASS.
- selected NF-1→NF-8 TypeScript/TSX syntax-transpile sweep: PASS.
- package.json parse: PASS.

Environment-blocked:
- full `tsc --noEmit` reports missing third-party type definition libraries (`react`, `node`, `leaflet`, D3 family, etc.) in this extracted workspace. No full typecheck success is claimed.

Pending by explicit user decision:
- applying NF-1→NF-8 releases sequentially;
- migrations 070→077 in a real Supabase environment;
- runtime/UI/database verification;
- full healthy-workspace build/typecheck.

## Closure decision
NF-1→NF-8 is source-complete but not runtime-certified. NF-9 is held until integrated validation is complete.
