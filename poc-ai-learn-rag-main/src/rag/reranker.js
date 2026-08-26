/**
 * Cross-Encoder Reranker — D.13
 *
 * After hybrid BM25+Dense+RRF returns top-N candidates, this module
 * re-scores them jointly with the query using a single LLM call.
 *
 * Strategy: ONE batched LLM call for all candidates → no per-chunk latency
 * Cost: ~150-300ms Ollama overhead for 10-20 chunks
 *
 * Enable: RERANKER_ENABLED=true in .env
 * Candidates fed in: RERANKER_CANDIDATES (default 20)
 * Final output: RERANKER_TOP_K (default 8)
 */

require('dotenv').config({ path: process.env.DOTENV_PATH || require('path').resolve(__dirname, '../../.env') });

const fetch  = require('node-fetch');
const crypto = require('crypto');

const ENABLED    = (process.env.RERANKER_ENABLED || 'false').toLowerCase() === 'true';
const CANDIDATES = parseInt(process.env.RERANKER_CANDIDATES || '20', 10);
const TOP_K      = parseInt(process.env.RERANKER_TOP_K      || '8',  10);

// Simple in-memory cache: (queryHash + candidatesHash) → scores[]
const _cache = new Map();
const MAX_CACHE = 200;

function hashKey(question, chunks) {
  const payload = question + '||' + chunks.map(c => c.text?.substring(0, 100) || '').join('|');
  return crypto.createHash('md5').update(payload).digest('hex');
}

async function callLLMReranker(question, chunks) {
  const provider = (process.env.LLM_PROVIDER || 'ollama').toLowerCase();

  // Use only first CANDIDATES chunks
  const candidates = chunks.slice(0, CANDIDATES);

  const chunkList = candidates
    .map((c, i) => `[${i}] ${(c.text || '').substring(0, 350)}`)
    .join('\n\n');

  const system = 'You are a relevance ranking assistant. Return ONLY valid JSON, no markdown fences, no extra text.';
  const user   = `Score each document passage for relevance to the question. Score 0.0 (not relevant) to 1.0 (directly answers the question).

Question: ${question}

Passages:
${chunkList}

Return JSON: {"scores": [{"idx": 0, "score": 0.9}, {"idx": 1, "score": 0.3}, ...]}
Include an entry for every passage index (0 to ${candidates.length - 1}).`;

  let raw = '';

  if (provider === 'claude') {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.includes('sk-ant-...')) throw new Error('ANTHROPIC_API_KEY not set');
    const model = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';
    const res   = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 512, system, messages: [{ role: 'user', content: user }] }),
    });
    const data = await res.json();
    if (data.error) throw new Error('Claude: ' + data.error.message);
    raw = data.content?.[0]?.text || '';
  } else if (provider === 'vllm') {
    const baseUrl = process.env.VLLM_BASE_URL || 'http://localhost:8000';
    const model   = process.env.VLLM_MODEL    || 'default';
    const res     = await fetch(baseUrl + '/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.0, max_tokens: 512 }),
    });
    const data = await res.json();
    raw = data.choices?.[0]?.message?.content || '';
  } else {
    const model   = process.env.OLLAMA_MODEL    || 'qwen2.5:3b';
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const res     = await fetch(baseUrl + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        stream: false,
        options: { temperature: 0.0, num_predict: 512 },
      }),
    });
    const data = await res.json();
    raw = data.message?.content || data.response || '';
  }

  // Parse scores
  const clean   = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  let parsed;
  try { parsed = JSON.parse(clean); } catch (_) { return null; }

  if (!parsed?.scores?.length) return null;
  return parsed.scores; // [{idx, score}]
}

/**
 * Rerank candidates by joint query-document relevance.
 * Returns top-K chunks with an added `rerankerScore` field.
 * Falls through (returns original) if disabled or LLM call fails.
 */
async function rerank(question, chunks) {
  if (!ENABLED || chunks.length <= 1) return chunks.slice(0, TOP_K);

  const key = hashKey(question, chunks.slice(0, CANDIDATES));

  if (_cache.has(key)) {
    const cached = _cache.get(key);
    return applyScores(chunks, cached);
  }

  let scores;
  try {
    scores = await callLLMReranker(question, chunks);
  } catch (err) {
    console.warn('[Reranker] LLM call failed, falling back to original order:', err.message);
    return chunks.slice(0, TOP_K);
  }

  if (!scores) return chunks.slice(0, TOP_K);

  // Manage cache size
  if (_cache.size >= MAX_CACHE) {
    const firstKey = _cache.keys().next().value;
    _cache.delete(firstKey);
  }
  _cache.set(key, scores);

  return applyScores(chunks, scores);
}

function applyScores(chunks, scores) {
  const scoreMap = {};
  for (const s of scores) scoreMap[s.idx] = s.score || 0;

  const candidates = chunks.slice(0, CANDIDATES);
  const reranked   = candidates.map((c, i) => ({
    ...c,
    rerankerScore: scoreMap[i] !== undefined ? scoreMap[i] : c.score,
  }));

  // Sort by reranker score (desc), fall back to original hybrid score
  reranked.sort((a, b) => (b.rerankerScore - a.rerankerScore) || (b.score - a.score));

  return reranked.slice(0, TOP_K);
}

module.exports = { rerank, ENABLED, CANDIDATES, TOP_K };
