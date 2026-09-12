# HS-0 Runtime Verification Checklist

Status: **REQUIRED BEFORE RUNTIME-CERTIFIED**

1. Apply migrations through `082_hs0_housing_society_vertical.sql` on a clean staging database.
2. Re-run migration 082 and confirm it succeeds without duplicate-object or function-shape errors.
3. Create a Housing Society from Setup; verify `networks.vertical_kind = 'housing-society'` and matching `network_settings` / `productized_network_settings`.
4. Verify seeded dimensions: building, wing, floor, unit_type, occupancy_status, resident_type, parking_zone.
5. Verify property hierarchy projection is default and renders in Explorer.
6. Open anonymous/safe Playground and confirm synthetic data is read-only and does not hydrate a signed-in live network.
7. Verify resident navigation contains familiar society terms and does not expose Intelligence/Federation/Launch Control to ordinary members.
8. Verify directory can display Unit + Household + Person sample entities.
9. As admin, create allowed `unit`, `household` and `person` entities and allowed relationships.
10. Attempt an invalid entity kind and invalid relationship kind; both must fail closed.
11. Verify Family, Association and Family Association creation/playgrounds still work after migration 082.
12. Verify Launch Control can read/update housing-society bundles only for Platform Owner.
13. Test Light, Dark and Aurora themes plus 360/390/430 mobile widths.
14. Record deployed Supabase/Vercel evidence before changing status from SOURCE IMPLEMENTED / RUNTIME VERIFY.
