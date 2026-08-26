import { useQueryClient } from '@tanstack/react-query'
import { useMemory } from '../../hooks/useApi'
import type { MemoryCluster } from '../../types'

interface Props {
  onBack: () => void
}

export function MemoryPanel({ onBack }: Props) {
  const qc = useQueryClient()
  const { data, isLoading, error, refetch } = useMemory(true)

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['memory'] })
    refetch()
  }

  return (
    <div className="analytics-panel" style={{ display: 'flex' }}>
      <div className="analytics-header">
        <button className="analytics-back-btn" onClick={onBack}>← Back to Chat</button>
        <span className="analytics-title">🧠 Organizational Memory</span>
        <button className="analytics-refresh-btn" onClick={refresh}>↻ Refresh</button>
      </div>
      <div className="analytics-body">
        {isLoading && <div className="analytics-loading">Loading organizational memory…</div>}
        {error && <div className="analytics-loading">Failed to load memory: {error.message}</div>}
        {data && <MemoryContent data={data} />}
      </div>
    </div>
  )
}

function MemoryContent({ data }: { data: NonNullable<ReturnType<typeof useMemory>['data']> }) {
  if (data.totalAnswered === 0 || data.clusters.length === 0) {
    return (
      <div className="analytics-empty">
        <p style={{ fontSize: '2rem', margin: '0 0 12px' }}>🧠</p>
        <p>No recurring patterns yet.</p>
        <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>
          Topics appear here once a subject is asked 3 or more times. Keep asking questions.
        </p>
      </div>
    )
  }

  const trending = data.clusters.filter(c => c.trending)

  return (
    <>
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-value">{data.totalAnswered}</div>
          <div className="kpi-label">Total Queries</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{data.totalTopics}</div>
          <div className="kpi-label">Recurring Topics</div>
        </div>
        <div className="kpi-card kpi-good">
          <div className="kpi-value">{trending.length > 0 ? trending[0].label : data.clusters[0]?.label ?? '—'}</div>
          <div className="kpi-label">{trending.length > 0 ? 'Trending Now' : 'Top Topic'}</div>
        </div>
      </div>

      <div className="analytics-section">
        <div className="analytics-section-title">
          Recurring Knowledge Needs
          <span className="analytics-badge" style={{ marginLeft: 8 }}>
            Topics asked 3+ times · sorted by momentum
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          {data.clusters.map((cluster, i) => (
            <MemoryCard key={cluster.label} cluster={cluster} rank={i + 1} />
          ))}
        </div>
      </div>
    </>
  )
}

function MemoryCard({ cluster, rank }: { cluster: MemoryCluster; rank: number }) {
  const lastSeenLabel = cluster.lastSeen
    ? new Date(cluster.lastSeen).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null
  const firstSeenLabel = cluster.firstSeen
    ? new Date(cluster.firstSeen).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="gap-card">
      <div className="gap-card-header">
        <span className="gap-rank">#{rank}</span>
        <span className="gap-label">{cluster.label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {cluster.trending && (
            <span style={{
              fontSize: '0.72rem', fontWeight: 600, padding: '2px 7px',
              borderRadius: 10, background: 'rgba(34,197,94,0.15)', color: '#16a34a',
            }}>
              ↑ trending
            </span>
          )}
          <span className="gap-count">{cluster.count} {cluster.count === 1 ? 'query' : 'queries'}</span>
          {cluster.recentCount > 0 && (
            <span style={{ fontSize: '0.78rem', opacity: 0.6 }}>· {cluster.recentCount} this month</span>
          )}
        </div>
      </div>

      {(firstSeenLabel || lastSeenLabel) && (
        <div className="gap-meta">
          {firstSeenLabel && <span>First asked: {firstSeenLabel}</span>}
          {lastSeenLabel && firstSeenLabel !== lastSeenLabel && <span> · Last asked: {lastSeenLabel}</span>}
        </div>
      )}

      {cluster.topSections.length > 0 && (
        <div className="gap-meta" style={{ marginTop: 4 }}>
          <span>Answered by: </span>
          {cluster.topSections.map((s, i) => (
            <span key={s.section}>
              <span style={{ fontWeight: 500 }}>{s.section}</span>
              {i < cluster.topSections.length - 1 && <span> · </span>}
            </span>
          ))}
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
    </div>
  )
}
