import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useHealth, usePatchHealthSection, useRemoveHealthSection, useReviewSection, useIntelligenceHistory } from '../../hooks/useApi'
import type { HealthSection, IntelligenceSnapshot, SectionPriority } from '../../types'

// ── Shared trend helpers ──────────────────────────────────────────────────────

function HealthSparkline({ snapshots }: { snapshots: IntelligenceSnapshot[] }) {
  if (snapshots.length < 2) return null
  const values = snapshots.map(s => s.avgHealthScore)
  const min = Math.max(0, Math.min(...values) - 5)
  const max = Math.min(100, Math.max(...values) + 5)
  const range = max - min || 1
  const W = 140; const H = 28; const pad = 4
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (W - pad * 2)
    const y = H - pad - ((v - min) / range) * (H - pad * 2)
    return `${x},${y}`
  }).join(' ')
  return (
    <svg className="id-sparkline" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts} fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => {
        const x = pad + (i / (values.length - 1)) * (W - pad * 2)
        const y = H - pad - ((v - min) / range) * (H - pad * 2)
        return <circle key={i} cx={x} cy={y} r="3" fill="var(--brand)" />
      })}
    </svg>
  )
}

function HealthDeltaBadge({ value, unit = '' }: { value: number; unit?: string }) {
  const color = value === 0 ? 'var(--text-m)' : value > 0 ? '#22c55e' : '#ef4444'
  const arrow = value > 0 ? '↑' : value < 0 ? '↓' : '→'
  return (
    <span className="id-delta-badge" style={{ color }}>
      {arrow} {value > 0 ? '+' : ''}{value}{unit}
    </span>
  )
}

function HealthTrendBanner() {
  const { data: history } = useIntelligenceHistory(true)
  if (!history || history.snapshots.length < 1) return null

  const snapshots = history.snapshots
  const latest = snapshots[snapshots.length - 1]
  const delta = history.latestDelta

  if (snapshots.length === 1) {
    return (
      <div className="id-snapshot-prompt" style={{ marginBottom: 12 }}>
        <span>First snapshot saved (avg health: <strong>{Math.round(latest.avgHealthScore)}%</strong>). Keep using the product to see your health trend.</span>
      </div>
    )
  }

  const allZero = delta && delta.avgHealthScore === 0 && delta.ids === 0
  return (
    <div className="id-trend-banner" style={{ marginBottom: 12 }}>
      <div className="id-trend-left">
        <span className="id-trend-label">Health Trend</span>
        {allZero
          ? <span className="id-trend-no-change">No change since last snapshot.</span>
          : delta && (
            <div className="id-trend-deltas">
              <span className="id-trend-item">Avg score <HealthDeltaBadge value={delta.avgHealthScore} unit=" pts" /></span>
              <span className="id-trend-sep">·</span>
              <span className="id-trend-item">IDS <HealthDeltaBadge value={delta.ids} unit=" pts" /></span>
              <span className="id-trend-sep">·</span>
              <span className="id-trend-item">Now <strong>{Math.round(latest.avgHealthScore)}%</strong></span>
            </div>
          )
        }
      </div>
      {!allZero && <HealthSparkline snapshots={snapshots} />}
    </div>
  )
}

interface Props {
  onBack: () => void
}

export function HealthPanel({ onBack }: Props) {
  const qc = useQueryClient()
  const { data, isLoading, error, refetch } = useHealth(true)

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['health'] })
    refetch()
  }

  return (
    <div className="analytics-panel" style={{ display: 'flex' }}>
      <div className="analytics-header">
        <button className="analytics-back-btn" onClick={onBack}>← Back to Chat</button>
        <span className="analytics-title">❤️ Documentation Health</span>
        <button className="analytics-refresh-btn" onClick={refresh}>↻ Refresh</button>
      </div>
      <div className="analytics-body">
        <HealthTrendBanner />
        {isLoading && <div className="analytics-loading">Computing health scores…</div>}
        {error && <div className="analytics-loading">Failed to load health data: {error.message}</div>}
        {data && <HealthContent data={data} />}
      </div>
    </div>
  )
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Healthy'
  if (score >= 50) return 'Fair'
  if (score >= 20) return 'Needs Work'
  return 'Critical'
}

