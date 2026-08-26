# Production deployment — Vercel + Supabase

## 1. Create Supabase project
Create a project at https://supabase.com/ and open SQL Editor.

Run migrations in this order:
1. `supabase/migrations/001_initial.sql`
2. `supabase/migrations/002_p1.sql`
3. `supabase/migrations/003_production_auth.sql`

For a staging/demo database, optionally run `supabase/seed-demo.sql` after the migrations.

## 2. Create first admin
1. Run the application and create an account, OR create a user in Supabase Authentication.
2. Find that user's UUID in Authentication -> Users.
3. Run:

```sql
update public.profiles set role='admin' where id='YOUR_AUTH_USER_UUID';
```

Do not put a service-role key in the browser or Vercel `NEXT_PUBLIC_*` variables.

## 3. Local environment
Copy `.env.example` to `.env.local` and fill in:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Then:

```bash
npm install
npm run build
npm run dev
```

## 4. Vercel
Import the GitHub repository into Vercel. Add the same two environment variables for Production, Preview and Development. Deploy.

## 5. Supabase Auth URLs
In Supabase Authentication -> URL Configuration, set the Site URL to your Vercel URL, for example:

`https://xyz-hierarchy-network.vercel.app`

Add the Vercel URL to Redirect URLs if your chosen email/auth flow requires it.

## 6. Architecture
Browser -> Vercel/Next.js -> Supabase Auth + Postgres + RLS.
Photos can later move to Supabase Storage. The service-role key is never used client-side.

## 7. Current production scope
Implemented: shared members, relationships, authentication, member/admin roles, RLS baseline, profile submissions, admin approval, relationship management, import/export, map, lineage focus, in-memoriam.

Still recommended before opening the system broadly: audit history, duplicate detection/merge, invitation-only onboarding, photo storage policies, admin activity log, automated backups and custom domain.
