# M6-C Runtime Verification Checklist

1. Apply `059_m6c_cross_network_discovery_introductions.sql`.
2. Run `npm run validate:m6c`, `npm run check:types`, and `npm run build`.
3. Create/retain an accepted M6-B bridge with Discovery + Introductions enabled.
4. From Network A, search for a keyword present on a claimed person entity in Network B.
5. Confirm discovery shows Network B and an anonymous relevant-person card — **not the person's identity**.
6. Request an introduction with a reason.
7. Sign in as the target person; confirm they see requester identity + reason and can Accept/Decline.
8. Before acceptance, requester must still see identity hidden.
9. After acceptance, requester may see the target display name.
10. Disable/revoke bridge or capability and confirm discovery/introduction is blocked.
11. Verify audit events and `/api/v1/trust-bridges/*` request logs.

Pass = no cross-network directory leakage and the consent lifecycle works end-to-end.
