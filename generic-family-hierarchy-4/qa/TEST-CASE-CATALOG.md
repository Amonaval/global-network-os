# Executable Test Case Catalog — QA Mega Mission

The executable suite is intentionally split roughly between shared platform behavior and vertical-specific behavior. `qa/static-suite-audit.mjs` guards the presence of the mandatory runtime suites; `qa/report-summary.mjs` reports role × vertical execution.

## Shared platform certification

1. Anonymous shell and health/readiness runtime behavior.
2. Authentication: invalid credentials, forgot-password entry, dedicated QA login.
3. Nine released verticals × owner/admin/member shell smoke.
4. Admin authorization: owner/admin visible and usable; member absent/denied.
5. Cross-tenant known network-ID substitution through REST/RPC.
6. API anonymous denial across protected command routes.
7. API idempotency/validation boundaries reject invalid input without HTTP 5xx.
8. Backup/export owner/admin success and member denial.
9. Hard purge member denial + exact-name confirmation.
10. Deterministic quick-start state across every role/vertical.
11. Logical backup RPC across every vertical and role boundary.
12. Productized settings/relationship/membership safe reads.
13. Database migration replay: current staging rerun + fresh 001→checkpoint→latest + rerun.
14. DB integrity: no orphan memberships/entities/relationships/media, active-network membership consistency, critical RLS enabled.
15. RPC exposure/ACL audit: unexpected PUBLIC/anon function execution is a finding, especially SECURITY DEFINER.
16. RLS: tenant A/B network and membership invisibility by known UUID.
17. RLS: cross-tenant update/delete/insert attempts.
18. Storage: own tenant path works; foreign tenant read/list/upload is denied.
19. Invitation governance: member create/list denied, revoke invalidates, resend rotates token, old token fails, accepted token cannot replay.
20. Guided workbook browser download→XLSX validation→same-file upload/review.
21. Import schema registry/workbook naming/duplicate/reference/value validation unit contracts.
22. Quick-start registry completeness and role thresholds.
23. Graph relationship validation and governance confidence clamping.
24. Network-health readiness calculations.
25. Backup contract/media-manifest semantics.
26. API error normalization/validation utility contracts.
27. Golden shell flows: family admin/export and productized navigation/admin.
28. Expert crawler for every owner/admin/member × released vertical.
29. Crawler expected-vs-discovered selector inventory; missing must-exist surface fails test.
30. Console errors, page errors, failed requests and HTTP 5xx evidence capture.
31. axe WCAG 2A/2AA/2.1AA serious/critical checks on every released vertical.
32. Mobile 390×844 shell/overflow smoke on every released vertical.
33. Keyboard reachability of primary admin navigation.
34. Controlled create→10-row import→media upload→archive→restore→purge→zero residue.
35. 100-row deterministic bootstrap; idempotent repeat; 25-row pagination; search.
36. Optional extra 1,000-row stress path.
37. Slow REST responses do not crash shell.
38. Transient REST outage does not leak raw stack/SQL details.
39. Firefox and WebKit member-shell smoke across all nine released verticals.
40. Machine-readable + human-readable bug, coverage, remediation and certification outputs.

## Vertical depth

### Family
- Family shell, tree, owner/admin/member role boundary.
- Family admin summary authorization.
- Backup/export and family workbook parser contracts.
- Relationship duplicate/self/invalid-reference rules.
- Family tenant storage prefix security.
- Invitation claiming/replay boundary.

### Housing Society
- Home/directory/complaints/guide/admin must-exist navigation.
- HS1 property snapshot, my-flat and import-template runtime.
- HS2 operations, HS3 finance, HS4 governance, HS5 security/compliance/assets, HS6 pilot snapshots.
- Guided Housing workbook browser round-trip.
- Owner/admin/member shell authorization.
- Deep panels remain free of runtime fatal errors.

### Family Association
- Home/me/directory/community/guide/admin navigation.
- FCA admin snapshot owner/admin success; member denial.
- Family/person workbook reference contracts and browser round-trip.
- Role/renewal/finance/admin surface runtime loading.

### Alumni
- Home/explorer/directory/community/connections/guide/admin navigation.
- Alumni directory owner/admin/member runtime reads.
- Guided alumni workbook browser round-trip.
- Claim/invite/admin boundaries exercised by shared participation/security suites.

