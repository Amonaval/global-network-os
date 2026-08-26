# Pending Change — setup:no-client script

## What to add

One line in `package.json` scripts, after `"install:syndigointernal"`:

```json
"setup:no-client": "npm run setup && npm run install:syndigointernal",
```

## Why this works

| Mode | Command | 7 ui-platform repos | @syndigointernal |
|---|---|---|---|
| Build | `npm i --legacy-peer-deps` | npm installs (from optionalDeps) | npm installs (needs token) |
| Local dev | `npm run setup` / `setup:full` | fetch-internal (fast, shallow) | ✗ skipped |
| Local dev + client | `npm run setup:no-client` | fetch-internal (fast, shallow) | ✓ installed |

`setup:no-client` = `setup` (which uses `--omit=optional` + fetch-internal) + `install:syndigointernal` appended.  
No new mechanism — just composing two existing scripts. Requires `EDS_BUILD_TOKEN` for the second step.

## File to edit

`package.json` line 90 — insert after `"install:syndigointernal"`:
```
"setup:no-client": "npm run setup && npm run install:syndigointernal",
```

---

# Demo Plan — PR #14909: Fast Install for ui-platform
**Session length:** 30–45 min  
**Format:** Live walkthrough + hands-on (everyone runs it simultaneously)  
**Artifact:** https://claude.ai/code/artifact/54316a22-02e9-44f8-afe6-3cef48a396e8

---

## The session's secret weapon

`npm run setup` takes 15–30 minutes on a first run. **That is not dead time — that is demo time.**

The structure of this session is built around that window:
1. Get everyone to kick off `npm run setup` together as early as possible.
2. Use the wait to explain the why, the how, and the files.
3. By the time the explanation is done, so is the install. Everyone finishes together.

---

## Pre-demo checklist (do this the night before)

- [ ] Run `npm run setup` on YOUR machine so you have the incremental (fast) path ready
- [ ] Open the artifact in a browser tab — keep it on the projector as a visual anchor
- [ ] Confirm everyone is on the `packages-optimize` branch (or has the PR merged)
- [ ] Ask attendees to pre-authenticate GitHub: `git ls-remote https://github.com/riversandtechnologies/ui-platform-utils` — this avoids auth surprises on the day
- [ ] Know the Node version requirement: Node >= 16.7 (for `fs.cpSync`)
- [ ] Have this fallback ready: if lockfile is stale → `npm install --package-lock-only --ignore-scripts`

---

## Demoable points (ranked by impact)

| # | What to show | Why it lands |
|---|---|---|
| 1 | `git log --oneline package.json` → the 7 git URLs being removed | Visual proof of what changed |
| 2 | `npm run setup` output live in terminal | The actual speedup, in real-time |
| 3 | `npm run sync:internal` on second run | Seconds vs minutes — contrast is dramatic |
| 4 | `internal-repos.json` — one line to change a release | "That's it? That's the whole migration?" |
| 5 | `npm run hoist-deps` check | Shows it's maintainable, not a one-time trick |
| 6 | `cat node_modules/ui-platform-utils/package.json` | Proves the code is really there, no tricks |
| 7 | `ls node_modules/ui-platform-utils/node_modules` | Empty — borrows from parent. Minds blown. |
| 8 | Local dev mode | Clone sibling → sync picks it up automatically |

---

## Script — minute by minute

---

### T+0:00 — Hook (3 min)

**Say:**
> "Quick show of hands — how long does `npm i` take in this repo for you right now? Raise your hand if it's more than 30 minutes."
> _(pause for hands)_
> "More than an hour?"
> _(pause)_
> "We've all been there. Today that stops. Let me show you exactly why it was slow, and what we did about it."

**Then:**
```bash
git log --oneline package.json | head -10
```
Show the commit that removed the git URLs. Open the PR diff or show it in VS Code: the 7 lines that used to look like this were removed:
```
"ui-platform-business-elements": "https://github.com/.../ui-platform-business-elements#release-2026-r5"
```

**Say:**
> "These seven lines. That's the root cause. Everything else we did today flows from fixing this one design choice."

---

### T+3:00 — Show what changed (3 min)

**Say:**
> "Here's what `package.json` looks like now — open it and search for `ui-platform`. You'll find nothing. They're gone."

Show:
1. `package.json` — no `ui-platform-*` entries
2. `sync-repos/internal-repos.json` — the 7 repos listed, one `branch` field

**Say:**
> "This one file is what `package.json` used to do for those 7 repos. And the only thing you'll ever change here is this `branch` line when we move to a new release."

**Say:**
> "Alright — let's get your installs started. I want everyone running this at the same time, because we're going to use the next 20 minutes while it runs to understand exactly what's happening."

