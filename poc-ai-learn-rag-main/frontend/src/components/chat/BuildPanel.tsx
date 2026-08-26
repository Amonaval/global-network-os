import { useState, useCallback, useRef } from 'react'
import { readStream } from '../../hooks/useStream'

interface Source {
  section: string
  title: string
  url: string | null
  score: number
}

interface Debug {
  usedChunks: number
  budgetUsed: number
  droppedLow?: number
  droppedDupe?: number
  latencyMs: number
  provider: string
}

interface Props {
  onClose: () => void
}

const LANGUAGES = [
  { value: '', label: 'Auto-detect' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python',     label: 'Python' },
  { value: 'go',         label: 'Go' },
  { value: 'java',       label: 'Java' },
  { value: 'rust',       label: 'Rust' },
  { value: 'sql',        label: 'SQL' },
]

export function BuildPanel({ onClose }: Props) {
  const [spec, setSpec]           = useState('')
  const [language, setLanguage]   = useState('')
  const [codeOnly, setCodeOnly]   = useState(true)
  const [generating, setGenerating] = useState(false)
  const [output, setOutput]       = useState('')
  const [sources, setSources]     = useState<Source[]>([])
  const [debug, setDebug]         = useState<Debug | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const [copied, setCopied]       = useState(false)
  const outputRef = useRef<HTMLPreElement>(null)

  const generate = useCallback(async () => {
    if (!spec.trim() || generating) return
    setGenerating(true)
    setOutput('')
    setSources([])
    setDebug(null)
    setError(null)

    try {
      const res = await fetch('/api/code/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec: spec.trim(), language: language || undefined, codeOnly }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        setError(err.error || 'Generation failed')
        return
      }

      await readStream(res, {
        onToken: token => {
          setOutput(prev => prev + token)
          // Auto-scroll output
          setTimeout(() => {
            if (outputRef.current) {
              outputRef.current.scrollTop = outputRef.current.scrollHeight
            }
          }, 0)
        },
        onDone: raw => {
          try {
            const meta = JSON.parse(raw)
            if (meta.sources) setSources(meta.sources)
            if (meta.debug)   setDebug(meta.debug)
          } catch (_) {}
        },
        onError: raw => {
          try {
            const err = JSON.parse(raw)
            setError(err.error || 'Generation failed')
          } catch (_) {
            setError('Generation failed')
          }
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setGenerating(false)
    }
  }, [spec, language, codeOnly, generating])

  const copyOutput = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [output])

  return (
    <div className="upload-panel" style={{ display: 'block' }}>
      <div className="upload-panel-header">
        <span>⚙️ Build Mode — Code Generation</span>
        <button className="rebuild-close" onClick={onClose}>×</button>
      </div>

      <div className="upload-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Description */}
        <div style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>
          Describe a feature or function. The AI will retrieve relevant code from your uploaded codebase
          and generate matching code that follows your patterns.
          <br />
          <strong>Tip:</strong> Upload your <code>.js</code>, <code>.ts</code>, <code>.py</code> files first via Upload.
        </div>

        {/* Spec input */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            FEATURE SPEC
          </label>
          <textarea
            value={spec}
            onChange={e => setSpec(e.target.value)}
            placeholder={`Describe what you want to build. Be specific.\n\nExamples:\n• Add a new GET /api/tags endpoint that returns all unique tags from the vector store\n• Write a Python function that chunks code files by function boundaries\n• Create a React component for displaying a list of source files with scores`}
            rows={6}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 12px', borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--input-bg)', color: 'var(--text)',
              fontSize: 13, fontFamily: 'inherit', lineHeight: 1.6,
              resize: 'vertical',
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate()
            }}
          />
        </div>

        {/* Language + code-only controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            LANGUAGE HINT
          </label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            style={{
              padding: '6px 10px', borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--input-bg)', color: 'var(--text)',
              fontSize: 13,
            }}
          >
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={codeOnly}
              onChange={e => setCodeOnly(e.target.checked)}
              style={{ accentColor: 'var(--accent)', width: 14, height: 14 }}
            />
            Code files only
          </label>

          <button
            onClick={generate}
            disabled={!spec.trim() || generating}
            style={{
              marginLeft: 'auto',
              padding: '8px 20px', borderRadius: 8,
              background: generating ? 'var(--border)' : 'var(--accent)',
              color: generating ? 'var(--text-muted)' : '#fff',
              border: 'none', cursor: generating ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {generating ? (
              <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Generating…</>
            ) : (
              <>⚙️ Generate Code</>
            )}
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: -10 }}>
          Ctrl+Enter to generate
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 8,
            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)',
            color: 'var(--error, #dc2626)', fontSize: 13,
          }}>
            ❌ {error}
          </div>
        )}

        {/* Output */}
        {(output || generating) && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                GENERATED CODE
              </label>
              {output && (
                <button
                  onClick={copyOutput}
                  style={{
                    padding: '4px 12px', borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'var(--surface)', color: 'var(--text)',
                    cursor: 'pointer', fontSize: 12,
                  }}
                >
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
              )}
            </div>
            <pre
              ref={outputRef}
              style={{
                background: 'var(--code-bg, #1e1e2e)',
                color: 'var(--code-text, #cdd6f4)',
                padding: '14px 16px', borderRadius: 8,
                fontSize: 12, lineHeight: 1.6,
                overflowY: 'auto', maxHeight: 480,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                border: '1px solid var(--border)',
                margin: 0,
              }}
            >
              {output || ''}
              {generating && <span style={{ opacity: 0.5 }}>▍</span>}
            </pre>
          </div>
        )}

        {/* Debug + Sources */}
        {debug && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span>🧩 {debug.usedChunks} chunks</span>
            <span>🔤 ~{debug.budgetUsed} tokens</span>
            {(debug.droppedLow ?? 0) > 0 && <span>🚫 {debug.droppedLow} low-score</span>}
            {(debug.droppedDupe ?? 0) > 0 && <span>♻️ {debug.droppedDupe} deduped</span>}
            <span>⚡ {debug.latencyMs}ms</span>
            <span>🤖 {debug.provider}</span>
          </div>
        )}

        {sources.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              CONTEXT FILES USED ({sources.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {sources.map((s, i) => (
                <div key={i} style={{
                  padding: '6px 10px', borderRadius: 6,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600, minWidth: 20 }}>
                    [{i + 1}]
                  </span>
                  <span style={{ color: 'var(--text)', flex: 1 }}>
                    {s.title || s.section}
                  </span>
                  <span style={{
                    padding: '2px 7px', borderRadius: 4,
                    background: 'var(--accent-muted, rgba(99,102,241,0.12))',
                    color: 'var(--accent)', fontSize: 11, fontWeight: 600,
                  }}>
                    {Math.round(s.score * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
