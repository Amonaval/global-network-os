# Plan: Fix copy-webpack-plugin v12 API incompatibility in webpack.config.js

## Context

Build step 12 (`webpack --env production`) fails because `webpack.config.js` uses the **v4/v5 CopyWebpackPlugin API** while `package.json` installs **`copy-webpack-plugin@^12.0.2`** (a v6+ release).

Two breaking changes between v5 → v6+:
1. Constructor signature changed from `new CopyWebpackPlugin([...patterns])` → `new CopyWebpackPlugin({ patterns: [...] })`
2. The `flatten` option was removed. Equivalent for `flatten: true` is updating `to` to use the `[name][ext]` template so files land flat in the destination directory. `flatten: false` (already the default) is just removed.

## File to change

`webpack.config.js` — one file, no other files need touching.

---

## Changes

### 1. Wrap the constructor call (line 263)

```js
// Before
new CopyWebpackPlugin([...polyfills, ...assets]),

// After
new CopyWebpackPlugin({ patterns: [...polyfills, ...assets] }),
```

### 2. Fix `flatten: true` entries — remove property, append `[name][ext]` to `to`

| Array | Lines | `to` (before) | `to` (after) |
|-------|-------|--------------|-------------|
| `polyfills[0]` | 27–30 | `join(OUTPUT_PATH, 'node_modules/@webcomponents/webcomponentsjs/')` | `join(OUTPUT_PATH, 'node_modules/@webcomponents/webcomponentsjs/[name][ext]')` |
| `polyfills[1]` | 32–35 | `join(OUTPUT_PATH, 'node_modules/@webcomponents/webcomponentsjs/', 'bundles')` | `join(OUTPUT_PATH, 'node_modules/@webcomponents/webcomponentsjs/bundles/[name][ext]')` |
| `assets` socketio | 97–99 | `join(OUTPUT_PATH, 'src/elements/bedrock-externalref-socketio/')` | `join(OUTPUT_PATH, 'src/elements/bedrock-externalref-socketio/[name][ext]')` |
| `assets` ag-grid | 125–127 | `join(OUTPUT_PATH, 'node_modules/@ag-grid-community/core/dist/styles/')` | `join(OUTPUT_PATH, 'node_modules/@ag-grid-community/core/dist/styles/[name][ext]')` |
| `assets` vis-network | 130–132 | `join(OUTPUT_PATH, 'node_modules/vis-network/dist/dist/')` | `join(OUTPUT_PATH, 'node_modules/vis-network/dist/dist/[name][ext]')` |
| `assets` flatpickr | 135–137 | `join(OUTPUT_PATH, 'node_modules/flatpickr/dist/flatpickr.css')` | unchanged (single file → `to` is already a filename; just remove `flatten: true`) |
| `assets` underscore | 140–142 | `join(OUTPUT_PATH, 'node_modules/underscore/')` | `join(OUTPUT_PATH, 'node_modules/underscore/[name][ext]')` |
| `assets` serviceworker | 145–147 | `OUTPUT_PATH` | `join(OUTPUT_PATH, '[name][ext]')` |
| `assets` dll | 177–179 | `join(OUTPUT_PATH, '/src/dll/')` | `join(OUTPUT_PATH, '/src/dll/[name][ext]')` |

### 3. Fix `flatten: false` entries — just remove the property (default behavior)

Lines 94, 104, 109, 122, 152 — remove `flatten: false` from these five pattern objects.

---

## Verification

After applying changes, run:
```bash
npm run build-step12-prod-compile-webpack-build
```

The webpack process should start without the `[webpack-cli] Invalid options object` error and proceed to bundle normally. If DLL manifest files are missing in the environment, those errors are separate from this fix.
