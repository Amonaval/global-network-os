import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useDecisions, useExtractDecisions } from '../../hooks/useApi'
import type { Decision } from '../../types'

interface Props {
  onBack: () => void
}

export function DecisionsPanel({ onBack }: Props) {
  const qc = useQueryClient()
  const [section, setSection] = useState('')
  const [q, setQ] = useState('')

  const { data, isLoading, error } = useDecisions(section || undefined, q || undefined)
  const extract = useExtractDecisions()

  const refresh = () => qc.invalidateQueries({ queryKey: ['decisions'] })

  const handleExtract = () => extract.mutate()

  return (
    <div className="analytics-panel" style={{ display: 'flex' }}>
      <div className="analytics-header">
        <button className="analytics-back-btn" onClick={onBack}>← Back to Chat</button>
        <span className="analytics-title">⚖️ Decision Graph</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="analytics-refresh-btn" onClick={refresh}>↻ Refresh</button>
          <button
            className="analytics-refresh-btn"
            onClick={handleExtract}
            disabled={extract.isPending}
            style={{ opacity: extract.isPending ? 0.6 : 1 }}
          >
            {extract.isPending ? 'Extracting…' : '⚡ Extract Decisions'}
          </button>
        </div>
      </div>

      {extract.isSuccess && (
        <div style={{ padding: '8px 20px 8px', fontSize: '0.85rem' }}>
          <div style={{ color: '#16a34a', background: 'rgba(34,197,94,0.1)', padding: '6px 10px', borderRadius: 6, marginBottom: extract.data.parseFailures > 0 || (extract.data.extracted === 0 && extract.data.candidates > 0) ? 6 : 0 }}>
            Extracted {extract.data.extracted} decision{extract.data.extracted !== 1 ? 's' : ''} from {extract.data.candidates} candidate{extract.data.candidates !== 1 ? 's' : ''} ({extract.data.scanned} chunks scanned).
          </div>
          {extract.data.parseFailures > 0 && (
            <div style={{ color: '#b45309', background: 'rgba(245,158,11,0.1)', padding: '6px 10px', borderRadius: 6, marginBottom: 4 }}>
              ⚠️ {extract.data.parseFailures} chunk{extract.data.parseFailures !== 1 ? 's' : ''} produced unparseable LLM output.
              {' '}Set <code style={{ background: 'rgba(0,0,0,0.08)', padding: '1px 4px', borderRadius: 3 }}>LLM_PROVIDER=claude</code> in .env for reliable JSON extraction.
            </div>
          )}
          {extract.data.extracted === 0 && extract.data.candidates === 0 && (
            <div style={{ color: '#6b7280', background: 'rgba(107,114,128,0.08)', padding: '6px 10px', borderRadius: 6 }}>
              💡 No decision-language patterns found. Add ADR-style paragraphs to your docs: "We chose X because Y. We rejected Z due to…"
            </div>
          )}
          {extract.data.extracted === 0 && extract.data.candidates > 0 && extract.data.parseFailures === 0 && (
            <div style={{ color: '#6b7280', background: 'rgba(107,114,128,0.08)', padding: '6px 10px', borderRadius: 6 }}>
              💡 {extract.data.candidates} candidate{extract.data.candidates !== 1 ? 's' : ''} found but LLM judged none as a clear decision. Try adding explicit rationale: "We chose X <em>because</em> Y."
            </div>
          )}
        </div>
      )}
      {extract.isError && (
        <div style={{ padding: '8px 20px', background: 'rgba(239,68,68,0.1)', fontSize: '0.85rem', color: '#dc2626' }}>
          Extraction failed: {(extract.error as Error).message}
        </div>
      )}

      <div className="analytics-body">
        {isLoading && <div className="analytics-loading">Loading decisions…</div>}
        {error && <div className="analytics-loading">Failed to load decisions: {error.message}</div>}
        {data && (
          <DecisionsContent
            data={data}
            section={section}
            q={q}
            onSectionChange={setSection}
            onQChange={setQ}
            onExtract={handleExtract}
            extracting={extract.isPending}
          />
        )}
      </div>
    </div>
  )
}

