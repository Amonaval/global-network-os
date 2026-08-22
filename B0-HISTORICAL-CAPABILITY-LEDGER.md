# B0 Historical Capability Ledger

Purpose: preserve everything built or deliberately deferred before B0 so later simplification never becomes accidental deletion or false completion.

Status vocabulary: **Built**, **Partial**, **Verify**, **Deferred**, **Hidden by rollout**.

## Foundation before A1

| Area | Source history | Current status | Preserved follow-up |
|---|---|---|---|
| Generic hierarchy setup, CSV/XLSX import, empty/demo start | P3 / setup work | Built / Verify | B0-C onboarding simplification; C3 import-at-scale evidence |
| Auth, member/admin privacy, RLS | P3→P4 | Built / Verify | C1 privacy regression matrix |
| Governance, change requests, audit history | P4.1 | Built / Partial UX | C1 friendly recovery/history UX |
| Relationship explorer, lineage focus, profile improvements | P4.2 | Built | Explorer-only capability under B0 flags |
| Community discovery, map/geography | P4.3 | Built / Verify | Explorer-only; C2 evidence-driven engagement decision |
| Intelligence/analytics/scale primitives | P4.4 | Built / Partial productization | C3 scale operations and performance evidence |
| Configurable hierarchy types | P5 | Built / Deferred for family alpha | Keep hidden from family members; revisit only after family vertical is strong |
| Private storage / signed media / public page | P5 S0 | Built / Verify | C1 privacy + C3 deployment regression |
| Living-family UX, self-edit, milestones | P5.1 | Built / Partial | B0-C novice flow; C2 engagement completion |
| Invitations, groups/events, participation metrics/suggestions | D1 | Built / Partial | C2 engagement; C3 activation funnel |
| Family-first visual/mobile release | Family Release 1 | Built / Verify | B0-C older/non-technical usability gate |
| Storage controls | Release 2A / A5 | Partial | A5.1 thumbnails; A5.2 orphan cleanup; A5.3 live quota/isolation testing |

## A1–A9 preservation

The detailed audit remains in `A1-A9-COMPLETENESS-AUDIT.md`. B0 does not supersede those follow-ups. In particular, A3, A5, A6, A7, A8 and A9 remain partial until their numbered follow-ups are completed and verified.

## Capabilities intentionally hidden from the Simple experience

These are **not removed**: memories, timeline/history, places/map, advanced relationship explorer, participation/contribution tools, public sharing, QR/print, community/gathering tools, imports, governance, diagnostics, analytics and family administration.

Visibility is now a product decision controlled by three independent dimensions:

1. **Founder rollout** — Hidden / Test / Pilot / Released.
2. **Member experience** — Simple / Connected / Explorer.
3. **Permission** — member vs family owner/admin; platform-owner authority is separate.

A capability is shown only when all required dimensions allow it.

## Older roadmap items that must not disappear

- English / Hindi / Marathi family UX.
- Guided spreadsheet onboarding suitable for non-technical admins.
- Invitation → identify yourself → profile claim journey.
- Privacy-safe profile/contact defaults and real privacy preview.
- WhatsApp-first distribution, QR and print.
- Memories, remembrance, birthdays/anniversaries and gathering follow-up.
- Quiet updates/digest rather than noisy social notifications.
- Family-admin operation without routine Supabase/SQL/Vercel work.
- Reversible mistakes, backup/export and ownership continuity.
- Older-user/mobile accessibility and slow-network handling.
- Real 20-family evidence, then an explicit 20→50-family promotion gate.
- Generic hierarchy extensibility remains an underlying architectural asset, not a family-member UI requirement.

## New B0 preservation rule

A feature hidden by an experience level or rollout flag must never be marked removed or complete merely because it is no longer visible. Mission status tracks **implementation**, **verification**, and **release visibility** separately.
