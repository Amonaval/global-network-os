/**
 * Vector Store — v4  (hybrid search: BM25 + cosine, fused via RRF)
 *
 * Enhancement 2: Hybrid BM25 + semantic search
 *
 * Why this matters:
 *   Semantic search alone misses exact product names, error codes, API
 *   endpoints, version numbers. BM25 catches these precisely.
 *   Combining both via Reciprocal Rank Fusion (RRF) gives the best of both:
 *     - semantic: "how do I authenticate" → finds "API token setup" pages
 *     - BM25:     "EntityModel v2.3 error"→ finds exact doc page
 *
 * RRF formula: score = Σ 1/(k + rank_i)  where k=60 (standard constant)
 * No extra dependencies — pure JS.
 *
 * Providers: json (local) | pinecone (cloud)
 */

require('dotenv').config({ path: process.env.DOTENV_PATH || require('path').resolve(__dirname, '../../.env') });
const fs   = require('fs');
const path = require('path');

// ── BM25 implementation ────────────────────────────────────────────────────
class BM25 {
  constructor(k1 = 1.5, b = 0.75) {
    this.k1   = k1;   // term frequency saturation
    this.b    = b;    // length normalisation
    this.docs = [];   // tokenised documents
    this.df   = {};   // document frequency per term
    this.avgdl = 0;
    this.N    = 0;
  }

  _tokenise(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1);
  }

  index(texts) {
    this.N    = texts.length;
    this.docs = texts.map(t => this._tokenise(t));
    this.df   = {};
    let totalLen = 0;

    for (const toks of this.docs) {
      totalLen += toks.length;
      for (const t of new Set(toks)) {
        this.df[t] = (this.df[t] || 0) + 1;
      }
    }
    this.avgdl = totalLen / (this.N || 1);
  }

  scores(query) {
    const qtoks = this._tokenise(query);
    const out   = new Float32Array(this.N);

    for (const qt of qtoks) {
      const df_t = this.df[qt] || 0;
      if (!df_t) continue;
      // IDF with smoothing
      const idf = Math.log((this.N - df_t + 0.5) / (df_t + 0.5) + 1);

      for (let i = 0; i < this.N; i++) {
        const dl    = this.docs[i].length;
        const tf    = this.docs[i].filter(t => t === qt).length;
        const numer = tf * (this.k1 + 1);
        const denom = tf + this.k1 * (1 - this.b + this.b * dl / this.avgdl);
        out[i] += idf * numer / denom;
      }
    }
    return out;
  }
}

// ── Reciprocal Rank Fusion ─────────────────────────────────────────────────
function rrf(rankedLists, k = 60) {
  // rankedLists: array of arrays of {idx, score}  (each sorted desc by score)
  const fusedScores = {};

  for (const list of rankedLists) {
    list.forEach(({ idx }, rank) => {
      fusedScores[idx] = (fusedScores[idx] || 0) + 1 / (k + rank + 1);
    });
  }

  return Object.entries(fusedScores)
    .map(([idx, score]) => ({ idx: parseInt(idx), score }))
    .sort((a, b) => b.score - a.score);
}

