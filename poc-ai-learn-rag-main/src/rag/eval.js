/**
 * Evaluation CLI — analyse query logs in data/eval.jsonl
 *
 * Usage:
 *   npm run eval -- --summary          KPI overview
 *   npm run eval -- --blocked          All blocked (unanswered) queries
 *   npm run eval -- --tail 20          Last N queries
 *   npm run eval -- --section mdm      Queries that used a specific section
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const fs   = require('fs');
const path = require('path');

const DATA_DIR  = process.env.DATA_DIR || path.resolve(process.cwd(), './data');
const EVAL_PATH = path.join(DATA_DIR, 'eval.jsonl');

function loadEntries() {
  if (!fs.existsSync(EVAL_PATH)) {
    console.log('No eval log found at ' + EVAL_PATH);
    console.log('Ask some questions first — each query is logged automatically.');
    process.exit(0);
  }
  return fs.readFileSync(EVAL_PATH, 'utf8')
    .split('\n')
    .filter(l => l.trim())
    .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
    .filter(Boolean);
}

function bar(count, maxCount, width = 20) {
  const filled = Math.round((count / maxCount) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function formatPct(n, d) {
  return d > 0 ? Math.round((n / d) * 100) + '%' : '0%';
}

const args    = process.argv.slice(2);
const entries = loadEntries();

if (args.length === 0 || args.includes('--summary')) {
  const total    = entries.length;
  const blocked  = entries.filter(e => e.blocked).length;
  const answered = total - blocked;

  const avgScore = total > 0
    ? (entries.reduce((s, e) => s + (e.topSemScore || 0), 0) / total).toFixed(3)
    : '0.000';

  const avgLatency = total > 0
    ? Math.round(entries.reduce((s, e) => s + (e.latencyMs || 0), 0) / total)
    : 0;

  console.log('\n── Knowledge Hub — Eval Summary ──────────────────────────────');
  console.log('  Total queries   : ' + total);
  console.log('  Answered        : ' + answered + ' (' + formatPct(answered, total) + ')');
  console.log('  Blocked         : ' + blocked  + ' (' + formatPct(blocked,  total) + ')');
  console.log('  Avg sem score   : ' + avgScore);
  console.log('  Avg latency     : ' + avgLatency + 'ms');

  // Top sections
  const sectionCounts = {};
  for (const e of entries.filter(e => !e.blocked)) {
    for (const s of (e.sectionsUsed || [])) {
      sectionCounts[s] = (sectionCounts[s] || 0) + 1;
    }
  }
  const topSections = Object.entries(sectionCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 6);

  if (topSections.length > 0) {
    const maxCount = topSections[0][1];
    console.log('\n── Most-used sections ─────────────────────────────────────────');
    for (const [section, count] of topSections) {
      console.log('  ' + bar(count, maxCount) + ' ' + count + '  ' + section);
    }
  }

  console.log('\nRun with --blocked to see documentation gaps.\n');
}

if (args.includes('--blocked')) {
  const blocked = entries.filter(e => e.blocked);
  console.log('\n── Blocked Queries (Documentation Gaps) ──────────────────────');
  console.log('  These are questions users asked that the system couldn\'t answer.');
  console.log('  Add documentation for these topics to improve answer coverage.\n');

  if (blocked.length === 0) {
    console.log('  No blocked queries — great coverage!');
  } else {
    // Deduplicate similar questions
    const seen = {};
    for (const e of blocked) {
      const k = e.question.toLowerCase().trim();
      seen[k] = (seen[k] || 0) + 1;
    }
    const sorted = Object.entries(seen).sort((a, b) => b[1] - a[1]);
    for (const [q, count] of sorted) {
      const times = count > 1 ? ' (' + count + ' times)' : '';
      console.log('  • ' + q + times);
    }
  }
  console.log('');
}

if (args.includes('--tail')) {
  const n = parseInt(args[args.indexOf('--tail') + 1] || '20', 10);
  const recent = entries.slice(-n).reverse();

  console.log('\n── Last ' + n + ' Queries ─────────────────────────────────────────');
  console.log('  ' + ['Score', 'Latency', 'Status', 'Question'].join('\t'));
  console.log('  ' + '─'.repeat(70));
  for (const e of recent) {
    const score   = (e.topSemScore || 0).toFixed(2);
    const latency = (e.latencyMs   || 0) + 'ms';
    const status  = e.blocked ? '❌ blocked' : '✅ answered';
    const q       = (e.question || '').substring(0, 60);
    console.log('  ' + [score, latency, status, q].join('\t'));
  }
  console.log('');
}

if (args.includes('--section')) {
  const sectionFilter = args[args.indexOf('--section') + 1];
  if (!sectionFilter) { console.error('Provide section name after --section'); process.exit(1); }

  const filtered = entries.filter(e =>
    !e.blocked && (e.sectionsUsed || []).includes(sectionFilter)
  );

  console.log('\n── Queries using section: ' + sectionFilter + ' ───────────────────────');
  if (filtered.length === 0) {
    console.log('  No queries found for this section.');
  } else {
    for (const e of filtered.slice(-20)) {
      console.log('  [' + (e.topSemScore || 0).toFixed(2) + '] ' + (e.question || '').substring(0, 80));
    }
  }
  console.log('');
}
