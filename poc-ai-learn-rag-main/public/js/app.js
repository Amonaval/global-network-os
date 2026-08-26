/**
 * Knowledge Hub — Frontend
 */

/* ── State ─────────────────────────────────────────────────────────────── */
const STORAGE_KEY = 'knowledge_hub_session_id';

const state = {
  sessionId:       localStorage.getItem(STORAGE_KEY) || newSessionId(),
  selectedSection: '',
  loading:         false,
  messageCount:    0,
};

function newSessionId() {
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : 'session-' + Date.now();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}

/* ── DOM refs ───────────────────────────────────────────────────────────── */
const messagesEl   = document.getElementById('messages');
const inputEl      = document.getElementById('questionInput');
const sendBtn      = document.getElementById('sendBtn');
const welcomeEl    = document.getElementById('welcome');
const statusInd    = document.getElementById('statusIndicator');
const statusLabel  = document.getElementById('statusLabel');
const statChunks   = document.getElementById('statChunks');
const statModel    = document.getElementById('statModel');
const sectionList  = document.getElementById('sectionList');
const filterLabel  = document.getElementById('filterLabel');
const filterPill   = document.getElementById('filterPill');
const convTitle    = document.getElementById('convTitle');
const historyList  = document.getElementById('historyList');
const clearBtn     = document.getElementById('clearBtn');
const contextBar   = document.getElementById('contextBar');
const contextLabel = document.getElementById('contextLabel');

/* ── Init ───────────────────────────────────────────────────────────────── */
(async () => {
  // Redirect to setup if not configured
  try {
    const status = await fetch('/api/app/status').then(r => r.json());
    if (!status.setupComplete) { window.location = '/setup'; return; }
    applyAppBranding(status.appName);
  } catch (_) {}

  await loadStats();
  await loadSections();
  await restoreSession(state.sessionId);
  await loadHistory();
  inputEl.focus();
})();

function applyAppBranding(name) {
  if (!name) return;
  const logoTitle = document.getElementById('logoTitle');
  const logoMark  = document.getElementById('logoMark');
  const wTitle    = document.getElementById('welcomeTitle');
  const inputEl2  = document.getElementById('questionInput');
  if (logoTitle) logoTitle.textContent = name;
  if (logoMark)  logoMark.textContent  = name.charAt(0).toUpperCase();
  if (wTitle)    wTitle.textContent    = 'Ask anything about your docs';
  if (inputEl2)  inputEl2.placeholder  = 'Ask a question about ' + name + '…';
  document.title = name;
}

/* ── Stats ──────────────────────────────────────────────────────────────── */
async function loadStats() {
  try {
    const d = await fetch("/api/stats").then(r => r.json());
    statChunks.textContent = (d.totalChunks || 0).toLocaleString();
    statModel.textContent  = d.llmProvider === "ollama" ? (d.ollamaModel || "ollama")
                           : d.llmProvider === "vllm"   ? (d.vllmModel   || "vllm")
                           : "Claude";
    const eb = document.getElementById("embedBadge");
    if (eb) { const ep=d.embeddingProvider||"tfidf"; eb.textContent=ep==="nomic"?"🧠 nomic":ep==="openai"?"☁️ openai":"📊 tfidf"; }
    const hb = document.getElementById("hybridBadge");
    if (hb) { const hw=d.hybridWeight||0.5; hb.textContent=hw===0?"🔷 semantic":hw===1?"🔶 BM25":"⚡ hybrid"; }
    if (d.totalChunks === 0) showBanner('No documents indexed. <a href="/setup">Open setup</a> to crawl and build the knowledge base.');
  } catch (_) { statChunks.textContent = "—"; }
}

/* ── Sections ───────────────────────────────────────────────────────────── */
async function loadSections() {
  try {
    const d = await fetch('/api/sections').then(r => r.json());
    if (!d.sections?.length) return;
    sectionList.innerHTML = '<button class="section-btn active" data-section="" onclick="selectSection(this,\'\')">All sections</button>';
    for (const s of d.sections) {
      const b = document.createElement('button');
      b.className = 'section-btn';
      b.dataset.section = s.section;
      b.textContent = s.section;
      b.title = s.chunks + ' chunks';
      b.onclick = () => selectSection(b, s.section);
      sectionList.appendChild(b);
    }
  } catch (_) {}
}

function selectSection(btn, section) {
  document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.selectedSection = section;

  if (section) {
    filterLabel.textContent = section;
    filterPill.style.display = 'flex';
    contextLabel.textContent = 'Searching in: ' + section;
    contextBar.style.display = 'flex';
  } else {
    filterPill.style.display = 'none';
    contextBar.style.display = 'none';
  }
}

function clearContext() {
  selectSection(document.querySelector('.section-btn[data-section=""]'), '');
}

