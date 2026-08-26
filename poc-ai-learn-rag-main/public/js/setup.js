/**
 * Setup Wizard — Knowledge Hub
 * Controls the multi-step configuration UI.
 */

const wizard = (() => {
  let currentStep    = 1;
  let preloginDone   = false;
  let oauthConnected = false;
  let oauthPollTimer = null;
  const TOTAL_STEPS  = 5;

  // ── Navigation ─────────────────────────────────────────────────────────────
  function showStep(n) {
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      const card = document.getElementById('step-' + i);
      if (card) card.classList.toggle('hidden', i !== n);
    }
    // Update step indicator
    document.querySelectorAll('.step-item').forEach(el => {
      const s = parseInt(el.dataset.step);
      el.classList.toggle('active', s === n);
      el.classList.toggle('done', s < n);
    });
    currentStep = n;
    window.scrollTo(0, 0);
  }

  function next() {
    if (!validate(currentStep)) return;
    if (currentStep === TOTAL_STEPS) return;
    if (currentStep === 4) buildSummary();
    let n = currentStep + 1;
    // Step 3 (crawler auth) is only for web portal — skip it for Confluence and URL mode
    const src = getSourceType();
    if (n === 3 && (src === 'confluence' || src === 'url')) n = 4;
    showStep(n);
  }

  function prev() {
    if (currentStep <= 1) return;
    let p = currentStep - 1;
    // Skip step 3 going backwards when source is Confluence or URL
    const src = getSourceType();
    if (p === 3 && (src === 'confluence' || src === 'url')) p = 2;
    showStep(p);
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(step) {
    clearErrors();
    if (step === 2) {
      const src = getSourceType();
      if (src === 'confluence') {
        const cUrl = val('confluenceUrl');
        if (!cUrl)                  { showError('confluenceUrl', 'Confluence URL is required'); return false; }
        if (!cUrl.startsWith('http')) { showError('confluenceUrl', 'Must be a full URL starting with http:// or https://'); return false; }
        const cAuth = getConfluenceAuthMethod();
        if (cAuth === 'apitoken') {
          if (!val('confluenceEmail')) { showError('confluenceEmail', 'Email is required'); return false; }
          if (!val('confluenceToken')) { showError('confluenceToken', 'API token is required'); return false; }
        } else if (cAuth === 'oauth') {
          if (!val('confluenceClientId'))     { showError('confluenceClientId', 'Client ID is required'); return false; }
          if (!val('confluenceClientSecret'))  { showError('confluenceClientSecret', 'Client Secret is required'); return false; }
          if (!oauthConnected) { showError('confluenceClientId', 'Please connect with Atlassian first'); return false; }
        }
      } else if (src === 'url') {
        const urls = val('urlList').split('\n').map(u => u.trim()).filter(Boolean);
        if (!urls.length) { showError('urlList', 'Enter at least one URL'); return false; }
        if (urls.some(u => !u.startsWith('http'))) { showError('urlList', 'All URLs must start with http:// or https://'); return false; }
      } else {
        const url      = val('portalUrl');
        const sections = sectionsArray();
        // Upload-only mode: both URL and sections empty is valid
        if (!url && !sections.length) {
          const hint = document.getElementById('urlTestResult');
          if (hint) { hint.textContent = 'Upload-only mode — no portal URL needed. You can add documents via Upload.'; hint.style.color = '#f59e0b'; }
        } else {
          if (url && !url.startsWith('http')) { showError('portalUrl', 'Must be a full URL starting with http:// or https://'); return false; }
          if (sections.length && !url) { showError('portalUrl', 'Portal URL is required when sections are specified'); return false; }
        }
      }
    }
    if (step === 3) {
      const authType = getAuthType();
      if (authType === 'form' || authType === 'microsoft') {
        if (!val('authEmail'))    { showError('authEmail',    'Email is required'); return false; }
        if (!val('authPassword')) { showError('authPassword', 'Password is required'); return false; }
      }
      // 'browser' type: pre-login is recommended but the wizard allows continuing without it
    }
    if (step === 4) {
      const llm = getLlmProvider();
      if (llm === 'claude' && !val('anthropicKey')) {
        showError('anthropicKey', 'API key is required for Claude'); return false;
      }
      if (llm === 'vllm' && !val('vllmUrl')) {
        showError('vllmUrl', 'vLLM server URL is required'); return false;
      }
      const emb = getEmbProvider();
      if (emb === 'openai' && !val('openaiKey')) {
        showError('openaiKey', 'API key is required for OpenAI embeddings'); return false;
      }
    }
    return true;
  }

  function showError(fieldId, msg) {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.classList.add('input-error');
    const hint = el.nextElementSibling;
    const errEl = document.createElement('span');
    errEl.className = 'error-msg';
    errEl.textContent = msg;
    if (hint) el.parentNode.insertBefore(errEl, hint); else el.parentNode.appendChild(errEl);
  }

  function clearErrors() {
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.error-msg').forEach(el => el.remove());
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function val(id) { return (document.getElementById(id) || {}).value?.trim() || ''; }
  function sectionsArray() {
    return val('sectionsInput').split('\n').map(s => s.trim()).filter(Boolean);
  }
  function confluenceSpacesArray() {
    return val('confluenceSpaces').split('\n').map(s => s.trim()).filter(Boolean);
  }
  function getSourceType()           { return (document.querySelector('input[name="sourceType"]:checked') || {}).value || 'portal'; }
  function getConfluenceAuthMethod() { return (document.querySelector('input[name="confluenceAuth"]:checked') || {}).value || 'apitoken'; }
  function getAuthType()             { return (document.querySelector('input[name="authType"]:checked') || {}).value || 'none'; }
  function getLlmProvider()          { return (document.querySelector('input[name="llmProvider"]:checked') || {}).value || 'ollama'; }
  function getEmbProvider()          { return (document.querySelector('input[name="embProvider"]:checked') || {}).value || 'nomic'; }

  function buildConfig() {
    const srcType = getSourceType();
    return {
      app: {
        name: val('appName') || 'Knowledge Hub',
        description: 'Internal documentation assistant',
      },
      source: { type: srcType },
      portal: {
        baseUrl:            val('portalUrl'),
        sections:           sectionsArray(),
        contentSelector:    val('contentSelector') || '#main-content',
        nextButtonSelector: val('nextBtnSelector')  || '.article-next',
      },
      confluence: {
        url:               val('confluenceUrl'),
        spaces:            confluenceSpacesArray(),
        authMethod:        getConfluenceAuthMethod(),
        email:             val('confluenceEmail'),
        apiToken:          val('confluenceToken'),
        oauthClientId:     val('confluenceClientId'),
        oauthClientSecret: val('confluenceClientSecret'),
      },
      auth: {
        type:     getAuthType(),
        email:    val('authEmail'),
        password: val('authPassword'),
      },
      llm: {
        provider:        getLlmProvider(),
        ollamaUrl:       val('ollamaUrl')    || 'http://localhost:11434',
        ollamaModel:     val('ollamaModel')  || 'qwen2.5:3b',
        anthropicApiKey: val('anthropicKey'),
        claudeModel:     'claude-sonnet-4-20250514',
        vllmUrl:         val('vllmUrl')      || 'http://localhost:8000',
        vllmModel:       val('vllmModel'),
      },
      embeddings: {
        provider:     getEmbProvider(),
        nomicModel:   'nomic-embed-text',
        openaiApiKey: val('openaiKey'),
      },
      urlFetch: {
        urls:            val('urlList').split('\n').map(u => u.trim()).filter(Boolean),
        contentSelector: val('urlSelector') || '',
      },
      retrieval: { topK: 6, hybridWeight: 0.5, confidenceGate: 0.22, chunkSize: 400, chunkOverlap: 50 },
      setupComplete: false,
    };
  }

  // ── UI toggle handlers ──────────────────────────────────────────────────────
  function onSourceTypeChange() {
    const src = getSourceType();
    document.getElementById('portalFields').classList.toggle('hidden', src !== 'portal');
    document.getElementById('confluenceFields').classList.toggle('hidden', src !== 'confluence');
    document.getElementById('urlFields').classList.toggle('hidden', src !== 'url');
  }

  function onConfluenceAuthChange() {
    const m = getConfluenceAuthMethod();
    document.getElementById('confluenceApiTokenFields').classList.toggle('hidden', m !== 'apitoken');
    document.getElementById('confluenceOauthFields').classList.toggle('hidden', m !== 'oauth');
  }

  function onAuthTypeChange() {
    const type = getAuthType();
    const needsCreds   = type === 'form' || type === 'microsoft';
    const needsBrowser = type === 'browser';
    document.getElementById('authCredentials').classList.toggle('hidden', !needsCreds);
    document.getElementById('browserPrelogin').classList.toggle('hidden', !needsBrowser);
  }

  function onLlmChange() {
    const p = getLlmProvider();
    document.getElementById('ollamaSettings').classList.toggle('hidden', p !== 'ollama');
    document.getElementById('claudeSettings').classList.toggle('hidden', p !== 'claude');
    document.getElementById('vllmSettings').classList.toggle('hidden', p !== 'vllm');
  }

  function onEmbChange() {
    document.getElementById('openaiSettings').classList.toggle('hidden', getEmbProvider() !== 'openai');
  }

  // ── URL / Ollama tests ──────────────────────────────────────────────────────
  async function testUrl() {
    const url = val('portalUrl');
    if (!url) return;
    const result = document.getElementById('urlTestResult');
    result.textContent = 'Testing…';
    try {
      const r = await fetch('/api/setup/test-url?url=' + encodeURIComponent(url));
      const d = await r.json();
      result.textContent = d.ok ? '✅ Reachable (status ' + d.status + ')' : '❌ ' + (d.error || 'Not reachable');
      result.style.color = d.ok ? 'var(--green)' : 'var(--red)';
    } catch (e) {
      result.textContent = '❌ Error: ' + e.message;
    }
  }

  async function testVllm() {
    const url    = val('vllmUrl') || 'http://localhost:8000';
    const result = document.getElementById('vllmTestResult');
    result.textContent = 'Testing…';
    try {
      const r = await fetch('/api/setup/test-vllm?url=' + encodeURIComponent(url));
      const d = await r.json();
      if (d.ok) {
        result.textContent = '✅ Server reachable' + (d.models && d.models.length ? '. Models: ' + d.models.join(', ') : '');
        result.style.color = 'var(--green)';
      } else {
        result.textContent = '❌ Cannot connect: ' + (d.error || 'Server not running');
        result.style.color = 'var(--red)';
      }
    } catch (e) {
      result.textContent = '❌ ' + e.message;
      result.style.color = 'var(--red)';
    }
  }

  async function testOllama() {
    const url    = val('ollamaUrl') || 'http://localhost:11434';
    const result = document.getElementById('ollamaTestResult');
    result.textContent = 'Testing…';
    try {
      const r = await fetch('/api/setup/test-ollama?url=' + encodeURIComponent(url));
      const d = await r.json();
      if (d.ok) {
        result.textContent = '✅ Ollama running. Models: ' + (d.models.length ? d.models.join(', ') : 'none pulled yet');
        result.style.color = 'var(--green)';
      } else {
        result.textContent = '❌ Cannot connect: ' + (d.error || 'Ollama not running');
        result.style.color = 'var(--red)';
      }
    } catch (e) {
      result.textContent = '❌ ' + e.message;
    }
  }

  async function testConfluence() {
    const url     = val('confluenceUrl');
    const method  = getConfluenceAuthMethod();
    const result  = document.getElementById('confluenceTestResult');
    if (!url) { result.textContent = 'Enter a URL first'; return; }
    result.textContent = 'Testing…';
    result.style.color = '';
    try {
      const r = await fetch('/api/confluence/test', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          url,
          authMethod:   method,
          email:        val('confluenceEmail'),
          apiToken:     val('confluenceToken'),
          accessToken:  '',
          cloudId:      '',
        }),
      });
      const d = await r.json();
      if (d.ok) {
        result.textContent = '✅ Connected!';
        result.style.color = 'var(--green)';
      } else {
        result.textContent = '❌ ' + (d.error || 'Could not connect');
        result.style.color = 'var(--red)';
      }
    } catch (e) {
      result.textContent = '❌ ' + e.message;
      result.style.color = 'var(--red)';
    }
  }

  async function startConfluenceOAuth() {
    const clientId     = val('confluenceClientId');
    const clientSecret = val('confluenceClientSecret');
    if (!clientId || !clientSecret) {
      alert('Enter Client ID and Client Secret first.');
      return;
    }
    const btn      = document.getElementById('oauthConnectBtn');
    const statusEl = document.getElementById('oauthStatus');
    btn.disabled   = true;
    btn.textContent = 'Connecting…';
    statusEl.className = 'hidden';
    oauthConnected = false;

    try {
      const r = await fetch('/api/confluence/oauth/start', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ clientId, clientSecret }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Could not start OAuth');

      // Open auth URL in a new window
      window.open(d.authUrl, '_blank', 'width=600,height=700');

      statusEl.className = '';
      statusEl.style.color = 'var(--text-s)';
      statusEl.textContent = '⏳ Waiting for Atlassian authorization…';

      // Poll for completion
      const state = d.state;
      if (oauthPollTimer) clearInterval(oauthPollTimer);
      oauthPollTimer = setInterval(async () => {
        try {
          const pr = await fetch('/api/confluence/oauth/status?state=' + encodeURIComponent(state));
          const pd = await pr.json();
          if (pd.done) {
            clearInterval(oauthPollTimer);
            oauthPollTimer = null;
            if (pd.error) {
              statusEl.textContent = '❌ ' + pd.error;
              statusEl.style.color = 'var(--red)';
              btn.disabled   = false;
              btn.textContent = '🔗 Connect with Atlassian';
            } else {
              oauthConnected = true;
              statusEl.textContent = '✅ Connected to: ' + (pd.cloudName || pd.cloudId);
              statusEl.style.color = 'var(--green)';
              btn.textContent = '✓ Re-connect';
              btn.disabled = false;
            }
          }
        } catch (_) {}
      }, 2000);

    } catch (err) {
      statusEl.className = '';
      statusEl.textContent = '❌ ' + err.message;
      statusEl.style.color = 'var(--red)';
      btn.disabled   = false;
      btn.textContent = '🔗 Connect with Atlassian';
    }
  }

  // ── Summary (Step 5) ────────────────────────────────────────────────────────
  function buildSummary() {
    const cfg = buildConfig();
    const grid = document.getElementById('summaryGrid');
    function row(label, value) {
      return '<div class="summary-row"><span class="summary-label">' + label + '</span><span class="summary-value">' + escHtml(String(value)) + '</span></div>';
    }
    let llmLabel;
    if (cfg.llm.provider === 'ollama')      llmLabel = 'Ollama (' + cfg.llm.ollamaModel + ')';
    else if (cfg.llm.provider === 'claude') llmLabel = 'Claude API';
    else if (cfg.llm.provider === 'vllm')  llmLabel = 'vLLM @ ' + cfg.llm.vllmUrl + (cfg.llm.vllmModel ? ' (' + cfg.llm.vllmModel + ')' : '');
    else                                    llmLabel = cfg.llm.provider;

    const srcType = cfg.source && cfg.source.type;
    let sourceRows;
    if (srcType === 'confluence') {
      const spaces = (cfg.confluence.spaces || []).join(', ') || 'all spaces';
      sourceRows =
        row('Source',     'Confluence') +
        row('URL',        cfg.confluence.url) +
        row('Spaces',     spaces) +
        row('Auth',       cfg.confluence.authMethod === 'oauth' ? 'OAuth 2.0' : 'API Token');
    } else if (srcType === 'url') {
      const urls = (cfg.urlFetch.urls || []);
      sourceRows =
        row('Source',    '🌐 Web Page / URL') +
        row('Pages',     urls.length + ' URL' + (urls.length !== 1 ? 's' : '')) +
        row('First URL', urls[0] || '—') +
        row('Selector',  cfg.urlFetch.contentSelector || 'auto-detect');
    } else {
      sourceRows =
        row('Source',    'Web Portal (crawl)') +
        row('Portal URL', cfg.portal.baseUrl) +
        row('Sections',   cfg.portal.sections.join(', ') || '—') +
        row('Auth',       cfg.auth.type);
    }

    grid.innerHTML =
      row('App name',   cfg.app.name) +
      sourceRows +
      row('LLM',        llmLabel) +
      row('Embeddings', cfg.embeddings.provider);
  }

  // ── Pre-login (browser auth type) ──────────────────────────────────────────
  async function startPrelogin() {
    const portalUrl  = val('portalUrl');
    const contentSel = val('contentSelector') || '#main-content';

    if (!portalUrl) {
      alert('Please enter the Portal Base URL in Step 2 first, then return here.');
      return;
    }

    const btn       = document.getElementById('preloginBtn');
    const logPanel  = document.getElementById('preloginLog');
    const logOutput = document.getElementById('preloginOutput');
    const doneEl    = document.getElementById('preloginDone');

    btn.disabled = true;
    btn.textContent = 'Opening browser…';
    logPanel.classList.remove('hidden');
    logOutput.textContent = '';
    doneEl.classList.add('hidden');
    preloginDone = false;

    function appendLog(msg) {
      logOutput.textContent += msg + '\n';
      logPanel.scrollTop = logPanel.scrollHeight;
    }

    try {
      const response = await fetch('/api/setup/prelogin', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ portal: { baseUrl: portalUrl, contentSelector: contentSel } }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'HTTP ' + response.status }));
        throw new Error(err.error || 'Pre-login request failed');
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
            if (evt.type === 'log' || evt.type === 'phase') {
              appendLog(evt.message);
            } else if (evt.type === 'done') {
              preloginDone = true;
              doneEl.classList.remove('hidden');
              appendLog('✓ ' + evt.message);
            } else if (evt.type === 'error') {
              appendLog('ERROR: ' + evt.message);
            }
          } catch (_) {}
        }
      }
    } catch (err) {
      appendLog('Error: ' + err.message);
    }

    btn.disabled = false;
    btn.textContent = preloginDone
      ? '✓ Session saved (click to re-login)'
      : '🌐 Launch Login Browser';
  }

  // ── Build ───────────────────────────────────────────────────────────────────
  async function startBuild() {
    if (!validate(4)) { showStep(4); return; }

    const cfg = buildConfig();

    // Cancel any lingering server-side job before starting a new one
    try { await fetch('/api/setup/cancel', { method: 'POST' }); } catch (_) {}

    document.getElementById('buildBtn').style.display    = 'none';
    document.getElementById('buildProgress').classList.remove('hidden');
    document.getElementById('buildError').classList.add('hidden');
    document.getElementById('buildDone').classList.add('hidden');
    document.getElementById('backFromBuild').style.display = 'none';

    const logOutput  = document.getElementById('logOutput');
    const buildPhase = document.getElementById('buildPhase');
    logOutput.textContent = '';

    function appendLog(msg) {
      logOutput.textContent += msg + '\n';
      logOutput.parentElement.scrollTop = logOutput.parentElement.scrollHeight;
    }

    try {
      const response = await fetch('/api/setup/build', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(cfg),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'HTTP ' + response.status }));
        throw new Error(err.error || 'Build request failed');
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
              buildPhase.textContent = evt.message;
              appendLog('\n' + evt.message);
            } else if (evt.type === 'log') {
              appendLog(evt.message);
            } else if (evt.type === 'done') {
              onBuildDone(evt.message, cfg.app.name);
              return;
            } else if (evt.type === 'error') {
              onBuildError(evt.message);
              return;
            }
          } catch (_) {}
        }
      }

      // Stream ended without an explicit done event — check if it actually succeeded
      onBuildDone('Build complete.', cfg.app.name);

    } catch (err) {
      onBuildError(err.message);
    }
  }

  function onBuildDone(message, appName) {
    document.getElementById('buildProgress').classList.add('hidden');
    document.getElementById('buildDone').classList.remove('hidden');
    document.getElementById('successTitle').textContent = (appName || 'Knowledge Hub') + ' is ready!';
    document.getElementById('successDetail').textContent = message;
    document.getElementById('backFromBuild').style.display = 'none';
  }

  function onBuildError(message) {
    document.getElementById('buildProgress').classList.add('hidden');
    document.getElementById('buildError').classList.remove('hidden');
    document.getElementById('errorDetail').textContent = message;
    document.getElementById('backFromBuild').style.display = 'flex';
  }

  async function retryBuild() {
    // Cancel any lingering server-side job before showing the Start button again
    try { await fetch('/api/setup/cancel', { method: 'POST' }); } catch (_) {}
    document.getElementById('buildBtn').style.display      = '';
    document.getElementById('buildError').classList.add('hidden');
    document.getElementById('buildDone').classList.add('hidden');
    document.getElementById('buildProgress').classList.add('hidden');
    document.getElementById('backFromBuild').style.display = 'flex';
  }

  // ── Utilities ───────────────────────────────────────────────────────────────
  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Init ────────────────────────────────────────────────────────────────────
  // Set the OAuth callback URL hint to match the current server origin
  const cbHint = document.getElementById('oauthCallbackHint');
  if (cbHint) cbHint.textContent = window.location.origin + '/api/confluence/oauth/callback';

  showStep(1);

  return { next, prev, onSourceTypeChange, onConfluenceAuthChange, onAuthTypeChange, onLlmChange, onEmbChange,
    testUrl, testConfluence, testOllama, testVllm, startConfluenceOAuth, startBuild, retryBuild, startPrelogin };
})();
