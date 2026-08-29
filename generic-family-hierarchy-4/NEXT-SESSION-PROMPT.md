# NEXT SESSION PROMPT — TrustWeave / Generic Network OS

## Read first
The M6/M7 trusted-network program is closed through M7-F and LC-1. Do not invent M7-G. The next strategic track is **NF — Network Federation & Community Ecosystem**, but implementation should begin only after reading the corrected product model below and the V2 story artifacts.

Primary durable sources:
- `AI-START-HERE.md`
- `CURRENT-STATE.md`
- `ROADMAP.md` — especially the bottom Federation + Documentation sections
- `MISSION-STATUS.md`
- `PRODUCT-CONSTITUTION.md`
- `PROJECT-VISION.md`
- `TECHNICAL-EVOLUTION-REGISTER.md`
- `TRUSTWEAVE-PUBLIC-PRODUCT-PROFILE.html`
- `TRUSTWEAVE-PRODUCT-EVOLUTION-JOURNEY.html`

## Correct product model — binding
This is **not one hierarchy**.

### Dimension 1 — Person ↔ Network
A person can belong to many independently governed networks: their own Family, spouse's Family, Alumni, Professional, multiple Businesses, Community, etc.

### Dimension 2 — Network ↔ Umbrella/Federation
This is independently many-to-many. A network may affiliate with zero, one or multiple appropriate umbrellas.

Example:
```text
Person
 ├─ Family A ─────────────┐
 ├─ Family B ─────────────┴→ Maheshwari Community
 ├─ Retail Business A ────┐
 ├─ Retail Business B ────┴→ Retail Federation X
 └─ Medical Business ───────→ Medical Association Y
```

Do not infer umbrella membership from the person who belongs to the child networks. Family and Business can share an umbrella only if there is an explicit valid affiliation; normally their domain umbrellas may be different.

### Separate relationship semantics
- **M6 trusted bridge:** peer Network ↔ Network trust/reach for governed discovery and consented introductions.
- **NF affiliation:** Network ↔ Umbrella/Federation participation/membership/containment semantics.

Never collapse them into one edge type.

### Privacy contract
Umbrella affiliation never imports or merges the child network's private graph. It sees only an explicit policy-controlled **federated/public network profile** plus application-specific opt-ins.

## Product positioning
The project began as a personal Family hierarchy app/POC. It is now accurate to call the larger system a **product with a reusable platform foundation**:
- Product: TrustWeave / Generic Network OS (working brand, provisional).
- Platform foundation: identity, membership, governed networks, privacy, consent, launch control, trust, future federation, runtime/intelligence seams.
- Applications/verticals: Family, Alumni, Professional, Organization, Business Trust, Franchise, Community/Federation and future Matrimony/Jobs/Expertise applications.

Traction will prove product-market fit and a product company; it is not required before calling the current repeatable system a product.

## Journey artifact rule
The product history is now too deep to reconstruct from memory. `TRUSTWEAVE-PRODUCT-EVOLUTION-JOURNEY.html` V2 is rebuilt from mission/roadmap/history files and should be treated as the human-readable narrative index. Continue updating it only from durable artifacts, not from a short conversational recap.

## Next implementation track
Recommended first NF batch:
1. **NF-0 — Federation Architecture & Privacy Contract**
2. **NF-1 — Network Federated/Public Profile**
3. **NF-2 — Network ↔ Umbrella Affiliation**

Do not build NF-3+ or trusted matrimony before NF-0/1/2 are structurally sound and launch-controlled.

## Permanent mission discipline
Every user-facing mission must follow:
`IMPLEMENT → VALIDATE → GUIDE → PLAYGROUND (where meaningful) → LAUNCH CONTROL → WHAT'S NEW → ROADMAP/STATUS → CLOSE`

Every major mission needs a human-readable `.docx`, affected-files-only ZIP preserving hierarchy, runtime checklist and durable documentation updates.

## Public/story documentation direction
Keep diagrams and human explanations alongside technical artifacts. The product has crossed the complexity threshold where code and release manifests alone are insufficient. Future artifact ideas are catalogued at the bottom of `ROADMAP.md`; create only what the current mission needs.

## Founder defense / IP / expansion doctrine — binding from 2026-08-29
Read `FOUNDER-IP-DEFENSE-AND-EXPANSION-STRATEGY.md` before choosing major roadmap work.

The founder strategy is now explicitly **protect → seed → prove → compound → amplify**. Early GTM may remain intentionally low-profile while onboarding trusted, technically underserved institutions and building dense networks. Federation should be evaluated not only as architecture but as a **distribution supernode** that can activate many child networks.

Run an anti-cloning test for major missions: **if a well-funded competitor copied every visible screen in six months, what would they still not possess?** Prefer work that compounds governed network density, institutional relationships, provenance, scoped permissions, successful outcome history, protected technical mechanisms, trade-secret operating intelligence or embedded workflows.

