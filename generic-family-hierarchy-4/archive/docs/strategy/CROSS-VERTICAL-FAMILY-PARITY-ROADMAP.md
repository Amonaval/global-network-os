# TRUSTWEAVE / GENERIC NETWORK OS — XP CROSS-VERTICAL PRODUCT PARITY PROGRAM

We are starting a fresh implementation session for the **XP cross-vertical productization missions**.

## Files attached

1. `global-network-os-main-HS6-platform-parity.zip`
   - Treat this as the **latest implementation source of truth**.
   - It contains the completed Housing Society HS-0 → HS-6 work plus the latest platform-parity changes and build fixes.
   - Do NOT restart from older HS ZIPs or reconstruct changes from previous conversation history.
2. `CROSS-VERTICAL-FAMILY-PARITY-ROADMAP.md`
   - Treat this as the **governing XP roadmap and audit handoff**.
   - Read it fully before implementing XP-0.

---

# Current product state

Housing Society missions are source-complete through:

- HS-0 — Vertical Foundation
- HS-1 — Property, Household & Resident Core
- HS-2 — Daily Society Operations
- HS-3 — Maintenance, Dues & Finance
- HS-4 — Governance, Meetings & Decisions
- HS-5 — Security, Compliance & Asset Operations
- HS-6 — Founder Society Pilot & Commercialization

Runtime/regression verification by the user is intentionally still pending.

Do NOT redesign or reopen HS missions unless an XP change reveals a genuine shared-platform defect.

Recent cross-platform parity work already added:

- Language selector to released vertical shells
- Public / Member / Admin preview
- shared “Choose the easiest starting point”
- Build Together
- Excel/CSV starting option
- Start Small
- creator-visible network deletion entry point
- generic network switcher consistency

However, the deeper audit showed that Family remains much more mature in several **generic product jobs**.

The purpose of XP is to extract those mature generic behaviors from Family and make them reusable across all released verticals without copying Family-specific domain logic.

---

# Binding architecture principle

Do NOT make every vertical look like Family.

Family-specific concepts remain Family-only:

- kinship
- spouses
- parents/children
- ancestors
- memorial behavior
- family-specific birthdays/relationships

Extract only generic product jobs such as:

- onboarding
- activation
- guided import
- privacy understanding
- invitations
- claiming
- contribution/corrections
- administration
- lifecycle
- backup/export
- guides
- What’s New
- launch/readiness
- i18n
- safe deletion

Prefer:

**shared primitive / contract / registry → vertical configuration**

over:

**copying Family JSX into every vertical**.

---

# Released verticals in parity scope

At minimum:

- Family
- Alumni
- Housing Society
- Family Association
- Association / Community
- Organization
- Business Trust
- Franchise
- Professional

Do not break or rename any existing vertical.

---

# XP roadmap

Implement missions **sequentially and freeze a clean checkpoint after every mission**.

## XP-0 — Network Lifecycle Safety

Goal:

Make network lifecycle behavior explicit, reversible where appropriate, and provably destructive when Hard Delete is chosen.

### Required lifecycle actions

#### 1. Leave Network

Removes only the current user's membership/access.

Must NOT delete the network or other members' data.

#### 2. Archive / Soft Delete

Owner-controlled.

Behavior:

- network becomes inactive/archived;
- normal members cannot actively use it;
- all DB records and storage objects remain intact;
- creator can restore it;
- network remains visible to owner under an Archived section;
- preserve all history.

Implement **Restore Network**.

#### 3. Permanent Hard Delete / Purge

Owner-only.

Current exact-name confirmation may remain.

Later OTP/email step-up verification is planned but not mandatory for XP-0.

Hard purge must remove:

- network row;
- memberships;
- entities;
- relationships;
- activities;
- events;
- invitations;
- claiming state;
- access codes;
- vertical-specific records;
- billing/finance;
- governance;
- complaints;
- visitors/security;
- pilot data;
- audit/history that is network-owned;
- media/storage files;
- generated network-owned artifacts;
- all other network-scoped persistent records.

### CRITICAL

Do NOT merely assume FK cascade is sufficient.

Perform a **database-wide network ownership / foreign-key audit**.

Supabase Storage must be handled explicitly where necessary.

Create a residue verifier that can establish:

> zero network-owned relational records and zero network-owned storage objects remain after hard purge.

Hard-delete failure must be atomic/safe where possible.

Document tables/resources intentionally preserved, if any.

---

## XP-1 — Guided Excel / Workbook Onboarding Platform

Goal:

