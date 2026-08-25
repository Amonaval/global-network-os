# G8 — Short Runtime Verification Checklist

Apply `048_g8_productized_verticals.sql` after 047, then keep manual verification short:

1. **Regression glance:** open one existing Family and one Alumni network.
2. **Creation:** create one of Organization / Business Trust / Franchise from setup; confirm it opens its correct product shell.
3. **Core workflow:** add/import 2–3 entities, open Explorer, Directory and Places; switch one projection.
4. **Identity / member lifecycle:** join a second test account by Network OS code; if email matches an imported entity use **This is me**; owner promotes/demotes or removes the test member once.
5. **Living network:** create one event/group or memory, RSVP/join as a member, and submit one governed contribution.
6. **Isolation:** switch Productized → Family → Alumni → Productized and glance at the console for unknown-feature, wrong-vertical or permission errors.

If these pass and Vercel/CI builds cleanly, G8 is deployable.
