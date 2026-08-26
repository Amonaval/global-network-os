# ADR-014 — Redis for Authentication Session State
Decision date: 2025-11-10
Status: Accepted

Northstar chose Redis Session Cache for short-lived authentication session state rather than storing this state in the primary relational database.

The reasons were:
1. authentication reads and writes are latency-sensitive;
2. session state is short-lived and can use explicit TTLs;
3. Redis keeps high-volume ephemeral access away from the transactional database;
4. the platform already had operational experience with Redis failover and monitoring.

The trade-off is that Redis becomes a runtime dependency of Identity Gateway.
Identity Gateway must therefore degrade safely when Redis is slow or partially unavailable.

Dev Patel recorded the decision.
Rahul Verma and Rohan Kulkarni reviewed the implementation constraints.
