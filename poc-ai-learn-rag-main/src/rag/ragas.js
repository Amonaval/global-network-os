/**
 * RAGAS Evaluation Pipeline — LLM-as-judge, no Python deps
 *
 * Metrics:
 *   Faithfulness     — are answer claims grounded in retrieved context?
 *   Context Precision — are retrieved chunks relevant to the question?
 *   Context Recall    — does retrieved context cover the ground-truth answer?
 *
 * Data files:
 *   data/ragas_eval_set.jsonl  — synthetic test dataset (generated once)
 *   data/ragas_history.jsonl   — one line per evaluation run
 */

require('dotenv').config({ path: process.env.DOTENV_PATH || require('path').resolve(__dirname, '../../.env') });

const fs   = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const { getVectorStore } = require('../vectorstore/store');
const { query }          = require('./query');

const DATA_DIR          = process.env.DATA_DIR || path.resolve(process.cwd(), './data');
const EVAL_SET_PATH     = path.join(DATA_DIR, 'ragas_eval_set.jsonl');
const HISTORY_PATH      = path.join(DATA_DIR, 'ragas_history.jsonl');

// ── LLM caller (non-streaming, mirrors query.js pattern) ─────────────────────

async function callLLM(systemPrompt, userPrompt) {
  const provider = (process.env.LLM_PROVIDER || 'ollama').toLowerCase();

  if (provider === 'claude') {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.includes('sk-ant-...')) throw new Error('ANTHROPIC_API_KEY not set');
    const model = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';
    const res   = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 512, system: systemPrompt, messages: [{ role: 'user', content: userPrompt }] }),
    });
    const data = await res.json();
    if (data.error) throw new Error('Claude: ' + data.error.message);
    return data.content?.[0]?.text || '';
  }

  if (provider === 'vllm') {
    const baseUrl = process.env.VLLM_BASE_URL || 'http://localhost:8000';
    const model   = process.env.VLLM_MODEL    || 'default';
    const res     = await fetch(baseUrl + '/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], temperature: 0.1, max_tokens: 512 }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // Default: Ollama
  const model   = process.env.OLLAMA_MODEL    || 'qwen2.5:3b';
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const res     = await fetch(baseUrl + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      stream: false,
      options: { temperature: 0.1, num_predict: 512 },
    }),
  });
  const data = await res.json();
  return data.message?.content || data.response || '';
}

function safeJSON(text) {
  // strip markdown fences if present
  const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  try { return JSON.parse(clean); } catch (_) { return null; }
}

// ── Metric: Faithfulness ──────────────────────────────────────────────────────
// Score: fraction of answer claims that are grounded in the retrieved context

async function scoreFaithfulness(question, answer, contextStr) {
  if (!answer || answer.length < 20) return 0;

  const system = 'You are an evaluation assistant. Return ONLY valid JSON, no markdown fences, no extra text.';
  const user   = `Given this retrieved context and an answer, evaluate how faithfully the answer is grounded in the context.

Context:
${contextStr.substring(0, 2000)}

Question: ${question}
Answer: ${answer.substring(0, 800)}

Identify each factual claim in the answer, then check if it is supported by the context.
Return JSON: {"claims": [{"claim": "...", "supported": true/false}]}`;

  const raw    = await callLLM(system, user);
  const parsed = safeJSON(raw);
  if (!parsed?.claims?.length) return 0.5; // neutral fallback

  const supported = parsed.claims.filter(c => c.supported === true).length;
  return supported / parsed.claims.length;
}

// ── Metric: Context Precision ─────────────────────────────────────────────────
// Score: fraction of retrieved chunks that are actually relevant to the question

