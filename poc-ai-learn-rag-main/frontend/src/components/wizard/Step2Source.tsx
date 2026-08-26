import { useState } from 'react'
import { useWizardStore } from '../../store/wizardStore'
import { searchDiscover, type DiscoverResult } from '../../hooks/useApi'

function sanitizeGroupName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}

export function Step2Source() {
  const { form, setField, setStep, setOauthConnected, setUrlGroup, addUrlGroup, removeUrlGroup } = useWizardStore()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [urlTest, setUrlTest] = useState('')
  const [confluenceTest, setConfluenceTest] = useState('')
  const [oauthStatus, setOauthStatus] = useState('')
  const [oauthPollTimer, setOauthPollTimer] = useState<ReturnType<typeof setInterval> | null>(null)

  // Search-driven discovery state (keyed by group index)
  const [discoverOpen, setDiscoverOpen] = useState<Record<number, boolean>>({})
  const [discoverQuery, setDiscoverQuery] = useState<Record<number, string>>({})
  const [discoverResults, setDiscoverResults] = useState<Record<number, DiscoverResult[]>>({})
  const [discoverSelected, setDiscoverSelected] = useState<Record<number, Set<string>>>({})
  const [discoverLoading, setDiscoverLoading] = useState<Record<number, boolean>>({})
  const [discoverError, setDiscoverError] = useState<Record<number, string>>({})

  const toggleDiscover = (idx: number) =>
    setDiscoverOpen(prev => ({ ...prev, [idx]: !prev[idx] }))

  const runDiscover = async (idx: number) => {
    const query = discoverQuery[idx] || ''
    if (!query.trim()) return
    setDiscoverLoading(prev => ({ ...prev, [idx]: true }))
    setDiscoverError(prev => ({ ...prev, [idx]: '' }))
    setDiscoverResults(prev => ({ ...prev, [idx]: [] }))
    setDiscoverSelected(prev => ({ ...prev, [idx]: new Set() }))
    const { results, error } = await searchDiscover(query)
    setDiscoverLoading(prev => ({ ...prev, [idx]: false }))
    setDiscoverResults(prev => ({ ...prev, [idx]: results }))
    if (error && !results.length) setDiscoverError(prev => ({ ...prev, [idx]: error }))
  }

  const toggleDiscoverUrl = (idx: number, url: string) => {
    setDiscoverSelected(prev => {
      const next = new Set(prev[idx] || [])
      next.has(url) ? next.delete(url) : next.add(url)
      return { ...prev, [idx]: next }
    })
  }

  const addDiscoveredUrls = (idx: number) => {
    const selected = discoverSelected[idx] || new Set<string>()
    if (!selected.size) return
    const existing = new Set(
      (form.urlGroups[idx]?.urls || '').split('\n').map(u => u.trim()).filter(Boolean)
    )
    const toAdd = [...selected].filter(u => !existing.has(u))
    if (!toAdd.length) return
    const current = form.urlGroups[idx]?.urls || ''
    const newUrls = current.trim() ? current.trimEnd() + '\n' + toAdd.join('\n') : toAdd.join('\n')
    setUrlGroup(idx, 'urls', newUrls)
    setDiscoverOpen(prev => ({ ...prev, [idx]: false }))
    setDiscoverSelected(prev => ({ ...prev, [idx]: new Set() }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (form.sourceType === 'confluence') {
      if (!form.confluenceUrl) errs.confluenceUrl = 'Confluence URL is required'
      else if (!form.confluenceUrl.startsWith('http')) errs.confluenceUrl = 'Must start with http:// or https://'
      if (form.confluenceAuthMethod === 'apitoken') {
        if (!form.confluenceEmail) errs.confluenceEmail = 'Email is required'
        if (!form.confluenceToken) errs.confluenceToken = 'API token is required'
      } else {
        if (!form.confluenceClientId) errs.confluenceClientId = 'Client ID is required'
        if (!form.confluenceClientSecret) errs.confluenceClientSecret = 'Client Secret is required'
        if (!useWizardStore.getState().oauthConnected) errs.confluenceClientId = 'Please connect with Atlassian first'
      }
    } else if (form.sourceType === 'url') {
      const seenNames = new Set<string>()
      let hasAnyUrl = false
      form.urlGroups.forEach((group, idx) => {
        const urls = group.urls.split('\n').map(u => u.trim()).filter(Boolean)
        if (urls.length > 0) hasAnyUrl = true
        if (urls.some(u => !u.startsWith('http'))) errs[`groupUrls_${idx}`] = 'All URLs must start with http:// or https://'
        const slug = sanitizeGroupName(group.name) || (idx === 0 ? 'web-pages' : `group-${idx}`)
        if (seenNames.has(slug)) errs[`groupName_${idx}`] = `Duplicate section name "${slug}" — each group must be unique`
        else seenNames.add(slug)
      })
      if (!hasAnyUrl) errs.urlGroups = 'Enter at least one URL across all sections'
    } else {
      const hasUrl = !!form.portalUrl
      const hasSections = form.sections.trim().length > 0
      if (hasUrl && !form.portalUrl.startsWith('http')) errs.portalUrl = 'Must start with http:// or https://'
      if (hasSections && !hasUrl) errs.portalUrl = 'Portal URL is required when sections are specified'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => {
    if (!validate()) return
    // Skip step 3 (auth) for Confluence and URL mode — public pages need no login
    setStep(form.sourceType === 'confluence' || form.sourceType === 'url' ? 4 : 3)
  }

  const testUrl = async () => {
    if (!form.portalUrl) return
    setUrlTest('Testing…')
    try {
      const r = await fetch('/api/setup/test-url?url=' + encodeURIComponent(form.portalUrl))
      const d = await r.json()
      setUrlTest(d.ok ? `✅ Reachable (status ${d.status})` : `❌ ${d.error || 'Not reachable'}`)
    } catch (e) { setUrlTest(`❌ ${(e as Error).message}`) }
  }

  const testConfluence = async () => {
    if (!form.confluenceUrl) { setConfluenceTest('Enter a URL first'); return }
    setConfluenceTest('Testing…')
    try {
      const r = await fetch('/api/confluence/test', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: form.confluenceUrl, authMethod: form.confluenceAuthMethod, email: form.confluenceEmail, apiToken: form.confluenceToken, accessToken: '', cloudId: '' }),
      })
      const d = await r.json()
      setConfluenceTest(d.ok ? '✅ Connected!' : `❌ ${d.error || 'Could not connect'}`)
    } catch (e) { setConfluenceTest(`❌ ${(e as Error).message}`) }
  }

  const startOAuth = async () => {
    if (!form.confluenceClientId || !form.confluenceClientSecret) { alert('Enter Client ID and Client Secret first.'); return }
    setOauthStatus('⏳ Waiting for Atlassian authorization…')
    if (oauthPollTimer) clearInterval(oauthPollTimer)
    try {
      const r = await fetch('/api/confluence/oauth/start', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: form.confluenceClientId, clientSecret: form.confluenceClientSecret }),
      })
      const d = await r.json()
      if (!d.ok) throw new Error(d.error || 'Could not start OAuth')
      window.open(d.authUrl, '_blank', 'width=600,height=700')
      const timer = setInterval(async () => {
        try {
          const pr = await fetch('/api/confluence/oauth/status?state=' + encodeURIComponent(d.state))
          const pd = await pr.json()
          if (pd.done) {
            clearInterval(timer)
            setOauthPollTimer(null)
            if (pd.error) { setOauthStatus(`❌ ${pd.error}`) }
            else { setOauthConnected(pd.cloudName || pd.cloudId); setOauthStatus(`✅ Connected to: ${pd.cloudName || pd.cloudId}`) }
          }
        } catch (_) {}
      }, 2000)
      setOauthPollTimer(timer)
    } catch (err) { setOauthStatus(`❌ ${(err as Error).message}`) }
  }

  const f = (key: keyof typeof form) => form[key] as string

  return (
    <div className="wizard-card">
      <div className="card-header">
        <h2>Knowledge Source</h2>
        <p>Where does your documentation live?</p>
      </div>

      <Field label="Knowledge Hub Name" required>
        <input type="text" value={f('appName')} onChange={e => setField('appName', e.target.value)} placeholder="e.g. Acme Docs AI" />
        <span className="field-hint">Used as the app title in the chat interface.</span>
      </Field>

      <div className="form-group">
        <label>Source type</label>
        <div className="radio-group">
          <RadioCard name="sourceType" value="portal" current={form.sourceType} onChange={v => setField('sourceType', v as 'portal')}>
            <strong>Web Portal (crawl)</strong>
            <span>Crawl any web-based documentation portal automatically.</span>
          </RadioCard>
          <RadioCard name="sourceType" value="confluence" current={form.sourceType} onChange={v => setField('sourceType', v as 'confluence')}>
            <strong>Confluence</strong>
            <span>Connect to Confluence Cloud via API token or OAuth 2.0.</span>
          </RadioCard>
          <RadioCard name="sourceType" value="url" current={form.sourceType} onChange={v => setField('sourceType', v as 'url')}>
            <strong>🌐 Web Page / URL</strong>
            <span>Fetch any public pages — AWS docs, blogs, wikis, any URL. No crawling.</span>
          </RadioCard>
        </div>
      </div>

      {form.sourceType === 'portal' && (
        <>
          <Field label="Portal Base URL" required error={errors.portalUrl}>
            <div className="input-row">
              <input type="url" value={f('portalUrl')} onChange={e => setField('portalUrl', e.target.value)} placeholder="https://docs.example.com/docs" />
              <button className="btn-secondary btn-sm" onClick={testUrl}>Test</button>
            </div>
            {urlTest && <span className="field-hint" style={{ color: urlTest.startsWith('✅') ? 'var(--green)' : 'var(--red)' }}>{urlTest}</span>}
          </Field>
          <Field label="Sections to Crawl" required>
            <textarea rows={4} value={f('sections')} onChange={e => setField('sections', e.target.value)} placeholder={'getting-started\napi-reference\ntutorials'} />
            <span className="field-hint">One section path per line.</span>
          </Field>
          <details className="advanced-section">
            <summary>Advanced: Page selectors</summary>
            <div className="advanced-body">
              <div className="form-row">
                <Field label="Content CSS selector">
                  <input type="text" value={f('contentSelector')} onChange={e => setField('contentSelector', e.target.value)} />
                </Field>
                <Field label="Next-page button selector">
                  <input type="text" value={f('nextBtnSelector')} onChange={e => setField('nextBtnSelector', e.target.value)} />
                </Field>
              </div>
            </div>
          </details>
        </>
      )}

      {form.sourceType === 'url' && (
        <>
          {errors.urlGroups && <div className="error-msg" style={{ marginBottom: 8 }}>{errors.urlGroups}</div>}

          {form.urlGroups.map((group, idx) => (
            <div key={idx} className="url-group-card">
              <div className="url-group-header">
                <Field label="Section Name" error={errors[`groupName_${idx}`]}>
                  <input
                    type="text"
                    value={group.name}
                    onChange={e => setUrlGroup(idx, 'name', e.target.value)}
                    placeholder="e.g. api-docs"
                  />
                  <span className="field-hint">
                    Stored as: <code>{sanitizeGroupName(group.name) || (idx === 0 ? 'web-pages' : `group-${idx}`)}</code>
                  </span>
                </Field>
                {form.urlGroups.length > 1 && (
                  <button className="btn-ghost btn-sm url-group-remove" type="button" onClick={() => removeUrlGroup(idx)}>
                    × Remove
                  </button>
                )}
              </div>
              {/* Discover panel */}
              <div className="discover-panel">
                <button
                  type="button"
                  className="discover-toggle"
                  onClick={() => toggleDiscover(idx)}
                >
                  🔍 Discover from web {discoverOpen[idx] ? '▾' : '▸'}
                </button>

                {discoverOpen[idx] && (
                  <div className="discover-body">
                    <div className="discover-search-row">
                      <input
                        type="text"
                        className="discover-input"
                        value={discoverQuery[idx] || ''}
                        onChange={e => setDiscoverQuery(prev => ({ ...prev, [idx]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && runDiscover(idx)}
                        placeholder="e.g. vector database explained"
                      />
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => runDiscover(idx)}
                        disabled={discoverLoading[idx]}
                      >
                        {discoverLoading[idx] ? '…' : 'Search'}
                      </button>
                    </div>

                    {discoverError[idx] && (
                      <div className="discover-error">{discoverError[idx]}</div>
                    )}

                    {(discoverResults[idx] || []).length === 0 && !discoverLoading[idx] && !discoverError[idx] && (discoverQuery[idx] || '').trim() && (
                      <div className="discover-empty">No results found — try a different query</div>
                    )}

                    {(discoverResults[idx] || []).map(r => (
                      <label key={r.url} className="discover-result">
                        <input
                          type="checkbox"
                          checked={(discoverSelected[idx] || new Set()).has(r.url)}
                          onChange={() => toggleDiscoverUrl(idx, r.url)}
                        />
                        <div className="discover-result-body">
                          <span className="discover-result-title">{r.title}</span>
                          <span className="discover-result-url">{r.url}</span>
                          {r.snippet && <span className="discover-result-snippet">{r.snippet}</span>}
                        </div>
                      </label>
                    ))}

                    {(discoverSelected[idx] || new Set()).size > 0 && (
                      <button type="button" className="btn-primary btn-sm discover-add-btn" onClick={() => addDiscoveredUrls(idx)}>
                        + Add {(discoverSelected[idx] || new Set()).size} selected to this section
                      </button>
                    )}
                  </div>
                )}
              </div>

              <Field label="URLs (one per line)" error={errors[`groupUrls_${idx}`]}>
                <textarea
                  rows={4}
                  value={group.urls}
                  onChange={e => setUrlGroup(idx, 'urls', e.target.value)}
                  placeholder={'https://docs.example.com/api\nhttps://docs.example.com/overview'}
                />
              </Field>
            </div>
          ))}

          {form.urlGroups.length > 1 && <div className="section-divider" />}

          <button className="btn-secondary" type="button" onClick={addUrlGroup}>+ Add Section</button>

          <Field label="Content selector (optional)">
            <input
              type="text"
              value={f('urlSelector')}
              onChange={e => setField('urlSelector', e.target.value)}
              placeholder="e.g. article  or  .content  — leave blank to auto-detect"
            />
            <span className="field-hint">Applied to all sections. Leave blank to automatically detect the main content area.</span>
          </Field>
        </>
      )}

      {form.sourceType === 'confluence' && (
        <>
          <Field label="Confluence URL" required error={errors.confluenceUrl}>
            <div className="input-row">
              <input type="url" value={f('confluenceUrl')} onChange={e => setField('confluenceUrl', e.target.value)} placeholder="https://yourcompany.atlassian.net" />
              <button className="btn-secondary btn-sm" onClick={testConfluence}>Test</button>
            </div>
            {confluenceTest && <span className="field-hint" style={{ color: confluenceTest.startsWith('✅') ? 'var(--green)' : 'var(--red)' }}>{confluenceTest}</span>}
          </Field>
          <Field label="Space Keys to Index">
            <textarea rows={3} value={f('confluenceSpaces')} onChange={e => setField('confluenceSpaces', e.target.value)} placeholder={'ENG\nDOCS\nAPI'} />
            <span className="field-hint">One Space Key per line. Leave blank for all spaces.</span>
          </Field>
          <div className="form-group">
            <label>Authentication method</label>
            <div className="radio-group">
              <RadioCard name="confluenceAuth" value="apitoken" current={form.confluenceAuthMethod} onChange={v => setField('confluenceAuthMethod', v as 'apitoken')}>
                <strong>API Token</strong> <span className="recommended-tag">Recommended</span>
                <span>Email + API token. Works for any user — no admin required.</span>
              </RadioCard>
              <RadioCard name="confluenceAuth" value="oauth" current={form.confluenceAuthMethod} onChange={v => setField('confluenceAuthMethod', v as 'oauth')}>
                <strong>OAuth 2.0</strong><span>Authorize via browser. Requires org-admin approval.</span>
              </RadioCard>
            </div>
          </div>
          {form.confluenceAuthMethod === 'apitoken' && (
            <div className="form-row">
              <Field label="Atlassian email" required error={errors.confluenceEmail}>
                <input type="email" value={f('confluenceEmail')} onChange={e => setField('confluenceEmail', e.target.value)} placeholder="you@company.com" autoComplete="off" />
              </Field>
              <Field label="API Token" required error={errors.confluenceToken}>
                <input type="password" value={f('confluenceToken')} onChange={e => setField('confluenceToken', e.target.value)} placeholder="••••••••••••••••" autoComplete="new-password" />
                <span className="field-hint">Generate at: id.atlassian.net → Security → API tokens</span>
              </Field>
            </div>
          )}
          {form.confluenceAuthMethod === 'oauth' && (
            <>
              <div className="info-box" style={{ marginBottom: 12, borderLeft: '3px solid var(--warn, #f59e0b)' }}>
                <strong>⚠️ Requires org-admin approval:</strong> Atlassian requires an organization
                admin to approve this OAuth app before anyone can connect. If you are not an org admin,
                use <strong>API Token</strong> instead — it works for any user with space access.
              </div>
              <div className="info-box" style={{ marginBottom: 12 }}>
                <strong>📌 One-time setup:</strong> Register an OAuth 2.0 (3LO) app at <code>developer.atlassian.com</code>.
                Callback URL: <code>{window.location.origin}/api/confluence/oauth/callback</code>
              </div>

              <div className="form-row">
                <Field label="Client ID" required error={errors.confluenceClientId}>
                  <input type="text" value={f('confluenceClientId')} onChange={e => setField('confluenceClientId', e.target.value)} autoComplete="off" />
                </Field>
                <Field label="Client Secret" required error={errors.confluenceClientSecret}>
                  <input type="password" value={f('confluenceClientSecret')} onChange={e => setField('confluenceClientSecret', e.target.value)} autoComplete="new-password" />
                </Field>
              </div>
              <button className="btn-secondary" onClick={startOAuth}>🔗 Connect with Atlassian</button>
              {oauthStatus && <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600 }}>{oauthStatus}</div>}
            </>
          )}
        </>
      )}

      <div className="card-footer">
        <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
        <button className="btn-primary" onClick={next}>Continue →</button>
      </div>
    </div>
  )
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="form-group">
      <label>{label}{required && <span className="required"> *</span>}</label>
      {children}
      {error && <span className="error-msg">{error}</span>}
    </div>
  )
}

function RadioCard({ name, value, current, onChange, children }: { name: string; value: string; current: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="radio-item">
      <input type="radio" name={name} value={value} checked={current === value} onChange={() => onChange(value)} />
      <div className="radio-card">{children}</div>
    </label>
  )
}
