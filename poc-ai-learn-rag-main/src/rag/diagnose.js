/**
 * RAG Diagnostic Tool
 * Run: node src/rag/diagnose.js "your question" [--section section-name]
 *
 * Shows:
 *  - Which embedding provider is active and whether model is loaded
 *  - Raw BM25 top matches
 *  - Raw semantic top matches
 *  - Final hybrid fused results
 *  - Exact chunk text that would be sent to the LLM
 *  - What gets dropped by compression and why
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs   = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const { getEmbedder }            = require('../ingestion/embedder');
const { getVectorStore, BM25 }   = require('../vectorstore/store');
const { compressContext }        = require('./query');

const DIVIDER = '─'.repeat(70);
const BOLD    = s => '\x1b[1m' + s + '\x1b[0m';
const GREEN   = s => '\x1b[32m' + s + '\x1b[0m';
const YELLOW  = s => '\x1b[33m' + s + '\x1b[0m';
const RED     = s => '\x1b[31m' + s + '\x1b[0m';
const DIM     = s => '\x1b[2m'  + s + '\x1b[0m';
const CYAN    = s => '\x1b[36m' + s + '\x1b[0m';

// ── Parse args ─────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const secIdx  = args.indexOf('--section');
const section = secIdx >= 0 ? args[secIdx + 1] : null;
const question = args.filter((a, i) => a !== '--section' && i !== secIdx + 1).join(' ');

if (!question) {
  console.log('Usage: node src/rag/diagnose.js "your question" [--section document-management-system]');
  process.exit(1);
}

// ── Helpers ────────────────────────────────────────────────────────────────
function truncate(text, len = 300) {
  return text.length > len ? text.slice(0, len) + '…' : text;
}

function scoreBar(score, width = 20) {
  const filled = Math.round(score * width);
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + '] ' + (score * 100).toFixed(1) + '%';
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-10);
}

async function debugStoredDocs(vectorStore, limit = 10) {
    const results = await vectorStore.getAllDocuments?.();

    console.log('\n=== VECTOR DB CONTENT ===\n');

    results.slice(0, limit).forEach((doc, i) => {
        console.log(`\n[DOC ${i}]`);
        console.log('ID:', doc.id);
        console.log('Metadata:', doc.metadata);

        console.log('\nCONTENT PREVIEW:');
        console.log(doc.pageContent.substring(0, 1000));

        console.log('\n----------------------');
    });
}



// ── Main diagnostic ────────────────────────────────────────────────────────
(async () => {

  const store = getVectorStore();
  const total = store.count();
  
  // await debugStoredDocs(store, limit = 10)



  console.log('\n' + BOLD('═'.repeat(70)));
  console.log(BOLD('  Knowledge Hub — Diagnostic'));
  console.log(BOLD('═'.repeat(70)));
  console.log('  Question : ' + CYAN(question));
  console.log('  Section  : ' + (section ? CYAN(section) : DIM('(all sections)')));
  console.log('  Embedding: ' + CYAN(process.env.EMBEDDING_PROVIDER || 'nomic'));
  console.log('  LLM      : ' + CYAN((process.env.LLM_PROVIDER || 'ollama') + ' / ' + (process.env.OLLAMA_MODEL || 'qwen2.5:3b')));
  console.log();

  // ── Step 1: Check vector store ───────────────────────────────────────────
  console.log(BOLD('① Vector Store'));
  console.log(DIVIDER);
  

  if (total === 0) {
    console.log(RED('  ✗ Vector store is EMPTY — run: npm run ingest'));
    process.exit(1);
  }
  console.log(GREEN('  ✓ ' + total + ' chunks indexed'));

  // Show section breakdown
  const bySection = {};
  for (const c of store._data) {
    const s = c.meta?.section || 'unknown';
    bySection[s] = (bySection[s] || 0) + 1;
  }
  const sections = Object.entries(bySection).sort((a,b) => b[1] - a[1]);
  console.log('  Sections:');
  for (const [s, n] of sections) {
    const marker = section && s === section ? GREEN(' ◀ selected') : '';
    console.log('    ' + s + ' (' + n + ' chunks)' + marker);
  }

  if (section && !bySection[section]) {
    console.log(RED('\n  ✗ Section "' + section + '" not found in index!'));
    console.log(YELLOW('    Available sections: ' + Object.keys(bySection).join(', ')));
    process.exit(1);
  }

  // Check embedding dimension consistency
  const sampleDims = store._data[0]?.embedding?.length || 0;
  console.log('\n  Embedding dims in store: ' + (sampleDims ? CYAN(sampleDims + 'd') : RED('unknown')));

  // ── Step 2: Embed query ──────────────────────────────────────────────────
  console.log('\n' + BOLD('② Query Embedding'));
  console.log(DIVIDER);

  let queryVec;
  try {
    const embedder = getEmbedder();
    queryVec = await embedder.embedOne(question);
    console.log(GREEN('  ✓ Embedded query → ' + queryVec.length + 'd vector'));

    // Dimension mismatch check
    if (queryVec.length !== sampleDims) {
      console.log(RED('\n  ✗ DIMENSION MISMATCH!'));
      console.log(RED('    Store has ' + sampleDims + 'd vectors but query is ' + queryVec.length + 'd'));
      console.log(YELLOW('    Fix: run  npm run ingest -- --force  to rebuild the index'));
      console.log(YELLOW('    This happens when you switch embedding providers without re-ingesting'));
      process.exit(1);
    }
    console.log(GREEN('  ✓ Dimensions match — embeddings are compatible'));
  } catch (err) {
    console.log(RED('  ✗ Embedding failed: ' + err.message));
    if (err.message.includes('nomic') || err.message.includes('pull')) {
      console.log(YELLOW('  Fix: ollama pull nomic-embed-text'));
      console.log(YELLOW('  Or:  set EMBEDDING_PROVIDER=tfidf in .env (lower quality)'));
    }
    process.exit(1);
  }

  // ── Step 3: BM25 search ──────────────────────────────────────────────────
  console.log('\n' + BOLD('③ BM25 Keyword Search (top 5)'));
  console.log(DIVIDER);

  let rows = store._data;
  if (section) rows = rows.filter(r => r.meta?.section === section);

  const bm25 = new BM25();
  bm25.index(rows.map(r => r.text));
  const bm25Scores = bm25.scores(question);
  const bm25Top = Array.from({ length: rows.length }, (_, i) => ({ idx: i, score: bm25Scores[i] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (bm25Top[0]?.score === 0) {
    console.log(YELLOW('  ⚠ All BM25 scores are 0 — query terms not found in any chunk'));
    console.log(YELLOW('  This means no document contains the exact words in your query'));
  }

  for (const { idx, score } of bm25Top) {
    const r = rows[idx];
    console.log('\n  ' + scoreBar(Math.min(score / 5, 1)) + DIM('  BM25=' + score.toFixed(3)));
    console.log('  ' + CYAN(r.meta.section + ' › ' + (r.meta.nearHeading || r.meta.title || '')));
    console.log('  ' + DIM(truncate(r.text, 200)));
  }

  // ── Step 4: Semantic search ──────────────────────────────────────────────
  console.log('\n\n' + BOLD('④ Semantic Search (top 5)'));
  console.log(DIVIDER);

  const semTop = rows
    .map((r, i) => ({ idx: i, score: cosine(queryVec, r.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const semMin = process.env.MIN_CHUNK_SCORE ? parseFloat(process.env.MIN_CHUNK_SCORE) : 0.10;

  for (const { idx, score } of semTop) {
    const r      = rows[idx];
    const color  = score >= semMin ? GREEN : RED;
    const status = score >= semMin ? '' : RED(' ← BELOW MIN_CHUNK_SCORE=' + semMin + ' (will be dropped!)');
    console.log('\n  ' + scoreBar(score) + DIM('  cos=' + score.toFixed(4)) + status);
    console.log('  ' + CYAN(r.meta.section + ' › ' + (r.meta.nearHeading || r.meta.title || '')));
    console.log('  ' + DIM(truncate(r.text, 200)));
  }

  // ── Step 5: Hybrid results ───────────────────────────────────────────────
  console.log('\n\n' + BOLD('⑤ Final Hybrid Results (what goes to LLM)'));
  console.log(DIVIDER);

  const TOP_K = parseInt(process.env.TOP_K || '6');
  store.setQuery(question);
  const filter = section ? { section } : {};
  const chunks = store.search(queryVec, TOP_K, filter);

  console.log('  Retrieved ' + chunks.length + ' chunks via hybrid RRF');

  const { contextStr, usedChunks, budgetUsed, droppedLow, droppedDupe } =
    compressContext(chunks, parseInt(process.env.CTX_TOKEN_BUDGET || '1800'), semMin);

  console.log('  After compression: ' + usedChunks + '/' + chunks.length + ' chunks used');
  console.log('  Context tokens:    ~' + budgetUsed);
  console.log('  Dropped low-score: ' + droppedLow);
  console.log('  Dropped duplicate: ' + droppedDupe);

  if (usedChunks === 0) {
    console.log(RED('\n  ✗ ALL CHUNKS WERE DROPPED — this is why the LLM says "not found"'));
    console.log(YELLOW('  Fix options:'));
    console.log(YELLOW('    1. Lower MIN_CHUNK_SCORE in .env (try 0.03)'));
    console.log(YELLOW('    2. Re-ingest after switching EMBEDDING_PROVIDER=nomic'));
    console.log(YELLOW('    3. Try a broader question phrasing'));
  }

  console.log('\n' + BOLD('  Chunks that would be sent to LLM:'));
  for (let i = 0; i < Math.min(chunks.length, usedChunks); i++) {
    const c = chunks[i];
    console.log('\n  ' + BOLD('[' + (i+1) + ']') + ' score=' + c.score.toFixed(4) +
      '  ' + CYAN(c.meta.section + ' › ' + (c.meta.nearHeading || c.meta.title || '')));
    console.log('  ' + DIM(truncate(c.text, 400)));
  }

  // ── Step 6: Recommendations ──────────────────────────────────────────────
  console.log('\n\n' + BOLD('⑥ Recommendations'));
  console.log(DIVIDER);

  const topSemScore = semTop[0]?.score || 0;
  const topBm25Score = bm25Top[0]?.score || 0;

  if (sampleDims === 2048 && (process.env.EMBEDDING_PROVIDER || 'nomic') === 'nomic') {
    console.log(RED('  ✗ CRITICAL: Store has 2048d TF-IDF vectors but EMBEDDING_PROVIDER=nomic'));
    console.log(YELLOW('    Run: npm run ingest -- --force'));
  } else if (topSemScore < 0.15) {
    console.log(YELLOW('  ⚠ Low semantic scores — try:'));
    console.log(YELLOW('    1. npm run ingest -- --force  (rebuild with nomic)'));
    console.log(YELLOW('    2. Set MIN_CHUNK_SCORE=0.03 in .env'));
    console.log(YELLOW('    3. Rephrase query using words likely in the doc'));
  } else if (usedChunks > 0) {
    console.log(GREEN('  ✓ Retrieval looks healthy'));
    console.log(GREEN('  ✓ ' + usedChunks + ' relevant chunks found'));
    if (topSemScore > 0.3) console.log(GREEN('  ✓ Strong semantic match (' + (topSemScore*100).toFixed(0) + '%)'));
  }

  console.log();
})();
