# Hierarchy Network — P4.1 Trust & Governance

A generic hierarchy/network application. It is not tied to any surname or family. The first-run setup asks for the network name and lets an administrator start empty, load the fixed 150-member demo, or import CSV/XLSX/XML.

## Key P3 fixes
- Non-UUID source IDs are mapped to generated PostgreSQL UUIDs during import.
- Parent/father/mother/spouse references are resolved by source ID, UUID, or name.
- No random mock data is loaded automatically.
- Generic network name and description are stored in the app/Supabase.
- First authenticated user on a fresh Supabase project becomes admin.
- Admin-only shared imports and relationship management remain protected by RLS.
- Fixed 150-member demo is deterministic and only loaded when explicitly selected.
- City map, lineage focus, deceased display, directory, submissions, export and relationships remain available.
- P4.1 adds database-level contact privacy, relationship integrity checks, duplicate detection, import validation, change requests, audit logging and capability foundations.

## Start locally
```bash
npm install
npm run dev
```
Without Supabase variables the app runs as a local network and stores data in localStorage. A first-run setup is still required.

## Production
Use the included `SUPABASE-SETUP-GUIDE.md` and `VERCEL-SETUP-GUIDE.md`. Docker/Podman and the Supabase CLI are not required for the cloud setup.

## P4.3

P4.3 adds the Community area, memories/stories with optional media, user-scoped notifications, invitation/change-request update notifications, profile-attached memories, and advanced directory discovery filters. Apply migration `008_p4_3_community_discovery.sql` after the P4.2 migrations.


## P4 complete

P4.1 Foundation/Trust/Adoption, P4.2 Relationship Intelligence/Human Profiles, P4.3 Community/Memories/Discovery, and P4.4 Intelligence/Geography/Export/Scale are included. See `P4.4-IMPLEMENTATION.md` for the final migration and deployment checklist.
