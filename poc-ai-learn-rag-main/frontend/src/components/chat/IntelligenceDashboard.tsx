import { useState } from 'react'
import { useInsights, useKnowledgeRisk, useGapIntelligence, useMemory, useHealth, useIntelligenceHistory, useTeamIds, forceSnapshot, useRagasStatus } from '../../hooks/useApi'
import { useQueryClient } from '@tanstack/react-query'
import { FilterBar, DEFAULT_FILTERS } from './FilterBar'
import type { ActivePanel } from '../../store/appStore'
import type { RiskLevel, RiskSignal, IntelligenceSnapshot, InsightsFilters, TeamIdsUser } from '../../types'

interface Props {
  onBack: () => void
  onNavigate: (panel: ActivePanel) => void
}

// ── IDS computation ──────────────────────────────────────────────────────────

function computeIDS(
  insightsData: { overallSuccessRate: number; totalQueries: number } | null,
  memoryData:   { clusters: unknown[] } | null,
  gapsData:     { totalBlocked: number } | null,
  riskData:     { totalSections: number } | null,
  healthData:   { sections: { score: number }[] } | null,
): number {
  let score = 0
  // Answer quality & volume
  if (insightsData) {
    score += insightsData.overallSuccessRate * 0.30
    score += Math.min(insightsData.totalQueries / 50, 1) * 0.15
  }
  // Organisational memory breadth
  if (memoryData) {
    score += Math.min(memoryData.clusters.length / 8, 1) * 0.20
  }
  // Gap pressure (fewer gaps = higher IDS)
  if (insightsData && gapsData) {
    const gapRatio = Math.min(gapsData.totalBlocked / Math.max(insightsData.totalQueries, 1), 1)
    score += (1 - gapRatio) * 0.15
  } else if (insightsData) {
    score += 0.15 // no gaps found = good
  }
  // Risk baseline established
  if (riskData) score += 0.10
  // Average health score
  if (healthData && healthData.sections.length > 0) {
    const avg = healthData.sections.reduce((s, x) => s + x.score, 0) / healthData.sections.length
    score += (avg / 100) * 0.10
  }
  return Math.min(score, 1)
}

function idsLabel(ids: number): { label: string; color: string } {
  if (ids >= 0.70) return { label: 'Moat achieved — this org won\'t leave', color: '#22c55e' }
  if (ids >= 0.60) return { label: 'Strong — approaching moat threshold',   color: '#84cc16' }
  if (ids >= 0.40) return { label: 'Growing — intelligence compounding',     color: '#f59e0b' }
  if (ids >= 0.20) return { label: 'Building momentum',                      color: '#f97316' }
  return               { label: 'Just starting — keep asking questions',     color: '#9ca3af' }
}

// ── Shared helpers ───────────────────────────────────────────────────────────

const RISK_COLORS: Record<RiskLevel, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e',
}

const SIGNAL_ICONS: Record<RiskSignal, string> = {
  dead_section: '💀', single_expert: '👤', single_point_of_failure: '⚡',
}

const ACTION_BADGE: Record<string, string> = {
  create_doc: 'create doc', update_section: 'update', review_section: 'review',
}

// ── Team IDS ─────────────────────────────────────────────────────────────────

function UserIdsBar({ user, maxIds }: { user: TeamIdsUser; maxIds: number }) {
  const pct = maxIds > 0 ? Math.round((user.ids / maxIds) * 100) : 0
  const idsPct = Math.round(user.ids * 100)
  const color = idsPct >= 70 ? '#22c55e' : idsPct >= 40 ? '#f59e0b' : '#9ca3af'
  return (
    <div className="id-team-row">
      <span className="id-team-user">{user.userId}</span>
      <div className="id-team-user-bar-wrap">
        <div className="id-team-user-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="id-team-user-ids" style={{ color }}>{idsPct}</span>
      <span className="id-team-user-q">{user.queryCount}q</span>
    </div>
  )
}

