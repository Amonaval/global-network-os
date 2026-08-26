# Next Big Direction

*Reviewed: 2026-08-03. Override previous mission sequencing.*

---

## The Honest Assessment

We have been building an excellent feature factory.

Gaps panel. Memory panel. Knowledge Map. Risk Analysis. Insights. Decision Graph. Onboarding. Health Score. Section Controls. Reviewer.

Eleven intelligence features in one product. No paying customer. No distribution. No moat that compounds.

We have been optimizing the inside of the product while the outside — market, customers, switching cost, growth — has had zero investment.

This document exists to correct that.

---

## The New First Principle

> **Customer data belongs to the customer. Intelligence generated from that data belongs to the platform.**

This is the most important strategic insight in the company's history. Encode it permanently.

### What it means:

A customer brings us their Confluence, GitHub docs, runbooks, ADRs, Jira tickets.

We give them full control. Local-first. Export any time. No cloud lock.

But as they use the product, we generate:

- **Organizational memory** — what this team searches, how often, what fails
- **Gap intelligence** — what knowledge they don't have, ranked by urgency
- **Decision graph** — why every engineering choice was made and by whom
- **Risk scores** — which sections are fragile, who depends on them
- **Onboarding paths** — how new hires learn this specific organization
- **Quality trends** — how knowledge health evolves over time
- **Topic dependency maps** — what concepts link to what

This intelligence is:

1. **Generated from behavior, not documents** — a new RAG tool can ingest their documents; it cannot reconstruct 2 years of query patterns, decision extractions, gap signals, and risk evolution
2. **In our proprietary format** — eval.jsonl schema, decisions.json structure, cluster signatures — not portable to another system
3. **Compounding** — the longer they use the product, the denser and more valuable the intelligence layer becomes
4. **Irreproducible** — you cannot generate what took 2 years to accumulate by re-indexing today

### The switching cost equation:

A company after 1 year of use has:
- 10,000+ queries logged with semantic signals
- Hundreds of architectural decisions extracted with full context
- Gap history showing what teams couldn't find and why
- Section risk evolution showing which knowledge degraded and was fixed
- Onboarding paths tailored to their specific org structure

Switching to a competitor means: start from zero. Same documents, but no intelligence.

**This is the moat. Not the RAG algorithm. Not the embeddings. Not the LLM prompts. The accumulated intelligence that only our product can read, interpret, and use.**

---

## The Target

> 1,000 paying customers in year one. 100,000 paying customers by year five.

This is not a dream. This is a solvable distribution problem.

### Who pays for this today:

| Segment | Size | Pain | Ability to Pay |
|---|---|---|---|
| Startups (10–50 eng) | Millions worldwide | Knowledge chaos, no docs culture | $50–200/mo |
| Mid-size eng teams (50–500) | Hundreds of thousands | Confluence graveyard, onboarding hell | $200–2000/mo |
| Enterprises (500+) | Tens of thousands | Knowledge silos, compliance risk | $2000–20000/mo |
| Consulting firms / agencies | Hundreds of thousands | Multi-client knowledge, repeated patterns | $100–500/mo |
| Individual developers / PKM | Tens of millions | Personal knowledge overload | $10–30/mo |
| Regulated industries (legal, finance, medical) | Hundreds of thousands | Compliance documentation, audit trails | $500–5000/mo |

### What they need to pay:

1. **Self-serve onboarding** — set up in under 10 minutes, first value in 30 seconds
2. **Cloud-hosted option** — not everyone wants to run local infrastructure
3. **Team collaboration** — multi-user, shared intelligence, not single-machine
4. **Integrations** — Slack, VS Code, GitHub, Notion, Linear — meet engineers where they work

We have none of these. That is the honest problem.

---

## The Intelligence Platform Model

This is the evolution that unlocks 100,000 customers:

```
Today (Local Desktop App)
  ↓
Intelligence API (our platform owns the intelligence layer)
  ↓
Hosted + Local Hybrid (privacy-first cloud)
  ↓
Connected Intelligence (integrations — Slack, VS Code, GitHub)
  ↓
Organization Intelligence OS (every team's single source of truth)
```

### Intelligence Store — the core asset

Every piece of intelligence we generate must be stored in a structured, versioned **Intelligence Store**:

```
/intelligence/
  eval.jsonl              — query memory (already exists)
  decisions.json          — decision graph (already exists)
  gaps.state.json         — gap evolution history
  risk.history.json       — section risk snapshots over time
  onboard.paths.json      — role-based learning paths
  insights.weekly.json    — weekly intelligence snapshots
  org.fingerprint.json    — the organization's unique knowledge DNA
```

The **org.fingerprint.json** is new. It is a compressed representation of the organization's knowledge identity — what they know well, what they consistently struggle with, how their knowledge health changes seasonally, what decisions define their architecture. This is what our product reads. No other product can.

