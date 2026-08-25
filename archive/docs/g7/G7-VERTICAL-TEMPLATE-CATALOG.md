# G7 — Vertical Template Catalog

Templates describe **composition + semantics**, not separate codebases.

## Family Network
**Entities:** Person, place, event, memory  
**Structure:** Kinship graph + community/group structure  
**Reusable capabilities:** Explorer, profiles, memories, milestones, events/RSVP, maps, contributions, claiming, invitations, connection paths, digest  
**Vertical-only:** ancestry, generation, kinship naming, lineage validation, deceased/remembrance

## Alumni Network
**Entities:** Person, institution, program, stream, batch, chapter, employer, city  
**Structure:** Multi-dimensional affiliation graph  
**Reusable capabilities:** Explorer, directory, search, groups, events/RSVP, memories, maps, claiming, contribution campaigns, connection paths, digest  
**Vertical-only:** institutional semantics, batch/program/stream, mentorship, alumni chapters

## Organizational Intelligence
**Entities:** Person, team, department, business unit, project, product, skill, location  
**Structure:** Multiple overlapping affiliation structures  
**Relationships:** reports_to, works_with, owns, supports, depends_on, expert_in  
**Reusable capabilities:** Explorer, people search, groups/guilds, events, history, maps, contribution, connection paths  
**Future intelligence:** expertise discovery, bus-factor risk, knowledge concentration, cross-team dependencies, organizational change impact

Example questions:
- Who understands Authentication Platform best?
- Which teams depend on Product X?
- Where are knowledge gaps after attrition?
- Who can introduce Team A to an expert in Team B?

## Business Trust Network
**Entities:** Person, business, location, product/service category  
**Relationships:** knows, recommends, verified_by, supplies_to, buys_from, worked_with  
**Reusable capabilities:** discovery, profiles, maps, groups, events, contributions, provenance, claiming, connection paths  
**Future intelligence:** trust confidence, verified introduction paths, category/region coverage

Example:
> Find a packaging supplier in Pune trusted by at least two businesses in my network.

## Franchise Network
**Entities:** Brand, franchise, store/location, owner, manager, staff, region, city  
**Structure:** Geography + ownership + operations  
**Relationships:** owns, operates, manages, supports, belongs_to_region  
**Reusable capabilities:** hierarchy explorer, maps, directory, regional groups, events/training, announcements, media, contributions, delegated admin, import  
**Future intelligence:** performance, compliance, training readiness, best-practice discovery

Example projections:
- India → Maharashtra → Pune → Kharadi
- Franchise Owner → Locations → Managers
- Region → City → Store Type

## Education Graph
**Entities:** Subject, stream, course, degree, institution, career, expert  
**Structure:** Knowledge graph + optional hierarchy  
**Relationships:** prerequisite_of, related_to, leads_to, taught_by, offered_by  
**Reusable capabilities:** graph explorer, search, pathways, guides, expert profiles, recommendations, institution maps  
**Future intelligence:** educational pathways, subject compatibility, career transitions

Examples:
- AI ↔ Statistics
- Robotics ↔ Mechanical Engineering
- Bioinformatics ↔ Biology + Computing

## Professional / Industry Network
**Entities:** Person, skill, company, role, industry, community, city  
**Reusable capabilities:** discovery, profiles, events, groups, maps, introductions, mentorship, achievements

## Association / Member Organization
**Structure:** National → State → City → Chapter → Committee  
**Reusable capabilities:** hierarchy, directory, events, groups, announcements, maps, delegated admin

## Residential / Society Network
**Structure:** Township → Society → Building → Wing → Floor → Home  
**Reusable capabilities:** directory, groups, events, trusted providers, notices, contributions, local history

## Supply Chain / Partner Ecosystem
**Entities:** Company, supplier, distributor, warehouse, logistics partner, product/material  
**Relationships:** supplies, depends_on, ships_to, certified_by, owned_by  
**Reusable capabilities:** explorer, maps, profiles, discovery, contribution, provenance, alerts  
**Future intelligence:** hidden dependencies, concentration risk, geographic vulnerability

## Investor / Startup Ecosystem
**Entities:** Founder, startup, investor, fund, accelerator, advisor, sector  
**Relationships:** founded, invested_in, advises, worked_at, introduced_by, co_invested_with  
**Reusable capabilities:** profiles, trusted discovery, events, maps, groups, warm-intro paths

## Customer / Account Intelligence
**Entities:** Customer, account, business unit, stakeholder, internal owner, partner, product  
**Relationships:** owns_relationship, influences, sponsors, supports, knows, uses_product  
**Reusable capabilities:** relationship explorer, history, notifications, contribution, stakeholder discovery, connection paths

## Custom Network
The Custom template proves unknown-future readiness.

It may configure:
- entity types
- dimensions
- affiliations
- relationship types
- capability packs
- terminology
- profile fields
- search/filter definitions
- navigation
- privacy defaults
- guide/playground metadata
- optional intelligence adapters

It must not inherit Family or Alumni semantics implicitly.
