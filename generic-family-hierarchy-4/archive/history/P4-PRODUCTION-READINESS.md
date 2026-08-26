# P4 Production Readiness Audit

**Baseline:** `xyz-hierarchy-network-p4-4-final-fixed.zip`  
**Audit date:** 2026-08-20  
**Audit scope:** full source tree, migrations 001–009, application/repository code, storage/auth flows, implementation notes, deterministic demo validation, and available local build checks.

## 1. Executive summary

### Status: NOT READY

The P4.4 source is a substantial and coherent implementation, but it should **not be treated as production-ready yet**.

The audit found several production-impacting issues:

1. **Private profile visibility was incomplete at the RPC boundary.** A member marked `profile_visibility='admin'` could still have identifying fields returned by the original `get_visible_family_members()` RPC.
2. **Life-event and memory RPCs were vulnerable to IDOR-style reads.** A caller could supply another member's UUID and retrieve non-admin content even when that member's profile was hidden.
3. **Invitation acceptance could re-link an already-linked account to a different member.**
4. **Profile submission RPCs did not enforce ownership of the target member.** The workflow required admin approval, but the database boundary still allowed arbitrary target-member submissions.
5. **Audit logging was forgeable by any authenticated member through the generic audit RPC.**
6. **Profile/community Storage buckets are public.** This defeats the intended database-level privacy model for photos and means an object URL can be accessed independently of the profile visibility decision.
7. **P4.4 scale is only partially implemented.** Server-side search exists, but the UI does not implement real pagination and the main application still hydrates the complete approved hierarchy.
8. **The TypeScript configuration targets ES5 while the code uses Map/Set iteration.** This creates compiler errors in the available source-only check.
9. **The repository abstraction is present and is used for most data access, but local/demo persistence intentionally remains a second behavior path.**
10. **The actual production build could not be completed because dependency installation exceeded the available execution window.** Therefore runtime/build status remains unverified.

A hardening migration, `010_p4_production_hardening.sql`, was added during this pass to address the database-side findings above, and the client TypeScript target plus a directory filtering dependency bug were corrected in the working audit copy. These changes still require execution against a staging Supabase database and a successful production build/E2E run before the system can be marked READY.

---

## 2. Database audit

### Actual core schema

The migration chain creates and evolves:

- `family_members`
- `family_relationships`
- `profile_submissions`
- `profiles`
- `network_settings`
- `audit_log`
- `change_requests`
- `network_role_capabilities`
- `member_invitations`
- `member_life_events`
- `memories`
- `notifications`
- Supabase Storage buckets for profile/community media

### Schema correctness

The source was checked for the previously reported `family_members.gender` problem.

**Result:** no P4 migration currently references `family_members.gender`.

The TypeScript domain type still contains an optional `gender` field, but the actual SQL schema does not. This is a domain-model drift issue and should not be resolved by adding a speculative database column.

### Relationship integrity

P4.1 adds:

- self-link check
- canonical spouse uniqueness
- generation ordering for parent/child links
- trigger-based validation
- recursive parent/child cycle detection

The deterministic 150-member demo was validated directly:

- 150 members
- 180 relationships
- generations 1–6
- 33 spouse relationships
- 147 parent relationships
- 6 deceased records

`validate-demo.mjs` reports **VALIDATION PASSED**.

### Migration dependency diagram

```text
001 Initial
 ├─ family_members
 ├─ family_relationships
 ├─ profile_submissions
 └─ baseline RLS
       │
002 P1
 └─ latitude / longitude
       │
003 Production Auth
 ├─ profiles
 ├─ roles
 └─ auth trigger
       │
004 Network + Governance
 ├─ network_settings
 └─ audit_log
       │
005 P4.1 Trust / Governance
 ├─ relationship integrity
 ├─ privacy RPC
 ├─ change_requests
 ├─ audit RPC
 └─ capability foundation
       │
006 P4.1 Adoption
 ├─ profile photo storage
 └─ member invitations
       │
007 P4.2
 ├─ profile visibility
 └─ life-event timeline
       │
008 P4.3
 ├─ memories
 ├─ community media
 ├─ notifications
 └─ review/invitation notifications
       │
009 P4.4
 ├─ server-side discovery
 ├─ analytics
 └─ geography
       │
010 Production Hardening
 ├─ visibility/IDOR fixes
 ├─ invitation reassignment protection
 ├─ submission ownership
 ├─ audit RPC restriction
 └─ race-safe first-admin bootstrap
```

### Migration compatibility

The previously known function-return-type problems were specifically addressed:

