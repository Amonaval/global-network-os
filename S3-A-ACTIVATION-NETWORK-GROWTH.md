# S3-A — Family Activation & Network Growth

**Status:** ACTIVE NEXT MISSION — implementation intentionally paused for real-user feedback after the S3-A pilot freeze.

## Outcome
Prove that a new family can move from first visit to a living, multi-person family network with minimal founder help.

## Activation journey to measure next
Playground → sign up → create/join family → connect self → add close relatives → first meaningful value → preserve/contribute → invite relative → invite accepted → second contributor → return.

## Planned S3-A implementation when evidence justifies it
1. Calm Family Journey / completeness experience.
2. Deterministic activation milestones and funnel instrumentation.
3. Smart next-best-action prompts based on missing family value, not engagement tricks.
4. First-wow signal measurement (lineage, relationship-to-me, memory/history, family growth, contributions).
5. Family health states: New / Growing / Healthy / Stuck / Dormant.
6. Founder activation scorecard focused on families, not page views.

## Pilot-first operating rule
Until real-user feedback creates a blocking or high-priority reason to change product behavior:
- do not add broad new features;
- fix blocking bugs, confusing flows, privacy/security issues and high-frequency user gaps first;
- record all other ideas without losing them;
- do not promote feedback to roadmap commitment automatically;
- use Launch Control instead of code removal when a feature is too early for real families.

## Evidence to collect
For each pilot family, record whether they can independently:
- understand the product;
- create/join a family;
- connect themselves;
- add or find relatives;
- get one meaningful "wow" moment;
- preserve or correct one family detail;
- invite another person;
- get a second contributor;
- return without founder prompting.

Qualitative feedback outranks vanity usage. Repeated friction across multiple families outranks isolated feature requests.

## Exit gate
Do not call S3-A successful from source checks. Require real families showing repeatable activation, at least some multi-contributor families, identifiable first-value moments, known activation drop-offs and a prioritized feedback backlog.


## 2026-08-25 refinement — form-first activation becomes S3-A1

Founder observation changed the activation hypothesis: relatives are busy and learning/building inside the full app is too much effort before value exists. The next experiment therefore moves data collection **before** broad app onboarding.

### S3-A1 Distributed Family Intake & Branch Assembly
Family Starter creates the family and shares a safe unique contribution link/code with 3–5 representatives of different sub-families. Each recipient completes a short mobile form: self → parents → spouse/children → siblings → grandparents → optional extended relatives. Conditional sections keep the form small.

Submissions enter staging, not the canonical graph. Deterministic matching uses normalized identity plus family context (DOB/year, parents, spouse, etc.). High-confidence matches may resolve automatically; ambiguous candidates require human Same/Different/Not sure decisions. Provenance and conflicting facts are preserved.

The system assembles several partial trees and gives the Owner a simple branch-reconciliation experience, preferably suggesting common parents/ancestors. The wider family is invited into the actual app only after the graph is useful: **Your family is ready**.

### S3-A2 Populated-family onboarding
Make claim/find-myself, lineage, relationship-to-me and branch completion nearly effortless. Existing people get prefilled **Complete my branch** flows rather than generic forms.

### S3-A3 Activation intelligence
Then implement the previously planned Family Journey, milestone funnel, next-best-action prompts, first-wow measurement and family health states using evidence from S3-A1/A2.

### Explicitly later
Voice, conversational/WhatsApp AI intake, OCR/photo/PDF genealogy extraction and advanced automatic branch inference remain evidence-gated. Structured intake must prove itself first.


## Architecture handoff after S3-A1

S3-A1 is a source candidate for future **G2 Distributed Network Construction**. Do not rewrite it now. G0 should identify which primitives are genuinely generic.

S3-A2 must use the new CLASSIFY gate. Likely reusable concepts:
- find/pre-created identity;
- safe claiming;
- activation handoff;
- incremental Complete my branch/context;
- lightweight corrections with provenance.

Kinship language and family relationship semantics stay Family-specific.
