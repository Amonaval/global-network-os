# Mission 3 — Governed Graph Platform + Institutional Bootstrap

Status: SOURCE IMPLEMENTED / RUNTIME VERIFICATION OPEN  
Effort: MEDIUM

## Purpose
Prove that Network OS can evolve beyond hierarchy without replacing the working hierarchy architecture, and give one institutional sponsor a practical path to seed and activate a network.

## Implemented
- Additive governed graph contracts under `core/graph/`.
- Typed relationship rules can declare direction, inverse labels, allowed source/target entity kinds and evidence expectations.
- New relationships created through the productized runtime receive governance metadata (`source`, `status`, optional confidence/evidence IDs).
- Professional relationships now declare explicit person/organization constraints.
- Existing hierarchy/projection behavior is unchanged: a tree remains one valid projection of the broader graph.
- Additive institutional bootstrap runtime under `core/bootstrap/`.
- Admin-facing Institutional Bootstrap panel reuses existing entity import, join code, profile claiming, membership and delegated-admin capabilities.
- Deterministic stages: Seed → Activate members → Claim identities → Delegate admins → Enrich network.
- Downloadable CSV seed-template header and copyable launch invitation.

## Explicitly excluded
- no graph database migration;
- no replacement of current network tables;
- no cross-network readable graph;
- no AI/RAG dependency;
- no patient/clinical data;
- no parallel invitation or identity system.

## Product hypothesis
A single association, institution, practice group or network sponsor should be able to seed a useful network and then distribute maintenance across members/admins rather than onboarding every person manually.