/* ── Session restore ────────────────────────────────────────────────────── */
async function restoreSession(sessionId) {
  try {
    const d = await fetch('/api/session/' + sessionId).then(r => r.json());
    if (!d.messages || d.messages.length === 0) return;

    welcomeEl.style.display = 'none';
    convTitle.textContent   = d.title || 'Conversation';
    clearBtn.style.display  = 'block';

    // Add a restore marker
    const marker = document.createElement('div');
    marker.className = 'restore-banner';
    marker.innerHTML = '🔁 Restored ' + d.messages.filter(m=>m.role==='user').length + ' earlier messages · ' + formatDate(d.createdAt);
    messagesEl.appendChild(marker);

    // Re-render prior messages (no sources — they're not stored)
    for (const m of d.messages) {
      if (m.role === 'user') {
        appendUserMessage(m.content, false);
      } else if (m.role === 'assistant') {
        appendAIMessage(m.content, [], false);
      }
    }

    state.messageCount = d.messages.filter(m => m.role === 'user').length;
    scrollToBottom();
  } catch (_) {}
}

/* ── Conversation history sidebar ───────────────────────────────────────── */
async function loadHistory() {
  try {
    const d = await fetch('/api/sessions').then(r => r.json());
    renderHistory(d.sessions || []);
  } catch (_) {}
}

function renderHistory(sessions) {
  if (!sessions.length) {
    historyList.innerHTML = '<div class="history-empty">No conversations yet</div>';
    return;
  }
  historyList.innerHTML = '';
  for (const s of sessions) {
    const item = document.createElement('div');
    item.className = 'history-item' + (s.id === state.sessionId ? ' active' : '');
    item.innerHTML =
      '<span class="history-icon">💬</span>' +
      '<div class="history-info">' +
        '<div class="history-title">' + escHtml(s.title) + '</div>' +
        '<div class="history-meta">' + s.count + ' questions · ' + formatAgo(s.updatedAt) + '</div>' +
      '</div>' +
      '<button class="history-del" title="Delete" onclick="deleteSession(event,\'' + s.id + '\')">×</button>';
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('history-del')) return;
      switchSession(s.id, s.title);
    });
    historyList.appendChild(item);
  }
}

async function switchSession(id, title) {
  // Clear current messages
  messagesEl.innerHTML = '';
  messagesEl.appendChild(welcomeEl);
  welcomeEl.style.display = '';
  convTitle.textContent = 'Loading…';

  state.sessionId   = id;
  state.messageCount = 0;
  localStorage.setItem(STORAGE_KEY, id);

  await restoreSession(id);
  convTitle.textContent = title || 'Conversation';
  updateActiveHistory(id);
}

function updateActiveHistory(id) {
  document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
  const items = historyList.querySelectorAll('.history-item');
  items.forEach(el => {
    if (el.querySelector('.history-del')?.getAttribute('onclick')?.includes(id)) {
      el.classList.add('active');
    }
  });
}

async function deleteSession(e, id) {
  e.stopPropagation();
  await fetch('/api/session/' + id, { method: 'DELETE' });
  if (id === state.sessionId) {
    newChat();
  } else {
    await loadHistory();
  }
}

/* ── Chat ───────────────────────────────────────────────────────────────── */
async function sendMessage() {
  const q = inputEl.value.trim();
  if (!q || state.loading) return;

  welcomeEl.style.display = 'none';
  clearBtn.style.display  = 'block';
  appendUserMessage(q);
  inputEl.value = '';
  autoResize(inputEl);
  setLoading(true);
  const typing = appendTyping();

  try {
    const res = await fetch('/api/chat/stream', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        question:  q,
        sessionId: state.sessionId,
        section:   state.selectedSection || undefined,
      }),
    });

    if (!res.ok) {
      typing.remove();
      const data = await res.json().catch(() => ({ error: 'Server error ' + res.status }));
      if (data.isOllamaError) appendOllamaError(data.error);
      else appendError(data.error || 'Server error', '');
      setLoading(false);
      scrollToBottom();
      return;
    }

    // Replace typing indicator with a live streaming bubble
    typing.remove();
    const { el: answerEl, contentEl } = appendAIMessageStreaming();

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = '';
    let   answerText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const evt = JSON.parse(line.slice(6));
          if (evt.type === 'token') {
            answerText += evt.message;
            contentEl.innerHTML = renderMarkdown(answerText);
            scrollToBottom();
          } else if (evt.type === 'done') {
            const meta = JSON.parse(evt.message);
            // Show upgrade prompt if query limit reached
            if (meta.limitReached) {
              answerEl.remove();
              appendLimitReachedMessage(meta.answer || 'Query limit reached.');
              setLoading(false);
              return;
            }
            finalizeAIMessage(answerEl, answerText, meta.sources || [], meta.debug || null, meta.suggestions || []);
            if (meta.title) convTitle.textContent = meta.title;
            if (meta.sessionId) {
              state.sessionId = meta.sessionId;
              localStorage.setItem(STORAGE_KEY, state.sessionId);
            }
            state.messageCount++;
            if (state.messageCount % 3 === 0 || state.messageCount === 1) await loadHistory();
          } else if (evt.type === 'error') {
            const errData = JSON.parse(evt.message);
            answerEl.remove();
            if (errData.isOllamaError) appendOllamaError(errData.error);
            else appendError(errData.error || 'Server error', '');
          }
        } catch (_) {}
      }
    }
  } catch (err) {
    typing.remove();
    appendError('Network error — is the server running?', err.message);
  }

  setLoading(false);
  scrollToBottom();
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 160) + 'px';
}

