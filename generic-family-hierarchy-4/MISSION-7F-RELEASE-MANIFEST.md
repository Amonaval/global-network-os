# M7-F Release Manifest

Mission: **Pilot Evidence Review & Product Decision Gate**

## Added
- `components/PilotEvidenceDecisionGate.tsx`
- `core/activation/pilot-decision.ts`
- `capabilities/pilot-decision/remote.ts`
- `supabase/migrations/067_m7f_pilot_evidence_product_decision_gate.sql`
- `scripts/m7f-pilot-evidence-decision-gate.mjs`
- `MISSION-7F-PILOT-EVIDENCE-REVIEW-PRODUCT-DECISION-GATE.md`
- `MISSION-7F-RUNTIME-VERIFICATION-CHECKLIST.md`
- `MISSION-7F-RELEASE-MANIFEST.md`
- `MISSION-7F-PILOT-EVIDENCE-REVIEW-PRODUCT-DECISION-GATE.docx`
- `MISSION-7F-AFFECTED-FILES.txt`

## Modified
- `components/MyNetworksHome.tsx`
- `app/globals.css`
- `lib/i18n/messages/en.ts`
- `package.json`
- `.github/workflows/ci.yml`
- durable roadmap/status/handoff/user-guide/validation documents

## Database
Migration 067 adds `pilot_product_decisions` and two governed RPCs:
- `get_my_pilot_product_decision_gate(integer)`
- `record_pilot_product_decision(text,text,integer,text,text)`
