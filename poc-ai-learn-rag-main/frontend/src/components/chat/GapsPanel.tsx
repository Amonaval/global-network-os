import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useGapIntelligence, useGenerateDocOutline } from '../../hooks/useApi'
import type { GapIntelligenceCluster, DocOutline } from '../../types'

interface Props {
  onBack: () => void
}

export function GapsPanel({ onBack }: Props) {
  const qc = useQueryClient()
  const { data, isLoading, error, refetch } = useGapIntelligence(true)

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['gap-intelligence'] })
    refetch()
  }

  return (
    <div className="analytics-panel" style={{ display: 'flex' }}>
      <div className="analytics-header">
        <button className="analytics-back-btn" onClick={onBack}>← Back to Chat</button>
        <span className="analytics-title">🔎 Documentation Gap Intelligence</span>
        <button className="analytics-refresh-btn" onClick={refresh}>↻ Refresh</button>
      </div>
      <div className="analytics-body">
        {isLoading && <div className="analytics-loading">Analyzing documentation gaps…</div>}
        {error && <div className="analytics-loading">Failed to load: {error.message}</div>}
        {data && <GapsContent data={data} />}
      </div>
    </div>
  )
}

function GapsContent({ data }: { data: NonNullable<ReturnType<typeof useGapIntelligence>['data']> }) {
  if (data.totalBlocked === 0) {
    return (
      <div className="analytics-empty">
        <p style={{ fontSize: '2rem', margin: '0 0 12px' }}>✅</p>
        <p>No documentation gaps detected.</p>
        <p>Every question asked so far has been answered. Keep your docs updated!</p>
      </div>
    )
  }

  const trendingCount = data.clusters.filter(c => c.trending).length
  const createCount   = data.clusters.filter(c => c.actionType === 'create_doc').length
  const updateCount   = data.clusters.filter(c => c.actionType === 'update_section').length

  return (
    <>
      <div className="kpi-row">
        <div className="kpi-card kpi-bad">
          <div className="kpi-value">{data.totalBlocked}</div>
          <div className="kpi-label">Unanswered Queries</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{data.hardBlocked}</div>
          <div className="kpi-label">Hard Blocked</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{data.softBlocked}</div>
          <div className="kpi-label">Soft Deflections</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{trendingCount > 0 ? `↑ ${trendingCount}` : data.totalClusters}</div>
          <div className="kpi-label">{trendingCount > 0 ? 'Trending Topics' : 'Gap Topics'}</div>
        </div>
      </div>

      {(createCount > 0 || updateCount > 0) && (
        <div className="analytics-section">
          <div className="analytics-section-title">Recommended Actions</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {createCount > 0 && (
              <div className="gap-action-badge gap-action-create">
                📝 {createCount} new {createCount === 1 ? 'doc' : 'docs'} to create
              </div>
            )}
            {updateCount > 0 && (
              <div className="gap-action-badge gap-action-update">
                ✏️ {updateCount} existing {updateCount === 1 ? 'section' : 'sections'} to update
              </div>
            )}
          </div>
        </div>
      )}

      <div className="analytics-section">
        <div className="analytics-section-title">
          Prioritized Gap Topics
          <span className="analytics-badge" style={{ marginLeft: 8 }}>sorted by impact</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          {data.clusters.map((cluster, i) => (
            <GapCard key={cluster.label} cluster={cluster} rank={i + 1} />
          ))}
        </div>
      </div>
    </>
  )
}

function GapCard({ cluster, rank }: { cluster: GapIntelligenceCluster; rank: number }) {
  const [outline, setOutline]     = useState<DocOutline | null>(null)
  const [expanded, setExpanded]   = useState(false)
  const { mutate: genOutline, isPending } = useGenerateDocOutline()

  const lastSeenLabel = cluster.lastSeen
    ? new Date(cluster.lastSeen).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null
  const firstSeenLabel = cluster.firstSeen
    ? new Date(cluster.firstSeen).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  const actionIcon = cluster.actionType === 'create_doc' ? '📝'
    : cluster.actionType === 'update_section' ? '✏️' : '🔍'

  const handleGenerateOutline = () => {
    genOutline(
      { topic: cluster.label, questions: cluster.questions.map(q => q.text) },
      { onSuccess: r => { setOutline(r.outline); setExpanded(true) } }
    )
  }

  return (
    <div className="gap-card">
      <div className="gap-card-header">
        <span className="gap-rank">#{rank}</span>
        <span className="gap-label">{cluster.label}</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 'auto' }}>
          {cluster.trending && <span className="gap-trending-badge">↑ Trending</span>}
          <span className="gap-count">{cluster.count} {cluster.count === 1 ? 'query' : 'queries'}</span>
        </div>
      </div>

      <div className="gap-action-row">
        <span className="gap-action-tag">{actionIcon} {cluster.actionLabel}</span>
        {cluster.nearMissSections.length > 0 && (
          <span className="gap-nearmiss">
            Near misses: {cluster.nearMissSections.join(', ')}
          </span>
        )}
      </div>

      {(firstSeenLabel || lastSeenLabel) && (
        <div className="gap-meta">
          {firstSeenLabel && <span>First: {firstSeenLabel}</span>}
          {lastSeenLabel && firstSeenLabel !== lastSeenLabel && <span> · Last: {lastSeenLabel}</span>}
          {cluster.recentCount > 0 && <span> · {cluster.recentCount} in last 7 days</span>}
        </div>
      )}

      <div className="gap-questions">
        {cluster.questions.map((q, i) => (
          <div key={i} className="gap-question-item">
            <span className="gap-question-text">{q.text}</span>
            {q.count > 1 && <span className="unanswered-count">×{q.count}</span>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10 }}>
        {!outline && (
          <button
            className="gap-outline-btn"
            onClick={handleGenerateOutline}
            disabled={isPending}
          >
            {isPending ? '⏳ Generating…' : '✨ Generate Doc Outline'}
          </button>
        )}
        {outline && (
          <div>
            <button
              className="gap-outline-btn"
              onClick={() => setExpanded(e => !e)}
              style={{ marginBottom: 8 }}
            >
              {expanded ? '▲ Hide Outline' : '▼ Show Outline'}
            </button>
            {expanded && <DocOutlineView outline={outline} />}
          </div>
        )}
      </div>
    </div>
  )
}

function DocOutlineView({ outline }: { outline: DocOutline }) {
  return (
    <div className="gap-outline">
      <div className="gap-outline-title">{outline.title}</div>
      <div className="gap-outline-summary">{outline.summary}</div>
      <div className="gap-outline-meta">~{outline.estimatedReadMins} min read</div>
      <div className="gap-outline-sections">
        {outline.sections.map((s, i) => (
          <div key={i} className="gap-outline-section">
            <div className="gap-outline-heading">
              <span className="gap-outline-num">{i + 1}.</span> {s.heading}
            </div>
            <div className="gap-outline-hint">{s.contentHint}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
