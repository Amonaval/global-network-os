/**
 * Engineering Copilot — Implementation Plan Generator
 *
 * Reads the feature spec, retrieves relevant codebase + documentation context,
 * and produces a structured implementation plan BEFORE any code is written.
 *
 * Output: markdown plan with five sections:
 *   1. Affected Modules
 *   2. Reuse Opportunities
 *   3. Implementation Order
 *   4. Decision References
 *   5. Flagged Risks
 *
 * Does NOT generate code.
 */

require('dotenv').config({ path: process.env.DOTENV_PATH || require('path').resolve(__dirname, '../../.env') });
const fetch  = require('node-fetch');
const path   = require('path');
const fs     = require('fs');

const { getEmbedder }    = require('../ingestion/embedder');
const { getVectorStore } = require('../vectorstore/store');
const { compressContext } = require('./query');

const DATA_DIR     = process.env.DATA_DIR || path.resolve(process.cwd(), './data');
const COPILOT_LOG  = path.join(DATA_DIR, 'copilot_log.jsonl');

const TOP_K_PLAN        = parseInt(process.env.COPILOT_TOP_K      || '80',    10);
const CTX_BUDGET_PLAN   = parseInt(process.env.COPILOT_CTX_BUDGET || '25000', 10);
const MAX_OUTPUT_TOKENS = parseInt(process.env.COPILOT_MAX_TOKENS || '4096',  10);
const MIN_SCORE_PLAN    = parseFloat(process.env.COPILOT_MIN_SCORE || '0.04');

const SYSTEM_COPILOT = `You are an expert software architect embedded in this codebase and documentation system.

Your job is to produce an IMPLEMENTATION PLAN for the feature described by the user.

CRITICAL RULES:
- Do NOT generate any code.
- Do NOT write pseudocode.
- Think carefully before writing. The plan is the product.
- Only reference file names, modules, functions, and patterns that appear in the provided context.
- If something is unknown, say so explicitly — never invent identifiers.

Your output must contain exactly these five sections in order:

## 1. Affected Modules
List every file that must be created or modified. For each, state whether it is a CREATE or MODIFY operation and one sentence on what changes.

## 2. Reuse Opportunities
List existing functions, patterns, abstractions, or modules that should be reused. Explain what each provides and why it should not be reimplemented.

## 3. Implementation Order
A numbered step-by-step sequence. Start from the lowest-level change (data/API) and work up to the highest (UI/consumer). Each step names the specific file or function to touch.

## 4. Decision References
List any architectural decisions from the context that are relevant to this feature. Quote the decision title and explain the constraint it places on the implementation.

## 5. Flagged Risks
List risks, unknowns, or potential breakage points. These might be: missing context, conflicting patterns, performance concerns, or gaps in the current knowledge base that should be resolved before coding begins.

Be specific. Vague plan sections are useless. If you cannot produce a section with real references from the context, say "Not enough context — [what is missing]" rather than writing placeholders.`;

function logCopilot(entry) {
  try {
    fs.mkdirSync(path.dirname(COPILOT_LOG), { recursive: true });
    fs.appendFileSync(COPILOT_LOG, JSON.stringify(entry) + '\n');
  } catch (_) {}
}

function buildFileInventory(store) {
  const chunks = store._data || [];
  const fileCounts = {};
  for (const c of chunks) {
    const title = c.meta?.title || c.meta?.section || '';
    if (!title) continue;
    fileCounts[title] = (fileCounts[title] || 0) + 1;
  }
  const entries = Object.entries(fileCounts);
  if (entries.length === 0) return '';
  const lines = entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 60)
    .map(([title, count]) => `- ${title} (${count} chunk${count !== 1 ? 's' : ''})`);
  return '## Files available in this codebase and knowledge base:\n' + lines.join('\n');
}

// ── LLM streaming adapters ───────────────────────────────────────────────────

async function ollamaStream(systemPrompt, userMsg, onToken) {
  const model   = process.env.OLLAMA_MODEL    || 'qwen2.5:3b';
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

  let res;
  try {
    res = await fetch(baseUrl + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }],
        stream: true,
        options: { temperature: 0.1, num_predict: MAX_OUTPUT_TOKENS },
      }),
    });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') throw new Error('Ollama is not running. Run: ollama serve');
    throw err;
  }

  if (!res.ok) {
    const body = await res.text();
    if (body.includes('not found')) throw new Error('Model "' + model + '" not found. Run: ollama pull ' + model);
    throw new Error('Ollama error: ' + body);
  }

  return new Promise((resolve, reject) => {
    let fullText = '';
    let buffer   = '';

    res.body.on('data', chunk => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data  = JSON.parse(line);
          const token = data.message?.content || '';
          if (token) { fullText += token; onToken(token); }
        } catch (_) {}
      }
    });

    res.body.on('end', () => {
      if (buffer.trim()) {
        try {
          const data  = JSON.parse(buffer);
          const token = data.message?.content || '';
          if (token) { fullText += token; onToken(token); }
        } catch (_) {}
      }
      resolve(fullText);
    });

    res.body.on('error', reject);
  });
}

