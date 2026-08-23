# CR2 — Frictionless Family Entry & Alpha Exploration

Status: **IMPLEMENTED IN SOURCE / ALPHA VERIFY**

## Why this mission exists
CR1 made the family experience simpler after entry, but a new Supabase user without an active family could still be pushed toward family creation and approval. That is unacceptable for Alpha exploration: a relative should be able to understand the product within minutes without founder assistance.

## Implemented

### 1. No-family landing
A signed-in user with no active family now gets three explicit choices:
- **Join my family**
- **Explore a sample family**
- **Create my family**

Creation is no longer the default assumption.

### 2. Alpha auto-approval switch
Migration `031_cr2_frictionless_alpha_onboarding.sql` creates a platform setting for family creation approval.

For this Alpha migration, **approval is deliberately switched OFF by default** so signed-in users can create a family immediately. Launch Control can turn approval back ON without a deployment.

When OFF:
- user creates/imports a family immediately;
- the user becomes Family Owner;
- Supabase persistence remains active.

When ON:
- the existing platform-owner request/review model remains in force.

### 3. Family Code join
Family admins can generate/share a short Family Code from Invite Family.
- code gives an authenticated user normal family membership for exploration;
- code does **not** claim another person's profile;
- admin can regenerate the code, immediately invalidating the old one.

This is intended for trusted WhatsApp/family-group Alpha distribution.

### 4. Verified-email profile discovery
When the signed-in user's Supabase email is confirmed and matches an approved, unclaimed family member profile, onboarding can show:
- family name;
- member name;
- **This is me**.

The claim is enforced in the database against the verified auth email. A different user cannot claim the profile simply by knowing the email text.

### 5. Read-only Sample Family
A signed-in user can enter Sample Family without creating a real family.
- Supabase auth remains active;
- sample data is loaded client-side;
- the experience is labelled **Sample family · read-only**;
- a persistent **Join or create mine** action returns to onboarding.

### 6. Family creation choices
Create Family now clearly surfaces:
- **Upload guided Excel** — recommended for an existing family list;
- **Start with a few relatives** — immediate small-family start.

The existing Excel assistant still provides template → upload → preview → validation → import.

### 7. Quick invitation surface
Invite Family now leads with:
- Family Code / copy / share;
- regenerate code;
- personal profile invitation underneath for exact profile claiming.

### 8. In-product quick-start help
Family Help now explains the normal user journey:
1. Home;
2. Personal lineage / Full Tree;
3. Me/profile;
4. invitation / Family Code / verified-email join;
5. family creation + Excel;
6. Sample Family.

## Security boundaries intentionally retained
- Family Code does not claim a member profile.
- Personal profile claims still require invitation or verified-email proof.
- Family data is still protected by authenticated family membership/RLS.
- Supabase is not bypassed or removed.
- Public family search is not introduced.

## Verification gate before declaring CR2 complete
Must be tested against live Supabase with migration 031:
- brand-new confirmed user → Sample Family without founder help;
- brand-new user → Family Code → family opens;
- matching verified email → profile claim succeeds;
- mismatching email → profile claim fails;
- auto-approval OFF (approval not required) → create empty family immediately;
- auto-approval OFF → Excel family creation/import immediately;
- founder turns approval ON → new creator receives pending-approval journey;
- family admin shares/regenerates Family Code and old code stops working;
- demo cannot edit live family data;
- phone widths 360/390/430px.

Do not mark CR2 VERIFIED until these live checks pass.

## CR2.1 — Alpha onboarding hotfix (2026-08-23)

Status: **IMPLEMENTED IN SOURCE / VERIFY**

Real Alpha testing exposed two blockers and one onboarding improvement:

1. **Demo/local profile IDs were leaking into UUID-only Supabase RPCs.** A sample member such as `m41` could open normally but selecting the profile attempted `get_member_life_events(uuid)` with `m41`, causing PostgreSQL `invalid input syntax for type uuid`. Demo preview now avoids per-member shared RPCs, and remote member-scoped reads defensively ignore non-UUID IDs.
2. **Starting a family could fail after creation with `new row violates row-level security policy for table network_settings`.** `create_family()` already creates the tenant and initial settings securely; the client then performed a direct `network_settings.upsert`. CR2.1 replaces that direct write with the tenant-scoped `save_network_settings` security-definer RPC in migration 032.
3. **Excel exploration now offers two sample sizes.** The guided template remains available, plus a small Naval-family workbook for quick tests and the existing 150-person workbook as the full/default scale example. Imported source IDs such as `P001` or `m41` are converted to UUIDs before shared persistence while relationship references are remapped consistently.

### Verification still required

- Run migrations through `032_cr2_1_shared_setup_and_demo_uuid_hotfix.sql`.
- Fresh signed-in user → Start with a few relatives → family should be created without an RLS error.
- Explore Sample → open several profiles including non-UUID demo IDs → no UUID database error.
- Download/import the small Naval workbook and the full 150-person workbook.
- Confirm imported shared-mode members receive UUID IDs and relationships still point to the correct remapped members.
