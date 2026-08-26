/**
 * Code Generation Engine — Level 2
 *
 * Retrieves relevant codebase context via RAG and uses the LLM to generate
 * new code that matches the existing patterns, conventions, and architecture.
 *
 * Usage:
 *   const { generateCodeStream } = require('./codegen');
 *   await generateCodeStream(spec, options, onToken);
 */

require('dotenv').config({ path: process.env.DOTENV_PATH || require('path').resolve(__dirname, '../../.env') });
const fetch  = require('node-fetch');
const path   = require('path');
const fs     = require('fs');

const { getEmbedder }    = require('../ingestion/embedder');
const { getVectorStore } = require('../vectorstore/store');
const { compressContext } = require('./query');

const DATA_DIR    = process.env.DATA_DIR || path.resolve(process.cwd(), './data');
const CODEGEN_LOG = path.join(DATA_DIR, 'codegen_log.jsonl');

const TOP_K_CODE        = parseInt(process.env.CODEGEN_TOP_K      || '105',   10);
const CTX_BUDGET_CODE   = parseInt(process.env.CODEGEN_CTX_BUDGET || '30000', 10);
const MAX_OUTPUT_TOKENS = parseInt(process.env.CODEGEN_MAX_TOKENS || '52048', 10);
const MIN_SCORE_CODE    = parseFloat(process.env.CODEGEN_MIN_SCORE || '0.05');

const SYSTEM_CODEGEN = `You are an expert software engineer embedded in this codebase.

Your job is to generate NEW CODE for the feature described by the user.

Instructions:
1. Read every provided context file carefully. Understand the naming conventions, module patterns, function signatures, import style, error handling approach, and architectural style.
2. Generate complete, working code that follows these EXACT patterns. It must look like it was written by the same developer who wrote the context files.
3. Place the generated code inside a markdown code block with the correct language tag (e.g. \`\`\`javascript or \`\`\`python).
4. After the code block, add an **Integration Notes** section that explains:
   - Which file(s) to place this code in (or create)
   - Which existing functions/modules to import from
   - Which existing functions to call or extend
   - Any environment variables, dependencies, or config needed
5. Keep the code minimal and focused — only implement what was specified.
6. If you need to make assumptions, state them in the Integration Notes.
7. Never invent module paths or function names — only import or call identifiers that appear explicitly in the provided context or the file inventory above.`;

function logCodegen(entry) {
  try {
    fs.mkdirSync(path.dirname(CODEGEN_LOG), { recursive: true });
    fs.appendFileSync(CODEGEN_LOG, JSON.stringify(entry) + '\n');
  } catch (_) {}
}

// ── File inventory ───────────────────────────────────────────────────────────

function buildFileInventory(store, sections) {
  const chunks = store._data || [];
  const fileCounts = {};
  for (const c of chunks) {
    const sec = c.meta?.section || '';
    if (sections.length > 0 && !sections.includes(sec)) continue;
    const title = c.meta?.title || sec;
    fileCounts[title] = (fileCounts[title] || 0) + 1;
  }
  const entries = Object.entries(fileCounts);
  if (entries.length === 0) return '';
  const lines = entries
    .sort((a, b) => b[1] - a[1])
    .map(([title, count]) => `- ${title} (${count} chunk${count !== 1 ? 's' : ''})`);
  return '## Files in this codebase:\n' + lines.join('\n');
}

// ── Ollama streaming ─────────────────────────────────────────────────────────

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
        options: { temperature: 0.2, num_predict: MAX_OUTPUT_TOKENS },
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

// ── Claude streaming ─────────────────────────────────────────────────────────

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

// ── vLLM streaming ───────────────────────────────────────────────────────────

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
        temperature: 0.2,
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

async function generateCodeStream(spec, options = {}, onToken) {
  const t0       = Date.now();
  const store    = getVectorStore();
  const embedder = getEmbedder();

  // 1. Determine section filter
  // If codeOnly is requested (or default), restrict to uploads; fall back to all sections
  // if no uploaded code exists (first-time users).
  const hasUploads = (store._data || []).some(c => c.meta?.section === 'uploads');
  let sectionFilter;
  if (options.codeOnly === false) {
    // Caller explicitly opted out — use whatever sections they passed or all
    sectionFilter = options.sections?.length > 0 ? options.sections : [];
  } else {
    // Default: prefer uploads if they exist; otherwise all
    sectionFilter = hasUploads ? ['uploads'] : (options.sections?.length > 0 ? options.sections : []);
  }
  const filter = sectionFilter.length ? { sections: sectionFilter } : {};

  // 2. Embed the spec and retrieve relevant chunks
  const queryVec = await embedder.embedOne(spec);
  store.setQuery(spec);
  const chunks = store.search(queryVec, TOP_K_CODE, filter);

  if (chunks.length === 0) {
    const msg = 'No codebase context found. Upload your code files first using the Upload panel — supported types: .js, .ts, .py, .go, .java, .rs, .cpp, and more.';
    onToken(msg);
    return { answer: msg, sources: [], debug: null };
  }

  // 3. Score gate — if best match is too weak, the spec is likely off-topic
  const topScore = chunks[0]?.score ?? 0;
  if (topScore < MIN_SCORE_CODE) {
    const msg = `No relevant code context found for this spec (best match: ${Math.round(topScore * 100)}%). ` +
      'Try a more specific description, or check that your code files are uploaded in Build → Upload.';
    onToken(msg);
    return { answer: msg, sources: [], debug: { usedChunks: 0, budgetUsed: 0, latencyMs: Date.now() - t0, provider: process.env.LLM_PROVIDER || 'ollama' } };
  }

  // 4. Build context using compressContext (score filter + trigram dedup + budget fill)
  const { contextStr, selectedChunks, budgetUsed, droppedLow, droppedDupe } =
    compressContext(chunks, CTX_BUDGET_CODE, MIN_SCORE_CODE);

  // 5. Build file inventory so the model knows what files exist
  const fileInventory = buildFileInventory(store, sectionFilter);

  const langHint = options.language ? `Target language: **${options.language}**\n\n` : '';
  const userMsg  =
    (fileInventory ? fileInventory + '\n\n---\n\n' : '') +
    `${langHint}**Codebase context** (study these patterns before writing any code):\n\n` +
    `${contextStr}\n\n---\n\n` +
    `**Feature to build:**\n${spec}`;

  // 6. Stream response
  const provider = (process.env.LLM_PROVIDER || 'ollama').toLowerCase();

  let answer;
  if (provider === 'claude') {
    answer = await claudeStream(SYSTEM_CODEGEN, userMsg, onToken);
  } else if (provider === 'vllm') {
    answer = await vllmStream(SYSTEM_CODEGEN, userMsg, onToken);
  } else {
    answer = await ollamaStream(SYSTEM_CODEGEN, userMsg, onToken);
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

  logCodegen({ ts: new Date().toISOString(), spec: spec.slice(0, 100), usedChunks: selectedChunks.length, latencyMs: debug.latencyMs });

  return { answer, sources, debug };
}

module.exports = { generateCodeStream };