Bring the mature Family Excel onboarding experience to every released vertical.

Family currently has a guided workbook experience rather than merely an upload button.

Create a generic:

### Import Schema Registry

Each vertical declares:

- sheets
- columns
- required fields
- optional fields
- types
- enum/allowed values
- stable identifiers
- relationship references
- examples
- validation rules
- privacy notes
- importer mapping
- version

Then generate downloadable XLSX workbooks from that registry.

Avoid hand-maintaining unrelated Excel implementations.

### Every workbook should contain

- `README` / `Start Here`
- instructions
- realistic sample rows
- required/optional indicators
- accepted values
- examples
- stable IDs for cross-sheet relationships
- privacy warnings where relevant
- workbook/schema version
- no hidden knowledge required to successfully import it

### Suggested vertical workbook shapes

Family:

- retain existing mature workbook behavior unless refactoring safely improves reuse.

Alumni:

- Alumni
- Cohorts / Chapters
- Connections / affiliations

Housing Society:

- Buildings / Units
- Residents
- Occupancy / ownership / tenancy
- Households
- Vehicles
- Parking

Family Association:

- Families
- People
- Household membership
- Association membership

Organization:

- People
- Teams
- Projects
- Skills
- reporting / relationships where supported

Business Trust:

- Businesses
- Contacts
- Categories
- trust/business relationships

Franchise:

- Branches
- Owners / operators
- Geography
- organizational relationships

Professional:

- Professionals
- Expertise
- Affiliations
- professional relationships

Association:

- Members
- chapters/groups
- roles/affiliations as supported

### Import UX

For every vertical:

Download template → fill workbook → upload → validate → preview → confirm import.

Show:

- valid rows
- warnings
- rejected rows
- exact reason
- duplicate behavior
- relationship resolution failures

No manual DB work should be required.

---

## XP-2 — i18n Closure

The previous audit found approximately **625 visible literal candidates across 16 TSX files**.

Language switching exists, but much newer UI remains English-only.

Goal:

Move released vertical visible text into shared/vertical i18n catalogs.

### Requirements

- English canonical strings
- Hindi
- Marathi
- preserve existing translations
- remove ad-hoc inline `language === ...` translation blocks where practical
- no raw user-facing English scattered through released vertical components unless explicitly exempted
- shared platform strings must be shared, not copied per vertical

### Hard validation target

Create/strengthen an automated visible-literal gate.

Target:

> 0 unexplained user-facing visible literal violations in released production verticals.

Allow explicit documented exemptions only for:

- generated data
- identifiers
- technical/debug surfaces
- external proper nouns
- values that are genuinely not translatable copy

Do not simply suppress the scanner.

---

## XP-3 — Quick Start & Activation Parity

Goal:

Bring Family's mature blank-state onboarding / Quick Family Start concept to every vertical.

After creation, a network admin should NOT land in a mostly empty product with no idea what to do.

Create a configurable shared Quick Start framework.

Examples:

### Housing Society

- Import units & residents
- Add first building
- Add first flat
- Invite committee member
- Publish first notice

### Alumni

- Add myself
- Add first cohort
- Invite alumni
- Import alumni workbook

### Organization

- Add myself
- Create team
- Add first project
- Invite colleague
- Import organization workbook

### Franchise

- Add first branch
- Add owner/operator
- Define first geography
- Import workbook

### Business Trust

- Add my business
- Add trusted partner
- Create category/group
- Import workbook

### Professional

- Complete my professional profile
- Add expertise
- Invite professional connection
- Import workbook

Quick Start must be:

- role-aware
- vertical-configurable
- dismissible
- progress-aware
- resume-able
- linked to actual working actions

Avoid vertical-specific duplicated dashboard implementations.

---

## XP-4 — Shared Network Admin Center

Goal:

Provide a mature generic Admin Center across verticals.

Potential modules:

- Overview / readiness
- Members
- Roles
- Invitations
- Claims
- Import
- Privacy
- Feature controls
- Change/correction requests
- media/storage
- network lifecycle
- export/backup
- Launch Control
- settings
- vertical-specific admin modules injected through extension points

Family should no longer be the only vertical with a polished operational administration experience.

Keep vertical-specific admin functionality intact.

---

## XP-5 — Backup / Export / Recovery

Goal:

Make network data portable and trustworthy.

Provide user/admin exports where applicable:

- JSON full logical backup
- CSV/XLSX human-readable export
- vertical-aware datasets
- relationship references
- metadata/version
- export timestamp
- schema version

Define:

- what can be restored/reimported
- what is informational export only
- media export strategy
- network portability limitations

