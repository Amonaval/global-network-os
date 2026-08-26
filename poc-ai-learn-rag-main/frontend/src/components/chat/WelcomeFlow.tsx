import { useRef, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { readStream } from '../../hooks/useStream'
import { formatSectionName } from '../../utils/format'
import type { SectionData } from '../../types'

interface Props {
  onStartChat: (question?: string) => void
}

const DISMISS_KEY = 'kh_welcome_dismissed'

function suggestedQuestions(sections: SectionData[]): string[] {
  const top = sections.slice(0, 3)
  if (!top.length) return [
    'Give me an overview of what is documented here.',
    'What are the main topics covered?',
    'What should I know first?',
  ]
  const [a, b, c] = top
  return [
    `Give me an overview of ${a.section}.`,
    b ? `What are the key concepts in ${b.section}?` : 'What are the main architectural decisions?',
    c ? `What should I know about ${c.section}?` : 'What documentation gaps exist?',
  ]
}

// ── Upload step ───────────────────────────────────────────────────────────────

interface UploadStepProps {
  onDone: (sections: SectionData[], totalChunks: number) => void
}

function UploadStep({ onDone }: UploadStepProps) {
  const [log, setLog]         = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  const appendLog = useCallback((msg: string) => setLog(prev => prev + msg + '\n'), [])

  const uploadFiles = useCallback(async (files: File[]) => {
    if (!files.length) return
    setLog('')
    setError(null)
    setUploading(true)

    const formData = new FormData()
    for (const file of files) formData.append('files', file)

    try {
      const res = await fetch('/api/docs/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        setError(err.error || 'Upload failed')
        setUploading(false)
        return
      }
      await readStream(res, {
        onPhase: msg => appendLog(msg),
        onLog:   msg => appendLog(msg),
        onDone:  async () => {
          qc.invalidateQueries({ queryKey: ['uploads'] })
          qc.invalidateQueries({ queryKey: ['stats'] })
          qc.invalidateQueries({ queryKey: ['sections'] })
          // Fetch sections to build suggestions
          try {
            const r = await fetch('/api/sections')
            const d = await r.json()
            const sections: SectionData[] = d.sections ?? []
            const statsR = await fetch('/api/stats')
            const stats  = await statsR.json()
            onDone(sections, stats.totalChunks ?? 0)
          } catch {
            onDone([], 0)
          }
        },
        onError: msg => { setError(msg); setUploading(false) },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
    }
  }, [appendLog, qc, onDone])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('wf-drop-over')
    uploadFiles(Array.from(e.dataTransfer.files))
  }, [uploadFiles])

  return (
    <div className="wf-step">
      <div className="wf-step-icon">📄</div>
      <h3 className="wf-step-title">Add your first document</h3>
      <p className="wf-step-sub">
        Drop any doc below — PDF, DOCX, TXT, MD, or HTML.
        Knowledge Hub will index it and your intelligence layer begins.
      </p>

      <div
        className={`wf-drop-zone${uploading ? ' wf-drop-active' : ''}`}
        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('wf-drop-over') }}
        onDragLeave={e => e.currentTarget.classList.remove('wf-drop-over')}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {uploading
          ? <div className="wf-drop-progress">
              <div className="wf-spinner" />
              <span>Indexing your document…</span>
            </div>
          : <>
              <div className="wf-drop-icon">⬆</div>
              <div className="wf-drop-text">Drop a file or click to browse</div>
              <div className="wf-drop-hint">PDF · DOCX · TXT · MD · HTML &nbsp;·&nbsp; Max 50 MB</div>
            </>
        }
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md,.html,.zip"
          onChange={e => { uploadFiles(Array.from(e.target.files ?? [])); e.target.value = '' }}
          style={{ display: 'none' }}
        />
      </div>

      {log && (
        <div className="wf-log">
          <pre>{log.trim()}</pre>
        </div>
      )}
      {error && <div className="wf-error">⚠ {error}</div>}
    </div>
  )
}

// ── Ready step ────────────────────────────────────────────────────────────────

interface ReadyStepProps {
  sections: SectionData[]
  totalChunks: number
  onStartChat: (question?: string) => void
}

