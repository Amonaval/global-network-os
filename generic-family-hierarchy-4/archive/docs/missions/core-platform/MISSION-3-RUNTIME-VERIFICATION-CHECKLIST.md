# Mission 3 — Runtime Verification Checklist

## Automated/source verified
- [x] `npm run validate:m3` source gate logic implemented.
- [x] Governed graph contracts/runtime parse cleanly.
- [x] Professional relationship constraints are registered.
- [x] Productized relationship creation uses governance metadata.
- [x] Institutional Bootstrap panel is admin-only through existing Admin surface.
- [x] i18n direct-visible-literal audit is zero.
- [x] Mission 2 and STABILITY-1 source gates remain green.

## Local runtime verification
1. `npm ci`
2. `npm run validate:m3`
3. `npm run build`
4. `npm run dev`
5. Open Professional Playground and confirm normal user surfaces are unchanged.
6. Open a real Professional/productized network as Owner/Admin → Admin.
7. Confirm Institutional Bootstrap shows Seed / Activate / Claim / Delegate / Enrich.
8. Download the seed CSV template.
9. Copy the launch invite and verify network name + join code.
10. Regenerate join code and verify the panel updates.
11. Add a Professional relationship and verify valid person/organization relationships save normally.
12. Attempt a disallowed relationship kind when suitable data exists and confirm it is rejected without corrupting the graph.
13. Smoke Family, Alumni and one existing productized vertical.
14. Switch EN / HI / MR and verify common translated shell text plus English fallback for untranslated long-form copy.
