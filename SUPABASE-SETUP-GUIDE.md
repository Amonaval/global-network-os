# Supabase setup — step by step (cloud only, no Docker/Podman)

This guide uses **Supabase Cloud**. You do not need Docker, Podman, a local PostgreSQL server, or the Supabase CLI.

## 1. What Supabase does

Vercel hosts the Next.js application. Supabase provides the shared backend:

```text
Browser → Vercel/Next.js → Supabase Auth
                         → Supabase PostgreSQL
                         → Supabase Storage (future/current photo URLs)
                         → Row Level Security (RLS)
```

The database is the canonical shared hierarchy. Browser localStorage is only the fallback when Supabase is not configured.

## 2. Create the cloud project

1. Open https://supabase.com/
2. Sign in.
3. Click **New project**.
4. Choose/create an organization.
5. Name the project, for example `hierarchy-network`.
6. Choose a region close to the main users.
7. Set and save the database password.
8. Wait until the project is ready.

## 3. Run migrations — no CLI required

Open **SQL Editor → New query**.

From this project copy and run the files in exactly this order:

1. `supabase/migrations/001_initial.sql`
2. `supabase/migrations/002_p1.sql`
3. `supabase/migrations/003_production_auth.sql`
4. `supabase/migrations/004_network_setup_and_governance.sql`
5. `supabase/migrations/005_p4_1_governance_integrity.sql`

Run each file as a separate SQL query. Do not run them out of order.

Afterward, Table Editor should contain the main application tables including:

- `family_members`
- `family_relationships`
- `profile_submissions`
- `profiles`
- `network_settings`
- `audit_log`

## 4. Why migrations exist

A migration is simply a versioned SQL file describing the database structure and security policies. Supabase executes the SQL in its cloud PostgreSQL database.

For this project, the migration sequence builds the database in layers:

- 001 — core members, relationships, submissions and baseline RLS
- 002 — P1 location/deceased fields/indexes
- 003 — authentication, member/admin roles and admin policies
- 004 — network setup, audit trail and first-user admin bootstrap
- 005 — P4.1 privacy, relationship integrity, change requests, audit RPCs and capability foundation

## 5. Create the first account

Use the application signup screen after the app is configured, or create a user in **Authentication → Users**.

On a **fresh** database, migration 004 makes the first registered user an `admin` automatically. Later users are `member` users.

If you are upgrading an older database that already has users, the automatic first-user rule does not retroactively promote anyone. In that case, use SQL Editor once:

```sql
update public.profiles
set role = 'admin'
where id = 'YOUR_AUTH_USER_UUID';
```

## 6. Get application keys

In Supabase open **Project Settings → API**.

Copy:

- Project URL
- Publishable/anon public key

