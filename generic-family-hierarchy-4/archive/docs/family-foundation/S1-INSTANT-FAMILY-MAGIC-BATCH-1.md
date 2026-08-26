# S1 — Instant Family Magic · Batch 1 (S1-A + S1-B)

**Status: IMPLEMENTED IN SOURCE / BEHAVIOUR VERIFY REQUIRED**

This batch implements the first two S1 workstreams together while preserving CR2.3 as **IMPLEMENTED / LIVE VERIFY**.

## S1-A — Zero-Friction First 60 Seconds

Implemented in this batch:
- anonymous Playground remains available before authentication and saves nothing;
- Playground now receives a temporary read-only sample viewpoint so the experience can clearly show **You**, personal family line and relationship-to-me without creating an account or identity record;
- Playground conversion banner clearly returns to Join/Create;
- Home visually anchors the current viewer and places that person first in the family faces strip;
- Family opens into the personal family line for the current viewer on Playground and simple/mobile member journeys;
- Personal Family Line ↔ Full Tree remains reversible in both desktop and mobile controls;
- human first-session wording replaces more technical lineage/generation wording in the primary tree journey;
- 430px containment rules were strengthened for tree controls and view switching;
- pre-existing 150-person sample workbook packaging regression fixed by shipping `public/sample-data-150.xlsx`.

Still behaviour-gated:
- fresh deployed signup/auth hydration;
- family-name-only creation against live Supabase;
- newly created family immediately opening as Owner;
- 360/390/430 real browser/device confirmation;
- perceived loading quality on deployed Vercel.

## S1-B — Relationship Magic

Implemented in this batch:
- relationship-to-me helper now generates human labels including Father, Mother, Husband, Wife/Partner, Son, Daughter, Brother, Sister, Grandfather, Grandmother, Grandson, Granddaughter, Uncle, Aunt, Niece, Nephew and Cousin where the graph supports them;
- selected profiles show a prominent relationship-to-me badge;
- tree cards show relationship-to-me labels;
- mobile Personal Family Line rows use relationship-to-me labels rather than generic member metadata;
- immediate-family shortcuts expose parents, partner, siblings and children with one tap;
- tree relationship edges normalize parent/child direction before rendering so `child` import vocabulary cannot reverse the human label;
- tree edges retain familiar relationship labels;
- normal members receive a visible **Something wrong? / Report correction** entry that creates a governed family change request rather than changing foundational structure directly;
- existing member read-only and Owner/co-admin structure protections remain intact.

## Behaviour gate retained

S1 is **not complete**. S1-C is not implemented by this batch, and S1-A/B require deployed behaviour testing.

Required persona review remains:
1. anonymous stranger;
2. fresh signup;
3. family-name-only creator;
4. manual 3-relative creator;
5. small Excel importer;
6. CSV importer;
7. invited member;
8. returning Family Owner;
9. normal member;
10. older/non-technical mobile user.

For each persona verify discoverability, comprehension, completion, recovery, mobile behaviour, persistence and privacy/permissions.

## Validation in this package

- `scripts/s1-ab-source-gate.mjs` added for S1-A/B invariants.
- CR2.1 packaging gate repaired by restoring the public 150-person workbook.
- CR2.2 and CR2.3 source gates remain applicable.
- Production build/typecheck must still run in an environment where locked npm dependencies are available; dependency restore timed out in the current artifact runner and therefore build success is **not claimed** here.
