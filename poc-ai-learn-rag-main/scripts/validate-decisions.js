/**
 * Decision Graph Validator
 *
 * Runs extraction against the current vector store, scores every extracted
 * decision on a quality rubric, and writes a validation report to
 * project-docs/features/DECISION_GRAPH_VALIDATION.md.
 *
 * Usage:
 *   npm run validate:decisions
 *   npm run validate:decisions -- --no-extract    (skip re-extraction, score existing decisions.json)
 *   npm run validate:decisions -- --section confluence-eng  (only scan one section)
 *
 * The generated MD file ends with a ## Code Checklist section listing every
 * issue pattern found so engineers know exactly what to fix before the next run.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Bootstrap config so getDataDir() / getVectorStore() work outside server ─
process.env.DATA_DIR = process.env.DATA_DIR
  || path.join(__dirname, '..', 'data');

const { getDataDir }     = require('../src/config/config');
const { getVectorStore } = require('../src/vectorstore/store');
const { extractDecisions, loadDecisions } = require('../src/decisions/extract');

// ── CLI flags ────────────────────────────────────────────────────────────────
const args       = process.argv.slice(2);
const NO_EXTRACT = args.includes('--no-extract');
const _sIdx      = args.indexOf('--section');
const SECTION    = _sIdx !== -1 ? (args[_sIdx + 1] || null) : null;

// ── Sections considered non-engineering (produce false positives) ────────────
const NON_ENGINEERING_SECTIONS = new Set([
  'better-parenting-ideas',
  'personal',
  'recipes',
  'lifestyle',
]);

// ── Quality rubric ────────────────────────────────────────────────────────────
function scoreDecision(d) {
  const issues  = [];
  let   score   = 0;

  // Decision text quality
  const words = (d.decision || '').split(/\s+/).filter(Boolean).length;
  if (words < 3) {
    issues.push('VAGUE_DECISION: fewer than 3 words — too generic to be actionable');
  } else if (words > 15) {
    issues.push('LONG_DECISION: more than 15 words — did not respect 12-word limit');
  } else {
    score += 2;
  }

  // Has reason
  if (d.reason && d.reason.trim().length > 5) {
    score += 2;
  } else {
    issues.push('MISSING_REASON: no reason captured — WHY was not recorded');
  }

  // Has alternatives
  if (Array.isArray(d.alternatives) && d.alternatives.length > 0) {
    score += 1;
  } else {
    issues.push('NO_ALTERNATIVES: no rejected options captured');
  }

  // Source quality
  if (NON_ENGINEERING_SECTIONS.has(d.section)) {
    issues.push(`FALSE_POSITIVE_RISK: extracted from non-engineering section "${d.section}"`);
    score -= 2;
  }

  // Decision text smells
  if (/\b(good|great|nice|better|best|important|useful)\b/i.test(d.decision) && words < 6) {
    issues.push('GENERIC_LANGUAGE: decision text contains vague adjectives without specifics');
    score -= 1;
  }

  return { score: Math.max(score, 0), maxScore: 5, issues };
}

function grade(score, max) {
  const pct = score / max;
  if (pct >= 0.8) return '✅ Good';
  if (pct >= 0.5) return '⚠️  Fair';
  return '❌ Poor';
}

// ── Issue → code checklist mapping ───────────────────────────────────────────
const CHECKLIST_MAP = {
  VAGUE_DECISION:       'Tighten the LLM prompt: add example of bad decision ("Use React") vs good decision ("Use React over Vue for better TypeScript ecosystem support")',
  LONG_DECISION:        'Reinforce 12-word limit in the system prompt with a negative example',
  MISSING_REASON:       'Add instruction: "If the text implies a reason even indirectly, extract it; do not leave reason null unless truly absent"',
  NO_ALTERNATIVES:      'Add instruction: "If the text mentions any technology, approach, or option not chosen, add it to alternatives even if not explicitly marked as rejected"',
  FALSE_POSITIVE_RISK:  'Add a section-type pre-filter in extract.js: skip chunks whose section matches a configurable NON_ENGINEERING_SECTIONS list before sending to LLM',
  GENERIC_LANGUAGE:     'Add a post-LLM filter: reject decisions whose text matches /^(use|avoid|prefer)\\s+(good|great|nice|better|best)/i as too generic',
};

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const startTs = new Date().toISOString();
  console.log('\n🔍  Decision Graph Validator');
  console.log('    Data dir:', getDataDir());

  // ── Step 1: Extract (or load existing) ────────────────────────────────────
  let decisions, scanned, candidates, parseFailures;

  if (NO_EXTRACT) {
    console.log('\n  --no-extract: loading existing decisions.json…');
    decisions     = loadDecisions();
    scanned       = '(skipped)';
    candidates    = '(skipped)';
    parseFailures = '(skipped)';
  } else {
    console.log('\n  Loading vector store…');
    const store = getVectorStore();
    let chunks = store._data || [];

    if (SECTION) {
      chunks = chunks.filter(c => c.meta?.section === SECTION);
      console.log(`  Filtering to section "${SECTION}": ${chunks.length} chunks`);
    }

    if (chunks.length === 0) {
      console.log('  ⚠️  No chunks loaded. Run npm run ingest first.');
      process.exit(1);
    }

    console.log(`  ${chunks.length} chunks loaded. Running extraction…`);

    let lastStage = '';
    const result = await extractDecisions((progress) => {
      if (progress.stage !== lastStage) {
        lastStage = progress.stage;
        process.stdout.write('\n  ' + progress.stage + '…');
      } else {
        process.stdout.write('.');
      }
    });
    console.log('\n');

    decisions     = result.decisions;
    scanned       = result.scanned;
    candidates    = result.candidates;
    parseFailures = result.parseFailures || 0;
  }

  // ── Step 2: Score every decision ──────────────────────────────────────────
  const scored = decisions.map(d => ({
    ...d,
    ...scoreDecision(d),
  }));

  // ── Step 3: Aggregate stats ───────────────────────────────────────────────
  const totalScore    = scored.reduce((s, d) => s + d.score, 0);
  const maxTotalScore = scored.length * 5;
  const avgScore      = scored.length > 0 ? (totalScore / scored.length).toFixed(1) : 0;

  const issueCounts = {};
  const checklistItems = new Set();
  for (const d of scored) {
    for (const issue of d.issues) {
      const type = issue.split(':')[0];
      issueCounts[type] = (issueCounts[type] || 0) + 1;
      if (CHECKLIST_MAP[type]) checklistItems.add(type);
    }
  }

  const goodCount = scored.filter(d => d.score / 5 >= 0.8).length;
  const fairCount = scored.filter(d => d.score / 5 >= 0.5 && d.score / 5 < 0.8).length;
  const poorCount = scored.filter(d => d.score / 5 < 0.5).length;

  // ── Step 4: Sections breakdown ─────────────────────────────────────────────
  const sectionMap = {};
  for (const d of scored) {
    const s = d.section || 'unknown';
    if (!sectionMap[s]) sectionMap[s] = { count: 0, avgScore: 0, scores: [] };
    sectionMap[s].count++;
    sectionMap[s].scores.push(d.score);
  }
  for (const s of Object.values(sectionMap)) {
    s.avgScore = (s.scores.reduce((a, b) => a + b, 0) / s.scores.length).toFixed(1);
  }

  // ── Step 5: Build report ──────────────────────────────────────────────────
  const runDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const model   = process.env.OLLAMA_MODEL || process.env.LLM_PROVIDER || 'default';
  const overallGrade = scored.length === 0 ? 'N/A'
    : avgScore >= 4 ? '✅ Good' : avgScore >= 2.5 ? '⚠️  Fair' : '❌ Poor';

  let md = `# Decision Graph Validation Report

**Run date:** ${runDate}
**LLM model:** ${model}
**Mode:** ${NO_EXTRACT ? 'Score existing decisions.json (--no-extract)' : 'Full extraction + score'}
${SECTION ? `**Section filter:** \`${SECTION}\`` : ''}

---

## Summary

| Metric | Value |
|---|---|
| Chunks scanned | ${scanned} |
| Candidate chunks (matched signal patterns) | ${candidates} |
| Decisions extracted | ${decisions.length} |
| Parse failures | ${parseFailures} |
| Average quality score | ${avgScore} / 5.0 |
| Overall grade | ${overallGrade} |

### Quality Breakdown

| Grade | Count |
|---|---|
| ✅ Good (4–5) | ${goodCount} |
| ⚠️  Fair (2.5–3.9) | ${fairCount} |
| ❌ Poor (0–2.4) | ${poorCount} |

---

## Decisions by Section

| Section | Count | Avg Score | Engineering? |
|---|---|---|---|
${Object.entries(sectionMap).map(([s, v]) =>
  `| \`${s}\` | ${v.count} | ${v.avgScore} / 5 | ${NON_ENGINEERING_SECTIONS.has(s) ? '❌ Non-engineering' : '✅ Yes'} |`
).join('\n') || '| — | — | — | — |'}

---

## Scored Decisions

${scored.length === 0 ? '_No decisions extracted._' : scored.map((d, i) => `### ${i + 1}. ${d.decision}

| Field | Value |
|---|---|
| **Score** | ${d.score} / 5 — ${grade(d.score, 5)} |
| **Section** | \`${d.section}\` |
| **Source doc** | ${d.title || '—'} |
| **Reason** | ${d.reason || '_not captured_'} |
| **Alternatives** | ${d.alternatives.length > 0 ? d.alternatives.join(', ') : '_none captured_'} |

${d.issues.length > 0 ? '**Issues found:**\n' + d.issues.map(i => `- ⚠️  ${i}`).join('\n') : '_No issues._'}

> ${d.sourceText ? d.sourceText.slice(0, 200).replace(/\n/g, ' ') + '…' : ''}

`).join('\n')}

---

## Issue Summary

${Object.keys(issueCounts).length === 0 ? '✅ No issues found.' :
  Object.entries(issueCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `| \`${type}\` | ${count} occurrence${count > 1 ? 's' : ''} |`)
    .join('\n')
    ? `| Issue Type | Count |\n|---|---|\n` + Object.entries(issueCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => `| \`${type}\` | ${count} |`)
        .join('\n')
    : ''
}

---

## Code Checklist

${checklistItems.size === 0
  ? '✅ No code changes needed based on this run.'
  : [...checklistItems].map((type, i) =>
      `- [ ] **${type}** — ${CHECKLIST_MAP[type]}`
    ).join('\n')
}

---

## How to Re-run

\`\`\`bash
# Full extraction + validation
npm run validate:decisions

# Score existing decisions.json without re-extracting (fast)
npm run validate:decisions -- --no-extract

# Validate only one section
npm run validate:decisions -- --section confluence-eng
\`\`\`

---

*Generated by \`scripts/validate-decisions.js\` on ${startTs}*
`;

  // ── Step 6: Write report ──────────────────────────────────────────────────
  const outPath = path.join(__dirname, '..', 'project-docs', 'features', 'DECISION_GRAPH_VALIDATION.md');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, md);

  console.log('📄  Report written to: project-docs/features/DECISION_GRAPH_VALIDATION.md');
  console.log(`\n    Decisions: ${decisions.length}  |  Avg score: ${avgScore}/5  |  Grade: ${overallGrade}`);
  if (checklistItems.size > 0) {
    console.log(`\n    ⚠️  ${checklistItems.size} code checklist item(s) found — see the report.\n`);
  } else {
    console.log('\n    ✅  No code issues detected.\n');
  }
}

main().catch(err => {
  console.error('Validation failed:', err.message);
  process.exit(1);
});
