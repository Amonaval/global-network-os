# Context

Building on the v1 dep-tree capabilities (consumer range validation, dev classification, parent upgrade recommendations, stale override cleanup). Four improvements planned this session:

1. **Nested parent-scoped overrides** — `brace-expansion` and similar multi-major conflicts move from Phase C → Phase B by generating safe `"parent": { "pkg": "version" }` override keys instead of a flat override that can't cover two major lines.
2. **Dependency chain display** — Phase C items show the path from root to the vulnerable package so users understand reachability without running `npm ls` manually.
3. **Phase B → Phase A promotion** — When all consumers of a Phase B package (same-major multiple instances) have compatible ranges, auto-promote to Phase A.
4. **`--out-dir` default** — Change default output dir from `./mend-output` to the report file's directory.

---

# Plan

## 1. Nested parent-scoped overrides

### Key constraint
No `@version` selectors in override keys (CLAUDE.md rule — unreliable across npm versions). A plain package name key (`"minimatch"`) covers ALL versions of that package in the tree. Therefore, nested overrides are only safe when each parent exclusively consumes ONE major version of the conflicted dep.

If `minimatch@3` requires `brace-expansion@1.x` AND `minimatch@5` requires `brace-expansion@2.x`, the key `"minimatch"` covers both — we can't safely nest. Those items stay Phase C.

### Algorithm (new function `promoteMultiMajorToPhaseB` in `src/phases.js`)

Called at the end of `applyPhases` when `depTree` is present.

1. Collect all Phase C items where `upgradeType === 'SAFE'` — these are multi-major conflict items.
2. Group by `libraryName` — items with the same name form a conflict group.
3. For each group, partition the dep tree entries by their `semver.major(resolvedVersion)`.
4. For each major-version partition, collect the set of unique parent **names** (just names, not versions — we can't use version selectors).
5. Check for name overlap between any two partitions. If any name appears in both → **stay Phase C**.
6. If no overlap → **generate nested overrides** and promote all items in the group to Phase B:
   ```json
   { "glob": { "brace-expansion": "1.1.18" }, "minimatch": { "brace-expansion": "2.1.4" } }
   ```
7. Safety fallback: if a partition has zero parents in the dep tree (package missing from tree) → stay Phase C.

Store the generated map as `item.nestedOverrides` on each promoted item. All items in the same conflict group carry the same map (deduplication happens in `buildPhaseBOverrides`).

### `src/overrides.js` — update `buildPhaseBOverrides`

Current: only builds flat `{ "pkg": "version" }` map.

New: for items with `item.nestedOverrides`, deep-merge into result. Flat items still produce flat entries. Both coexist in the returned overrides object since npm supports mixed flat + nested natively.

```js
// Merge nested overrides (multiple items in same group → same map, merge is idempotent)
for (const [parent, deps] of Object.entries(item.nestedOverrides)) {
  if (!result[parent]) result[parent] = {};
  Object.assign(result[parent], deps);
}
```

### Justification text for promoted items

```
Multi-major conflict (1.x and 2.x). Nested parent-scoped overrides generated — 
glob → 1.1.18, minimatch → 2.1.4. Review parent version assumptions before applying.
```

---

## 2. Dependency chain display

### New function in `src/lock-parser.js`

`findDepChain(libraryName, depTree, rootDeps)` — BFS from the vulnerable package up through parents until a root dep is reached.

```
start: [all entries of libraryName]
queue: [{ name: parentName, path: [libraryName, parentName] }]
visited: Set

For each queue item:
  if name is in rootDeps → return path (reversed: root→...→libraryName)
  else: add its parents to queue (from depTree.get(name)[].parents)
  depth limit: 10 hops (prevents runaway on circular deps)
```

Returns an array of package names, root-first: `["webpack", "enhanced-resolve", "fast-uri"]`. Returns `[]` if no path found (package not reachable from root deps via dep tree).

### Where it surfaces

In `mend-fix.js` `buildPhaseCDoc` and `src/report.js` Phase C section:
- After computing `rootParents` (already done), call `findDepChain` for Phase C items
- Store as `item.depChain`
- Display in Phase C review: `Dependency chain: webpack → enhanced-resolve → fast-uri`
- Only shown when dep tree is available

---

## 3. Phase B → Phase A promotion

In `applyPhases` (`src/phases.js`), after initial classification, add a promotion check for Phase B items:

```js
// Phase B items from classifyPhase are "same-major multiple instances"
// (not range-violation downgrades from A — those carry item.rangeViolation)
if (depTree && phase === 'B' && !extra.rangeViolation && item.recommendedVersion) {
  const violation = findRangeViolation(item.libraryName, item.recommendedVersion, depTree);
  if (!violation) {
    phase = 'A';
    justification = `Multiple ${libraryName} instances verified: all consumer ranges satisfy ` +
      `${item.recommendedVersion}. Promoted to Phase A. ${buildJustification(item, 'A', resolutionPlan)}`;
  }
}
```

Note: `extra.rangeViolation` is set before this check (in the Phase A → B downgrade path). The `if (!extra.rangeViolation)` guard ensures we only promote items that were Phase B from the start (multi-instance same-major), never items we just downgraded.

---

## 4. `--out-dir` default

In `mend-fix.js` main function, change:
```js
const outDir = args['out-dir'] || './mend-output';
```
to:
```js
const outDir = args['out-dir'] || path.join(path.dirname(path.resolve(reportFile)), 'mend-output');
```

This puts output next to the report file rather than the working directory.

---

# Files to modify

| File | Change |
|------|--------|
| `src/phases.js` | Add `promoteMultiMajorToPhaseB(items, depTree)` called at end of `applyPhases`; add Phase B → A promotion logic |
| `src/overrides.js` | Update `buildPhaseBOverrides` to handle `item.nestedOverrides` |
| `src/lock-parser.js` | Add `findDepChain(libraryName, depTree, rootDeps)` export |
| `src/report.js` | Surface `depChain` in Phase C section |
| `mend-fix.js` | Compute `item.depChain` for Phase C items after phase classification; update `buildPhaseCDoc`; fix `--out-dir` default |

`src/semver-engine.js`, `src/npm-registry.js`, `src/parser.js` — no changes.

---

# Verification

**Baseline must be unchanged (no lock file):**
```bash
node mend-fix.js --report GH_ui-platform_dev-vulnerability-report.json --dry-run
```
Expected: Phase A: 5, Phase B: 0, Phase C: 3 — identical to today.

**With lock file — nested overrides (brace-expansion case):**
```bash
node mend-fix.js --report GH_ui-platform_dev-vulnerability-report.json \
  --lock-file /path/to/ui-platform/package-lock.json --dry-run
```
Expected changes vs. no lock file:
- If `brace-expansion` 1.x and 2.x parents are disjoint → brace-expansion moves Phase C → Phase B with nested overrides in `phase-b-overrides.json`
- If parents overlap (e.g., `minimatch` appears in both chains) → stays Phase C (correct conservative behavior)

**Phase B → Phase A promotion:**
- Any Phase B item whose consumers all have compatible ranges → auto-promoted to Phase A (shown in output with "Promoted" justification)

**`--out-dir` default:**
- Run with `--report /some/other/dir/report.json` (no `--out-dir`)
- Output should appear in `/some/other/dir/mend-output/`, not `./mend-output`
