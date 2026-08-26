/**
 * Ingestion Pipeline
 * Reads crawled HTML → cleans → chunks → embeds → stores in vector DB
 * Saves TF-IDF model to data/tfidf_model.json so query time works offline
 *
 * Usage:
 *   node src/ingestion/ingest.js
 *   node src/ingestion/ingest.js --force          (wipe + re-index)
 *   node src/ingestion/ingest.js --section mdm    (one section only)
 */

require('dotenv').config({ path: process.env.DOTENV_PATH || require('path').resolve(__dirname, '../../.env') });

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const { extractText, chunkText, chunkByDocType } = require('./cleaner');
const { getEmbedder }            = require('./embedder');
const { getVectorStore }         = require('../vectorstore/store');
const { enrichChunks, isEnabled: isEnrichmentEnabled } = require('./enricher');

const DATA_DIR      = process.env.DATA_DIR || path.resolve(process.cwd(), './data');
const APP_ROOT      = path.dirname(DATA_DIR);
const DOCS_DIR      = process.env.DOCS_DIR
  ? path.resolve(process.env.DOCS_DIR)
  : path.join(APP_ROOT, 'docs');
const CHUNK_SIZE    = parseInt(process.env.CHUNK_SIZE    || '600', 10);
const CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP || '80',  10);
const MODEL_PATH    = path.join(DATA_DIR, 'tfidf_model.json');
const META_PATH     = path.join(DATA_DIR, 'ingest_meta.json');

const args         = process.argv.slice(2);
const FORCE        = args.includes('--force');
const INCREMENTAL  = args.includes('--incremental');
const ONLY_SECTION = args[args.indexOf('--section') + 1] || null;
const INGEST_HASHES_PATH = path.join(DATA_DIR, 'ingest_hashes.json');

function loadIngestHashes() {
  try { if (fs.existsSync(INGEST_HASHES_PATH)) return JSON.parse(fs.readFileSync(INGEST_HASHES_PATH, 'utf8')); } catch (_) {}
  return {};
}

function md5(str) { return crypto.createHash('md5').update(str).digest('hex'); }

function loadManifest() {
  const mp = path.join(DOCS_DIR, 'manifest.json');
  if (!fs.existsSync(mp)) {
    console.error('\nmanifest.json not found. Run: npm run crawl\n');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(mp, 'utf8'));
}

function fmt(ms) {
  return ms < 1000 ? ms + 'ms' : (ms < 60000 ? (ms/1000).toFixed(1) + 's' : Math.floor(ms/60000) + 'm ' + Math.round((ms%60000)/1000) + 's');
}

