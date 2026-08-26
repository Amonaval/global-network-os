# A1 — Multi-Family Foundation

Status: implemented as migration/code foundation; must pass Supabase staging verification before Alpha.

## Why A1 is Priority 1

The product cannot safely host unrelated families until every family-owned record has an explicit tenant owner and every authenticated operation is constrained to that tenant. A family slug is navigation, not security. `network_id` + membership + RLS is the security boundary.

## Delivered

- `networks`: one row per independent family.
- `network_memberships`: user ↔ family with `owner | admin | member` role.
- `profiles.active_network_id`: explicit current-family context.
- Legacy single family automatically becomes the first network; existing data is backfilled, not discarded.
- First legacy admin becomes Owner; other admins become family Admins; existing users become Members.
- `current_network_id()`, `is_network_member()`, `is_network_admin()`, `get_my_networks()`, `set_active_network()`.
- Existing `is_admin()` now means admin of the active family rather than global platform admin.
- `network_id` added/backfilled/indexed on all family-domain tables present through Release 2A.
- Restrictive tenant RLS added to critical direct-access tables so old permissive policies cannot cross the active-family boundary.
- Network settings become one row per family while retaining legacy columns/API shape.
- Client auth derives admin status from the active family's membership.
- Client network settings resolve against the active family.
- 100 MB family storage limit and 100 KB image limit are represented at the tenant level; actual byte accounting/enforcement remains A5 after storage paths are tenant-prefixed.

## Deliberately not in A1

These belong to A2/A3, not this migration:
- public Create Family;
- invite-driven Join Family;
- family switcher UI;
- duplicate-family/person UX;
- admin ownership transfer UI;
- paid plans/billing;
- platform-owner console.

## Required verification before A2

1. Apply migrations 001–019 on clean staging.
2. Upgrade a copy of an existing Release 2 database with 019.
3. Confirm existing members/relationships/memories/events remain visible to Network #1.
4. Create a second test network + memberships in SQL.
5. Put test records in both networks.
6. As Family A member/admin, direct-select and RPC-test Family B identifiers; expect no cross-family data.
7. Repeat B → A.
8. Confirm Owner/Admin can govern only their active family.
9. Confirm Member cannot approve governed changes.
10. Confirm changing `active_network_id` is possible only through `set_active_network()` for a network the user belongs to.

## Security invariant

**No authenticated request may gain access to a family merely by knowing its UUID, slug, member UUID, memory UUID, event UUID or URL. Membership is always required.**

## Roadmap preservation / handoff note
A1 pulls forward only the minimum multi-family tenancy required for the family Alpha. It does not delete or replace the earlier mature P6 SaaS mission. All P5.3/P5.4/P6/P7/P8/P9 capabilities remain preserved in `ROADMAP.md` behind explicit gates.

A1 remains IMPLEMENTED / VERIFICATION GATE OPEN until cross-family REST/RPC/storage isolation and Release 1/2/2A regression evidence pass.
