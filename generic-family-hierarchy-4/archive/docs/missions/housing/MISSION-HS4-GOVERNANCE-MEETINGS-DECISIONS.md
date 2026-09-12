# HS-4 — Governance, Meetings & Decisions

Status: **SOURCE IMPLEMENTED / RUNTIME VERIFY**

## Outcome
Housing Society now preserves governance history instead of keeping only a current committee list. Committee terms and office-bearer assignments are time-bounded; meetings retain agenda and published minutes; action items have accountable lifecycle; resolutions support controlled one-member-one-vote approval/advisory decisions.

## Delivered
- committee terms and chairperson/secretary/treasurer/committee role history;
- AGM, SGM, general-body and committee meetings;
- ordered agenda items, attendee/quorum fields and published minutes;
- action register with owner, due date and completion history;
- resolutions with approval/advisory vote mode;
- one authenticated network member = one recorded vote per resolution;
- Yes / No / Abstain; admin-governed close/result note;
- governance document references with version + visibility;
- resident Committee & Meetings surface and admin governance console;
- migration 086, feature flags, source gate and regression chain.

## Boundary
This is deliberately **not** an election-grade secret-ballot engine. Nomination, election roster, secret ballot, statutory election certification and election audit are deferred until a dedicated governance/election mission is justified.

## Runtime gate
Apply migration 086 to staging, publish one committee term, schedule one meeting, add agenda, publish minutes, complete one action item, open a resolution, record votes from multiple members and close the result. Confirm tenant isolation/RLS with a second society.
