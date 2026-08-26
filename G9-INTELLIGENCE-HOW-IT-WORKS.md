# G9 Intelligence — How It Works

## Purpose
G9 turns an authorized network dataset into explainable discovery, path, health and opportunity answers. It is deliberately **deterministic first**: it does not send the unrestricted network to an LLM and it does not invent relationships.

## Runtime contract
**Tenant isolated · permission aware · provenance visible · deterministic first.**

The intelligence component receives only the entities, affiliations, typed relationships and activity records already available to the current vertical/session. G9 does not create a separate data-access path.

## What the engine reads
For each authorized entity, G9 can use:
- entity label and kind;
- configured affiliations/dimensions (team, skill, city, product, batch, company, region, category, etc.);
- string/number metadata already present on that entity;
- typed relationships visible in the current network;
- selected activity records such as lessons, stories and milestones.

## Answer pipeline
### 1. Normalize the question
The current deterministic engine lower-cases and tokenizes the question.

### 2. Find relevant entities
`searchNetwork()` searches entity labels, affiliations and safe scalar metadata. Each query word that appears in an entity's searchable text adds to its deterministic score.

This is intentionally simple and inspectable. It is not an embedding model and does not currently perform fuzzy semantic retrieval.

### 3. Classify the requested job
`askNetwork()` recognizes several high-value question shapes:
- **connection / introduction / path**;
- **gap / missing / risk**;
- **expertise / skill / supplier / location / company discovery**;
- **strong connector / central entity**;
- generic network evidence discovery.

### 4. Run graph/data reasoning
The shared engine provides:
- `shortestPath()` — breadth-first traversal over known typed relationships;
- `analyzeHealth()` — context completeness, isolated entities, highly connected entities and missing-link candidates;
- missing-link detection — entities sharing at least two configured affiliation contexts but having no known direct relationship;
- `buildInsights()` — converts deterministic findings into user-facing opportunities, warnings and suggested actions.

### 5. Build evidence
Every answer carries evidence such as:
- matched entity;
- shared affiliation;
- typed relationship;
- captured activity/lesson;
- health/completeness observation.

The UI renders this as **Why this answer**.

### 6. Assign confidence
Current G9 confidence is deliberately simple:
- **high**: at least 3 evidence items;
- **medium**: at least 1 evidence item;
- **low**: no supporting evidence.

This is an evidence-volume indicator, not a statistical probability.

## Concrete examples
### Organization — “Who understands authentication best?”
1. Search `authentication` across allowed people, skills, products and metadata.
2. Return the strongest exact-context matches.
3. Show their relevant affiliations (for example Skill = Authentication, Product = Identity Platform).
4. The user can open the entity and then inspect typed working/dependency connections.

G9 does **not** claim someone is an expert unless the current network data supplies relevant evidence.

### Organization — “Who are the strongest connectors?”
1. Count typed relationship degree for every visible entity.
2. Rank the highest-degree entities.
3. Explain the result with the number of known typed relationships.

This is structural centrality, not a popularity score.

### Business Trust — “Who can introduce me to a packaging supplier?”
1. Find a relevant supplier target from category/service/name context.
2. If the question yields two clear entities, calculate the shortest known relationship path.
3. If there is one clear supplier target, G9 now looks for known typed relationships into that target and surfaces possible introducer candidates.
4. If no relationship exists, it explicitly says there is **no verified warm path** rather than fabricating one.

This behavior was strengthened during G9 runtime certification after the first behavioral smoke test exposed the single-target introduction gap.

### Franchise — “Which location can help with weekend staffing?”
1. Match locations carrying relevant topic/region/format/context.
2. Return matching stores and their visible affiliations.
3. Existing typed support relationships and Operations Playbook activity can then provide explainable follow-up context.

### Family — “Which branches need more information?”
1. Calculate completeness across configured family dimensions.
2. Find isolated family entities/records.
3. Surface the evidence and direct the user toward contribution/profile completion.

## Current G9 limitations — important
G9 is a strong deterministic foundation, **not yet a mature semantic AI system**.

It does not yet have:
- embeddings or semantic similarity;
- typo/fuzzy/synonym understanding;
- relationship-type weighting;
- time-decay or recency-aware trust scoring;
- provenance-strength scoring;
- current-viewer anchored paths as an explicit engine input;
- sophisticated expertise scoring from outcomes/ownership/history;
- dependency blast-radius analysis such as “what breaks if this person leaves?”;
- probabilistic confidence calibration;
- LLM summarization.

These omissions are intentional for G9. They define the next intelligence depth needed for a serious paid Organization or Franchise pilot.

## Future AI rule
If an LLM is added, it should receive a compact, already-authorized evidence bundle produced by these engines. The LLM may summarize/explain the evidence; it must not become an unrestricted alternate route to tenant data and must not invent graph facts.
