# Strategic Review

Trigger this after every major feature ships, before starting any new multi-week mission, or at minimum monthly.

## Context Loading

Read in this order before answering anything:

1. `.claude/.company/00_COMPANY_CONSTITUTION.md`
2. `.claude/.company/02_EXECUTIVE_COUNCIL.md`
3. `.claude/.product/00_PRODUCT_VISION.md`
4. `.claude/.product/01_CEO_DASHBOARD.md`
5. `.claude/.product/04_NEXT_MISSION.md`
6. `.claude/.product/07_FEATURE_BACKLOG.md`
7. `.claude/.product/08_WEEKLY_REVIEW.md`

---

## Review Questions

Answer ALL of the following from the Executive Council perspective (CEO, CTO, CPO, Principal Engineer, Chief of Staff, Investor, Customer). Do not ask the user to answer these — you answer them with a recommendation for each.

1. **Mission alignment:** Does the current next mission still make sense given the CEO Dashboard's stated biggest risk and bottleneck?

2. **Larger opportunity:** Is there a larger opportunity we are not pursuing? What would a $1B company do differently at this stage?

3. **Feature bloat check:** Are we in feature bloat mode? List any recent or queued features that do not compound the intelligence moat or move toward a paying customer.

4. **Highest ROI next step:** What is the single highest ROI next action toward 1,000 paying customers? Is it what's currently in Active?

5. **Roadmap change:** Should the roadmap change? If yes, state specifically what moves, what gets dropped, and what the new sequence is.

6. **Document updates:** Which documents need to be updated based on this review? List only documents where something has changed — never recommend updates without new knowledge.

---

## Output Format

- Answer each question directly. Do not present options — give a recommendation.
- Flag any misalignment between CEO Dashboard priorities and the Active mission.
- End with: recommended document changes (if any) and ask for approval before writing them.
- Keep the entire review under 600 words unless the roadmap change is significant.

---

## When to Skip This Review

Skip if no major feature has shipped since the last review and less than 30 days have passed.
