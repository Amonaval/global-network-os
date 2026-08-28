# Mission 7-D — Runtime Verification Checklist

## Automated
```bash
npm ci
npm run validate:m7d
npm run check:types
npm run build
```

Apply Supabase migration:

`064_m7d_pilot_feedback_product_learning.sql`

## Member feedback path
1. Open **My Networks** as a normal member.
2. Locate **Pilot Feedback & Product Learning Loop**.
3. Select an active network.
4. Submit **Yes, it helped** with no friction.
5. Submit a second test as **Partly helped** or **I was blocked**, choose one friction category and add a short non-sensitive note.
6. Confirm both submissions succeed and the form resets.
7. Confirm the UI warns against entering private/sensitive network information.

## Admin learning path
1. Use an Owner/Admin account for the same network.
2. Refresh the learning loop.
3. Confirm response count increases.
4. Confirm helpful/blocked metrics reflect submitted feedback.
5. Confirm the selected friction can become visible as top friction.
6. Confirm recent note is shown without feedback-author identity.
7. Confirm a network where the user is only a normal member is not included in admin learning aggregation.

## Regression
- M7-C Guided Pilot console still renders.
- M7-A Launch Activation still renders.
- M7-B WOW Scenario Theater still renders.
- M6 discovery/introduction remains anonymous-before-consent.
- No M6 search text or candidate identity is shown in M7-D learning.

## Pass criteria
M7-D is runtime certified when source/type/build checks pass, member feedback can be submitted, admin aggregates update correctly, and the privacy/regression checks above remain intact.
