# M6-D Runtime Verification Checklist

1. Apply migration `060_m6d_network_effect_activation_measurement.sql`.
2. Run `npm run validate:m6d`, `npm run check:types`, `npm run build`.
3. Open My Networks and confirm Network Effect Pulse renders without exposing names/search text.
4. With two networks but no bridge, verify next action recommends a bridge.
5. Accept a bridge, refresh, verify accepted bridge count/stage advances.
6. Run one trusted discovery; refresh and verify search count and opportunity count advance.
7. Request an introduction; verify request count/stage advances.
8. Accept as target user; requester refreshes and sees acceptance/acceptance rate advance.
9. Confirm the pulse contains aggregates only; no candidate identity, query text, email or phone.
10. Confirm existing M6-C anonymous discovery still hides identity until consent.

Pass = M6-D runtime certified.
