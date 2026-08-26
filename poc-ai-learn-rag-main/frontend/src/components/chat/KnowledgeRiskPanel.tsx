import { useKnowledgeRisk } from '../../hooks/useApi'
import type { RiskSection, RiskLevel, RiskSignal } from '../../types'

interface Props { onBack: () => void }

const RISK_COLORS: Record<RiskLevel, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#f59e0b',
  low:      '#22c55e',
}

const SIGNAL_LABELS: Record<RiskSignal, { label: string; icon: string }> = {
  dead_section:             { label: 'Dead Section',           icon: '💀' },
  single_expert:            { label: 'Single Expert',          icon: '👤' },
  single_point_of_failure:  { label: 'Single Point of Failure', icon: '⚡' },
}

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className="risk-badge" style={{ background: RISK_COLORS[level] + '22', color: RISK_COLORS[level], border: `1px solid ${RISK_COLORS[level]}44` }}>
      {level.toUpperCase()}
    </span>
  )
}

function RiskCard({ s }: { s: RiskSection }) {
  const barWidth = Math.round(s.riskScore * 100)
  return (
    <div className="risk-card">
      <div className="risk-card-header">
        <span className="risk-section-name">{s.section}</span>
        <RiskBadge level={s.riskLevel} />
      </div>

      <div className="risk-score-bar-wrap">
        <div className="risk-score-bar" style={{ width: `${barWidth}%`, background: RISK_COLORS[s.riskLevel] }} />
      </div>

      <div className="risk-stats-row">
        <span className="risk-stat">{s.queryCount} quer{s.queryCount === 1 ? 'y' : 'ies'}</span>
        <span className="risk-stat">{s.uniqueTopics} topic{s.uniqueTopics !== 1 ? 's' : ''}</span>
        <span className="risk-stat">{s.chunkCount} chunk{s.chunkCount !== 1 ? 's' : ''}</span>
        <span className="risk-stat risk-score-num">Score: {s.riskScore.toFixed(2)}</span>
      </div>

      {s.signals.length > 0 && (
        <div className="risk-signals-row">
          {s.signals.map(sig => (
            <span key={sig} className="risk-signal-chip">
              {SIGNAL_LABELS[sig].icon} {SIGNAL_LABELS[sig].label}
            </span>
          ))}
        </div>
      )}

      {s.spofTopics.length > 0 && (
        <div className="risk-spof-topics">
          <span className="risk-spof-label">Sole source for:</span>
          {s.spofTopics.map(t => (
            <span key={t} className="risk-spof-chip">{t}</span>
          ))}
        </div>
      )}

      <p className="risk-recommendation">{s.recommendation}</p>
    </div>
  )
}

export function KnowledgeRiskPanel({ onBack }: Props) {
  const { data, isLoading, error } = useKnowledgeRisk(true)

  return (
    <div className="panel-wrap">
      <div className="panel-header">
        <button className="panel-back-btn" onClick={onBack}>← Back</button>
        <h2 className="panel-title">⚠️ Knowledge Risk Analysis</h2>
      </div>

      {isLoading && <div className="panel-loading">Analysing knowledge risk…</div>}
      {error && <div className="panel-error">Failed to load risk data.</div>}

      {data && (
        <>
          <div className="risk-kpi-row">
            <div className="risk-kpi" style={{ borderColor: RISK_COLORS.critical }}>
              <span className="risk-kpi-num" style={{ color: RISK_COLORS.critical }}>{data.criticalCount}</span>
              <span className="risk-kpi-label">Critical</span>
            </div>
            <div className="risk-kpi" style={{ borderColor: RISK_COLORS.high }}>
              <span className="risk-kpi-num" style={{ color: RISK_COLORS.high }}>{data.highCount}</span>
              <span className="risk-kpi-label">High</span>
            </div>
            <div className="risk-kpi" style={{ borderColor: RISK_COLORS.medium }}>
              <span className="risk-kpi-num" style={{ color: RISK_COLORS.medium }}>{data.mediumCount}</span>
              <span className="risk-kpi-label">Medium</span>
            </div>
            <div className="risk-kpi" style={{ borderColor: RISK_COLORS.low }}>
              <span className="risk-kpi-num" style={{ color: RISK_COLORS.low }}>{data.lowCount}</span>
              <span className="risk-kpi-label">Low</span>
            </div>
          </div>

          <p className="risk-meta">
            {data.totalSections} sections analysed · computed {new Date(data.computedAt).toLocaleTimeString()}
          </p>

          {data.sections.length === 0 && (
            <div className="risk-empty">No sections indexed yet. Run ingestion first.</div>
          )}

          <div className="risk-list">
            {data.sections.map(s => <RiskCard key={s.section} s={s} />)}
          </div>
        </>
      )}
    </div>
  )
}
