# A3 — Family Admin Center

Implemented in source after A2.

## User outcome
A family Owner/Admin can operate normal family administration without opening Supabase.

## Added
- Family Admin Center with Overview, Members & roles, Approvals, Privacy, Storage, Family settings and Export/backup.
- Family-scoped role management. Owner cannot be demoted through the ordinary role UI; family admins cannot use A3 to create platform-global privilege.
- Claimed-profile, invitation, admin and storage summary RPC.
- Per-family storage meter using the A1 network storage path and configured family allowance.
- Existing invitation, participation, governance and export journeys are linked rather than replaced.
- Older advanced administration/diagnostics remain preserved behind an expandable section.
- Admin visibility now recognizes A1/A2 family membership roles (`owner`/`admin`) rather than depending only on the legacy global profile role.

## Migration
`021_a3_family_admin_center.sql`

## Verification still owned by deployment gate
Run 001–021 in staging and verify owner/admin/member role boundaries, role-change RPCs, storage totals and all prior A1/A2 isolation checks. Source implementation is not a claim of live Supabase verification.