---

### T+6:00 — Fire it up (1 min)

**Everyone runs:**
```bash
git checkout packages-optimize   # or your PR branch
npm run setup:full
```

**Or if they want to watch steps separately:**
```bash
npm run setup      # deps + fetch internal
npm run build:libs # compile internal repos
```

**Tip:** Tell them to watch the terminal output as it runs — point out:
- The `npm ci` line: "fast, from lockfile"
- Then: `🔄 Fetching 7 internal riversand repo(s) into node_modules...`
- Each `📦 ui-platform-*` line with `⤓ clone` or `⤓ fetch (incremental)`

---

### T+7:00 — Explain while it runs (~20 min)

**Pull up the artifact on the projector.** Walk through it section by section.

#### Part A: Why it was slow (5 min)

Walk through the **three causes** in the artifact.

**Key thing to say about cause #2 (nested diamonds):**
> "npm has to walk into every git dependency and resolve *its* git dependencies too. So `ui-platform-utils` ends up being cloned three or four times in a single `npm i`. And each clone waits for GitHub to respond. Stack those waits across 20+ git operations and you have your 1-2 hour install."

Show the Before architecture diagram. Click the toggle to Before. Let it sink in.

#### Part B: The fix (5 min)

Click the toggle to After. 

**Say:**
> "The key insight was: our code changes every sprint, but our *dependencies* — the third-party libraries those repos use — barely change. So we split them. npm handles the stable stuff. One tiny script handles our code."

Walk through:
- Track 1: `npm ci` — fast, lockfile-based, no git
- Track 2: `fetch-internal.js` — shallow clones, runs after npm

**Say:**
> "Shallow clone means no history. `--depth 1`. The whole `ui-platform-elements` repo is maybe 50MB of actual source code. We used to pull it as a nested transitive dependency with full history, multiple times."

#### Part C: The scripts (7 min)

Open the tabs in the artifact one by one.

**fetch-internal.js tab:**
> "Two modes, auto-detected. If you have a sibling checkout of a repo sitting next to ui-platform, it copies from that. Perfect for when you're actively working on ui-platform-elements and want to see your changes in context. Otherwise, shallow git clone. First run is a clone; every run after that is an incremental fetch — seconds."

**hoist-deps.js tab:**
> "Here's the question you're probably asking: if those repos aren't in npm's dependency tree, who makes sure their third-party dependencies are still installed? This script. It reads every child repo's package.json, finds anything they need that the parent doesn't declare, and either reports it or writes it in. Run it in CI and you get an early warning if any child adds a package that would break the build."

**internal-repos.json tab:**
> "This is it. This is the whole migration path for a new release line. Change `release-2026-r6` to `release-2026-r7`, run `npm run sync:internal`. Done. The old model had the branch name buried in 7 places in package.json. Now it's one."

**.npmrc tab:**
> "Four flags that used to be tribal knowledge. Legacy-peer-deps was in the README, had to be passed manually. Now it's baked in. The `allow-git=all` flag is forward-compat for npm v12, which ships around July 2026 and would have broken the 6 remaining GitHub-sourced packages — google-chart, iron-list, falcor. We'd have found that out at the worst possible time in a CI pipeline."

#### Part D: Check in on installs (3 min)

**Say:**
> "Let's see how everyone's getting on — who's past the fetch phase and into build:libs?"

This is your moment to field questions. Common things people will ask:
- *"Why not just npm link?"* → npm link requires running `npm install` in each repo first; it doesn't solve the initial install problem.
- *"What about postinstall hooks?"* → `--ignore-scripts` skips them. `build:libs` is the explicit replacement. We chose explicit over magic.
- *"What if I'm offline?"* → `prefer-offline=true` in .npmrc means the cache is tried first. For the git fetch, you need connectivity once; after that `sync:internal` only runs when you ask it to.

---

### T+27:00 — The incremental demo (5 min)

**This is the crowd-pleaser.** You already have your install done from yesterday.

**Say:**
> "Watch what the same command looks like the second time."

```bash
npm run sync:internal
```

It should complete in 5–15 seconds. Point at the `⤓ fetch (incremental)` lines.

**Say:**
> "That's `git fetch --depth 1` + reset. No cloning. Just pulling what changed on the branch since last time. This is now your daily command — not `npm i`."

**Contrast:**
| Scenario | Before | After |
|---|---|---|
| First install | 1–2 hr | ~15–30 min |
| Subsequent update | 1–2 hr (full reinstall) | ~10–30 sec (incremental) |
| Release branch change | 1–2 hr + update 7 URLs | 1 line change + 10 sec |

