# Plan: Mission 5 — Score History

## Context
Mission 4 (CSV Batch Upload) is complete. Mission 5 adds localStorage-backed score history so brand managers can see how their product scores change over time after making PIM edits. Every `Calculate Score` click saves the result; scoring the same GTIN again shows a delta on the score card.

---

## Files to modify
- `app/app.js` — add history logic, modify `handleCalculate`, modify `buildScoreCard`
- `app/index.html` — add history section after `#scores-section`
- `app/styles.css` — add history panel styles

---

## Implementation

### 1. History storage (`app.js` — new block after Mission 4 section)

```javascript
const HISTORY_KEY = 'crs-history';
const HISTORY_MAX = 30;

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}

function saveToHistory(product, results) {
  const history = loadHistory();
  const scores = {};
  results.forEach(r => { scores[r.retailer] = r.score; });
  const entry = {
    gtin: product.gtin || '',
    title: product.title || '',
    scores,
    retailers: results.map(r => r.retailer),
    timestamp: Date.now(),
  };
  // Same GTIN → replace existing entry (keeps one record per product)
  const filtered = product.gtin ? history.filter(h => h.gtin !== product.gtin) : history;
  localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...filtered].slice(0, HISTORY_MAX)));
}

function getPreviousScores(gtin) {
  if (!gtin) return null;
  return loadHistory().find(h => h.gtin === gtin)?.scores || null;
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
```

### 2. Modify `handleCalculate` (`app.js`)

- Call `getPreviousScores(product.gtin)` **before** saving (captures the old value for delta)
- Pass `prevScores?.[retailer] ?? null` as second arg to `buildScoreCard`
- After rendering cards: call `saveToHistory(product, results)` then `renderHistoryPanel()`

### 3. Modify `buildScoreCard(result, prevScore = null)` (`app.js`)

Add delta display next to the score number:
```javascript
let deltaHtml = '';
if (prevScore !== null) {
  const delta = score - prevScore;
  if (delta !== 0) {
    const sign = delta > 0 ? '+' : '';
    const color = delta > 0 ? 'var(--green)' : 'var(--red)';
    deltaHtml = `<span class="score-delta" style="color:${color}">${sign}${delta}</span>`;
  }
}
// Place deltaHtml immediately after the score number in the template
```

### 4. Add `renderHistoryPanel` and `clearHistory` (`app.js`)

- `renderHistoryPanel()` reads `loadHistory()`, shows/hides `#history-section`, builds a table (GTIN | Title | Scores | When)
- Score chips per retailer use `scoreColor()` for color coding (reusing existing function)
- Attaches `clearHistory` to a "Clear History" button rendered inside the panel
- `clearHistory()` — `confirm()` dialog → `localStorage.removeItem(HISTORY_KEY)` → re-render

### 5. Add history section (`index.html`)

After `#scores-section`, before the batch upload section:
```html
<section id="history-section" style="display:none">
  <div class="card" id="history-panel"></div>
</section>
```

### 6. Add styles (`styles.css`)

```css
.score-delta { font-size: 13px; font-weight: 700; margin-left: 6px; vertical-align: middle; }
```
History table reuses existing `#batch-results` table styles (same th/td padding + border patterns).

---

## Success criteria (from mission spec)
1. Every scored product saves to localStorage immediately
2. History panel appears after first score, shows up to 30 entries
3. Scoring the same GTIN twice shows a delta on the score card ("+8 since last score")
4. Single-product scoring experience unchanged — history is additive
5. Clear history button wipes localStorage cleanly