// ── JSON file store (per-section sharding) ────────────────────────────────
class JSONVectorStore {
  constructor(filePath) {
    const _dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), './data');
    this.filePath  = filePath || path.join(_dataDir, 'vectors.json');
    this._dataDir  = path.dirname(this.filePath);
    fs.mkdirSync(this._dataDir, { recursive: true });
    this._data  = [];
    this._bm25  = new BM25();
    this._load();
    const secs = new Set(this._data.map(c => c.meta?.section || 'default'));
    console.log('  Vector store: ' + this._dataDir + ' (' + this._data.length + ' chunks, ' + secs.size + ' sections)');
  }

  // ── Section file helpers ──────────────────────────────────────────────────
  _safeSection(sec)     { return String(sec).replace(/[^a-z0-9_-]/gi, '_'); }
  _sectionFilePath(sec) { return path.join(this._dataDir, 'vectors_' + this._safeSection(sec) + '.json'); }

  _load() {
    // One-time migration: if legacy vectors.json exists, split it into section files
    const legacyPath = path.join(this._dataDir, 'vectors.json');
    if (fs.existsSync(legacyPath)) {
      try {
        const all = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
        if (Array.isArray(all) && all.length > 0) {
          this._data = all;
          this._saveAllSections();
          console.log('  Migrated ' + all.length + ' chunks from vectors.json → per-section files');
        }
        fs.renameSync(legacyPath, legacyPath + '.migrated');
      } catch (err) {
        console.warn('  Migration warning: ' + err.message);
      }
      if (this._data.length > 0) { this._indexBM25(); return; }
    }

    // Load from per-section files
    let files = [];
    try { files = fs.readdirSync(this._dataDir); } catch (_) {}
    this._data = [];
    for (const file of files) {
      if (!file.startsWith('vectors_') || !file.endsWith('.json')) continue;
      try {
        const d = JSON.parse(fs.readFileSync(path.join(this._dataDir, file), 'utf8'));
        if (Array.isArray(d)) this._data.push(...d);
      } catch (err) {
        console.warn('  Warning: could not load ' + file + ': ' + err.message);
      }
    }
    if (this._data.length > 0) this._indexBM25();
  }

  _indexBM25() {
    // Use enrichedText (context + chunk) when available — improves keyword recall
    this._bm25.index(this._data.map(c => c.enrichedText || c.text));
  }

  _cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { dot+=a[i]*b[i]; na+=a[i]*a[i]; nb+=b[i]*b[i]; }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-10);
  }

  // Save only the chunks belonging to one section (fast — called on every upsert)
  _saveSection(section) {
    const chunks = this._data.filter(c => (c.meta?.section || 'default') === section);
    fs.writeFileSync(this._sectionFilePath(section), JSON.stringify(chunks));
  }

  // Save every section (used during migration and full rebuild)
  _saveAllSections() {
    const bySection = {};
    for (const c of this._data) {
      const sec = c.meta?.section || 'default';
      if (!bySection[sec]) bySection[sec] = [];
      bySection[sec].push(c);
    }
    for (const [sec, chunks] of Object.entries(bySection)) {
      fs.writeFileSync(this._sectionFilePath(sec), JSON.stringify(chunks));
    }
  }

  // Backward-compat alias (ingest.js calls this indirectly via upsert)
  _save() { this._saveAllSections(); }

  upsert(chunks) {
    const idx = {};
    this._data.forEach((c, i) => { idx[c.id] = i; });

    const affectedSections = new Set();
    for (const c of chunks) {
      const id  = (c.meta.section + '__' + c.meta.title + '__' + c.meta.chunkIndex)
        .replace(/\s+/g, '_').replace(/[^\w_]/g, '');
      const rec = { id, text: c.text, meta: c.meta, embedding: c.embedding };
      if (idx[id] !== undefined) this._data[idx[id]] = rec;
      else this._data.push(rec);
      affectedSections.add(c.meta?.section || 'default');
    }
    // Write only the section files that changed (not the entire index every time)
    for (const sec of affectedSections) this._saveSection(sec);
    this._indexBM25();
  }

  /**
   * Hybrid search: BM25 + cosine, fused with RRF
   * Falls back to cosine-only if BM25 index is empty
   */
  search(queryVec, topK = 5, filter = {}) {
    let rows = this._data;
    let idxMap = null;

    // Apply section filter — supports single string (legacy) or array (multi-select)
    const sectionFilter = filter.sections?.length > 0 ? filter.sections
      : filter.section ? [filter.section]
      : null;
    if (sectionFilter) {
      const filtered = [];
      const map      = [];
      this._data.forEach((r, i) => {
        if (sectionFilter.includes(r.meta?.section)) {
          filtered.push(r);
          map.push(i);
        }
      });
      rows   = filtered;
      idxMap = map;
    }

    if (rows.length === 0) return [];

    const N = rows.length;

    // ── Semantic ranking ───────────────────────────────────────────────────
    const semanticRanked = rows
      .map((r, i) => ({ idx: i, score: this._cosine(queryVec, r.embedding) }))
      .sort((a, b) => b.score - a.score);

    // ── BM25 ranking ───────────────────────────────────────────────────────
    // Compute BM25 on the filtered subset
    const bm25sub = new BM25();
    bm25sub.index(rows.map(r => r.text));
    // Reconstruct query from the embedding vector is impossible; we store it
    // separately. The caller must pass the original query text for BM25.
    // We stash it on the store instance transiently (set in search wrapper).
    const queryText = this._pendingQuery || '';
    const bm25Scores = bm25sub.scores(queryText);
    const bm25Ranked = Array.from({ length: N }, (_, i) => ({ idx: i, score: bm25Scores[i] }))
      .sort((a, b) => b.score - a.score);

    // ── Fuse ───────────────────────────────────────────────────────────────
    const HYBRID_WEIGHT = parseFloat(process.env.HYBRID_WEIGHT || '0.5');
    let fused;

    if (HYBRID_WEIGHT === 0) {
      fused = semanticRanked;
    } else if (HYBRID_WEIGHT === 1) {
      fused = bm25Ranked;
    } else {
      fused = rrf([semanticRanked, bm25Ranked]);
    }

    const semScoreMap = {};
    semanticRanked.forEach(s => { semScoreMap[s.idx] = s.score; });

    return fused
      .slice(0, topK)
      .map(({ idx, score }) => ({
        score,
        semScore: semScoreMap[idx] || 0,
        text: rows[idx].text,
        meta: rows[idx].meta,
      }));
  }

  // Call this before search() to enable BM25
  setQuery(query) { this._pendingQuery = query; }

  count() { return this._data.length; }

  // Remove and delete ALL section files — full index wipe
  clear() {
    let files = [];
    try { files = fs.readdirSync(this._dataDir); } catch (_) {}
    for (const file of files) {
      if (file.startsWith('vectors_') && file.endsWith('.json')) {
        try { fs.unlinkSync(path.join(this._dataDir, file)); } catch (_) {}
      }
    }
    this._data  = [];
    this._bm25  = new BM25();
  }

  // Remove one section's chunks and delete its file — enables per-section rebuild
  clearSection(section) {
    this._data = this._data.filter(c => (c.meta?.section || 'default') !== section);
    const fp = this._sectionFilePath(section);
    if (fs.existsSync(fp)) try { fs.unlinkSync(fp); } catch (_) {}
    this._indexBM25();
  }

  close() {}
}

