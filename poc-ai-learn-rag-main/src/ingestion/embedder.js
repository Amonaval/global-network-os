/**
 * Embedder — v4
 *
 * Providers (set EMBEDDING_PROVIDER in .env):
 *   "nomic"  → nomic-embed-text via Ollama (LOCAL, best quality, recommended)
 *   "tfidf"  → pure JS TF-IDF (LOCAL, fallback, no extra install)
 *   "openai" → OpenAI text-embedding-3-small (CLOUD)
 *
 * nomic-embed-text produces 768-dim semantic vectors that understand
 * meaning, not just keyword overlap. Run once: ollama pull nomic-embed-text
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs   = require('fs');
const path = require('path');

// ── Nomic via Ollama (local semantic embeddings) ───────────────────────────
class NomicEmbedder {
  constructor() {
    this.fetch   = require('node-fetch');
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model   = process.env.NOMIC_MODEL     || 'nomic-embed-text';
    this.dims    = 768;
    console.log('  Nomic embedder → ' + this.baseUrl + ' model: ' + this.model);
  }

  async _embedBatch(texts) {
    let res;
    try {
      res = await this.fetch(this.baseUrl + '/api/embed', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ model: this.model, input: texts }),
      });
    } catch (err) {
      if (err.code === 'ECONNREFUSED') {
        throw new Error(
          'Ollama not running — needed for nomic embeddings.\n' +
          '  Run: ollama serve\n' +
          '  Then: ollama pull ' + this.model
        );
      }
      throw err;
    }

    if (!res.ok) {
      const body = await res.text();
      if (body.includes('not found') || body.includes('pull')) {
        throw new Error(
          'nomic-embed-text model not found.\n' +
          '  Run: ollama pull nomic-embed-text\n' +
          '  (it\'s ~274MB, downloads once)'
        );
      }
      throw new Error('Nomic embed error: ' + body);
    }

    const data = await res.json();
    // Ollama /api/embed returns { embeddings: [[...], [...]] }
    return data.embeddings || [];
  }

  async embed(texts) {
    // Ollama handles batches natively but cap at 32 to avoid memory spikes
    const BATCH = 32;
    const all   = [];
    for (let i = 0; i < texts.length; i += BATCH) {
      const batch = texts.slice(i, i + BATCH);
      process.stdout.write('  Embedding ' + Math.min(i + BATCH, texts.length) + '/' + texts.length + '...\r');
      const vecs = await this._embedBatch(batch);
      all.push(...vecs);
    }
    process.stdout.write('\n');
    return all;
  }

  async embedOne(text) {
    const [v] = await this._embedBatch([text]);
    return v;
  }

  // No-ops — nomic model is managed by Ollama, not our process
  fit()  {}
  save() {}
  load() {}
}

// ── TF-IDF (pure JS fallback) ──────────────────────────────────────────────
class TFIDFEmbedder {
  constructor(dims = 2048) {
    this.dims = dims; this.idf = {}; this.fitted = false; this.docCount = 0;
  }
  _tokens(text) {
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/).filter(w => w.length > 1);
    const bigrams = [];
    for (let i = 0; i < words.length - 1; i++) bigrams.push(words[i] + '_' + words[i+1]);
    return [...words, ...bigrams];
  }
  _bucket(term) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < term.length; i++) { h ^= term.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h % this.dims;
  }
  fit(texts) {
    const df = {}; this.docCount = texts.length;
    for (const t of texts) { const u = new Set(this._tokens(t)); for (const tok of u) df[tok] = (df[tok]||0)+1; }
    this.idf = {};
    for (const tok of Object.keys(df)) this.idf[tok] = Math.log((this.docCount+1)/(df[tok]+1))+1;
    this.fitted = true;
    console.log('  TF-IDF fitted: ' + Object.keys(this.idf).length + ' terms, ' + texts.length + ' docs');
  }
  _vectorise(text) {
    const vec = new Float32Array(this.dims); const toks = this._tokens(text); const tf = {};
    for (const t of toks) tf[t] = (tf[t]||0)+1;
    for (const tok of Object.keys(tf)) vec[this._bucket(tok)] += (tf[tok]/toks.length) * (this.idf[tok]||1.0);
    let norm = 0; for (let i = 0; i < this.dims; i++) norm += vec[i]*vec[i];
    norm = Math.sqrt(norm)||1; return Array.from(vec).map(v => v/norm);
  }
  async embed(texts) {
    if (!this.fitted) { console.warn('TF-IDF auto-fitting'); this.fit(texts); }
    return texts.map(t => this._vectorise(t));
  }
  async embedOne(text) {
    if (!this.fitted) {
      const _dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), './data');
      const p = path.join(_dataDir, 'tfidf_model.json');
      if (fs.existsSync(p)) this.load(p); else { console.warn('TF-IDF not fitted'); this.fit([text]); }
    }
    return this._vectorise(text);
  }
  save(fp) { fs.mkdirSync(path.dirname(fp),{recursive:true}); fs.writeFileSync(fp, JSON.stringify({dims:this.dims,idf:this.idf,docCount:this.docCount})); }
  load(fp) { const d=JSON.parse(fs.readFileSync(fp,'utf8')); this.dims=d.dims; this.idf=d.idf; this.docCount=d.docCount; this.fitted=true; console.log('  TF-IDF loaded ('+Object.keys(this.idf).length+' terms)'); }
}

// ── OpenAI (cloud) ─────────────────────────────────────────────────────────
class OpenAIEmbedder {
  constructor() {
    this.fetch  = require('node-fetch');
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model  = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
    if (!this.apiKey) throw new Error('OPENAI_API_KEY not set in .env');
  }
  async embed(texts) {
    const all=[]; const BATCH=100;
    for (let i=0;i<texts.length;i+=BATCH) {
      const res=await this.fetch('https://api.openai.com/v1/embeddings',{
        method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+this.apiKey},
        body:JSON.stringify({model:this.model,input:texts.slice(i,i+BATCH)}),
      });
      const j=await res.json(); if(j.error) throw new Error('OpenAI: '+j.error.message);
      all.push(...j.data.map(d=>d.embedding));
    }
    return all;
  }
  async embedOne(text) { const [v]=await this.embed([text]); return v; }
  fit(){} save(){} load(){}
}

// ── Factory ────────────────────────────────────────────────────────────────
let _inst = null;
function getEmbedder() {
  if (_inst) return _inst;
  const p = (process.env.EMBEDDING_PROVIDER || 'nomic').toLowerCase();
  if      (p === 'openai') _inst = new OpenAIEmbedder();
  else if (p === 'tfidf')  _inst = new TFIDFEmbedder();
  else                     _inst = new NomicEmbedder();   // default: nomic
  return _inst;
}

module.exports = { getEmbedder, NomicEmbedder, TFIDFEmbedder, OpenAIEmbedder };
