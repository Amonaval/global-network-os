import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useStaleness, useMaintenanceSuggest } from '../../hooks/useApi'
import type { StaleCandidate, MaintenanceSuggestion } from '../../types'

interface Props {
  onBack: () => void
}

export function MaintenancePanel({ onBack }: Props) {
  const qc = useQueryClient()
  const { data, isLoading, error, refetch } = useStaleness(true)

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['maintenance-staleness'] })
    refetch()
  }

  return (
    <div className="analytics-panel" style={{ display: 'flex' }}>
      <div className="analytics-header">
        <button className="analytics-back-btn" onClick={onBack}>← Back to Chat</button>
        <span className="analytics-title">🔧 Documentation Maintenance</span>
        <button className="analytics-refresh-btn" onClick={refresh}>↻ Refresh</button>
      </div>
      <div className="analytics-body">
        {isLoading && <div className="analytics-loading">Scanning documentation for changes…</div>}
        {error && <div className="analytics-loading">Failed to load: {error.message}</div>}
        {data && <MaintenanceContent data={data} />}
      </div>
    </div>
  )
}

function MaintenanceContent({ data }: { data: ReturnType<typeof useStaleness>['data'] & object }) {
  if (!data) return null

  const lastIngestLabel = data.lastIngest
    ? new Date(data.lastIngest).toLocaleString()
    : 'Never'

  return (
    <>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className={`kpi-card${data.staleCount > 0 ? ' kpi-bad' : ''}`}>
          <div className="kpi-value">{data.staleCount}</div>
          <div className="kpi-label">Stale Files</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{data.freshCount}</div>
          <div className="kpi-label">Fresh Files</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{data.totalTracked}</div>
          <div className="kpi-label">Total Tracked</div>
        </div>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-m)', marginBottom: 12 }}>
        Last ingested: <strong>{lastIngestLabel}</strong>
      </div>

      {data.staleCount === 0 && (
        <div className="analytics-empty">
          <p style={{ fontSize: '2rem', margin: '0 0 12px' }}>✅</p>
          <p>All tracked documentation files are up to date.</p>
          <p>Re-run a build after editing docs to update this status.</p>
        </div>
      )}

      {data.staleCount > 0 && (
        <div className="analytics-section">
          <div className="analytics-section-title">
            Stale Files — Need Re-ingestion
            <span className="analytics-badge" style={{ marginLeft: 8 }}>modified since last build</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {data.staleCandidates.map(c => (
              <StaleCard key={c.file} candidate={c} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function StaleCard({ candidate: c }: { candidate: StaleCandidate }) {
  const suggest = useMaintenanceSuggest()
  const [expanded, setExpanded] = useState(false)

  const mtimeLabel = c.fileMtime ? new Date(c.fileMtime).toLocaleString() : 'Unknown'
  const ingestLabel = new Date(c.lastIngest).toLocaleString()
  const reasonLabel = c.stalenessReason === 'content_changed'
    ? '📝 Content changed'
    : '🕐 Modified after ingest'

  const handleSuggest = () => {
    suggest.mutate({ file: c.file, section: c.section })
  }

  return (
    <div className="gap-card health-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="gap-card-header" style={{ marginBottom: 4 }}>
            <span className="gap-label">{c.title || c.file}</span>
            <span className="health-status-chip health-score-warn">{reasonLabel}</span>
          </div>
          <div className="gap-meta">
            <span>Section: <strong>{c.section}</strong></span>
            <span> · Modified: {mtimeLabel}</span>
            <span> · Last ingested: {ingestLabel}</span>
          </div>
          {c.title && (
            <div className="gap-meta" style={{ marginTop: 2, fontFamily: 'monospace', fontSize: '0.72rem', opacity: 0.6 }}>
              {c.file}
            </div>
          )}
        </div>
        <div className="health-actions">
          <button
            className="health-action-btn review"
            onClick={handleSuggest}
            disabled={suggest.isPending}
            title="Get AI suggestions for what may have changed"
          >
            {suggest.isPending ? '⏳ …' : '🔍 Analyze'}
          </button>
        </div>
      </div>

      {suggest.isError && (
        <div className="health-review-error">
          Analysis failed: {suggest.error?.message ?? 'Unknown error'}
        </div>
      )}

      {suggest.data && suggest.data.file === c.file && (
        <div className="health-review-panel">
          <div className="health-review-header">
            <span className="health-review-title">🔍 Staleness Analysis — {c.section}</span>
            <span className="health-review-meta">{suggest.data.chunksAnalyzed} indexed chunks compared</span>
          </div>
          {suggest.data.suggestions.length === 0 && (
            <div style={{ padding: '8px 0', color: 'var(--text-m)', fontSize: '0.85rem' }}>
              No specific issues found — content appears consistent with indexed version.
            </div>
          )}
          {suggest.data.suggestions.map((s, i) => (
            <SuggestionItem key={i} suggestion={s} />
          ))}
          <button
            style={{ marginTop: 8, fontSize: '0.78rem', background: 'none', border: 'none', color: 'var(--text-m)', cursor: 'pointer' }}
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? '▲ Show less' : '▼ Show raw file path'}
          </button>
          {expanded && (
            <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-m)', marginTop: 4 }}>
              {c.file}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SuggestionItem({ suggestion: s }: { suggestion: MaintenanceSuggestion }) {
  const severityIcon = s.severity === 'high' ? '🔴' : s.severity === 'medium' ? '🟡' : '🟢'
  return (
    <div className="health-suggestion-item">
      <div className="health-suggestion-topic">{severityIcon} {s.topic}</div>
      <div className="health-suggestion-detail">{s.detail}</div>
    </div>
  )
}
