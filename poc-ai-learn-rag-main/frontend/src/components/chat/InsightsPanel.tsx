import { useInsights } from '../../hooks/useApi'
import type { InsightsTopic, InsightsPainArea, InsightsQualityTrend, InsightsGap } from '../../types'

interface Props { onBack: () => void }

function pct(n: number) { return Math.round(n * 100) + '%' }

function TopTopicsSection({ topics }: { topics: InsightsTopic[] }) {
  if (!topics.length) return <p className="insights-empty">No query data yet.</p>
  const maxCount = topics[0]?.count || 1
  return (
    <div className="insights-section">
      <h3 className="insights-section-title">🔍 Most Searched Topics</h3>
      <div className="insights-topics-list">
        {topics.map(t => (
          <div key={t.topic} className="insights-topic-row">
            <div className="insights-topic-head">
              <span className="insights-topic-name">{t.topic}</span>
              <span className="insights-topic-count">{t.count}</span>
              {t.trending && <span className="insights-trending-badge">↑ trending</span>}
            </div>
            <div className="insights-bar-wrap">
              <div className="insights-bar insights-bar-blue" style={{ width: `${Math.round((t.count / maxCount) * 100)}%` }} />
            </div>
            {(t.thisWeek > 0 || t.lastWeek > 0) && (
              <div className="insights-topic-sub">
                This week: {t.thisWeek} · Last week: {t.lastWeek}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PainAreasSection({ areas }: { areas: InsightsPainArea[] }) {
  if (!areas.length) return (
    <div className="insights-section">
      <h3 className="insights-section-title">🩹 Pain Areas</h3>
      <p className="insights-empty">Not enough data yet — need nearMiss signals from blocked queries.</p>
    </div>
  )
  return (
    <div className="insights-section">
      <h3 className="insights-section-title">🩹 Pain Areas</h3>
      <p className="insights-section-sub">Sections retrieved but failing the confidence gate most often</p>
      <div className="insights-pain-list">
        {areas.map(a => (
          <div key={a.section} className="insights-pain-row">
            <div className="insights-pain-head">
              <span className="insights-pain-name">{a.section}</span>
              <span className={`insights-pain-rate ${a.successRate < 0.5 ? 'insights-rate-bad' : a.successRate < 0.8 ? 'insights-rate-mid' : 'insights-rate-good'}`}>
                {pct(a.successRate)} success
              </span>
            </div>
            <div className="insights-bar-wrap">
              <div className="insights-bar insights-bar-green" style={{ width: pct(a.successRate) }} />
              <div className="insights-bar-fail" style={{ width: pct(a.painScore) }} />
            </div>
            <div className="insights-pain-sub">
              {a.totalQueries} total · {a.answered} answered · {a.failureCount} near-misses
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const TREND_ICON: Record<string, string> = {
  improving: '📈', declining: '📉', stable: '➡️', new: '🆕',
}
const TREND_CLASS: Record<string, string> = {
  improving: 'insights-trend-up', declining: 'insights-trend-down', stable: 'insights-trend-flat', new: 'insights-trend-new',
}

function QualityTrendSection({ trend }: { trend: InsightsQualityTrend[] }) {
  if (!trend.length) return (
    <div className="insights-section">
      <h3 className="insights-section-title">📊 Section Quality Trend</h3>
      <p className="insights-empty">Need queries from two separate 30-day windows to show trends.</p>
    </div>
  )
  return (
    <div className="insights-section">
      <h3 className="insights-section-title">📊 Section Quality Trend</h3>
      <p className="insights-section-sub">Answer rate: last 30 days vs. prior 30 days</p>
      <div className="insights-trend-list">
        {trend.map(t => (
          <div key={t.section} className="insights-trend-row">
            <span className="insights-trend-icon">{TREND_ICON[t.trend]}</span>
            <span className="insights-trend-name">{t.section}</span>
            <span className={`insights-trend-badge ${TREND_CLASS[t.trend]}`}>{t.trend}</span>
            <span className="insights-trend-rates">
              {t.recentRate !== null ? pct(t.recentRate) : '–'}
              {t.priorRate !== null ? ` vs ${pct(t.priorRate)}` : ''}
              {t.delta !== null ? ` (${t.delta > 0 ? '+' : ''}${pct(t.delta)})` : ''}
            </span>
            <span className="insights-trend-queries">{t.queryCount} queries</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecurringGapsSection({ gaps }: { gaps: InsightsGap[] }) {
  if (!gaps.length) return (
    <div className="insights-section">
      <h3 className="insights-section-title">🔁 Recurring Gaps</h3>
      <p className="insights-empty">No recurring unanswered topics found yet.</p>
    </div>
  )
  return (
    <div className="insights-section">
      <h3 className="insights-section-title">🔁 Recurring Gaps</h3>
      <p className="insights-section-sub">Topics asked repeatedly but never answered — documentation priorities</p>
      <div className="insights-gaps-list">
        {gaps.map(g => (
          <div key={g.topic} className="insights-gap-row">
            <div className="insights-gap-head">
              <span className="insights-gap-topic">{g.topic}</span>
              <span className="insights-gap-count">{g.count}×</span>
              {g.recentCount > 0 && <span className="insights-gap-recent">{g.recentCount} this month</span>}
            </div>
            <div className="insights-gap-sub">
              Last asked: {new Date(g.lastSeen).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function InsightsPanel({ onBack }: Props) {
  const { data, isLoading, error } = useInsights(true)

  return (
    <div className="panel-wrap">
      <div className="panel-header">
        <button className="panel-back-btn" onClick={onBack}>← Back</button>
        <h2 className="panel-title">📈 Engineering Insights</h2>
      </div>

      {isLoading && <div className="panel-loading">Computing insights…</div>}
      {error && <div className="panel-error">Failed to load insights.</div>}

      {data && (
        <>
          <div className="insights-kpi-row">
            <div className="insights-kpi">
              <span className="insights-kpi-num">{data.totalQueries}</span>
              <span className="insights-kpi-label">Total Queries</span>
            </div>
            <div className="insights-kpi">
              <span className="insights-kpi-num">{data.totalAnswered}</span>
              <span className="insights-kpi-label">Answered</span>
            </div>
            <div className="insights-kpi">
              <span className="insights-kpi-num" style={{ color: data.overallSuccessRate >= 0.7 ? '#22c55e' : data.overallSuccessRate >= 0.4 ? '#f59e0b' : '#ef4444' }}>
                {pct(data.overallSuccessRate)}
              </span>
              <span className="insights-kpi-label">Success Rate</span>
            </div>
          </div>

          <div className="insights-body">
            <TopTopicsSection topics={data.topTopics} />
            <RecurringGapsSection gaps={data.recurringGaps} />
            <PainAreasSection areas={data.painAreas} />
            <QualityTrendSection trend={data.qualityTrend} />
          </div>

          <p className="insights-meta">
            Computed from {data.totalQueries} queries · {new Date(data.computedAt).toLocaleTimeString()}
          </p>
        </>
      )}
    </div>
  )
}
