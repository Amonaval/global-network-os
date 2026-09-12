# NF-8 Release Manifest

## Mission
NF-8 — Outcome + Trust Receipt + NF-1→NF-8 federation source closure.

## New runtime/source files
- `core/federation/outcome-trust-receipt.ts`
- `capabilities/federation/outcome-trust-receipt-remote.ts`
- `components/FederatedOutcomeTrustReceipt.tsx`
- `supabase/migrations/077_nf8_outcome_trust_receipt.sql`
- `scripts/nf8-outcome-trust-receipt-gate.mjs`

## Modified runtime/source files
- `core/features/advanced-network.ts`
- `components/MyNetworksHome.tsx`
- `lib/i18n/messages/en.ts`
- `app/globals.css`
- `package.json`

## Mission / closure artifacts
- `MISSION-NF8-OUTCOME-TRUST-RECEIPT.md`
- `MISSION-NF8-OUTCOME-TRUST-RECEIPT.docx`
- `MISSION-NF8-RELEASE-MANIFEST.md`
- `MISSION-NF8-RUNTIME-VERIFICATION-CHECKLIST.md`
- `MISSION-NF8-FEDERATION-BATCH-CLOSURE-REPORT.md`
- `NEXT-SESSION-PROMPT-NF8-FEDERATION-CLOSURE.md`

## Durable documentation updated
- `ROADMAP.md`
- `CURRENT-STATE.md`
- `MISSION-STATUS.md`
- `MASTER-VISION-PLAN.md`
- `STRATEGIC-PRODUCT-REVIEW.md`
- `GRAPH-NETWORK-PLATFORM-ARCHITECTURE.md`
- `TECHNICAL-EVOLUTION-REGISTER.md`
- `USER-GUIDE.md`
- `FOUNDER-COMPASS.md`
- `NEXT-SESSION-PROMPT.md`
- `TRUSTWEAVE-PUBLIC-PRODUCT-PROFILE.html`
- `TRUSTWEAVE-PRODUCT-EVOLUTION-JOURNEY.html`

## Validation status
See `MISSION-NF8-FEDERATION-BATCH-CLOSURE-REPORT.md` and the runtime checklist. Source gates/import/syntax audits pass; full project typecheck/runtime remain pending for the user's integrated verification round.

## Batch rerun command
- `npm run validate:nf-batch` reruns all eight NF source gates plus the i18n audit. The batch gate also checks migration presence/order 070→077 and federation integration relative imports.
