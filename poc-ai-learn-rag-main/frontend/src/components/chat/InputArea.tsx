import { useState, useRef, useCallback } from 'react'
import { useAppStore } from '../../store/appStore'
import { useSections } from '../../hooks/useApi'

interface Props {
  onSend: (text: string) => void
}

export function InputArea({ onSend }: Props) {
  const [value, setValue] = useState('')
  const { loading, selectedSections, clearSections, pinnedChunkIds, clearPins, setActivePanel } = useAppStore()
  const { data: sectionsData } = useSections()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const sections = sectionsData?.sections ?? []
  const nameMap: Record<string, string> = {}
  for (const s of sections) nameMap[s.section] = s.displayName || s.section

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [])

  const handleSend = useCallback(() => {
    if (!value.trim() || loading) return
    onSend(value.trim())
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, loading, onSend])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const contextLabel = selectedSections.length === 0 ? null
    : selectedSections.length === 1
      ? `Searching in: ${nameMap[selectedSections[0]] || selectedSections[0]}`
      : `Searching in: ${selectedSections.length} sources`

  return (
    <div className="input-area">
      {pinnedChunkIds.length > 0 && (
        <div className="pin-bar">
          <span>📌 {pinnedChunkIds.length} chunk{pinnedChunkIds.length !== 1 ? 's' : ''} pinned — answer will use only these chunks</span>
          <button className="pin-bar-explore" onClick={() => setActivePanel('chunks')} title="Open Chunk Explorer">Manage</button>
          <button className="pin-bar-clear" onClick={clearPins} title="Clear all pins">Clear</button>
        </div>
      )}
      {contextLabel && (
        <div className="context-bar">
          <span>{contextLabel}</span>
          <button onClick={clearSections} title="Remove context">×</button>
        </div>
      )}
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          className="question-input"
          placeholder="Ask a question…"
          rows={1}
          value={value}
          onChange={e => { setValue(e.target.value); autoResize() }}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={loading || !value.trim()}
          title="Send (Enter)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <p className="input-hint">Enter to send · Shift+Enter for new line · Memory retained across page refreshes</p>
    </div>
  )
}
