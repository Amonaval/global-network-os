# S1-C — Effortless Creation & Import

**Status: IMPLEMENTED IN SOURCE / LIVE BEHAVIOUR VERIFY REQUIRED**  
**Date: 2026-08-23**

S1-C converts family creation from a setup exercise into a progressive, human-first journey.

## Implemented in this batch

### 1. Family-name-only creation remains the minimum
- Only family name is required to create the family space.
- Fresh creator is still expected to resolve immediately as Family Owner.
- After creation, a positive **Your family is ready** experience offers the next smallest actions instead of dropping the user into an empty shell.

### 2. Add Myself first
- Fresh empty/small families get a visible close-family starter.
- The creator can add **Myself** with only a name; gender is optional profile context.
- Shared mode uses `add_myself_to_family(...)`, which securely links the new member profile to the creator's active family membership.
- No demo/friendly IDs are sent into UUID-only persistence.

### 3. Close-family additions
After the creator is linked to a member profile, the same starter supports:
- Father
- Mother
- Husband
- Wife
- Son
- Daughter

Only a name is required. The app derives the stored parent/spouse edge and a sensible generation position, while all other details remain optional.

### 4. Import made friendlier
- Existing import preview and validation remain mandatory before persistence.
- Friendly IDs such as `P001` are normalized to UUIDs before shared persistence.
- Human relationship vocabulary remains supported: Father, Mother, Son, Daughter, Husband, Wife, Parent, Child, Spouse.
- People-only CSV remains supported when no relationship sheet exists.
- Incomplete information is allowed where safe.
- Friendly validation/recovery remains in place.

### 5. New guided assets
- `public/family-excel-guided-template.xlsx`
  - Instructions sheet
  - Family Members sheet
  - Relationships sheet
  - dropdowns for Gender, Generation, Living Status and Relationship
- `public/family-demo-small-10.xlsx`
- `public/family-demo-showcase-60.xlsx`
- `public/family-people-simple.csv`

The prior 150-person concept is superseded for the current showcase by a denser **60-person / 5-generation** family. Historical files/roadmap history are not deleted merely because the showcase strategy changed.

## Showcase family

The current demo is intentionally designed to demonstrate product capability rather than raw row count:
- 60 synthetic members
- 5 generations
- 142 relationships
- multiple cities/countries and professions
- living + deceased relatives
- repeated human family patterns suitable for relationship-to-me testing
- 57 life events/milestones
- 12 narrative memories/stories
- social/identity examples
- map/analytics data
- contribution prompts
- connected groups
- reunion/event examples
- invitation/participation metrics in Playground showcase mode

Anonymous Playground remains read-only/no-save. A shared family explicitly created using the demo seed receives fresh UUIDs before persistence and can persist the showcase members, relationships, life events and memories.

## Profile approval defect fixed

### Symptom
A Family Owner/Admin could edit their name, open the approval queue and receive:

`permission denied for table profile_submissions`

### Cause
P4 security hardening correctly revoked direct `UPDATE` on `profile_submissions`, but the newer review UI still attempted a direct table update after applying the profile change.

### Fix
Migration `035_s1c_profile_submission_review.sql` adds `review_profile_submission(...)`:
- authenticated only;
- active-family scoped;
- Family Owner/co-admin only;
- submission must belong to the active family;
- retains direct table UPDATE revocation;
- writes an audit event.

The client review path now calls this RPC. The UI guard also recognizes family Owner/Admin membership rather than relying only on legacy global `auth.role` semantics.

## Source validation

`npm run validate:s1-c` → **18/18 PASS**.

Cumulative source gates also pass:
- S1-A/B 13/13
- CR1 12/12
- CR2 10/10
- CR2.1 9/9
- CR2.2 10/10
- CR2.3 12/12
- V1 source gate PASS
- D1 source gate PASS

## Not yet certified

A real production `next build` was not completed in this environment because restoring npm dependencies timed out. Source gates are not a substitute for deployed behaviour.

The following remain **LIVE VERIFY**:
1. apply migration 035 to live Supabase;
2. Owner edits own governed name → submission → Owner approves → profile updates and submission becomes approved;
3. co-admin can review allowed submissions;
4. normal member cannot review submissions;
5. fresh family-name-only create → Add Myself → add Father/Mother/partner/child;
6. small workbook preview/import;
7. people-only CSV preview/import;
8. 60-person showcase workbook import;
9. anonymous Playground shows memories/timeline/participation showcase without touching live family data;
10. 360/390/430 px first-use and import behaviour;
11. reload/logout/login persistence after manual creation/import.

## S1 status

- **S1-A:** IMPLEMENTED IN SOURCE / LIVE VERIFY
- **S1-B:** IMPLEMENTED IN SOURCE / LIVE VERIFY
- **S1-C:** IMPLEMENTED IN SOURCE / LIVE VERIFY
- **S1 overall:** IMPLEMENTED IN SOURCE / BEHAVIOUR GATE STILL OPEN
- **S2:** BLOCKED until the full S1 persona gate passes
- **CR2.3:** remains IMPLEMENTED / LIVE VERIFY
