import { useState } from 'react'
import { useWizardStore } from '../../store/wizardStore'
import { readStream } from '../../hooks/useStream'

export function Step3Auth() {
  const { form, setField, setStep, setPreloginDone, preloginDone } = useWizardStore()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [preloginLog, setPreloginLog] = useState('')
  const [preloginRunning, setPreloginRunning] = useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (form.authType === 'form' || form.authType === 'microsoft') {
      if (!form.authEmail) errs.authEmail = 'Email is required'
      if (!form.authPassword) errs.authPassword = 'Password is required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => { if (validate()) setStep(4) }

  const startPrelogin = async () => {
    if (!form.portalUrl) { alert('Please enter the Portal Base URL in Step 2 first, then return here.'); return }
    setPreloginLog('')
    setPreloginRunning(true)
    setPreloginDone(false)

    const appendLog = (msg: string) => setPreloginLog(prev => prev + msg + '\n')

    try {
      const res = await fetch('/api/setup/prelogin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portal: { baseUrl: form.portalUrl, contentSelector: form.contentSelector || '#main-content' } }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(err.error || 'Pre-login failed')
      }
      await readStream(res, {
        onLog: msg => appendLog(msg),
        onPhase: msg => appendLog(msg),
        onDone: msg => { setPreloginDone(true); appendLog('✓ ' + msg) },
        onError: msg => appendLog('ERROR: ' + msg),
      })
    } catch (err) { appendLog('Error: ' + (err as Error).message) }
    setPreloginRunning(false)
  }

  return (
    <div className="wizard-card">
      <div className="card-header">
        <h2>Authentication</h2>
        <p>Does your portal require login?</p>
      </div>

      <div className="form-group">
        <label>Authentication type</label>
        <div className="radio-group">
          {(['none', 'form', 'microsoft', 'browser'] as const).map(type => (
            <label key={type} className="radio-item">
              <input type="radio" name="authType" value={type} checked={form.authType === type} onChange={() => setField('authType', type)} />
              <div className="radio-card">
                <strong>{authLabel(type)}</strong>
                <span>{authDesc(type)}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {(form.authType === 'form' || form.authType === 'microsoft') && (
        <>
          <div className="form-row">
            <div className="form-group">
              <label>Email / Username <span className="required">*</span></label>
              <input type="email" value={form.authEmail} onChange={e => setField('authEmail', e.target.value)} placeholder="you@company.com" autoComplete="off" />
              {errors.authEmail && <span className="error-msg">{errors.authEmail}</span>}
            </div>
            <div className="form-group">
              <label>Password <span className="required">*</span></label>
              <input type="password" value={form.authPassword} onChange={e => setField('authPassword', e.target.value)} placeholder="••••••••" autoComplete="new-password" />
              {errors.authPassword && <span className="error-msg">{errors.authPassword}</span>}
            </div>
          </div>
          <div className="info-box">
            <strong>📌 Privacy note:</strong> Credentials are stored only in your local config file and are never sent to any external service.
          </div>
        </>
      )}

      {form.authType === 'browser' && (
        <div>
          <p className="field-hint" style={{ marginBottom: 12 }}>
            Click below to open a browser window. Log in to your portal, then return here — the wizard detects your session automatically.
          </p>
          <button className="btn-secondary" onClick={startPrelogin} disabled={preloginRunning}>
            {preloginRunning ? 'Opening browser…' : preloginDone ? '✓ Session saved (click to re-login)' : '🌐 Launch Login Browser'}
          </button>
          {preloginLog && (
            <div className="log-panel" style={{ marginTop: 12, maxHeight: 160 }}>
              <pre>{preloginLog}</pre>
            </div>
          )}
          {preloginDone && (
            <div style={{ color: 'var(--green)', fontSize: 13, fontWeight: 600, marginTop: 10 }}>
              ✓ Login session saved — you can continue.
            </div>
          )}
        </div>
      )}

      <div className="card-footer">
        <button className="btn-ghost" onClick={() => setStep(2)}>← Back</button>
        <button className="btn-primary" onClick={next}>Continue →</button>
      </div>
    </div>
  )
}

function authLabel(type: string) {
  return { none: 'None', form: 'Username + Password', microsoft: 'Microsoft 365', browser: 'Open Browser (manual login)' }[type] ?? type
}
function authDesc(type: string) {
  return {
    none: 'Portal is publicly accessible',
    form: 'Standard login form',
    microsoft: 'Azure AD / Microsoft login — enter credentials, browser opens for MFA.',
    browser: 'A browser window opens — you log in yourself. Handles any auth method (SSO, MFA, etc.). No credentials stored.',
  }[type] ?? ''
}
