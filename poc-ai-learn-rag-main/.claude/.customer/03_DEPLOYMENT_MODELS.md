# Deployment Models

*The customer's deployment choice is determined by their privacy requirements and technical
comfort — not our preference. We serve across the full spectrum.*

---

## The Spectrum

```
← Most Private                                          Most Convenient →
← User Controls Everything                              We Control Everything →
← Free                                                  Pay Per Use →

[Local-First]  [Self-Hosted]  [KH Managed Cloud]  [Pay-Per-Query]
```

---

## Model 1 — Local-First (Current)

**What it is:** Everything runs on the user's machine. Ollama provides the LLM. Knowledge Hub
provides the intelligence layer. No data leaves the device.

**Who uses it:**
- Solo professionals with strict privacy requirements (doctors, lawyers, consultants, researchers)
- Developers and technical users who already run local models
- Privacy-first organizations that won't accept any cloud dependency
- Users in countries with data sovereignty laws that prohibit cloud AI

**Technical requirement:** A machine capable of running Ollama + a 7B parameter model.
Minimum: 8GB RAM + 4-core CPU. Better: 16GB RAM + GPU.

**Cost to user:** Free. They provide hardware and model.

**LLM flexibility:**
- Ollama: Llama 3, Qwen, Mistral, Phi, Gemma — any model the user chooses
- OpenAI-compatible API: users can wire in their own API keys if they want cloud models
- User decides quality vs. cost vs. privacy tradeoff — we don't impose it

**The pitch:** "You already have years of documents. You don't need to send them to OpenAI to
get intelligence on them. Run it on your machine. It's free. It's private. It's yours."

**Our effort:** This is what we've built. It works today.

---

## Model 2 — Self-Hosted (Organizational)

**What it is:** The organization runs Knowledge Hub on their own infrastructure — a private
cloud VPC (AWS, Azure, GCP), on-premise servers, or a dedicated private instance. Data never
leaves the organization's boundary.

**Who uses it:**
- Mid-size and large companies with IT infrastructure (20–500 employees)
- Healthcare providers, law firms, financial institutions, consulting firms
- Enterprises with security/compliance requirements (SOC 2, HIPAA, ISO 27001)
- Government agencies with data residency requirements

**Technical requirement:** A server or cloud VM capable of running Node.js + the embedding
model + storage. Can be run with cloud LLM APIs (OpenAI, Anthropic) if the company policy
allows external API calls but not external data storage.

**Cost to user:** Infrastructure cost + Knowledge Hub enterprise license.

**LLM flexibility:**
- Internal model (Ollama on the organization's server)
- Cloud API with data processing agreements (OpenAI Enterprise, Azure OpenAI, Anthropic — where DPAs cover compliance)
- Organization's existing LLM infrastructure if available

**The pitch:** "Your data doesn't move. Your intelligence stays inside your firewall. Your
regulatory requirements are met. Your team gets the intelligence layer."

**Our effort:** Requires packaging Knowledge Hub for deployment (Docker container, installation
guide, enterprise configuration). Not yet done. Requires Stage 3+.

---

## Model 3 — KH Managed Cloud (Isolated Instance)

**What it is:** Knowledge Hub hosts the instance. Each customer gets an isolated environment —
their data, their index, their intelligence. Nothing is shared between customers.
Data lives on Knowledge Hub's infrastructure but is fully isolated.

**Who uses it:**
- Teams and companies that want the intelligence layer without managing infrastructure
- Startups and growing companies where IT capacity is limited
- Users who have non-sensitive or low-sensitivity data
- Teams that want fast setup with no DevOps overhead

**Technical requirement:** A browser. Nothing else.

**Cost to user:** Subscription.
- Individual: $20/month
- Team: $99/month
- Enterprise: Custom

**LLM flexibility:**
- Knowledge Hub provides the LLM (hosted, shared infrastructure, cost included in subscription)
- Users can connect their own OpenAI/Anthropic API keys for higher-quality models at their cost

**Privacy trade-off:** Data leaves the user's machine and lives on KH servers. For regulated
industries, this is usually not acceptable without specific compliance certifications (BAA for
HIPAA, etc.). For non-regulated teams, it is usually acceptable.

**The pitch:** "Upload your documents. Get intelligence. No setup, no server, no Ollama.
Just pay and use."

**Our effort:** Requires cloud infrastructure, billing, account management, data isolation.
Not before Stage 3. This unlocks the largest addressable market.

---

## Model 4 — Pay-Per-Query (Shared Infrastructure)

**What it is:** The user sends documents + queries. Knowledge Hub processes them on shared
infrastructure. They pay per query or per document indexing. No subscription required.
Low friction, no commitment.

**Who uses it:**
- Individual users who need intelligence occasionally — not every day
- People who want to try before subscribing
- Users with a one-time problem ("I have 200 documents from this project I need to synthesize")
- Non-technical users who want no setup whatsoever
- Students, freelancers, and individuals with constrained budgets but occasional need

**Technical requirement:** A browser and a credit card.

**Cost to user:** Usage-based.
- Document indexing: ~$0.05 per document
- Query: ~$0.02–0.05 per query
- Estimated casual user: $5–15/month at natural usage
- No commitment, no subscription

**Privacy trade-off:** Data goes to our servers. For regulated industries, this is not viable.
For personal documents, side projects, and non-sensitive use cases, it removes all friction.
We do not train on user data. We process and return. This must be crystal clear.

**The pitch:** "No Ollama. No subscription. Drop your files. Ask your questions. Pay $0.02 per query.
Walk away when you're done."

**Our effort:** Requires full cloud infrastructure + billing per query + usage metering.
This is the last deployment model to build. It requires Stage 3+ and cloud infrastructure.
But it's the highest-volume, lowest-friction acquisition channel — it's how people discover KH.

---

## Deployment Model × Segment Matrix

| Segment | Local-First | Self-Hosted | KH Cloud | Pay-Per-Query |
|---------|-------------|-------------|----------|----------------|
| Solo medical/legal/financial | Primary | Possible | No | No |
| Independent consultant | Primary | Possible | Rare | No |
| Researcher / academic | Primary | Possible | Rare | No |
| Eng team (startup) | Secondary | Possible | Primary | No |
| Eng team (enterprise) | Possible | Primary | Possible | No |
| Product/marketing team | Rare | Possible | Primary | No |
| Large org (healthcare/legal/govt) | No | Primary | No | No |
| Personal KM user | Primary | No | Possible | Primary |
| Casual / one-time user | Rare | No | No | Primary |

---

## The Strategic Insight on Deployment

The pay-per-query model is the lowest-friction customer acquisition channel in the future.
A user uploads 50 documents, asks 10 questions, pays $1.50, gets value, and subscribes.

But we must not build it before we have something worth subscribing to.
The sequence: local-first works → KH managed cloud works → pay-per-query as acquisition.

Local-first is not a limitation to eventually overcome.
It is the differentiator that makes us trusted by the segments that matter most.
