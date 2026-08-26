import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../../store/appStore'
import { readStream } from '../../hooks/useStream'

export function RebuildPanel() {
  const [phase, setPhase] = useState('Rebuilding knowledge base…')
  const [log, setLog] = useState('')
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const { setRebuildPanelOpen } = useAppStore()
  const qc = useQueryClient()

  const appendLog = useCallback((msg: string) => setLog(prev => prev + msg + '\n'), [])

  const runRebuild = useCallback(async () => {
    setLog('')
    setStatus(null)
    try { await fetch('/api/setup/cancel', { method: 'POST' }) } catch (_) {}

    try {
      const res = await fetch('/api/setup/rebuild', { method: 'POST' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        setStatus({ type: 'err', msg: err.error || 'Failed' })
        return
      }
      await readStream(res, {
        onPhase: msg => { setPhase(msg); appendLog('\n' + msg) },
        onLog: msg => appendLog(msg),
        onDone: msg => {
          setStatus({ type: 'ok', msg })
          qc.invalidateQueries({ queryKey: ['stats'] })
          qc.invalidateQueries({ queryKey: ['sections'] })
        },
        onError: msg => setStatus({ type: 'err', msg }),
      })
    } catch (err) {
      setStatus({ type: 'err', msg: err instanceof Error ? err.message : 'Network error' })
    }
  }, [appendLog, qc])

  // Auto-start on mount
  useState(() => { runRebuild() })

  return (
    <div className="rebuild-panel" style={{ display: 'block' }}>
      <div className="rebuild-header">
        <span>{phase}</span>
        <button className="rebuild-close" onClick={() => setRebuildPanelOpen(false)}>×</button>
      </div>
      <div className="rebuild-log-wrap">
        <pre>{log}</pre>
      </div>
      {status && (
        <div>
          {status.type === 'ok'
            ? <span className="rebuild-ok">✅ {status.msg}</span>
            : <span className="rebuild-err">❌ {status.msg}</span>
          }
        </div>
      )}
    </div>
  )
}