function askSuggestion(el) {
  inputEl.value = el.textContent.trim();
  autoResize(inputEl);
  sendMessage();
}

function newChat() {
  state.sessionId    = newSessionId();
  state.messageCount = 0;
  messagesEl.innerHTML = '';
  messagesEl.appendChild(welcomeEl);
  welcomeEl.style.display = '';
  convTitle.textContent   = 'New conversation';
  clearBtn.style.display  = 'none';
  inputEl.focus();
  loadHistory();
}

async function clearCurrentChat() {
  if (!confirm('Clear this conversation?')) return;
  await fetch('/api/session/' + state.sessionId, { method: 'DELETE' });
  messagesEl.innerHTML = '';
  messagesEl.appendChild(welcomeEl);
  welcomeEl.style.display = '';
  convTitle.textContent   = 'New conversation';
  clearBtn.style.display  = 'none';
  state.messageCount = 0;
  // Start a fresh session
  state.sessionId = newSessionId();
  await loadHistory();
}

/* ── DOM builders ───────────────────────────────────────────────────────── */
function appendUserMessage(text, scroll = true) {
  const el = document.createElement('div');
  el.className = 'message user';
  el.innerHTML = '<div class="avatar">You</div><div class="bubble">' + escHtml(text) + '</div>';
  messagesEl.appendChild(el);
  if (scroll) scrollToBottom();
}

function appendAIMessage(answer, sources, scroll = true, debug = null) {
  const el = document.createElement('div');
  el.className = 'message ai';
  const uniqueSrc = sources.filter(function(s, i) {
    if (!s.url) return i === sources.findIndex(function(x) { return !x.url; });
    return sources.findIndex(function(x) { return x.url === s.url; }) === i;
  });
  const srcHtml = uniqueSrc.length
    ? '<div class="sources"><div class="sources-label">Sources</div><div class="source-chips">' +
      uniqueSrc.map(s =>
        '<a class="source-chip" href="' + (s.url || '#') + '" target="_blank" rel="noopener">' +
        '📄 ' + escHtml(s.title || s.section) +
        '<span class="rel">' + Math.round((s.score || 0) * 100) + '%</span></a>'
      ).join('') + '</div></div>'
    : '';
  const dbgHtml = debug
    ? '<div class="debug-line">' +
        '<span>📦 ' + debug.usedChunks + '/' + (debug.usedChunks + debug.droppedLow + debug.droppedDupe) + ' chunks</span>' +
        '<span>🪙 ~' + debug.budgetUsed + ' ctx tokens</span>' +
        (debug.droppedLow  ? '<span>⬇️ ' + debug.droppedLow  + ' low-score</span>' : '') +
        (debug.droppedDupe ? '<span>🔁 ' + debug.droppedDupe + ' deduped</span>'  : '') +
      '</div>'
    : '';
  el.innerHTML = '<div class="avatar">AI</div><div class="bubble">' +
    '<div class="answer-content">' + renderMarkdownWithCitations(answer, sources) + '</div>' +
    srcHtml + dbgHtml + '</div>';
  messagesEl.appendChild(el);
  if (scroll) scrollToBottom();
}

// Streaming helpers — create a live bubble, then finalize it once done
function appendAIMessageStreaming() {
  const el       = document.createElement('div');
  el.className   = 'message ai streaming';
  const bubble   = document.createElement('div');
  bubble.className = 'bubble';
  const contentEl = document.createElement('div');
  contentEl.className = 'answer-content';
  bubble.appendChild(contentEl);
  el.innerHTML   = '<div class="avatar">AI</div>';
  el.appendChild(bubble);
  messagesEl.appendChild(el);
  scrollToBottom();
  return { el, contentEl };
}