async function scoreContextPrecision(question, chunks) {
  if (!chunks?.length) return 0;

  const system = 'You are an evaluation assistant. Return ONLY valid JSON, no markdown fences, no extra text.';
  const chunkList = chunks.slice(0, 6).map((c, i) =>
    `[${i}] ${c.text?.substring(0, 400) || ''}`
  ).join('\n\n');

  const user = `Given a question and retrieved document passages, judge whether each passage is relevant to answering the question.

Question: ${question}

Passages:
${chunkList}

Return JSON: {"relevance": [{"idx": 0, "relevant": true/false}, ...]} for each passage.`;

  const raw    = await callLLM(system, user);
  const parsed = safeJSON(raw);
  if (!parsed?.relevance?.length) return 0.5;

  // Weighted precision: earlier positions matter more
  let weightedSum = 0;
  let weightTotal = 0;
  let runningRelevant = 0;

  for (let k = 0; k < parsed.relevance.length; k++) {
    const isRelevant = parsed.relevance[k]?.relevant === true;
    if (isRelevant) {
      runningRelevant++;
      // Precision at k+1, weighted by relevance at k
      weightedSum += runningRelevant / (k + 1);
      weightTotal++;
    }
  }

  return weightTotal > 0 ? weightedSum / weightTotal : 0;
}

// ── Metric: Context Recall ────────────────────────────────────────────────────
// Score: fraction of ground-truth answer covered by retrieved context

async function scoreContextRecall(question, groundTruth, contextStr) {
  if (!groundTruth || groundTruth.length < 10) return null; // skip if no GT

  const system = 'You are an evaluation assistant. Return ONLY valid JSON, no markdown fences, no extra text.';
  const user   = `Given a ground-truth answer and retrieved context, assess how much of the ground truth is covered by the context.

Ground-truth answer: ${groundTruth.substring(0, 600)}

Retrieved context:
${contextStr.substring(0, 2000)}

Break the ground-truth answer into individual statements. For each, check if the context contains the information needed to support it.
Return JSON: {"statements": [{"statement": "...", "covered": true/false}]}`;

  const raw    = await callLLM(system, user);
  const parsed = safeJSON(raw);
  if (!parsed?.statements?.length) return 0.5;

  const covered = parsed.statements.filter(s => s.covered === true).length;
  return covered / parsed.statements.length;
}

// ── Generate synthetic eval set ───────────────────────────────────────────────

