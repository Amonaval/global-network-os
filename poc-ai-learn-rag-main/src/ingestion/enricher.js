/**
 * Contextual Chunk Enricher — Decision D.12
 *
 * Before embedding, prepend a short LLM-generated context sentence to each chunk
 * describing where it sits in the broader document.
 *
 * Anthropic (Sept 2024): this pattern reduces retrieval failures by ~67%.
 *
 * Usage:
 *   const { enrichChunks } = require('./enricher');
 *   const enriched = await enrichChunks(chunks, { onProgress });
 *   // Each chunk gains: enrichedText = "<context>\n\n<original text>"
 *
 * Controlled by env:
 *   CONTEXTUAL_ENRICHMENT=true       — enable (default: false)
 *   ENRICHMENT_CONCURRENCY=3         — parallel LLM calls (default: 3)
 *   ENRICHMENT_MAX_DOC_CHARS=2000    — max doc context chars sent to LLM (default: 2000)
 */

require('dotenv').config({ path: process.env.DOTENV_PATH || require('path').resolve(__dirname, '../../.env') });
const fetch  = require('node-fetch');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const DATA_DIR       = process.env.DATA_DIR || path.resolve(process.cwd(), './data');
const CACHE_PATH     = path.join(DATA_DIR, 'enrichment_cache.json');
const CONCURRENCY    = parseInt(process.env.ENRICHMENT_CONCURRENCY    || '3',    10);
const MAX_DOC_CHARS  = parseInt(process.env.ENRICHMENT_MAX_DOC_CHARS  || '2000', 10);
const MAX_CTX_TOKENS = 150; // target output length per chunk context

function isEnabled() {
  return (process.env.CONTEXTUAL_ENRICHMENT || '').toLowerCase() === 'true';
}

// ── Cache ────────────────────────────────────────────────────────────────────

function loadCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  } catch (_) {}
  return {};
}

function saveCache(cache) {
  try {
    fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache));
  } catch (_) {}
}

function cacheKey(chunkText, docTitle) {
  return crypto.createHash('md5').update(chunkText + '||' + docTitle).digest('hex');
}

// ── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(chunkText, docTitle, docSection, docIntro) {
  return [
    '<document_title>' + docTitle + '</document_title>',
    '<document_section>' + docSection + '</document_section>',
    docIntro
      ? '<document_overview>\n' + docIntro.slice(0, MAX_DOC_CHARS) + '\n</document_overview>'
      : '',
    '',
    '<chunk>',
    chunkText,
    '</chunk>',
    '',
    'Write 1–2 sentences situating this chunk within the document. Include: what document/project/client/case this belongs to, what topic or decision it addresses, and any key named entities. Answer only with the context sentences — no preamble, no "This chunk...".',
  ].filter(l => l !== null).join('\n');
}

// ── LLM call (non-streaming) ─────────────────────────────────────────────────

async function callLLM(prompt) {
  const provider = (process.env.LLM_PROVIDER || 'ollama').toLowerCase();

  if (provider === 'claude') {
    return await callClaude(prompt);
  } else if (provider === 'vllm') {
    return await callVLLM(prompt);
  } else {
    return await callOllama(prompt);
  }
}

async function callOllama(prompt) {
  const model   = process.env.OLLAMA_MODEL    || 'qwen2.5:3b';
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

  const res = await fetch(baseUrl + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      options: { temperature: 0, num_predict: MAX_CTX_TOKENS },
    }),
  });

  if (!res.ok) throw new Error('Ollama enrichment error: ' + res.status);
  const data = await res.json();
  return (data.message?.content || '').trim();
}

async function callClaude(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.includes('sk-ant-...')) throw new Error('ANTHROPIC_API_KEY not set');
  // Use the cheapest/fastest model for enrichment; override via ENRICHMENT_MODEL
  const model = process.env.ENRICHMENT_MODEL || 'claude-haiku-4-5-20251001';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: MAX_CTX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error('Claude enrichment error: ' + (d.error?.message || res.status));
  }
  const data = await res.json();
  return (data.content?.[0]?.text || '').trim();
}

async function callVLLM(prompt) {
  const baseUrl = process.env.VLLM_BASE_URL || 'http://localhost:8000';
  const model   = process.env.VLLM_MODEL    || 'default';

  const res = await fetch(baseUrl + '/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: MAX_CTX_TOKENS,
      temperature: 0,
    }),
  });

  if (!res.ok) throw new Error('vLLM enrichment error: ' + res.status);
  const data = await res.json();
  return (data.choices?.[0]?.message?.content || '').trim();
}

// ── Concurrency pool ──────────────────────────────────────────────────────────

async function runWithConcurrency(tasks, concurrency) {
  const results = new Array(tasks.length);
  let next = 0;

  async function worker() {
    while (next < tasks.length) {
      const idx = next++;
      results[idx] = await tasks[idx]();
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * enrichChunks
 *
 * Takes an array of chunks (each with a `.text` and `._docContext` field).
 * `_docContext` = { title, section, intro } — stripped before returning.
 *
 * Returns the same array with `enrichedText` added to each chunk.
 * If enrichment is disabled or fails for a chunk, `enrichedText` is not set
 * and downstream code falls back to `text`.
 *
 * @param {Array} chunks
 * @param {Object} opts
 * @param {Function} opts.onProgress  — called with (done, total, contextSentence)
 * @returns {Promise<Array>}
 */
async function enrichChunks(chunks, opts = {}) {
  if (!isEnabled()) return chunks;
  if (chunks.length === 0) return chunks;

  const { onProgress } = opts;
  const cache = loadCache();
  let cacheHits = 0;
  let done = 0;

  const tasks = chunks.map((chunk, i) => async () => {
    const docCtx  = chunk._docContext || {};
    const title   = docCtx.title   || chunk.meta?.title   || '';
    const section = docCtx.section || chunk.meta?.section || '';
    const intro   = docCtx.intro   || '';
    const key     = cacheKey(chunk.text, title);

    if (cache[key]) {
      cacheHits++;
      chunks[i] = { ...chunk, enrichedText: cache[key] + '\n\n' + chunk.text };
      done++;
      if (onProgress) onProgress(done, chunks.length, cache[key]);
      return;
    }

    try {
      const prompt  = buildPrompt(chunk.text, title, section, intro);
      const context = await callLLM(prompt);
      if (context) {
        cache[key]    = context;
        chunks[i]     = { ...chunk, enrichedText: context + '\n\n' + chunk.text };
      }
    } catch (err) {
      // Graceful degradation — enrichment failure never breaks ingestion
      process.stderr.write('\n  ⚠ Enrichment failed for chunk ' + i + ': ' + err.message + '\n');
    }

    done++;
    if (onProgress) onProgress(done, chunks.length, cache[key] || '');
  });

  await runWithConcurrency(tasks, CONCURRENCY);

  saveCache(cache);
  return chunks;
}

module.exports = { enrichChunks, isEnabled };