function finalizeAIMessage(el, answer, sources, debug, suggestions) {
  el.classList.remove('streaming');
  const bubble    = el.querySelector('.bubble');
  const contentEl = el.querySelector('.answer-content');
  contentEl.innerHTML = renderMarkdownWithCitations(answer, sources);

  const uniqueSources = sources.filter(function(s, i) {
    if (!s.url) return i === sources.findIndex(function(x) { return !x.url; });
    return sources.findIndex(function(x) { return x.url === s.url; }) === i;
  });

  if (uniqueSources.length) {
    const srcDiv = document.createElement('div');
    srcDiv.className = 'sources';
    srcDiv.innerHTML =
      '<div class="sources-label">Sources</div><div class="source-chips">' +
      uniqueSources.map(s =>
        '<a class="source-chip" href="' + (s.url || '#') + '" target="_blank" rel="noopener">' +
        '📄 ' + escHtml(s.title || s.section) +
        '<span class="rel">' + Math.round((s.score || 0) * 100) + '%</span></a>'
      ).join('') + '</div>';
    bubble.appendChild(srcDiv);
  }

  // Smart suggestions — shown when answer was blocked / no sources found
  if (!uniqueSources.length && suggestions && suggestions.length) {
    const sugDiv = document.createElement('div');
    sugDiv.className = 'not-found-suggestions';
    sugDiv.innerHTML = '<span class="nf-label">📍 Related sections to explore:</span>' +
      suggestions.map(sec =>
        '<button class="nf-section-btn" onclick="selectSectionSuggest(' + JSON.stringify(sec) + ')">' +
        formatSectionName(sec) + '</button>'
      ).join('');
    bubble.appendChild(sugDiv);
  }

  if (debug) {
    const dbgDiv = document.createElement('div');
    dbgDiv.className = 'debug-line';
    dbgDiv.innerHTML =
      '<span>📦 ' + debug.usedChunks + '/' + (debug.usedChunks + debug.droppedLow + debug.droppedDupe) + ' chunks</span>' +
      '<span>🪙 ~' + debug.budgetUsed + ' ctx tokens</span>' +
      (debug.droppedLow  ? '<span>⬇️ ' + debug.droppedLow  + ' low-score</span>' : '') +
      (debug.droppedDupe ? '<span>🔁 ' + debug.droppedDupe + ' deduped</span>'  : '');
    bubble.appendChild(dbgDiv);
  }

  scrollToBottom();
}

function formatSectionName(sec) {
  return sec.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).substring(0, 40);
}

// Clicking a suggestion sets that section filter so the user can refine their query
function selectSectionSuggest(sec) {
  const btn = document.querySelector('.section-btn[data-section="' + sec + '"]');
  if (btn) selectSection(btn, sec);
  else {
    state.selectedSection = sec;
    document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));
    const pill = document.getElementById('filterPill');
    const fl   = document.getElementById('filterLabel');
    if (pill) pill.style.display = 'flex';
    if (fl)   fl.textContent = formatSectionName(sec);
  }
  inputEl.focus();
}

function appendTyping() {
  const el = document.createElement('div');
  el.className = 'message ai';
  el.innerHTML = '<div class="avatar">AI</div><div class="bubble"><div class="typing">' +
    '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>';
  messagesEl.appendChild(el);
  scrollToBottom();
  return el;
}

function appendOllamaError(msg) {
  const el = document.createElement('div');
  el.className = 'message ai';
  el.innerHTML = '<div class="avatar">AI</div><div class="bubble"><div class="error-bubble ollama-error">' +
    '<strong>⚠️ Ollama is not running</strong><br><br>' +
    '1. Open a terminal → run <code>ollama serve</code><br>' +
    '2. Pull a model: <code>ollama pull llama3.2</code><br>' +
    '3. Refresh and try again<br><br>' +
    '<small>' + escHtml(msg) + '</small></div></div>';
  messagesEl.appendChild(el);
}

function appendError(msg, detail) {
  const el = document.createElement('div');
  el.className = 'message ai';
  el.innerHTML = '<div class="avatar">AI</div><div class="bubble"><div class="error-bubble">' +
    '<strong>⚠️ ' + escHtml(msg) + '</strong>' +
    (detail ? '<br><small>' + escHtml(detail) + '</small>' : '') +
    '</div></div>';
  messagesEl.appendChild(el);
}

function showBanner(html) {
  let b = document.getElementById('setup-banner');
  if (!b) {
    b = document.createElement('div');
    b.id = 'setup-banner'; b.className = 'setup-banner';
    document.querySelector('.main').insertBefore(b, messagesEl);
  }
  b.innerHTML = html; b.classList.add('show');
}

function setLoading(on) {
  state.loading = on; sendBtn.disabled = on;
  statusInd.className = 'status-indicator ' + (on ? 'loading' : 'ready');
  statusLabel.textContent = on ? 'Thinking…' : 'Ready';
}

function scrollToBottom() { messagesEl.scrollTop = messagesEl.scrollHeight; }

/* ── Markdown ────────────────────────────────────────────────────────────── */
function renderMarkdown(md) {
  if (!md) return '';
  let h = escHtml(md);
  h = h.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
    '<pre><code class="lang-' + lang + '">' + code.trim() + '</code></pre>');
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/\*(.+?)\*/g, '<em>$1</em>');
  h = h.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  h = h.replace(/^## (.+)$/gm,  '<h2>$1</h2>');
  h = h.replace(/^# (.+)$/gm,   '<h1>$1</h1>');
  h = h.replace(/^[•\-\*] (.+)$/gm, '<li>$1</li>');
  h = h.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m => '<ul>' + m + '</ul>');
  h = h.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  h = h.split(/\n\n+/).map(b => {
    if (/^<(h[1-4]|ul|ol|li|pre|blockquote)/.test(b.trim())) return b;
    return '<p>' + b.replace(/\n/g, '<br>') + '</p>';
  }).join('\n');
  return h;
}

