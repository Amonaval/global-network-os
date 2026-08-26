import * as vscode from 'vscode';
import * as https from 'https';
import * as http from 'http';

const REQUEST_TIMEOUT_MS = 120_000; // 2 minutes — local Ollama on CPU can be slow

export function activate(context: vscode.ExtensionContext) {
  const provider = new KnowledgeHubViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('knowledgehub.chat', provider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('knowledgehub.openChat', () => {
      vscode.commands.executeCommand('knowledgehub.chat.focus');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('knowledgehub.askSelection', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { return; }
      const selected = editor.document.getText(editor.selection).trim();
      if (!selected) { return; }
      provider.sendQuestion(selected);
      vscode.commands.executeCommand('knowledgehub.chat.focus');
    })
  );
}

export function deactivate() {}

class KnowledgeHubViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _sessionId: string = 'vscode-' + Date.now().toString(36);

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this._getHtml();

    webviewView.webview.onDidReceiveMessage(msg => {
      if (msg.type === 'ask') {
        this._handleAsk(msg.question);
      } else if (msg.type === 'openSettings') {
        vscode.commands.executeCommand('workbench.action.openSettings', 'knowledgehub.serverUrl');
      }
    });
  }

  sendQuestion(question: string) {
    if (this._view) {
      this._view.webview.postMessage({ type: 'prefill', question });
      this._handleAsk(question);
    }
  }

  private async _handleAsk(question: string) {
    if (!question.trim()) { return; }

    const config = vscode.workspace.getConfiguration('knowledgehub');
    const serverUrl: string = config.get('serverUrl', 'http://localhost:3000');
    const section: string = config.get('defaultSection', '');

    this._view?.webview.postMessage({ type: 'thinking' });

    try {
      const answer = await this._postChat(serverUrl, question, section);
      this._view?.webview.postMessage({ type: 'answer', question, answer });
    } catch (err: any) {
      const isTimeout = err.message?.includes('timed out');
      const isRefused = err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED');
      this._view?.webview.postMessage({
        type: 'error',
        errorKind: isTimeout ? 'timeout' : isRefused ? 'refused' : 'unknown',
        message: err.message || 'Unknown error',
        serverUrl,
      });
    }
  }

  private _postChat(serverUrl: string, question: string, section: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        question,
        sessionId: this._sessionId,
        ...(section ? { section } : {}),
      });

      const url = new URL('/api/chat', serverUrl);
      const isHttps = url.protocol === 'https:';
      const transport = isHttps ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const req = transport.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            try {
              const parsed = JSON.parse(data);
              reject(new Error(parsed.error || `Server error ${res.statusCode}`));
            } catch {
              reject(new Error(`Server error ${res.statusCode}`));
            }
            return;
          }
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.answer || '(no answer returned)');
          } catch {
            reject(new Error('Invalid response from server'));
          }
        });
      });

      req.on('error', (e) => reject(e));
      req.setTimeout(REQUEST_TIMEOUT_MS, () => {
        req.destroy(new Error(`Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`));
      });
      req.write(body);
      req.end();
    });
  }

  private _getHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    color: var(--vscode-foreground);
    background: var(--vscode-sideBar-background, var(--vscode-editor-background));
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  #messages {
    flex: 1;
    overflow-y: auto;
    padding: 12px 12px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .welcome {
    text-align: center;
    padding: 24px 8px;
    opacity: .7;
  }
  .welcome-icon { font-size: 28px; margin-bottom: 8px; }
  .welcome-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
  .welcome-sub { font-size: 11px; opacity: .7; }

  .msg { display: flex; flex-direction: column; gap: 3px; }
  .msg-q {
    font-size: 12px;
    font-weight: 600;
    color: var(--vscode-descriptionForeground);
    word-break: break-word;
  }
  .msg-a {
    font-size: 12px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    background: var(--vscode-editor-inactiveSelectionBackground, rgba(255,255,255,.05));
    border-radius: 6px;
    padding: 8px 10px;
  }
  .msg-error {
    font-size: 12px;
    color: var(--vscode-errorForeground);
    background: var(--vscode-inputValidation-errorBackground, rgba(200,0,0,.1));
    border-radius: 6px;
    padding: 8px 10px;
    line-height: 1.6;
  }
  .msg-error a {
    color: var(--vscode-textLink-foreground);
    cursor: pointer;
    text-decoration: underline;
  }
  .msg-warn {
    font-size: 12px;
    color: var(--vscode-editorWarning-foreground, #e3b341);
    background: rgba(227,179,65,.08);
    border-radius: 6px;
    padding: 8px 10px;
    line-height: 1.6;
  }

  .thinking {
    font-size: 11px;
    opacity: .65;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 0;
  }
  .thinking-timer {
    margin-left: 2px;
    font-variant-numeric: tabular-nums;
    opacity: .7;
  }
  .dot-spin {
    width: 8px; height: 8px;
    flex-shrink: 0;
    border-radius: 50%;
    border: 1.5px solid currentColor;
    border-top-color: transparent;
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  #inputArea {
    padding: 10px 12px 12px;
    border-top: 1px solid var(--vscode-widget-border, rgba(255,255,255,.1));
  }
  #inputWrap {
    display: flex;
    gap: 6px;
    align-items: flex-end;
  }
  #questionInput {
    flex: 1;
    min-height: 60px;
    max-height: 120px;
    resize: none;
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, transparent);
    border-radius: 6px;
    padding: 6px 8px;
    font-family: inherit;
    font-size: 12px;
    line-height: 1.5;
    outline: none;
  }
  #questionInput:focus { border-color: var(--vscode-focusBorder); }
  #sendBtn {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 6px;
    padding: 7px 10px;
    cursor: pointer;
    font-size: 14px;
    align-self: flex-end;
    height: 32px;
    white-space: nowrap;
  }
  #sendBtn:hover { background: var(--vscode-button-hoverBackground); }
  #sendBtn:disabled { opacity: .5; cursor: not-allowed; }
  .hint { font-size: 10px; opacity: .5; margin-top: 5px; text-align: center; }
