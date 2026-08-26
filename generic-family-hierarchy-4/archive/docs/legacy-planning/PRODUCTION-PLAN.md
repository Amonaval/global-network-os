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

## 2026-08-23 — Product Proof Gates Added

Production readiness now includes product-behaviour proof, not only deployment/security proof.

### S1 proof gate
- anonymous Playground works without login/write attempts;
- fresh Join/Create reaches meaningful family value in < 60 seconds target;
- 360/390/430px critic-user paths have no overflow/dead end;
- 5+ observed first-session tests complete without founder coaching.

### S2 proof gate
- instrument invite → join → claim → contribution → share → return;
- measure family-level 7/30-day retention and contribution, not only raw users;
- verify notifications/sharing remain privacy-aware and non-noisy.

### S3 proof gate
- latest V1 certification passes on production-like environment;
- cohort metrics exist for 3→20→50 family progression;
- founder/admin support effort and cost per active family are measurable;
- cross-family privacy/RLS and 100–300-member performance are repeatable;
- willingness-to-pay evidence exists before full billing investment.