### Association
- Home/me/directory/community/guide/admin navigation.
- Member/group/community shell and guided workbook round-trip.

### Organization
- Home/explorer/directory/community/connections/guide/admin navigation.
- People/team/project bootstrap volume, pagination/search/idempotency.
- Guided workbook round-trip and outage/slow-backend resilience.

### Business Trust
- Home/explorer/directory/community/connections/guide/admin navigation.
- Business entity/relationship shell and guided workbook round-trip.

### Franchise
- Home/explorer/directory/community/connections/guide/admin navigation.
- Branch/location relationship shell and guided workbook round-trip.

### Professional
- Home/explorer/directory/community/connections/guide/admin navigation.
- Professional/expertise shell, guided workbook round-trip and transient-outage behavior.

## Regression closure rule

Every defect discovered by runtime certification receives a permanent automated regression assertion. The defect is not closed until the focused suite and full `npm run qa:certify` pass for the certified scope.

## Phase-2 representative capability profile

The compact Phase-2 certification intentionally promotes only a representative subset of the broader mega-suite:

41. Organization member browser journey: authenticated shell, directory visibility, seeded member-readable data, and absence of admin navigation.
42. Browser-authenticated Tenant-A → known Tenant-B export substitution is denied and leaks no Tenant-B network name.
43. Disposable Organization API/lifecycle: create network, export/readback, bootstrap entity, persisted read, governed update, purge, and zero-residue verification.
44. axe serious/critical baseline on one Family owner/admin screen and one Organization member screen.
45. Chromium 390×844 Organization member smoke with usable directory/search action, visible authenticated content, fatal-error check and horizontal-overflow limit.
46. Cheap all-nine released-kind parity contracts; no Phase-2 role × vertical Cartesian browser expansion.

Phase-2 policy keeps RPC privilege findings advisory-but-preserved. They remain blocking for strict/full/production certification.

## Phase 3 — Expanded platform parity & role/security

- P3-VERTICAL-OWNER-001: one owner browser session traverses all 9 released vertical shells and must-exist navigation.
- P3-VERTICAL-ADMIN-001: one admin browser session traverses all 9 released vertical shells and retains governed admin access.
- P3-VERTICAL-MEMBER-001: one member browser session traverses all 9 verticals, sees governed directory data, and never receives admin navigation.
- P3-DEEP-HS-FCA-001: Housing Society and Family Association directory/guide paths remain healthy for owner.
- P3-INVITE-001: governed invitation create/resend rotates token; stale/replayed tokens fail; accepted invite reaches Family as member; cleanup restores isolated invitee.
- P3-TENANT-MUTATION-001: Tenant-A owner cannot create an invitation in Tenant-B by substituting Tenant-B network ID.
- P3-RLS-001: full adversarial RLS suite is required.
- P3-RPC-NONREGRESSION-001: unexpected RPC privilege findings must not exceed Phase-2-certified ceiling of 331; findings remain fully preserved.

## Phase 4A — Runtime robustness & recovery

- Authenticated reload/session recovery for Family owner and Organization member.
- Query-string, browser history, slow-backend and simulated REST-outage containment.
- 390×844 mobile reload/navigation/overflow recovery and post-recovery axe gate.

## Phase 4B — Data integrity, import/export & recovery

- All-nine deterministic guided workbook generation/parser round-trip and rejection contracts.
- Family JSON/CSV portable snapshot verification.
- Organization logical backup + manifest-only media contract.
- Malformed/valid staged-import review containment and reload recovery without commit mutation.

## Phase 4C — Governance, permissions & destructive-action safety

- P4C-FAMILY-DANGER-001: Family owner archive/delete require exact-name confirmation; cancelling confirmation emits zero mutation request.
- P4C-FAMILY-ADMIN-001: Family admin can inspect danger zone but cannot enable owner-only archive/delete controls.
- P4C-PRODUCT-ROLE-UI-001: Organization owner/admin/member receive only role-appropriate lifecycle/member controls.
- P4C-GOV-RPC-001: unauthorized role changes, admin-role invitation escalation, wrong-name destructive requests and non-owner destructive requests are denied before mutation.
- P4C-STALE-ROLE-001: demoted Organization admin loses backend authority immediately and admin UI after reload; owner restoration is deterministic.
- P4C-DOUBLE-SUBMIT-001: member removal disables while pending and emits exactly one governed RPC; synthetic interception proves no seeded-data mutation.
