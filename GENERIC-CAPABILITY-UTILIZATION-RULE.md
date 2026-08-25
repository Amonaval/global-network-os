# Generic Capability Utilization Rule

## Purpose

The Generic Network OS exists to let mature cross-network capabilities be implemented once and consumed by every vertical where the semantics fit. A vertical is not considered product-complete merely because it has a route, feature key, card or generic placeholder for a capability.

## Default rule

When an existing capability is semantically applicable to another vertical, reuse it by default.

A missing integration is treated as product incompleteness unless the vertical documents an explicit semantic, privacy, lifecycle or product reason for excluding it.

## Extraction rule

Before implementing a capability directly inside a vertical:

1. Check whether the same user value exists in at least one other vertical.
2. If it is applicable to two or more verticals, first evaluate the lowest semantically correct shared capability layer.
3. Keep domain vocabulary, validation and domain-only persistence inside the vertical adapter.
4. Never make Core import a vertical and never make one vertical import another vertical implementation.
5. Do not pursue arbitrary reuse percentages. Reuse only what is semantically correct, but do not leave obvious reusable capabilities disconnected.

## Productized Vertical Gate

A vertical may be called **Productized** only when all of the following are true:

- the vertical has a real user lifecycle, not only navigation stubs;
- every mature shared capability marked Applicable or Adapt in the capability matrix is actually usable, or has a documented deferral/exclusion;
- its Playground contains enough realistic data to exercise the important capability paths;
- its empty/loading/error states and responsive layout are usable;
- contextual Guide coverage exists for the surfaced capabilities;
- Launch Control can independently classify/reveal the vertical's applicable capability bundles;
- admin/governance paths are explicit and tenant-safe;
- the vertical passes its capability-depth regression gate.

## Capability states

Use these statuses in capability audits:

- **MATURE** — strong product experience exists and is reusable as-is or through a thin adapter.
- **AVAILABLE** — shared primitive/runtime exists but product UX is thinner than the mature reference.
- **PARTIAL** — some behavior exists, but key lifecycle or UX pieces are missing.
- **MISSING** — applicable capability is not integrated.
- **DOMAIN** — intentionally vertical-specific.
- **N/A** — not semantically applicable.
- **DEFERRED** — applicable but explicitly postponed with a roadmap owner/gate.

## Showcase rule

A Playground is a product proof, not sample filler. It must include enough entities, relationships, activities, locations and affiliations to make the vertical's important reusable capabilities discoverable and meaningful.

A five-record dataset is insufficient for a network product if it cannot demonstrate search, projections, relationships, community activity, geography, contribution/governance and future intelligence.

## Permanent architecture principle

**Genericize once, adapt deliberately, reuse everywhere it fits, and require an explicit reason for every applicable capability that is not consumed.**