- `get_visible_family_members()` is explicitly dropped before its P4.2 return shape changes.
- `review_change_request(uuid,varchar,text)` is explicitly dropped before P4.3 changes its return type from `public.change_requests` to `uuid`.
- `search_family_members(...)` is explicitly dropped before P4.4 defines its return table.

This is the correct PostgreSQL pattern for those signature changes.

### Remaining migration risk

The migration chain is logically ordered, but it has not been executed against a real PostgreSQL/Supabase staging database in this environment.

**Status: NOT VERIFIED LIVE.**

---

## 3. RLS / security audit

### Security matrix — intended/current model

| Table / resource | Anonymous | Normal member | Admin | Main boundary |
|---|---|---|---|---|
| `family_members` | Denied | Approved/visible projection | Full approved + admin data | RLS + RPC |
| `family_relationships` | Denied | Read | Full CRUD | RLS |
| `profile_submissions` | Denied | Create own via RPC / read own | Full management | RPC + RLS |
| `profiles` | Denied | Own profile | Read/manage roles | RLS |
| `network_settings` | Denied | Read | Full management | RLS |
| `audit_log` | Denied | Read denied | Read | RLS + definer writes |
| `change_requests` | Denied | Own requests | Full review/read | RLS + RPC |
| `member_invitations` | Denied | No direct table access | RPC-based creation | RLS + RPC |
| `member_life_events` | Denied | Visible events; own write | Full | RPC |
| `memories` | Denied | Visible memories; own write | Full | RPC |
| `notifications` | Denied | Own only | Admin/system creation | RPC |
| `profile-photos` Storage | Public object read in current source | Upload/update/delete own path | Same plus admin deletion where applicable | Storage policy |
| `community-media` Storage | Public object read in current source | Upload own path | Delete/admin | Storage policy |

### Critical security findings

#### 3.1 Profile visibility was incomplete

The original P4.2 `get_visible_family_members()` redacted city/country/photo/bio/contact fields but still returned:

- name
- date of birth
- date of death
- generation
- profession

for `profile_visibility='admin'`.

That contradicts the stated "Admins only" profile model.

**Hardening:** the new projection filters admin-only profiles for normal members and nulls all protected fields.

#### 3.2 Life-event IDOR

The original `get_member_life_events(member_id)` only checked event visibility.

A normal authenticated user who knew another member UUID could call the RPC directly and retrieve non-admin timeline data even if the member profile itself was hidden.

**Hardening:** the new function checks the target member's approved/profile visibility before returning events.

#### 3.3 Memory IDOR

The original `get_memories(member_id)` did not validate the target member's profile visibility.

**Hardening:** the new function applies member visibility checks to attached memories.

#### 3.4 Invitation account reassignment

The original invitation acceptance function verified that the target family member was not already claimed, but did not prevent a currently-linked user account from being linked to a different member.

**Hardening:** an already-linked account may only accept an invitation for its existing member, or remain unlinked.

#### 3.5 Profile-submission target ownership

The original `submit_profile_change()` allowed an authenticated caller to submit a change against an arbitrary `member_id`.

The admin approval step reduced direct data corruption risk, but the database boundary was still too permissive.

**Hardening:** non-admin callers may submit changes only for their own linked member.

#### 3.6 Audit RPC forgery

The original `log_audit_event()` allowed any authenticated user to create arbitrary audit entries.

**Hardening:** the generic audit RPC is now admin-only; security-sensitive flows continue to write audit records from their own definer functions.

#### 3.7 First-admin bootstrap race

The first-user trigger used an existence check without transaction serialization.

Two concurrent signups could theoretically both observe an empty `profiles` table.

**Hardening:** the trigger now uses a transaction advisory lock around the first-user evaluation.

---

## 4. Storage privacy

### Status: BLOCKER REMAINS

The current source creates both:

- `profile-photos`
- `community-media`

as **public buckets** and uses `getPublicUrl()`.

That is incompatible with a strong interpretation of the project's privacy model.

Examples:

- An admin-only profile photo can become a public object URL.
- Community media marked admin-only still lives in a public bucket.
- Database RLS cannot revoke access to an already-public Storage object URL.

The upload policies correctly restrict who can write/delete objects, but **write security is not read privacy**.

### Required production fix

Before public rollout, move privacy-sensitive media to private buckets and use controlled signed URLs / access checks.

The implementation should distinguish at least:

- profile-visible media
- member-visible media
- admin-only media

and generate access-controlled URLs rather than public URLs.

This should be treated as a **P0 production blocker**.

