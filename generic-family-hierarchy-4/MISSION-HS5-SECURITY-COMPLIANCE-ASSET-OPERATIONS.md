# HS-5 — Security, Compliance & Asset Operations
Status: **SOURCE IMPLEMENTED / RUNTIME VERIFY**

## Outcome
Housing Society now covers controlled visitor/security operations, domestic staff permissions, move/renovation approval flows, society assets/service history, compliance due dates and emergency contacts without turning security/facility operators into full society admins.

## Delivered
- scoped `security | facility | compliance` operator grants;
- flat-scoped visitor pre-approval and operator check-in/check-out;
- domestic staff register + time-bounded flat permissions;
- move-in/move-out request and committee review;
- renovation request + NOC/conditions lifecycle;
- asset registry, warranty and service/AMC history with next-due dates;
- compliance calendar with member/admin visibility and document reference;
- member-visible emergency contacts;
- resident Security & Services surface and admin operational console;
- migration 087, feature flags, source gate and full housing/FCA regression chain.

## Security posture
Visitor/staff phone details are not broadly returned to normal members. Residents can create visitor/move/renovation records only for a currently occupied claimed flat. Security operators receive narrow operational access; official approvals and society governance remain admin controlled.

## Runtime gate
Apply migration 087 twice safely. Grant a non-admin security operator, create a visitor as a resident, check the visitor in/out as that operator, add domestic staff and a flat permission, process move/renovation requests, record an asset service and compliance expiry, and verify cross-society isolation.
