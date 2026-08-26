import { useState } from 'react'
import { useGenerateOnboarding } from '../../hooks/useApi'
import { useAppStore } from '../../store/appStore'
import type { OnboardingPathItem, OnboardingResult, OnboardPriority } from '../../types'

interface Props {
  onBack: () => void
}

export function OnboardingPanel({ onBack }: Props) {
  const [role, setRole]   = useState('')
  const [topic, setTopic] = useState('')
  const generate = useGenerateOnboarding()

  const handleGenerate = () => {
    if (!role.trim()) return
    generate.mutate({ role: role.trim(), topic: topic.trim() || undefined })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) handleGenerate()
  }

  return (
    <div className="analytics-panel" style={{ display: 'flex' }}>
      <div className="analytics-header">
        <button className="analytics-back-btn" onClick={onBack}>← Back to Chat</button>
        <span className="analytics-title">🎓 Onboarding Assistant</span>
      </div>

      <div className="analytics-body">
        <div className="onboard-form">
          <div className="onboard-form-title">Generate a personalized learning path from your indexed documentation.</div>

          <div className="onboard-inputs">
            <div className="onboard-field">
              <label className="onboard-label">Your role *</label>
              <input
                className="onboard-input"
                type="text"
                placeholder="e.g. new backend engineer, frontend contractor, DevOps lead"
                value={role}
                onChange={e => setRole(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={generate.isPending}
              />
            </div>
            <div className="onboard-field">
              <label className="onboard-label">Focus area <span style={{ opacity: 0.5 }}>(optional)</span></label>
              <input
                className="onboard-input"
                type="text"
                placeholder="e.g. authentication, deployment, API design"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={generate.isPending}
              />
            </div>
          </div>

          <button
            className="onboard-generate-btn"
            onClick={handleGenerate}
            disabled={generate.isPending || !role.trim()}
          >
            {generate.isPending ? '⏳ Generating path…' : '🎓 Generate Learning Path'}
          </button>
        </div>

        {generate.isError && (
          <div className="onboard-error">
            {(generate.error as Error)?.message ?? 'Failed to generate learning path'}
          </div>
        )}

        {generate.data && (
          <OnboardResult result={generate.data} onBack={onBack} />
        )}
      </div>
    </div>
  )
}

function OnboardResult({ result, onBack }: { result: OnboardingResult; onBack: () => void }) {
  const startItems  = result.path.filter(p => p.priority === 'start')
  const nextItems   = result.path.filter(p => p.priority === 'next')
  const laterItems  = result.path.filter(p => p.priority === 'later')
  const totalMins   = result.path
    .filter(p => p.priority !== 'skip')
    .reduce((sum, p) => sum + p.estimatedReadMins, 0)

  return (
    <div className="onboard-result">
      <div className="onboard-result-header">
        <div className="onboard-result-role">
          Learning path for: <strong>{result.role}</strong>
          {result.topic && <span className="onboard-result-topic"> · {result.topic}</span>}
        </div>
        {result.summary && <div className="onboard-result-summary">{result.summary}</div>}
        <div className="onboard-result-meta">
          {result.path.filter(p => p.priority !== 'skip').length} sections · ~{totalMins} min total
        </div>
      </div>

      {startItems.length > 0 && (
        <PathGroup
          title="🟢 Start Here"
          subtitle="read in your first week"
          items={startItems}
          onBack={onBack}
        />
      )}
      {nextItems.length > 0 && (
        <PathGroup
          title="🔵 Read Next"
          subtitle="complete in your first month"
          items={nextItems}
          onBack={onBack}
        />
      )}
      {laterItems.length > 0 && (
        <PathGroup
          title="⬜ Later"
          subtitle="useful context, not urgent"
          items={laterItems}
          onBack={onBack}
        />
      )}
    </div>
  )
}

function PathGroup({
  title, subtitle, items, onBack,
}: {
  title: string
  subtitle: string
  items: OnboardingPathItem[]
  onBack: () => void
}) {
  return (
    <div className="analytics-section">
      <div className="analytics-section-title">
        {title}
        <span className="analytics-badge" style={{ marginLeft: 8 }}>{subtitle}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        {items.map(item => (
          <PathCard key={item.section} item={item} onBack={onBack} />
        ))}
      </div>
    </div>
  )
}

function PathCard({ item, onBack }: { item: OnboardingPathItem; onBack: () => void }) {
  const startReading = () => {
    useAppStore.getState().setSelectedSection(item.section)
    onBack()
  }

  return (
    <div className="gap-card onboard-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="gap-card-header" style={{ marginBottom: 4 }}>
            <span className="gap-label">{item.section}</span>
            <span className="onboard-read-time">~{item.estimatedReadMins} min</span>
            {item.queries === 0 && (
              <span className="onboard-unvalidated" title="No query history — content not yet tested by your team">
                ⚠️ unvalidated
              </span>
            )}
          </div>
          <div className="gap-meta">{item.reason}</div>
        </div>
        <button className="onboard-read-btn" onClick={startReading}>
          → Read
        </button>
      </div>
    </div>
  )
}