The browser application uses these as:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_KEY
```

Never put a Supabase service-role key in a `NEXT_PUBLIC_` variable.

## 7. Supabase Auth URLs

Open **Authentication → URL Configuration**.

For production add your Vercel URL as the Site URL, for example:

```text
https://your-project.vercel.app
```

Add redirect URLs for both production and local development as needed:

```text
https://your-project.vercel.app/**
http://localhost:3000/**
```

If you later use a custom domain, add:

```text
https://your-domain.example/**
```

## 8. Seed data — optional

Do **not** run `seed-demo.sql` unless you intentionally want demo data in that Supabase project.

For a real community production project, the recommended flow is:

1. Run migrations.
2. Create your admin account.
3. Sign in.
4. Enter the real network name.
5. Choose **Start Empty** or **Import**.

For a test/staging project, you can use the application's **Load 150-member Demo** option.

## 9. Why Docker/Podman is unnecessary

`npx supabase init` and `supabase start` are local-development tooling. Local Supabase services commonly use Docker/Podman.

This project does not require a local Supabase server. The SQL Editor talks directly to Supabase Cloud.

If you see:

```text
failed to create config file: open supabase\\config.toml: The file exists
```

that means your project already has a Supabase CLI config file. You can ignore it for this cloud-only workflow. Do not use `--force` just to follow this guide.

## 10. RLS in plain English

RLS is database-level permission control. Hiding an Edit button in React is not security. RLS prevents unauthorized browser requests from changing protected rows.

The application uses:

- authenticated users — read approved hierarchy and create their own submissions
- admins — manage members, relationships, submissions and network setup

## 11. UUID handling

PostgreSQL IDs are UUIDs. Your source file does not have to use UUIDs.

For example:

```csv
id,full_name,father_id,spouse_id
s1787065934735,Amit,s1787065934701,s1787065934720
```

The importer treats `s1787065934735` as an external/source ID and generates a real UUID for Amit. It also resolves `father_id` and `spouse_id` using the source-ID mapping.

This prevents errors such as:

```text
invalid input syntax for type uuid: "s1787065934735"
```

Do not change the database UUID columns to text to work around this error.

## V1 account-recovery check

Password recovery now returns the user to the application and opens a dedicated new-password experience. Ensure every environment that may receive an auth email is present under **Authentication → URL Configuration → Redirect URLs**.

At minimum for normal development + production:

```text
http://localhost:3000/**
https://your-project.vercel.app/**
```

Also add your custom domain before enabling it for family users. Test both signup-confirmation links and forgot-password links after changing auth URL configuration.

Launch Control is not controlled by an environment email variable. It uses the protected `platform_owners` table. After migration 028, an existing platform owner can add another existing account by email from **Platform → Launch Control → Who can control launches**.

## Migration 029 — platform approval for new families

Before the pre-alpha family rollout, apply `029_pre_alpha_mobile_and_family_creation_approval.sql` after migration 028.

After 029, ordinary authenticated users **cannot directly create a family tenant**. They submit a family request from onboarding. A platform owner opens **Launch Control → Family creation approvals** and approves or rejects it. Approval creates the family and assigns the requester the Family `owner` role. Platform owners may still create a family directly.

Validate with two separate accounts: one ordinary user and one platform owner. Also confirm a non-platform account receives a permission error if it attempts to call `create_family(...)` directly.

## Migration 031 — CR2 Alpha onboarding
Run `031_cr2_frictionless_alpha_onboarding.sql` after migration 030.

Important: migration 031 intentionally sets **Family creation approval = OFF** for the current trusted Alpha so new signed-in testers can create/import a family without waiting for the Platform Owner.

To change it later:
1. Sign in as a Platform Owner.
2. Open **Launch Control**.
3. Find **Family creation**.
4. Turn **Approval required** ON.

Migration 031 also adds:
- Family Codes for quick trusted-member joining;
- regeneration of Family Codes;
- verified-email profile matching/claiming;
- tenant-safe join RPCs.

Do not use Family Codes as public links. They are intended for trusted/private Alpha sharing (for example a family WhatsApp group). Regenerate the code if it is shared outside the intended audience.

## Migration 032 — CR2.1 onboarding hotfix
Run `032_cr2_1_shared_setup_and_demo_uuid_hotfix.sql` after migration 031.

This migration adds the secure `save_network_settings(...)` RPC. It fixes the Alpha family-creation flow where the family was created successfully but the subsequent direct client upsert into `network_settings` was rejected by RLS.

### Migration 033 — CR2.2 fresh-family context fix

Run `033_cr2_2_explicit_family_context_and_progressive_onboarding.sql` after migration 032.

It fixes the case where a newly-created family exists but the immediate settings save reports `No active family selected`. The client now sends the new family UUID explicitly and the RPC authorizes against that family membership directly.

## S1-C migration 035 — required for profile approvals

After deploying this batch, apply `supabase/migrations/035_s1c_profile_submission_review.sql` to the same Supabase project used by the app.

This migration intentionally **does not** grant direct UPDATE on `profile_submissions`. It adds the governed `review_profile_submission(...)` RPC used by Family Owner/co-admin approval, adds optional member gender context for human relationship wording, and adds the secure `add_myself_to_family(...)` bootstrap.

If the UI is deployed before migration 035, profile approval/Add Myself can fail because the required RPC does not yet exist.

## Migration 044 — G1.3 feature catalog integrity

For the G1.3 codebase, apply migrations sequentially through:

1. `043_s3a1_distributed_family_intake.sql`
2. `044_g1_3_feature_catalog_integrity.sql`

Migration 044 intentionally checks that the S3-A1 backend exists before repairing the `contribute.branch_intake` registry row. This prevents a dangerous state where Launch Control exposes **Build family together** but its actual intake RPC/tables were never installed.

Migration 044 is idempotent and uses `ON CONFLICT DO NOTHING`; it repairs only missing feature/Playground registry rows and does **not** overwrite existing Platform Owner rollout or Playground choices.

If Launch Control shows **Database update required** beside a feature, the frontend is ahead of Supabase. Apply pending migrations rather than repeatedly toggling the control. This is the guarded replacement for the previous `Unknown feature key` failure.

## G5 Alumni Network V1
After migration 044, run:

`045_g5_alumni_network_v1.sql`

It adds persisted vertical identity and separate Alumni tables/RPCs. Existing networks are backfilled to `family`; no Family data needs to be re-imported. After applying it, deploy the matching G5 frontend so `get_my_networks()` and the new Alumni RPCs stay in sync.
