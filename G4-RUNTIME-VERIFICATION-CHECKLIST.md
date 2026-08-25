# G4 Runtime Verification — Short Smoke

G4 has no migration and no intended Family UX change. Do not run a full manual regression solely for this composition refactor.

1. Open an existing Family: Home → Family → Find family should look/navigation exactly as before.
2. Open Explore & Guide from one normal screen and use one **Open this feature** action.
3. Enter Playground once and confirm Sample Family is read-only and starts normally.
4. Platform Owner: open Launch Control and toggle one already-backend-ready Playground feature OFF → ON.
5. Reload once; glance at console for `Vertical ... not user-visible`, unknown-surface/feature, or missing-export errors.

If these work, treat the deployed G4 smoke as sufficient unless another regression is observed.
