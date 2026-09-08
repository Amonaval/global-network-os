# Executable Test Case Catalog

## Generic platform suite (~50%)

Run across every released vertical unless marked N/A:

1. Authentication: sign-in, sign-out, invalid credentials, password reset entry.
2. My Networks: switch network, archived section, restore visibility.
3. Network create/open and blank-state handling.
4. Choose how to start: Build Together / Excel / Start Small.
5. Quick Start: role-aware, real navigation, progress persistence, dismiss/resume.
6. Language: EN/HI/MR across Home/Admin/Guide/error states.
7. Admin Center: owner/admin/member authorization and module routing.
8. Members/roles: add, role change, removal constraints.
9. Invitations: create, email/link, resend, revoke, expire, accept, duplicate claim.
10. Corrections: submit, approve/reject, audit history.
11. Guided workbook: download, legal sheet names, unchanged roundtrip, validation, duplicate IDs, broken refs, confirm import.
12. Backup/export: JSON, XLSX, metadata, credential exclusion, media manifest.
13. Guide: contextual tasks route to real actions.
14. What's New: unread/read persistence and routing.
15. Network Health: signals respond to real network state; unknown metrics are not invented.
16. Lifecycle: leave, archive, restore, hard delete, storage residue = 0.
17. Error UX: no raw SQL/stack trace to end user; correlation evidence captured by QA.
18. Responsive smoke: desktop + mobile viewport for shell, tabs, dialogs.
19. Accessibility smoke: page title/landmarks, buttons named, dialog focus, keyboard tabs.
20. Security/RLS: direct cross-tenant API attempts denied.

## Vertical-specific suite (~50%)

### Family
People CRUD; spouse/parent/child graph; relationship validation; family tree; claim existing person; invitations; memories/media; public/privacy preview; family workbook relationships.

### Alumni
Alumni profiles; cohorts/chapters; affiliations/connections; alumni import; invitation + claimed/unclaimed behavior; directory filters.

### Housing Society
Buildings; units; resident/household; owner/tenant occupancy history; move-in/out; vehicles; parking; notices; complaints; amenities/bookings; vendors/contracts; dues/payments/funds/budget; committee/meetings/resolutions/voting; visitors/staff/security; assets/compliance/emergency; renovation/NOC; workbook six-sheet relationship integrity.

### Family Association
Families; people; household linking; one representative; annual membership cycle; renewal/grace; fees/privacy; carry-forward/donation; designations/history; co-admin; transfer/exit semantics; workbook family/person references.

### Association
Members; groups/chapters; roles/affiliations; events; invitation and admin flows; member directory.

### Organization
People; teams; projects; skills; reporting/working relationships; import reference integrity; admin/role boundaries.

### Business Trust
Business entities; contacts; categories; trust/business relationships; duplicate businesses; professional contact privacy; import links.

### Franchise
Branches; owner/operators; geography; organizational relationships; branch lifecycle; import references.

### Professional
Professional profile; expertise; affiliations; professional relationships; privacy/contact controls; import links.
