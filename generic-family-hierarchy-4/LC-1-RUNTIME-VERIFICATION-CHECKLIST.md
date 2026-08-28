# LC-1 Runtime Verification Checklist

1. Apply `068_lc1_m6_m7_launch_control_governance.sql`.
2. Sign in as Platform Owner and open Launch Control.
3. Switch among Family, Alumni, Organization, Business Trust, Franchise and Professional.
4. Confirm three new groups appear: Advanced network effect, Advanced showcase, Advanced pilot operations.
5. Confirm all new M6/M7 features initially show `test` unless an existing rollout choice already exists.
6. As a normal Alpha user, verify advanced M6/M7 surfaces are absent while state is `test`.
7. Set Family > Trusted network bridges to `pilot`, select one Family pilot network, and verify it appears only when that Family is the active network context.
8. Leave Business Trust equivalent feature hidden/test and verify the advanced surface does not release to ordinary Business Trust users.
9. Enable M6-C discovery but keep M6-E multi-hop hidden; verify discovery works but Path Traversal control/two-hop result presentation is absent.
10. Promote M6-E only for the intended pilot and verify the path traversal control becomes available.
11. Run `npm run validate:lc1`, `npm run check:types`, and `npm run build` in the full development workspace.