---

## 5. Build/runtime audit

### Dependency installation

Attempted:

```bash
npm install --no-audit --no-fund
```

The installation exceeded the available execution window.

### TypeScript source check

A direct `tsc --noEmit` was attempted without installed project dependencies.

The result is not a valid full application typecheck because React/Next/Supabase packages are absent, but it exposed a real configuration problem:

```text
TS2802: Type 'MapIterator<...>' can only be iterated through when using '--downlevelIteration' or an ES2015+ target.
```

The source had:

```json
"target": "es5"
```

while using Map/Set iteration extensively.

**Fix applied in audit copy:** TypeScript target changed to `es2017`.

A full Next.js build remains **UNVERIFIED** until dependencies can be installed.

### Lint

`npm run lint` could not be meaningfully executed without dependencies.

**Status: UNVERIFIED.**

---

## 6. P3 regression audit

| Capability | Status |
|---|---|
| Interactive hierarchy tree | Implemented; scale-limited |
| Search | Implemented |
| Directory | Implemented |
| Directory filters | Implemented; original memo dependency bug fixed in audit copy |
| Profile drawer | Implemented |
| Profile editing | Implemented through submission/approval |
| Lineage focus | Implemented |
| Relationship visualization | Implemented |
| Relationship intelligence | Implemented |
| Map | Implemented |
| Manual member creation | Implemented through profile submission/admin approval |
| Bulk import | Implemented |
| CSV export | Implemented |
| JSON export | Implemented |
| SVG export | Implemented |
| Browser PDF | Implemented via print |
| Authentication | Implemented |
| Admin role | Implemented |
| Profile submissions | Implemented |
| Invitations | Implemented |
| Photo upload | Implemented, but privacy model is not production-safe |
| Local/demo fallback | Implemented |
| Audit/governance | Implemented, with hardening required/applied |
| Notifications | Implemented |

---

## 7. P4 E2E audit

### Journey 1 — Admin creates member

**Partially verified from source.**

Flow exists through profile submission → approval → member upsert → refresh.

The generated new member currently defaults to `generation_level: 5`, which is a product/data-quality limitation. It should eventually be explicitly selected or inferred rather than silently assigning generation 5.

### Journey 2 — Invitation

**Implemented, but live E2E unverified.**

Flow exists:

Admin → invitation RPC → token URL → authentication → claim → linked profile.

Hardening adds protection against re-linking an already-associated account.

Email-confirmation environments require the user to reopen the invitation after confirmation.

### Journey 3 — Photo

**Partially working / production blocker.**

Upload path works, but public Storage URLs bypass intended privacy boundaries.

### Journey 4 — Relationship intelligence

**Implemented.**

Shortest-path BFS, common ancestors/descendants and basic kinship explanation exist.

Large-graph performance is not yet suitable for 10k+ members.

### Journey 5 — Memory

**Implemented with privacy blocker.**

Create/read/delete flows exist, but Storage media is public and the original read RPC had an IDOR issue. Database hardening addresses the latter.

### Journey 6 — Change request

**Partially implemented.**

Profile submissions create generalized change requests and review notifications.

However, the generalized change-request engine does not itself apply arbitrary approved payloads. The application currently contains special-case profile approval logic.

Therefore this is a **governance foundation**, not yet a complete generic workflow engine.

### Journey 7 — Search

**Partially implemented.**

Server-side RPC exists and is repository-integrated.

However:

- UI requests up to 200 rows.
- No next-page control exists.
- No total-count result exists.
- Main app still hydrates the full member set.
- Search is therefore not yet a complete large-network discovery architecture.

### Journey 8 — Export

**Implemented for the current hydrated dataset.**

CSV, JSON, SVG and browser print/PDF paths exist.

For very large networks, export is not yet server-side/streaming.

---

## 8. Performance / scale audit

### Current architecture

The application still performs:

```text
Supabase
   ↓
get_visible_family_members()
   ↓
hydrate complete member list
   ↓
React state
   ↓
Tree / Directory / Map / Relationship calculations
```

The P4.4 search RPC is a useful boundary, but the primary application model is still full-network hydration.

### Approximate architectural behavior

| Network size | Assessment |
|---:|---|
| 100 | Comfortable |
| 500 | Reasonable |
| 1,000 | Watch tree/map/rendering and memory |
| 5,000 | Architectural pressure becomes significant |
| 10,000+ | Current full-hydration/tree model should not be used |

### Main bottlenecks

