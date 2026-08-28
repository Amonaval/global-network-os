# Mission 6-B — Release Manifest

## Classification
MEDIUM effort strategic product/runtime mission.

## Database
- `supabase/migrations/058_m6b_network_trust_bridges.sql`

## New generic contracts/runtime
- `core/trust/network-bridge.ts`
- `server/trust/service.ts`
- `capabilities/network-trust/remote.ts`
- `/api/v1/trust-bridges/{code,request,review,revoke}`

## UX
- `components/NetworkBridgeManager.tsx`
- integrated into `components/MyNetworksHome.tsx`
- responsive styles in `app/globals.css`
- i18n token additions in English catalog; other languages safely fall back through the existing catalog mechanism.

## Governance
- private Bridge Code instead of public network directory;
- recipient administrator approval required;
- either network administrator may revoke an accepted bridge;
- bridge capability intent does not itself authorize data disclosure;
- raw tables are not directly exposed to authenticated clients.

## Validation
- `npm run validate:m6b` → 12/12 M6-B and full prior source-regression chain green in implementation workspace.
- `npm run check:types` reached environment-level missing `@types/*` definitions in the extracted workspace; local dependency-complete type/build certification remains required.
