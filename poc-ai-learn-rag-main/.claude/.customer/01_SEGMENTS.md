# Customer Segments

*Every segment listed here has the same underlying problem: accumulated knowledge that has
stopped compounding. The privacy column determines which deployment model they need.*

---

## Category 1 — Regulated Solo Professionals

The highest-privacy, highest-pain segment. Cloud AI is legally or ethically off-limits.
Local-first is not a preference — it is the only option.

### Medical Professionals
**Who:** Doctors (GPs, specialists), dentists, veterinarians, nurses (private practice)
**Knowledge:** Clinical notes, patient protocols, medical literature, treatment guidelines, referral history
**Pain:** Manually searching case notes to recall treatment decisions; re-reading papers already summarized before
**Privacy:** HIPAA (US), GDPR (EU), patient confidentiality — cloud AI is a compliance violation
**Query pattern:** "What protocol did I use for diabetic patients with this comorbidity?", "Which papers did I annotate on this drug interaction?"
**WTP:** $30–80/month (professional budget, high time value)
**IDS velocity:** Medium — daily clinical queries, but knowledge base grows slowly
**Moat trigger:** After 6 months, the indexed clinical decisions become a personal medical intelligence layer they cannot replicate elsewhere

### Legal Professionals
**Who:** Lawyers, solicitors, barristers, paralegals, in-house counsel (solo or small firm)
**Knowledge:** Case files, precedents, contracts, client notes, legal research, court filings
**Pain:** "I handled something similar three years ago — where is that brief?" Searching case files manually is billable time wasted
**Privacy:** Attorney-client privilege — sharing client files with any third party (including cloud AI) is a potential ethics violation or bar rule breach
**Query pattern:** "What arguments worked in our last construction contract dispute in this jurisdiction?", "Find all cases where we cited this precedent"
**WTP:** $50–200/month (legal billing rates make this trivial)
**IDS velocity:** High — multiple case queries daily, rich document volume
**Moat trigger:** Case history + precedent library becomes a proprietary legal intelligence layer after 90 days

### Financial Advisors & Accountants
**Who:** Chartered Accountants (CAs), Certified Financial Planners (CFPs), CPAs, independent financial advisors
**Knowledge:** Tax filings, client portfolios, regulatory documents, audit trails, financial plans, correspondence
**Pain:** Answering "why did we make this decision for Client X in 2021?" requires manually searching old files
**Privacy:** Fiduciary duty, client confidentiality, regulatory compliance (SEC, FCA, SEBI) — client financial data cannot leave the firm
**Query pattern:** "What was the rationale for this investment allocation for this client profile?", "Which tax strategy did we use for high-net-worth clients in this bracket?"
**WTP:** $40–150/month (high earning professional)
**IDS velocity:** Medium — seasonal peaks (tax season), rich accumulated client knowledge

### Therapists & Psychologists
**Who:** Psychologists, therapists, counselors, social workers (private practice)
**Knowledge:** Session notes, treatment plans, assessment records, clinical frameworks, case formulations
**Pain:** Recalling a specific therapeutic approach used with a similar presentation two years ago
**Privacy:** Strict — patient records are among the most legally protected data in any jurisdiction
**Query pattern:** "What CBT techniques worked for clients with this profile?", "What was my assessment of this behavioral pattern?"
**WTP:** $25–60/month
**IDS velocity:** Medium-low (careful note-taking, weekly not daily queries)

### Independent Consultants (IT, Management, Strategy)
**Who:** Freelance IT consultants, management consultants, strategy advisors, interim executives
**Knowledge:** Project deliverables across multiple clients, frameworks, runbooks, architecture decisions, lessons learned
**Pain:** "I solved this exact problem at a fintech client in 2022 — where are those notes?" Institutional knowledge lives only in the consultant's files; clients pay for experience, not memory
**Privacy:** Client NDAs prohibit sharing deliverables with cloud AI. Consulting methodologies are proprietary.
**Query pattern:** "How did I architect the SSO integration for that retail client?", "What risks did we identify in the last three digital transformation projects?"
**WTP:** $20–50/month personal; $99/month if querying across active client engagements
**IDS velocity:** High — daily project work, multi-client knowledge cross-pollination is the value

