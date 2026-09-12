# Mission 6-B — Runtime Verification Checklist

## 1. Database + build
1. Apply `058_m6b_network_trust_bridges.sql` in Supabase.
2. Run `npm ci`.
3. Run `npm run validate:m6b`.
4. Run `npm run check:types`.
5. Run `npm run build`.

## 2. Fast functional certification
Use two networks for which you can act as Owner/Admin (they may be different verticals).

### A. Generate a bridge code
- Open **My Networks → Trusted Network Bridges**.
- Select Network B.
- Get its Bridge Code.
- Copy the code.

Expected: only an Owner/Admin can obtain/rotate the code.

### B. Request bridge
- Select Network A as the network you administer.
- Enter Network B's Bridge Code.
- Choose a relationship type and optional context.
- Propose Discovery and/or Introduction capability intent.
- Click **Request bridge**.

Expected: pending bridge appears; no member/profile data from B becomes visible.

### C. Review as receiving network
- As an Owner/Admin of Network B, review the incoming pending bridge.
- Accept it.

Expected: status becomes `accepted`; proposed capability intent is visible as policy metadata only.

### D. Revoke
- Revoke the accepted bridge from either side where you are Owner/Admin.

Expected: status becomes `revoked`; bridge no longer counts as accepted.

## 3. Security checks
- A normal member must not be able to generate a Bridge Code, approve a pending bridge or revoke an accepted bridge.
- An invalid Bridge Code must fail without revealing private network search results.
- Creating a bridge to the same network must fail.
- Re-requesting an already accepted bridge of the same relationship type must fail.
- Verify accepted bridge does not reveal cross-network members, profiles, graph relationships or activity.

## 4. Operational check
Inspect server/Vercel logs for bridge writes. Expected command names include:
- `networkBridgeCode`
- `requestNetworkBridge`
- `reviewNetworkBridge`
- `revokeNetworkBridge`

## Acceptance
If build/typecheck and A-D pass, mark **M6-B Runtime Certified / Closed**. Minor unrelated regression defects should remain backlog items rather than reopening the architecture mission.
