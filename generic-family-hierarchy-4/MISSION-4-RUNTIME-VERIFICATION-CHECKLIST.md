# Mission 4 — Runtime Verification Checklist

## Build / regression
- [ ] `npm ci` completes from the committed lockfile.
- [ ] `npm run validate:m4` passes.
- [ ] `npm run build` passes.
- [ ] Open Family, Alumni, Organization, Business Trust, Franchise and Professional Playground/home surfaces and confirm STABILITY-1/NX presentation is unchanged.

## Authentication / security
- [ ] Call an `/api/v1` command while signed out and confirm HTTP 401 with a normalized error body.
- [ ] Confirm browser network requests send only the signed-in access token; no service-role secret is present in browser bundles/network calls.
- [ ] Attempt a command outside the user's permitted network/role and confirm existing Supabase RPC/RLS policy rejects it.

## Five command proofs
- [ ] Create a Family network through existing Setup UI; confirm it succeeds through `POST /api/v1/networks/create`.
- [ ] Create one productized network; confirm the same versioned create route is used.
- [ ] Join a Family or productized network by code through existing UI; confirm `POST /api/v1/networks/join`.
- [ ] Add one productized graph relationship; confirm `POST /api/v1/graph/relationships` and the relationship appears after refresh.
- [ ] Import a small institutional seed (2–5 entities); confirm `POST /api/v1/institutional/bootstrap` and inserted/updated/skipped counts are correct.
- [ ] Claim one eligible Family, Alumni or productized identity; confirm `POST /api/v1/identities/claim` and membership/profile linkage behaves exactly as before.

## Observability
- [ ] Inspect server logs for each command and confirm request ID, actor ID, command, outcome and duration are present.
- [ ] For active-network commands, confirm network ID is captured without trusting a client-supplied network ID.
- [ ] Trigger one safe validation failure and confirm logs/client response contain sanitized metadata rather than secrets or raw credentials.

## Direct-query preservation
- [ ] Browse directory/tree/home/read-only surfaces and confirm existing direct RLS-backed Supabase reads continue to work without `/api/v1` migration.

## Closure decision
- [ ] If all checks pass, mark Mission 4 runtime certified.
- [ ] If a command fails, fix the contained service/route/facade seam; do not broadly rewrite existing vertical UI or Supabase data access.
