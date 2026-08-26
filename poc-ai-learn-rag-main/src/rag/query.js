/**
 * RAG Query Engine — v4
 *
 * Enhancement 1: nomic-embed-text semantic embeddings (via embedder.js)
 * Enhancement 2: hybrid BM25+semantic search with RRF (via store.js)
 * Enhancement 3: smart context compression
 *   - Hard token budget (default 1800 tokens of context)
 *   - Deduplication: overlapping chunks trimmed before sending
 *   - Score threshold: chunks below MIN_SCORE dropped entirely
 *   - Result: 30-40% fewer tokens per query, sharper answers
 */

require('dotenv').config({ path: process.env.DOTENV_PATH || require('path').resolve(__dirname, '../../.env') });
const fetch = require('node-fetch');
const fs    = require('fs');
const path  = require('path');

const { getEmbedder }    = require('../ingestion/embedder');
const { getVectorStore } = require('../vectorstore/store');
const { rerank, ENABLED: RERANKER_ENABLED, CANDIDATES: RERANKER_CANDIDATES } = require('./reranker');

const TOP_K          = parseInt(process.env.TOP_K              || '6',    10);
const CTX_BUDGET     = parseInt(process.env.CTX_TOKEN_BUDGET   || '1800', 10);
const MIN_SCORE      = parseFloat(process.env.MIN_CHUNK_SCORE  || '0.10');
const CONF_GATE      = parseFloat(process.env.CONFIDENCE_GATE  || '0.15');
const CHARS_PER_TOK  = 4;

const DATA_DIR          = process.env.DATA_DIR || path.resolve(process.cwd(), './data');
const EVAL_PATH         = path.join(DATA_DIR, 'eval.jsonl');
const SECTION_CFG_PATH  = path.join(DATA_DIR, 'section_config.json');

function logEval(entry) {
  try {
    fs.mkdirSync(path.dirname(EVAL_PATH), { recursive: true });
    fs.appendFileSync(EVAL_PATH, JSON.stringify(entry) + '\n');
  } catch (_) {}
}

function loadSectionConfig() {
  try {
    if (fs.existsSync(SECTION_CFG_PATH)) return JSON.parse(fs.readFileSync(SECTION_CFG_PATH, 'utf8'));
  } catch (_) {}
  return {};
}

function applyPriorityMultipliers(chunks, config) {
  if (!config || !Object.keys(config).length) return chunks;
  const adjusted = chunks.map(c => {
    const p = config[c.meta?.section]?.priority;
    if (p === 'boost')  return { ...c, score: c.score * 1.3, semScore: Math.min(1, c.semScore * 1.3) };
    if (p === 'ignore') return { ...c, score: c.score * 0.4, semScore: c.semScore * 0.4 };
    return c;
  });
  return adjusted.sort((a, b) => b.score - a.score);
}

const APP_NAME = process.env.APP_NAME || 'Knowledge Hub';

const SYSTEM = `You are the ${APP_NAME} Documentation Assistant — an internal AI assistant.

Answer questions using ONLY the documentation context provided.

Rules:
1. Ground every answer in the provided context. Never guess or use outside knowledge.
2. Cite sources inline using the reference numbers from the context. After a statement drawn from source [1], write [1]. After a statement drawn from source [2], write [2]. Use the numbers that appear at the start of each context block.
3. Use bullet points, numbered steps, and code blocks where they help clarity.
4. Answer fully from the context provided. Do NOT say "I couldn't find this" when the context contains relevant information — that phrase is reserved for when ALL context snippets are entirely off-topic. If you can see related content, answer from it even if partial.
5. For follow-up questions, use the conversation history to understand prior context.
6. Be concise but technically precise.`;

const DEFLECTION_PATTERNS = [
  /does not contain any information/i,
  /no information about/i,
  /cannot answer.*based.*documentation/i,
  /not.*found.*documentation/i,
  /i could not find/i,
  /no relevant.*documentation/i,
  /outside.*scope.*documentation/i,
  /no.*information.*available.*documentation/i,
];

function isDeflection(answer) {
  return DEFLECTION_PATTERNS.some(p => p.test(answer));
}

// ── Context compression ────────────────────────────────────────────────────

