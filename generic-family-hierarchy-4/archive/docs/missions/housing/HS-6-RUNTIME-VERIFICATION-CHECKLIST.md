# HS-6 Runtime Verification Checklist

1. Apply migrations through `088_hs6_founder_pilot_commercialization.sql` in order on staging.
2. Re-run migration 088 and verify it remains safe.
3. Create/open a real `housing-society` network as owner/admin.
4. Start Pilot B with a 20–50 unit target.
5. Import the pilot cohort using the mapped CSV/XLSX flow with no manual DB edits.
6. Claim at least one resident identity and open resident surfaces so weekly usage events are recorded.
7. Open Notices as a resident and verify notice-read evidence is recorded.
8. Resolve at least one complaint end-to-end and confirm median/resolved metrics update.
9. Represent one maintenance billing cycle and confirm maintenance/billing evidence updates.
10. Complete one governance meeting and one security/compliance/asset operation.
11. Record a weekly checkpoint including admin hours saved and offline operations remaining.
12. Record one pricing hypothesis and committee response.
13. Export evidence JSON and inspect the snapshot.
14. Create a second housing society and repeat onboarding through normal product paths.
15. Mark repeatable onboarding only if no founder-specific code/manual SQL patch was needed.
16. Verify residents cannot call admin pilot mutation RPCs.
17. Run `npm run validate:hs6`, `npm run check:types`, and `npm run build` with dependencies installed.