function renderMarkdownWithCitations(md, sources) {
  const html = renderMarkdown(md);
  if (!sources || !sources.length) return html;
  // Replace [N] citation markers outside of <pre> / <code> blocks
  const parts = html.split(/(<pre[\s\S]*?<\/pre>|<code[^>]*>[\s\S]*?<\/code>)/g);
  return parts.map(function(part, i) {
    if (i % 2 === 1) return part;
    return part.replace(/\[(\d{1,2})\]/g, function(match, num) {
      const idx = parseInt(num, 10) - 1;
      if (idx < 0 || idx >= sources.length) return match;
      const src   = sources[idx];
      const href  = src.url || '#';
      const label = escHtml(src.title || src.section || ('Source ' + num));
      return '<sup><a href="' + href + '" target="_blank" rel="noopener" class="citation-link" title="' + label + '">[' + num + ']</a></sup>';
    });
  }).join('');
}

/* ── Utilities ──────────────────────────────────────────────────────────── */
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

async function rebuildIndex() {
  if (!confirm('Re-crawl all sections and rebuild the knowledge base? This may take several minutes.')) return;

  // Cancel any lingering build first
  try { await fetch('/api/setup/cancel', { method: 'POST' }); } catch (_) {}

  // Create or reuse an inline progress panel
  let panel = document.getElementById('rebuildPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'rebuildPanel';
    panel.className = 'rebuild-panel';
    document.querySelector('.main').insertBefore(panel, messagesEl);
  }
  panel.innerHTML =
    '<div class="rebuild-header">' +
      '<span id="rebuildPhase">Rebuilding knowledge base…</span>' +
      '<button class="rebuild-close" onclick="document.getElementById(\'rebuildPanel\').remove()">×</button>' +
    '</div>' +
    '<div class="rebuild-log-wrap"><pre id="rebuildOutput"></pre></div>' +
    '<div id="rebuildStatus"></div>';
  panel.style.display = 'block';

  const logEl    = document.getElementById('rebuildOutput');
  const phaseEl  = document.getElementById('rebuildPhase');
  const statusEl = document.getElementById('rebuildStatus');

  function appendLog(msg) {
    logEl.textContent += msg + '\n';
    panel.querySelector('.rebuild-log-wrap').scrollTop = logEl.scrollHeight;
  }

  try {
    const response = await fetch('/api/setup/rebuild', { method: 'POST' });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'HTTP ' + response.status }));
      statusEl.innerHTML = '<span class="rebuild-err">❌ ' + escHtml(err.error || 'Failed') + '</span>';
      return;
    }

    const reader  = response.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const evt = JSON.parse(line.slice(6));
          if (evt.type === 'phase') {
            phaseEl.textContent = evt.message;
            appendLog('\n' + evt.message);
          } else if (evt.type === 'log') {
            appendLog(evt.message);
          } else if (evt.type === 'done') {
            statusEl.innerHTML = '<span class="rebuild-ok">✅ ' + escHtml(evt.message) + '</span>';
            await loadStats();
            await loadSections();
          } else if (evt.type === 'error') {
            statusEl.innerHTML = '<span class="rebuild-err">❌ ' + escHtml(evt.message) + '</span>';
          }
        } catch (_) {}
      }
    }
  } catch (err) {
    statusEl.innerHTML = '<span class="rebuild-err">❌ Network error: ' + escHtml(err.message) + '</span>';
  }
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Sidebar settings menu ─────────────────────────────────────────────────────
function toggleSettingsMenu(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById('settingsMenu');
  if (!menu) return;
  menu.classList.toggle('open');
  // Close on outside click
  if (menu.classList.contains('open')) {
    const close = (e) => { if (!menu.contains(e.target)) { menu.classList.remove('open'); document.removeEventListener('click', close); } };
    setTimeout(() => document.addEventListener('click', close), 0);
  }
}

async function resetKnowledgeBase() {
  if (!confirm('This will delete all indexed data and redirect to the setup wizard. Are you sure?')) return;
  toggleSettingsMenu();
  try {
    await fetch('/api/setup/reset', { method: 'POST' });
  } catch (_) {}
  window.location = '/setup';
}

/* ── Sidebar toggle ─────────────────────────────────────────────────────── */
document.getElementById('mobileMenuBtn').addEventListener('click', () =>
  document.getElementById('sidebar').classList.toggle('mobile-open'));
document.getElementById('sidebarToggle').addEventListener('click', () =>
  document.getElementById('sidebar').classList.toggle('collapsed'));

/* ── Upload Panel ───────────────────────────────────────────────────────── */
function toggleUploadPanel() {
  const panel = document.getElementById('uploadPanel');
  const isVisible = panel.style.display !== 'none';
  panel.style.display = isVisible ? 'none' : 'block';
  if (!isVisible) loadUploadedFiles();
}

function handleUploadDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  uploadFiles(Array.from(e.dataTransfer.files));
}

function handleFileSelect(e) {
  uploadFiles(Array.from(e.target.files));
  e.target.value = '';
}

