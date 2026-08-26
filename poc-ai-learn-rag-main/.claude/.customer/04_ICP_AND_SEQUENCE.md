# Ideal Customer Profile & Go-to-Market Sequence

*Who is the perfect first customer? In what order do we approach segments?
This document is for Stage 2 planning — not yet execution.*

---

## The Ideal First Customer (ICP)

The ideal first customer satisfies all five of these criteria:

**1. High pain intensity.**
Their current solution is genuinely painful — not just suboptimal. They describe the problem
without prompting. They've already tried to solve it and failed.

**2. Privacy requirement makes us uniquely viable.**
Cloud AI is not an option for them — not because of cost, but because of compliance, ethics,
or legal obligation. We are not competing with ChatGPT for them. We are the only option.

**3. Professional budget.**
They have a business use case, not a personal hobby. They would expense this.
$30–200/month is noise in their billing, not a decision.

**4. High query velocity.**
They will generate queries regularly — daily or near-daily. Their IDS compounds fast.
After 90 days, the intelligence layer is irreplaceable.

**5. Articulate and connected.**
They can explain the value in one sentence. They know other people with the same problem.
When they find something that works, they tell their network.

---

## The Three Best ICP Candidates

### ICP-A — The Independent IT/Management Consultant

**Why they're the ideal first customer:**
- High pain (client knowledge scattered across NDAs and folders — re-inventing wheels constantly)
- Privacy requirement (client NDAs prevent cloud AI use)
- Professional budget ($20–50/month is trivial for a consultant billing $150–300/hour)
- High query velocity (multiple client engagements simultaneously, daily knowledge work)
- Articulate and connected (consultants talk to other consultants; strong professional networks)
- Technical comfort (will set up Ollama themselves; won't need hand-holding)

**The conversation:** "You have 8 years of consulting deliverables that you can't efficiently query.
You can't use ChatGPT because of NDAs. You could be re-using your own intellectual capital
instead of recreating it. Run this locally. Your data never leaves your machine."

**First 5 people:** Find IT consultants in professional communities (LinkedIn, Slack communities
like Rands Leadership Slack, freelance developer networks). Demo with their own use case.

---

### ICP-B — Engineering Team Lead / Head of Engineering (10–50 person company)

**Why they're a strong second:**
- Very high pain (institutional memory loss, slow onboarding, repeated questions)
- Privacy requirement varies (some can use cloud, some can't — but local-first is often preferred)
- Team budget ($99/month is one engineering hour)
- Highest IDS velocity (team generates queries, compounding is fast)
- Connected (engineering leaders talk to engineering leaders; Slack, Twitter/X, conferences)
- Already understands the problem (has lived the "why did we build it this way?" conversation)

**The conversation:** "Your engineering knowledge walks out the door with every engineer who leaves.
New engineers take 6 weeks to ramp. You answer the same architecture questions every sprint.
Knowledge Hub turns your documentation and decision history into a queryable intelligence layer."

**First 5 people:** Engineering communities, Hacker News, indie maker communities, CTO forums.

---

### ICP-C — Solo Regulated Professional (Doctor, Lawyer, CA — India market first)

**Why they're a strong third:**
- Very high pain (professionally high-stakes decisions relying on inaccessible personal knowledge)
- Strongest privacy requirement (legal and ethical obligation, not preference)
- Professional budget ($30–80/month is trivial vs. professional billing rates)
- Strong referral potential (professional associations, doctor WhatsApp groups, bar associations)

**The timing challenge:** Harder to reach without medical/legal networks. Longer to validate.
The product needs slightly more polish for non-technical users before this segment.

**India-specific opportunity:**
India has 1.2M registered doctors, 1.8M chartered accountants, and 1.6M advocates.
Cloud AI adoption is hindered by both data protection concerns and cost (cloud LLM APIs are
expensive relative to Indian professional incomes). Local-first + free LLM is a uniquely
strong value proposition in the Indian market. This segment warrants a dedicated India GTM.

---

## Go-to-Market Sequence

### Stage 2 — Find Five People (when ready)

**Approach ICP-A first** (IT consultants and independent developers).

Why ICP-A first:
- They can install Ollama themselves — no friction
- They're online and findable in developer communities
- The product already works for their use case (code + documentation intelligence)
- They have the same pain in a professional context
- Feedback loop is fast — they'll tell you what's missing clearly

**How to reach them:**
1. Post in relevant Slack communities (remote work, consulting, freelance dev) — share a demo, not a pitch
2. Write one specific, honest post: "I built a tool that lets you query your consulting deliverables locally without sending them to ChatGPT." No growth hacking.
3. Ask 3-5 developer friends who also consult to try it
4. LinkedIn outreach to IT consultants in your network — personal, specific, honest

**Stage 2 success:** 5 people who use it weekly and can explain the value in one sentence.

---

### Stage 3 — First Charge

**Timing:** When at least 3 of the Stage 2 users have used it for 3+ weeks and are still using it.

**How to charge:**
- Do not build payment infrastructure first. Invoice manually. Use Razorpay or Stripe Payment Link.
- Price at $20/month individual. Do not negotiate down — if they won't pay $20, they don't have the pain.
- The first charge validates the value. It is not about the revenue.

**What this unlocks:** Real feedback. Paying customers tell you what's broken. Free users disappear silently.

---

### Stage 4 — Expand to ICP-B and ICP-C

Once Stage 3 is validated (3+ paying customers, clear understanding of what they use):

**ICP-B (Engineering teams):** 
- Outreach through engineering communities (HN, Twitter/X, LinkedIn)
- "Knowledge Hub for engineering teams" — specific, not generic
- Team tier pricing ($99/month) becomes the growth vehicle

**ICP-C (Regulated professionals):**
- India-first: CA networks, bar associations, medical professional communities
- Requires simpler setup (guided installer, not command-line Ollama)
- May require partnerships with professional associations for credibility
- Longer sales cycle but highest switching cost (professional-grade trust)

---

## What We Do Not Do Before Stage 3

- Enterprise sales
- Partnership discussions
- Marketplace listings (VS Code Marketplace, product directories)
- Paying for customer acquisition (ads, sponsorships)
- Building features for imagined future customers
- Optimizing for SEO or discoverability

Distribution is a multiplier. It multiplies what's already there.
Right now, what's there is not yet proven irreplaceable.
Multiplying something unproven wastes the moat window.

---

## The Question That Anchors All Go-to-Market Decisions

> "Does this action bring me closer to talking to one real person with this exact pain,
> or does it scale something I haven't yet proven works?"

Before Stage 3: only actions that bring you to one real person.
After Stage 3: scale what's been proven.