---

### T+32:00 — Hoist-deps live check (3 min)

```bash
npm run hoist-deps
```

**If it's clean (most likely):**
> "Green. All child dependencies are hoisted. Now I'll show you what it looks like when there's drift..."

Optionally: temporarily add a fake dependency to `node_modules/ui-platform-utils/package.json`, re-run, show it detecting it, restore the file.

**Or just say:**
> "When a child repo adds a new npm package and it's not in our parent package.json, this exits with code 1. In CI, that fails the pipeline before anyone hits a runtime `Cannot find module` error. `--write` adds it automatically."

---

### T+35:00 — Prove it works (5 min)

If `setup:full` has finished for everyone:

```bash
npm run dev
```

Watch the server start. If it comes up, the demo is done.

**Say:**
> "Same dev server. Same command. Everything downstream is unchanged — build steps, DLL builds, webpack config, the 13-step prod pipeline — all of it works exactly the same. The only thing that changed is how the internal repos get into node_modules."

---

### T+40:00 — Tips & Q&A (5 min)

Walk through the day-to-day recipe table in the artifact.

**Leave them with these three lines:**
> "npm manages the boring, stable stuff — third-party libraries, registry, cached.  
> fetch-internal manages the fast-changing stuff — our 7 repos, shallow git, incremental.  
> hoist-deps is the bridge — keeps the first list complete as the second evolves.  
> That's the whole trick. Everything else is plumbing."

---

## Tips to keep the demo alive

### If someone's install is stuck or errored

**EDEP / lockfile mismatch:**
```bash
npm install --package-lock-only --ignore-scripts
npm run setup
```

**GitHub auth failure:**
```bash
git ls-remote https://github.com/riversandtechnologies/ui-platform-utils
# If this fails → SSH key or credential helper needed
```

**`node_modules not found` error:**
> "`npm run sync:internal` requires that `npm ci` has already run. The `setup` command does both in order. Run `npm run setup` to start fresh."

**`Cannot find module 'some-lib'`:**
> "This is a hoisting gap. The child repo uses a package the parent doesn't declare yet. Run `npm run hoist-deps:write` then `npm install --package-lock-only --ignore-scripts`."

**Someone on Node < 16:**
> "We need Node 16.7+ for `fs.cpSync`. Check `node --version`. If you're below that, update Node first."

---

### If the install finishes faster than expected

Jump straight to the incremental demo (`npm run sync:internal`) and show the speed contrast early. Then use remaining time for the hoist-deps live check.

### If the install is taking longer than expected

That's fine — more time to go deeper. Show the actual `fetch-internal.js` source in the editor. Walk through the `findLocalCheckout` function. Explain how Node resolves `require()` up the tree (no per-repo `node_modules` needed — the parent's covers everything).

**The "borrow" thing is worth 3 minutes:**
```bash
ls node_modules/ui-platform-utils/node_modules   # empty (or doesn't exist)
ls node_modules/underscore                        # it's here, at the root
```
> "The child repo's code calls `require('underscore')`. Node walks up the directory tree looking for it. Finds it in the root `node_modules`. This is how npm de-duplication has always worked — we just removed the step where npm had to install the child first."

### If someone asks "why not use npm workspaces / pnpm?"

> "Valid question. Workspaces still run npm's resolver on each package — we'd still have the git dep resolution problem. pnpm would help but requires adopting a new tool across 7 repos simultaneously. This approach works with the existing toolchain, zero changes to the child repos."

### If someone asks "what happens when npm i is run raw by mistake?"

> "npm prunes anything not in the dependency tree on install — and the internal repos aren't in it. So `npm i` (without `--ignore-scripts`) would remove them from `node_modules`. That's why `setup` always runs `fetch-internal.js` as the second step, after the install. The fix is: always use `npm run setup` instead of raw `npm i`. We could add a `prepare` hook as a safety net, but the explicit command is clearer."

---

## The one-slide summary (if you need slides)

```
BEFORE                          AFTER
──────────────────────          ──────────────────────────────
npm i                           npm run setup
  → resolves 7 git repos          → npm ci (stable deps, fast)
     → each nested git dep         → fetch-internal.js
        → full history clone          → 7 shallow clones
        → github round-trip           → no resolution
        → duplicate clones            → incremental on re-run

1–2 hours. Flaky.              ~15–30 min. Reliable.
                               ~10 sec on subsequent runs.
```

---

## The artifact link

Keep this open on the projector throughout:
https://claude.ai/code/artifact/54316a22-02e9-44f8-afe6-3cef48a396e8

It has the Before/After toggle, all four files with annotated code, and the commands table. Use it as the visual anchor while the installs run.