</style>
</head>
<body>
<div id="messages">
  <div class="welcome" id="welcome">
    <div class="welcome-icon">📚</div>
    <div class="welcome-title">Knowledge Hub</div>
    <div class="welcome-sub">Ask anything about your docs.<br>Powered by your local intelligence store.</div>
  </div>
</div>
<div id="inputArea">
  <div id="inputWrap">
    <textarea id="questionInput" placeholder="Ask a question…" rows="3"></textarea>
    <button id="sendBtn">Ask</button>
  </div>
  <div class="hint">Enter to send · Shift+Enter for new line</div>
</div>

<script>
  const vscode = acquireVsCodeApi();
  const messagesEl = document.getElementById('messages');
  const input = document.getElementById('questionInput');
  const sendBtn = document.getElementById('sendBtn');
  const welcomeEl = document.getElementById('welcome');
  let thinking = null;
  let timerInterval = null;

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function removeThinking() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    if (thinking && thinking.parentNode) { thinking.parentNode.removeChild(thinking); }
    thinking = null;
  }

  function send() {
    const q = input.value.trim();
    if (!q || sendBtn.disabled) { return; }
    if (welcomeEl) { welcomeEl.style.display = 'none'; }
    input.value = '';
    input.style.height = '';
    sendBtn.disabled = true;
    vscode.postMessage({ type: 'ask', question: q });
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  input.addEventListener('input', () => {
    input.style.height = '';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });
  sendBtn.addEventListener('click', send);

  window.addEventListener('message', event => {
    const msg = event.data;

    if (msg.type === 'thinking') {
      removeThinking();
      thinking = document.createElement('div');
      thinking.className = 'thinking';
      const timerEl = document.createElement('span');
      timerEl.className = 'thinking-timer';
      timerEl.textContent = '0s';
      thinking.innerHTML = '<div class="dot-spin"></div>Thinking… ';
      thinking.appendChild(timerEl);
      messagesEl.appendChild(thinking);
      scrollToBottom();

      let elapsed = 0;
      timerInterval = setInterval(() => {
        elapsed++;
        timerEl.textContent = elapsed + 's';
        // nudge user after 15s so they know it's not frozen
        if (elapsed === 15) {
          timerEl.textContent = elapsed + 's (Ollama is working…)';
        }
      }, 1000);

    } else if (msg.type === 'answer') {
      removeThinking();
      sendBtn.disabled = false;
      const div = document.createElement('div');
      div.className = 'msg';
      div.innerHTML =
        '<div class="msg-q">' + escHtml(msg.question) + '</div>' +
        '<div class="msg-a">' + escHtml(msg.answer) + '</div>';
      messagesEl.appendChild(div);
      scrollToBottom();

    } else if (msg.type === 'error') {
      removeThinking();
      sendBtn.disabled = false;
      const div = document.createElement('div');

      if (msg.errorKind === 'timeout') {
        div.className = 'msg-warn';
        div.innerHTML =
          'Ollama took too long to respond (>120s).<br>' +
          'Try a shorter question, or check that Ollama has a model loaded: ' +
          '<code>ollama list</code>';
      } else if (msg.errorKind === 'refused') {
        div.className = 'msg-error';
        div.innerHTML =
          'Knowledge Hub server is not running at <strong>' + escHtml(msg.serverUrl) + '</strong>.<br>' +
          'Start it with <code>node src/api/server.js</code>, or ' +
          '<a onclick="openSettings()">change the server URL</a>.';
      } else {
        div.className = 'msg-error';
        div.innerHTML =
          'Error: ' + escHtml(msg.message) + '<br>' +
          '<a onclick="openSettings()">Check server URL</a>';
      }

      messagesEl.appendChild(div);
      scrollToBottom();

    } else if (msg.type === 'prefill') {
      if (welcomeEl) { welcomeEl.style.display = 'none'; }
      input.value = msg.question;
    }
  });

  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function openSettings() {
    vscode.postMessage({ type: 'openSettings' });
  }
</script>
</body>
</html>`;
  }
}
