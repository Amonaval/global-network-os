# XP-3 Runtime Verification Checklist

Apply migration `092_xp3_quick_start_activation.sql`, then for every released vertical:
- create/open a new sparse network as Owner;
- verify Quick Start appears only for admin roles;
- execute every action and confirm it opens a real working destination;
- complete a task and confirm progress updates;
- dismiss, navigate/reload, confirm minimized state persists, then Resume;
- sign in as Member and confirm admin Quick Start is hidden;
- verify progress is isolated between two networks and two users;
- verify Family's mature Quick Family Start is unchanged.