// ── Pinecone (cloud) — semantic only ──────────────────────────────────────
class PineconeVectorStore {
  constructor() {
    const { Pinecone } = require('@pinecone-database/pinecone');
    this.pc    = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    this.iName = process.env.PINECONE_INDEX || 'knowledge-hub-docs';
    this._idx  = null;
  }
  async _i() { if (!this._idx) this._idx = this.pc.index(this.iName); return this._idx; }
  setQuery() {}
  async upsert(chunks) {
    const idx  = await this._i();
    const vecs = chunks.map(c => ({
      id:       (c.meta.section+'__'+c.meta.title+'__'+c.meta.chunkIndex).replace(/\s+/g,'_'),
      values:   c.embedding,
      metadata: { ...c.meta, text: c.text },
    }));
    for (let i=0;i<vecs.length;i+=100) await idx.upsert(vecs.slice(i,i+100));
  }
  async search(queryVec, topK=5, filter={}) {
    const idx = await this._i();
    const res = await idx.query({ vector:queryVec, topK, includeMetadata:true,
      filter: Object.keys(filter).length ? filter : undefined });
    return res.matches.map(m => ({ score:m.score, text:m.metadata.text, meta:m.metadata }));
  }
  async count() { return (await (await this._i()).describeIndexStats()).totalVectorCount; }
  async clear() { await (await this._i()).deleteAll(); }
  close() {}
}

// ── Factory ────────────────────────────────────────────────────────────────
let _inst = null;
function getVectorStore() {
  if (_inst) return _inst;
  const p  = (process.env.VECTOR_STORE_PROVIDER || 'json').toLowerCase();
  if (p === 'pinecone') {
    _inst = new PineconeVectorStore();
  } else {
    const _dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), './data');
    const fp = process.env.VECTOR_DB_PATH
      ? path.resolve(process.env.VECTOR_DB_PATH)
      : path.join(_dataDir, 'vectors.json');
    _inst = new JSONVectorStore(fp);
  }
  return _inst;
}

module.exports = { getVectorStore, JSONVectorStore, PineconeVectorStore, BM25, rrf };
