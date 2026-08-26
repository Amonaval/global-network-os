# Plan: Fix Phase A classification — transitive consumer check + output format

## Context

The current `detectDirectDeps` function decides whether a package goes into `overrides` or `dependencies` by checking if it is listed in the target `package.json` `dependencies`/`devDependencies`. This is the wrong signal.

The correct signal is: **does the package have transitive consumers in the dep tree?**

- **axios** → no other package in `package-lock.json` requires it. It is the root's direct dep only. No override needed — just bump `dependencies.axios`.
- **fast-uri, postcss, etc.** → required by non-root packages (webpack, ajv, …). An override is needed to force the fixed version for all transitive consumers. Even if fast-uri also appears in `package.json` `dependencies`, it still needs an override for the transitive copies.

The `lock-parser.js` data already gives us this information: the second pass in `parseLockFile` only registers parents from **non-root** packages (root is skipped with `if (pkgPath === '') continue`). So `entry.parents.length === 0` means the package is only ever a direct dep of the root — no transitive consumers.

Current bug result: fast-uri and unzipper (which ARE in ui-platform's `package.json` deps AND have transitive consumers) were incorrectly classified as `directUpgrades` and stripped from the overrides output. Only 2 of 5 Phase A items appeared in `phase-a-overrides.json`.

Expected `phase-a-overrides.json`:
```json
{
  "_comment": "Phase A: High confidence (95-100%). Same-major patch/minor. Safe to apply.",
  "_confidence": "95-100%",
  "dependencies": { "axios": "1.18.0" },
  "overrides": {
    "fast-uri": "3.1.5",
    "socket.io-parser": "4.2.7",
    "postcss": "8.5.23",
    "unzipper": "0.12.5"
  }
}
```

---

## Change 1 — Fix classification logic in `src/overrides.js`

### `_buildNewRange` — restore range prefix preservation

Revert the recent change that always returns an exact version. The JSON output file uses `recommendedVersion` (exact) directly; `newRange` is only used when mutating the actual `package.json` file, where we want to preserve `^`/`~`.

```javascript
function _buildNewRange(currentRange, fixVersion) {
  const m = currentRange.match(/^([~^])/);
  return m ? `${m[1]}${fixVersion}` : fixVersion;
}
```

### `detectDirectDeps` — add `depTree` parameter, use transitive consumer check

New signature: `detectDirectDeps(phaseAItems, pkg, depTree)`

Classification order:
1. If `depTree` available: check if the package has ANY entry with `parents.length > 0`
   - YES (has transitive consumers) → `overrideItems` (regardless of whether it's also in `pkg.dependencies`)
   - NO (all entries have `parents.length === 0`) → check if it's in `pkg.dependencies`/`devDependencies` → `directUpgrades`
2. If `depTree` not available: fall back to checking `pkg.dependencies`/`pkg.devDependencies` only

When `pkg` is null/empty (no `--package-json` provided): `directUpgrades` will have no `currentRange`/`newRange` — that is fine because the apply step never runs in that case.

### `writeOverridesPatch` — add `dependencies` section

Add an optional `meta.dependencies` field. When non-empty, write it as a top-level `dependencies` key in the JSON output (before `overrides`). The values in this section are always exact fix versions (`item.recommendedVersion`, not `item.newRange`).

```javascript
function writeOverridesPatch(outputPath, overrides, meta = {}) {
  const out = { _comment: ..., _confidence: ... };
  if (meta.dependencies && Object.keys(meta.dependencies).length > 0) {
    out.dependencies = meta.dependencies;
  }
  if (Object.keys(overrides).length > 0) {
    out.overrides = overrides;
  }
  fs.writeFileSync(outputPath, JSON.stringify(out, null, 2) + '\n');
}
```

---

## Change 2 — Update orchestration in `mend-fix.js`

### Move split earlier, make it fire on `depTree` OR `packageJsonPath`

Currently the split only runs when `packageJsonPath && fs.existsSync(packageJsonPath)`. The split for the JSON output file should run whenever we have `depTree` (even without `--package-json`) since the JSON output should always show the correct sections.

```javascript
let targetPkg = null;
if (packageJsonPath && fs.existsSync(packageJsonPath)) {
  targetPkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
}

if (depTree || targetPkg) {
  const split = detectDirectDeps(phaseA, targetPkg || {}, depTree);
  directUpgrades     = split.directUpgrades;
  phaseAForOverrides = split.overrideItems;
  // log direct dep reclassifications
}
```

### Pass `directUpgrades` to `writeOverridesPatch`

```javascript
const phaseADependencies = {};
for (const u of directUpgrades) {
  phaseADependencies[u.libraryName] = u.recommendedVersion; // exact, not newRange
}

writeOverridesPatch(phaseAPath, phaseAOverrides, {
  comment: '...',
  confidence: '95-100%',
  dependencies: phaseADependencies,
});
```

### Safety filter update

The existing safety filter (removes from `cleanOverrides` anything in direct deps) is still correct — it prevents a package that was correctly classified as `directUpgrade` from also ending up in overrides. No change needed here, but it now acts as a second line of defense.

---

## Files modified

| File | Change |
|---|---|
| `src/overrides.js` | `_buildNewRange` prefix restore; `detectDirectDeps` new param + transitive consumer logic; `writeOverridesPatch` `dependencies` section |
| `mend-fix.js` | Move split earlier; fire on `depTree` OR `targetPkg`; pass `directUpgrades` to `writeOverridesPatch` |

`src/npm-registry.js` — no change. Existing upward-search fallback (`>= recommendedVersion`) is the correct behavior.

---

## Verification

```bash
# Standard dry-run — still 5A / 0B / 3C, no regressions
node mend-fix.js --report GH_ui-platform_dev-vulnerability-report.json --dry-run

# With lock file only (no package-json) — should classify correctly, 
# phase-a-overrides.json should show both `dependencies` and `overrides` sections
node mend-fix.js --report GH_ui-platform_dev-vulnerability-report.json \
  --lock-file <path/to/package-lock.json>
# Expect: phase-a-overrides.json has dependencies:{axios:...} and overrides:{fast-uri,...}

# With lock file + package-json — apply path
node mend-fix.js --report ... \
  --lock-file <path/to/package-lock.json> \
  --package-json <path/to/package.json>
# Expect: package.json gets axios bumped in dependencies, others in overrides
```
