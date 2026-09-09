# QA Free-Tier Operating Rule

TrustWeave is currently developed on Free-Tier infrastructure. QA must prove correctness without consuming enough Auth/DB/API capacity to disrupt the working application.

Default rules:
1. Prefer local/static/unit checks before network calls.
2. Use one Playwright worker.
3. Reuse authenticated sessions; never sign in per assertion/test when one session can cover the journey.
4. POC browser scope starts with Family + Housing Society only.
5. POC roles are owner/member/tenantB only when needed; do not multiply role × vertical combinations prematurely.
6. Keep deterministic datasets tiny.
7. No stress, large-volume, repeated destructive cycles, or all-vertical browser crawling in default POC mode.
8. Treat rate limiting as a QA design failure, not as something to brute-force with retries.
9. Expand coverage in layers only after the previous compact layer is certified.
10. Never point mutating QA at production.
