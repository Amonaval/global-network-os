# QA env authority fix

Apply these files over the repository root.

## Why
`.env.qa` is the dedicated QA configuration and must override stale/inherited `QA_*` process variables. Previously a shell variable such as `QA_MODE=readonly` could silently win over `.env.qa` and block `qa:seed`.

## Changes
- `.env.qa` now overrides already-present process values for the QA process.
- generated fixture env still fills only blank values.
- mutation guard errors show the resolved mode/flag and `.env.qa` path, never secrets.
- regression test added.
