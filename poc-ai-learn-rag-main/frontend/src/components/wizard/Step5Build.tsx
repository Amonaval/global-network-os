import { useEffect } from 'react'
import { useWizardStore } from '../../store/wizardStore'
import { readStream } from '../../hooks/useStream'

function buildConfig(form: ReturnType<typeof useWizardStore.getState>['form']) {
  return {
    app: { name: form.appName || 'Knowledge Hub', description: 'Internal documentation assistant' },
    source: { type: form.sourceType },
    portal: {
      baseUrl: form.portalUrl,
      sections: form.sections.split('\n').map(s => s.trim()).filter(Boolean),
      contentSelector: form.contentSelector || '#main-content',
      nextButtonSelector: form.nextBtnSelector || '.article-next',
    },
    confluence: {
      url: form.confluenceUrl,
      spaces: form.confluenceSpaces.split('\n').map(s => s.trim()).filter(Boolean),
      authMethod: form.confluenceAuthMethod,
      email: form.confluenceEmail,
      apiToken: form.confluenceToken,
      oauthClientId: form.confluenceClientId,
      oauthClientSecret: form.confluenceClientSecret,
    },
    auth: { type: form.authType, email: form.authEmail, password: form.authPassword },
    llm: {
      provider: form.llmProvider,
      ollamaUrl: form.ollamaUrl || 'http://localhost:11434',
      ollamaModel: form.ollamaModel || 'qwen2.5:3b',
      anthropicApiKey: form.anthropicKey,
      claudeModel: 'claude-sonnet-4-20250514',
      vllmUrl: form.vllmUrl || 'http://localhost:8000',
      vllmModel: form.vllmModel,
    },
    embeddings: { provider: form.embProvider, nomicModel: 'nomic-embed-text', openaiApiKey: form.openaiKey },
    retrieval: { topK: 6, hybridWeight: 0.5, confidenceGate: 0.22, chunkSize: 400, chunkOverlap: 50 },
    urlFetch: {
      groups: form.urlGroups
        .map((g, idx) => ({
          name: g.name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
               || (idx === 0 ? 'web-pages' : `group-${idx}`),
          urls: g.urls.split('\n').map(u => u.trim()).filter(Boolean),
        }))
        .filter(g => g.urls.length > 0),
      contentSelector: form.urlSelector || '',
    },
    setupComplete: false,
  }
}

function buildSummaryRows(form: ReturnType<typeof useWizardStore.getState>['form']) {
  const llmLabel = form.llmProvider === 'ollama' ? `Ollama (${form.ollamaModel})`
    : form.llmProvider === 'claude' ? 'Claude API'
    : `vLLM @ ${form.vllmUrl}${form.vllmModel ? ` (${form.vllmModel})` : ''}`
  const rows: [string, string][] = [['App name', form.appName]]
  if (form.sourceType === 'confluence') {
    rows.push(['Source', 'Confluence'], ['URL', form.confluenceUrl], ['Auth', form.confluenceAuthMethod === 'oauth' ? 'OAuth 2.0' : 'API Token'])
  } else if (form.sourceType === 'url') {
    const nonEmpty = form.urlGroups.filter(g => g.urls.trim())
    const totalUrls = nonEmpty.reduce((sum, g) => sum + g.urls.split('\n').map(u => u.trim()).filter(Boolean).length, 0)
    const groupSummary = nonEmpty.map((g, idx) => g.name.trim() || (idx === 0 ? 'web-pages' : `group-${idx}`)).join(', ')
    rows.push(['Source', '🌐 Web Page / URL'], ['Sections', `${nonEmpty.length} (${groupSummary})`], ['Total URLs', String(totalUrls)])
  } else {
    rows.push(['Source', 'Web Portal (crawl)'], ['Portal URL', form.portalUrl || '(upload-only)'], ['Sections', form.sections.split('\n').filter(Boolean).join(', ') || '—'], ['Auth', form.authType])
  }
  rows.push(['LLM', llmLabel], ['Embeddings', form.embProvider])
  return rows
}

export function Step5Build() {
  const { form, setStep, buildState, buildLog, buildPhase, errorMessage, successMessage, setBuildState, appendBuildLog, setBuildPhase, setError, setSuccess, resetBuild } = useWizardStore()

  const startBuild = async () => {
    resetBuild()
    setBuildState('building')
    const cfg = buildConfig(form)
    try { await fetch('/api/setup/cancel', { method: 'POST' }) } catch (_) {}

    try {
      const res = await fetch('/api/setup/build', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cfg),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(err.error || 'Build failed')
      }
      await readStream(res, {
        onPhase: msg => { setBuildPhase(msg); appendBuildLog('\n' + msg) },
        onLog: msg => appendBuildLog(msg),
        onDone: msg => setSuccess(msg),
        onError: msg => setError(msg),
      })
      if (useWizardStore.getState().buildState === 'building') setSuccess('Build complete.')
    } catch (err) { setError((err as Error).message) }
  }

  const retryBuild = async () => {
    try { await fetch('/api/setup/cancel', { method: 'POST' }) } catch (_) {}
    resetBuild()
  }

  const summaryRows = buildSummaryRows(form)

  return (
    <div className="wizard-card">
      <div className="card-header">
        <h2>Build Knowledge Base</h2>
        <p>Review your settings and start the build process.</p>
      </div>

      <div className="summary-grid">
        {summaryRows.map(([label, value]) => (
          <div key={label} className="summary-row">
            <span className="summary-label">{label}</span>
            <span className="summary-value">{value}</span>
          </div>
        ))}
      </div>

      {buildState === 'idle' && (
        <div id="buildSection">
          <button className="btn-primary btn-large" onClick={startBuild}>🚀 Start Building</button>
        </div>
      )}

      {buildState === 'building' && (
        <div>
          <div className="build-status">
            <div className="build-phase">{buildPhase}</div>
            <div className="build-spinner" />
          </div>
          <div className="log-panel">
            <pre>{buildLog.join('')}</pre>
          </div>
        </div>
      )}

      {buildState === 'done' && (
        <div className="success-banner">
          <span className="success-icon">✅</span>
          <div>
            <strong>{form.appName || 'Knowledge Hub'} is ready!</strong>
            <div>{successMessage}</div>
          </div>
          <div className="card-footer" style={{ marginTop: 16 }}>
            <div />
            <button className="btn-primary btn-large" onClick={() => { window.location.href = '/' }}>
              Launch Assistant →
            </button>
          </div>
        </div>
      )}

      {buildState === 'error' && (
        <>
          <div className="error-banner">
            <span>❌</span>
            <div>
              <strong>Build failed</strong>
              <div>{errorMessage}</div>
            </div>
          </div>
          <div className="card-footer">
            <button className="btn-ghost" onClick={() => setStep(4)}>← Back</button>
            <button className="btn-primary" onClick={retryBuild}>Retry</button>
          </div>
        </>
      )}

      {buildState === 'idle' && (
        <div className="card-footer">
          <button className="btn-ghost" onClick={() => setStep(4)}>← Back</button>
          <div />
        </div>
      )}
    </div>
  )
}
