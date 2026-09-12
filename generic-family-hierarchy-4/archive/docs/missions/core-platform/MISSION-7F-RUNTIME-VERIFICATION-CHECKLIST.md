# M7-F Runtime Verification Checklist

1. Apply migration `067_m7f_pilot_evidence_product_decision_gate.sql` after M7-E migration 066.
2. Sign in as an Owner/Admin with at least one active network.
3. Open **My Networks → Pilot Evidence Review**.
4. Confirm evidence cards reflect M7-D feedback counts by moment.
5. With fewer than 5 signals for a moment, confirm recommendation is HOLD with low confidence.
6. Create pilot feedback that makes blocked feedback >= 40%; confirm FIX recommendation.
7. Create sufficient helpful feedback >= 70%; confirm INVEST recommendation.
8. Choose a disposition, add a rationale and optional next action, then save.
9. Refresh and confirm the recorded decision appears in Latest recorded decisions.
10. Confirm no feature flag, permission, roadmap file or runtime capability changes automatically after saving a decision.
11. Sign in as a non-admin member and confirm the M7-F gate is not rendered.
12. Run `npm run validate:m7f`, `npm run check:types`, and `npm run build` in the complete repository/runtime environment.
