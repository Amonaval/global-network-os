import { useState } from 'react'
import { useKnowledgeMap, useKnowledgeSummary, useMemory } from '../../hooks/useApi'
import type { KnowledgeMapData } from '../../types'

interface Props {
  onBack: () => void
}

export function KnowledgeMapPanel({ onBack }: Props) {
  const [query, setQuery]         = useState('')
  const [submitted, setSubmitted] = useState('')
  const { data: memoryData }      = useMemory(true)

  const suggestions = memoryData?.clusters
    .slice(0, 3)
    .map(c => c.label) ?? []

  const search = (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    setQuery(trimmed)
    setSubmitted(trimmed)
  }

  return (
    <div className="analytics-panel" style={{ display: 'flex' }}>
      <div className="analytics-header">
        <button className="analytics-back-btn" onClick={onBack}>← Back to Chat</button>
        <span className="analytics-title">🗺️ Knowledge Map</span>
      </div>
      <div className="analytics-body">
        <div className="km-search-row">
          <input
            className="km-search-input"
            placeholder="Search your organization's knowledge…  e.g. authentication, deployment, API"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search(query)}
          />
          <button className="km-search-btn" onClick={() => search(query)} disabled={!query.trim()}>
            Search
          </button>
        </div>

        {!submitted && (
          <div className="analytics-empty" style={{ marginTop: 32 }}>
            <p style={{ fontSize: '2rem', margin: '0 0 12px' }}>🗺️</p>
            <p>Search any topic to see what your organization knows across all sources.</p>
            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: 6 }}>
              Documentation · Engineering Decisions · Query Memory · Knowledge Gaps
            </p>
            {suggestions.length > 0 && (
              <div className="km-suggestions">
                <div className="km-suggestions-label">Trending in your org:</div>
                <div className="km-suggestions-chips">
                  {suggestions.map(s => (
                    <button key={s} className="km-suggestion-chip" onClick={() => search(s)}>
                      🔥 {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {submitted && <KnowledgeResults topic={submitted} />}
      </div>
    </div>
  )
}

function KnowledgeResults({ topic }: { topic: string }) {
  const { data, isLoading, error } = useKnowledgeMap(topic, true)
  const { mutate: getSummary, data: summaryData, isPending: summaryPending } = useKnowledgeSummary()

  if (isLoading) return <div className="analytics-loading" style={{ marginTop: 32 }}>Searching all knowledge sources…</div>
  if (error) return <div className="analytics-loading" style={{ marginTop: 32 }}>Error: {error.message}</div>
  if (!data) return null

  const hasAnyResult = data.docSections.length > 0 || data.relatedDecisions.length > 0 || data.memoryCluster || data.gapCluster

  return (
    <div style={{ marginTop: 24 }}>
      <div className="km-topic-header">
        <span className="km-topic-label">"{topic}"</span>
        {!summaryData && (
          <button
            className="km-summary-btn"
            onClick={() => getSummary(data)}
            disabled={summaryPending || !hasAnyResult}
          >
            {summaryPending ? '⏳ Generating…' : '✨ Generate Summary'}
          </button>
        )}
      </div>

      {summaryData && (
        <div className="km-summary-box">
          <div className="km-summary-label">Organizational Knowledge Summary</div>
          <p className="km-summary-text">{summaryData.summary}</p>
        </div>
      )}

      {!hasAnyResult && (
        <div className="analytics-empty" style={{ marginTop: 24 }}>
          <p>No knowledge found for "{topic}".</p>
          <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Try a broader term or check if documentation has been ingested.</p>
        </div>
      )}

      <div className="km-grid">
        <KmDocSection data={data} />
        <KmDecisionsSection data={data} />
        <KmMemorySection data={data} />
        <KmGapsSection data={data} />
      </div>
    </div>
  )
}

function KmDocSection({ data }: { data: KnowledgeMapData }) {
  return (
    <div className="km-card">
      <div className="km-card-header">
        <span className="km-card-icon">📚</span>
        <span className="km-card-title">Documentation Coverage</span>
        <span className="km-card-count">{data.docSections.length}</span>
      </div>
      {data.docSections.length === 0 ? (
        <div className="km-empty">No documentation found</div>
      ) : (
        <div className="km-list">
          {data.docSections.map((s, i) => (
            <div key={i} className="km-doc-item">
              <div className="km-doc-section">{s.section}</div>
              <div className="km-doc-meta">
                {s.chunkCount} chunks · score {s.topScore}
              </div>
              {s.sampleTitles.length > 0 && (
                <div className="km-doc-titles">
                  {s.sampleTitles.map((t, j) => <span key={j} className="km-doc-title-tag">{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function KmDecisionsSection({ data }: { data: KnowledgeMapData }) {
  return (
    <div className="km-card">
      <div className="km-card-header">
        <span className="km-card-icon">⚖️</span>
        <span className="km-card-title">Engineering Decisions</span>
        <span className="km-card-count">{data.relatedDecisions.length}</span>
      </div>
      {data.relatedDecisions.length === 0 ? (
        <div className="km-empty">No related decisions found</div>
      ) : (
        <div className="km-list">
          {data.relatedDecisions.map((d, i) => (
            <div key={i} className="km-decision-item">
              <div className="km-decision-text">{d.decision}</div>
              {d.reason && <div className="km-decision-reason">Why: {d.reason}</div>}
              <div className="km-decision-source">{d.section}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function KmMemorySection({ data }: { data: KnowledgeMapData }) {
  const m = data.memoryCluster
  return (
    <div className="km-card">
      <div className="km-card-header">
        <span className="km-card-icon">🧠</span>
        <span className="km-card-title">Query Memory</span>
        {m && <span className="km-card-count">{m.count} asks</span>}
      </div>
      {!m ? (
        <div className="km-empty">No recurring pattern detected</div>
      ) : (
        <div className="km-list">
          <div className="km-memory-stats">
            <span className="km-stat">{m.count} total</span>
            <span className="km-stat">{m.recentCount} this month</span>
            {m.trending && <span className="km-trending-badge">↑ Trending</span>}
          </div>
          {m.topSections.length > 0 && (
            <div className="km-memory-sections">
              Answered by: {m.topSections.map((s, i) => (
                <span key={i} className="km-section-tag">{s}</span>
              ))}
            </div>
          )}
          <div className="km-memory-questions">
            {m.questions.map((q, i) => (
              <div key={i} className="km-question-item">"{q}"</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function KmGapsSection({ data }: { data: KnowledgeMapData }) {
  const g = data.gapCluster
  return (
    <div className="km-card km-card-gap">
      <div className="km-card-header">
        <span className="km-card-icon">🔎</span>
        <span className="km-card-title">Known Gaps</span>
        {g && <span className="km-card-count km-card-count-bad">{g.count} unanswered</span>}
      </div>
      {!g ? (
        <div className="km-empty km-empty-good">✅ No known gaps on this topic</div>
      ) : (
        <div className="km-list">
          <div className="km-gap-summary">{g.count} unanswered {g.count === 1 ? 'question' : 'questions'} related to "{g.label}"</div>
          <div className="km-memory-questions">
            {g.questions.map((q, i) => (
              <div key={i} className="km-question-item km-question-gap">"{q}"</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
