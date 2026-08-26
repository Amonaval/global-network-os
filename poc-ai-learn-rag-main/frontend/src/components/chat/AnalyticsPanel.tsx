import { useQueryClient } from '@tanstack/react-query'
import { useAnalytics } from '../../hooks/useApi'

interface Props {
  onBack: () => void
}

export function AnalyticsPanel({ onBack }: Props) {
  const qc = useQueryClient()
  const { data, isLoading, error, refetch } = useAnalytics(true)

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['analytics'] })
    refetch()
  }

  return (
    <div className="analytics-panel" style={{ display: 'flex' }}>
      <div className="analytics-header">
        <button className="analytics-back-btn" onClick={onBack}>← Back to Chat</button>
        <span className="analytics-title">📊 Query Analytics</span>
        <button className="analytics-refresh-btn" onClick={refresh}>↻ Refresh</button>
      </div>
      <div className="analytics-body">
        {isLoading && <div className="analytics-loading">Loading analytics…</div>}
        {error && <div className="analytics-loading">Failed to load analytics: {error.message}</div>}
        {data && <AnalyticsContent data={data} />}
      </div>
    </div>
  )
}

function AnalyticsContent({ data }: { data: NonNullable<ReturnType<typeof useAnalytics>['data']> }) {
  const s = data.summary || {}
  const answerPct = s.total > 0 ? Math.round((s.answered / s.total) * 100) : 0
  const maxSectionCount = data.topSections.length > 0 ? data.topSections[0].count : 1

  return (
    <>
      <div className="kpi-row">
        <KpiCard label="Total Queries" value={String(s.total || 0)} />
        <KpiCard label="Answer Rate" value={`${answerPct}%`} cls={answerPct >= 80 ? 'kpi-good' : answerPct >= 50 ? 'kpi-warn' : 'kpi-bad'} />
        <KpiCard label="Avg Confidence" value={(s.avgSemScore || 0).toFixed(2)} />
        <KpiCard label="Avg Latency" value={`${(s.avgLatencyMs || 0).toLocaleString()}ms`} />
      </div>

      {data.topSections.length > 0 && (
        <div className="analytics-section">
          <div className="analytics-section-title">Most Referenced Sections</div>
          {data.topSections.map(sec => (
            <div key={sec.section} className="section-bar-row">
              <div className="section-bar-label">{sec.section}</div>
              <div className="section-bar-track">
                <div className="section-bar-fill" style={{ width: `${Math.round(sec.count / maxSectionCount * 100)}%` }} />
              </div>
              <div className="section-bar-count">{sec.count}</div>
            </div>
          ))}
        </div>
      )}

      <div className="analytics-section">
        <div className="analytics-section-title">
          Top Unanswered Questions <span className="analytics-badge">Documentation Gaps</span>
        </div>
        {data.topUnanswered.length === 0
          ? <p style={{ color: 'var(--text-s)', padding: '8px 0' }}>None yet — great coverage!</p>
          : (
            <div className="unanswered-list">
              {data.topUnanswered.map((u, i) => (
                <div key={i} className="unanswered-item">
                  <span className="unanswered-q">{u.question}</span>
                  {u.count > 1 && <span className="unanswered-count">×{u.count}</span>}
                </div>
              ))}
            </div>
          )
        }
      </div>

      {data.recentQueries.length > 0 && (
        <div className="analytics-section">
          <div className="analytics-section-title">Recent Queries</div>
          <div className="recent-table-wrap">
            <table className="recent-table">
              <thead><tr><th>Question</th><th>Score</th><th>Latency</th><th>Status</th></tr></thead>
              <tbody>
                {data.recentQueries.map((q, i) => (
                  <tr key={i}>
                    <td className="query-cell">{(q.question || '').substring(0, 70)}</td>
                    <td>{((q.topSemScore || 0) * 100).toFixed(0)}%</td>
                    <td>{(q.latencyMs || 0).toLocaleString()}ms</td>
                    <td>{q.blocked
                      ? <span className="status-blocked">blocked</span>
                      : <span className="status-answered">answered</span>
                    }</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {s.total === 0 && (
        <div className="analytics-empty">
          <p>No queries logged yet.</p>
          <p>Start asking questions in the chat — every query is logged automatically.</p>
        </div>
      )}
    </>
  )
}

function KpiCard({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div className={`kpi-card ${cls || ''}`}>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  )
}