function scoreClass(score: number): string {
  if (score >= 80) return 'health-score-good'
  if (score >= 50) return 'health-score-fair'
  if (score >= 20) return 'health-score-warn'
  return 'health-score-bad'
}

function HealthContent({ data }: { data: NonNullable<ReturnType<typeof useHealth>['data']> }) {
  const patchSection  = usePatchHealthSection()
  const removeSection = useRemoveHealthSection()

  const handlePriority = (section: string, priority: SectionPriority) => {
    patchSection.mutate({ section, priority })
  }

  const handleRemove = (section: string) => {
    removeSection.mutate(section)
  }

  if (data.totalSections === 0) {
    return (
      <div className="analytics-empty">
        <p style={{ fontSize: '2rem', margin: '0 0 12px' }}>📭</p>
        <p>No documentation sections found.</p>
        <p>Run a build to index your documentation first.</p>
      </div>
    )
  }

  const recommendations = data.sections.filter(s => s.recommendation !== null)
  const critical   = data.sections.filter(s => s.score < 20).length
  const needsWork  = data.sections.filter(s => s.score >= 20 && s.score < 50).length
  const healthy    = data.sections.filter(s => s.score >= 80).length
  const boosted    = data.sections.filter(s => s.priority === 'boost').length
  const ignored    = data.sections.filter(s => s.priority === 'ignore').length

  return (
    <>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="kpi-card">
          <div className="kpi-value">{data.totalSections}</div>
          <div className="kpi-label">Sections</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{data.totalAnswered}</div>
          <div className="kpi-label">Answered Queries</div>
        </div>
        <div className={`kpi-card${critical > 0 ? ' kpi-bad' : ''}`}>
          <div className="kpi-value">{critical}</div>
          <div className="kpi-label">Critical</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{healthy}</div>
          <div className="kpi-label">Healthy</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{boosted} / {ignored}</div>
          <div className="kpi-label">Boosted / Ignored</div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="analytics-section health-recommendations">
          <div className="analytics-section-title">
            💡 System Recommendations
            <span className="analytics-badge" style={{ marginLeft: 8 }}>act on these first</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {recommendations.map(s => (
              <RecommendationCard
                key={s.section}
                section={s}
                onPriority={handlePriority}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </div>
      )}

      {(critical > 0 || needsWork > 0) && (
        <div className="analytics-section">
          <div className="analytics-section-title">
            Sections Needing Attention
            <span className="analytics-badge" style={{ marginLeft: 8 }}>score below 50</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {data.sections.filter(s => s.score < 50).map(s => (
              <HealthCard key={s.section} section={s} onPriority={handlePriority} onRemove={handleRemove} />
            ))}
          </div>
        </div>
      )}

      <div className="analytics-section">
        <div className="analytics-section-title">All Sections</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {data.sections.map(s => (
            <HealthCard key={s.section} section={s} onPriority={handlePriority} onRemove={handleRemove} />
          ))}
        </div>
      </div>
    </>
  )
}

function RecommendationCard({
  section: s,
  onPriority,
  onRemove,
}: {
  section: HealthSection
  onPriority: (section: string, priority: SectionPriority) => void
  onRemove: (section: string) => void
}) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  if (s.recommendation === 'consider-removing') {
    return (
      <div className="health-rec-card health-rec-remove">
        <span className="health-rec-icon">🗑️</span>
        <div className="health-rec-body">
          <strong>{s.section}</strong>
          <span> — Never queried. This section takes up index space but contributes nothing. Consider removing it.</span>
        </div>
        <div className="health-rec-actions">
          <button className="health-action-btn remove" onClick={() => onRemove(s.section)}>Remove</button>
          <button className="health-action-btn normal" onClick={() => setDismissed(true)}>Dismiss</button>
        </div>
      </div>
    )
  }

  if (s.recommendation === 'consider-boosting') {
    return (
      <div className="health-rec-card health-rec-boost">
        <span className="health-rec-icon">⬆️</span>
        <div className="health-rec-body">
          <strong>{s.section}</strong>
          <span> — High-traffic section ({s.queryCount} queries). Boosting will prioritize its chunks in retrieval for faster, sharper answers.</span>
        </div>
        <div className="health-rec-actions">
          <button className="health-action-btn boost" onClick={() => onPriority(s.section, 'boost')}>Boost</button>
          <button className="health-action-btn normal" onClick={() => setDismissed(true)}>Dismiss</button>
        </div>
      </div>
    )
  }

  return null
}

