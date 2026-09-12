# E6 — Membership Funds, Pool Funds & Event Collections

**Status:** Implemented / source-gated

E6 adds a generic network fund ledger without deleting or replacing the older Family Community or Housing finance tables.

## What changed

- `network_funds` represents membership, general/pool, event, donation, reserve and other funds.
- `network_fund_transactions` records collections, expenses, refunds, transfers and adjustments with generated receipt numbers.
- Family Community membership collections can be linked to a family + membership year; the existing annual membership record is synchronized automatically.
- Event funds can link directly to a network event/activity and carry a target amount.
- Treasurer and President responsibility roles receive routed notifications for meaningful money movement.
- A family/member linked to a collection or refund receives a personal deep-linked notification when an account mapping exists.
- Member visibility follows the existing Family Community finance visibility policy (`admins`, `members`, `highlighted`).
- A dedicated `Funds & Collections` surface is added to Family Community navigation; all pre-E6 surfaces remain intact.

## Database

Migration: `108_engagement_funds_collections.sql`

Apply only after E1–E5 migrations 103–107.

## Safety

The new finance tables have RLS enabled and direct anon/authenticated table access revoked. Mutations are through network-admin RPCs and every transaction is written to `audit_log`.