async function uploadFiles(files) {
  if (!files.length) return;

  const progressEl = document.getElementById('uploadProgress');
  const logEl      = document.getElementById('uploadLog');
  const statusEl   = document.getElementById('uploadStatus');

  progressEl.style.display = 'block';
  logEl.textContent  = '';
  statusEl.innerHTML = '';

  const formData = new FormData();
  for (const file of files) formData.append('files', file);

  function appendLog(msg) {
    logEl.textContent += msg + '\n';
    progressEl.querySelector('.rebuild-log-wrap').scrollTop = logEl.scrollHeight;
  }

  try {
    const res = await fetch('/api/docs/upload', { method: 'POST', body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'HTTP ' + res.status }));
      statusEl.innerHTML = '<span class="rebuild-err">❌ ' + escHtml(err.error || 'Upload failed') + '</span>';
      return;
    }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const evt = JSON.parse(line.slice(6));
          if (evt.type === 'phase') appendLog('\n' + evt.message);
          else if (evt.type === 'log') appendLog(evt.message);
          else if (evt.type === 'done') {
            statusEl.innerHTML = '<span class="rebuild-ok">✅ ' + escHtml(evt.message) + '</span>';
            loadUploadedFiles();
            loadStats();
            loadSections();
          } else if (evt.type === 'error') {
            statusEl.innerHTML = '<span class="rebuild-err">❌ ' + escHtml(evt.message) + '</span>';
          }
        } catch (_) {}
      }
    }
  } catch (err) {
    statusEl.innerHTML = '<span class="rebuild-err">❌ ' + escHtml(err.message) + '</span>';
  }
}

async function loadUploadedFiles() {
  const listEl = document.getElementById('uploadedFilesList');
  if (!listEl) return;
  try {
    const d = await fetch('/api/docs/uploads').then(r => r.json());
    if (!d.uploads || d.uploads.length === 0) {
      listEl.innerHTML = '<div class="upload-empty">No documents uploaded yet</div>';
      return;
    }
    listEl.innerHTML =
      '<div class="upload-file-header">Uploaded files (' + d.uploads.length + ')</div>' +
      d.uploads.map(f =>
        '<div class="upload-file-item">' +
          '<span class="upload-file-icon">' + fileIcon(f.originalName || f.name) + '</span>' +
          '<div class="upload-file-info">' +
            '<span class="upload-file-name">' + escHtml(f.originalName || f.name) + '</span>' +
            '<span class="upload-file-meta">' + f.chunks + ' chunks · ' + formatBytes(f.size) + '</span>' +
          '</div>' +
          '<button class="upload-file-del" title="Remove" onclick="deleteUpload(\'' + escHtml(f.name) + '\')">🗑</button>' +
        '</div>'
      ).join('');
  } catch (_) {}
}

function fileIcon(name) {
  const ext = (name || '').split('.').pop().toLowerCase();
  return { pdf:'📕', docx:'📘', doc:'📘', txt:'📄', md:'📝', html:'🌐', zip:'🗜️' }[ext] || '📄';
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024*1024) return Math.round(bytes/1024) + ' KB';
  return (bytes/1024/1024).toFixed(1) + ' MB';
}

async function deleteUpload(name) {
  if (!confirm('Remove "' + name + '" and its indexed chunks?')) return;
  try {
    await fetch('/api/docs/upload/' + encodeURIComponent(name), { method: 'DELETE' });
    loadUploadedFiles();
    loadStats();
    loadSections();
  } catch (err) {
    alert('Failed to remove file: ' + err.message);
  }
}

/* ── Analytics Panel ────────────────────────────────────────────────────── */
function showAnalytics() {
  document.getElementById('analyticsPanel').style.display = 'flex';
  document.getElementById('messages').style.display        = 'none';
  document.querySelector('.input-area').style.display      = 'none';
  loadAnalytics();
}

function hideAnalytics() {
  document.getElementById('analyticsPanel').style.display = 'none';
  document.getElementById('messages').style.display        = '';
  document.querySelector('.input-area').style.display      = '';
}

