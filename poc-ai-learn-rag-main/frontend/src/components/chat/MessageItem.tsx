import { useState } from 'react'
import { renderMarkdownWithCitations } from '../../utils/markdown'
import { formatSectionName } from '../../utils/format'
import type { ChatMessage } from '../../types'

interface Props {
  message: ChatMessage
  onSuggestSection: (sec: string) => void
  onLicenseUpgrade: () => void
}

export function MessageItem({ message, onSuggestSection, onLicenseUpgrade }: Props) {
  const [sourcesOpen, setSourcesOpen] = useState(true)
  const { role, text, isTyping, isStreaming, isError, errorType, isLimitReached, sources, debug, suggestions } = message

  if (role === 'user') {
    return (
      <div className="message user">
        <div className="avatar">You</div>
        <div className="bubble">{text}</div>
      </div>
    )
  }

  // Restore marker (special assistant message with no bubble styling)
  if (message.id === 'restore-marker') {
    return <div className="restore-banner">{text}</div>
  }

  if (isTyping) {
    return (
      <div className="message ai">
        <div className="avatar">AI</div>
        <div className="bubble">
          <div className="typing">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="message ai">
        <div className="avatar">AI</div>
        <div className="bubble">
          {errorType === 'ollama' ? (
            <div className="error-bubble ollama-error">
              <strong>⚠️ Ollama is not running</strong><br /><br />
              1. Open a terminal → run <code>ollama serve</code><br />
              2. Pull a model: <code>ollama pull llama3.2</code><br />
              3. Refresh and try again<br /><br />
              <small>{text}</small>
            </div>
          ) : (
            <div className="error-bubble">
              <strong>⚠️ {text}</strong>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isLimitReached) {
    return (
      <div className="message ai limit-reached-message">
        <div className="bubble limit-reached-bubble">
          <div className="limit-reached-text">{text}</div>
          <button className="limit-upgrade-btn" onClick={onLicenseUpgrade}>
            ✦ Upgrade to Pro — Unlimited queries
          </button>
        </div>
      </div>
    )
  }

  // Deduplicate source chips by URL for display (citations still use full sources array)
  const uniqueSources = sources
    ? sources.filter((s, i) => {
        if (!s.url) return i === sources.findIndex(x => !x.url)
        return sources.findIndex(x => x.url === s.url) === i
      })
    : []

  return (
    <div className={`message ai${isStreaming ? ' streaming' : ''}`}>
      <div className="avatar">AI</div>
      <div className="bubble">
        <div
          className="answer-content"
          dangerouslySetInnerHTML={{ __html: renderMarkdownWithCitations(text, sources || []) }}
        />

        {uniqueSources.length > 0 && (
          <div className="sources">
            <button className="sources-toggle" onClick={() => setSourcesOpen(o => !o)}>
              <span className={`sources-chevron${sourcesOpen ? ' open' : ''}`}>›</span>
              Sources <span className="sources-count">({uniqueSources.length})</span>
            </button>
            {sourcesOpen && (
              <div className="source-chips">
                {uniqueSources.map((s, i) => {
                  const label = s.title || formatSectionName(s.section)
                  const breadcrumb = [formatSectionName(s.section), s.nearHeading].filter(Boolean).join(' › ')
                  const score = s.score || 0
                  const tier = score >= 0.5 ? 'high' : score >= 0.3 ? 'mid' : 'low'
                  const tooltip = s.snippet ? `${label} — ${s.snippet}` : label
                  const inner = (
                    <>
                      <span className="source-chip-main">
                        📄 {label}
                        <span className={`rel-dot rel-dot--${tier}`} />
                      </span>
                      {breadcrumb !== label && (
                        <span className="source-chip-sub">{breadcrumb}</span>
                      )}
                    </>
                  )
                  return s.url
                    ? <a key={i} className="source-chip source-chip--link" href={s.url} target="_blank" rel="noopener" title={tooltip}>{inner}</a>
                    : <div key={i} className="source-chip" title={tooltip}>{inner}</div>
                })}
              </div>
            )}
          </div>
        )}

        {uniqueSources.length === 0 && suggestions && suggestions.length > 0 && (
          <div className="not-found-suggestions">
            <span className="nf-label">📍 Related sections to explore:</span>
            {suggestions.map(sec => (
              <button key={sec} className="nf-section-btn" onClick={() => onSuggestSection(sec)}>
                {formatSectionName(sec)}
              </button>
            ))}
          </div>
        )}

        {debug && (
          <div className="debug-line">
            <span>📦 {debug.usedChunks}/{debug.usedChunks + debug.droppedLow + debug.droppedDupe} chunks</span>
            <span>🪙 ~{debug.budgetUsed} ctx tokens</span>
            {debug.droppedLow > 0 && <span>⬇️ {debug.droppedLow} low-score</span>}
            {debug.droppedDupe > 0 && <span>🔁 {debug.droppedDupe} deduped</span>}
          </div>
        )}
      </div>
    </div>
  )
}