/**
 * Given retrieved chunks, return a compressed context string that fits
 * within CTX_BUDGET tokens. Steps:
 *   1. Drop chunks below MIN_SCORE
 *   2. Deduplicate: if two chunks share >60% of their trigrams, keep higher-scored one
 *   3. Fill budget greedily from highest score down
 *   4. Annotate each chunk with source tag
 */
function compressContext(chunks, budget = CTX_BUDGET, minScore = MIN_SCORE) {
  // Step 1: score filter
  let kept = chunks.filter(c => c.score >= minScore);
  if (kept.length === 0) kept = chunks.slice(0, 1);  // always keep at least one

  // Step 2: deduplication via trigram Jaccard similarity
  function trigrams(text) {
    const words = text.toLowerCase().split(/\s+/);
    const tg    = new Set();
    for (let i = 0; i < words.length - 2; i++) {
      tg.add(words[i] + ' ' + words[i+1] + ' ' + words[i+2]);
    }
    return tg;
  }

  function jaccardSim(a, b) {
    const sa   = trigrams(a);
    const sb   = trigrams(b);
    let inter  = 0;
    for (const t of sa) if (sb.has(t)) inter++;
    return inter / (sa.size + sb.size - inter + 1e-10);
  }

  const deduped = [];
  for (const chunk of kept) {
    const isDupe = deduped.some(c => jaccardSim(c.text, chunk.text) > 0.60);
    if (!isDupe) deduped.push(chunk);
  }

  // Step 3: greedy budget fill
  const budgetChars = budget * CHARS_PER_TOK;
  let   usedChars   = 0;
  const selected    = [];

  for (const chunk of deduped) {
    const chunkChars = chunk.text.length + 80;  // +80 for the header line
    if (usedChars + chunkChars > budgetChars && selected.length > 0) break;
    selected.push(chunk);
    usedChars += chunkChars;
  }

  // Step 4: format
  const contextStr = selected.map((c, i) => {
    const src = [c.meta.section, c.meta.nearHeading]
      .filter(Boolean).join(' › ');
    const pct = Math.round(c.score * 100);
    return '[' + (i+1) + '] [Source: ' + src + '] (' + pct + '% match)\n' + c.text;
  }).join('\n\n---\n\n');

  return {
    contextStr,
    selectedChunks: selected,
    usedChunks:     selected.length,
    totalChunks:    chunks.length,
    droppedLow:     chunks.length - kept.length,
    droppedDupe:    kept.length - deduped.length,
    budgetUsed:     Math.round(usedChars / CHARS_PER_TOK),
  };
}

// ── Ollama streaming ───────────────────────────────────────────────────────
async function askOllamaStream(systemPrompt, messages, onToken) {
  const model   = process.env.OLLAMA_MODEL    || 'qwen2.5:3b';
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

  let res;
  try {
    res = await fetch(baseUrl + '/api/chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        stream: true,
        options: { temperature: 0.15, num_predict: 1024 },
      }),
    });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      throw new Error('Ollama is not running.\n  Run: ollama serve\n  Then: ollama pull ' + model);
    }
    throw err;
  }

  if (!res.ok) {
    const body = await res.text();
    if (body.includes('not found')) throw new Error('Ollama model "' + model + '" not found. Run: ollama pull ' + model);
    throw new Error('Ollama error: ' + body);
  }

  return new Promise((resolve, reject) => {
    let fullText = '';
    let buffer   = '';

    res.body.on('data', (chunk) => {
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

// ── Claude streaming ───────────────────────────────────────────────────────
async function askClaudeStream(systemPrompt, messages, onToken) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.includes('sk-ant-...')) throw new Error('ANTHROPIC_API_KEY not set in .env');
  const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01' },
    body: JSON.stringify({ model, max_tokens: 1200, system: systemPrompt, messages, stream: true }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error('Claude API: ' + (data.error?.message || res.status));
  }

  return new Promise((resolve, reject) => {
    let fullText = '';
    let buffer   = '';

    res.body.on('data', (chunk) => {
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

// ── Ollama ─────────────────────────────────────────────────────────────────
async function askOllama(systemPrompt, messages) {
  const model   = process.env.OLLAMA_MODEL    || 'qwen2.5:3b';
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

  let res;
  try {
    res = await fetch(baseUrl + '/api/chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        stream: false,
        options: { temperature: 0.15, num_predict: 1024 },
      }),
    });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      throw new Error('Ollama is not running.\n  Run: ollama serve\n  Then: ollama pull ' + model);
    }
    throw err;
  }

  if (!res.ok) {
    const body = await res.text();
    if (body.includes('not found')) throw new Error('Ollama model "' + model + '" not found. Run: ollama pull ' + model);
    throw new Error('Ollama error: ' + body);
  }

  const data = await res.json();
  return data.message?.content || data.response || '';
}

// ── Claude ─────────────────────────────────────────────────────────────────
async function askClaude(systemPrompt, messages) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.includes('sk-ant-...')) throw new Error('ANTHROPIC_API_KEY not set in .env');
  const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01' },
    body: JSON.stringify({ model, max_tokens: 1200, system: systemPrompt, messages }),
  });
  const data = await res.json();
  if (data.error) throw new Error('Claude API: ' + data.error.message);
  return data.content?.[0]?.text || '';
}

