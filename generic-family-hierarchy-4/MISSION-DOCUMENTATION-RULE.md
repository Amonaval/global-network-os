# Permanent Mission Documentation Rule

## Rule
For the Generic Network OS, **every major mission** (or an intentionally grouped batch of small missions) must ship with a human-readable `.docx` mission document in addition to the normal Markdown/source-control artifacts.

## Required mission artifacts
At mission closure, produce and include:
1. `MISSION-X-<NAME>.md` — technical/source-of-truth mission document.
2. `MISSION-X-<NAME>.docx` — human-readable durable mission document.
3. `MISSION-X-RELEASE-MANIFEST.md`.
4. `MISSION-X-RUNTIME-VERIFICATION-CHECKLIST.md`.
5. Updated architecture / roadmap / status / handoff docs where affected.
6. Affected-files ZIP preserving repository hierarchy.

## DOCX minimum content
The `.docx` must explain in plain language:
- why the mission exists and the problem it solves;
- before vs after architecture/product behavior;
- what was implemented and deliberately not implemented;
- privacy/security/governance decisions;
- user/product value;
- affected areas and compatibility guardrails;
- validation/runtime checklist and known limitations;
- recommended next mission.

## Source-of-truth rule
Markdown remains the implementation-friendly source of truth. The DOCX is the durable human/readable mission record and must not contradict the Markdown.

## Closure lifecycle
This extends, not replaces, the existing lifecycle:

`IMPLEMENT → VALIDATE → GUIDE → PLAYGROUND → LAUNCH CONTROL → WHAT'S NEW → ROADMAP/STATUS → DOCX → CLOSE`
