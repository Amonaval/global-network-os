# Vercel + Supabase deployment — exact steps

## Architecture

```text
Users → Vercel (Next.js) → Supabase Cloud
                         ├─ Auth
                         ├─ PostgreSQL
                         ├─ RLS
                         └─ Storage
```

Vercel hosts the web application. Supabase is the shared backend. There is no special network connection or Docker requirement.

## 1. Deploy/import the project in Vercel

1. Open https://vercel.com/dashboard
2. Select the existing project or choose **Add New → Project**.
3. Import the Git repository containing this application.
4. Framework should be detected as Next.js.
5. Keep the default build command (`next build`) unless you have a project-specific reason to change it.

If the project is already deployed, keep it. You only need to add environment variables and redeploy.

## 2. Add Supabase environment variables

Open:

**Vercel → Project → Settings → Environment Variables**

Add:

```text
NEXT_PUBLIC_SUPABASE_URL
```

Value:

```text
https://YOUR_PROJECT.supabase.co
```

Add:

```text
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Value:

```text
YOUR_SUPABASE_PUBLIC_OR_ANON_KEY
```

For this application select the environments you use. Recommended initially:

- Production
- Preview
- Development

Do not expose a service-role key through `NEXT_PUBLIC_`.

## 3. Redeploy

Environment variables are applied to a deployment build. After saving them:

- go to **Deployments**
- choose the latest deployment
- click **Redeploy**

or push a new commit if Git integration is enabled.

## 4. Configure Supabase Auth URLs

In Supabase:

**Authentication → URL Configuration**

Set Site URL to the Vercel production URL:

```text
https://your-project.vercel.app
```

Add redirect URL:

```text
https://your-project.vercel.app/**
```

Keep:

```text
http://localhost:3000/**
```

if you still test locally.

## 5. Test production

Open the Vercel URL in an incognito/private browser window.

Expected flow for a fresh Supabase project:

1. Signup/Create account.
2. The first account becomes admin.
3. Setup screen appears.
4. Enter the network name.
5. Choose Start Empty, Demo, or Import.
6. Application loads the shared data.
7. Open a second browser and sign in as another member.
8. Verify both browsers see the same hierarchy.

## 6. Recommended production rollout

Do not put the real 450–500 records into the first production test.

Use this sequence:

```text
Supabase project
   ↓
migrations 001–004
   ↓
Admin account
   ↓
Empty network OR 150-member demo
   ↓
Vercel deployment
   ↓
Test with 2–3 users
   ↓
Validate import/relationships/privacy
   ↓
Backup/export
   ↓
Import real hierarchy
```

## 7. Environment separation later

Once the application is stable, create two Supabase projects:

```text
hierarchy-network-dev  → testing/demo
hierarchy-network-prod → real 450–500 member data
```

The Vercel Production environment points to prod; Preview deployments can point to dev/staging.

## 8. Troubleshooting

### Login works but data is empty
Check that migrations 001–004 ran and that the setup screen was completed.

### `invalid input syntax for type uuid`
The importer should map non-UUID source IDs. Update to this P3 build and re-import. Do not convert PostgreSQL UUID columns to text.

### `permission denied` / RLS error
Confirm the logged-in account is an admin when performing an admin action. For an older database, promote the intended user in `public.profiles`.

### Redirect/callback error
Check Supabase Authentication → URL Configuration and add the exact Vercel URL and `/**` redirect pattern.

### Vercel still behaves like the old local app
Confirm both environment variables exist for the environment you deployed, then redeploy.