function TeamIdsSection() {
  const { data } = useTeamIds(true)
  if (!data || data.perUser.length === 0) return null

  const isTeam = data.userCount > 1
  const teamIdsPct = Math.round(data.teamIds * 100)
  const teamColor = teamIdsPct >= 70 ? '#22c55e' : teamIdsPct >= 40 ? '#f59e0b' : '#f97316'
  const maxIds = data.perUser[0]?.ids ?? 1

  return (
    <div className="id-team-section">
      <div className="id-team-header">
        <span className="id-team-title">{isTeam ? '👥 Team Intelligence' : '👤 Your Intelligence'}</span>
        <div className="id-team-score-wrap">
          <span className="id-team-score" style={{ color: teamColor }}>{teamIdsPct}</span>
          <span className="id-team-score-denom">/100</span>
          {isTeam && <span className="id-team-user-count">{data.userCount} contributors</span>}
        </div>
      </div>
      <div className="id-ids-track" style={{ marginBottom: 10 }}>
        <div className="id-ids-fill" style={{ width: `${teamIdsPct}%`, background: teamColor }} />
        <div className="id-ids-threshold" title="IDS 70 = moat threshold" />
      </div>
      <div className="id-team-rows">
        {data.perUser.map(u => <UserIdsBar key={u.userId} user={u} maxIds={maxIds} />)}
      </div>
    </div>
  )
}

// ── Sub-sections ─────────────────────────────────────────────────────────────

function SectionCard({ title, count, badge, badgeColor, viewLabel, onView, children }: {
  title: string; count?: string; badge?: string; badgeColor?: string
  viewLabel: string; onView: () => void; children: React.ReactNode
}) {
  return (
    <div className="id-card">
      <div className="id-card-head">
        <div className="id-card-title-row">
          <span className="id-card-title">{title}</span>
          {count && <span className="id-card-count">{count}</span>}
          {badge && <span className="id-card-badge" style={{ background: badgeColor + '22', color: badgeColor, border: `1px solid ${badgeColor}44` }}>{badge}</span>}
        </div>
        <button className="id-view-all" onClick={onView}>{viewLabel} →</button>
      </div>
      <div className="id-card-body">{children}</div>
    </div>
  )
}

function GapsSection({ onView, filters }: { onView: () => void; filters: InsightsFilters }) {
  const { data, isLoading } = useGapIntelligence(true)
  if (isLoading) return <div className="id-loading">Loading gaps…</div>
  if (!data) return null
  const top = data.clusters.slice(0, 4)
  return (
    <SectionCard
      title="🔎 Documentation Gaps"
      count={`${data.totalBlocked} unanswered`}
      badge={data.totalBlocked > 0 ? `${data.totalClusters} clusters` : undefined}
      badgeColor="#f97316"
      viewLabel="View all gaps"
      onView={onView}
    >
      {top.length === 0
        ? <p className="id-empty">No gaps detected. All questions answered so far.</p>
        : top.map(c => (
            <div key={c.label} className="id-row">
              <span className="id-row-label">{c.label}</span>
              <span className="id-row-count">×{c.count}</span>
              {c.trending && <span className="id-row-tag" style={{ color: '#f97316' }}>↑ trending</span>}
              <span className="id-row-action">{ACTION_BADGE[c.actionType] ?? c.actionType}</span>
            </div>
          ))
      }
    </SectionCard>
  )
}

function RiskSection({ onView, filters }: { onView: () => void; filters: InsightsFilters }) {
  void filters // risk is always global — filters noted but not applied (structural health, not trend)
  const { data, isLoading } = useKnowledgeRisk(true)
  if (isLoading) return <div className="id-loading">Loading risk…</div>
  if (!data) return null
  const critical = data.sections.filter(s => s.riskLevel === 'critical')
  const high     = data.sections.filter(s => s.riskLevel === 'high')
  const alerts   = [...critical, ...high].slice(0, 4)
  const alertCount = critical.length + high.length
  return (
    <SectionCard
      title="⚠️ Knowledge Risk"
      count={`${alertCount} alert${alertCount !== 1 ? 's' : ''}`}
      badge={critical.length > 0 ? `${critical.length} critical` : undefined}
      badgeColor="#ef4444"
      viewLabel="View all risk"
      onView={onView}
    >
      {alerts.length === 0
        ? <p className="id-empty">No critical or high-risk sections. Good knowledge coverage.</p>
        : alerts.map(s => (
            <div key={s.section} className="id-row">
              <span className="id-row-label">{s.section}</span>
              <span className="id-row-risk-badge" style={{ color: RISK_COLORS[s.riskLevel] }}>{s.riskLevel.toUpperCase()}</span>
              {s.signals.slice(0, 2).map(sig => (
                <span key={sig} className="id-row-tag">{SIGNAL_ICONS[sig]}</span>
              ))}
              <span className="id-row-score">{s.riskScore.toFixed(2)}</span>
            </div>
          ))
      }
    </SectionCard>
  )
}

