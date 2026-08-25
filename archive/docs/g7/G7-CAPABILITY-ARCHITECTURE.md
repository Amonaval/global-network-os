# G7 — Capability Architecture

## Layering

```text
Vertical Product Experience
        ↓
Vertical Composition / Policies / Semantics
        ↓
Shared Capability Engines
        ↓
Generic Network Core
        ↓
Persistence / RLS / RPC / Storage
```

Dependencies flow downward only.

## Generic Network Core

### Tenant & membership
- network identity
- vertical/template identity
- user ↔ network membership
- roles
- active network
- delegated administration

### Generic entities
The platform should support multiple entity kinds over time:
- person
- organization
- location
- team
- project
- product
- institution
- program
- store/branch
- subject/stream
- account/customer
- custom entity

G7 should not rush into replacing all current Family/Alumni persistence with one universal table. Define contracts and an additive migration path first.

### Affiliations
Affiliation means an entity belongs to a dimension/value.

Examples:
- Person belongs to Batch 2011
- Employee belongs to UI Platform
- Store belongs to Pune
- Supplier belongs to Maharashtra
- Subject belongs to AI

### Typed relationships
Relationships connect entities while semantics remain vertical-owned.

Examples:
- Family: `parent_of`, `spouse_of`
- Alumni: `batchmate_of`, `mentored_by`
- Organization: `reports_to`, `works_on`
- Business Trust: `recommends`, `supplies_to`
- Education: `prerequisite_of`, `leads_to`
- Supply Chain: `depends_on`

The shared graph engine may traverse them but must not invent their meaning.

## Shared Capability Engines

### Network Explorer
Shared:
- hierarchy projection
- graph traversal
- drill-down
- counts
- result panels
- saved filters/views

Vertical adapters:
- Family kinship tree
- Alumni affiliation explorer
- Organization matrix explorer
- Franchise geography/ownership explorer
- Education knowledge graph

### Discovery / Search
Shared:
- text search
- faceted filters
- dimensions
- pagination
- sorting
- saved queries/views

Vertical supplies:
- searchable fields
- filter definitions
- ranking policy
- privacy policy

### Groups / Communities / Chapters
Shared mechanics:
- group creation
- membership
- scoped announcements
- events
- contribution campaigns

Different terminology:
- Family community
- Alumni chapter
- Organizational guild
- Franchise council
- Association chapter

### Events / RSVP
Shared:
- lifecycle
- audience targeting
- RSVP
- reminders
- attendee list
- online/hybrid/physical venue
- post-event memory/media linkage

### Memories / History / Media
Shared:
- story/media records
- people/entity tags
- node tags
- date/place
- event linkage
- visibility
- provenance

### Maps
Shared:
- geospatial aggregation
- clustering
- map↔directory navigation
- location filters

### Milestones
Shared:
- date
- recurrence
- associated entity
- notification eligibility

### Contributions
Shared:
- missing-data prompts
- scoped contribution requests
- reviewer workflow
- provenance
- completion score

### Connection Paths
Shared:
- authorized path traversal
- path length
- explanation hook

Vertical explanation remains domain-specific.

### Construction / Import
Shared lifecycle:
- intake session
- staged entities/edges
- matching candidates
- conflict decisions
- validation
- provenance
- commit contract

Vertical validation/commit semantics remain domain-specific.

## Intelligence extension layer

G7 should define extension points, not attempt to implement every future intelligence product.

Potential engines:
- recommendations
- network health
- missing-link detection
- trust confidence
- expertise/knowledge gaps
- structural risk
- AI question answering over authorized network data
