# P4 Roadmap — Revised from P3 Architecture Audit

## P4.1 — Foundation, Trust & Adoption
- Database-level privacy for private contact fields.
- Relationship integrity: self-link, duplicate, orphan, generation-order and parent/child-cycle protection.
- Duplicate identity detection and import validation.
- Generalized change-request and audit model.
- Repository abstraction separating shared Supabase and local/demo persistence.
- Profile photo upload through Supabase Storage with file type/size validation.
- Secure, single-use, expiring member invitation links.
- Mobile bottom navigation introduced now; every P4 feature must remain mobile-usable.

## P4.2 — Relationship Intelligence & Human Profiles
- How am I related?
- Relationship paths and common ancestors.
- Branch discovery and relationship explanations.
- Simple life-event timeline.
- Profile visibility controls and profile improvements.

## P4.3 — Community, Memories & Discovery
- Member collaboration through the generalized change-request model.
- In-app notifications for reviewed contributions and invitation acceptance.
- Community memories/stories with optional media and visibility controls.
- Profile-attached memories shown in the member drawer.
- Advanced directory discovery: text, profession, city, generation, and living/deceased filters.
- Mobile Community area and responsive discovery/memory experiences.

## P4.4 — Intelligence, Geography, Export & Scale
- Family/branch analytics.
- Geographic intelligence.
- PDF/SVG/filtered exports.
- Server-side discovery and graph windowing for larger networks.
- Final performance and PWA refinement.

### Product constraints
- Do not turn profiles into LinkedIn-style resumes.
- Mobile usability is a continuous requirement, not a final polish pass.
- Preserve the existing P3 tree, directory, map, auth, import/export and demo/local mode.
- Avoid native mobile apps, AI, social feeds, chat and complex RBAC until demand justifies them.


## P4.2 roadmap

P4.2 — Relationship Intelligence & Human Profiles: shortest relationship paths, common ancestors/descendants, kinship explanations, simple life-event timelines, profile/contact visibility controls, and mobile-usable relationship/profile experiences.

## P4.3 implementation

P4.3 is implemented in the current source baseline. See `P4.3-IMPLEMENTATION.md` and migration `008_p4_3_community_discovery.sql`.
