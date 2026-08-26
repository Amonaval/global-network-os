# Plan: Session Log Rule + Manual Process Analysis + Claude Workflow Doc

## Context
User wants three things from this session:
1. A rule that writes a minimal session log after every coding session
2. Honest analysis of their manual Mend process + what the new script improves/misses
3. A `CLAUDE_WORKFLOW.md` instruction file they can feed to Claude to automate the remaining manual 5-10% (the fixed-pattern steps)

No new code to write. Purely documentation + a conversation.

---

## Part 1 — Session Log Rule + First Log

### Rule to add to CLAUDE.md (one new section)
```
## Session Log Rule
After every session that changes code, append an entry to docs/SESSION_LOG.md.
Format: date | title | before | changes (bullet, why-focused) | what's next.
Only write what a future session needs to not re-derive. Skip ephemeral context.
```

### docs/SESSION_LOG.md — first two entries
**Session 1 (2026-08-04): Initial build**
- Before: empty project with doc stubs + sample Mend JSON/Excel
- Built: parser, semver-engine, overrides, report, CLI (`mend-fix.js`)
- Why: automate the 90-95% deterministic triage that was done manually per release
- Key decision: group by `library.keyUuid`, not CVE — one entry per library with all CVEs

**Session 2 (2026-08-04): Phase model + registry check**
- Before: flat output, @^major selectors, no phase split, MAJOR_BUMP in overrides
- Added: `src/phases.js` (A/B/C classification), `src/npm-registry.js` (--verify-versions)
- Fixed: nanoid 3→5 now Phase C (not auto-applied); brace-expansion multi-major → Phase C
- Removed: @^major scoped selectors — unreliable across npm versions
- Added: `--package-json` auto-applies Phase A only; phase-a/b/c separate output files
- Why changes: user feedback — MAJOR_BUMP in overrides would break functionality; @^major syntax doesn't work reliably; need phase separation matching confidence scoring from MEND_AUTOMATION.md

---

## Part 2 — Analysis of manual process + comparison text (prose, not code)

Key points to cover:
1. Their process is solid and maps exactly to our A/B/C phases
2. Three things script now automates that were fully manual: parse + SemVer range check, phase classification, registry verification
3. Three things the script doesn't yet automate (Phase 2/3 roadmap):
   - package-lock.json traversal → actual semver range check (^/~/exact) per consumer
   - Parent chain traversal → "upgrade parent instead of override" logic
   - Reachability analysis → runtime vs build/dev chain → false positive auto-classification
   - Auto-removal of unnecessary overrides after npm install

---

## Part 3 — CLAUDE_WORKFLOW.md

Purpose: fixed-pattern instruction document user feeds to Claude when they want the 5-10% manual work done. Claude reads the Mend report + package-lock.json, follows these steps, and produces commits.

Structure:
1. Context Claude needs (what files to read, what to look for)
2. Phase C MAJOR_BUMP analysis steps (check changelog, find call sites, assess risk)
3. Multi-version conflict resolution (npm ls, find parents, nested override suggestion)
4. False positive assessment (check depType in package-lock, find all consumers, write justification)
5. Cleanup: remove unnecessary overrides after npm install
6. Commit structure (what goes in each commit message)

---

## Files to create/modify

| File | Action |
|------|--------|
| `CLAUDE.md` | Add Session Log Rule section |
| `docs/SESSION_LOG.md` | Create with first two session entries |
| `CLAUDE_WORKFLOW.md` | Create — step-by-step Claude instruction for manual Mend triage |

## Verification
- All three files readable and clear enough for a cold-start Claude session
- SESSION_LOG.md captures both sessions accurately with why-focused bullets
- CLAUDE_WORKFLOW.md follows the exact manual process the user described
