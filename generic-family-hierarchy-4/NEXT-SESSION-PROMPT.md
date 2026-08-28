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