function ReadyStep({ sections, totalChunks, onStartChat }: ReadyStepProps) {
  const questions = suggestedQuestions(sections)
  const sectionCount = sections.length

  // Simple IDS approximation: having content at all = 12/100 starting point
  const starterIDS = Math.min(12 + Math.floor(totalChunks / 20), 25)

  return (
    <div className="wf-step">
      <div className="wf-step-icon">✅</div>
      <h3 className="wf-step-title">Your knowledge base is ready</h3>

      <div className="wf-stats-row">
        <div className="wf-stat">
          <span className="wf-stat-num">{totalChunks}</span>
          <span className="wf-stat-label">knowledge chunks</span>
        </div>
        <div className="wf-stat">
          <span className="wf-stat-num">{sectionCount}</span>
          <span className="wf-stat-label">section{sectionCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="wf-stat">
          <span className="wf-stat-num" style={{ color: '#f59e0b' }}>{starterIDS}</span>
          <span className="wf-stat-label">IDS score</span>
        </div>
      </div>

      <div className="wf-ids-wrap">
        <div className="wf-ids-track">
          <div className="wf-ids-fill" style={{ width: `${starterIDS}%` }} />
          <div className="wf-ids-threshold" title="IDS 70 = moat" />
        </div>
        <span className="wf-ids-desc">Intelligence layer activated — growing with every query</span>
      </div>

      <div className="wf-sections-found">
        <span className="wf-sections-label">Sections indexed:</span>
        {sections.slice(0, 5).map(s => (
          <span key={s.section} className="wf-section-chip">{formatSectionName(s.section)}</span>
        ))}
        {sections.length > 5 && <span className="wf-section-more">+{sections.length - 5} more</span>}
      </div>

      <div className="wf-questions">
        <p className="wf-questions-title">Try one of these to get started:</p>
        {questions.map(q => (
          <button key={q} className="wf-question-btn" onClick={() => onStartChat(q)}>
            <span className="wf-question-arrow">→</span> {q}
          </button>
        ))}
      </div>

      <button className="wf-skip-btn" onClick={() => onStartChat()}>
        Open chat without a question
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function WelcomeFlow({ onStartChat }: Props) {
  const [phase, setPhase]         = useState<'upload' | 'ready'>('upload')
  const [sections, setSections]   = useState<SectionData[]>([])
  const [totalChunks, setTotalChunks] = useState(0)

  const handleUploadDone = (s: SectionData[], chunks: number) => {
    setSections(s)
    setTotalChunks(chunks)
    setPhase('ready')
  }

  const handleStartChat = (question?: string) => {
    localStorage.setItem(DISMISS_KEY, '1')
    onStartChat(question)
  }

  return (
    <div className="wf-root">
      {/* Header */}
      <div className="wf-header">
        <div className="wf-logo-mark">K</div>
        <div>
          <h1 className="wf-title">Welcome to Knowledge Hub</h1>
          <p className="wf-subtitle">
            Your organisation's intelligence layer — powered by your own documentation.
          </p>
        </div>
      </div>

      {/* Step */}
      <div className="wf-body">
        {phase === 'upload' && <UploadStep onDone={handleUploadDone} />}
        {phase === 'ready'  && (
          <ReadyStep
            sections={sections}
            totalChunks={totalChunks}
            onStartChat={handleStartChat}
          />
        )}
      </div>

      {/* Progress steps */}
      <div className="wf-steps-row">
        <div className={`wf-step-dot${phase === 'upload' ? ' active' : ' done'}`}>
          <span>{phase === 'upload' ? '1' : '✓'}</span>
          <span className="wf-step-dot-label">Upload</span>
        </div>
        <div className="wf-step-line" />
        <div className={`wf-step-dot${phase === 'ready' ? ' active' : ''}`}>
          <span>2</span>
          <span className="wf-step-dot-label">Insights</span>
        </div>
        <div className="wf-step-line" />
        <div className="wf-step-dot">
          <span>3</span>
          <span className="wf-step-dot-label">Explore</span>
        </div>
      </div>

      {/* Skip link */}
      <button
        className="wf-skip-link"
        onClick={() => { localStorage.setItem(DISMISS_KEY, '1'); onStartChat() }}
      >
        Skip setup and go to chat
      </button>
    </div>
  )
}

export { DISMISS_KEY }
