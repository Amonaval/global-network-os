# Production transition plan

## P0 — Shareable demo
- Vercel deployment
- 150-member sample hierarchy
- tree, lineage focus, directory, map, profile drawer
- CSV/XLSX import/export
- profile submission demo

## P1 — Real community backend
- Supabase database
- Auth and invitations
- RLS roles
- shared member data
- relationship CRUD
- submission approval workflow
- photo storage

## P2 — Data quality and governance
- duplicate detection
- relationship validation
- orphan detection
- merge profiles
- audit history
- admin activity log
- restore/rollback

## P3 — Community product
- member self-service profile
- notifications
- achievement/events posts
- announcements
- location/city groups
- mentor/opportunity modules

## P4 — Advanced
- analytics
- SVG/PDF tree export
- advanced genealogy views
- smart photo processing
- mobile app/PWA enhancements

## P2 implemented in this build
- Supabase Auth (email/password)
- Shared Postgres hierarchy when `NEXT_PUBLIC_SUPABASE_*` variables are configured
- Member/admin role model via `profiles.role`
- RLS policies for hierarchy, relationships and submissions
- Admin bulk import/export
- Admin relationship maintenance
- Profile submission approval/rejection
- Local demo fallback remains available when Supabase is not configured
- Demo seed SQL for 150-member staging dataset

## Before opening to the whole community
- Enable email confirmation / chosen auth provider
- Create one or more admin accounts and verify admin RLS
- Replace demo records with real records after validating backups
- Configure Supabase Storage for photos
- Add audit log and duplicate/relationship validation
- Configure daily backups / retention
- Add custom domain and privacy/consent text