async function loadAnalytics() {
  const bodyEl = document.getElementById('analyticsBody');
  if (!bodyEl) return;
  bodyEl.innerHTML = '<div class="analytics-loading">Loading analytics…</div>';

  try {
    const d = await fetch('/api/analytics').then(r => r.json());
    const s = d.summary || {};
    const answerPct = s.total > 0 ? Math.round((s.answered / s.total) * 100) : 0;

    const maxSectionCount = d.topSections.length > 0 ? d.topSections[0].count : 1;

    bodyEl.innerHTML =
      // KPI row
      '<div class="kpi-row">' +
        kpiCard('Total Queries', s.total || 0, '') +
        kpiCard('Answer Rate', (answerPct) + '%', answerPct >= 80 ? 'kpi-good' : answerPct >= 50 ? 'kpi-warn' : 'kpi-bad') +
        kpiCard('Avg Confidence', (s.avgSemScore || 0).toFixed(2), '') +
        kpiCard('Avg Latency', (s.avgLatencyMs || 0).toLocaleString() + 'ms', '') +
      '</div>' +

      // Top sections bar chart
      (d.topSections.length > 0
        ? '<div class="analytics-section">' +
            '<div class="analytics-section-title">Most Referenced Sections</div>' +
            d.topSections.map(s =>
              '<div class="section-bar-row">' +
                '<div class="section-bar-label">' + escHtml(s.section) + '</div>' +
                '<div class="section-bar-track"><div class="section-bar-fill" style="width:' + Math.round(s.count/maxSectionCount*100) + '%"></div></div>' +
                '<div class="section-bar-count">' + s.count + '</div>' +
              '</div>'
            ).join('') +
          '</div>'
        : '') +

      // Top unanswered
      (d.topUnanswered.length > 0
        ? '<div class="analytics-section">' +
            '<div class="analytics-section-title">Top Unanswered Questions <span class="analytics-badge">Documentation Gaps</span></div>' +
            '<div class="unanswered-list">' +
            d.topUnanswered.map(u =>
              '<div class="unanswered-item">' +
                '<span class="unanswered-q">' + escHtml(u.question) + '</span>' +
                (u.count > 1 ? '<span class="unanswered-count">×' + u.count + '</span>' : '') +
              '</div>'
            ).join('') +
            '</div>' +
          '</div>'
        : '<div class="analytics-section"><div class="analytics-section-title">Unanswered Questions</div><p style="color:var(--text-s);padding:8px 0">None yet — great coverage!</p></div>') +

      // Recent queries table
      (d.recentQueries.length > 0
        ? '<div class="analytics-section">' +
            '<div class="analytics-section-title">Recent Queries</div>' +
            '<div class="recent-table-wrap"><table class="recent-table">' +
              '<thead><tr><th>Question</th><th>Score</th><th>Latency</th><th>Status</th></tr></thead>' +
              '<tbody>' +
              d.recentQueries.map(q =>
                '<tr>' +
                  '<td class="query-cell">' + escHtml((q.question || '').substring(0, 70)) + '</td>' +
                  '<td>' + ((q.topSemScore || 0) * 100).toFixed(0) + '%</td>' +
                  '<td>' + (q.latencyMs || 0).toLocaleString() + 'ms</td>' +
                  '<td>' + (q.blocked ? '<span class="status-blocked">blocked</span>' : '<span class="status-answered">answered</span>') + '</td>' +
                '</tr>'
              ).join('') +
              '</tbody>' +
            '</table></div>' +
          '</div>'
        : '') +

      (s.total === 0
        ? '<div class="analytics-empty"><p>No queries logged yet.</p><p>Start asking questions in the chat — every query is logged automatically.</p></div>'
        : '');
  } catch (err) {
    bodyEl.innerHTML = '<div class="analytics-loading">Failed to load analytics: ' + escHtml(err.message) + '</div>';
  }
}

function kpiCard(label, value, cls) {
  return '<div class="kpi-card ' + (cls || '') + '">' +
    '<div class="kpi-value">' + value + '</div>' +
    '<div class="kpi-label">' + label + '</div>' +
    '</div>';
}

function appendLimitReachedMessage(msg) {
  const messages = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = 'message ai limit-reached-message';
  div.innerHTML =
    '<div class="bubble limit-reached-bubble">' +
      '<div class="limit-reached-text">' + escHtml(msg) + '</div>' +
      '<button class="limit-upgrade-btn" onclick="showLicenseModal()">✦ Upgrade to Pro — Unlimited queries</button>' +
    '</div>';
  messages.appendChild(div);
  scrollToBottom();
}

// ── License modal ─────────────────────────────────────────────────────────────

let _licenseData = null;

async function loadLicenseStatus() {
  try {
    const d = await fetch('/api/license').then(r => r.json());
    _licenseData = d;

    // Sidebar badge
    const badge = document.getElementById('licenseBadge');
    const link  = document.getElementById('upgradeLink');
    if (badge) {
      badge.textContent = d.tierName;
      badge.style.background = d.tierColor || '#6b7280';
      badge.style.color = '#fff';
    }
    if (link) link.style.display = d.tier === 'free' ? '' : 'none';
  } catch (_) {}
}

function showLicenseModal() {
  document.getElementById('licenseModal').style.display = 'flex';
  renderLicenseModal();
}

function hideLicenseModal() {
  document.getElementById('licenseModal').style.display = 'none';
  document.getElementById('activateResult').style.display = 'none';
  document.getElementById('licenseKeyInput').value = '';
}

