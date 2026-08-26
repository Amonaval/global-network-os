# Fix: setup:local missing `npm run` prefix

## What I missed

I removed `npm run postinstall:sync:datamodelservice-client` from `setup` — that was wrong.
The user correctly restored it. The `setup` script is now correct:

```
"setup": "npm i --ignore-scripts && node scripts/fetch-internal.js && npm run format:package-lock && npm run postinstall:sync:datamodelservice-client"
```

## One bug remaining in user's fix

`setup:local` currently reads:

```
"setup:local": "setup:no-client && npm run build:libs"
```

`setup:no-client` without `npm run` is a bare shell command — it will fail with
"command not found" on every platform. npm scripts cannot invoke sibling scripts
without the `npm run` prefix.

**Fix — one character change:**

```
"setup:local": "npm run setup:no-client && npm run build:libs"
```

## File to edit

`package.json` — scripts section, `setup:local` key only.