async function generateEvalSet(targetCount = 30, onProgress = null) {
  const store  = getVectorStore();
  const chunks = store._data;

  if (chunks.length === 0) throw new Error('No chunks indexed. Run npm run ingest first.');

  // Sample chunks spread across sections
  const sections = [...new Set(chunks.map(c => c.meta?.section).filter(Boolean))];
  const perSection = Math.max(2, Math.ceil(targetCount / Math.max(sections.length, 1)));

  const samples = [];
  for (const section of sections) {
    const sectionChunks = chunks.filter(c => c.meta?.section === section && c.text?.length > 100);
    // Prefer content-rich chunks, skip very short ones
    const rich = sectionChunks.filter(c => c.text.length > 200);
    const pool  = rich.length > 0 ? rich : sectionChunks;
    const count = Math.min(perSection, pool.length);

    // Spread sampling evenly across the section
    const step = Math.max(1, Math.floor(pool.length / count));
    for (let i = 0; i < count && samples.length < targetCount; i++) {
      samples.push(pool[i * step] || pool[i]);
    }
  }

  // Shuffle to avoid section ordering bias
  for (let i = samples.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [samples[i], samples[j]] = [samples[j], samples[i]];
  }

  const evalItems = [];
  const system = 'You are an evaluation dataset generator. Return ONLY valid JSON, no markdown fences.';

  for (let i = 0; i < Math.min(samples.length, targetCount); i++) {
    const chunk = samples[i];
    if (onProgress) onProgress(i + 1, Math.min(samples.length, targetCount));

    const user = `Based on this document passage, generate a question that is directly and specifically answered by this passage, plus a concise ground-truth answer.

Passage:
${chunk.text.substring(0, 600)}

Rules:
- The question must be answerable ONLY from this passage (not general knowledge)
- The ground truth answer must be extractable from the passage
- Prefer specific factual questions over vague ones

Return JSON: {"question": "...", "ground_truth": "..."}`;

    try {
      const raw    = await callLLM(system, user);
      const parsed = safeJSON(raw);
      if (!parsed?.question || !parsed?.ground_truth) continue;

      evalItems.push({
        id:              'eval_' + Date.now() + '_' + i,
        question:        parsed.question,
        ground_truth:    parsed.ground_truth,
        source_section:  chunk.meta?.section  || '',
        source_title:    chunk.meta?.title    || '',
        chunk_text:      chunk.text.substring(0, 500),
        generated_at:    new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[RAGAS] Skipped item ' + i + ': ' + err.message);
    }
  }

  // Write eval set
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(EVAL_SET_PATH, evalItems.map(e => JSON.stringify(e)).join('\n') + '\n');
  return evalItems;
}

// ── Run full RAGAS evaluation ─────────────────────────────────────────────────

async function runEval(onProgress = null) {
  if (!fs.existsSync(EVAL_SET_PATH)) {
    throw new Error('No eval set found. Call generateEvalSet() first.');
  }

  const items = fs.readFileSync(EVAL_SET_PATH, 'utf8')
    .split('\n').filter(l => l.trim())
    .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
    .filter(Boolean);

  if (items.length === 0) throw new Error('Eval set is empty.');

  const results = [];
  const t0 = Date.now();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (onProgress) onProgress(i + 1, items.length, item.question);

    try {
      // Run retrieval + answer generation
      const result = await query(item.question);

      const contextStr = (result.chunks || [])
        .slice(0, 6)
        .map((c, idx) => '[' + (idx + 1) + '] ' + (c.text || '').substring(0, 400))
        .join('\n\n');

      if (result.blocked || !result.answer) {
        results.push({
          question:         item.question,
          faithfulness:     0,
          contextPrecision: 0,
          contextRecall:    0,
          blocked:          true,
          latencyMs:        0,
        });
        continue;
      }

      const [faith, ctxPrec, ctxRecall] = await Promise.all([
        scoreFaithfulness(item.question, result.answer, contextStr),
        scoreContextPrecision(item.question, result.chunks?.slice(0, 6) || []),
        scoreContextRecall(item.question, item.ground_truth, contextStr),
      ]);

      results.push({
        question:         item.question,
        faithfulness:     parseFloat((faith || 0).toFixed(3)),
        contextPrecision: parseFloat((ctxPrec || 0).toFixed(3)),
        contextRecall:    ctxRecall !== null ? parseFloat((ctxRecall).toFixed(3)) : null,
        blocked:          false,
        answeredChunks:   result.chunks?.length || 0,
      });
    } catch (err) {
      console.warn('[RAGAS] Error on item ' + i + ': ' + err.message);
      results.push({ question: item.question, error: err.message });
    }
  }

  // Aggregate
  const valid = results.filter(r => !r.blocked && !r.error);
  const avg   = (field) => {
    const vals = valid.map(r => r[field]).filter(v => v !== null && v !== undefined);
    return vals.length > 0 ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(3)) : null;
  };

  const summary = {
    ts:                   new Date().toISOString(),
    totalItems:           items.length,
    evaluatedItems:       valid.length,
    blockedItems:         results.filter(r => r.blocked).length,
    faithfulness:         avg('faithfulness'),
    contextPrecision:     avg('contextPrecision'),
    contextRecall:        avg('contextRecall'),
    durationMs:           Date.now() - t0,
    results,
  };

  // Append to history
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.appendFileSync(HISTORY_PATH, JSON.stringify(summary) + '\n');

  return summary;
}

// ── Read history ──────────────────────────────────────────────────────────────

function loadHistory() {
  if (!fs.existsSync(HISTORY_PATH)) return [];
  return fs.readFileSync(HISTORY_PATH, 'utf8')
    .split('\n').filter(l => l.trim())
    .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
    .filter(Boolean)
    .map(r => ({
      ts:               r.ts,
      totalItems:       r.totalItems,
      evaluatedItems:   r.evaluatedItems,
      blockedItems:     r.blockedItems,
      faithfulness:     r.faithfulness,
      contextPrecision: r.contextPrecision,
      contextRecall:    r.contextRecall,
      durationMs:       r.durationMs,
    }));
}

function getEvalSetStatus() {
  if (!fs.existsSync(EVAL_SET_PATH)) return { exists: false, count: 0 };
  const items = fs.readFileSync(EVAL_SET_PATH, 'utf8')
    .split('\n').filter(l => l.trim())
    .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
    .filter(Boolean);
  return {
    exists:     true,
    count:      items.length,
    sections:   [...new Set(items.map(i => i.source_section).filter(Boolean))],
    generatedAt: items[0]?.generated_at || null,
  };
}

module.exports = { generateEvalSet, runEval, loadHistory, getEvalSetStatus, scoreFaithfulness, scoreContextPrecision, scoreContextRecall };