### Architects & Civil Engineers (Independent)
**Who:** Independent architects, structural engineers, civil engineers, project managers
**Knowledge:** Project specs, building codes, material standards, client briefs, site reports, inspection notes
**Pain:** "What fire egress spec did we use in the last commercial build in this jurisdiction?"
**Privacy:** Client project details are confidential; competitive methods are proprietary
**WTP:** $25–60/month
**IDS velocity:** Project-based (medium velocity, high value per query)

### Researchers & Academics
**Who:** University professors, postdocs, independent researchers, think-tank analysts
**Knowledge:** Papers, citations, research notes, grant applications, lab data, literature reviews
**Pain:** Managing hundreds of annotated papers; "what were the conflicting findings in my 2020-2023 research on this topic?"
**Privacy:** Pre-publication research cannot be sent to cloud AI (IP exposure, grant agreement requirements)
**Query pattern:** "Which papers in my library contradict this hypothesis?", "What methodology did I use in the protein folding study?"
**WTP:** $15–30/month (academic budgets are constrained)
**IDS velocity:** Medium — deep reading, infrequent but high-value queries

### Journalists & Investigators
**Who:** Freelance journalists, investigative reporters, documentary filmmakers
**Knowledge:** Interview transcripts, source notes, research files, article archives, case files
**Pain:** Recalling a source statement from an interview two years ago; cross-referencing across years of investigation
**Privacy:** Source protection — journalist cannot upload source materials to cloud AI
**WTP:** $15–30/month (freelance budgets vary)
**IDS velocity:** Project-based (intense during active investigations)

### Teachers & Educators (Independent)
**Who:** Tutors, independent trainers, online course creators, homeschool educators
**Knowledge:** Curriculum materials, lesson plans, student assessment notes, research resources
**Pain:** Reusing and adapting curriculum across years; "what examples worked best for this learning objective?"
**WTP:** $10–25/month (constrained budgets)
**IDS velocity:** Seasonal, lower velocity

---

## Category 2 — Technical & Product Teams

The segment we've built for. Privacy varies — some send data to cloud, some don't.
Intelligence velocity is high. Willingness to pay is team-budget, not personal-budget.

### Software Engineering Teams
**Who:** Engineering teams at startups, scaleups, and enterprises (5–200 engineers)
**Knowledge:** Architecture docs, ADRs, runbooks, post-mortems, code comments, RFCs, design docs
**Pain:** New engineers take 6+ weeks to ramp; "why did we choose this architecture?" requires finding the person who made the decision; same bugs recur because incident knowledge doesn't persist
**Privacy:** Varies — source code + internal decisions often cannot go to cloud AI at enterprises
**Query pattern:** "Why did we move away from microservices in 2023?", "What's the decision history on the auth layer?"
**WTP:** $99–300/month (team budget, part of engineering tooling)
**IDS velocity:** Very high — multiple queries daily across a team

### Product Management Teams
**Who:** Product managers, product owners, UX researchers (embedded in teams)
**Knowledge:** PRDs, user research, feature decision history, competitive analysis, stakeholder feedback, OKRs
**Pain:** "Why did we drop feature X?", "What did the user research say about checkout abandonment?", "Find all the decisions made during the rebrand"
**Privacy:** Low (product docs are internal, but not usually regulated)
**WTP:** $30–50/month personal; $99/month team
**IDS velocity:** High — product decisions happen daily

### Data Science / ML Teams
**Who:** Data scientists, ML engineers, AI researchers at companies
**Knowledge:** Experiment logs, model cards, dataset documentation, feature engineering notes, evaluation results
**Pain:** "Which experiment configuration gave us the best results on the validation set?", "Why did we deprecate model version 3?"
**Privacy:** Training data and model architecture are often proprietary
**WTP:** $99–200/month team
**IDS velocity:** Very high (ML experimentation generates enormous documentation)

