const fs   = require('fs');
const path = require('path');
const { getVectorStore } = require('../vectorstore/store');
const { getDataDir }     = require('../config/config');
const { askLlm }         = require('../rag/llm');

const DECISIONS_PATH = () => path.join(getDataDir(), 'decisions.json');

// Patterns that suggest a chunk contains a decision worth examining
const DECISION_SIGNALS = [
  // Active-voice decisions (explicit "we chose / decided / rejected")
  /\bwe (chose|selected|decided|picked|went with|opted for|use|adopted)\b/i,
  /\bwe (rejected|avoided|ruled out|dropped|didn't use|not using|do not use)\b/i,
  /\bthe reason (we|for|behind)\b/i,
  /\b(instead of|rather than|over)\b.{3,60}\b(because|since|as|for)\b/i,
  // Explicit decision markers
  /\bdecision\s*:/i,
  /\brationale\s*:/i,
  /\barchitectural(ly)? (decision|choice|trade.?off|rationale)\b/i,
  /\bdesign (decision|choice|rationale|pattern)\b/i,
  /\btrade.?off\b/i,
  // Passive-voice decisions (common in real documentation)
  /\b(was|were|is|are) (chosen|selected|adopted|preferred|used)\b.{0,40}\b(because|for|since|over)\b/i,
  /\b(chosen|selected|adopted|preferred)\b.{0,30}\b(over|instead|because|for)\b/i,
  // Recommendation language
  /\brecommend(ed|s)?\b/i,
  /\bprefer(red|s|ring)?\b.{0,40}\b(over|to|instead|rather)\b/i,
  /\bbest practice\b/i,
  // Negative recommendations (avoid / don't use)
  /\b(don'?t|do not|never|avoid|should not)\b.{0,30}\buse\b/i,
  // Technology stack language
  /\b(built (on|with|using)|powered by|relies on|depends on)\b/i,
  // Comparative advantage language
  /\balternative(s)?\b/i,
  /\badvantage (of|over)\b/i,
  /\bwhy (we|not|use|chose|choose|built|pick)\b/i,
  /\bdownside\b|\bdrawback\b|\blimitation\b/i,
];

const SYSTEM_PROMPT = `You extract engineering and architectural decisions from documentation text.

Output ONLY a JSON object. No markdown fences, no explanation, no text before or after. Just the JSON.

Format: {"hasDecision":true,"decision":"what was chosen (12 words max)","reason":"why (20 words max, or null)","alternatives":["rejected option"]}
If no clear decision: {"hasDecision":false,"decision":null,"reason":null,"alternatives":[]}

Rules:
- hasDecision true = text records WHAT was chosen, used, rejected, recommended, or preferred — and optionally WHY
- decision = the specific choice in plain language (e.g. "Use PostgreSQL over MySQL", "Avoid storing tokens in localStorage")
- reason = the stated reason, null if not mentioned
- alternatives = things explicitly rejected, avoided, or considered instead (empty array if none)
- Do NOT invent reasons or alternatives not present in the text

Example:
Input: "We chose PostgreSQL over MySQL because of better ACID compliance and our team's existing expertise."
Output: {"hasDecision":true,"decision":"Use PostgreSQL over MySQL","reason":"Better ACID compliance and team expertise","alternatives":["MySQL"]}`;

function isCandidate(text) {
  return DECISION_SIGNALS.some(p => p.test(text));
}

function parseDecisionJson(raw) {
  // Try direct parse first (clean response from Claude)
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch (_) {}

  // Fallback: extract the first complete {...} block from anywhere in the response.
  // This handles Qwen wrapping JSON in prose ("Here is the JSON: {...} Let me explain...")
  try {
    const start = raw.indexOf('{');
    const end   = raw.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
  } catch (_) {}

  return null;
}

async function extractDecisions(onProgress) {
  const store = getVectorStore();
  const allChunks = store._data || [];

  if (allChunks.length === 0) {
    return { decisions: [], scanned: 0, candidates: 0 };
  }

  // Deduplicate by text to avoid re-processing identical chunks from multiple sections
  const seen = new Set();
  const candidates = allChunks.filter(c => {
    if (!c.text || seen.has(c.text)) return false;
    seen.add(c.text);
    return isCandidate(c.text);
  });

  onProgress && onProgress({ stage: 'scanning', total: allChunks.length, candidates: candidates.length });

  const decisions = [];
  let processed     = 0;
  let parseFailures = 0;

  for (const chunk of candidates) {
    try {
      const raw    = await askLlm(SYSTEM_PROMPT, chunk.text.slice(0, 1200));
      const parsed = parseDecisionJson(raw);

      if (!parsed) {
        parseFailures++;
      } else if (parsed.hasDecision && parsed.decision) {
        decisions.push({
          id:           Buffer.from(chunk.text.slice(0, 60)).toString('base64').slice(0, 16),
          decision:     parsed.decision,
          reason:       parsed.reason   || null,
          alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives : [],
          section:      chunk.meta?.section  || 'Unknown',
          title:        chunk.meta?.title    || '',
          url:          chunk.meta?.url      || '',
          sourceText:   chunk.text.slice(0, 300),
          extractedAt:  new Date().toISOString(),
        });
      }
    } catch (_) {
      parseFailures++;
    }

    processed++;
    onProgress && onProgress({ stage: 'extracting', processed, total: candidates.length });
  }

  // Deduplicate by decision text (case-insensitive)
  const unique = [];
  const decisionsSeen = new Set();
  for (const d of decisions) {
    const key = d.decision.toLowerCase().trim();
    if (!decisionsSeen.has(key)) {
      decisionsSeen.add(key);
      unique.push(d);
    }
  }

  // Persist
  fs.mkdirSync(path.dirname(DECISIONS_PATH()), { recursive: true });
  fs.writeFileSync(DECISIONS_PATH(), JSON.stringify(unique, null, 2));

  return { decisions: unique, scanned: allChunks.length, candidates: candidates.length, parseFailures };
}

function loadDecisions() {
  const p = DECISIONS_PATH();
  if (!fs.existsSync(p)) return [];
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return []; }
}

module.exports = { extractDecisions, loadDecisions };
