import { useState } from 'react'
import { useWizardStore } from '../../store/wizardStore'

export function Step4AI() {
  const { form, setField, setStep } = useWizardStore()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ollamaTest, setOllamaTest] = useState('')
  const [vllmTest, setVllmTest] = useState('')

  const validate = () => {
    const errs: Record<string, string> = {}
    if (form.llmProvider === 'claude' && !form.anthropicKey) errs.anthropicKey = 'API key is required for Claude'
    if (form.llmProvider === 'vllm' && !form.vllmUrl) errs.vllmUrl = 'vLLM server URL is required'
    if (form.embProvider === 'openai' && !form.openaiKey) errs.openaiKey = 'API key is required for OpenAI embeddings'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => { if (validate()) setStep(5) }

  const testOllama = async () => {
    const url = form.ollamaUrl || 'http://localhost:11434'
    setOllamaTest('Testing…')
    try {
      const r = await fetch('/api/setup/test-ollama?url=' + encodeURIComponent(url))
      const d = await r.json()
      setOllamaTest(d.ok
        ? `✅ Ollama running. Models: ${d.models.length ? d.models.join(', ') : 'none pulled yet'}`
        : `❌ Cannot connect: ${d.error || 'Ollama not running'}`)
    } catch (e) { setOllamaTest(`❌ ${(e as Error).message}`) }
  }

  const testVllm = async () => {
    const url = form.vllmUrl || 'http://localhost:8000'
    setVllmTest('Testing…')
    try {
      const r = await fetch('/api/setup/test-vllm?url=' + encodeURIComponent(url))
      const d = await r.json()
      setVllmTest(d.ok
        ? `✅ Server reachable${d.models?.length ? '. Models: ' + d.models.join(', ') : ''}`
        : `❌ Cannot connect: ${d.error || 'Server not running'}`)
    } catch (e) { setVllmTest(`❌ ${(e as Error).message}`) }
  }

  const Radio = ({ name, value, current, onChange, children }: { name: string; value: string; current: string; onChange: (v: string) => void; children: React.ReactNode }) => (
    <label className="radio-item">
      <input type="radio" name={name} value={value} checked={current === value} onChange={() => onChange(value)} />
      <div className="radio-card">{children}</div>
    </label>
  )

  const prevStep = () => { setStep(form.sourceType === 'confluence' ? 2 : 3) }

  return (
    <div className="wizard-card">
      <div className="card-header">
        <h2>AI Settings</h2>
        <p>Choose your language model and embedding engine.</p>
      </div>

      <div className="form-group">
        <label>Language Model (LLM)</label>
        <div className="radio-group">
          <Radio name="llmProvider" value="ollama" current={form.llmProvider} onChange={v => setField('llmProvider', v as 'ollama')}>
            <strong>Ollama — Local</strong><span>Runs entirely on your machine. Free, private, no internet needed.</span>
          </Radio>
          <Radio name="llmProvider" value="claude" current={form.llmProvider} onChange={v => setField('llmProvider', v as 'claude')}>
            <strong>Claude API</strong><span>Best quality answers. Requires an Anthropic API key.</span>
          </Radio>
          <Radio name="llmProvider" value="vllm" current={form.llmProvider} onChange={v => setField('llmProvider', v as 'vllm')}>
            <strong>vLLM / Llama.cpp</strong><span>Local GPU server with OpenAI-compatible API.</span>
          </Radio>
        </div>
      </div>

      {form.llmProvider === 'ollama' && (
        <div className="form-row">
          <div className="form-group">
            <label>Ollama URL</label>
            <div className="input-row">
              <input type="url" value={form.ollamaUrl} onChange={e => setField('ollamaUrl', e.target.value)} />
              <button className="btn-secondary btn-sm" onClick={testOllama}>Test</button>
            </div>
            {ollamaTest && <span className="field-hint" style={{ color: ollamaTest.startsWith('✅') ? 'var(--green)' : 'var(--red)' }}>{ollamaTest}</span>}
          </div>
          <div className="form-group">
            <label>Model name</label>
            <input type="text" value={form.ollamaModel} onChange={e => setField('ollamaModel', e.target.value)} placeholder="qwen2.5:3b" />
            <span className="field-hint">Run <code>ollama pull qwen2.5:3b</code> first.</span>
          </div>
        </div>
      )}

      {form.llmProvider === 'claude' && (
        <div className="form-group">
          <label>Anthropic API Key <span className="required">*</span></label>
          <input type="password" value={form.anthropicKey} onChange={e => setField('anthropicKey', e.target.value)} placeholder="sk-ant-…" autoComplete="new-password" />
          {errors.anthropicKey && <span className="error-msg">{errors.anthropicKey}</span>}
          <span className="field-hint">Get your key at console.anthropic.com</span>
        </div>
      )}

      {form.llmProvider === 'vllm' && (
        <div className="form-row">
          <div className="form-group">
            <label>vLLM / Server URL</label>
            <div className="input-row">
              <input type="url" value={form.vllmUrl} onChange={e => setField('vllmUrl', e.target.value)} />
              <button className="btn-secondary btn-sm" onClick={testVllm}>Test</button>
            </div>
            {vllmTest && <span className="field-hint" style={{ color: vllmTest.startsWith('✅') ? 'var(--green)' : 'var(--red)' }}>{vllmTest}</span>}
            {errors.vllmUrl && <span className="error-msg">{errors.vllmUrl}</span>}
          </div>
          <div className="form-group">
            <label>Model name</label>
            <input type="text" value={form.vllmModel} onChange={e => setField('vllmModel', e.target.value)} placeholder="e.g. mistral-7b-instruct" />
          </div>
        </div>
      )}

      <hr className="section-divider" />

      <div className="form-group">
        <label>Embeddings (for search)</label>
        <div className="radio-group">
          <Radio name="embProvider" value="nomic" current={form.embProvider} onChange={v => setField('embProvider', v as 'nomic')}>
            <strong>Nomic — Local (recommended)</strong><span>768-dim semantic vectors via Ollama. Run: <code>ollama pull nomic-embed-text</code></span>
          </Radio>
          <Radio name="embProvider" value="tfidf" current={form.embProvider} onChange={v => setField('embProvider', v as 'tfidf')}>
            <strong>TF-IDF — No setup</strong><span>Keyword-based search. No extra install, but less precise.</span>
          </Radio>
          <Radio name="embProvider" value="openai" current={form.embProvider} onChange={v => setField('embProvider', v as 'openai')}>
            <strong>OpenAI Embeddings</strong><span>High-quality cloud embeddings. Requires an OpenAI API key.</span>
          </Radio>
        </div>
      </div>

      {form.embProvider === 'openai' && (
        <div className="form-group">
          <label>OpenAI API Key <span className="required">*</span></label>
          <input type="password" value={form.openaiKey} onChange={e => setField('openaiKey', e.target.value)} placeholder="sk-…" autoComplete="new-password" />
          {errors.openaiKey && <span className="error-msg">{errors.openaiKey}</span>}
        </div>
      )}

      <div className="card-footer">
        <button className="btn-ghost" onClick={prevStep}>← Back</button>
        <button className="btn-primary" onClick={next}>Continue →</button>
      </div>
    </div>
  )
}
