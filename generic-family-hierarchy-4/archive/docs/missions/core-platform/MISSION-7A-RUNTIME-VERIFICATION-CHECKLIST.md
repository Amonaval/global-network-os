# M7-A Runtime Verification Checklist

1. Apply `062_m7a_zero_friction_launch_activation.sql`.
2. Run `npm run validate:m7a`, `npm run check:types`, and `npm run build`.
3. Open **My Networks** as a user who owns/administers at least one network.
4. Confirm **Launch Activation** appears and lists only networks the user administers.
5. Pick a sparsely populated network; confirm the next action recommends seeding/inviting/claiming according to real counts.
6. Add/import people or entities and refresh; seeded count should move.
7. Bring another signed-in member into the network and refresh; active participant count should move.
8. Claim/link identities and confirm claimed count moves.
9. If an accepted trusted bridge exists, bridge milestone is complete; otherwise it remains incomplete without forcing creation.
10. If an accepted trusted introduction exists for the network, outcome milestone is complete.
11. Open a network through **Take next step** and confirm existing admin/import/invite UX remains unchanged.
12. Confirm a member who is not Owner/Admin cannot obtain launch snapshots for other networks through the RPC.
