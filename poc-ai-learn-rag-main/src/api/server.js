/**
 * Express API Server
 * Serves the chat UI, setup wizard, session memory, and setup pipeline endpoints.
 */

require('dotenv').config({ path: process.env.DOTENV_PATH || require('path').resolve(__dirname, '../../.env') });

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const { spawn }   = require('child_process');
const readline    = require('readline');
const crypto      = require('crypto');

const multer = require('multer');

const { query }          = require('../rag/query');
const { getVectorStore } = require('../vectorstore/store');
const { chunkText, chunkByDocType } = require('../ingestion/cleaner');
const { enrichChunks, isEnabled: isEnrichmentEnabled } = require('../ingestion/enricher');
const { getEmbedder }    = require('../ingestion/embedder');
const { readConfig, writeConfig, configToEnv, getDataDir, getDocsDir } = require('../config/config');
const { ConfluenceClient, buildOAuthUrl, exchangeOAuthCode } = require('../integrations/confluence');
const {
  readLicense, deactivateLicense, getTierInfo, getEffectiveTier,
  checkQueryGate, checkUploadGate, getMonthlyQueryCount, getUploadCount, activateLicense,
} = require('../license/license');

// ── Upload helpers ──────────────────────────────────────────────────────────
function getUploadsDir()      { return path.join(getDocsDir(), 'uploads'); }
function getUploadIndexPath() { return path.join(getDataDir(), 'upload_index.json'); }

function loadUploadIndex() {
  const p = getUploadIndexPath();
  if (fs.existsSync(p)) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) {} }
  return [];
}

function saveUploadIndex(index) {
  fs.mkdirSync(path.dirname(getUploadIndexPath()), { recursive: true });
  fs.writeFileSync(getUploadIndexPath(), JSON.stringify(index, null, 2));
}

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = getUploadsDir();
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname.replace(/[^\w.\-]/g, '_'));
  },
});

const CODE_EXTENSIONS = new Set([
  // JavaScript / TypeScript
  '.js', '.jsx', '.ts', '.tsx',
  // Python / Ruby / Systems
  '.py', '.rb', '.go', '.java',
  '.rs', '.cpp', '.c', '.cs', '.swift', '.kt',
  // Web / scripting
  '.php', '.sh',
  // Styles
  '.css', '.scss', '.less', '.sass',
  // Frameworks
  '.vue', '.svelte',
  // Data / config
  '.yaml', '.yml', '.json', '.toml', '.ini', '.xml', '.env',
  // Query / schema / infra
  '.sql', '.graphql', '.gql', '.tf', '.proto',
]);

const uploadMiddleware = multer({
  storage: uploadStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const docTypes = ['.pdf', '.docx', '.txt', '.md', '.html', '.zip'];
    if (docTypes.includes(ext) || CODE_EXTENSIONS.has(ext)) cb(null, true);
    else cb(new Error('Unsupported file type: ' + ext));
  },
});

async function extractTextFromFile(filePath, ext) {
  if (ext === '.pdf') {
    const { extractFromPdf }  = require('../ingestion/extractors/pdf');
    return [{ name: path.basename(filePath), content: await extractFromPdf(filePath) }];
  }
  if (ext === '.docx') {
    const { extractFromDocx } = require('../ingestion/extractors/docx');
    return [{ name: path.basename(filePath), content: await extractFromDocx(filePath) }];
  }
  if (ext === '.zip') {
    const { extractFromZip }  = require('../ingestion/extractors/zip');
    return extractFromZip(filePath);
  }
  if (CODE_EXTENSIONS.has(ext)) {
    const { extractFromCode } = require('../ingestion/extractors/code');
    return extractFromCode(filePath);
  }
  const { extractFromText } = require('../ingestion/extractors/text');
  return [{ name: path.basename(filePath), content: extractFromText(filePath) }];
}

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Session persistence ─────────────────────────────────────────────────────
const DATA_DIR      = process.env.DATA_DIR || path.resolve(process.cwd(), './data');
const SESSIONS_PATH = path.join(DATA_DIR, 'sessions.json');

function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_PATH)) return JSON.parse(fs.readFileSync(SESSIONS_PATH, 'utf8'));
  } catch (_) {}
  return {};
}

function saveSessions(sessions) {
  try {
    fs.mkdirSync(path.dirname(SESSIONS_PATH), { recursive: true });
    fs.writeFileSync(SESSIONS_PATH, JSON.stringify(sessions, null, 2));
  } catch (_) {}
}

let sessions = loadSessions();

function getSession(id) {
  if (!sessions[id]) {
    sessions[id] = { id, title: 'New conversation', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), messages: [] };
  }
  return sessions[id];
}

function addMessage(id, role, content) {
  const s = getSession(id);
  s.messages.push({ role, content, ts: new Date().toISOString() });
  if (s.title === 'New conversation' && role === 'user') {
    s.title = content.slice(0, 60) + (content.length > 60 ? '…' : '');
  }
  if (s.messages.length > 30) s.messages.splice(0, s.messages.length - 30);
  s.updatedAt = new Date().toISOString();
  saveSessions(sessions);
}

app.use(cors());
app.use(express.json());

//  app.use(express.static(path.join(__dirname, '../../public')));


// Serve React build if built, otherwise fall back to legacy public/ — parallel migration
const FRONTEND_DIST = path.join(__dirname, '../../frontend/dist');
const PUBLIC_DIR    = path.join(__dirname, '../../public');
const hasFrontendBuild = fs.existsSync(path.join(FRONTEND_DIST, 'index.html'));
if (hasFrontendBuild) {
  app.use(express.static(FRONTEND_DIST));
}
app.use(express.static(PUBLIC_DIR)); // always serve public/ for CSS assets

// ── Setup pipeline ──────────────────────────────────────────────────────────

// Track running jobs so we can prevent double-starts and kill on disconnect
let buildJob      = null;
let activeChildren = [];

function sendSse(res, type, message) {
  try { res.write('data: ' + JSON.stringify({ type, message }) + '\n\n'); } catch (_) {}
}

function spawnAndStream(cmd, args, env, res) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { env, shell: false });
    activeChildren.push(child);

    const rl    = readline.createInterface({ input: child.stdout });
    const rlErr = readline.createInterface({ input: child.stderr });

    rl.on('line',    line => sendSse(res, 'log', line));
    rlErr.on('line', line => sendSse(res, 'log', line));

    child.on('close', code => {
      activeChildren = activeChildren.filter(c => c !== child);
      resolve(code);
    });
  });
}

function killActiveChildren() {
  for (const child of activeChildren) {
    try { child.kill('SIGTERM'); } catch (_) {}
  }
  activeChildren = [];
}

// POST /api/setup/cancel — kill any running build and reset state
app.post('/api/setup/cancel', (req, res) => {
  killActiveChildren();
  buildJob = null;
  res.json({ ok: true });
});

// Helper: determine which fetch script to use and run Phase 1 of build
async function runFetchPhase(res, childEnv, sourceType) {
  if (sourceType === 'confluence') {
    sendSse(res, 'phase', '── Phase 1/2: Fetching from Confluence ──');
    const script = path.resolve(__dirname, '../integrations/confluence-fetch.js');
    return spawnAndStream('node', [script], childEnv, res);
  }
  if (sourceType === 'url') {
    sendSse(res, 'phase', '── Phase 1/2: Fetching web pages ──');
    const script = path.resolve(__dirname, '../crawler/crawl.js');
    return spawnAndStream('node', [script], { ...childEnv, CRAWL_MODE: 'url' }, res);
  }
  sendSse(res, 'phase', '── Phase 1/2: Crawling documentation portal ──');
  const script = path.resolve(__dirname, '../crawler/crawl.js');
  return spawnAndStream('node', [script], childEnv, res);
}

// POST /api/setup/build — saves config, runs fetch (crawl or Confluence) then ingest, streams output
app.post('/api/setup/build', async (req, res) => {
  if (buildJob) {
    return res.status(409).json({ error: 'A build is already running' });
  }

  const config     = req.body;
  const sourceType = (config && config.source && config.source.type) || 'portal';

  // Validate required fields per source type
  if (sourceType === 'confluence') {
    if (!config.confluence || !config.confluence.url) {
      return res.status(400).json({ error: 'config.confluence.url is required for Confluence source' });
    }
  } else if (sourceType === 'url') {
    const hasGroups = Array.isArray(config.urlFetch?.groups) && config.urlFetch.groups.some(g => g.urls && g.urls.length > 0);
    const hasUrls   = Array.isArray(config.urlFetch?.urls)   && config.urlFetch.urls.length > 0;
    if (!hasGroups && !hasUrls) {
      return res.status(400).json({ error: 'urlFetch.groups must have at least one URL' });
    }
  } else {
    if (!config || !config.portal || !config.portal.baseUrl) {
      return res.status(400).json({ error: 'config.portal.baseUrl is required' });
    }
  }

  // Save config (without setupComplete yet)
  writeConfig({ ...config, setupComplete: false });

  // Reload env vars from newly saved config
  const savedConfig = readConfig();
  const childEnv    = { ...process.env, ...configToEnv(savedConfig) };

  // Set up streaming response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  buildJob = true;

  try {
    // ── Phase 1: Fetch (crawl or Confluence) ───────────────────────────────
    const fetchCode = await runFetchPhase(res, childEnv, sourceType);

    if (fetchCode !== 0) {
      sendSse(res, 'error', 'Fetch failed with exit code ' + fetchCode + '. Check the log above for details.');
      res.end();
      buildJob = null;
      return;
    }

    sendSse(res, 'phase', '── Phase 2/2: Building knowledge base ──');

    // ── Phase 2: Ingest ─────────────────────────────────────────────────────
    const ingestScript = path.resolve(__dirname, '../ingestion/ingest.js');
    const ingestCode   = await spawnAndStream('node', [ingestScript], childEnv, res);
    if (ingestCode !== 0) {
      sendSse(res, 'error', 'Ingest failed with exit code ' + ingestCode + '. Check the log above for details.');
      res.end();
      buildJob = null;
      return;
    }

    // ── Mark complete ────────────────────────────────────────────────────────
    writeConfig({ setupComplete: true });

    // Reload vector store so the chat UI can serve queries immediately
    try {
      const store = getVectorStore();
      store._load();
    } catch (_) {}

    sendSse(res, 'done', 'Knowledge base is ready! ' + getVectorStore().count() + ' chunks indexed.');
  } catch (err) {
    sendSse(res, 'error', 'Unexpected error: ' + err.message);
  } finally {
    res.end();
    buildJob = null;
  }
});