### Privacy model:

- Documents: customer owns, customer controls, can delete any time
- Intelligence: platform-generated, stored locally, readable only by our product
- No cloud transmission of intelligence without explicit consent
- Export raw data any time (your documents back)
- The intelligence summary is not exportable in a competitor-readable format — it's a proprietary binary fingerprint

---

## What Must Change in the Roadmap

### Kill immediately:
- Building more intelligence features without a distribution path
- Nav tab per feature (11 tabs is a feature factory symptom)

### Build next (in this order):

**Priority 1 — Intelligence Consolidation**
Stop adding new intelligence panels. Consolidate existing intelligence into a single unified view: the **Intelligence Dashboard**. Replace 8 separate intelligence tabs with one high-density page that shows everything.

**Priority 2 — Self-Serve Onboarding**
A new user should reach first value in under 5 minutes. Upload one document. Get three insights. See the intelligence layer form. Feel the moat.

**Priority 3 — Intelligence Persistence & History**
The intelligence store must become versioned. Weekly snapshots. Before/after comparisons. The product must show: "Your knowledge health improved 12% this month." This is when the intelligence moat becomes visible to the customer.

**Priority 4 — Multi-user / Team Mode**
Intelligence is only powerful when shared. Multiple people querying the same product = exponentially richer intelligence. This unlocks the team pricing tier.

**Priority 5 — First External Integration**
Pick one: Slack bot or VS Code extension. Route queries through the intelligence engine. Each external query enriches the intelligence store. Distribution + moat reinforcement simultaneously.

**Priority 6 — Cloud-hosted Option**
For customers who can't run local infrastructure. Same local-first architecture, hosted by us. Privacy-preserving. Intelligence stays in customer's isolated instance.

---

## The Intelligence Moat — Specific Mechanisms

### Mechanism 1: Query Velocity Compounds

The more a team uses it, the richer the organizational memory becomes. 100 queries builds a rough model. 10,000 queries builds a precise org-intelligence fingerprint. Switching costs increase with every query.

### Mechanism 2: Decision Archaeology

Over years, we extract and contextualize every architectural decision. A new employee can understand why every system was built. No other tool reconstructs this from retrospective analysis. It only works if the tool was present during the decision.

### Mechanism 3: Gap Evolution Tracking

We know what this team couldn't answer in January, what got documented in March, and what new gaps appeared in June. This is institutional memory of knowledge debt — not reconstructable from documents alone.

### Mechanism 4: Risk Intelligence History

We know which sections were fragile 6 months ago and which were fixed. We know the before/after quality curves. No competitor starting fresh knows this.

### Mechanism 5: Onboarding as Intelligence Output

The onboarding paths we generate are calibrated to the specific org's knowledge graph. They get better every time someone new joins and uses them. They're based on what real employees actually searched when they started, not what someone wrote in a wiki.

---

## Technology Alignment — The Private AI Future

The AI infrastructure stack is evolving in one specific direction: **away from general cloud models, toward specialized private models on company infrastructure.**

Timeline:
- **2024–2026:** General models via API (GPT-4, Claude, Gemini). High cost, external data exposure. Most companies here now.
- **2026–2028:** Domain fine-tuned models on company infra (Llama-based, vLLM-hosted). Moderate cost, private. Large enterprises moving here.
- **2028–2032:** Company-specific specialized models trained on their own codebase, docs, and history. Low cost, maximum alignment. The default for serious engineering organizations.

**At every stage, Knowledge Hub becomes more valuable, not less.**

### Stage 1 → 2: We're already there.
Knowledge Hub runs on Ollama today. We are the intelligence layer a private deployment needs.

### Stage 2 → 3: Deeper integration.
When a company's specialized model knows their domain deeply, our intelligence layer tells it WHERE the gaps are, WHAT decisions were made and why, WHAT the team searches for but fails to find. The intelligence becomes context for the model — not just for the UI. The model gets smarter from our intelligence. We get richer intelligence from the model's better extraction quality.

### Stage 3: Symbiosis.
The specialized model was trained on their documents. Our intelligence was generated from their behavior. Together, the answer quality is qualitatively different from any general deployment. No new entrant can reproduce this state.

### Why foundation model improvement benefits us, not threatens us:

| Foundation improvement | Effect on Knowledge Hub |
|---|---|
| Better LLMs (reasoning, extraction) | Better Decision Graph quality → richer intelligence → stronger MOAT |
| Cheaper inference | More queries answered → faster intelligence accumulation → IDS rises faster |
| Specialized embedding models | Better retrieval → better confidence gate hits → more answered queries → denser memory |
| Faster, smaller models | Lower customer infrastructure cost → broader adoption → more intelligence generated |
| Better instruction-following | More reliable JSON extraction → fewer parse failures → cleaner intelligence store |

