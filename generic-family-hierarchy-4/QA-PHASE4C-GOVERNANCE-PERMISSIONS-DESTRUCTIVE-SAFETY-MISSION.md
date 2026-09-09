# QA Phase 4C — Governance, Permissions & Destructive-Action Safety

## Mission status

Implementation started on the Phase-4B-certified source baseline. Phase 4C is independent of the unresolved Phase-3 Storage/RLS blocker and does not modify Supabase migrations or Storage policy.

## Objective

Certify that TrustWeave governance remains safe when users have different roles, when permissions change while a session is already open, and when users approach high-impact actions such as member removal, archive, leave, and permanent deletion.

The mission is intentionally capability-first rather than a full role × vertical Cartesian matrix. Family represents the Family-specific admin center; Organization represents the shared productized-network governance shell used by the non-Family productized verticals.

## Required proofs

1. **Family destructive-action guard**
   - Owner archive/delete disabled until the exact network name is typed.
   - Wrong confirmation text never enables the action.
   - Cancelling the native confirmation dialog emits zero archive/purge mutation requests.
   - The Family remains active after cancellation.

2. **Family admin boundary**
   - Admin can access governance/admin surfaces.
   - Even with the exact network name entered, owner-only archive/delete remain disabled.

3. **Productized owner/admin/member governance UI**
   - Organization owner sees role-management plus archive/delete controls.
   - Organization admin sees admin governance and permitted member removal, but no owner-only role-change/archive/delete controls.
   - Organization member receives no admin navigation or lifecycle admin surface.

4. **Backend authorization boundary**
   - Member cannot change member roles or create invitations.
   - Admin cannot perform owner-only role changes or invite another admin.
   - Owner cannot demote the owner account through the member-role RPC.
   - Invalid role values are rejected.
   - Wrong-name archive/delete requests are rejected before mutation.
   - Non-owner archive/delete requests are rejected.

5. **Stale-session permission revocation**
   - A signed-in Organization admin is demoted by the owner.
   - The existing admin token immediately loses backend admin authority.
   - After reload, admin UI disappears.
   - Owner restores the seeded admin role and the browser recovers admin UI.
   - Restoration runs in `finally` so the QA fixture is deterministic even after assertion failure.

6. **Duplicate-submit protection**
   - Member removal becomes disabled while its governed RPC is pending.
   - Exactly one mutation request is emitted.
   - The RPC is intercepted and synthetically fulfilled so the seeded member is never removed.

## Safety policy

Phase 4C deliberately does **not** execute:

- Supabase migrations;
- Storage reads/writes for certification;
- service-role access;
- network purge/permanent deletion;
- QA seed or cleanup;
- load/stress testing;
- Phase-3 Storage/RLS diagnostics.

The only real data mutation is a reversible Organization admin → member → admin role transition. It is guarded by `QA_MODE=staging` + `QA_ALLOW_MUTATION=true` and restored in `finally`. All destructive requests are either rejected before mutation, cancelled in the browser, or synthetically intercepted.

## New QA observability

The mission adds stable test IDs only; it does not change authorization semantics:

- Family danger confirmation and member-role controls;
- productized lifecycle container/confirmation/leave/archive/delete controls;
- productized member rows, role selectors, and remove buttons.

## Commands

```bash
npm run qa:phase4c:local
npm run qa:phase4c:browser
npm run qa:certify:phase4c
```

Run in that order. The browser profile remains headed Chromium with one worker.

## Certification output

Successful closure must report:

```text
Phase-4C report: PHASE4C_CERTIFIED
TrustWeave Phase-4C governance/destructive-action certification: PHASE4C_CERTIFIED
```

Phase-4C certification does not certify or waive the still-open `P3-STORAGE-002` issue.

## Deferred after Phase 4C

- actual disposable owner archive → restore browser lifecycle;
- actual permanent purge/delete + zero-residue browser lifecycle;
- formal ownership-transfer workflow, once released;
- Phase-3 Storage/RLS blocker and staging drift reconciliation;
- strict RPC privilege remediation;
- clean migration replay / production upgrade-path certification;
- load, stress, and broad destructive-action browser matrices.