function TopicsSection({ onView, filters }: { onView: () => void; filters: InsightsFilters }) {
  const { data, isLoading } = useInsights(true, filters)
  if (isLoading) return <div className="id-loading">Loading topics…</div>
  if (!data) return null
  const top = data.topTopics.slice(0, 5)
  const maxCount = top[0]?.count || 1
  return (
    <SectionCard
      title="🔍 Top Searched Topics"
      count={`${data.totalQueries} total queries`}
      viewLabel="View insights"
      onView={onView}
    >
      {top.length === 0
        ? <p className="id-empty">No query data yet. Start asking questions.</p>
        : top.map(t => (
            <div key={t.topic} className="id-topic-row">
              <div className="id-topic-head">
                <span className="id-topic-name">{t.topic}</span>
                <span className="id-row-count">×{t.count}</span>
                {t.trending && <span className="id-row-tag" style={{ color: '#3b82f6' }}>↑</span>}
              </div>
              <div className="id-topic-bar-wrap">
                <div className="id-topic-bar" style={{ width: `${Math.round((t.count / maxCount) * 100)}%` }} />
              </div>
            </div>
          ))
      }
    </SectionCard>
  )
}

function MemorySection({ onView, filters }: { onView: () => void; filters: InsightsFilters }) {
  void filters // memory uses its own clustering — filters show on topics which is the filtered signal
  const { data, isLoading } = useMemory(true)
  if (isLoading) return <div className="id-loading">Loading memory…</div>
  if (!data) return null
  const top = data.clusters.slice(0, 4)
  return (
    <SectionCard
      title="🧠 Organisational Memory"
      count={`${data.clusters.length} cluster${data.clusters.length !== 1 ? 's' : ''}`}
      viewLabel="View memory"
      onView={onView}
    >
      {top.length === 0
        ? <p className="id-empty">No recurring patterns yet. Topics appear after 3+ similar queries.</p>
        : top.map(c => (
            <div key={c.label} className="id-row">
              <span className="id-row-label">{c.trending ? '🔥 ' : ''}{c.label}</span>
              <span className="id-row-count">{c.count} quer{c.count === 1 ? 'y' : 'ies'}</span>
              {c.trending && <span className="id-row-tag" style={{ color: '#f97316' }}>trending</span>}
            </div>
          ))
      }
    </SectionCard>
  )
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ snapshots }: { snapshots: IntelligenceSnapshot[] }) {
  if (snapshots.length < 2) return null
  const values = snapshots.map(s => s.ids * 100)
  const min = Math.max(0, Math.min(...values) - 5)
  const max = Math.min(100, Math.max(...values) + 5)
  const range = max - min || 1
  const W = 160; const H = 32; const pad = 4
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

function DeltaBadge({ value, unit = '', invert = false }: { value: number; unit?: string; invert?: boolean }) {
  const positive = invert ? value < 0 : value > 0
  const color = value === 0 ? 'var(--text-m)' : positive ? '#22c55e' : '#ef4444'
  const arrow = value > 0 ? '↑' : value < 0 ? '↓' : '→'
  return (
    <span className="id-delta-badge" style={{ color }}>
      {arrow} {value > 0 ? '+' : ''}{value}{unit}
    </span>
  )
}

// ── RAGAS quality tile ────────────────────────────────────────────────────────

function RagasQualityTile({ onView }: { onView: () => void }) {
  const { data } = useRagasStatus(false)
  const latest = data?.latest

  const fmtPct = (v: number | null | undefined) =>
    v !== null && v !== undefined ? Math.round(v * 100) + '%' : '—'
  const scoreColor = (v: number | null | undefined) =>
    v === null || v === undefined ? 'var(--text-m)' : v >= 0.80 ? '#22c55e' : v >= 0.60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="ragas-quality-tile">
      <div className="ragas-tile-header">
        <span className="ragas-tile-title">⚡ Retrieval Quality</span>
        <button className="id-view-all" onClick={onView}>Evaluate →</button>
      </div>
      {latest ? (
        <div className="ragas-tile-scores">
          <div className="ragas-tile-metric">
            <span className="ragas-tile-metric-val" style={{ color: scoreColor(latest.faithfulness) }}>
              {fmtPct(latest.faithfulness)}
            </span>
            <span className="ragas-tile-metric-label">Faithfulness</span>
          </div>
          <div className="ragas-tile-metric">
            <span className="ragas-tile-metric-val" style={{ color: scoreColor(latest.contextPrecision) }}>
              {fmtPct(latest.contextPrecision)}
            </span>
            <span className="ragas-tile-metric-label">Precision</span>
          </div>
          <div className="ragas-tile-metric">
            <span className="ragas-tile-metric-val" style={{ color: scoreColor(latest.contextRecall) }}>
              {fmtPct(latest.contextRecall)}
            </span>
            <span className="ragas-tile-metric-label">Recall</span>
          </div>
          <div className="ragas-tile-meta">
            Last run: {new Date(latest.ts).toLocaleDateString()} · {latest.evaluatedItems} items
            {data?.rerankerEnabled && <span className="ragas-tile-flag">reranker ✓</span>}
          </div>
        </div>
      ) : (
        <p className="ragas-tile-empty">
          No evaluation run yet. Click "Evaluate →" to measure retrieval quality.
        </p>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function IntelligenceDashboard({ onBack, onNavigate }: Props) {
  const qc = useQueryClient()
  const [filters, setFilters] = useState<InsightsFilters>(DEFAULT_FILTERS)
  const { data: insights }  = useInsights(true, filters)
  const { data: riskData }  = useKnowledgeRisk(true)
  const { data: gapsData }  = useGapIntelligence(true)
  const { data: memory }    = useMemory(true)
  const { data: health }    = useHealth(true)
  const { data: history }   = useIntelligenceHistory(true)

  const ids = computeIDS(
    insights  ? { overallSuccessRate: insights.overallSuccessRate, totalQueries: insights.totalQueries } : null,
    memory    ? { clusters: memory.clusters } : null,
    gapsData  ? { totalBlocked: gapsData.totalBlocked } : null,
    riskData  ? { totalSections: riskData.totalSections } : null,
    health    ? { sections: health.sections } : null,
  )
  const { label: idsLabel_, color: idsColor } = idsLabel(ids)
  const idsPct = Math.round(ids * 100)

  const avgHealth = health && health.sections.length > 0
    ? Math.round(health.sections.reduce((s, x) => s + x.score, 0) / health.sections.length)
    : null

  const criticalRisk = riskData ? riskData.criticalCount + riskData.highCount : null

  return (
    <div className="panel-wrap">
      <div className="panel-header">
        <button className="panel-back-btn" onClick={onBack}>← Back</button>
        <h2 className="panel-title">🧠 Intelligence Dashboard</h2>
        {insights && insights.totalQueries > 0 && (
          <button
            className="id-header-snapshot-btn"
            title="Save a snapshot of today's intelligence state"
            onClick={async () => {
              await forceSnapshot()
              qc.invalidateQueries({ queryKey: ['intelligence-history'] })
            }}
          >
            📸 Snapshot
          </button>
        )}
      </div>

      {/* IDS Score */}
      <div className="id-ids-bar">
        <div className="id-ids-left">
          <span className="id-ids-label">Intelligence Density Score</span>
          <span className="id-ids-score" style={{ color: idsColor }}>{idsPct}</span>
          <span className="id-ids-denom">/100</span>
        </div>
        <div className="id-ids-track">
          <div className="id-ids-fill id-ids-fill--gradient" style={{ width: `${idsPct}%` }} />
          <div className="id-ids-threshold">
            <span className="id-ids-threshold-label">70</span>
          </div>
        </div>
        <span className="id-ids-desc" style={{ color: idsColor }}>{idsLabel_}</span>
      </div>

      {/* Trend banner — shown when we have 2+ snapshots */}
      {history && history.snapshots.length >= 2 && (() => {
        const d = history.latestDelta
        const allZero = d && d.ids === 0 && d.totalQueries === 0 && d.clusterCount === 0 && d.totalBlocked === 0
        const last = history.snapshots[history.snapshots.length - 1]
        return (
          <div className="id-trend-banner">
            <div className="id-trend-left">
              <span className="id-trend-label">
                Since {new Date(last.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
              {allZero
                ? <span className="id-trend-no-change">No change yet — use the product and take another snapshot to see your progress.</span>
                : d && (
                  <div className="id-trend-deltas">
                    <span className="id-trend-item">IDS <DeltaBadge value={d.ids} unit=" pts" /></span>
                    <span className="id-trend-sep">·</span>
                    <span className="id-trend-item">Queries <DeltaBadge value={d.totalQueries} /></span>
                    <span className="id-trend-sep">·</span>
                    <span className="id-trend-item">Clusters <DeltaBadge value={d.clusterCount} /></span>
                    <span className="id-trend-sep">·</span>
                    <span className="id-trend-item">Gaps <DeltaBadge value={d.totalBlocked} invert /></span>
                    <span className="id-trend-sep">·</span>
                    <span className="id-trend-item">Health <DeltaBadge value={d.avgHealthScore} unit=" pts" /></span>
                  </div>
                )
              }
            </div>
            {!allZero && <Sparkline snapshots={history.snapshots} />}
          </div>
        )
      })()}

      {/* Snapshot prompt — shown when < 2 snapshots and there is query data */}
      {history && history.snapshots.length < 2 && insights && insights.totalQueries > 0 && (
        <div className="id-snapshot-prompt">
          <span>
            {history.snapshots.length === 0
              ? 'Take your first intelligence snapshot to start tracking IDS over time.'
              : 'First snapshot saved. Use the product, then take another to see your progress.'}
          </span>
          {history.snapshots.length === 0 && (
            <button
              className="id-snapshot-btn"
              onClick={async () => {
                await forceSnapshot()
                qc.invalidateQueries({ queryKey: ['intelligence-history'] })
              }}
            >
              📸 Save snapshot
            </button>
          )}
        </div>
      )}

      {/* KPI row */}
      <div className="id-kpi-row">
        <div className="id-kpi" onClick={() => onNavigate('insights')} title="Open Insights">
          <span className="id-kpi-num" style={{ color: insights ? (insights.overallSuccessRate >= 0.7 ? '#22c55e' : insights.overallSuccessRate >= 0.4 ? '#f59e0b' : '#ef4444') : undefined }}>
            {insights ? Math.round(insights.overallSuccessRate * 100) + '%' : '–'}
          </span>
          <span className="id-kpi-label">Answered</span>
        </div>
        <div className="id-kpi" onClick={() => onNavigate('gaps')} title="Open Gaps">
          <span className="id-kpi-num" style={{ color: gapsData && gapsData.totalBlocked > 0 ? '#f97316' : '#22c55e' }}>
            {gapsData ? gapsData.totalBlocked : '–'}
          </span>
          <span className="id-kpi-label">Open Gaps</span>
        </div>
        <div className="id-kpi" onClick={() => onNavigate('risk')} title="Open Risk">
          <span className="id-kpi-num" style={{ color: criticalRisk != null && criticalRisk > 0 ? '#ef4444' : '#22c55e' }}>
            {criticalRisk != null ? criticalRisk : '–'}
          </span>
          <span className="id-kpi-label">Risk Alerts</span>
        </div>
        <div className="id-kpi" onClick={() => onNavigate('memory')} title="Open Memory">
          <span className="id-kpi-num">{memory ? memory.clusters.length : '–'}</span>
          <span className="id-kpi-label">Mem Clusters</span>
        </div>
        <div className="id-kpi" onClick={() => onNavigate('health')} title="Open Health">
          <span className="id-kpi-num" style={{ color: avgHealth != null ? (avgHealth >= 80 ? '#22c55e' : avgHealth >= 50 ? '#f59e0b' : '#ef4444') : undefined }}>
            {avgHealth != null ? avgHealth + '%' : '–'}
          </span>
          <span className="id-kpi-label">Avg Health</span>
        </div>
        <div className="id-kpi" onClick={() => onNavigate('insights')} title="Open Insights">
          <span className="id-kpi-num">{insights ? insights.totalQueries : '–'}</span>
          <span className="id-kpi-label">Total Queries</span>
        </div>
      </div>

      {/* Retrieval Quality (RAGAS) tile */}
      <RagasQualityTile onView={() => onNavigate('ragas')} />

      {/* Team IDS */}
      <TeamIdsSection />

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        totalUnfiltered={insights?.totalUnfiltered}
        filteredCount={insights?.filtered ? insights.totalQueries : undefined}
      />

      {/* Dimension cards */}
      <div className="id-grid">
        <GapsSection    onView={() => onNavigate('gaps')}     filters={filters} />
        <RiskSection    onView={() => onNavigate('risk')}     filters={filters} />
        <TopicsSection  onView={() => onNavigate('insights')} filters={filters} />
        <MemorySection  onView={() => onNavigate('memory')}   filters={filters} />
      </div>
    </div>
  )
}