(async () => {
  const t0      = Date.now();
  const store   = getVectorStore();
  const embedder = getEmbedder();

  let manifest = loadManifest();
  if (ONLY_SECTION) manifest = manifest.filter(m => m.section === ONLY_SECTION);

  const currentProvider = (process.env.EMBEDDING_PROVIDER || 'nomic').toLowerCase();

  // ── Auto-detect provider/dimension mismatch → force re-index ─────────────
  let forceRebuild = FORCE;

  if (!forceRebuild && store.count() > 0) {
    // Check saved metadata
    let lastProvider = null;
    if (fs.existsSync(META_PATH)) {
      try { lastProvider = JSON.parse(fs.readFileSync(META_PATH, 'utf8')).embeddingProvider; } catch (_) {}
    }
    if (lastProvider && lastProvider !== currentProvider) {
      console.log('\n⚠️  Embedding provider changed: ' + lastProvider + ' → ' + currentProvider);
      console.log('   Vectors are incompatible. Forcing full re-index...\n');
      forceRebuild = true;
    }

    // Auto-detect enrichment mode change — enriched vs unenriched embeddings are incompatible
    if (!forceRebuild && fs.existsSync(META_PATH)) {
      try {
        const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
        const wasEnriched = meta.enrichmentEnabled === true;
        const nowEnriched = isEnrichmentEnabled();
        if (wasEnriched !== nowEnriched) {
          console.log('\n⚠️  Contextual enrichment setting changed: ' + wasEnriched + ' → ' + nowEnriched);
          console.log('   Embeddings must be regenerated. Forcing full re-index...\n');
          forceRebuild = true;
        }
      } catch (_) {}
    }

    // Check dimension mismatch even if provider same (paranoia)
    if (!forceRebuild && store._data?.[0]?.embedding) {
      const storedDims   = store._data[0].embedding.length;
      const expectedDims = currentProvider === 'nomic' ? 768 : currentProvider === 'openai' ? 1536 : 2048;
      if (storedDims !== expectedDims) {
        console.log('\n⚠️  Dimension mismatch: store=' + storedDims + 'd, ' + currentProvider + '=' + expectedDims + 'd');
        console.log('   Forcing full re-index...\n');
        forceRebuild = true;
      }
    }
  }

  if (forceRebuild) {
    if (ONLY_SECTION) {
      console.log('Clearing section: ' + ONLY_SECTION + ' (other sections unchanged)');
      store.clearSection(ONLY_SECTION);
    } else {
      console.log('Clearing existing index...');
      store.clear();
    }
  }

  const useIncremental = INCREMENTAL && !forceRebuild;
  const ingestHashes   = useIncremental ? loadIngestHashes() : {};
  const newHashes      = {};

  console.log('\nKnowledge Hub — Ingestion Pipeline');
  console.log('Provider  : ' + currentProvider + ' | store: ' + (process.env.VECTOR_STORE_PROVIDER || 'json'));
  console.log('Chunk size: ' + CHUNK_SIZE + ' tokens, ' + CHUNK_OVERLAP + ' overlap');
  console.log('Mode      : ' + (forceRebuild ? 'force rebuild' : useIncremental ? 'incremental' : 'normal'));
  console.log('Pages     : ' + manifest.length);
  console.log('In store  : ' + store.count() + ' chunks\n');

  // ── Pass 1: parse all HTML into chunks ────────────────────────────────────
  const allChunks  = [];
  let   totalPages = 0;
  let   skippedPages = 0;

  for (const page of manifest) {
    if (page.status === 'skipped') continue;
    const htmlPath = path.join(DOCS_DIR, page.file);
    if (!fs.existsSync(htmlPath)) { console.warn('  Missing: ' + page.file + ' (skipping)'); continue; }

    const rawContent = fs.readFileSync(htmlPath, 'utf8');
    const fileHash   = md5(rawContent);
    newHashes[page.file] = fileHash;

    if (useIncremental && ingestHashes[page.file] === fileHash) {
      skippedPages++;
      totalPages++;
      process.stdout.write('  Skipped  [' + totalPages + '/' + manifest.length + '] ' + (page.title || '').substring(0, 55) + ' (unchanged)\r');
      continue;
    }

    // Full manifest metadata passed through so breadcrumb prefix appears in chunks
    const chunkMeta = {
      title:      page.title,
      url:        page.url,
      section:    page.section,
      breadcrumb: page.breadcrumb || '',
      spaceKey:   page.spaceKey  || '',
      pageId:     page.pageId    || '',
    };

    let chunks, parsed, docIntro;
    if (htmlPath.endsWith('.md')) {
      chunks   = chunkByDocType(rawContent, chunkMeta, CHUNK_SIZE, CHUNK_OVERLAP);
      docIntro = rawContent.slice(0, parseInt(process.env.ENRICHMENT_MAX_DOC_CHARS || '2000', 10));
    } else {
      parsed   = extractText(rawContent, { title: page.title, url: page.url, section: page.section });
      chunks   = chunkByDocType(parsed.text, { ...chunkMeta, title: parsed.title }, CHUNK_SIZE, CHUNK_OVERLAP);
      docIntro = parsed.text.slice(0, parseInt(process.env.ENRICHMENT_MAX_DOC_CHARS || '2000', 10));
    }

    // Attach document context for enricher (stripped before storage)
    const title = (htmlPath.endsWith('.md') ? page.title : parsed.title) || '';
    for (const c of chunks) {
      c._docContext = { title, section: page.section, intro: docIntro };
    }

    allChunks.push(...chunks);
    totalPages++;
    const displayTitle = (htmlPath.endsWith('.md') ? page.title : parsed.title) || '';
    process.stdout.write('  Parsed   [' + totalPages + '/' + manifest.length + '] ' + displayTitle.substring(0, 60) + '\r');
  }
  if (useIncremental) {
    console.log('\n\nSkipped (unchanged): ' + skippedPages + ' pages');
  }
  console.log('\nNew/updated chunks: ' + allChunks.length);

  if (allChunks.length === 0 && !useIncremental) {
    console.error('No chunks produced — check docs/ folder has HTML files');
    process.exit(1);
  }

  if (allChunks.length === 0 && useIncremental) {
    console.log('All pages unchanged — index is up to date.');
    fs.writeFileSync(INGEST_HASHES_PATH, JSON.stringify(newHashes, null, 2));
    console.log('\nDone in ' + fmt(Date.now() - t0));
    console.log('Chunks in store : ' + store.count());
    process.exit(0);
  }

  // ── Pass 1.5: contextual enrichment (optional, D.12) ─────────────────────
  if (isEnrichmentEnabled()) {
    console.log('\nContextual enrichment enabled — generating chunk context via LLM...');
    let enrichProgress = 0;
    await enrichChunks(allChunks, {
      onProgress: (done, total) => {
        if (done !== enrichProgress) {
          enrichProgress = done;
          process.stdout.write('  Enriched ' + done + '/' + total + ' chunks\r');
        }
      },
    });
    const enrichedCount = allChunks.filter(c => c.enrichedText).length;
    const cachedCount   = allChunks.length - enrichedCount;
    console.log('\n  ✅ Enrichment complete: ' + enrichedCount + ' new, ' + cachedCount + ' from cache');
  }

  // Strip _docContext before embedding/storage
  for (const c of allChunks) delete c._docContext;

  // ── Pass 2: fit + embed ───────────────────────────────────────────────────
  // Embed enrichedText when available (it includes the prepended context sentence)
  const textsToEmbed = allChunks.map(c => c.enrichedText || c.text);

  console.log('Fitting/embedding (' + currentProvider + ')...');
  if (embedder.fit) embedder.fit(textsToEmbed);

  console.log('Generating embeddings...');
  const embeddings = await embedder.embed(textsToEmbed);

  const enriched = allChunks.map((c, i) => ({ ...c, embedding: embeddings[i] }));

  // ── Pass 3: store ──
  console.log('Storing ' + enriched.length + ' chunks...');
  store.upsert(enriched);

  // Save TF-IDF model if applicable
  if (currentProvider === 'tfidf' && embedder.save) {
    embedder.save(MODEL_PATH);
    console.log('TF-IDF model saved → ' + MODEL_PATH);
  }

  // Save per-file hashes for incremental re-ingest
  fs.writeFileSync(INGEST_HASHES_PATH, JSON.stringify(newHashes, null, 2));

  // Save metadata so next run can detect provider / enrichment changes
  fs.writeFileSync(META_PATH, JSON.stringify({
    embeddingProvider: currentProvider,
    enrichmentEnabled: isEnrichmentEnabled(),
    lastIngest: new Date().toISOString(),
    totalChunks: enriched.length,
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  }, null, 2));

  const dims = embeddings[0]?.length || 0;
  console.log('\nDone in ' + fmt(Date.now() - t0));
  console.log('Chunks in store : ' + store.count());
  console.log('Embedding dims  : ' + dims + 'd');
  console.log('\nRun: npm run server  →  http://localhost:' + (process.env.PORT || 3000) + '\n');
})();
