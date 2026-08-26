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
  onOpenBuild?: (spec: string) => void
}

export function CopilotPanel({ onClose, onOpenBuild }: Props) {
  const [spec, setSpec]         = useState('')
  const [planning, setPlanning] = useState(false)
  const [output, setOutput]     = useState('')
  const [sources, setSources]   = useState<Source[]>([])
  const [debug, setDebug]       = useState<Debug | null>(null)
  const [error, setError]       = useState<string | null>(null)
  const [copied, setCopied]     = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  const plan = useCallback(async () => {
    if (!spec.trim() || planning) return
    setPlanning(true)
    setOutput('')
    setSources([])
    setDebug(null)
    setError(null)

    try {
      const res = await fetch('/api/copilot/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec: spec.trim() }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        setError(err.error || 'Planning failed')
        return
      }

      await readStream(res, {
        onToken: token => {
          setOutput(prev => prev + token)
          setTimeout(() => {
            if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
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
            setError(err.error || 'Planning failed')
          } catch (_) {
            setError('Planning failed')
          }
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setPlanning(false)
    }
  }, [spec, planning])

  const copyOutput = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [output])

  // Render the streamed markdown plan with basic section highlighting
  const renderPlan = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('## ')) {
        return (
          <div key={i} style={{
            marginTop: i > 0 ? 20 : 0, marginBottom: 6,
            fontSize: 13, fontWeight: 700,
            color: 'var(--accent)',
            borderBottom: '1px solid var(--border)',
            paddingBottom: 4,
          }}>
            {line.slice(3)}
          </div>
        )
      }
      if (line.startsWith('### ')) {
        return (
          <div key={i} style={{ marginTop: 12, marginBottom: 4, fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
            {line.slice(4)}
          </div>
        )
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={i} style={{ paddingLeft: 14, fontSize: 12, lineHeight: 1.7, color: 'var(--text)' }}>
            {'• ' + line.slice(2)}
          </div>
        )
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={i} style={{ paddingLeft: 14, fontSize: 12, lineHeight: 1.7, color: 'var(--text)', fontWeight: 500 }}>
            {line}
          </div>
        )
      }
      if (line.trim() === '') {
        return <div key={i} style={{ height: 6 }} />
      }
      return (
        <div key={i} style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text-muted)' }}>
          {line}
        </div>
      )
    })
  }

  return (
    <div className="upload-panel" style={{ display: 'block' }}>
      <div className="upload-panel-header">
        <span>🧭 Engineering Copilot — Plan First</span>
        <button className="rebuild-close" onClick={onClose}>×</button>
      </div>

      <div className="upload-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>
          Describe a feature or issue. The Copilot reads your codebase and documentation to produce a
          structured implementation plan — affected modules, reuse opportunities, implementation order,
          decision references, and risks — <strong>before any code is written</strong>.
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            FEATURE SPEC
          </label>
          <textarea
            value={spec}
            onChange={e => setSpec(e.target.value)}
            placeholder={`Describe what you want to build or change.\n\nExamples:\n• Add a new endpoint that returns per-section query volume over the last 30 days\n• Refactor the confidence gate to support per-section thresholds\n• Add a "mark as resolved" action to the GapsPanel that writes to eval.jsonl`}
            rows={5}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 12px', borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--input-bg)', color: 'var(--text)',
              fontSize: 13, fontFamily: 'inherit', lineHeight: 1.6,
              resize: 'vertical',
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) plan()
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={plan}
            disabled={!spec.trim() || planning}
            style={{
              padding: '8px 22px', borderRadius: 8,
              background: planning ? 'var(--border)' : 'var(--accent)',
              color: planning ? 'var(--text-muted)' : '#fff',
              border: 'none', cursor: planning ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {planning ? (
              <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Planning…</>
            ) : (
              <>🧭 Generate Plan</>
            )}
          </button>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ctrl+Enter</span>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 8,
            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)',
            color: 'var(--error, #dc2626)', fontSize: 13,
          }}>
            ❌ {error}
          </div>
        )}

        {(output || planning) && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                IMPLEMENTATION PLAN
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {output && onOpenBuild && (
                  <button
                    onClick={() => onOpenBuild(spec)}
                    style={{
                      padding: '4px 12px', borderRadius: 6,
                      border: '1px solid var(--accent)',
                      background: 'var(--accent-muted, rgba(99,102,241,0.1))',
                      color: 'var(--accent)',
                      cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    }}
                  >
                    ⚙️ Generate Code →
                  </button>
                )}
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
            </div>
            <div
              ref={outputRef}
              style={{
                background: 'var(--surface)',
                padding: '16px 18px', borderRadius: 8,
                border: '1px solid var(--border)',
                overflowY: 'auto', maxHeight: 520,
              }}
            >
              {renderPlan(output)}
              {planning && <span style={{ opacity: 0.4, fontSize: 13 }}>▍</span>}
            </div>
          </div>
        )}

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
              CONTEXT USED ({sources.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {sources.map((s, i) => (
                <div key={i} style={{
                  padding: '6px 10px', borderRadius: 6,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600, minWidth: 20 }}>[{i + 1}]</span>
                  <span style={{ color: 'var(--text)', flex: 1 }}>{s.title || s.section}</span>
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
