# Plan: Fix VS Code Extension — Compile Errors + F5 Launch

## Context
Two problems blocking development of the Knowledge Hub VS Code extension:

1. `npm run compile` fails with TS2304 errors on `@types/react-dom` from the *parent* project's `node_modules`. TypeScript walks up the directory tree and finds the parent project's `node_modules/@types/react-dom`, which uses DOM lib types (`ReferrerPolicy`, `RequestDestination`) not included in our `tsconfig.json` lib. Fix: `skipLibCheck: true`.

2. F5 in VS Code opens a Node.js debugger dropdown and runs `out/extension.js` directly with `node.exe`, which fails with `Cannot find module 'vscode'` because the `vscode` module only exists inside the VS Code Extension Host process — not plain Node. Fix: create `.vscode/launch.json` with type `"extensionHost"` so F5 launches an Extension Development Host instead.

## Files to Create/Modify

### 1. `vscode-extension/tsconfig.json` — add `skipLibCheck: true`
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "out",
    "rootDir": "src",
    "lib": ["ES2020"],
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", ".vscode-test"]
}
```

### 2. `vscode-extension/.vscode/launch.json` — create new
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": ["--extensionDevelopmentPath=${workspaceFolder}"],
      "outFiles": ["${workspaceFolder}/out/**/*.js"],
      "preLaunchTask": "${defaultBuildTask}"
    }
  ]
}
```
The `type: "extensionHost"` is what tells VS Code to open a new Extension Development Host window instead of running Node directly. `--extensionDevelopmentPath` tells the host where to load the extension from.

### 3. `vscode-extension/.vscode/tasks.json` — create new
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "watch",
      "problemMatcher": "$tsc-watch",
      "isBackground": true,
      "presentation": { "reveal": "never" },
      "group": { "kind": "build", "isDefault": true }
    }
  ]
}
```
This wires `${defaultBuildTask}` in `launch.json` to `npm run watch`, which runs `tsc -watch` so the extension auto-recompiles on every save during development.

## Result After Fix
```
vscode-extension/
├── .vscode/
│   ├── launch.json    ← new
│   └── tasks.json     ← new
├── src/
│   └── extension.ts
├── out/               ← created by tsc
│   └── extension.js
├── package.json
└── tsconfig.json      ← skipLibCheck added
```

`npm run compile` → clean.  
F5 (with `vscode-extension/` open as workspace) → Extension Development Host window opens → book icon appears in Activity Bar.

## Verification
1. `npm run compile` completes with no errors
2. F5 opens a second VS Code window titled `[Extension Development Host]`
3. Book icon visible in the new window's Activity Bar
4. Click it → Knowledge Hub sidebar opens
5. (Requires Knowledge Hub server running on localhost:3000)
