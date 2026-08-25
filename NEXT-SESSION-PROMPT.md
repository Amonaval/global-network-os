# NEXT SESSION — G8.5-B Generic Capability Parity

Use the refreshed **G8.5-A Clean + Audit + Rules** baseline as authoritative. Apply Supabase migrations only through `048_g8_productized_verticals.sql`; G8.5-A adds no migration.

Read first:
- `GENERIC-CAPABILITY-UTILIZATION-RULE.md`
- `G8.5-A-CAPABILITY-APPLICABILITY-MATRIX.md`
- `G8.5-A-BASELINE-CLEANUP-AUDIT.md`
- `G8.5-A-RELEASE-MANIFEST.md`
- `ROADMAP.md`
- `MISSION-STATUS.md`
- `CODEBASE.md`
- `DEVELOPMENT-RULES.md`
- `VALIDATION.md`
- `ARCHIVE-INDEX.md`

Historical release/mission documents are preserved under `archive/docs/`. Do not move them back to root and do not delete them merely to reduce file count. Accepted baseline manifests intentionally resolve to archived paths.

## Current product state

Five active products share the Generic Network OS:
1. Family Network
2. Alumni Network
3. Organizational Intelligence
4. Business Trust Network
5. Franchise Network

G8 proved rapid productized vertical composition. G8.5-A established that the five products are **not yet at equal capability depth**. Family is the mature reference, Alumni is materially developed, while Organization/Business Trust/Franchise still use thinner representations for several capabilities.

## Permanent rule

If a mature capability is semantically applicable to another vertical, reuse it by default. Missing integration is product incompleteness unless an explicit semantic/product/privacy reason is documented. Do not chase arbitrary reuse percentages and do not copy Family-only kinship/remembrance semantics into unrelated products.

## Next mission

**G8.5-B — Generic Capability Parity**

Use Medium effort and implement in capability-family batches rather than a giant rewrite.

Priority families:

### B1 — Discovery & Relationship Experience
- reusable map/geography capability;
- richer typed relationship explorer;
- reusable connection-path UX/context;
- richer reusable entity/profile detail;
- strengthen search/filter/projection discoverability.

### B2 — Living Network & Participation
- groups/community product depth;
- events + RSVP lifecycle;
- neutral stories/history + milestones while keeping Family remembrance domain-only;
- governed contributions beyond a generic textbox;
- evaluate neutral media attachment reuse;
- evaluate notification/digest extraction where semantically useful.

### B3 — Lifecycle, Governance & Help
- invitation/join/claim UX reuse;
- import/construction preview/validation experience;
- admin/governance primitives;
- proper Launch Control exposure for business vertical capability bundles;
- contextual Guide / Doc Portal reuse;
- What's New/release discoverability.

For each capability: inspect the strongest existing Family/Alumni implementation, extract only the semantically neutral layer, keep domain semantics in vertical adapters, then consume it in every applicable active vertical.

Do not begin G9 AI/Network Intelligence until G8.5-B/C capability maturity is certified.

## Preserve

- Family and Alumni behavior/capabilities;
- five Playgrounds;
- Light / Dark / Aurora themes;
- responsive productized shell;
- G7 affiliation/projection acceptance test;
- historical remote exports and regression gates;
- tenant isolation and verified-email claiming rules;
- no Core → vertical dependency and no vertical → another vertical implementation dependency.

## Delivery

Follow IMPLEMENT → VALIDATE → GUIDE → PLAYGROUND → LAUNCH CONTROL → WHAT'S NEW → ROADMAP/STATUS → CLOSE.

Prefer affected-files-only ZIP for the implementation batch, preserving folder hierarchy. At major G8.5 closure create a refreshed authoritative baseline.

## Current authoritative continuation
G8.5-B Generic Capability Parity is complete. Next: G8.5-C — Five-Vertical Product Showcase & Certification. Expand business-vertical Playground data to roughly 30–60 meaningful entities each, deepen domain-specific stories/events/groups/relationships, polish empty/loading/mobile/theme states, certify five-vertical product proof, update Guide/Launch Control/What's New/roadmap/status and produce the next authoritative baseline. Do not start G9 intelligence until G8.5-C closes.