async function claudeStream(systemPrompt, userMsg, onToken) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.includes('sk-ant-...')) throw new Error('ANTHROPIC_API_KEY not set in .env');
  const model = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMsg }],
      stream: true,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error('Claude API: ' + (data.error?.message || res.status));
  }

  return new Promise((resolve, reject) => {
    let fullText = '';
    let buffer   = '';

    res.body.on('data', chunk => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') return;
        try {
          const evt = JSON.parse(raw);
          if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
            const token = evt.delta.text;
            fullText += token;
            onToken(token);
          }
        } catch (_) {}
      }
    });

    res.body.on('end',   () => resolve(fullText));
    res.body.on('error', reject);
  });
}

async function vllmStream(systemPrompt, userMsg, onToken) {
  const baseUrl = process.env.VLLM_BASE_URL || 'http://localhost:8000';
  const model   = process.env.VLLM_MODEL    || 'default';

  let res;
  try {
    res = await fetch(baseUrl + '/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }],
        temperature: 0.1,
        max_tokens: MAX_OUTPUT_TOKENS,
        stream: true,
      }),
    });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') throw new Error('vLLM not running at ' + baseUrl);
    throw err;
  }

  if (!res.ok) throw new Error('vLLM error (' + res.status + '): ' + await res.text());

  return new Promise((resolve, reject) => {
    let fullText = '';
    let buffer   = '';

    res.body.on('data', chunk => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') return;
        try {
          const json  = JSON.parse(payload);
          const token = json.choices?.[0]?.delta?.content || '';
          if (token) { fullText += token; onToken(token); }
        } catch (_) {}
      }
    });

    res.body.on('end',   () => resolve(fullText));
    res.body.on('error', reject);
  });
}

// ── Public API ───────────────────────────────────────────────────────────────

async function generatePlanStream(spec, options = {}, onToken) {
  const t0       = Date.now();
  const store    = getVectorStore();
  const embedder = getEmbedder();

  // Query both code uploads AND documentation — decisions live in docs, not uploads
  const sectionFilter = options.sections?.length > 0 ? options.sections : [];
  const filter = sectionFilter.length ? { sections: sectionFilter } : {};

  const queryVec = await embedder.embedOne(spec);
  store.setQuery(spec);
  const chunks = store.search(queryVec, TOP_K_PLAN, filter);

  if (chunks.length === 0) {
    const msg = 'No knowledge base context found. Add your documentation and code files first via Upload or the Manage menu.';
    onToken(msg);
    return { answer: msg, sources: [], debug: null };
  }

  const topScore = chunks[0]?.score ?? 0;
  if (topScore < MIN_SCORE_PLAN) {
    const msg = `No relevant context found for this spec (best match: ${Math.round(topScore * 100)}%). ` +
      'Try rephrasing with terms that appear in your codebase or documentation.';
    onToken(msg);
    return { answer: msg, sources: [], debug: { usedChunks: 0, budgetUsed: 0, latencyMs: Date.now() - t0, provider: process.env.LLM_PROVIDER || 'ollama' } };
  }

  const { contextStr, selectedChunks, budgetUsed, droppedLow, droppedDupe } =
    compressContext(chunks, CTX_BUDGET_PLAN, MIN_SCORE_PLAN);

  const fileInventory = buildFileInventory(store);

  const userMsg =
    (fileInventory ? fileInventory + '\n\n---\n\n' : '') +
    `**Relevant context from this codebase and knowledge base** (study these before planning):\n\n` +
    `${contextStr}\n\n---\n\n` +
    `**Feature spec — produce an implementation plan for this:**\n${spec}`;

  const provider = (process.env.LLM_PROVIDER || 'ollama').toLowerCase();

  let answer;
  if (provider === 'claude') {
    answer = await claudeStream(SYSTEM_COPILOT, userMsg, onToken);
  } else if (provider === 'vllm') {
    answer = await vllmStream(SYSTEM_COPILOT, userMsg, onToken);
  } else {
    answer = await ollamaStream(SYSTEM_COPILOT, userMsg, onToken);
  }

  const sources = selectedChunks.map(c => ({
    section: c.meta.section,
    title:   c.meta.title,
    url:     c.meta.url,
    score:   c.score,
  }));

  const debug = {
    usedChunks: selectedChunks.length,
    budgetUsed,
    droppedLow,
    droppedDupe,
    latencyMs:  Date.now() - t0,
    provider,
  };

  logCopilot({ ts: new Date().toISOString(), spec: spec.slice(0, 100), usedChunks: selectedChunks.length, latencyMs: debug.latencyMs });

  return { answer, sources, debug };
}

module.exports = { generatePlanStream };
