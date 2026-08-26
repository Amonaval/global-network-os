# Incident Retrospective — Authentication Latency and Login Failures
Incident date: 2026-07-22
Reviewed: 2026-07-29

A Redis Session Cache saturation event increased Identity Gateway latency and caused intermittent login failures.
Rahul Verma identified the session-cache connection exhaustion pattern and coordinated the application-side mitigation.
Rohan Kulkarni diagnosed the Redis node pressure and restored cache headroom.
Priya Nair validated that token issuance and OIDC flows remained logically correct while the cache layer was degraded.
Vikram Joshi coordinated incident command and traffic protection at API Edge.

The incident showed a knowledge concentration risk: Rahul knew the gateway retry behavior, Redis session fallback and rollout controls in the most detail.
The follow-up action is for Priya Nair and Aman Shah to shadow the next two Identity Gateway production releases.
