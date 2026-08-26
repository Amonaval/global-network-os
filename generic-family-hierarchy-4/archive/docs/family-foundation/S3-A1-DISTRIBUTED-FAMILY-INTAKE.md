# S3-A1 — Distributed Family Intake & Branch Assembly

**Status: IMPLEMENTED IN SOURCE / LIVE VERIFY REQUIRED**  
**Date: 2026-08-25**

## Product outcome
Reduce the adoption burden from "learn the app and build the tree" to "fill a familiar short family form". A Family Owner creates the family, shares separate secure contribution links with 3–5 branch representatives, reviews staged overlaps, and commits trustworthy branches into the existing canonical Family Network only after review.

## Implemented V1 journey
1. Family creation now recommends **Build together with relatives** as the lowest-effort start.
2. After family creation, **Build together · Recommended** opens the distributed-intake Owner flow when Launch Control permits it.
3. Owner creates one intake session and separate secure links per representative.
4. A recipient opens `/contribute/[token]` without learning or navigating the normal app.
5. Mobile form collects self → parents → spouse/children → siblings → grandparents → optional parent siblings → review.
6. The form creates typed staged parent/spouse relationships from anchored questions.
7. Submission writes only to S3-A1 staging tables.
8. Deterministic identity scoring compares normalized names plus DOB/year, gender, city and relationship-neighbour context against canonical members; exact-name cross-branch candidates are also surfaced.
9. High-confidence canonical matches (>=95) may auto-bind; medium/high unresolved matches block commit. Owner can choose Same / Different / Not sure.
10. Owner commits a reviewed branch through one guarded RPC. New canonical members/relationships are created only then; existing matched-member facts are not silently overwritten.
11. Contradictory DOB/city/gender facts are preserved in `family_intake_conflicts`.
12. Intake events capture opens, submissions, people reported and branches committed for adoption evidence.

## Security / privacy model
- Contribution token is 256-bit random material; only SHA-256 hash is stored.
- Family code is not used as intake authorization.
- Anonymous token RPC returns only family/intake labels and submission state — never members, tree, contacts or other branch data.
- Staging tables expose no direct client RLS policies; narrow `SECURITY DEFINER` RPCs mediate access.
- Token derives the target network server-side. Anonymous clients do not supply a trusted `network_id`.
- Links expire, can be revoked and default to one submission.
- Payload limits: max 60 people / 100 relationships per branch.
- Canonical commit requires active Family Owner/Admin context and blocks unresolved medium/high identity candidates.
- Commit is transactional at RPC level; database relationship integrity remains the final graph guard.

## Launch Control
New key: `contribute.branch_intake`.
- Default real-family rollout: **Pilot**.
- Platform Owner can test it on their own family; Pilot families can be targeted normally.
- Playground registry includes the capability for discovery, but the live Owner modal remains disabled in no-save Playground. A dedicated simulated Playground walkthrough can be added only if pilot evidence shows it is useful.

## Matching V1
This intentionally remains deterministic and explainable. Current scoring emphasizes exact normalized name, exact DOB/year and relationship context. V1 is not intended to solve every genealogy/entity-resolution edge case. Uncertain identities remain human decisions.

## Deliberately not built
Voice intake, WhatsApp/NLP extraction, OCR/PDF/handwriting ingestion, face recognition, LLM identity inference, probabilistic auto-merging, complex graph canvas reconciliation, external messaging automation and advanced branch inference remain **DEFERRED / EVIDENCE-GATED**.

## Validation status
- `npm run validate:s3-a1` → **14/14 PASS** in source workspace.
- TypeScript syntax transpilation of all modified/new TS/TSX files → PASS.
- Dependency-complete `npm run build` → **LIVE VERIFY**; attached baseline did not contain installed dependencies and dependency install did not complete in the execution window.
- Supabase migration 043 / RLS / anon token / multi-family browser behavior → **LIVE VERIFY REQUIRED**.

## Required live pilot checks
Apply migration 043 on staging first. Verify: token cannot read family data; 3+ separate representative links can submit to one session; revoked/expired/reused tokens fail; medium/high duplicates block commit; Same/Different/Not sure behavior; matched canonical facts are not overwritten; generation/relationship constraints rollback bad commits; cross-family isolation; 360/390/430 mobile form; Owner refresh after commit; Launch Control Pilot targeting; and adoption instrumentation.
