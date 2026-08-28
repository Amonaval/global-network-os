# Generic Network OS — Technical Evolution & Debt Register

**Updated:** 2026-08-27  
**Purpose:** periodically address technical debt/future architecture without allowing refactoring to dominate product development.

## Review cadence

Review at milestone boundaries or when entering a materially new vertical. Do not create work solely because an item exists here.

## Priority buckets

| Area | Future direction | Trigger to act |
|---|---|---|
| Graph model | Generalize tree assumptions into typed entity/edge capabilities where needed | A validated non-tree vertical is blocked |
| Mobile portability | Extract reusable domain/API/i18n/design contracts | Native/mobile shell becomes planned or web-only assumptions block UX |
| I18N | Remove literal-string gaps and add completeness checks | Any supported locale shows partial English UX |
| Design system | Consolidate responsive primitives/tokens/layout patterns | Repeated CSS regressions or cross-vertical inconsistency |
| Permissions/RLS | Centralize capability authorization contracts and tests | New cross-network or sensitive vertical work |
| Search | Unified entity/relationship/knowledge search abstractions | Scale or multi-domain discovery requires it |
| Performance | Large graph virtualization, server-side search/pagination, caching | Real datasets create measurable latency/UX issues |
| Offline/resilience | Selected offline-first/mobile sync patterns | A validated field/mobile workflow needs intermittent connectivity |
| Notifications | Provider-neutral event/notification contracts | Return loops justify push/email/in-app orchestration |
| Observability | Product + network outcome telemetry | Real-user activation/commercial pilots begin |
| Data portability | Export/import/versioned schema contracts | Enterprise/public-sector adoption or migration requirements |
| AI isolation | Evidence adapters and model/provider interfaces | More RAG/LLM use enters production workflows |
| Compliance | Region/domain-specific security/privacy controls | Healthcare, public sector, enterprise or regulated data enters scope |

## Rule

Technical debt is prioritized by **user impact, security/privacy, scalability, portability, validated commercial leverage and development drag**—not by architectural aesthetics.