function HealthCard({
  section: s,
  onPriority,
  onRemove,
}: {
  section: HealthSection
  onPriority: (section: string, priority: SectionPriority) => void
  onRemove: (section: string) => void
}) {
  const [confirmRemove, setConfirmRemove] = useState(false)
  const review = useReviewSection()

  const recencyText = s.daysSinceLastHit === null
    ? 'Never queried'
    : s.daysSinceLastHit === 0
      ? 'Queried today'
      : `Last queried ${s.daysSinceLastHit}d ago`

  return (
    <div className="gap-card health-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className={`health-score-badge ${scoreClass(s.score)}`} title={`Score: ${s.score}/100`}>
          {s.score}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="gap-card-header" style={{ marginBottom: 2 }}>
            <span className="gap-label">{s.section}</span>
            <span className={`health-status-chip ${scoreClass(s.score)}`}>{scoreLabel(s.score)}</span>
            {s.priority === 'boost'  && <span className="priority-badge priority-boost">⬆️ Boosted</span>}
            {s.priority === 'ignore' && <span className="priority-badge priority-ignore">👁️ Ignored</span>}
          </div>
          <div className="gap-meta">
            <span>{recencyText}</span>
            <span> · {s.queryCount} {s.queryCount === 1 ? 'query' : 'queries'}</span>
          </div>
        </div>

        <div className="health-actions">
          {s.score < 50 && (
            <button
              className="health-action-btn review"
              onClick={() => review.mutate(s.section)}
              disabled={review.isPending}
              title="Get AI suggestions for improving this section's documentation"
            >{review.isPending ? '⏳ …' : '🔍 Review'}</button>
          )}
          {s.priority !== 'boost' && (
            <button
              className="health-action-btn boost"
              onClick={() => onPriority(s.section, 'boost')}
              title="Boost — chunks from this section rank higher in retrieval"
            >⬆️ Boost</button>
          )}
          {s.priority !== 'ignore' && (
            <button
              className="health-action-btn ignore"
              onClick={() => onPriority(s.section, 'ignore')}
              title="Ignore — deprioritize this section in retrieval"
            >👁️ Ignore</button>
          )}
          {s.priority !== 'normal' && (
            <button
              className="health-action-btn normal"
              onClick={() => onPriority(s.section, 'normal')}
              title="Reset to normal priority"
            >↩ Reset</button>
          )}
          <button
            className="health-action-btn remove"
            onClick={() => setConfirmRemove(true)}
            title="Remove all chunks for this section from the index"
          >🗑️</button>
        </div>
      </div>

      {confirmRemove && (
        <div className="health-confirm">
          <span>Remove <strong>{s.section}</strong> from the index? All {s.queryCount > 0 ? 'indexed chunks will be deleted.' : 'chunks will be deleted.'} This cannot be undone without re-ingesting.</span>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="health-confirm-yes" onClick={() => { onRemove(s.section); setConfirmRemove(false) }}>Yes, Remove</button>
            <button className="health-confirm-no" onClick={() => setConfirmRemove(false)}>Cancel</button>
          </div>
        </div>
      )}

      {review.isError && (
        <div className="health-review-error">
          Review failed: {review.error?.message ?? 'Unknown error'}
        </div>
      )}

      {review.data && (
        <div className="health-review-panel">
          <div className="health-review-header">
            <span className="health-review-title">🔍 AI Review — {s.section}</span>
            <span className="health-review-meta">
              {review.data.chunksAnalyzed} chunks · {review.data.gapQueriesAnalyzed} related gap {review.data.gapQueriesAnalyzed === 1 ? 'query' : 'queries'} analyzed
            </span>
          </div>
          {review.data.suggestions.map((sg, i) => (
            <div className="health-suggestion-item" key={i}>
              <div className="health-suggestion-topic">📌 {sg.topic}</div>
              <div className="health-suggestion-detail">{sg.detail}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