Maintain a parallel `IP-*` invention-harvest track across TrustWeave and other founder products. Do not expose detailed potentially patentable mechanisms publicly before recording them and obtaining appropriate professional advice where filing may be valuable.

## NF-0A mission now active
`NF-0A / FD-2 — Federation as Distribution Supernode` has a foundation implementation. Read `MISSION-NF0A-FEDERATION-AS-DISTRIBUTION-SUPERNODE.md` and its runtime checklist before continuing. Do not turn the synthetic Distribution Lab into real affiliation data until NF-1 Network Passport and NF-2 governed affiliation contracts/persistence exist.

## NF-1 completed source checkpoint — 2026-08-29
`NF-1 — Network Passport` is source implemented. Read `MISSION-NF1-NETWORK-PASSPORT.md`, release manifest and runtime checklist before continuing. The Passport is a separate network-level outward identity with `private | federation | public` visibility; it must never become a shortcut to member/profile/relationship data. Public `/passport/<slug>` reads only deliberately public Passport rows. Purpose scopes are declarations only, not person consent.

**Next recommended mission: NF-2 — Governed Network ↔ Umbrella Affiliation.** Implement explicit request/review/approve/decline/suspend/revoke affiliation between independently governed networks/umbrellas, using Network Passports for outward identity. Do not reuse M6 peer bridge semantics and do not grant implicit person-level access.


## Latest handoff — 2026-08-29 NF-2
NF-2 source is implemented. The second dimension now uses separate `federation_umbrellas` / `network_umbrella_affiliations`, never M6 peer bridge rows. Requests require an NF-1 Passport with `federation` or `public` visibility; umbrella admins approve/decline, suspend and revoke. `*.advanced.network_affiliation` remains TEST by default.

Architecture roadmap additions are binding: CR-1..CR-4 Composable Runtime/Lean Capability Delivery and NC-0..NC-5 Network Type Studio. NF-2 also starts CR-1 by dynamically importing advanced My Networks modules.

NF-3 Umbrella Network Runtime is SOURCE IMPLEMENTED. Next federation mission: **NF-4 Federated Directory & Discovery**, built on approved affiliations + governed Passport provenance + explicit eligibility/opt-in. Never infer member enrollment or expose private source graphs.

## Federation batch validation posture — 2026-08-29
Founder is intentionally deferring integrated verification until the planned federation source missions are implemented. Preserve every mission as an additive affected-files ZIP with its own migration order and runtime checklist. Later apply/verify NF-1 → NF-2 → NF-3 → subsequent missions sequentially and fix issues at the mission boundary where they appear.

## Latest handoff — 2026-08-29 NF-4
NF-4 Federated Directory & Discovery is SOURCE IMPLEMENTED. It discovers **Networks only** across active requester membership → approved source affiliation → shared active umbrella → approved target affiliation → directory-enabled Federation/Public Network Passport. Results include an explainable institutional trust path. Purpose filters match network-declared capabilities/scopes only and must never be treated as person consent.

Next federation mission: **NF-5 Community Applications / Purpose Scope Framework**. Define reusable purpose contracts, participant eligibility/opt-in, selective disclosure and application-specific projections before adding any federated person/resource discovery. Continue the founder-approved deferred integration-validation posture and preserve additive affected-files ZIPs.

## Latest federation status — 2026-08-29
NF-0A through NF-5 are source-implemented. NF-5 adds explicit person-level purpose consent over approved federation paths; do not bypass this layer for future person/resource discovery. User is intentionally deferring integrated runtime verification until the federation batch is complete, then will apply affected-file ZIPs sequentially and validate each mission. Next likely federation work: NF-6 application vertical / trusted request-routing direction, while preserving Launch Control and selective disclosure.


## Latest federation checkpoint — NF-6 source implemented
NF-6 Trusted Request Routing is now layered on NF-5. Migration `075_nf6_trusted_request_routing.sql` persists user requests and deterministic route evidence. Routes are eligible only while the source federation path and target NF-5 purpose consent remain valid. No introduction/contact disclosure exists yet. Next recommended mission: **NF-7 Governed Introduction & Consent**.

The roadmap also now contains a high-priority DR controlled-reveal documentation track and `DOCUMENTATION-CONTROLLED-REVEAL-ARCHITECTURE.md`. Future standalone `trustweave-docs` should separate User, Community Head, Agent/Operator, Partner, Developer, Architecture and Founder guides, with founder/private content excluded from external builds.


### Latest federation checkpoint — NF-7
NF-7 Governed Introduction & Consent is source-implemented and source-gated. Preserve the rule `route != introduction != accepted connection`. Next implement **NF-8 — Outcome + Trust Receipt**. At NF-8 closure perform the intentionally deferred full TypeScript/import/build sweep across all NF-1→NF-8 changes, then prepare the sequential integrated runtime verification plan because the user has not validated NF-1 onward yet.
