# Customer Personas

*Six real humans. Their pain is specific. Their constraints are real. Their value of time is high.*

---

## Persona 1 — Anjali, Cardiologist (Solo Practice, India)

**Role:** Senior cardiologist, 18 years of practice, runs a private clinic in Pune with 2 support staff
**Age:** 46
**Tech level:** Comfortable with digital tools; uses smartphone, electronic health records; not a developer

**The Knowledge Problem:**
Anjali has 18 years of patient encounter notes, annotated cardiology guidelines, drug protocol summaries she's written, and 200+ research papers she's highlighted and referenced. Everything lives in a folder structure on her laptop and an aging EHR system.

When a complex patient case arrives, she often knows she's seen something similar before — but finding that case, those notes, those annotations, takes 20–40 minutes she doesn't have between patients. She's started just relying on memory and current literature, which means 18 years of personal clinical wisdom is slowly becoming inaccessible.

**Why Cloud AI Doesn't Work:**
Patient data is protected under Indian data protection law and medical ethics. Uploading patient case notes to OpenAI or Google would be a direct violation. She's looked at ChatGPT for other tasks — she won't touch it for clinical work.

**What She Wants to Ask:**
- "What treatment protocol did I use for patients with both atrial fibrillation and CKD stage 3? How did it compare to the AHA guideline I annotated in 2021?"
- "Which drug interactions did I flag in my notes for patients on this combination?"
- "Find all cases where I noted good outcomes from this intervention in diabetic patients"

**What She Gets Today:**
Searching manually through folders. Relying on memory. Occasionally asking a colleague.

**The Moment She'd Pay:**
She asks a complex question about a patient's prior case pattern. Knowledge Hub answers in 30 seconds with a reference to her own notes from 3 years ago. She says: "I wouldn't have remembered that. This just saved me from a potential mistake."

**WTP:** ₹2,500–4,000/month (~$30–50). Non-negotiable if it saves one mistake.
**Deployment:** Local-first. No discussion.

---

## Persona 2 — Marcus, Partner at a Boutique Law Firm (UK)

**Role:** Partner at a 12-person commercial law firm in London, specialising in construction contracts and disputes
**Age:** 52
**Tech level:** Uses standard legal tools; relies on junior associates for research; not technical

**The Knowledge Problem:**
The firm has 15 years of case files, client correspondence, legal research memos, and strategy notes across every matter they've handled. Currently stored in a case management system with mediocre search.

