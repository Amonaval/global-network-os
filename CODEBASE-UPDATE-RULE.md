# CODEBASE.md Update Rule

`CODEBASE.md` is the compact technical handoff for future sessions.

## Update it whenever

-   a migration changes;
-   a major component/module/RPC is added or removed;
-   architecture/persistence boundaries change;
-   a mission completes;
-   a production/security caveat changes;
-   the active next task changes.

## Required Sections

1.  Current product/architecture summary.
2.  Migration chain.
3.  Key files/responsibilities.
4.  Security/privacy invariants.
5.  Generic-core vs domain-module decisions.
6.  Completed missions.
7.  Active mission and exact next step.
8.  Known blockers/unverified items.
9.  Build/deployment commands.
10. Links to vision/roadmap/rules/status documents.

## Rules

Keep it factual and concise. Code beats documentation. Do not write DONE
unless implemented and reasonably verified. Record unverified work
explicitly. Remove stale next steps. History belongs in
`MISSION-STATUS.md`, not a growing diary in `CODEBASE.md`.
