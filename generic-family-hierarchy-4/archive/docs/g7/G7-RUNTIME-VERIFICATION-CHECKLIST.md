# G7 — Very Short Runtime Verification

Apply `047_g7_generic_network_os.sql` **after 046**.

1. Open an existing **Family Network** and glance at Home → Family/Tree → one normal feature. Nothing should feel changed.
2. Open an **Alumni Network → Explore**. Switch between:
   - Program → Batch → Stream
   - Batch → Program → Stream
   Confirm the same alumni appear under the different hierarchy orders.
3. Open **Community**:
   - admin: create one event or announcement;
   - member/admin: add one memory or milestone;
   - RSVP once to an event;
   - join/leave one group if a group exists.
4. Open **Places** and confirm city counts drill into Directory.
5. Switch **Alumni → Family → Alumni**, reload once, and glance at console for unknown-feature, tenant or RPC errors.

That is sufficient manual smoke for G7 unless an automated gate/build fails.
