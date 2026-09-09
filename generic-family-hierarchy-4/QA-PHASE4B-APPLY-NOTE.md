# Phase-4B apply note

Apply the affected files over the current Phase-4A-certified source tree. This patch contains no SQL or migration files and does not alter the frozen Phase-3 Storage/RLS investigation.

Run in order:

```bash
npm run qa:phase4b:local
npm run qa:phase4b:browser
```

Only after both are green:

```bash
npm run qa:certify:phase4b
```

Do not run or reapply experimental migrations 096/097 as part of this mission.
