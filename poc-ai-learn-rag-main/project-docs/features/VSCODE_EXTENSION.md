# VS Code Extension v1

**Status:** Shipped (local testing verified; `vsce publish` deferred to user decision)  
**Priority:** P1 (Distribution — First External Integration)  
**Date:** 2026-08-05

---

## Problem

Knowledge Hub was only accessible through a browser. Engineers spend most of their time in VS Code — they have to alt-tab to the app, ask a question, read the answer, alt-tab back. Every context switch reduces usage. Lower usage means slower intelligence accumulation, which weakens the IDS moat. Frictionless access from inside the editor was the highest-leverage distribution move after the pricing page.

## Solution

A VS Code sidebar extension that connects to any running Knowledge Hub server and exposes a chat panel directly inside the editor. Zero auth, zero configuration beyond a server URL.

### Architecture

```
VS Code Extension Host (Node.js process)
  ├── KnowledgeHubViewProvider — registers sidebar WebviewPanel
  ├── _handleAsk() — HTTP POST to /api/chat (via Node built-in http/https)
  └── Commands:
       ├── knowledgehub.openChat — focus the sidebar panel
       └── knowledgehub.askSelection — send selected text as question

WebviewPanel (sandboxed Chromium iframe)
  ├── postMessage IPC ← Extension Host
  │     types: 'thinking' | 'answer' | 'error' | 'prefill'
  └── postMessage IPC → Extension Host
        types: 'ask' | 'openSettings'
```

Key architectural decisions:

- **Zero runtime npm dependencies** — uses Node's built-in `http`/`https` modules. No `node_modules` shipped in the `.vsix`, which keeps the package tiny and removes supply-chain risk.
- **120-second timeout** — local Ollama on CPU typically takes 20–90 seconds per response. The previous default (30s from earlier attempts) caused "Could not reach Knowledge Hub" errors on legitimate queries. Raised to `REQUEST_TIMEOUT_MS = 120_000`.
- **Error differentiation** — three distinct error states:
  - `timeout`: Ollama took > 120s → yellow warning with `ollama list` suggestion
  - `refused`: ECONNREFUSED → red error with server startup instructions
  - `unknown`: any other error → red error with server URL change link
- **Live elapsed timer** — while waiting, the panel shows `0s → 1s → 2s…`; at 15 seconds, switches to `15s (Ollama is working…)` so users know the extension is waiting, not frozen.
- **Session ID** — `'vscode-' + Date.now().toString(36)`, persists for the VS Code session lifetime. All queries from this session appear as one conversation in the server's session history.

## Files Created

```
vscode-extension/
├── package.json          — extension manifest: contributes sidebar view, commands, settings
├── tsconfig.json         — CommonJS, ES2020, skipLibCheck: true
├── src/
│   └── extension.ts      — full extension: KnowledgeHubViewProvider + webview HTML
└── .vscode/
    ├── launch.json       — F5 → Extension Development Host (type: extensionHost)
    └── tasks.json        — wires npm run watch as default build task for F5
```

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `knowledgehub.serverUrl` | `http://localhost:3000` | URL of the running Knowledge Hub server |
| `knowledgehub.defaultSection` | `""` | Pre-select a section for all queries |

## Commands

| Command | Trigger | Action |
|---------|---------|--------|
| `knowledgehub.openChat` | Activity bar book icon | Focus the KH sidebar panel |
| `knowledgehub.askSelection` | Right-click → "Ask Knowledge Hub" | Send selected text as question |

## Known Issues Fixed During Build

### TypeScript compile error: `Cannot find name 'ReferrerPolicy'`
TypeScript walked up directories and found the parent project's `node_modules/@types/react-dom`, which uses DOM lib types not declared in the extension's `tsconfig.json`.  
**Fix:** `"skipLibCheck": true` in `vscode-extension/tsconfig.json`.

### F5 opened Node.js debugger instead of Extension Development Host
No `.vscode/launch.json` existed in the extension directory — VS Code defaulted to a Node.js debug config and ran `out/extension.js` directly with `node.exe`. The `vscode` module only exists inside Extension Host; plain Node can't load it.  
**Fix:** Created `.vscode/launch.json` with `"type": "extensionHost"` and `.vscode/tasks.json` wiring `npm run watch` as the default build task.

## How to Test Locally

1. Open `vscode-extension/` as the root workspace in VS Code (File → Open Folder)
2. `npm install` (first time only)
3. Press **F5** — a second VS Code window opens titled `[Extension Development Host]`
4. In the new window, click the book icon in the Activity Bar
5. Ensure Knowledge Hub server is running: `npm run server`
6. Type a question → answer streams back

## How to Package and Install

```bash
cd vscode-extension
npm install -g @vscode/vsce   # one-time
vsce package                   # produces knowledge-hub-0.0.1.vsix
code --install-extension knowledge-hub-0.0.1.vsix
```

## Publishing to Marketplace

Deliberately deferred. Steps when ready:
1. Create publisher at [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage)
2. `vsce login <publisher-name>`
3. `vsce publish`

Users install via `ext install <publisher>.knowledge-hub`.

---

## Mission Completion Assessment

**Did we solve the right problem?**  
Yes. The alt-tab problem is real — every tool that reduces the distance between "I have a question" and "I have an answer" increases usage frequency. Higher usage frequency directly drives IDS compound growth, which is the moat. The VS Code extension is the highest-leverage single integration for engineering teams.

**Is there a more transformative opportunity?**  
JetBrains IDE support (IntelliJ, WebStorm, GoLand) covers a significant share of the backend/full-stack engineer market that VS Code doesn't. The architecture is the same — a sidebar panel making HTTP calls to the local server — but JetBrains uses a different plugin SDK. Worth building after VS Code proves demand.

**Should the roadmap change?**  
`vsce publish` should be triggered as soon as there's a paying customer or a prospect who asks for it. Publishing now (no users) creates maintenance overhead for zero return. The right trigger is "first customer wants to install it from the Marketplace."

**What is the highest ROI next step?**  
Get a real engineering team to use the VS Code extension for 30 days. The extension ensures queries fire from inside their natural workflow rather than a tab they have to remember to open — this is the difference between IDS growing passively vs. requiring deliberate effort. One active team using the extension will generate more intelligence signal in a month than a solo user generates in a year.