When a new client brings a similar dispute, Marcus knows the firm has seen something like this before — maybe even won or lost it — but retrieving that specific institutional knowledge requires asking the associate who worked on it (if they're still at the firm) or a manual keyword search that misses context.

The firm loses institutional knowledge every time a solicitor leaves. They've had three in the last two years.

**Why Cloud AI Doesn't Work:**
Attorney-client privilege. Full stop. The SRA (Solicitors Regulation Authority) would consider uploading client matter files to a cloud AI service a potential breach of confidentiality. He's watched other firms get embarrassed by this. He won't risk it.

**What He Wants to Ask:**
- "Have we previously handled a contract dispute involving a delayed completion clause with this type of subcontractor? What was our argument and what was the outcome?"
- "Find all the precedents we've cited in cases involving liquidated damages clauses in the last 5 years"
- "What strategy did we use to settle the Smith Construction matter? What would we do differently?"

**What He Gets Today:**
Asking a junior associate to manually search the case management system. It takes half a day and often misses context. Or he relies on institutional memory — which walks out the door with every departing lawyer.

**The Moment He'd Pay:**
A new matter arrives. He opens Knowledge Hub and asks: "Have we argued this before?" It comes back with a 2019 matter, the argument used, and the outcome. He looks at the junior associate and says: "This used to take you a day. It just took 30 seconds."

**WTP:** £150–300/month personal; would push to firm-wide if proven ($200–500/solicitor at the firm).
**Deployment:** On-premise or local-first. Non-negotiable.

---

## Persona 3 — Yuki, Senior Product Manager (Tech Startup, Japan/Singapore)

**Role:** Senior PM at a 150-person SaaS startup in Singapore, managing the core product
**Age:** 34
**Tech level:** Power user; uses Notion, Confluence, Jira; not a developer but technically literate

**The Knowledge Problem:**
Yuki has 4 years of product decisions, user research reports, feature roadmaps, OKR reviews, and competitive analyses across Confluence and Notion. When she joins a planning session, someone asks "why did we deprioritize feature X?" and she knows the answer was in a Confluence doc from 2022 — but finding it during the meeting is impossible.

New product managers joining the team spend 3-4 weeks just trying to understand the decision history before they can contribute. The product's WHY is locked in documents no one can efficiently query.

**Why Cloud AI Doesn't Work:**
It could — the data isn't regulated. But the company IT policy restricts uploading internal strategy documents to third-party AI. Competitive product strategy going to an OpenAI API also makes the CTO uncomfortable.

**What She Wants to Ask:**
- "Why did we decide against building a bulk edit feature in Q3 2022? What was the user research basis?"
- "What were all the decisions made during the checkout flow redesign? Who was the decision owner?"
- "Which competitor features have we explicitly evaluated and decided not to build, and why?"

**The Moment She'd Pay:**
A new PM joins. On day 3, instead of reading Confluence for a week, they open Knowledge Hub and ask: "Give me the 10 most important product decisions of the last 2 years and why they were made." They're contributing in week 1 instead of week 4.

**WTP:** $30–50/month personal; $99/month team (product team of 5).
**Deployment:** KH-managed cloud or self-hosted (company preference).

---

## Persona 4 — Aarav, Independent IT Consultant (India, remote-first)

**Role:** Freelance IT architect and consultant, working with 3–5 clients simultaneously across India and Middle East
**Age:** 38
**Tech level:** High — developer background, runs Linux, comfortable with Ollama and local tools

**The Knowledge Problem:**
Aarav has 9 years of consulting deliverables — architecture documents, implementation guides, integration specs, troubleshooting notes — spread across 60+ client engagements. His intellectual capital is his filing system. Clients pay for his experience, not his time. But he can't access his experience efficiently.

"I know I solved a very similar integration challenge at a Dubai fintech client in 2021. I spent 3 weeks on it. I can't find those notes. I'm about to spend 3 weeks solving it again."

**Why Cloud AI Doesn't Work:**
Client NDAs. Every engagement document has confidentiality clauses. He cannot upload a client's architectural diagram to ChatGPT. He's tried using it for non-client thinking — but the moment he needs to reference his actual work, the constraint hits.

**What He Wants to Ask:**
- "How did I architect the SSO integration for the fintech client in Dubai? What vendor issues did I document?"
- "Which clients had data compliance requirements that forced architecture changes? What patterns emerged?"
- "What's my standard recommendation for microservices observability? Pull from my last three implementations."

**The Moment He'd Pay:**
A prospect asks: "We need to integrate with three legacy banking systems. Have you done this before?" Aarav opens Knowledge Hub, retrieves three past implementations with notes, and walks into the sales call with specifics instead of generalities. He wins the engagement.

**WTP:** $20–40/month (solo freelancer budget; would pay more if client volume increases)
**Deployment:** Local-first. Ollama already running. Will set this up himself.

---

## Persona 5 — Sarah, Head of Engineering (50-person startup, UK)

**Role:** Head of Engineering at a 50-person B2B SaaS company, managing a team of 12 engineers
**Age:** 40
**Tech level:** Strong — was a senior engineer, now manages; reads code, understands architecture

**The Knowledge Problem:**
The platform has 4 years of history. Architecture decisions were made in Slack threads, whiteboard sessions, and minds of engineers who've since left. The ADR (Architecture Decision Record) culture exists in principle but not in practice — there are 8 ADRs and 400 undocumented decisions.

New engineers join and spend their first month asking "why does it work this way?" Sarah spends 40% of her week answering the same questions. Every sprint planning starts with someone asking why they can't just refactor a module, and Sarah has to recall the constraints from memory.

**Why Cloud AI Doesn't Work:**
The company has SOC 2 Type II and their legal team has flagged that uploading internal architecture documents to external AI APIs creates vendor risk in their security posture. The engineers want to use it anyway. Sarah is holding the line.

**What She Wants to Ask:**
- "Why can't we replace the billing service with Stripe directly? What decision was made and when?"
- "Which modules have the most unanswered questions from the team? Where are our documentation gaps?"
- "A new engineer is starting Monday. Generate an onboarding path for a backend engineer focused on the payment flow."

**The Moment She'd Pay:**
A senior engineer asks to refactor a core module. Instead of spending 2 hours reconstructing why it was built this way, Sarah opens Knowledge Hub and pulls the decision history in 30 seconds. The engineer understands the constraints. The refactor is better. Sarah gets 2 hours back.

**WTP:** $99/month team (company pays; engineering tooling budget).
**Deployment:** Self-hosted or local. SOC 2 compliance requires it.

---

## Persona 6 — Dr. Priya, Research Scientist (University, India/US)

**Role:** Associate Professor in biochemistry, managing a lab of 8 researchers, active grant portfolio
**Age:** 43
**Tech level:** Moderate — uses reference management tools (Zotero, Mendeley), not a developer

**The Knowledge Problem:**
Priya has published 40+ papers over 15 years. Her lab has generated data, protocols, experiment logs, and literature reviews for 12 funded research projects. When a new PhD student joins, they start from scratch — re-reading papers the lab has already synthesized, re-discovering protocols already documented somewhere.

Grant applications require summarizing 5 years of related work. Priya does this manually, taking 3-4 days. She's annotated hundreds of papers. Most annotations are inaccessible within 6 months.

**Why Cloud AI Doesn't Work:**
Pre-publication research data cannot go to cloud AI — this would constitute public disclosure of results, potentially invalidating patent applications or violating grant confidentiality clauses. Her institution's IRB and tech transfer office have explicitly prohibited it.

**What She Wants to Ask:**
- "What did our 2020-2023 experiments on protein folding dynamics show? Where were the conflicting results?"
- "Which papers in my library support and which contradict the hypothesis I'm writing for Grant X?"
- "What protocols from earlier projects apply to the new mouse model we're starting?"

**The Moment She'd Pay:**
A new PhD student starts. Instead of reading the lab's paper archive for 3 months, they use Knowledge Hub to build understanding in 3 weeks. The student's first literature review draws on 8 years of lab annotations they would never have found otherwise. Priya gets an effective researcher 6 weeks sooner.

**WTP:** $15–25/month (academic budget); lab-level: $50–80/month if institution pays
**Deployment:** Local-first (grant compliance requirements).