### DevOps / SRE / Platform Teams
**Who:** Infrastructure engineers, site reliability engineers, platform engineers
**Knowledge:** Runbooks, incident post-mortems, playbooks, system architecture, deployment logs
**Pain:** "This alert fired before — what was the root cause and fix?", new team member can't navigate incident response
**Privacy:** Internal infrastructure details are often confidential
**WTP:** $99/month team
**IDS velocity:** Incident-driven spikes + steady background

### Security Teams
**Who:** Security engineers, threat analysts, compliance officers (small-to-mid orgs)
**Knowledge:** Vulnerability assessments, penetration test reports, threat models, compliance docs, incident reports
**Pain:** Regulatory audit requires finding every policy change from the last 3 years
**Privacy:** High — security posture documents are highly sensitive; cloud AI would be a security risk
**WTP:** $150–300/month (security budgets are large)
**IDS velocity:** Medium but high-consequence per query

---

## Category 3 — Business & Operational Teams

Domain-agnostic. Any function that accumulates process knowledge and procedures.

### Sales Teams
**Who:** Account executives, sales managers, BDRs (at mid-size companies)
**Knowledge:** Call transcripts, deal histories, objection libraries, competitive battlecards, product positioning
**Pain:** New sales rep must learn from scratch; "how did we win the deal with this type of enterprise buyer?"
**Privacy:** Low — sales playbooks are internal, but not regulated
**WTP:** $50/month personal; $99/month team
**IDS velocity:** High — sales generates repetitive patterns fast

### Marketing Teams
**Who:** Content marketers, brand managers, campaign managers
**Knowledge:** Brand guidelines, campaign archives, content libraries, audience research, copy variations
**Pain:** "What campaigns worked for this audience segment?", recreating brand knowledge lost in agency transitions
**WTP:** $30–50/month personal; $99/month team
**IDS velocity:** Medium

### HR & People Teams
**Who:** HR managers, recruiters, people operations leads
**Knowledge:** Job descriptions, competency frameworks, interview guides, policy documents, offboarding knowledge
**Pain:** "What behavioral questions worked best for this engineering role?", policy knowledge trapped in the person who wrote it
**Privacy:** Medium — employee data has privacy implications
**WTP:** $50/month personal; $99/month team
**IDS velocity:** Medium

### Customer Support / Success Teams
**Who:** Support engineers, customer success managers, technical account managers
**Knowledge:** Troubleshooting guides, customer history, escalation paths, product FAQs, workarounds
**Pain:** New support agent takes 3 months to reach proficiency; same customer problems answered from scratch each time
**Privacy:** Low-medium (customer data handling varies)
**WTP:** $99/month team (support tools budget exists)
**IDS velocity:** Very high — support generates massive query volume fast

---

## Category 4 — Organizations with Enterprise-Level Privacy Requirements

These are the largest contracts. Sales cycles are longer. IDS velocity is highest.

### Hospitals & Healthcare Systems
**Who:** Clinical operations teams, medical directors, quality assurance teams
**Knowledge:** Clinical protocols, treatment guidelines, compliance documentation, staff training, research outputs
**Pain:** Clinical guidelines updated by regulatory bodies; staff need current knowledge; decisions are life-critical
**Privacy:** HIPAA, GDPR — mandatory local or private cloud deployment
**WTP:** $5,000–50,000/year (enterprise licensing)
**IDS velocity:** Extreme — multiple teams querying simultaneously

### Law Firms (Mid to Large)
**Who:** Practice group leaders, partners, knowledge management teams at firms with 20–500 attorneys
**Knowledge:** Case law library, client matter files, internal precedent documents, contract templates
**Pain:** Attorneys charging $500–1000/hour manually searching for precedents that the firm has already researched
**Privacy:** Bar rules in most jurisdictions prohibit sharing client matter files with cloud AI
**WTP:** $200–500/attorney/month (enterprise pricing)
**IDS velocity:** Very high — firm-wide daily queries

### Financial Institutions
**Who:** Investment banks, hedge funds, private equity firms, insurance companies
**Knowledge:** Research reports, investment theses, deal histories, risk models, regulatory filings
**Pain:** Analysts reinventing analysis done previously; regulatory compliance documentation buried in file systems
**Privacy:** Non-public information (NPI) regulations, SEC rules, fiduciary duty — cloud AI is not viable
**WTP:** $10,000–100,000/year
**IDS velocity:** High (research-driven organizations)

