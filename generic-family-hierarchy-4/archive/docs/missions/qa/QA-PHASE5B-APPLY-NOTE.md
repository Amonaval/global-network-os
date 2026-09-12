# Phase 5B Apply Note

Apply this patch after Phase 5A. No migration SQL is added by this patch. Do not run the replay command until a disposable empty Supabase project is ready. The source inventory may initially fail on historical migration collisions or quarantined 096/097 files; that is an intentional release blocker, not a reason to weaken the gate.

Recommended verification order later:
1. `npm run qa:phase5b:local`
2. `npm run qa:phase5b:inventory`
3. configure the disposable project variables
4. `npm run qa:phase5b:replay` exactly once
5. `npm run qa:certify:phase5b`