function renderLicenseModal() {
  const d = _licenseData;
  if (!d) { loadLicenseStatus().then(renderLicenseModal); return; }

  // Plan name + sub
  document.getElementById('licPlanName').textContent = d.tierName + ' Plan';
  const tierBadge = document.getElementById('licTierBadge');
  tierBadge.textContent    = d.tierName;
  tierBadge.style.background = d.tierColor;

  if (d.tier === 'free') {
    document.getElementById('licPlanSub').textContent = 'Limited to ' + d.queryLimit + ' queries/month and ' + d.uploadLimit + ' uploads.';
  } else {
    document.getElementById('licPlanSub').textContent = 'Unlimited queries, uploads, and all integrations.';
  }

  // Usage bars
  const qUsed  = d.queriesThisMonth || 0;
  const qLimit = d.queryLimit;
  const qPct   = qLimit === -1 ? 0 : Math.min(100, (qUsed / qLimit) * 100);
  document.getElementById('queryUsageBar').style.width = qPct + '%';
  document.getElementById('queryUsageBar').className   = 'usage-bar' + (qPct >= 90 ? ' usage-bar-warn' : '');
  document.getElementById('queryUsageText').textContent = qLimit === -1 ? qUsed + ' (unlimited)' : qUsed + ' / ' + qLimit;

  const uUsed  = d.uploadCount || 0;
  const uLimit = d.uploadLimit;
  const uPct   = uLimit === -1 ? 0 : Math.min(100, (uUsed / uLimit) * 100);
  document.getElementById('uploadUsageBar').style.width = uPct + '%';
  document.getElementById('uploadUsageBar').className   = 'usage-bar' + (uPct >= 100 ? ' usage-bar-warn' : '');
  document.getElementById('uploadUsageText').textContent = uLimit === -1 ? uUsed + ' (unlimited)' : uUsed + ' / ' + uLimit;

  // Activated info
  const activatedEl = document.getElementById('licActivatedInfo');
  if (d.key && d.activatedAt) {
    activatedEl.style.display = '';
    activatedEl.textContent   = 'Key: ' + d.key + (d.offline ? ' (offline mode)' : '') +
      ' · Activated: ' + new Date(d.activatedAt).toLocaleDateString();
  } else {
    activatedEl.style.display = 'none';
  }

  // Pricing plans (only for free tier)
  document.getElementById('licensePlans').style.display = d.tier === 'free' ? '' : 'none';

  // Always show all plan cards; swap button text/action when Stripe URL not configured
  ['planProMonthly', 'planProAnnual', 'planLifetime'].forEach(id => {
    const card = document.getElementById(id);
    if (!card) return;
    card.style.display = '';
    const btn = card.querySelector('.plan-btn, .plan-btn-featured');
    if (!btn) return;
    const planKey = id === 'planProMonthly' ? 'proMonthly' : id === 'planProAnnual' ? 'proAnnual' : 'lifetime';
    const url = d[planKey === 'proMonthly' ? 'stripeProMonthlyUrl' : planKey === 'proAnnual' ? 'stripeProAnnualUrl' : 'stripeLifetimeUrl'];
    if (url) {
      btn.onclick = () => openStripeCheckout(planKey);
      btn.textContent = btn.dataset.label || btn.textContent;
    } else {
      btn.onclick = () => {
        window.location.href = 'mailto:sales@xyz.com?subject=Knowledge%20Hub%20License%20Request&body=Hi%2C%20I%27m%20interested%20in%20the%20' + planKey + '%20plan.';
      };
      if (!btn.dataset.label) btn.dataset.label = btn.textContent;
      btn.textContent = 'Request Access';
    }
  });

  // Deactivate button (shown when licensed)
  document.getElementById('licenseDeactivate').style.display = d.key ? '' : 'none';
}

function openStripeCheckout(plan) {
  if (!_licenseData) return;
  const urls = {
    proMonthly: _licenseData.stripeProMonthlyUrl,
    proAnnual:  _licenseData.stripeProAnnualUrl,
    lifetime:   _licenseData.stripeLifetimeUrl,
  };
  const url = urls[plan];
  if (!url) { alert('Payment link not configured. Contact the administrator.'); return; }
  window.open(url, '_blank');
}

async function activateLicenseKey() {
  const key    = (document.getElementById('licenseKeyInput').value || '').trim();
  const resEl  = document.getElementById('activateResult');
  const btn    = document.querySelector('.activate-btn');
  if (!key) { showActivateResult('error', 'Enter a license key.'); return; }

  btn.disabled = true;
  btn.textContent = 'Activating…';
  resEl.style.display = 'none';

  try {
    const r = await fetch('/api/license/activate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ key }),
    });
    const d = await r.json();
    if (d.error) {
      showActivateResult('error', d.error);
    } else {
      showActivateResult('success', '✓ Activated ' + d.tierName + ' plan!');
      await loadLicenseStatus();
      renderLicenseModal();
    }
  } catch (err) {
    showActivateResult('error', 'Request failed: ' + err.message);
  }

  btn.disabled   = false;
  btn.textContent = 'Activate';
}

async function deactivateLicenseKey() {
  if (!confirm('Remove the license from this machine? You can re-activate it at any time.')) return;
  await fetch('/api/license', { method: 'DELETE' });
  await loadLicenseStatus();
  renderLicenseModal();
}

function showActivateResult(type, msg) {
  const el = document.getElementById('activateResult');
  el.className     = 'activate-result activate-result-' + type;
  el.textContent   = msg;
  el.style.display = '';
}

// Call on page load (after loadStats)
loadLicenseStatus();