### Consulting Firms
**Who:** Big 4 (Deloitte, PwC, EY, KPMG), boutique strategy consultants, IT consulting firms
**Knowledge:** Client engagement deliverables, proprietary frameworks, industry research, methodology libraries
**Pain:** Consultants re-creating analysis previously done at a different client; knowledge trapped in the PowerPoints of people who left
**Privacy:** Client confidentiality — deliverables cannot go to cloud AI
**WTP:** $500–2000/consultant/year (training & tools budget)
**IDS velocity:** High

### Government & Public Sector
**Who:** Government agencies, regulatory bodies, public policy organizations
**Knowledge:** Policy documents, regulatory frameworks, inter-agency correspondence, historical decisions
**Privacy:** Classified information, sovereignty requirements, data residency laws — cloud AI often explicitly prohibited
**WTP:** $20,000–200,000/year (government procurement budget)
**IDS velocity:** Medium (bureaucratic query pace, but large document volumes)

### Pharmaceutical & Life Sciences
**Who:** Pharma R&D teams, clinical trial managers, regulatory affairs teams
**Knowledge:** Trial protocols, clinical data, regulatory submissions, competitive intelligence, scientific literature
**Pain:** Re-running searches that have already been done; FDA submission requires full audit trail
**Privacy:** Clinical trial data is highly regulated; pre-approval drug data is trade secret
**WTP:** $50,000–500,000/year
**IDS velocity:** Medium-high

### Defense & Aerospace
**Who:** Defense contractors, aerospace engineering teams, government defense agencies
**Knowledge:** Technical specifications, program histories, compliance documentation, engineering decisions
**Privacy:** Security clearance requirements — cloud AI is categorically prohibited
**WTP:** Very high (government contracts)
**IDS velocity:** Project-based

---

## Category 5 — Personal Knowledge Management

The smallest WTP but the largest potential user base. Serves Stage 1 product validation.

### Power Knowledge Workers (Personal Use)
**Who:** Individuals with large personal knowledge bases — Obsidian users, Notion power users, researchers, lifelong learners
**Knowledge:** Personal notes, article clippings, book highlights, research, journals
**Pain:** Can't find a note taken 3 years ago; knowledge is collected but not queried
**Privacy:** Personal data — cloud AI is a comfort decision, not a compliance one
**WTP:** $5–20/month (personal budget, limited)
**IDS velocity:** Low-medium (solo, no team amplification)
**Deployment:** Local-first or pay-per-query

### Freelancers (Non-technical)
**Who:** Copywriters, designers, photographers, filmmakers, artists managing project portfolios
**Knowledge:** Client briefs, project histories, creative references, process notes
**Pain:** Recreating project context from scattered files; "what brief did Client X give for the 2022 campaign?"
**WTP:** $10–20/month
**IDS velocity:** Project-based

---

## Summary Matrix

| Segment | Privacy Need | WTP/month | IDS Velocity | Deployment |
|---------|-------------|-----------|-------------|------------|
| Medical (solo) | Critical | $30–80 | Medium | Local-first |
| Legal (solo) | Critical | $50–200 | High | Local-first |
| Financial advisor | High | $40–150 | Medium | Local-first |
| IT consultant | High | $20–50 | High | Local-first |
| Researcher | High | $15–30 | Medium | Local-first |
| Eng team (startup) | Medium | $99–300 | Very High | Cloud or Local |
| Product team | Low | $99 | High | Cloud |
| Support team | Low-Med | $99 | Very High | Cloud |
| Law firm (enterprise) | Critical | $200–500/atty | Very High | Self-hosted |
| Healthcare (org) | Critical | $5k–50k/yr | Extreme | Self-hosted |
| Consulting firm | High | $500–2k/consult | High | Self-hosted |
| Government | Critical | $20k–200k/yr | Medium | Self-hosted |
| Personal KM | Low | $5–20 | Low | Local or Pay/query |