function DecisionsContent({
  data, section, q, onSectionChange, onQChange, onExtract, extracting,
}: {
  data: NonNullable<ReturnType<typeof useDecisions>['data']>
  section: string
  q: string
  onSectionChange: (s: string) => void
  onQChange: (s: string) => void
  onExtract: () => void
  extracting: boolean
}) {
  if (data.total === 0 && !section && !q) {
    return (
      <div className="analytics-empty">
        <p style={{ fontSize: '2rem', margin: '0 0 12px' }}>⚖️</p>
        <p>No decisions extracted yet.</p>
        <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: 16 }}>
          Click "Extract Decisions" to scan your indexed documentation for architectural and engineering decisions.
        </p>
        <button
          className="analytics-refresh-btn"
          onClick={onExtract}
          disabled={extracting}
          style={{ fontSize: '0.9rem', padding: '8px 16px' }}
        >
          {extracting ? 'Extracting…' : '⚡ Extract Decisions'}
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-value">{data.total}</div>
          <div className="kpi-label">Decisions Found</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{data.sections.length}</div>
          <div className="kpi-label">Sections</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{data.decisions.filter(d => d.alternatives.length > 0).length}</div>
          <div className="kpi-label">With Alternatives</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '0 4px 12px' }}>
        <input
          type="text"
          placeholder="Search decisions…"
          value={q}
          onChange={e => onQChange(e.target.value)}
          style={{
            flex: 1, padding: '6px 10px', borderRadius: 6,
            border: '1px solid var(--border)', background: 'var(--bg-secondary)',
            color: 'var(--text)', fontSize: '0.85rem',
          }}
        />
        <select
          value={section}
          onChange={e => onSectionChange(e.target.value)}
          style={{
            padding: '6px 10px', borderRadius: 6,
            border: '1px solid var(--border)', background: 'var(--bg-secondary)',
            color: 'var(--text)', fontSize: '0.85rem',
          }}
        >
          <option value="">All sections</option>
          {data.sections.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {data.total === 0 && (
        <div className="analytics-empty" style={{ padding: '24px 0' }}>
          <p>No decisions match your filters.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.decisions.map(d => <DecisionCard key={d.id} decision={d} />)}
      </div>
    </>
  )
}

function DecisionCard({ decision: d }: { decision: Decision }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="gap-card">
      <div className="gap-card-header">
        <span className="gap-label" style={{ flex: 1 }}>{d.decision}</span>
        <span style={{
          fontSize: '0.72rem', padding: '2px 7px', borderRadius: 10,
          background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
          whiteSpace: 'nowrap',
        }}>
          {d.section}
        </span>
      </div>

      {d.reason && (
        <div className="gap-meta" style={{ marginTop: 6 }}>
          <span style={{ fontWeight: 500 }}>Why: </span>{d.reason}
        </div>
      )}

      {d.alternatives.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
          <span style={{ fontSize: '0.78rem', opacity: 0.6, marginRight: 2 }}>Rejected:</span>
          {d.alternatives.map((alt, i) => (
            <span key={i} style={{
              fontSize: '0.78rem', padding: '1px 8px', borderRadius: 10,
              background: 'rgba(239,68,68,0.1)', color: '#ef4444',
            }}>
              {alt}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          marginTop: 8, background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '0.78rem', opacity: 0.5, padding: 0, textAlign: 'left',
          color: 'var(--text)',
        }}
      >
        {expanded ? '▲ hide source' : '▼ show source text'}
      </button>
      {expanded && (
        <div style={{
          marginTop: 6, fontSize: '0.8rem', opacity: 0.65,
          borderLeft: '2px solid var(--border)', paddingLeft: 10,
          fontStyle: 'italic', lineHeight: 1.5,
        }}>
          {d.sourceText}{d.sourceText.length >= 300 ? '…' : ''}
        </div>
      )}
    </div>
  )
}
