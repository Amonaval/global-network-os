# NF-6 Release Manifest — Trusted Request Routing

## New source files
- `core/federation/trusted-request-routing.ts`
- `capabilities/federation/trusted-request-routing-remote.ts`
- `components/TrustedRequestRouting.tsx`
- `supabase/migrations/075_nf6_trusted_request_routing.sql`
- `scripts/nf6-trusted-request-routing-gate.mjs`
- `DOCUMENTATION-CONTROLLED-REVEAL-ARCHITECTURE.md`
- `MISSION-NF6-TRUSTED-REQUEST-ROUTING.md`
- `MISSION-NF6-TRUSTED-REQUEST-ROUTING.docx`
- `MISSION-NF6-RELEASE-MANIFEST.md`
- `MISSION-NF6-RUNTIME-VERIFICATION-CHECKLIST.md`
- `NF6-AFFECTED-FILES.txt`

## Modified source/config
- `core/features/advanced-network.ts`
- `components/MyNetworksHome.tsx`
- `lib/i18n/messages/en.ts`
- `app/globals.css`
- `package.json`

## Updated durable product/strategy documentation
- `ROADMAP.md`
- `CURRENT-STATE.md`
- `MISSION-STATUS.md`
- `MASTER-VISION-PLAN.md`
- `STRATEGIC-PRODUCT-REVIEW.md`
- `GRAPH-NETWORK-PLATFORM-ARCHITECTURE.md`
- `TECHNICAL-EVOLUTION-REGISTER.md`
- `USER-GUIDE.md`
- `NEXT-SESSION-PROMPT.md`
- `FOUNDER-COMPASS.md`
- `TRUSTWEAVE-PUBLIC-PRODUCT-PROFILE.html`
- `TRUSTWEAVE-PRODUCT-EVOLUTION-JOURNEY.html`

## Compatibility
NF-6 is additive and TEST-by-default. It depends on migrations NF-1 through NF-5, especially NF-5 `federated_scope_profiles`. Existing M6 peer bridges and older vertical-specific behavior remain separate.
