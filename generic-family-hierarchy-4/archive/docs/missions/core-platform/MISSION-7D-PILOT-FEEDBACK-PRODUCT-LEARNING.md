# Mission 7-D — Pilot Feedback & Product Learning Loop

**Effort:** MEDIUM  
**Program:** Mission 7 — Real-World Activation, Showcase & Pilot Readiness

## Mission purpose
M7-B proves the product story, M7-A guides one network toward activation, and M7-C tells an administrator which pilot needs attention. M7-D closes the loop by adding the missing human signal: **did the experience actually help, where was the friction, and what should the product team learn before building more?**

This is intentionally not a survey platform. The product asks for one small signal at a meaningful moment and turns repeated friction into evidence.

## User experience
My Networks now contains a **Pilot Feedback & Product Learning Loop**. A member selects the relevant network and moment, then chooses one outcome:

- **Yes, it helped**
- **Partly helped**
- **I was blocked**

If the experience did not fully help, the user chooses one bounded friction category: next-step clarity, setup effort, incomplete data, permissions/governance, discovery quality, consent/introduction flow, technical issue, or other. A short optional note can explain the situation.

The system suggests the feedback moment from recent first-party Network Effect events when possible, for example discovery, introduction, or accepted outcome. Users can override it.

## Product-learning view
Owners/Admins receive an aggregate 30-day learning snapshot:

- feedback responses;
- fully-helpful rate;
- blocked responses;
- top repeated friction;
- per-network helpful/partial/blocked counts;
- recent de-identified qualitative notes.

The point is not to maximize ratings. The point is to identify **repeated friction that prevents real outcomes**.

## Privacy and governance
M7-D keeps a strict boundary from M6 discovery data.

The feedback table never stores M6 search text, candidate ID, target profile, contact details, or network graph snapshots. The optional note is explicitly user-authored, limited to 600 characters, and the UI tells users not to include names, contact details, medical information, or private network data.

Admin learning summaries do not expose the feedback author. Raw table access is revoked from normal clients; submission and learning use security-definer RPCs with membership/admin checks.

## Architecture

```text
Member / Admin
    │
    ├─ contextual micro-feedback
    │        ↓
    │   submit_pilot_feedback()
    │        ↓
    │   pilot_feedback
    │
    └─ Owner/Admin learning
             ↓
       get_my_pilot_learning_summary()
             ↓
       aggregate friction + de-identified notes
```

M7-D remains inside the existing Next.js + Supabase architecture. No external analytics vendor, survey SaaS, AI scoring system, data warehouse, or new infrastructure service is introduced.

## Product rule
**Fix repeated friction that blocks real outcomes before adding speculative capability.**

This is the strategic purpose of M7-D. If pilot users repeatedly say they do not understand the next step, adding another graph feature is the wrong response. If trusted discovery works but introductions are consistently blocked by consent UX, improve that flow first.

## What M7-D does not do
- no NPS program;
- no long surveys;
- no public ratings;
- no human trust score;
- no sentiment AI;
- no raw M6 search/candidate analytics;
- no automatic roadmap mutation;
- no external product-analytics dependency.

## Mission 7 closure
With M7-D, the Mission 7 loop becomes complete:

```text
M7-B  SHOW the WOW outcome
  ↓
M7-A  GUIDE a real network toward it
  ↓
M7-C  OPERATE multiple pilots
  ↓
M7-D  LEARN from real friction and value
```

The next major mission should be selected from actual pilot evidence, not because another capability is technically possible.
