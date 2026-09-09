# TrustWeave QA Handover Package

This directory is the consolidated implementation baseline after the QA Mega Mission Phase 1 work and all follow-up fixes through the successful local `qa:unit` run.

For the next ChatGPT session, attach the full ZIP and use `NEXT-SESSION-QA-PHASE2-MASTER-PROMPT.md` as the starting prompt.

Phase 1 is formally closed with local `POC_CERTIFIED`. The next mission may begin Phase 2 using this cleaned baseline.

Do not reapply the historical small patch ZIPs. Their latest state has already been consolidated into this project tree.

## First dependency sync

`tsx` was intentionally persisted into `package.json` during final handover consolidation. The inherited baseline `package-lock.json` predates that persistence. On the first checkout from this handover ZIP, run `npm install` once (not `npm ci`) to synchronize the lockfile, then commit the resulting lockfile if desired. After that, normal locked installs can resume.

## Phase-1 browser runtime decision

Compact local Free-Tier POC certification runs its single Chromium journey in headed mode. The identical test is proven stable headed on the current Windows/Next.js development runtime; headless hydration stability is tracked separately for later CI/production hardening. See `QA-PHASE1-HEADED-POC-DECISION.md`.
