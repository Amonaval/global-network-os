# Plan: Coffee Chat Prep Kit — Teams Message Revision

## Context

We are building two small, real, demo-worthy plugins that run on top of PIM/MDM systems. Each product gets:
1. **An AI Company Operating System** (the md files pattern) — the product's brain
2. **Actual working product code** — the Chrome extension or web app

The demo story: "Before I wrote a single line of code, I set up the OS. Every architecture decision, every product principle, every roadmap direction is captured in these files. When I ask Claude to add a feature, it already knows the full context."

Output location: `D:\AI\AI_Learning_Projects\AI-Company-Examples-Product\` (directory already exists)

---

## Product 1 — Digital Shelf Auditor

**Folder:** `AI-Company-Examples-Product/digital-shelf-auditor/`

**What it does:** Chrome extension. Open any product page on Amazon, Walmart, or Target. Click the extension icon. It scores the product's content quality against retailer-specific requirements — title length, image count, bullet points, description length, enhanced content presence. Shows a Content Readiness Score (0–100) with a breakdown of what passes and what's missing.

**Demo moment:** Open a real Walmart product page live, click the extension, see the score and the gaps. Instantly relatable to any PIM/MDM audience.

### Tech Stack (Manifest V3 Chrome Extension — no backend, no API keys)

```
extension/
├── manifest.json           ← MV3, content_scripts for Amazon/Walmart/Target
├── content.js              ← Extracts product signals via DOM selectors
├── popup.html              ← Score UI (80px popup, score ring, breakdown list)
├── popup.js                ← Receives data from content.js, calculates score
├── styles.css              ← Extension popup styling
└── rules/
    └── retailer-rules.json ← Scoring weights and thresholds per retailer
```

### Scoring Logic

`retailer-rules.json` defines per-retailer requirements:
```json
{
  "walmart": {
    "title":    { "min": 50, "max": 75,   "weight": 20 },
    "images":   { "min": 4,  "max": 10,   "weight": 25 },
    "bullets":  { "min": 5,  "max": 8,    "weight": 20 },
    "description": { "min": 100, "weight": 15 },
    "price":    { "required": true,        "weight": 10 },
    "enhanced": { "bonus": true,           "weight": 10 }
  },
  "amazon": { ... },
  "target":  { ... }
}
```

`content.js` DOM selectors per retailer:
- **Amazon:** `#productTitle`, `#imageBlock img`, `#feature-bullets li`, `#productDescription`, `.a-carousel`
- **Walmart:** `.prod-ProductTitle`, `.prod-carousel`, `[data-testid="item-description"]`
- **Target:** `[data-test="product-title"]`, `[data-test="product-images"]`, `[data-test="item-details-description"]`

Message flow: `content.js` → `chrome.runtime.sendMessage` → `popup.js` → renders score

### OS Files (slimmed set — product company, not enterprise)

```
digital-shelf-auditor/
├── CLAUDE.md
├── README.md               ← Install instructions + demo guide
├── .company/
│   ├── 00_COMPANY_CONSTITUTION.md
│   └── 02_EXECUTIVE_COUNCIL.md
├── .product/
│   ├── 00_PRODUCT_VISION.md
│   ├── 01_CEO_DASHBOARD.md
│   └── 04_NEXT_MISSION.md
├── .engineering/
│   ├── ARCHITECTURE.md
│   └── DECISIONS.md
└── extension/              ← Actual Chrome extension code (above)
```

**OS Identity:**
- North Star: Shelf Score accuracy vs. manual audit > 90% → product earns trust
- Evolution: Chrome Extension → Firefox + Edge → SaaS dashboard → PIM plugin embed
- Key decisions: client-side only (zero data leaves browser), DOM-based extraction (no API dependency), retailer-first design (requirements are the product)
- Constitution principles: "We score what retailers actually penalize, not what looks good"; "Privacy is the product — no data leaves the browser"; "A wrong score is worse than no score"
- CEO Dashboard metrics: weekly active installs, score accuracy %, retailers supported, avg shelf score across users

---

## Product 2 — CRS Calculator

**Folder:** `AI-Company-Examples-Product/crs-calculator/`

**What it does:** Single-page web app. Enter product data (GTIN, title, description, image count, bullet count, enhanced content Y/N). Select target retailers. Get a Content Readiness Score per retailer with a breakdown: what passes, what fails, what would push the score higher. No login, no backend.