This is especially important before broad real-user onboarding.

---

## XP-6 — Invitation, Claiming & Correction Parity

Goal:

Normalize distributed network construction.

Across relevant verticals support:

- invite people
- invite by email
- resend
- revoke
- expiration
- claim existing profile
- detect claimed/unclaimed state
- prevent duplicate identity claims
- contribution suggestions where appropriate
- governed correction/change requests
- admin accept/reject
- audit/history

Reuse mature Family/FCA/HS behavior where possible.

Do NOT force identical semantics where vertical differences genuinely matter.

---

## XP-7 — Guide, What's New & Readiness Closure

Goal:

Finish platform productization.

Standardize:

### Contextual Guide

- role aware
- vertical aware
- task based
- understandable to first-time users

### What's New

- mission/release announcements
- visible product changes
- dismiss/read state

### Readiness / Network Health

Potential signals:

- profile completion
- invitations pending
- unclaimed profiles
- import issues
- missing structure
- privacy configuration
- incomplete admin setup
- stale unresolved work
- storage usage
- launch readiness

### Final cross-vertical regression matrix

Validate:

- Owner
- Admin/co-admin
- Member
- invited user
- claimed user
- anonymous/public
- archived network
- restored network
- hard-deleted network

Across all released verticals.

---

# Mission execution rules

For EVERY XP mission:

1. Inspect existing implementation first.
2. Reuse mature Family/shared engines.
3. Refactor only when architecture becomes cleaner.
4. Do not duplicate Family screens across verticals.
5. Preserve existing tenant isolation/RLS.
6. Preserve Launch Control guarantees.
7. Preserve existing vertical behavior.
8. Add automated contract/source validation.
9. Add runtime verification checklist.
10. Update living docs.

Follow:

IMPLEMENT
→ VALIDATE
→ GUIDE
→ PLAYGROUND where relevant
→ LAUNCH CONTROL where relevant
→ WHAT'S NEW
→ ROADMAP/STATUS
→ MISSION DOC
→ FREEZE CHECKPOINT

After each XP mission produce:

- full updated repository ZIP;
- affected-files-only ZIP;
- Markdown mission closure doc;
- runtime verification checklist;
- release manifest;
- updated CURRENT-STATE;
- updated ROADMAP;
- updated MISSION-STATUS;
- relevant guides;
- living product artifacts where appropriate.

Then use that exact checkpoint as the baseline for the next XP mission.

---

# Migration safety rules

All SQL changes must remain rerunnable.

Use:

- `CREATE ... IF NOT EXISTS`
- `DROP ... IF EXISTS` where signatures can change
- UPSERT for catalogs/configuration
- no destructive schema operations without explicit migration strategy
- preserve production data
- post-migration assertions
- recover safely after partial development attempts

Do not repeat the prior FCA migration failure where an existing function's OUT/RETURNS TABLE shape could not be replaced.

---

# Build/type discipline

Several earlier Housing Society issues came from shared contract drift:

- missing feature key
- incomplete intelligence vertical map
- missing CapabilityId
- missing Tab value

Therefore XP missions must add contract-exhaustiveness validation for registries/unions where possible.

Do not use `as any` merely to make the build green.

If dependencies are unavailable in the execution environment:

- still run source gates;
- targeted TypeScript checks;
- independent TS/TSX parse/transpile;
- SQL structural validation where possible;
- clearly mark full runtime/Next build as pending.

Never call something runtime-certified unless it actually ran.

---

# Product-readiness stance

The platform is currently:

**feature-rich and source validated, but not yet broadly production-certified.**

XP-0 through XP-3 are especially important before large-scale onboarding.

The target after XP should be:

**controlled real-user pilot readiness with repeatable onboarding, privacy understanding, safe lifecycle, portability, and consistent experience across verticals.**

Do not prematurely claim full production readiness.

---

# FIRST TASK IN THIS SESSION

Read:

1. the entire `CROSS-VERTICAL-FAMILY-PARITY-ROADMAP.md`;
2. the actual repository;
3. Family's lifecycle/onboarding/admin/import implementation;
4. current generic/productized vertical equivalents.

Then briefly report:

- XP-0 exact existing lifecycle behavior;
- database/storage deletion gaps;
- reusable Family/shared primitives;
- proposed XP-0 affected files/migration;
- regression risks.

Then **immediately implement XP-0**.

Do not ask me to reconfirm implementation unless there is a genuine safety/blocking ambiguity.

After XP-0 is packaged, continue with XP-1 sequentially when instructed.