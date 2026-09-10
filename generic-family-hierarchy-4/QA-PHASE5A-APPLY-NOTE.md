# Apply note — QA Phase 5A

Apply this patch on top of the Phase-4D-certified working tree.

This patch contains **no SQL migration** and performs no database write. Do not reintroduce or rerun experimental Phase-3 migrations 096/097 as part of Phase 5A.

Run first:

```bash
npm run qa:phase5a:local
```

Then run the read-only live audit:

```bash
npm run qa:phase5a:audit
```

The audit may legitimately report `REMEDIATION_REQUIRED`. Share the summary counts and `PHASE5A-RPC-SECURITY-AUDIT.md` findings before applying any ACL change. Do **not** execute `PHASE5A-RPC-REMEDIATION-PREVIEW.sql`; it is review-only and rollback-protected.

Run `npm run qa:certify:phase5a` only when the reviewed remediation work has reduced Phase-5A P0/P1 findings to zero.