**Demo moment:** Paste a real product's data, show the score, change one field (e.g., add 2 more images), watch the score jump. Simple and immediate.

### Tech Stack (single HTML file — no build toolchain, opens in any browser)

```
app/
├── index.html              ← Everything: UI + scoring logic inline, or linked
├── app.js                  ← Scoring engine + UI interactions
├── styles.css              ← Clean, professional UI
└── data/
    └── retailer-rules.json ← Same rules format as digital-shelf-auditor
```

### App Structure

**Input fields:**
- GTIN (optional, for display)
- Product title (text input, shows char count live)
- Description (textarea, shows word count)
- Image count (number)
- Bullet point count (number)
- Enhanced content (checkbox)
- Category (dropdown: CPG / Apparel / Electronics / Home / Auto)

**Retailer selection:** Walmart, Target, Amazon, Kroger, Home Depot, CVS (checkboxes)

**Output per retailer:**
- Score 0–100 with color coding (red < 60, amber 60–79, green 80+)
- Breakdown table: each attribute → status (✓ / ✗ / △ improve) → gap description
- "Biggest fix" callout: one action that would improve score the most

### OS Files

```
crs-calculator/
├── CLAUDE.md
├── README.md               ← How to open + demo instructions
├── .company/
│   ├── 00_COMPANY_CONSTITUTION.md
│   └── 02_EXECUTIVE_COUNCIL.md
├── .product/
│   ├── 00_PRODUCT_VISION.md
│   ├── 01_CEO_DASHBOARD.md
│   └── 04_NEXT_MISSION.md
├── .engineering/
│   ├── ARCHITECTURE.md
│   └── DECISIONS.md
└── app/                    ← Actual web app code (above)
```

**OS Identity:**
- North Star: Time-to-first-80-CRS-score < 2 minutes → user immediately understands the tool
- Evolution: Calculator → CSV batch upload → REST API → embedded PIM widget
- Key decisions: no-code setup (open index.html = running app), rules-as-data (retailer rules are JSON, not hardcoded), open-source rules (community can contribute retailer requirements)
- Constitution principles: "The score must be explainable — every point gap must have a named fix"; "Rules are data, not code"; "Never gatekeep insights behind a login"
- CEO Dashboard metrics: sessions/week, avg score before vs. after first interaction, retailers covered, rules accuracy

---

## Shared Decisions Across Both Products

1. **Rules are shared** — `retailer-rules.json` is identical in both products. When a retailer updates requirements, one file change fixes both.
2. **No backend for MVP** — both run entirely client-side. No auth, no data storage, no infra cost.
3. **Same scoring formula** — weighted sum: `score = Σ(attribute_score × weight) / Σ(weights) × 100`
4. **OS structure is lighter than Syndigo** — 8 OS files per product (not 28+). A plugin product doesn't need 10 .product files.

---

## Build Sequence

**Phase 1 — OS files for both products (in parallel)**
Write all OS md files for both products. ~16 files total. These define the product identity before code starts.

**Phase 2 — Shared rules file**
Write `retailer-rules.json` once, copy to both `extension/rules/` and `app/data/`. Covers: Walmart, Target, Amazon (3 retailers for MVP).

**Phase 3 — CRS Calculator (simpler, build first)**
Write `index.html`, `app.js`, `styles.css`. Test: open in browser, enter a product, verify scores calculate and display correctly.

**Phase 4 — Digital Shelf Auditor extension**
Write `manifest.json`, `content.js`, `popup.html`, `popup.js`, `styles.css`. Test: load unpacked in Chrome, open a Walmart product page, verify score appears.

**Phase 5 — README files**
Write install/demo instructions for both. Include the exact demo script moment for each.

---

## Verification

- **CRS Calculator:** Open `app/index.html` in a browser. Enter a product with 2 images, 3 bullets, 60-char title targeting Walmart → score should be ~45–55 (red). Add 4 images, 5 bullets → score should jump to ~75 (amber).
- **Digital Shelf Auditor:** Load unpacked extension in Chrome (`chrome://extensions` → Developer mode → Load unpacked → select `extension/` folder). Navigate to any Walmart product page. Click extension icon → popup shows score and breakdown.
- **OS sanity check:** Open either product folder in Claude Code. Ask: "What is the North Star metric for this product?" → Claude should answer from `01_CEO_DASHBOARD.md` without searching.
