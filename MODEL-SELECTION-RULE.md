# Model and Reasoning-Effort Rule

This rule applies to every future implementation, audit and planning mission.

1. At the start of a mission, classify the work by risk and ambiguity, check the models currently available in the working environment, and recommend the best suitable model plus reasoning effort.
2. If the environment supports automatic model selection within the authorized workflow, use the recommended setting. Otherwise, tell the user the exact manual selection before substantial implementation begins. Never claim that a model was changed when it was not.
3. Re-evaluate at major batch boundaries, not for every mechanical edit.
4. Use the lowest effort that reliably meets the acceptance criteria:
   - routine, fully specified transformations: efficient model at Medium;
   - normal multi-file product implementation: strongest coding model at High;
   - security, RLS, migrations, architecture, privacy and difficult UX trade-offs: strongest coding model at Extra High;
   - Max only for exceptionally hard single-agent problems; Ultra only when the work genuinely benefits from independent parallel workstreams.
5. If the active setting is below the recommendation, explicitly flag the quality risk. For security, tenancy, destructive migration or architecture-critical work, request the stronger setting before implementation unless the user directs otherwise.
6. Model effort never replaces source inspection, visual validation, tests, security checks or staging verification.
7. Because model availability changes, prefer current official model guidance over hard-coded historical names. As of August 2026, the preferred defaults are GPT-5.6 Sol High for substantial implementation and Sol Extra High for security/architecture; Terra is suitable for bounded follow-on work.