// ── vLLM (OpenAI-compatible local GPU server) ──────────────────────────────
async function askVllm(systemPrompt, messages) {
  const baseUrl = process.env.VLLM_BASE_URL || 'http://localhost:8000';
  const model   = process.env.VLLM_MODEL    || 'default';
  let res;
  try {
    res = await fetch(baseUrl + '/v1/chat/completions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.15,
        max_tokens: 1024,
      }),
    });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') throw new Error('vLLM not running at ' + baseUrl + ' — start your vLLM server');
    throw err;
  }
  if (!res.ok) throw new Error('vLLM error (' + res.status + '): ' + await res.text());
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function askVllmStream(systemPrompt, messages, onToken) {
  const baseUrl = process.env.VLLM_BASE_URL || 'http://localhost:8000';
  const model   = process.env.VLLM_MODEL    || 'default';
  let res;
  try {
    res = await fetch(baseUrl + '/v1/chat/completions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.15,
        max_tokens: 1024,
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

    res.body.on('data', (chunk) => {
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

    res.body.on('end', () => {
      if (buffer.startsWith('data: ')) {
        try {
          const json  = JSON.parse(buffer.slice(6));
          const token = json.choices?.[0]?.delta?.content || '';
          if (token) { fullText += token; onToken(token); }
        } catch (_) {}
      }
      resolve(fullText);
    });

    res.body.on('error', reject);
  });
}

// ── Core query ─────────────────────────────────────────────────────────────
async function query(question, options = {}) {
  const t0       = Date.now();
  const userId   = options.userId || 'default';
  const topK     = options.topK || TOP_K;
  const store    = getVectorStore();
  const embedder = getEmbedder();

  // 1. Embed question
  const queryVec = await embedder.embedOne(question);

  // 2. Hybrid retrieval: pass query text for BM25, vector for semantic
  // sections[] (multi-select) takes priority over legacy single section string
  const sectionFilter = options.sections?.length > 0 ? options.sections
    : options.section ? [options.section] : [];
  const filter = sectionFilter.length ? { sections: sectionFilter } : {};
  store.setQuery(question);
  const retrievalK = RERANKER_ENABLED ? RERANKER_CANDIDATES : topK;
  let chunks = applyPriorityMultipliers(store.search(queryVec, retrievalK, filter), loadSectionConfig());

  // 2b. Cross-encoder reranking (D.13) — reorder candidates by joint query-doc relevance
  if (RERANKER_ENABLED && chunks.length > 1) {
    try {
      chunks = await rerank(question, chunks);
    } catch (err) {
      console.warn('  [Reranker] Failed, using hybrid order:', err.message);
      chunks = chunks.slice(0, topK);
    }
  }

  if (chunks.length === 0) {
    logEval({ ts: new Date().toISOString(), question, topSemScore: 0, latencyMs: Date.now()-t0, blocked: true, sectionsUsed: [], userId });
    return {
      answer: "No relevant documentation found. Make sure you've run `npm run ingest` after crawling.",
      sources: [], chunks: [], debug: null, blocked: true,
    };
  }

  // 3. Confidence gate — block out-of-scope questions before calling LLM
  // Uses BOTH semantic score AND RRF score so that strong BM25 keyword matches
  // (e.g. filename queries like "what is in readme.md") are not unfairly blocked.
  // RRF score > 0.014 ≈ chunk ranked in top-3 of BM25 list  (1/(60+3) ≈ 0.0154)
  const topSemScore = chunks[0].semScore || 0;
  const topRrfScore = chunks[0].score    || 0;
  const passesGate  = topSemScore >= CONF_GATE
                   || (topRrfScore >= 0.014 && topSemScore >= 0.05);
  if (!passesGate) {
    // Suggest sections that had the closest partial matches
    const suggestions = [...new Set(chunks.slice(0, 4).map(c => c.meta?.section).filter(Boolean))];
    logEval({ ts: new Date().toISOString(), question, topSemScore, latencyMs: Date.now()-t0, blocked: true, sectionsUsed: [], nearMissSections: suggestions, userId });
    return {
      answer: "I couldn't find this in the available documentation.",
      sources: [], chunks, debug: null, blocked: true, suggestions,
    };
  }

  // 4. Compress context to token budget
  const { contextStr, selectedChunks, usedChunks, budgetUsed, droppedLow, droppedDupe } =
    compressContext(chunks, CTX_BUDGET, MIN_SCORE);

  console.log(
    '  Context: ' + usedChunks + '/' + chunks.length + ' chunks, ~' + budgetUsed +
    ' tokens (dropped ' + droppedLow + ' low-score, ' + droppedDupe + ' dupes)'
  );

  // 5. Build message history (clean Q&A, no prior context blobs)
  const priorTurns = (options.history || [])
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .slice(-8);

  const userMsg =
    'Documentation context:\n\n' + contextStr +
    '\n\n---\n\nQuestion: ' + question;

  const messages = [...priorTurns, { role: 'user', content: userMsg }];

  // 6. Call LLM
  const provider = (process.env.LLM_PROVIDER || 'ollama').toLowerCase();
  const answer   = provider === 'claude' ? await askClaude(SYSTEM, messages)
                 : provider === 'vllm'   ? await askVllm(SYSTEM, messages)
                 : await askOllama(SYSTEM, messages);

  // 7. Sources — 1:1 with selectedChunks so [1] in text maps to sources[0], etc.
  const sources = selectedChunks.map(c => ({
    section:     c.meta.section,
    title:       c.meta.title,
    url:         c.meta.url,
    score:       c.score,
    nearHeading: c.meta.nearHeading || undefined,
    snippet:     c.text ? c.text.replace(/\s+/g, ' ').trim().slice(0, 160) : undefined,
  }));

  const softBlocked = isDeflection(answer);
  logEval({
    ts: new Date().toISOString(), question, topSemScore,
    latencyMs: Date.now() - t0, blocked: softBlocked, softBlocked,
    sectionsUsed: [...new Set(chunks.slice(0, usedChunks).map(c => c.meta.section))],
    usedChunks, budgetUsed, userId,
  });

  return {
    answer, sources, chunks,
    debug: { usedChunks, budgetUsed, droppedLow, droppedDupe },
  };
}

// ── Streaming query (for /api/chat/stream) ─────────────────────────────────
async function queryStream(question, options = {}, onToken) {
  const t0       = Date.now();
  const userId   = options.userId || 'default';
  const topK     = options.topK || TOP_K;
  const store    = getVectorStore();
  const embedder = getEmbedder();

  const queryVec = await embedder.embedOne(question);
  const sectionFilter2 = options.sections?.length > 0 ? options.sections
    : options.section ? [options.section] : [];
  const filter2 = sectionFilter2.length ? { sections: sectionFilter2 } : {};
  store.setQuery(question);
  const retrievalK2 = RERANKER_ENABLED ? RERANKER_CANDIDATES : topK;
  let chunks = store.search(queryVec, retrievalK2, filter2);

  // Pinned chunk override — bypass retrieval and confidence gate
  const pinnedIds = options.pinnedChunkIds || [];
  if (pinnedIds.length > 0) {
    const pinned = store._data.filter(c => {
      const id = (c.meta.section + '__' + c.meta.title + '__' + c.meta.chunkIndex).replace(/\s+/g, '_').replace(/[^\w_]/g, '');
      return pinnedIds.includes(id);
    }).map(c => ({ ...c, score: 1.0, semScore: 1.0 }));
    if (pinned.length > 0) chunks = pinned;
  } else {
    chunks = applyPriorityMultipliers(chunks, loadSectionConfig());
    // Cross-encoder reranking for stream path
    if (RERANKER_ENABLED && chunks.length > 1) {
      try {
        chunks = await rerank(question, chunks);
      } catch (err) {
        console.warn('  [Reranker] Stream path failed, using hybrid order:', err.message);
        chunks = chunks.slice(0, topK);
      }
    }
  }

  if (chunks.length === 0) {
    const msg = "No relevant documentation found. Make sure you've run `npm run ingest` after crawling.";
    onToken(msg);
    logEval({ ts: new Date().toISOString(), question, topSemScore: 0, latencyMs: Date.now()-t0, blocked: true, sectionsUsed: [], userId });
    return { answer: msg, sources: [], chunks: [], debug: null, blocked: true };
  }

  const topSemScore = chunks[0].semScore || 0;
  const topRrfScore = chunks[0].score    || 0;
  const passesGate  = pinnedIds.length > 0  // pinned chunks always pass the gate
                   || topSemScore >= CONF_GATE
                   || (topRrfScore >= 0.014 && topSemScore >= 0.05);
  if (!passesGate) {
    const msg = "I couldn't find this in the available documentation.";
    onToken(msg);
    const suggestions = [...new Set(chunks.slice(0, 4).map(c => c.meta?.section).filter(Boolean))];
    logEval({ ts: new Date().toISOString(), question, topSemScore, latencyMs: Date.now()-t0, blocked: true, sectionsUsed: [], nearMissSections: suggestions, userId });
    return { answer: msg, sources: [], chunks, debug: null, blocked: true, suggestions };
  }

  const { contextStr, selectedChunks, usedChunks, budgetUsed, droppedLow, droppedDupe } =
    compressContext(chunks, CTX_BUDGET, MIN_SCORE);

  console.log(
    '  Context: ' + usedChunks + '/' + chunks.length + ' chunks, ~' + budgetUsed +
    ' tokens (dropped ' + droppedLow + ' low-score, ' + droppedDupe + ' dupes)'
  );

  const priorTurns = (options.history || [])
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .slice(-8);

  const userMsg =
    'Documentation context:\n\n' + contextStr +
    '\n\n---\n\nQuestion: ' + question;

  const messages = [...priorTurns, { role: 'user', content: userMsg }];

  const provider = (process.env.LLM_PROVIDER || 'ollama').toLowerCase();
  const answer   = provider === 'claude' ? await askClaudeStream(SYSTEM, messages, onToken)
                 : provider === 'vllm'   ? await askVllmStream(SYSTEM, messages, onToken)
                 : await askOllamaStream(SYSTEM, messages, onToken);

  const sources = selectedChunks.map(c => ({
    section:     c.meta.section,
    title:       c.meta.title,
    url:         c.meta.url,
    score:       c.score,
    nearHeading: c.meta.nearHeading || undefined,
    snippet:     c.text ? c.text.replace(/\s+/g, ' ').trim().slice(0, 160) : undefined,
  }));

  const softBlocked = isDeflection(answer);
  logEval({
    ts: new Date().toISOString(), question, topSemScore,
    latencyMs: Date.now() - t0, blocked: softBlocked, softBlocked,
    sectionsUsed: [...new Set(chunks.slice(0, usedChunks).map(c => c.meta.section))],
    usedChunks, budgetUsed, userId,
  });

  return { answer, sources, chunks, debug: { usedChunks, budgetUsed, droppedLow, droppedDupe } };
}

// ── CLI ────────────────────────────────────────────────────────────────────
if (require.main === module) {
  const q = process.argv.slice(2).join(' ');
  if (!q) { console.log('Usage: node src/rag/query.js "your question"'); process.exit(1); }
  query(q).then(({ answer, sources, debug }) => {
    console.log('\n── Answer ─────────────────────────────'); console.log(answer);
    console.log('\n── Sources ─────────────────────────────');
    sources.forEach(s => console.log('  •', s.section, '|', s.title, '(' + Math.round(s.score*100) + '%)'));
    if (debug) console.log('\n── Debug ────────────────────────────────\n ', JSON.stringify(debug));
  }).catch(e => { console.error('Error:', e.message); process.exit(1); });
}

module.exports = { query, queryStream, compressContext };