1. Full member hydration.
2. React Flow rendering of the full hierarchy.
3. Relationship calculations repeatedly scanning the entire relationship array.
4. `ancestorDepths()` and descendant traversal repeatedly scanning relationships.
5. Map keeps member arrays client-side.
6. Export serializes the complete hydrated dataset in the browser.
7. Directory filter values are derived from the entire loaded dataset.
8. Search has server-side filtering but no complete pagination UX.

### Recommendation

Do **not** rewrite the entire graph system yet.

The correct P5 direction is:

```text
Full-network mode
      ↓
focused graph/window mode
      ↓
server-backed neighborhood expansion
      ↓
progressive graph loading
```

That is a natural architectural evolution from the existing repository boundary.

---

## 9. Supabase deployment audit

### Correct

- Browser uses `NEXT_PUBLIC_SUPABASE_URL`.
- Browser uses public/anon key.
- No service-role key exists in source.
- Database is intended to be canonical in shared mode.
- RLS is enabled on the main protected tables.
- Definer RPCs specify `search_path`.
- Invitation tokens are stored as SHA-256 hashes.

### Needs verification

- All migrations on a real staging project.
- Storage policies.
- Private-bucket conversion.
- Auth redirect configuration.
- Email confirmation behavior.
- Backup/restore.
- Production database indexes.
- Existing P3 data migration.
- Actual RPC execution under member/admin roles.

---

## 10. Vercel deployment audit

The project is structurally a standard Next.js application.

`vercel.json` contains no custom deployment behavior.

Expected build:

```text
next build
```

Environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

No server-side secret is required by the current source.

### Remaining verification

- Production build
- Preview build
- Production environment variables
- Auth redirects
- Runtime behavior against production Supabase
- Static asset behavior
- Leaflet client-side behavior
- Browser hydration

These remain **UNVERIFIED** until a dependency-complete build/deployment test is performed.

---

## 11. Critical issues

### P0 — Private Storage is publicly readable

**Impact:** privacy boundary can be bypassed through Storage URLs.

**Required:** private buckets + controlled signed URL/access policy.

### P0 — Live migration execution is unverified

The migration chain is statically coherent, but it has not been executed against a staging Supabase database in this environment.

### P0 — Production build is unverified

Dependency installation timed out, so a successful `next build` has not been established.

### P0 — Full-network hydration undermines P4.4 scale claims

The application is not yet ready for 5k–10k+ members merely because the search RPC is server-side.

---

## 12. Medium issues

1. P4.4 search UI does not implement actual pagination.
2. Export is browser-side and based on the currently hydrated dataset.
3. Generic change requests are not a complete generic apply engine.
4. New member creation silently defaults generation to 5.
5. `gender` exists in TypeScript but not in the database schema.
6. Relationship intelligence repeatedly scans relationship arrays and will degrade on large networks.
7. Documentation is stale/inconsistent:
   - `DEPLOY.md` stops at early migrations.
   - `SUPABASE-SETUP-GUIDE.md` stops at migration 005.
   - some deployment text still describes Storage as future.
8. PWA manifest exists, but the application is not yet a complete offline-first PWA.

---

## 13. Deferred issues

These should not block P4 production after the P0 items are fixed:

- graph windowing
- large-network progressive loading
- richer family branches
- private circles
- advanced event/reminder system
- documents
- AI-assisted family knowledge
- semantic/natural-language search
- richer historical timelines
- offline synchronization
- advanced geographic journeys

These belong in P5 rather than being folded into the P4 stabilization pass.

---

## 14. Final go/no-go recommendation

### GO/NO-GO: NO-GO FOR PUBLIC PRODUCTION

The P4 foundation is strong enough to move into **controlled staging validation**, but not public production.

### Required before production

- [ ] Apply `010_p4_production_hardening.sql` to staging.
- [ ] Convert privacy-sensitive Storage buckets to private/access-controlled media.
- [ ] Verify all 001–010 migrations on a clean Supabase database.
- [ ] Verify an existing P3/P4 database migration path.
- [ ] Run a successful `npm install`.
- [ ] Run `npm run build`.
- [ ] Run lint/tests available in the project.
- [ ] Execute member/admin RLS tests directly against Supabase.
- [ ] Execute the eight P4 E2E journeys with real authenticated accounts.
- [ ] Verify invitation expiry/single-use/reassignment behavior.
- [ ] Verify private profile, timeline, memory and media access using direct API calls.
- [ ] Perform a 500/1,000-member performance test before wider rollout.

### Production confidence after these checks

If the above passes, P4 can reasonably become the stable foundation for P5.