// POST /api/setup/prelogin — open a visible browser so user can log in manually
app.post('/api/setup/prelogin', async (req, res) => {
  const { portal } = req.body || {};
  if (!portal?.baseUrl) {
    return res.status(400).json({ error: 'portal.baseUrl is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const crawlScript = path.resolve(__dirname, '../crawler/crawl.js');
  const childEnv = {
    ...process.env,
    DOCS_BASE_URL:    portal.baseUrl,
    CONTENT_SELECTOR: portal.contentSelector || '#main-content',
    CRAWL_MODE:       'prelogin',
    LOGIN_TIMEOUT_MS: '300000',
    DATA_DIR:         process.env.DATA_DIR || path.resolve(process.cwd(), './data'),
  };

  sendSse(res, 'phase', 'Opening browser for manual login...');
  const code = await spawnAndStream('node', [crawlScript], childEnv, res);

  if (code !== 0) {
    sendSse(res, 'error', 'Pre-login failed or timed out. Try again.');
  } else {
    sendSse(res, 'done', 'Login session saved! You can now proceed with the build.');
  }
  res.end();
});

// POST /api/setup/rebuild — re-fetch + re-ingest with existing config, streams SSE
app.post('/api/setup/rebuild', async (req, res) => {
  if (buildJob) {
    return res.status(409).json({ error: 'A build is already running' });
  }

  const savedConfig = readConfig();
  const sourceType  = (savedConfig && savedConfig.source && savedConfig.source.type) || 'portal';

  if (sourceType === 'confluence') {
    if (!savedConfig.confluence || !savedConfig.confluence.url) {
      return res.status(400).json({ error: 'No Confluence configuration found. Run the setup wizard first.' });
    }
  } else if (sourceType === 'url') {
    const hasGroups = Array.isArray(savedConfig.urlFetch?.groups) && savedConfig.urlFetch.groups.some(g => g.urls && g.urls.length > 0);
    const hasUrls   = Array.isArray(savedConfig.urlFetch?.urls)   && savedConfig.urlFetch.urls.length > 0;
    if (!hasGroups && !hasUrls) {
      return res.status(400).json({ error: 'No URL groups found in configuration. Run the setup wizard first.' });
    }
  } else {
    if (!savedConfig || !savedConfig.portal?.baseUrl) {
      return res.status(400).json({ error: 'No configuration found. Run the setup wizard first.' });
    }
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  buildJob = true;
  const childEnv = { ...process.env, ...configToEnv(savedConfig) };

  try {
    const fetchCode = await runFetchPhase(res, childEnv, sourceType);

    if (fetchCode !== 0) {
      sendSse(res, 'error', 'Fetch failed with exit code ' + fetchCode + '. Check the log above for details.');
      return;
    }

    sendSse(res, 'phase', '── Re-indexing Phase 2/2: Building knowledge base ──');
    const ingestScript = path.resolve(__dirname, '../ingestion/ingest.js');
    const ingestCode   = await spawnAndStream('node', [ingestScript, '--force'], childEnv, res);

    if (ingestCode !== 0) {
      sendSse(res, 'error', 'Ingest failed with exit code ' + ingestCode + '. Check the log above for details.');
      return;
    }

    writeConfig({ setupComplete: true });
    try { getVectorStore()._load(); } catch (_) {}
    sendSse(res, 'done', 'Knowledge base rebuilt! ' + getVectorStore().count() + ' chunks indexed.');
  } catch (err) {
    sendSse(res, 'error', 'Unexpected error: ' + err.message);
  } finally {
    res.end();
    buildJob = null;
  }
});

// POST /api/setup/reset — wipe all data, clear setupComplete
app.post('/api/setup/reset', (req, res) => {
  try {
    writeConfig({ setupComplete: false });
    const store = getVectorStore();
    store.clear();
    sessions = {};
    saveSessions(sessions);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/setup/test-url — verify that a URL is reachable
app.get('/api/setup/test-url', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'url param required' });
  try {
    const nodeFetch = require('node-fetch');
    const r = await nodeFetch(url, { method: 'HEAD', timeout: 8000 });
    res.json({ ok: r.ok, status: r.status });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// GET /api/setup/test-ollama — verify Ollama is running
app.get('/api/setup/test-ollama', async (req, res) => {
  const url = req.query.url || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  try {
    const nodeFetch = require('node-fetch');
    const r = await nodeFetch(url + '/api/tags', { timeout: 5000 });
    const data = await r.json();
    res.json({ ok: true, models: (data.models || []).map(m => m.name) });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// GET /api/setup/test-vllm — verify vLLM / OpenAI-compatible server is running
app.get('/api/setup/test-vllm', async (req, res) => {
  const url = req.query.url || process.env.VLLM_BASE_URL || 'http://localhost:8000';
  try {
    const nodeFetch = require('node-fetch');
    const r = await nodeFetch(url + '/v1/models', { timeout: 5000 });
    if (!r.ok) { res.json({ ok: false, error: 'HTTP ' + r.status }); return; }
    const data = await r.json();
    const models = (data.data || []).map(m => m.id);
    res.json({ ok: true, models });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// ── Confluence integration ───────────────────────────────────────────────────

// In-memory OAuth state store (key = state string, value = { clientId, clientSecret, done, result, error })
const oauthPending = {};

// POST /api/confluence/test — test API token or OAuth connection
app.post('/api/confluence/test', async (req, res) => {
  const { url, authMethod, email, apiToken, accessToken, cloudId } = req.body || {};
  try {
    const client = new ConfluenceClient({ url, authMethod: authMethod || 'apitoken', email, apiToken, accessToken, cloudId });
    const result = await client.testConnection();
    res.json({ ok: true, ...result });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// GET /api/confluence/spaces — list available spaces (uses current saved config)
app.get('/api/confluence/spaces', async (req, res) => {
  const cfg = readConfig();
  const c   = cfg.confluence || {};
  try {
    const client = new ConfluenceClient({
      url:         c.url,
      authMethod:  c.authMethod || 'apitoken',
      email:       c.email,
      apiToken:    c.apiToken,
      accessToken: c.oauthAccessToken,
      cloudId:     c.oauthCloudId,
    });
    const spaces = await client.getSpaces();
    res.json({ ok: true, spaces: spaces.map(s => ({ id: s.id, key: s.key, name: s.name })) });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/confluence/oauth/start — generate Atlassian OAuth authorization URL
app.post('/api/confluence/oauth/start', (req, res) => {
  const { clientId, clientSecret } = req.body || {};
  if (!clientId || !clientSecret) {
    return res.status(400).json({ error: 'clientId and clientSecret are required' });
  }
  const state       = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const callbackUrl = req.protocol + '://' + req.get('host') + '/api/confluence/oauth/callback';
  const authUrl     = buildOAuthUrl(clientId, callbackUrl, state);
  oauthPending[state] = { clientId, clientSecret, callbackUrl, done: false, result: null, error: null };
  // Auto-clean stale state after 10 minutes
  setTimeout(() => { delete oauthPending[state]; }, 10 * 60 * 1000);
  res.json({ ok: true, authUrl, state });
});

// GET /api/confluence/oauth/callback — Atlassian redirects here after user approves
app.get('/api/confluence/oauth/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (!state || !oauthPending[state]) {
    return res.status(400).send('<h2>Invalid or expired OAuth state. Please restart the connection flow.</h2>');
  }

  const pending = oauthPending[state];

  if (error) {
    pending.error = 'Atlassian denied access: ' + error;
    pending.done  = true;
    return res.send('<h2>Authorization denied.</h2><p>' + error + '</p><p>You can close this window.</p>');
  }

  try {
    const tokens = await exchangeOAuthCode(pending.clientId, pending.clientSecret, code, pending.callbackUrl);
    pending.result = tokens;
    pending.done   = true;

    // Save tokens to config immediately
    writeConfig({
      confluence: {
        authMethod:       'oauth',
        oauthAccessToken: tokens.accessToken,
        oauthRefreshToken: tokens.refreshToken,
        oauthCloudId:     tokens.cloudId,
        oauthCloudName:   tokens.cloudName,
      },
    });

    res.send('<html><body style="font-family:sans-serif;padding:40px;text-align:center">' +
      '<h2 style="color:#22863a">✅ Connected to Confluence!</h2>' +
      '<p>Cloud: <strong>' + (tokens.cloudName || tokens.cloudId) + '</strong></p>' +
      '<p>You can close this window and return to the setup wizard.</p>' +
      '<script>window.close();</script></body></html>');
  } catch (err) {
    pending.error = err.message;
    pending.done  = true;
    res.send('<html><body style="font-family:sans-serif;padding:40px;text-align:center">' +
      '<h2 style="color:#d73a49">❌ Authorization failed</h2>' +
      '<p>' + err.message + '</p>' +
      '<p>Close this window and try again.</p></body></html>');
  }
});

// GET /api/confluence/oauth/status?state=... — poll from wizard to know when OAuth completes
app.get('/api/confluence/oauth/status', (req, res) => {
  const { state } = req.query;
  const pending   = oauthPending[state];
  if (!pending) return res.json({ done: false, error: 'Unknown state' });
  if (!pending.done) return res.json({ done: false });
  if (pending.error) return res.json({ done: true, error: pending.error });
  delete oauthPending[state]; // clean up
  res.json({ done: true, cloudId: pending.result.cloudId, cloudName: pending.result.cloudName });
});

// ── Document upload ─────────────────────────────────────────────────────────

// POST /api/docs/upload — receive files, extract, chunk, embed, store (SSE)
app.post('/api/docs/upload', uploadMiddleware.array('files', 20), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files provided' });
  }

  const uploadGate = checkUploadGate();
  if (!uploadGate.allowed) {
    // Clean up multer-saved temp files before returning
    for (const f of req.files) try { fs.unlinkSync(f.path); } catch (_) {}
    return res.status(402).json({
      error: 'Upload limit reached. You have used all ' + uploadGate.limit + ' upload slots on the Free plan. Upgrade to Pro for unlimited uploads.',
      limitReached: true, tier: uploadGate.tier,
    });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const CHUNK_SIZE    = parseInt(process.env.CHUNK_SIZE    || '400', 10);
  const CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP || '50',  10);
  const store         = getVectorStore();
  const embedder      = getEmbedder();
  const uploadIndex   = loadUploadIndex();

  let totalChunks   = 0;
  let processedFiles = 0;

  try {
    for (const file of req.files) {
      const ext      = path.extname(file.originalname).toLowerCase();
      const filename = file.originalname.replace(/[^\w.\-]/g, '_');

      sendSse(res, 'phase', '── Processing: ' + file.originalname + ' ──');

      let entries;
      try {
        entries = await extractTextFromFile(file.path, ext);
      } catch (err) {
        sendSse(res, 'log', '⚠️  Could not extract text from ' + file.originalname + ': ' + err.message);
        continue;
      }

      let fileChunkCount = 0;

      for (const entry of entries) {
        if (!entry.content || entry.content.trim().length < 30) continue;

        sendSse(res, 'log', 'Chunking ' + entry.name + ' (' + entry.content.length.toLocaleString() + ' chars)…');

        const rawChunks = chunkByDocType(
          entry.content,
          { title: entry.name, section: 'uploads', url: null },
          CHUNK_SIZE, CHUNK_OVERLAP
        );

        if (rawChunks.length === 0) { sendSse(res, 'log', '  No content extracted.'); continue; }

        // Prefix each chunk with the document name so both BM25 keyword search
        // and semantic search can find it when queried by filename or topic.
        const docLabel = entry.name.replace(/\.\w+$/, '').replace(/[-_]/g, ' ');
        const chunks = rawChunks.map(c => ({
          ...c,
          text: `[Document: ${docLabel}]\n\n${c.text}`,
          _docContext: { title: entry.name, section: 'uploads', intro: entry.content.slice(0, 2000) },
        }));

        // Contextual enrichment (D.12) — if enabled, prepend LLM-generated context before embedding
        if (isEnrichmentEnabled()) {
          sendSse(res, 'log', 'Enriching ' + chunks.length + ' chunks with context…');
          await enrichChunks(chunks, {
            onProgress: (done, total) => sendSse(res, 'log', '  Enriched ' + done + '/' + total + ' chunks'),
          });
          for (const c of chunks) delete c._docContext;
        }

        sendSse(res, 'log', 'Embedding ' + chunks.length + ' chunks…');
        const embeddings = await embedder.embed(chunks.map(c => c.enrichedText || c.text));

        // Validate — if Ollama returns empty/malformed vectors we catch it here
        // instead of silently storing un-searchable chunks.
        if (!embeddings || embeddings.length === 0 || !Array.isArray(embeddings[0])) {
          throw new Error(
            'Embedder returned no vectors for ' + entry.name + '. ' +
            'Is Ollama running? (ollama serve) ' +
            'Is the embedding model pulled? (ollama pull nomic-embed-text)'
          );
        }
        if (embeddings[0].length < 64) {
          throw new Error(
            'Embedder returned vectors with only ' + embeddings[0].length +
            ' dimensions (expected 768). Model may be wrong — check NOMIC_MODEL in .env'
          );
        }
        sendSse(res, 'log', '  Vectors: ' + embeddings[0].length + 'd × ' + embeddings.length);

        store.upsert(chunks.map((c, i) => ({ ...c, embedding: embeddings[i] })));

        fileChunkCount += chunks.length;
        totalChunks    += chunks.length;
        sendSse(res, 'log', '✅ ' + chunks.length + ' chunks indexed from ' + entry.name);
      }

      // Update persistent upload index
      const existing = uploadIndex.findIndex(u => u.name === filename);
      const record   = { name: filename, originalName: file.originalname, size: file.size, chunks: fileChunkCount, uploadedAt: new Date().toISOString() };
      if (existing >= 0) uploadIndex[existing] = record;
      else uploadIndex.push(record);
      processedFiles++;
    }

    saveUploadIndex(uploadIndex);
    sendSse(res, 'done', 'Indexed ' + totalChunks + ' chunks from ' + processedFiles + ' file(s). Total: ' + store.count() + ' chunks indexed.');
  } catch (err) {
    sendSse(res, 'error', 'Upload error: ' + err.message);
  } finally {
    res.end();
  }
});

// GET /api/docs/uploads — list uploaded files
app.get('/api/docs/uploads', (req, res) => {
  res.json({ uploads: loadUploadIndex() });
});

// DELETE /api/docs/upload/:name — remove an uploaded file and its chunks
app.delete('/api/docs/upload/:name', (req, res) => {
  const name  = decodeURIComponent(req.params.name);
  const index = loadUploadIndex();
  const item  = index.find(u => u.name === name);
  if (!item) return res.status(404).json({ error: 'File not found' });

  try { const fp = path.join(getUploadsDir(), name); if (fs.existsSync(fp)) fs.unlinkSync(fp); } catch (_) {}

  const store = getVectorStore();
  const before = store._data.length;
  store._data = store._data.filter(c => !(c.meta?.section === 'uploads' && c.meta?.title === name));
  store._save();
  store._indexBM25();

  saveUploadIndex(index.filter(u => u.name !== name));
  res.json({ ok: true, chunksRemoved: before - store._data.length });
});

// ── Licensing ─────────────────────────────────────────────────────────────────

// GET /api/license — current license status + usage
app.get('/api/license', (req, res) => {
  const lic   = readLicense();
  const tier  = getEffectiveTier();
  const info  = getTierInfo(tier);
  const gate  = checkQueryGate();
  res.json({
    tier,
    tierName:        info.name,
    tierColor:       info.color,
    key:             lic.key ? lic.key.slice(0, 8) + '…' : null,
    activatedAt:     lic.activatedAt || null,
    expiry:          lic.expiry || null,
    offline:         lic.offline || false,
    queriesThisMonth: gate.limit === -1 ? gate.used || getMonthlyQueryCount() : gate.used,
    queryLimit:      gate.limit,
    uploadCount:     getUploadCount(),
    uploadLimit:     info.uploadLimit,
    features: {
      confluence:  info.confluenceAccess,
      analytics:   info.analyticsAccess,
      unlimited:   info.queriesPerMonth === -1,
    },
    stripeProMonthlyUrl:  process.env.STRIPE_PRO_MONTHLY_URL  || '',
    stripeProAnnualUrl:   process.env.STRIPE_PRO_ANNUAL_URL   || '',
    stripeLifetimeUrl:    process.env.STRIPE_LIFETIME_URL     || '',
  });
});

// POST /api/license/activate — validate and store a license key
app.post('/api/license/activate', async (req, res) => {
  const { key } = req.body || {};
  if (!key) return res.status(400).json({ error: 'key is required' });
  try {
    const result = await activateLicense(key);
    if (!result.ok) return res.status(400).json({ error: result.error });
    const info = getTierInfo(result.tier);
    res.json({ ok: true, tier: result.tier, tierName: info.name, activatedAt: result.activatedAt, expiry: result.expiry || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/license — deactivate license (reverts to free tier)
app.delete('/api/license', (req, res) => {
  deactivateLicense();
  res.json({ ok: true, tier: 'free' });
});

// POST /api/stripe/webhook — Stripe event receiver (requires STRIPE_WEBHOOK_SECRET)
// This is a stub — wire up a real license-key generation service when ready to sell
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) { return res.json({ received: true }); }
  try {
    const event = JSON.parse(req.body.toString());
    // TODO: verify stripe signature with stripe.webhooks.constructEvent(req.body, sig, secret)
    // TODO: on checkout.session.completed → generate + email license key to customer
    console.log('[Stripe webhook]', event.type);
  } catch (_) {}
  res.json({ received: true });
});

// ── Analytics ────────────────────────────────────────────────────────────────

// GET /api/analytics — aggregate eval.jsonl into KPIs, unanswered questions, etc.
app.get('/api/analytics', (req, res) => {
  const evalPath = path.join(getDataDir(), 'eval.jsonl');
  let entries = [];
  if (fs.existsSync(evalPath)) {
    try {
      entries = fs.readFileSync(evalPath, 'utf8')
        .split('\n').filter(l => l.trim())
        .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
        .filter(Boolean);
    } catch (_) {}
  }

  const total    = entries.length;
  const blocked  = entries.filter(e => e.blocked).length;
  const answered = total - blocked;

  const avgSemScore  = total > 0 ? parseFloat((entries.reduce((s, e) => s + (e.topSemScore || 0), 0) / total).toFixed(3)) : 0;
  const avgLatencyMs = total > 0 ? Math.round(entries.reduce((s, e) => s + (e.latencyMs || 0), 0) / total) : 0;

  const blockedQuestions = {};
  for (const e of entries.filter(e => e.blocked)) {
    const k = (e.question || '').toLowerCase().trim();
    if (k) blockedQuestions[k] = (blockedQuestions[k] || 0) + 1;
  }
  const topUnanswered = Object.entries(blockedQuestions)
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([question, count]) => ({ question, count }));

  const sectionCounts = {};
  for (const e of entries.filter(e => !e.blocked)) {
    for (const s of (e.sectionsUsed || [])) sectionCounts[s] = (sectionCounts[s] || 0) + 1;
  }
  const topSections = Object.entries(sectionCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([section, count]) => ({ section, count }));

  res.json({
    summary: { total, answered, blocked, answerRate: total > 0 ? Math.round(answered/total*100) : 0, avgSemScore, avgLatencyMs },
    topUnanswered,
    topSections,
    recentQueries: entries.slice(-20).reverse(),
  });
});

// ── Documentation Gap Intelligence ──────────────────────────────────────────

const GAP_STOP_WORDS = new Set([
  'what','where','when','which','who','how','why','the','and','for','are','but',
  'not','you','all','can','had','her','was','one','our','out','get','has','him',
  'his','its','now','see','two','use','way','with','from','that','this','have',
  'your','will','been','than','more','also','into','they','then','some','them',
  'their','there','these','would','about','could','other','does','did','just',
  'like','only','well','over','such','both','each','much','many','most','need',
  'want','make','find','work','show','tell','give','keep','look','know','used',
  'using','being','should','could','would','might','shall','come','back','here',
]);

function extractKeywords(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !GAP_STOP_WORDS.has(w));
}

// GET /api/gaps — documentation gap intelligence: clusters of unanswered questions
app.get('/api/gaps', (req, res) => {
  const evalPath = path.join(getDataDir(), 'eval.jsonl');
  let entries = [];
  if (fs.existsSync(evalPath)) {
    try {
      entries = fs.readFileSync(evalPath, 'utf8')
        .split('\n').filter(l => l.trim())
        .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
        .filter(Boolean);
    } catch (_) {}
  }

  const blocked = entries.filter(e => e.blocked && e.question);
  const totalBlocked = blocked.length;

  if (totalBlocked === 0) {
    return res.json({ clusters: [], totalBlocked: 0, totalClusters: 0 });
  }

  // Build keyword frequency across all blocked questions
  const keywordFreq = {};
  for (const e of blocked) {
    for (const kw of new Set(extractKeywords(e.question))) {
      keywordFreq[kw] = (keywordFreq[kw] || 0) + 1;
    }
  }

  // Assign each blocked entry to the cluster of its most-frequent keyword
  const clusters = {};
  const unclusteredLabel = 'other';

  for (const e of blocked) {
    const kws = extractKeywords(e.question);
    // Pick the keyword that appears most often across all blocked questions
    let bestKw = null;
    let bestFreq = 0;
    for (const kw of kws) {
      if (keywordFreq[kw] > bestFreq) { bestFreq = keywordFreq[kw]; bestKw = kw; }
    }
    const label = bestKw || unclusteredLabel;

    if (!clusters[label]) clusters[label] = { label, questions: {}, count: 0, firstSeen: e.ts, lastSeen: e.ts };
    const c = clusters[label];
    c.count++;
    const qKey = (e.question || '').toLowerCase().trim();
    c.questions[qKey] = (c.questions[qKey] || 0) + 1;
    if (e.ts && e.ts < c.firstSeen) c.firstSeen = e.ts;
    if (e.ts && e.ts > c.lastSeen)  c.lastSeen  = e.ts;
  }

  // Shape response: top unique questions per cluster, sorted by count desc
  const result = Object.values(clusters)
    .sort((a, b) => b.count - a.count)
    .map(c => ({
      label:      c.label,
      count:      c.count,
      firstSeen:  c.firstSeen || null,
      lastSeen:   c.lastSeen  || null,
      questions:  Object.entries(c.questions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([q, n]) => ({ text: q, count: n })),
    }));

  res.json({ clusters: result, totalBlocked, totalClusters: result.length });
});

// GET /api/gaps/intelligence — enriched gap clusters with priority, trending, and action recommendations
app.get('/api/gaps/intelligence', (req, res) => {
  const evalPath = path.join(getDataDir(), 'eval.jsonl');
  let entries = [];
  if (fs.existsSync(evalPath)) {
    try {
      entries = fs.readFileSync(evalPath, 'utf8')
        .split('\n').filter(l => l.trim())
        .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
        .filter(Boolean);
    } catch (_) {}
  }

  const blocked = entries.filter(e => e.blocked && e.question);
  if (blocked.length === 0) {
    return res.json({ clusters: [], totalBlocked: 0, totalClusters: 0, hardBlocked: 0, softBlocked: 0 });
  }

  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  // Build keyword frequency
  const keywordFreq = {};
  for (const e of blocked) {
    for (const kw of new Set(extractKeywords(e.question))) {
      keywordFreq[kw] = (keywordFreq[kw] || 0) + 1;
    }
  }

  // Cluster entries
  const clusters = {};
  for (const e of blocked) {
    const kws = extractKeywords(e.question);
    let bestKw = null, bestFreq = 0;
    for (const kw of kws) {
      if (keywordFreq[kw] > bestFreq) { bestFreq = keywordFreq[kw]; bestKw = kw; }
    }
    const label = bestKw || 'other';
    if (!clusters[label]) clusters[label] = { label, entries: [], questions: {}, firstSeen: e.ts, lastSeen: e.ts };
    const c = clusters[label];
    c.entries.push(e);
    const qKey = (e.question || '').toLowerCase().trim();
    c.questions[qKey] = (c.questions[qKey] || 0) + 1;
    if (e.ts && e.ts < c.firstSeen) c.firstSeen = e.ts;
    if (e.ts && e.ts > c.lastSeen)  c.lastSeen  = e.ts;
  }

  const hardBlockedTotal = blocked.filter(e => !e.softBlocked).length;
  const softBlockedTotal = blocked.filter(e => e.softBlocked).length;

  const result = Object.values(clusters).map(c => {
    const count = c.entries.length;
    const recentCount = c.entries.filter(e => e.ts && (now - new Date(e.ts).getTime()) < sevenDaysMs).length;
    const trending = recentCount >= 2 && recentCount / count >= 0.3;
    const daysSinceLast = c.lastSeen ? (now - new Date(c.lastSeen).getTime()) / (24 * 60 * 60 * 1000) : 30;
    const recencyWeight = Math.max(0.1, 1 - daysSinceLast / 30);
    const priority = Math.round(count * recencyWeight * (trending ? 1.5 : 1.0) * 10) / 10;

    // Collect nearMissSections from entries that have them
    const nearMissMap = {};
    for (const e of c.entries) {
      for (const s of (e.nearMissSections || [])) nearMissMap[s] = (nearMissMap[s] || 0) + 1;
    }
    const nearMissSections = Object.entries(nearMissMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([s]) => s);

    // Determine action recommendation
    const avgScore = c.entries.reduce((sum, e) => sum + (e.topSemScore || 0), 0) / count;
    let actionType, actionLabel;
    if (nearMissSections.length > 0) {
      actionType = 'update_section';
      actionLabel = 'Update existing section: ' + nearMissSections[0];
    } else if (avgScore < 0.1) {
      actionType = 'create_doc';
      actionLabel = 'Create new documentation';
    } else {
      actionType = 'review_section';
      actionLabel = 'Review documentation coverage';
    }

    return {
      label:            c.label,
      count,
      recentCount,
      trending,
      priority,
      firstSeen:        c.firstSeen || null,
      lastSeen:         c.lastSeen  || null,
      nearMissSections,
      actionType,
      actionLabel,
      questions: Object.entries(c.questions)
        .sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([q, n]) => ({ text: q, count: n })),
    };
  }).sort((a, b) => b.priority - a.priority);

  res.json({ clusters: result, totalBlocked: blocked.length, totalClusters: result.length, hardBlocked: hardBlockedTotal, softBlocked: softBlockedTotal });
});

// POST /api/gaps/outline — LLM-generated doc outline for a gap topic
app.post('/api/gaps/outline', async (req, res) => {
  const { topic, questions } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'topic required' });

  const questionList = (questions || []).slice(0, 8).map(q => '- ' + q).join('\n');
  const system = 'You are a technical documentation writer. Return ONLY valid JSON, no markdown fences, no extra text.';
  const userMsg = `Users have been asking about "${topic}" but the documentation does not cover it.

Representative questions asked:
${questionList || '(no sample questions provided)'}

Generate a structured documentation outline for a new page about "${topic}". Return ONLY valid JSON in this exact format:
{
  "title": "...",
  "summary": "...",
  "sections": [
    {"heading": "...", "contentHint": "..."}
  ],
  "estimatedReadMins": 5
}

The outline should directly address the questions. Include 3-6 sections. Be specific and actionable.`;

  try {
    const { askLlm } = require('../rag/llm');
    const raw = await askLlm(system, userMsg, { maxTokens: 800 });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(502).json({ error: 'LLM did not return valid JSON' });
    const outline = JSON.parse(jsonMatch[0]);
    res.json({ topic, outline });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Organization Memory — Knowledge Map ────────────────────────────────────

// GET /api/knowledge/map?q=topic — cross-source knowledge synthesis
// Returns what the org knows about a topic from: docs, decisions, memory, gaps
app.get('/api/knowledge/map', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'q parameter required' });

  const evalPath = path.join(getDataDir(), 'eval.jsonl');
  let entries = [];
  if (fs.existsSync(evalPath)) {
    try {
      entries = fs.readFileSync(evalPath, 'utf8')
        .split('\n').filter(l => l.trim())
        .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
        .filter(Boolean);
    } catch (_) {}
  }

  // 1. Documentation coverage — vector search, aggregate by section
  let docSections = [];
  try {
    const { getVectorStore } = require('../vectorstore/store');
    const { getEmbedder }    = require('../ingestion/embedder');
    const store   = getVectorStore();
    const embedder = getEmbedder();
    const queryVec = await embedder.embedOne(q);
    store.setQuery(q);
    const chunks = store.search(queryVec, 30, {});
    const sectionScores = {};
    for (const c of chunks) {
      const s = c.meta?.section;
      if (!s) continue;
      if (!sectionScores[s]) sectionScores[s] = { section: s, chunkCount: 0, topScore: 0, titles: new Set() };
      sectionScores[s].chunkCount++;
      if ((c.score || 0) > sectionScores[s].topScore) sectionScores[s].topScore = c.score || 0;
      if (c.meta?.title) sectionScores[s].titles.add(c.meta.title);
    }
    docSections = Object.values(sectionScores)
      .sort((a, b) => b.topScore - a.topScore)
      .slice(0, 6)
      .map(s => ({ section: s.section, chunkCount: s.chunkCount, topScore: Math.round(s.topScore * 1000) / 1000, sampleTitles: [...s.titles].slice(0, 3) }));
  } catch (_) {}

  // 2. Engineering decisions — keyword overlap
  let relatedDecisions = [];
  try {
    const { loadDecisions: ld } = require('../decisions/extract');
    const qKws = new Set(extractKeywords(q));
    relatedDecisions = ld()
      .filter(d => {
        const text = (d.decision + ' ' + (d.reason || '') + ' ' + d.alternatives.join(' ')).toLowerCase();
        return [...qKws].some(kw => text.includes(kw));
      })
      .slice(0, 4)
      .map(d => ({ id: d.id, decision: d.decision, reason: d.reason, section: d.section, url: d.url }));
  } catch (_) {}

  // 3. Memory cluster — find best matching answered-query cluster
  const answeredEntries = entries.filter(e => !e.blocked && e.question);
  let memoryCluster = null;
  if (answeredEntries.length >= 3) {
    const qKws = new Set(extractKeywords(q));
    const clusterScores = {};
    for (const e of answeredEntries) {
      const kws = extractKeywords(e.question);
      let bestKw = null, bestFreq = 0;
      const freq = {};
      for (const k of kws) freq[k] = (freq[k] || 0) + 1;
      for (const [k, f] of Object.entries(freq)) { if (f > bestFreq) { bestFreq = f; bestKw = k; } }
      if (!bestKw) continue;
      if (!clusterScores[bestKw]) clusterScores[bestKw] = { label: bestKw, count: 0, entries: [] };
      clusterScores[bestKw].count++;
      clusterScores[bestKw].entries.push(e);
    }
    let bestMatch = null, bestOverlap = 0;
    for (const [label, c] of Object.entries(clusterScores)) {
      const overlap = [...qKws].filter(kw => label.includes(kw) || kw.includes(label)).length;
      if (overlap > bestOverlap || (overlap === bestOverlap && c.count > (bestMatch?.count || 0))) {
        bestOverlap = overlap;
        bestMatch = c;
      }
    }
    if (bestMatch && bestMatch.count >= 2) {
      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const recentCount = bestMatch.entries.filter(e => e.ts && (now - new Date(e.ts).getTime()) < thirtyDaysMs).length;
      const topSections = {};
      for (const e of bestMatch.entries) for (const s of (e.sectionsUsed || [])) topSections[s] = (topSections[s] || 0) + 1;
      memoryCluster = {
        label: bestMatch.label,
        count: bestMatch.count,
        recentCount,
        trending: recentCount / bestMatch.count >= 0.5,
        topSections: Object.entries(topSections).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([s]) => s),
        questions: bestMatch.entries.slice(-3).map(e => e.question),
      };
    }
  }

  // 4. Gap cluster — find best matching blocked-query cluster
  const blockedEntries = entries.filter(e => e.blocked && e.question);
  let gapCluster = null;
  if (blockedEntries.length > 0) {
    const qKws = new Set(extractKeywords(q));
    let bestLabel = null, bestCount = 0, bestQuestions = [];
    const gapClusters = {};
    for (const e of blockedEntries) {
      const kws = extractKeywords(e.question);
      let bestKw = null, bestFreq = 0;
      const freq = {};
      for (const k of kws) freq[k] = (freq[k] || 0) + 1;
      for (const [k, f] of Object.entries(freq)) { if (f > bestFreq) { bestFreq = f; bestKw = k; } }
      if (!bestKw) continue;
      if (!gapClusters[bestKw]) gapClusters[bestKw] = { count: 0, questions: [] };
      gapClusters[bestKw].count++;
      gapClusters[bestKw].questions.push(e.question);
    }
    for (const [label, c] of Object.entries(gapClusters)) {
      const overlap = [...qKws].filter(kw => label.includes(kw) || kw.includes(label)).length;
      if (overlap > 0 && c.count > bestCount) { bestCount = c.count; bestLabel = label; bestQuestions = c.questions; }
    }
    if (bestLabel) {
      gapCluster = { label: bestLabel, count: bestCount, questions: bestQuestions.slice(0, 4) };
    }
  }

  res.json({ topic: q, docSections, relatedDecisions, memoryCluster, gapCluster });
});

// POST /api/knowledge/summary — LLM-generated org knowledge summary for a topic
app.post('/api/knowledge/summary', async (req, res) => {
  const { topic, docSections, relatedDecisions, memoryCluster, gapCluster } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'topic required' });

  const { askLlm: askL } = require('../rag/llm');
  const sectionList   = (docSections || []).map(s => `- ${s.section} (${s.chunkCount} chunks, score ${s.topScore})`).join('\n') || 'None found';
  const decisionList  = (relatedDecisions || []).map(d => `- ${d.decision}${d.reason ? ' (reason: ' + d.reason + ')' : ''}`).join('\n') || 'None found';
  const memoryLine    = memoryCluster ? `Asked ${memoryCluster.count} times, ${memoryCluster.recentCount} recently. Answered by: ${memoryCluster.topSections.join(', ')}` : 'No recurring pattern';
  const gapLine       = gapCluster ? `${gapCluster.count} unanswered questions on "${gapCluster.label}"` : 'No documented gaps';

  const system = 'You are a technical knowledge analyst. Write concisely. Return only a plain-text paragraph, no markdown.';
  const userMsg = `Summarize what the organization knows about "${topic}" based on these signals:

Documentation coverage:
${sectionList}

Engineering decisions:
${decisionList}

Query memory: ${memoryLine}
Known gaps: ${gapLine}

Write a 2-3 sentence summary of the organization's current knowledge state on this topic: what's well covered, what's decided, and what's missing.`;

  try {
    const summary = await askL(system, userMsg, { maxTokens: 300 });
    res.json({ topic, summary: summary.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Knowledge Risk Analysis ─────────────────────────────────────────────────

// GET /api/knowledge/risk — per-section risk scores based on query signals
// Signals: dead_section | single_expert | single_point_of_failure
app.get('/api/knowledge/risk', (req, res) => {
  // 1. All indexed sections + chunk counts
  const store = getVectorStore();
  const chunks = store._data || [];
  const sectionChunkCounts = {};
  for (const c of chunks) {
    const s = c.meta?.section;
    if (!s) continue;
    sectionChunkCounts[s] = (sectionChunkCounts[s] || 0) + 1;
  }
  const allSections = Object.keys(sectionChunkCounts);

  // 2. Load eval.jsonl
  const evalPath = path.join(getDataDir(), 'eval.jsonl');
  let entries = [];
  if (fs.existsSync(evalPath)) {
    try {
      entries = fs.readFileSync(evalPath, 'utf8')
        .split('\n').filter(l => l.trim())
        .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
        .filter(Boolean);
    } catch (_) {}
  }
  const answeredEntries = entries.filter(e => !e.blocked && Array.isArray(e.sectionsUsed) && e.sectionsUsed.length > 0);

  // 3. Per-section: total query count + unique topic keywords
  const sectionQueryCount = {};
  const sectionTopicKeywords = {};
  for (const e of answeredEntries) {
    const kws = extractKeywords(e.question || '');
    const topKw = kws[0] || 'unknown';
    for (const s of e.sectionsUsed) {
      sectionQueryCount[s] = (sectionQueryCount[s] || 0) + 1;
      if (!sectionTopicKeywords[s]) sectionTopicKeywords[s] = new Set();
      sectionTopicKeywords[s].add(topKw);
    }
  }

  // 4. Topic concentration: for each topic keyword, which sections answered it?
  const topicSections = {};
  for (const e of answeredEntries) {
    const kws = extractKeywords(e.question || '');
    const topKw = kws[0] || 'unknown';
    if (!topicSections[topKw]) topicSections[topKw] = new Set();
    for (const s of e.sectionsUsed) topicSections[topKw].add(s);
  }
  // Topics only answerable from one section = single point of failure
  const spofTopicsPerSection = {};
  for (const [topic, sections] of Object.entries(topicSections)) {
    if (sections.size === 1) {
      const s = [...sections][0];
      if (!spofTopicsPerSection[s]) spofTopicsPerSection[s] = [];
      spofTopicsPerSection[s].push(topic);
    }
  }

  // 5. Score each section
  const riskSections = allSections.map(section => {
    const signals = [];
    let riskScore = 0;

    const queryCount   = sectionQueryCount[section] || 0;
    const uniqueTopics = sectionTopicKeywords[section]?.size || 0;
    const spofTopics   = spofTopicsPerSection[section] || [];

    if (queryCount === 0) {
      signals.push('dead_section');
      riskScore += 0.5;
    }
    if (queryCount > 0 && queryCount < 5 && uniqueTopics <= 2) {
      signals.push('single_expert');
      riskScore += 0.3;
    }
    if (spofTopics.length > 0) {
      signals.push('single_point_of_failure');
      riskScore += Math.min(0.4, 0.1 * spofTopics.length);
    }

    riskScore = Math.min(1.0, riskScore);
    const riskLevel = riskScore >= 0.7 ? 'critical'
      : riskScore >= 0.4 ? 'high'
      : riskScore >= 0.2 ? 'medium'
      : 'low';

    let recommendation;
    if (signals.includes('dead_section')) {
      recommendation = 'No queries have ever hit this section. Verify relevance or remove it to reduce index noise.';
    } else if (signals.includes('single_expert') && signals.includes('single_point_of_failure')) {
      recommendation = 'Low query diversity and sole source for key topics. Promote broader use and add topic coverage to related sections.';
    } else if (signals.includes('single_expert')) {
      recommendation = 'Low query diversity suggests only one team or person uses this. Verify value and promote awareness.';
    } else if (signals.includes('single_point_of_failure')) {
      recommendation = `Sole source for ${spofTopics.length} topic${spofTopics.length > 1 ? 's' : ''}. Add redundancy by covering these topics in related sections.`;
    } else {
      recommendation = 'Healthy. Queried regularly with good topic diversity.';
    }

    return {
      section,
      chunkCount: sectionChunkCounts[section] || 0,
      riskScore: Math.round(riskScore * 100) / 100,
      riskLevel,
      signals,
      queryCount,
      uniqueTopics,
      spofTopics: spofTopics.slice(0, 5),
      recommendation,
    };
  });

  riskSections.sort((a, b) => b.riskScore - a.riskScore);

  res.json({
    sections: riskSections,
    totalSections: riskSections.length,
    criticalCount: riskSections.filter(s => s.riskLevel === 'critical').length,
    highCount:     riskSections.filter(s => s.riskLevel === 'high').length,
    mediumCount:   riskSections.filter(s => s.riskLevel === 'medium').length,
    lowCount:      riskSections.filter(s => s.riskLevel === 'low').length,
    computedAt: new Date().toISOString(),
  });
});

// ── Engineering Insights ────────────────────────────────────────────────────

// GET /api/insights — four-dimension knowledge quality dashboard from eval.jsonl
// Dimensions: top topics, pain areas, section quality trend, recurring gaps
app.get('/api/insights', (req, res) => {
  const evalPath = path.join(getDataDir(), 'eval.jsonl');
  let entries = [];
  if (fs.existsSync(evalPath)) {
    try {
      entries = fs.readFileSync(evalPath, 'utf8')
        .split('\n').filter(l => l.trim())
        .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
        .filter(Boolean);
    } catch (_) {}
  }

  const now       = Date.now();
  const weekMs    =  7 * 24 * 60 * 60 * 1000;
  const monthMs   = 30 * 24 * 60 * 60 * 1000;
  const twoMoMs   = 60 * 24 * 60 * 60 * 1000;

  // ── Apply filters ──────────────────────────────────────────────────────────
  const fWindow  = req.query.window  || 'all';   // '7d' | '30d' | '90d' | '180d' | 'all'
  const fLast    = parseInt(req.query.last)  || 0; // last N entries (0 = all)
  const fSection = (req.query.section || '').trim();
  const fStatus  = req.query.status  || 'all';   // 'all' | 'answered' | 'unanswered'
  const fKeyword = (req.query.keyword || '').toLowerCase().trim();
  const fUser    = (req.query.user   || '').trim();

  let valid = entries.filter(e => e.question && e.ts);

  // Time window
  if (fWindow !== 'all') {
    const days = parseInt(fWindow);  // '7d' → 7
    if (!isNaN(days)) {
      const cutoff = now - days * 24 * 60 * 60 * 1000;
      valid = valid.filter(e => new Date(e.ts).getTime() >= cutoff);
    }
  }

  // Last N queries (applied after time filter)
  if (fLast > 0) valid = valid.slice(-fLast);

  // Section filter — keep entries that used or near-missed the section
  if (fSection) {
    valid = valid.filter(e =>
      (e.sectionsUsed     || []).includes(fSection) ||
      (e.nearMissSections || []).includes(fSection)
    );
  }

  // Status filter
  if (fStatus === 'answered')   valid = valid.filter(e => !e.blocked);
  if (fStatus === 'unanswered') valid = valid.filter(e =>  e.blocked);

  // Keyword filter — question text contains keyword
  if (fKeyword) {
    valid = valid.filter(e => e.question.toLowerCase().includes(fKeyword));
  }

  // User filter — match userId stored on each eval entry
  if (fUser) {
    valid = valid.filter(e => (e.userId || 'default') === fUser);
  }

  const activeFilters = fWindow !== 'all' || fLast > 0 || fSection || fStatus !== 'all' || fKeyword || fUser;
  // ── End filters ────────────────────────────────────────────────────────────
  const thisWeek      = valid.filter(e => now - new Date(e.ts).getTime() < weekMs);
  const lastWeek      = valid.filter(e => { const a = now - new Date(e.ts).getTime(); return a >= weekMs && a < 2 * weekMs; });
  const recentWindow  = valid.filter(e => now - new Date(e.ts).getTime() < monthMs);
  const priorWindow   = valid.filter(e => { const a = now - new Date(e.ts).getTime(); return a >= monthMs && a < twoMoMs; });
  const totalUnfiltered = entries.filter(e => e.question && e.ts).length;

  // 1. Top searched topics — keyword clusters across ALL queries
  const topicAll  = {};
  const topicTW   = {};
  const topicLW   = {};
  for (const e of valid) {
    const kw = extractKeywords(e.question)[0];
    if (kw) topicAll[kw] = (topicAll[kw] || 0) + 1;
  }
  for (const e of thisWeek) {
    const kw = extractKeywords(e.question)[0];
    if (kw) topicTW[kw] = (topicTW[kw] || 0) + 1;
  }
  for (const e of lastWeek) {
    const kw = extractKeywords(e.question)[0];
    if (kw) topicLW[kw] = (topicLW[kw] || 0) + 1;
  }
  const topTopics = Object.entries(topicAll)
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([topic, count]) => ({
      topic, count,
      thisWeek: topicTW[topic] || 0,
      lastWeek: topicLW[topic] || 0,
      trending: (topicTW[topic] || 0) > (topicLW[topic] || 0),
    }));

  // 2. Pain areas — sections with queries but low success rate
  // "total" = answered queries that used the section + near-miss hits (retrieved but blocked)
  const secAnswered = {};
  const secNearMiss = {};
  for (const e of valid) {
    if (!e.blocked) for (const s of (e.sectionsUsed || [])) secAnswered[s] = (secAnswered[s] || 0) + 1;
    if (e.blocked)  for (const s of (e.nearMissSections || [])) secNearMiss[s] = (secNearMiss[s] || 0) + 1;
  }
  const secTotal = {};
  for (const s of [...new Set([...Object.keys(secAnswered), ...Object.keys(secNearMiss)])]) {
    secTotal[s] = (secAnswered[s] || 0) + (secNearMiss[s] || 0);
  }
  const painAreas = Object.entries(secTotal)
    .filter(([, t]) => t >= 2)
    .map(([section, total]) => {
      const answered    = secAnswered[section] || 0;
      const failCount   = secNearMiss[section] || 0;
      const successRate = Math.round((answered / total) * 100) / 100;
      return { section, totalQueries: total, answered, failureCount: failCount, successRate, painScore: Math.round((1 - successRate) * 100) / 100 };
    })
    .sort((a, b) => b.painScore - a.painScore || b.totalQueries - a.totalQueries)
    .slice(0, 8);

  // 3. Section quality trend — last 30 days vs. 30–60 days ago
  const rSC = {}; const rSA = {}; const pSC = {}; const pSA = {};
  for (const e of recentWindow) {
    for (const s of (e.sectionsUsed || [])) {
      rSC[s] = (rSC[s] || 0) + 1;
      if (!e.blocked) rSA[s] = (rSA[s] || 0) + 1;
    }
  }
  for (const e of priorWindow) {
    for (const s of (e.sectionsUsed || [])) {
      pSC[s] = (pSC[s] || 0) + 1;
      if (!e.blocked) pSA[s] = (pSA[s] || 0) + 1;
    }
  }
  const allTrendSecs = new Set([...Object.keys(rSC), ...Object.keys(pSC)]);
  const qualityTrend = [...allTrendSecs]
    .map(section => {
      const rT = rSC[section] || 0;
      const pT = pSC[section] || 0;
      if (rT === 0 && pT === 0) return null;
      const recentRate = rT > 0 ? Math.round(((rSA[section] || 0) / rT) * 100) / 100 : null;
      const priorRate  = pT > 0 ? Math.round(((pSA[section] || 0) / pT) * 100) / 100 : null;
      const delta  = recentRate !== null && priorRate !== null ? Math.round((recentRate - priorRate) * 100) / 100 : null;
      const trend  = delta === null ? 'new' : delta > 0.1 ? 'improving' : delta < -0.1 ? 'declining' : 'stable';
      return { section, recentRate, priorRate, delta, trend, queryCount: rT };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const order = { declining: 0, stable: 1, new: 2, improving: 3 };
      return (order[a.trend] ?? 2) - (order[b.trend] ?? 2);
    })
    .slice(0, 8);

  // 4. Recurring gaps — blocked question clusters sorted by recency × frequency
  const gapFreq = {}; const gapLast = {}; const gapRecent = {};
  for (const e of valid.filter(e => e.blocked)) {
    const kw = extractKeywords(e.question)[0];
    if (!kw) continue;
    gapFreq[kw] = (gapFreq[kw] || 0) + 1;
    const ts = new Date(e.ts).getTime();
    if (!gapLast[kw] || ts > gapLast[kw]) gapLast[kw] = ts;
    if (now - ts < monthMs) gapRecent[kw] = (gapRecent[kw] || 0) + 1;
  }
  const recurringGaps = Object.entries(gapFreq)
    .filter(([, c]) => c >= 2)
    .map(([topic, count]) => ({
      topic, count,
      recentCount: gapRecent[topic] || 0,
      lastSeen: new Date(gapLast[topic]).toISOString(),
      priority: count * (1 + (gapRecent[topic] || 0)),
    }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 8);

  const totalAnswered = valid.filter(e => !e.blocked).length;
  const insightsResult = {
    topTopics, painAreas, qualityTrend, recurringGaps,
    totalQueries: valid.length,
    totalAnswered,
    overallSuccessRate: valid.length > 0 ? Math.round((totalAnswered / valid.length) * 100) / 100 : 0,
    computedAt: new Date().toISOString(),
    // Filter metadata
    filtered: !!activeFilters,
    totalUnfiltered,
    appliedFilters: { window: fWindow, last: fLast, section: fSection, status: fStatus, keyword: fKeyword, user: fUser },
  };

  // Auto-snapshot: save a snapshot if we have data and none exists yet this week
  if (valid.length > 0) {
    try { maybeWriteSnapshot(insightsResult); } catch (_) {}
  }

  res.json(insightsResult);
});

// GET /api/users — distinct users who have asked questions, sorted by query count
app.get('/api/users', (req, res) => {
  const evalPath = path.join(getDataDir(), 'eval.jsonl');
  const counts = {};
  if (fs.existsSync(evalPath)) {
    try {
      fs.readFileSync(evalPath, 'utf8')
        .split('\n').filter(l => l.trim())
        .forEach(l => {
          try {
            const e = JSON.parse(l);
            if (!e.question) return;
            const uid = e.userId || 'default';
            counts[uid] = (counts[uid] || 0) + 1;
          } catch (_) {}
        });
    } catch (_) {}
  }
  const users = Object.entries(counts)
    .map(([userId, queryCount]) => ({ userId, queryCount }))
    .sort((a, b) => b.queryCount - a.queryCount);
  res.json({ users });
});

// GET /api/team/ids — team IDS + per-user IDS breakdown
app.get('/api/team/ids', (req, res) => {
  const evalPath = path.join(getDataDir(), 'eval.jsonl');
  let allEntries = [];
  if (fs.existsSync(evalPath)) {
    try {
      fs.readFileSync(evalPath, 'utf8').split('\n').filter(Boolean).forEach(l => {
        try { const e = JSON.parse(l); if (e.question) allEntries.push(e); } catch (_) {}
      });
    } catch (_) {}
  }

  if (allEntries.length === 0) return res.json({ teamIds: 0, userCount: 0, perUser: [] });

  function computeIdsInputs(entries) {
    const totalQueries = entries.length;
    const answered = entries.filter(e => !e.blocked);
    const totalAnswered = answered.length;
    const overallSuccessRate = totalQueries > 0 ? totalAnswered / totalQueries : 0;
    const totalBlocked = totalQueries - totalAnswered;
    const kwFreq = {};
    for (const e of answered) {
      const kw = extractKeywords(e.question)[0];
      if (kw) kwFreq[kw] = (kwFreq[kw] || 0) + 1;
    }
    const clusterCount = Object.values(kwFreq).filter(c => c >= 3).length;
    let avgHealthScore = 0;
    try { avgHealthScore = computeAvgHealthScore(entries); } catch (_) {}
    return { totalQueries, overallSuccessRate, totalBlocked, clusterCount, avgHealthScore };
  }

  // Group entries by userId
  const grouped = {};
  for (const e of allEntries) {
    const uid = e.userId || 'default';
    if (!grouped[uid]) grouped[uid] = [];
    grouped[uid].push(e);
  }

  const teamInputs = computeIdsInputs(allEntries);
  const teamIds = serverComputeIDS(teamInputs);

  const perUser = Object.entries(grouped)
    .map(([userId, entries]) => {
      const inputs = computeIdsInputs(entries);
      return {
        userId,
        queryCount: inputs.totalQueries,
        ids: serverComputeIDS(inputs),
      };
    })
    .sort((a, b) => b.ids - a.ids);

  res.json({ teamIds, userCount: perUser.length, perUser });
});

// ── Intelligence Persistence ────────────────────────────────────────────────

function getSnapshotPath() {
  return path.join(getDataDir(), 'intelligence_snapshots.jsonl');
}

function loadSnapshots() {
  const p = getSnapshotPath();
  if (!fs.existsSync(p)) return [];
  try {
    return fs.readFileSync(p, 'utf8')
      .split('\n').filter(l => l.trim())
      .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
      .filter(Boolean);
  } catch (_) { return []; }
}

function serverComputeIDS({ totalQueries, overallSuccessRate, clusterCount, totalBlocked, avgHealthScore }) {
  let score = 0;
  score += overallSuccessRate * 0.30;
  score += Math.min(totalQueries / 50, 1) * 0.15;
  score += Math.min(clusterCount / 8, 1) * 0.20;
  const gapRatio = Math.min(totalBlocked / Math.max(totalQueries, 1), 1);
  score += (1 - gapRatio) * 0.15;
  score += 0.10; // risk baseline — if we're computing a snapshot, risk data exists
  score += (Math.min(avgHealthScore, 100) / 100) * 0.10;
  return Math.round(Math.min(score, 1) * 100) / 100;
}

// Mirrors the per-section formula in GET /api/health and returns the org-wide average.
function computeAvgHealthScore(entries) {
  const answered = entries.filter(e => !e.blocked && Array.isArray(e.sectionsUsed) && e.sectionsUsed.length > 0);
  const totalAnswered = answered.length;
  if (totalAnswered === 0) return 0;

  const sectionStats = {};
  for (const e of answered) {
    for (const sec of e.sectionsUsed) {
      if (!sectionStats[sec]) sectionStats[sec] = { queryCount: 0, lastHitTs: null };
      const s = sectionStats[sec];
      s.queryCount++;
      if (!s.lastHitTs || e.ts > s.lastHitTs) s.lastHitTs = e.ts;
    }
  }

  let allSections = [];
  try {
    const store = getVectorStore();
    const seen = new Set();
    for (const c of store._data || []) {
      const sec = c.meta?.section;
      if (sec && !seen.has(sec)) { seen.add(sec); allSections.push(sec); }
    }
  } catch (_) {}
  for (const sec of Object.keys(sectionStats)) {
    if (!allSections.includes(sec)) allSections.push(sec);
  }
  if (allSections.length === 0) return 0;

  const maxQueryCount = Math.max(1, ...Object.values(sectionStats).map(s => s.queryCount));
  const now = Date.now();
  function recencyScore(ts) {
    if (!ts) return 0;
    const days = (now - new Date(ts).getTime()) / 86400000;
    if (days <=  7) return 100;
    if (days <= 30) return 80;
    if (days <= 60) return 60;
    if (days <= 90) return 35;
    return 15;
  }

  let totalScore = 0;
  for (const section of allSections) {
    const stats = sectionStats[section] || { queryCount: 0, lastHitTs: null };
    const covScore = Math.round((stats.queryCount / maxQueryCount) * 100);
    totalScore += Math.round(covScore * 0.4 + recencyScore(stats.lastHitTs) * 0.6);
  }
  return Math.round(totalScore / allSections.length);
}

function maybeWriteSnapshot(insightsResult) {
  const snapshots = loadSnapshots();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  // Don't save if a snapshot exists within the last 7 days
  if (snapshots.length > 0) {
    const lastTs = new Date(snapshots[snapshots.length - 1].ts).getTime();
    if (now - lastTs < weekMs) return;
  }

  // Gather extra signals for the snapshot
  let clusterCount = 0;
  let avgHealthScore = 50;
  let totalBlocked = insightsResult.totalQueries - insightsResult.totalAnswered;
  let sectionCount = 0;
  let totalDecisions = 0;

  let evalEntries = [];
  try {
    const evalPath = path.join(getDataDir(), 'eval.jsonl');
    if (fs.existsSync(evalPath)) {
      evalEntries = fs.readFileSync(evalPath, 'utf8')
        .split('\n').filter(l => l.trim())
        .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
        .filter(Boolean);
    }
  } catch (_) {}
  try {
    const answered = evalEntries.filter(e => !e.blocked && e.question);
    const kwFreq = {};
    for (const e of answered) {
      const kw = extractKeywords(e.question)[0];
      if (kw) kwFreq[kw] = (kwFreq[kw] || 0) + 1;
    }
    clusterCount = Object.values(kwFreq).filter(c => c >= 3).length;
  } catch (_) {}
  try { avgHealthScore = computeAvgHealthScore(evalEntries); } catch (_) {}

  try {
    const store = getVectorStore();
    const seen = new Set();
    for (const c of store._data || []) {
      const s = c.meta?.section;
      if (s) seen.add(s);
    }
    sectionCount = seen.size;
  } catch (_) {}

  try {
    const decisionsData = loadDecisions ? loadDecisions() : [];
    totalDecisions = Array.isArray(decisionsData) ? decisionsData.length : 0;
  } catch (_) {}

  const ids = serverComputeIDS({
    totalQueries: insightsResult.totalQueries,
    overallSuccessRate: insightsResult.overallSuccessRate,
    clusterCount,
    totalBlocked,
    avgHealthScore,
  });

  const snapshot = {
    ts: new Date().toISOString(),
    schemaVersion: 1,
    totalQueries: insightsResult.totalQueries,
    totalAnswered: insightsResult.totalAnswered,
    overallSuccessRate: insightsResult.overallSuccessRate,
    totalBlocked,
    clusterCount,
    sectionCount,
    avgHealthScore,
    totalDecisions,
    ids,
    topTopics: insightsResult.topTopics.slice(0, 5).map(t => t.topic),
  };

  try {
    fs.appendFileSync(getSnapshotPath(), JSON.stringify(snapshot) + '\n', 'utf8');
  } catch (_) {}
}

// GET /api/intelligence/history — return all snapshots with deltas
app.get('/api/intelligence/history', (req, res) => {
  const snapshots = loadSnapshots();

  let latestDelta = null;
  if (snapshots.length >= 2) {
    const latest = snapshots[snapshots.length - 1];
    const prev   = snapshots[snapshots.length - 2];
    latestDelta = {
      ids:            Math.round((latest.ids           - prev.ids)           * 100),
      totalQueries:   latest.totalQueries  - prev.totalQueries,
      clusterCount:   latest.clusterCount  - prev.clusterCount,
      successRate:    Math.round((latest.overallSuccessRate - prev.overallSuccessRate) * 100) / 100,
      totalBlocked:   latest.totalBlocked  - prev.totalBlocked,
      avgHealthScore: Math.round(latest.avgHealthScore - prev.avgHealthScore),
    };
  }

  res.json({ snapshots, latestDelta });
});

// POST /api/intelligence/snapshot — force a snapshot now (ignores 7-day guard)
app.post('/api/intelligence/snapshot', (req, res) => {
  const evalPath = path.join(getDataDir(), 'eval.jsonl');
  let entries = [];
  if (fs.existsSync(evalPath)) {
    try {
      entries = fs.readFileSync(evalPath, 'utf8')
        .split('\n').filter(l => l.trim())
        .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
        .filter(Boolean);
    } catch (_) {}
  }

  const valid = entries.filter(e => e.question && e.ts);
  if (valid.length === 0) {
    return res.json({ ok: false, reason: 'No query data to snapshot' });
  }

  const totalAnswered = valid.filter(e => !e.blocked).length;
  const overallSuccessRate = valid.length > 0 ? Math.round((totalAnswered / valid.length) * 100) / 100 : 0;

  const insightsMini = { totalQueries: valid.length, totalAnswered, overallSuccessRate, topTopics: [] };

  // Remove 7-day guard: delete last snapshot timestamp trick — we just write directly
  let clusterCount = 0; let sectionCount = 0; let totalDecisions = 0;
  let avgHealthScore = 50;
  try { avgHealthScore = computeAvgHealthScore(valid); } catch (_) {}
  try {
    const answered = valid.filter(e => !e.blocked && e.question);
    const kwFreq = {};
    for (const e of answered) {
      const kw = extractKeywords(e.question)[0];
      if (kw) kwFreq[kw] = (kwFreq[kw] || 0) + 1;
    }
    clusterCount = Object.values(kwFreq).filter(c => c >= 3).length;
  } catch (_) {}
  try {
    const store = getVectorStore();
    const seen = new Set();
    for (const c of store._data || []) { const s = c.meta?.section; if (s) seen.add(s); }
    sectionCount = seen.size;
  } catch (_) {}
  try { const d = loadDecisions ? loadDecisions() : []; totalDecisions = Array.isArray(d) ? d.length : 0; } catch (_) {}

  const ids = serverComputeIDS({
    totalQueries: valid.length, overallSuccessRate, clusterCount,
    totalBlocked: valid.length - totalAnswered, avgHealthScore,
  });

  const snapshot = {
    ts: new Date().toISOString(), schemaVersion: 1,
    totalQueries: valid.length, totalAnswered, overallSuccessRate,
    totalBlocked: valid.length - totalAnswered, clusterCount, sectionCount, avgHealthScore,
    totalDecisions, ids, topTopics: [],
  };

  try {
    fs.appendFileSync(getSnapshotPath(), JSON.stringify(snapshot) + '\n', 'utf8');
    res.json({ ok: true, snapshot });
  } catch (err) {
    res.status(500).json({ ok: false, reason: err.message });
  }
});

// ── Engineering Decision Graph ──────────────────────────────────────────────

const { extractDecisions, loadDecisions } = require('../decisions/extract');
const { askLlm } = require('../rag/llm');

// GET /api/decisions — return stored decisions, optional ?section= and ?q= filters
app.get('/api/decisions', (req, res) => {
  let decisions = loadDecisions();
  const section = (req.query.section || '').toLowerCase().trim();
  const q       = (req.query.q       || '').toLowerCase().trim();

  if (section) decisions = decisions.filter(d => d.section.toLowerCase().includes(section));
  if (q)       decisions = decisions.filter(d =>
    d.decision.toLowerCase().includes(q) ||
    (d.reason || '').toLowerCase().includes(q) ||
    d.alternatives.some(a => a.toLowerCase().includes(q))
  );

  const sections = [...new Set(loadDecisions().map(d => d.section))].sort();
  res.json({ decisions, total: decisions.length, sections });
});

// POST /api/decisions/extract — run extraction against current vector store
app.post('/api/decisions/extract', async (req, res) => {
  try {
    const result = await extractDecisions();
    res.json({ ok: true, extracted: result.decisions.length, scanned: result.scanned, candidates: result.candidates, parseFailures: result.parseFailures || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Organizational Memory ───────────────────────────────────────────────────

const MEMORY_MIN_COUNT  = 3;   // minimum asks before a topic is "organizational memory"
const MEMORY_MAX_TOPICS = 15;  // cap — show only strongest signals
const MEMORY_RECENT_MS  = 30 * 24 * 60 * 60 * 1000; // 30 days

// GET /api/memory — recurring answered question clusters (what the org cares about)
app.get('/api/memory', (req, res) => {
  const evalPath = path.join(getDataDir(), 'eval.jsonl');
  let entries = [];
  if (fs.existsSync(evalPath)) {
    try {
      entries = fs.readFileSync(evalPath, 'utf8')
        .split('\n').filter(l => l.trim())
        .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
        .filter(Boolean);
    } catch (_) {}
  }

  const answered = entries.filter(e => !e.blocked && e.question);
  const totalAnswered = answered.length;

  if (totalAnswered === 0) {
    return res.json({ clusters: [], totalAnswered: 0, totalTopics: 0 });
  }

  const now = Date.now();
  const keywordFreq = {};
  for (const e of answered) {
    for (const kw of new Set(extractKeywords(e.question))) {
      keywordFreq[kw] = (keywordFreq[kw] || 0) + 1;
    }
  }

  const clusters = {};
  for (const e of answered) {
    const kws = extractKeywords(e.question);
    let bestKw = null, bestFreq = 0;
    for (const kw of kws) {
      if (keywordFreq[kw] > bestFreq) { bestFreq = keywordFreq[kw]; bestKw = kw; }
    }
    const label = bestKw || 'general';

    if (!clusters[label]) clusters[label] = { label, questions: {}, sections: {}, count: 0, recentCount: 0, firstSeen: e.ts, lastSeen: e.ts };
    const c = clusters[label];
    c.count++;
    const isRecent = e.ts && (now - new Date(e.ts).getTime()) < MEMORY_RECENT_MS;
    if (isRecent) c.recentCount++;
    const qKey = (e.question || '').toLowerCase().trim();
    c.questions[qKey] = (c.questions[qKey] || 0) + 1;
    for (const sec of (e.sectionsUsed || [])) {
      c.sections[sec] = (c.sections[sec] || 0) + 1;
    }
    if (e.ts && e.ts < c.firstSeen) c.firstSeen = e.ts;
    if (e.ts && e.ts > c.lastSeen)  c.lastSeen  = e.ts;
  }

  // Score: recent asks count 2× — surfaces topics with growing momentum over stale volume
  const result = Object.values(clusters)
    .filter(c => c.count >= MEMORY_MIN_COUNT)
    .sort((a, b) => (b.recentCount * 2 + b.count) - (a.recentCount * 2 + a.count))
    .slice(0, MEMORY_MAX_TOPICS)
    .map(c => ({
      label:       c.label,
      count:       c.count,
      recentCount: c.recentCount,
      trending:    c.recentCount > 0 && c.recentCount / c.count >= 0.5,
      firstSeen:   c.firstSeen || null,
      lastSeen:    c.lastSeen  || null,
      questions:   Object.entries(c.questions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([q, n]) => ({ text: q, count: n })),
      topSections: Object.entries(c.sections)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([section, count]) => ({ section, count })),
    }));

  res.json({ clusters: result, totalAnswered, totalTopics: result.length });
});

// ── Documentation Health Score + Section Intelligence Controls ───────────────

function getSectionConfigPath() { return path.join(getDataDir(), 'section_config.json'); }

function loadSectionConfig() {
  try {
    const p = getSectionConfigPath();
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {}
  return {};
}

function saveSectionConfig(config) {
  const p = getSectionConfigPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(config, null, 2));
}

// GET /api/health — per-section composite health score + user-set priorities
app.get('/api/health', (req, res) => {
  const evalPath = path.join(getDataDir(), 'eval.jsonl');
  let entries = [];
  if (fs.existsSync(evalPath)) {
    try {
      entries = fs.readFileSync(evalPath, 'utf8')
        .split('\n').filter(l => l.trim())
        .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
        .filter(Boolean);
    } catch (_) {}
  }

  const answered = entries.filter(e => !e.blocked && Array.isArray(e.sectionsUsed) && e.sectionsUsed.length > 0);
  const totalAnswered = answered.length;

  const sectionStats = {};
  for (const e of answered) {
    for (const sec of e.sectionsUsed) {
      if (!sectionStats[sec]) sectionStats[sec] = { queryCount: 0, lastHitTs: null };
      const s = sectionStats[sec];
      s.queryCount++;
      if (!s.lastHitTs || e.ts > s.lastHitTs) s.lastHitTs = e.ts;
    }
  }

  let allSections = [];
  try {
    const store = getVectorStore();
    const seen = new Set();
    for (const c of store._data || []) {
      const s = c.meta?.section;
      if (s && !seen.has(s)) { seen.add(s); allSections.push(s); }
    }
  } catch (_) {}
  for (const sec of Object.keys(sectionStats)) {
    if (!allSections.includes(sec)) allSections.push(sec);
  }

  const config = loadSectionConfig();
  const maxQueryCount = Math.max(1, ...Object.values(sectionStats).map(s => s.queryCount));
  const topThreshold  = maxQueryCount * 0.6;
  const now = Date.now();

  function recencyScore(ts) {
    if (!ts) return 0;
    const days = (now - new Date(ts).getTime()) / 86400000;
    if (days <=  7) return 100;
    if (days <= 30) return 80;
    if (days <= 60) return 60;
    if (days <= 90) return 35;
    return 15;
  }

  const sections = allSections.map(section => {
    const stats    = sectionStats[section] || { queryCount: 0, lastHitTs: null };
    const covScore = Math.round((stats.queryCount / maxQueryCount) * 100);
    const recScore = recencyScore(stats.lastHitTs);
    const score    = totalAnswered === 0 ? 0 : Math.round(covScore * 0.4 + recScore * 0.6);
    const daysSinceLastHit = stats.lastHitTs
      ? Math.floor((now - new Date(stats.lastHitTs).getTime()) / 86400000)
      : null;
    const priority = config[section]?.priority || 'normal';

    let recommendation = null;
    if (stats.queryCount === 0 && priority === 'normal') recommendation = 'consider-removing';
    else if (stats.queryCount >= topThreshold && priority === 'normal') recommendation = 'consider-boosting';

    return { section, score, queryCount: stats.queryCount, daysSinceLastHit, lastHitTs: stats.lastHitTs || null, priority, recommendation };
  });

  sections.sort((a, b) => a.score - b.score || a.section.localeCompare(b.section));
  res.json({ sections, totalSections: sections.length, totalAnswered, computedAt: new Date().toISOString() });
});

// PATCH /api/health/section/:section — set retrieval priority (boost | ignore | normal)
app.patch('/api/health/section/:section', (req, res) => {
  const section  = req.params.section;
  const priority = req.body?.priority;
  if (!['boost', 'ignore', 'normal'].includes(priority)) {
    return res.status(400).json({ error: 'priority must be boost, ignore, or normal' });
  }
  const config = loadSectionConfig();
  if (priority === 'normal') {
    delete config[section];
  } else {
    config[section] = { priority, updatedAt: new Date().toISOString() };
  }
  saveSectionConfig(config);
  res.json({ ok: true, section, priority });
});

// DELETE /api/health/section/:section — remove all chunks for this section from vector index
app.delete('/api/health/section/:section', (req, res) => {
  const section = req.params.section;
  try {
    const store  = getVectorStore();
    const before = (store._data || []).filter(c => (c.meta?.section || 'default') === section).length;
    store.clearSection(section);
    const config = loadSectionConfig();
    delete config[section];
    saveSectionConfig(config);
    res.json({ ok: true, section, chunksRemoved: before });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Engineering Onboarding Assistant ───────────────────────────────────────

// POST /api/onboard — generate a personalized learning path from indexed docs
app.post('/api/onboard', async (req, res) => {
  const { role, topic } = req.body || {};
  if (!role || typeof role !== 'string' || role.trim().length < 3) {
    return res.status(400).json({ error: 'role is required (minimum 3 characters)' });
  }

  // 1. Sections + chunk counts from vector store
  const store = getVectorStore();
  const sectionChunks = {};
  for (const c of store._data || []) {
    const s = c.meta?.section || 'default';
    sectionChunks[s] = (sectionChunks[s] || 0) + 1;
  }
  if (Object.keys(sectionChunks).length === 0) {
    return res.status(400).json({ error: 'No documentation indexed yet. Run a build first.' });
  }

  // 2. Section query stats from eval.jsonl
  const evalPath = path.join(getDataDir(), 'eval.jsonl');
  const sectionStats = {};
  const now = Date.now();
  let answeredQueries = [];
  let blockedQueries  = [];

  if (fs.existsSync(evalPath)) {
    try {
      const all = fs.readFileSync(evalPath, 'utf8')
        .split('\n').filter(l => l.trim())
        .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
        .filter(Boolean);

      for (const e of all) {
        if (!e.blocked && Array.isArray(e.sectionsUsed)) {
          for (const sec of e.sectionsUsed) {
            if (!sectionStats[sec]) sectionStats[sec] = { queries: 0, lastHit: null };
            sectionStats[sec].queries++;
            if (!sectionStats[sec].lastHit || e.ts > sectionStats[sec].lastHit) sectionStats[sec].lastHit = e.ts;
          }
          if (e.question) answeredQueries.push(e.question);
        } else if ((e.blocked || e.softBlocked) && e.question) {
          blockedQueries.push(e.question);
        }
      }
    } catch (_) {}
  }

  // 3. Top memory topics (what the org keeps asking about)
  const stop = new Set(['what','how','does','can','the','is','are','was','with','for','from','this','that','have','when','where','which','will','would','could','should']);
  function topKeywords(questions, n) {
    const freq = {};
    for (const q of questions) {
      const words = q.toLowerCase().split(/\W+/).filter(w => w.length >= 4 && !stop.has(w));
      for (const w of new Set(words)) freq[w] = (freq[w] || 0) + 1;
    }
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w);
  }
  const memoryTopics = topKeywords(answeredQueries, 6);
  const gapTopics    = topKeywords(blockedQueries, 5);

  // 4. Build section signals for the LLM
  const maxQueries   = Math.max(1, ...Object.values(sectionStats).map(s => s.queries));
  const RECENT_MS    = 14 * 24 * 60 * 60 * 1000;

  const sectionLines = Object.keys(sectionChunks).map(sec => {
    const stats = sectionStats[sec] || { queries: 0, lastHit: null };
    const tags  = [];
    if (stats.queries === 0) {
      tags.push('never queried');
    } else {
      tags.push(`${stats.queries} queries`);
      if (stats.lastHit && (now - new Date(stats.lastHit).getTime()) < RECENT_MS) tags.push('recently active');
      if (stats.queries >= maxQueries * 0.5) tags.push('HIGH TRAFFIC');
    }
    return `- ${sec}: ${tags.join(', ')}`;
  }).join('\n');

  const systemPrompt = `You generate personalized documentation learning paths for engineers joining a team.

Output ONLY a JSON object. No markdown, no explanation.

Format:
{"summary":"one sentence describing this path","path":[{"section":"name","priority":"start","reason":"one sentence","estimatedReadMins":10}]}

Priority values (use exactly these strings):
- "start": read in first week — foundational for this role
- "next": read in first month — important context
- "later": useful but not urgent
- "skip": not relevant for this role

Rules:
- Include ALL sections from the list
- Order: all "start" first, then "next", then "later", then "skip"
- estimatedReadMins: integer 5 to 30
- reason: 1 sentence referencing the role and why this section matters to them
- HIGH TRAFFIC sections should be "start" or "next" for almost all roles
- Never-queried sections should be "later" or "skip" unless clearly needed for the stated role`;

  const userMessage = [
    `Role: ${role.trim()}`,
    topic ? `Focus area: ${topic.trim()}` : '',
    '',
    'DOCUMENTATION SECTIONS (with usage signals):',
    sectionLines,
    memoryTopics.length > 0 ? `\nFREQUENTLY ASKED TOPICS (org memory): ${memoryTopics.join(', ')}` : '',
    gapTopics.length    > 0 ? `KNOWN DOCUMENTATION GAPS: ${gapTopics.join(', ')}` : '',
    '',
    'Generate the learning path.',
  ].filter(l => l !== undefined).join('\n');

  try {
    const raw = await askLlm(systemPrompt, userMessage, { maxTokens: 1800 });

    let parsed;
    try {
      const start = raw.indexOf('{');
      const end   = raw.lastIndexOf('}');
      parsed = (start !== -1 && end > start) ? JSON.parse(raw.slice(start, end + 1)) : JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch (_) {
      return res.status(500).json({ error: 'LLM returned unparseable response' });
    }

    const path = (parsed.path || []).map(item => ({
      section:           item.section,
      priority:          item.priority,
      reason:            item.reason || '',
      estimatedReadMins: item.estimatedReadMins || 10,
      queries:           sectionStats[item.section]?.queries || 0,
    }));

    res.json({
      role:        role.trim(),
      topic:       topic?.trim() || null,
      summary:     parsed.summary || '',
      path,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/health/review/:section — AI suggestions for improving a low-health section
app.post('/api/health/review/:section', async (req, res) => {
  const section = req.params.section;

  const store  = getVectorStore();
  const chunks = (store._data || []).filter(c => (c.meta?.section || 'default') === section);
  if (chunks.length === 0) {
    return res.status(404).json({ error: 'Section not found in index' });
  }

  const evalPath = path.join(getDataDir(), 'eval.jsonl');
  let gapQueries = [];
  if (fs.existsSync(evalPath)) {
    try {
      gapQueries = fs.readFileSync(evalPath, 'utf8')
        .split('\n').filter(l => l.trim())
        .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
        .filter(Boolean)
        .filter(e => e.blocked || e.softBlocked)
        .map(e => e.question)
        .filter(Boolean);
    } catch (_) {}
  }

  // Keywords from section name + significant words from content
  const nameWords   = section.replace(/[-_]/g, ' ').toLowerCase().split(/\s+/).filter(w => w.length >= 4);
  const contentText = chunks.slice(0, 8).map(c => c.text).join(' ').toLowerCase();
  const stopWords   = new Set(['about','after','again','along','also','although','always','another','around',
    'because','before','being','between','could','during','either','every','found','given','having',
    'however','including','instead','large','later','like','made','many','might','more','most','much',
    'never','next','only','other','over','same','should','since','some','still','such','than','that',
    'their','there','these','they','thing','think','this','those','through','under','until','upon',
    'using','very','when','where','which','while','with','within','without','would','your']);
  const contentWords = contentText.split(/\W+/).filter(w => w.length >= 5 && !stopWords.has(w));
  const freq = {};
  for (const w of contentWords) freq[w] = (freq[w] || 0) + 1;
  const topContent = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([w]) => w);
  const keywords = [...new Set([...nameWords, ...topContent])];

  const relatedGaps = gapQueries
    .filter(q => { const ql = q.toLowerCase(); return keywords.some(k => ql.includes(k)); })
    .slice(0, 15);

  const chunkContext = chunks.slice(0, 5)
    .map((c, i) => `[${i + 1}] ${c.text.slice(0, 400)}`)
    .join('\n\n');

  const gapContext = relatedGaps.length > 0
    ? '\n\nUSER QUESTIONS THAT WENT UNANSWERED (related to this section):\n' +
      relatedGaps.map((q, i) => `${i + 1}. ${q}`).join('\n')
    : '\n\n(No related unanswered questions found in gap history — identify gaps from content coverage alone)';

  const systemPrompt = `You are a documentation quality advisor. Given documentation content and unanswered user questions, identify specific missing topics.

Return ONLY valid JSON — no markdown, no explanation:
{
  "suggestions": [
    { "topic": "string (≤8 words)", "detail": "string (1 specific sentence referencing actual content gaps)" }
  ]
}

Rules:
- Return exactly 3–5 suggestions
- Each suggestion must name a SPECIFIC missing topic, not generic advice like "add more examples"
- Reference the actual user questions when possible: "Users asked about X but this section contains no mention of X"
- suggestions array must have 3 to 5 items`;

  const userMessage = `SECTION: ${section}\n\nCURRENT DOCUMENTATION CONTENT:\n${chunkContext}${gapContext}\n\nIdentify the 3–5 most important missing topics.`;

  try {
    const raw = await askLlm(systemPrompt, userMessage);
    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch (_) {
      return res.status(500).json({ error: 'LLM returned unparseable response' });
    }
    res.json({
      section,
      suggestions: parsed.suggestions || [],
      gapQueriesAnalyzed: relatedGaps.length,
      chunksAnalyzed: Math.min(5, chunks.length),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── App config ──────────────────────────────────────────────────────────────

// GET /api/app/config — return config (omit passwords)
app.get('/api/app/config', (req, res) => {
  const cfg = readConfig();
  const safe = JSON.parse(JSON.stringify(cfg));
  if (safe.auth) safe.auth.password = safe.auth.password ? '••••••••' : '';
  if (safe.llm) safe.llm.anthropicApiKey = safe.llm.anthropicApiKey ? '••••••••' : '';
  if (safe.embeddings) safe.embeddings.openaiApiKey = safe.embeddings.openaiApiKey ? '••••••••' : '';
  res.json(safe);
});

// POST /api/app/config — save config
app.post('/api/app/config', (req, res) => {
  try {
    const saved = writeConfig(req.body);
    const safe  = JSON.parse(JSON.stringify(saved));
    if (safe.auth) safe.auth.password = safe.auth.password ? '••••••••' : '';
    res.json({ ok: true, config: safe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/app/status
app.get('/api/app/status', (req, res) => {
  const cfg = readConfig();
  let chunksIndexed = 0;
  let lastCrawled   = null;
  try {
    chunksIndexed = getVectorStore().count();
    const metaPath = path.join(getDataDir(), 'ingest_meta.json');
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      lastCrawled = meta.lastIngest || null;
    }
  } catch (_) {}
  res.json({ setupComplete: cfg.setupComplete, chunksIndexed, lastCrawled, appName: cfg.app.name });
});

// ── Chunk Explorer ──────────────────────────────────────────────────────────

// POST /api/chunks/search — direct vector search (no LLM, no gate); for Chunk Explorer UI
app.post('/api/chunks/search', async (req, res) => {
  const { query, sections, topK = 20 } = req.body || {};
  if (!query?.trim()) return res.status(400).json({ error: 'query required' });

  try {
    const { getEmbedder }    = require('../ingestion/embedder');
    const { getVectorStore } = require('../vectorstore/store');

    const embedder  = getEmbedder();
    const store     = getVectorStore();
    const queryVec  = await embedder.embedOne(query.trim());

    const filter = Array.isArray(sections) && sections.length > 0 ? { sections } : {};
    store.setQuery(query.trim());
    const rawChunks = store.search(queryVec, Math.min(topK, 50), filter);

    // Assign stable IDs matching the upsert format so pinning works correctly
    const chunks = rawChunks.map(c => ({
      id:        (c.meta.section + '__' + c.meta.title + '__' + c.meta.chunkIndex).replace(/\s+/g, '_').replace(/[^\w_]/g, ''),
      text:      c.text,
      score:     c.score,
      semScore:  c.semScore,
      section:   c.meta.section || '',
      meta:      c.meta,
    }));

    res.json({ chunks, query: query.trim() });
  } catch (err) {
    console.error('Chunk search error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Chat ────────────────────────────────────────────────────────────────────

// POST /api/chat/stream — streaming SSE variant; tokens arrive as they generate
app.post('/api/chat/stream', async (req, res) => {
  const { question, sessionId, section, sections, pinnedChunkIds, userId } = req.body;
  if (!question?.trim()) return res.status(400).json({ error: 'question required' });
  // Multi-select sections[] takes priority over legacy single section string
  const effectiveSections = Array.isArray(sections) && sections.length > 0 ? sections
    : section ? [section] : [];

  // ── License gate ──────────────────────────────────────────────────────────
  const gate = checkQueryGate();
  if (!gate.allowed) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    sendSse(res, 'done', JSON.stringify({
      sources: [], debug: null, sessionId: sessionId || 'default', title: '',
      suggestions: [], blocked: true, limitReached: true,
      answer: 'You have reached your ' + gate.limit + ' query limit for this month on the Free plan. Upgrade to Pro for unlimited queries.',
      tier: gate.tier,
    }));
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sid     = sessionId || 'default';
  const session = getSession(sid);
  const history = session.messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

  try {
    const { queryStream } = require('../rag/query');
    const result = await queryStream(question.trim(), {
      sections: effectiveSections,
      pinnedChunkIds: Array.isArray(pinnedChunkIds) ? pinnedChunkIds : [],
      history,
      userId: userId || 'default',
    }, (token) => {
      sendSse(res, 'token', token);
    });

    addMessage(sid, 'user',      question.trim());
    addMessage(sid, 'assistant', result.answer);

    sendSse(res, 'done', JSON.stringify({
      sources:     result.sources,
      debug:       result.debug,
      sessionId:   sid,
      title:       getSession(sid).title,
      suggestions: result.suggestions || [],
      blocked:     result.blocked     || false,
    }));
  } catch (err) {
    console.error('Stream chat error:', err.message);
    const isOllamaError = err.message.includes('Ollama') || err.message.includes('ECONNREFUSED');
    sendSse(res, 'error', JSON.stringify({ error: err.message, isOllamaError }));
  } finally {
    res.end();
  }
});

app.post('/api/chat', async (req, res) => {
  const { question, sessionId, section, sections, userId } = req.body;
  if (!question?.trim()) return res.status(400).json({ error: 'question required' });
  const effectiveSections2 = Array.isArray(sections) && sections.length > 0 ? sections
    : section ? [section] : [];

  const sid     = sessionId || 'default';
  const session = getSession(sid);
  const history = session.messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

  try {
    const result = await query(question.trim(), { sections: effectiveSections2, history, userId: userId || 'default' });
    addMessage(sid, 'user',      question.trim());
    addMessage(sid, 'assistant', result.answer);
    res.json({ answer: result.answer, sources: result.sources, sessionId: sid, title: getSession(sid).title, debug: result.debug || null });
  } catch (err) {
    console.error('Chat error:', err.message);
    const isOllamaError = err.message.includes('Ollama') || err.message.includes('ECONNREFUSED');
    res.status(503).json({ error: err.message, isOllamaError });
  }
});

// ── Code Generation ─────────────────────────────────────────────────────────

// POST /api/code/generate — stream-generate code from a feature spec + codebase context
app.post('/api/code/generate', async (req, res) => {
  const { spec, language, sections, codeOnly } = req.body || {};
  if (!spec || !spec.trim()) return res.status(400).json({ error: 'spec is required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const { generateCodeStream } = require('../rag/codegen');
    const result = await generateCodeStream(
      spec.trim(),
      {
        language,
        sections: Array.isArray(sections) && sections.length > 0 ? sections : [],
        codeOnly: codeOnly !== false,  // default true; only false when caller explicitly sets false
      },
      token => sendSse(res, 'token', token)
    );

    sendSse(res, 'done', JSON.stringify({
      sources: result.sources,
      debug:   result.debug,
    }));
  } catch (err) {
    console.error('Code generation error:', err.message);
    const isOllamaError = err.message.includes('Ollama') || err.message.includes('ECONNREFUSED');
    sendSse(res, 'error', JSON.stringify({ error: err.message, isOllamaError }));
  } finally {
    res.end();
  }
});

// POST /api/copilot/plan — stream an implementation plan from a feature spec
app.post('/api/copilot/plan', async (req, res) => {
  const { spec, sections } = req.body || {};
  if (!spec || !spec.trim()) return res.status(400).json({ error: 'spec is required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const { generatePlanStream } = require('../rag/copilot');
    const result = await generatePlanStream(
      spec.trim(),
      { sections: Array.isArray(sections) && sections.length > 0 ? sections : [] },
      token => sendSse(res, 'token', token)
    );

    sendSse(res, 'done', JSON.stringify({
      sources: result.sources,
      debug:   result.debug,
    }));
  } catch (err) {
    console.error('Copilot plan error:', err.message);
    sendSse(res, 'error', JSON.stringify({ error: err.message }));
  } finally {
    res.end();
  }
});

// ── Sessions ────────────────────────────────────────────────────────────────
app.get('/api/session/:id', (req, res) => {
  const s = sessions[req.params.id];
  if (!s) return res.json({ messages: [], title: 'New conversation' });
  res.json({ messages: s.messages, title: s.title, createdAt: s.createdAt });
});

app.get('/api/sessions', (req, res) => {
  const list = Object.values(sessions)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 30)
    .map(s => ({ id: s.id, title: s.title, updatedAt: s.updatedAt, count: s.messages.filter(m => m.role === 'user').length }));
  res.json({ sessions: list });
});

app.delete('/api/session/:id', (req, res) => {
  delete sessions[req.params.id];
  saveSessions(sessions);
  res.json({ cleared: true });
});

app.delete('/api/sessions', (req, res) => {
  sessions = {};
  saveSessions(sessions);
  res.json({ cleared: true });
});

// ── Sections / Stats ────────────────────────────────────────────────────────

// Helpers for enriching section metadata
function _readConfluenceSpaces() {
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'confluence_spaces.json'), 'utf8')); } catch (_) { return {}; }
}

function _sectionMeta(slug, confSpaces, urlGroupNames = []) {
  if (slug === 'uploads')    return { displayName: 'Uploads',   type: 'uploads' };
  if (slug === 'web-pages' || urlGroupNames.includes(slug)) {
    return { displayName: slug === 'web-pages' ? 'Web Pages' : slug, type: 'web-pages' };
  }
  if (slug.startsWith('confluence-')) {
    // Reverse the slug: 'confluence-eng' → 'ENG', 'confluence-product-docs' → 'PRODUCT-DOCS' (try both)
    const raw = slug.replace(/^confluence-/, '');
    const key = raw.toUpperCase().replace(/-/g, '_');
    const key2 = raw.toUpperCase();
    const name = confSpaces[key] || confSpaces[key2] || confSpaces[raw.toUpperCase()] || null;
    return { displayName: name || slug, type: 'confluence' };
  }
  return { displayName: slug, type: 'portal' };
}

app.get('/api/sections', (req, res) => {
  try {
    const store    = getVectorStore();
    const bySection = {};
    for (const c of store._data || []) {
      const s = c.meta?.section || 'unknown';
      bySection[s] = (bySection[s] || 0) + 1;
    }
    const confSpaces    = _readConfluenceSpaces();
    const savedCfg      = readConfig();
    const urlGroupNames = (savedCfg.urlFetch?.groups || []).map(g => g.name).filter(Boolean);
    const sections = Object.entries(bySection)
      .map(([section, chunks]) => ({ section, chunks, ..._sectionMeta(section, confSpaces, urlGroupNames) }))
      .sort((a, b) => a.section.localeCompare(b.section));
    res.json({ sections });
  } catch (e) { res.json({ sections: [] }); }
});

// ── Search-Driven Discovery ────────────────────────────────────────────────
app.post('/api/search/discover', async (req, res) => {
  const { query, maxResults = 10 } = req.body || {};
  if (!query || !query.trim()) return res.status(400).json({ error: 'query is required' });

  try {
    const fetch    = require('node-fetch');
    const cheerio  = require('cheerio');
    const encoded  = encodeURIComponent(query.trim());
    const url      = 'https://html.duckduckgo.com/html/?q=' + encoded;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    });

    if (!response.ok) {
      return res.json({ results: [], error: 'Search service returned ' + response.status });
    }

    const html = await response.text();
    const $    = cheerio.load(html);
    const results = [];

    $('.result').each((_, el) => {
      if (results.length >= maxResults) return false;
      const titleEl   = $(el).find('.result__title a');
      const snippetEl = $(el).find('.result__snippet');
      const urlEl     = $(el).find('.result__url');

      const title   = titleEl.text().trim();
      const snippet = snippetEl.text().trim();

      // DDG wraps hrefs in a redirect — extract the real URL from the uddg= param
      const rawHref = titleEl.attr('href') || '';
      let resultUrl = '';
      try {
        const parsed   = new URL('https://duckduckgo.com' + rawHref);
        const uddg     = parsed.searchParams.get('uddg');
        resultUrl = uddg ? decodeURIComponent(uddg) : '';
      } catch (_) {}

      // Fall back to the visible .result__url text if param extraction failed
      if (!resultUrl) {
        const displayUrl = urlEl.text().trim();
        if (displayUrl) resultUrl = displayUrl.startsWith('http') ? displayUrl : 'https://' + displayUrl;
      }

      if (!resultUrl || resultUrl.startsWith('https://duckduckgo.com')) return;
      if (!title) return;

      results.push({ title, url: resultUrl, snippet });
    });

    res.json({ results });
  } catch (err) {
    console.error('[search/discover]', err.message);
    res.json({ results: [], error: 'Search unavailable — ' + err.message });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    const store = getVectorStore();
    res.json({
      totalChunks:       store.count(),
      llmProvider:       process.env.LLM_PROVIDER         || 'ollama',
      ollamaModel:       process.env.OLLAMA_MODEL          || 'qwen2.5:3b',
      embeddingProvider: process.env.EMBEDDING_PROVIDER    || 'nomic',
      nomicModel:        process.env.NOMIC_MODEL           || 'nomic-embed-text',
      vectorStore:       process.env.VECTOR_STORE_PROVIDER || 'json',
      hybridWeight:      parseFloat(process.env.HYBRID_WEIGHT    || '0.5'),
      ctxBudget:         parseInt(process.env.CTX_TOKEN_BUDGET   || '1800'),
      topK:              parseInt(process.env.TOP_K              || '6'),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Autonomous Documentation Maintenance ────────────────────────────────────

// GET /api/maintenance/staleness — Phase 1: compare stored hashes vs current file state
app.get('/api/maintenance/staleness', (req, res) => {
  const dataDir   = getDataDir();
  const docsDir   = getDocsDir();
  const hashesPath = path.join(dataDir, 'ingest_hashes.json');
  const metaPath   = path.join(dataDir, 'ingest_meta.json');
  const manifestPath = path.join(docsDir, 'manifest.json');

  // Load last-ingest metadata
  let lastIngest = null;
  try {
    if (fs.existsSync(metaPath)) {
      const m = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      lastIngest = m.lastIngest || null;
    }
  } catch (_) {}

  if (!lastIngest) {
    return res.json({ lastIngest: null, staleCandidates: [], freshCount: 0, staleCount: 0, totalTracked: 0, checkedAt: new Date().toISOString() });
  }

  // Load stored hashes
  let storedHashes = {};
  try {
    if (fs.existsSync(hashesPath)) storedHashes = JSON.parse(fs.readFileSync(hashesPath, 'utf8'));
  } catch (_) {}

  // Load manifest for section + title mapping
  const fileToMeta = {};
  try {
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      for (const entry of manifest) {
        if (entry.file) fileToMeta[entry.file] = { section: entry.section || 'unknown', title: entry.title || null };
      }
    }
  } catch (_) {}

  const staleCandidates = [];
  let freshCount = 0;
  const lastIngestMs = new Date(lastIngest).getTime();

  for (const [relFile, storedHash] of Object.entries(storedHashes)) {
    const absPath = path.join(docsDir, relFile);
    if (!fs.existsSync(absPath)) continue;

    let currentHash = null;
    let fileMtime = null;
    try {
      const raw = fs.readFileSync(absPath);
      currentHash = crypto.createHash('md5').update(raw).digest('hex');
      const stat = fs.statSync(absPath);
      fileMtime = stat.mtime.toISOString();
    } catch (_) { continue; }

    const contentChanged = currentHash !== storedHash;
    const modifiedAfter  = fileMtime && new Date(fileMtime).getTime() > lastIngestMs;

    if (contentChanged || modifiedAfter) {
      const meta = fileToMeta[relFile] || {};
      staleCandidates.push({
        file:             relFile,
        section:          meta.section || relFile.split('/')[0] || 'unknown',
        title:            meta.title || null,
        lastIngest,
        fileMtime,
        stalenessReason:  contentChanged ? 'content_changed' : 'modified_after_ingest',
        contentChanged,
      });
    } else {
      freshCount++;
    }
  }

  res.json({
    lastIngest,
    staleCandidates,
    freshCount,
    staleCount: staleCandidates.length,
    totalTracked: Object.keys(storedHashes).length,
    checkedAt: new Date().toISOString(),
  });
});

// POST /api/maintenance/suggest — Phase 2: LLM rewrite suggestions for a stale doc file
app.post('/api/maintenance/suggest', async (req, res) => {
  const { file, section } = req.body || {};
  if (!file || !section) return res.status(400).json({ error: 'file and section are required' });

  const docsDir  = getDocsDir();
  const absPath  = path.join(docsDir, file);
  if (!fs.existsSync(absPath)) return res.status(404).json({ error: 'File not found: ' + file });

  // Extract current on-disk text
  let currentText = '';
  try {
    const raw = fs.readFileSync(absPath, 'utf8');
    const { extractText } = require('../ingestion/cleaner');
    const parsed = extractText(raw, { title: file, url: null, section });
    currentText = parsed.text.slice(0, 3000);
  } catch (_) {
    currentText = fs.readFileSync(absPath, 'utf8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 3000);
  }

  // Load indexed chunks for this section
  const store = getVectorStore();
  const chunks = (store._data || []).filter(c => (c.meta?.section || 'default') === section);
  const chunksAnalyzed = Math.min(chunks.length, 5);
  const chunkContext = chunks.slice(0, 5).map((c, i) => `[Chunk ${i + 1}] ${c.text.slice(0, 500)}`).join('\n\n');

  const systemPrompt = `You are a documentation quality advisor. A documentation file was modified after it was last indexed.
Compare the current on-disk content with what was indexed and identify what is likely stale or missing.

Return ONLY valid JSON — no markdown, no explanation:
{"suggestions":[{"topic":"short topic name","detail":"one sentence describing what is stale or missing","severity":"high"|"medium"|"low"}]}

Rules:
- 2–5 suggestions maximum
- Focus on content that has changed or is now missing from the indexed version
- "high" = critical information that has changed; "medium" = likely outdated; "low" = minor discrepancy
- If the content is substantially the same, return 1 low-severity suggestion noting it looks current`;

  const userMsg = `SECTION: ${section}
FILE: ${file}

CURRENT ON-DISK CONTENT (first 3000 chars):
${currentText}

CURRENTLY INDEXED CHUNKS FOR THIS SECTION (what users currently see in answers):
${chunkContext || '(no indexed chunks found for this section)'}

Identify what is stale or missing between the current file and the indexed content.`;

  try {
    const raw = await askLlm(systemPrompt, userMsg, { maxTokens: 600 });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(502).json({ error: 'LLM did not return valid JSON' });
    const parsed = JSON.parse(jsonMatch[0]);
    const suggestions = (parsed.suggestions || []).slice(0, 5).map(s => ({
      topic:    s.topic    || 'Unknown',
      detail:   s.detail   || '',
      severity: ['high', 'medium', 'low'].includes(s.severity) ? s.severity : 'medium',
    }));
    res.json({ file, section, suggestions, chunksAnalyzed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── RAGAS Evaluation Pipeline ─────────────────────────────────────────────────

const { generateEvalSet, runEval, loadHistory: loadRagasHistory, getEvalSetStatus } = require('../rag/ragas');

// Track in-progress eval/generation so the UI can poll status
const ragasState = { generating: false, evaluating: false, progress: null };

// GET /api/eval/ragas/status — eval set status + last run scores
app.get('/api/eval/ragas/status', (req, res) => {
  const evalStatus = getEvalSetStatus();
  const history    = loadRagasHistory();
  const latest     = history.length > 0 ? history[history.length - 1] : null;
  res.json({
    evalSet:     evalStatus,
    latest,
    history:     history.slice(-5),
    generating:  ragasState.generating,
    evaluating:  ragasState.evaluating,
    progress:    ragasState.progress,
    rerankerEnabled: (process.env.RERANKER_ENABLED || 'false').toLowerCase() === 'true',
    docTypeChunking: (process.env.DOC_TYPE_CHUNKING || 'false').toLowerCase() === 'true',
  });
});

// GET /api/eval/ragas/history — full run history
app.get('/api/eval/ragas/history', (req, res) => {
  res.json({ history: loadRagasHistory() });
});

// POST /api/eval/ragas/generate — generate synthetic eval set
app.post('/api/eval/ragas/generate', async (req, res) => {
  if (ragasState.generating) return res.status(409).json({ error: 'Generation already in progress' });
  const count = parseInt(req.body?.count || '30', 10);
  ragasState.generating = true;
  ragasState.progress   = { step: 'generate', done: 0, total: count };

  res.json({ ok: true, message: 'Generating ' + count + ' eval pairs in the background. Check /api/eval/ragas/status for progress.' });

  try {
    const items = await generateEvalSet(count, (done, total) => {
      ragasState.progress = { step: 'generate', done, total };
    });
    console.log('[RAGAS] Generated ' + items.length + ' eval items.');
  } catch (err) {
    console.error('[RAGAS] Generation failed:', err.message);
  } finally {
    ragasState.generating = false;
    ragasState.progress   = null;
  }
});

// POST /api/eval/ragas/run — run full evaluation (slow — background)
app.post('/api/eval/ragas/run', async (req, res) => {
  if (ragasState.evaluating) return res.status(409).json({ error: 'Evaluation already in progress' });
  const evalStatus = getEvalSetStatus();
  if (!evalStatus.exists || evalStatus.count === 0) {
    return res.status(400).json({ error: 'No eval set found. POST /api/eval/ragas/generate first.' });
  }

  ragasState.evaluating = true;
  ragasState.progress   = { step: 'eval', done: 0, total: evalStatus.count };

  res.json({ ok: true, message: 'Evaluation started (' + evalStatus.count + ' items). Check /api/eval/ragas/status for progress.' });

  try {
    const result = await runEval((done, total, question) => {
      ragasState.progress = { step: 'eval', done, total, currentQuestion: question?.substring(0, 60) };
    });
    console.log('[RAGAS] Evaluation complete. Faithfulness: ' + result.faithfulness +
      ' | Precision: ' + result.contextPrecision + ' | Recall: ' + result.contextRecall);
  } catch (err) {
    console.error('[RAGAS] Evaluation failed:', err.message);
  } finally {
    ragasState.evaluating = false;
    ragasState.progress   = null;
  }
});

// ── SPA fallback — setup.html must come before catch-all ────────────────────
app.get('/setup', (req, res) => {
  // res.sendFile(path.join(__dirname, '../../public/setup.html'));
  const reactSetup = path.join(FRONTEND_DIST, 'setup.html');
  res.sendFile(hasFrontendBuild && fs.existsSync(reactSetup) ? reactSetup : path.join(PUBLIC_DIR, 'setup.html'));
});

app.get('*', (req, res) => {
  //  res.sendFile(path.join(__dirname, '../../public/index.html'));
   res.sendFile(hasFrontendBuild ? path.join(FRONTEND_DIST, 'index.html') : path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  const cfg  = readConfig();
  const mode = (process.env.LLM_PROVIDER || 'ollama') === 'ollama'
    ? 'LOCAL (Ollama ' + (process.env.OLLAMA_MODEL || 'qwen2.5:3b') + ')'
    : 'CLOUD (Claude)';
  console.log('\nKnowledge Hub → http://localhost:' + PORT);
  console.log('App:        ' + (cfg.app.name || 'Knowledge Hub'));
  console.log('LLM:        ' + mode);
  console.log('Embeddings: ' + (process.env.EMBEDDING_PROVIDER || 'nomic'));
  console.log('Chunks:     ' + getVectorStore().count() + ' indexed');
  console.log('Setup:      ' + (cfg.setupComplete ? 'complete' : 'not done — open /setup') + '\n');
});