**The key insight:** Foundation models are a cost we pay to generate intelligence. As that cost falls and quality rises, we generate more intelligence faster and cheaper. We are a net beneficiary of every foundation model advance.

### The one structural requirement this creates:

> **The LLM must always be a plug-in, never a dependency.**

If our intelligence generation is coupled to a specific model's output format, we cannot benefit from better models without breaking the intelligence layer. This is now encoded as Engineering Decision #10. Every extraction prompt must be tested against model swaps. Every intelligence schema must be versioned. The intelligence must outlive the model that helped generate it.

### The real threat: foundation model vendors moving up the stack.

OpenAI Memory, Claude Projects, Google Workspace AI — they are building organizational memory. They will get here.

**Our permanent defense:**
1. **Local-first architecture** — cloud vendors structurally cannot serve regulated industries, security-sensitive enterprises, or data-sovereign organizations. This is a permanent market segment they cannot enter.
2. **Proprietary intelligence format** — our intelligence is readable only by our product. Even if a competitor builds better local RAG, they cannot absorb our accumulated organizational intelligence. The customer starts over.
3. **Model-agnostic** — we are not a wrapper around any specific model. We work with any LLM. A company's specialized model is our most powerful partner, not our competitor.

---

## Competitive Position

| Competitor | What they do | Our differentiation |
|---|---|---|
| Notion AI | Search your notes with AI | We generate intelligence from behavior, not just content |
| Confluence AI | Summarize pages | We track organizational memory over time |
| Guru / Tettra | Knowledge base with AI search | No intelligence compounding, no switching cost |
| GitHub Copilot | Code generation | We serve knowledge about the org, not code generation |
| Glean | Enterprise search | Privacy-first, local, intelligence MOAT vs. cloud-only |
| Custom RAG setups | Build-it-yourself | Intelligence layer + UI + integrations + moat — they have to rebuild everything |

**Our position:** The only local-first engineering knowledge platform that compounds organizational intelligence as a proprietary platform asset. Privacy-first by default. Intelligence-first as the moat.

---

## The Flywheel

```
Team uses the product
        ↓
Product generates richer intelligence
        ↓
Intelligence makes the product more valuable
        ↓
More teams join (word of mouth, case studies)
        ↓
Switching cost increases (intelligence accumulates)
        ↓
Product becomes the single source of truth
        ↓
Platform intelligence enables automation
        ↓
Automation enables the next tier of value
```

The flywheel starts spinning the moment a team accumulates 90 days of query history. Before that point, the product is good. After that point, the product becomes irreplaceable.

**The 90-day moat window is the most important product milestone we have not yet defined.**

---

## Revised Company Purpose

> Knowledge Hub exists to transform how engineering organizations understand, retain, and evolve their collective intelligence.

> We do not build documentation search. We build the intelligence layer that compounds over time — the more a team uses it, the smarter it gets, and the harder it is to leave. Every query is an investment in the organization's knowledge capital.

> We are local-first because privacy is non-negotiable. We generate proprietary intelligence because switching costs are our business model. We compound because time is our competitive advantage.

---

## Revised North Star Metric

Not: "Does it answer questions?"

**The North Star: Intelligence Density Score per Organization**

Defined as: how rich is the intelligence layer for a given customer?

Components:
- Query memory density (queries logged / section count)
- Decision coverage (decisions extracted / architectural sections)
- Gap resolution rate (gaps that were later filled)
- Trend history depth (weeks of quality trend data)
- Risk baseline established (first full risk assessment completed)

A customer who has achieved Intelligence Density Score > 0.7 will never leave.

**Our entire product roadmap should optimize for getting customers to IDS > 0.7 as fast as possible.**

---

## What We Will NOT Do

Based on the Kill List principle and this new direction:

- Build another standalone intelligence panel (consolidate instead)
- Build features with zero distribution path
- Optimize features no one has validated with real customers
- Build for engineers who aren't ready to pay
- Pursue features that don't compound the intelligence store

---

## Immediate Next Steps

1. **Fix the nav** — 11 tabs is a symptom of a feature factory. Consolidate into 4 groups. Today.
2. **Define the Intelligence Store schema** — make the intelligence layer explicit, versioned, and the primary product asset
3. **Build the Intelligence Dashboard** — one view that shows everything. Remove the need for 8 separate tabs.
4. **Define the 90-day moat milestone** — what does IDS > 0.7 look like? How do we get customers there faster?
5. **Self-serve onboarding** — first value in 5 minutes. This is priority one for growth.

---

*This document supersedes all previous mission files where they conflict with this direction.*

*Written: 2026-08-03. Review: 2026-11-03.*
