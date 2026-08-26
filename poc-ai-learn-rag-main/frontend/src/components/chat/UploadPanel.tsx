import { useRef, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useUploads, useDeleteUpload } from '../../hooks/useApi'
import { readStream } from '../../hooks/useStream'
import { fileIcon, formatBytes } from '../../utils/format'

interface Props {
  onClose: () => void
}

export function UploadPanel({ onClose }: Props) {
  const [log, setLog] = useState('')
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  const { data: uploadsData, refetch } = useUploads(true)
  const deleteUpload = useDeleteUpload()

  const appendLog = useCallback((msg: string) => setLog(prev => prev + msg + '\n'), [])

  const uploadFiles = useCallback(async (files: File[]) => {
    if (!files.length) return
    setLog('')
    setStatus(null)
    setUploading(true)

    const formData = new FormData()
    for (const file of files) formData.append('files', file)

    try {
      const res = await fetch('/api/docs/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        setStatus({ type: 'err', msg: err.error || 'Upload failed' })
        return
      }
      await readStream(res, {
        onPhase: msg => appendLog('\n' + msg),
        onLog: msg => appendLog(msg),
        onDone: msg => {
          setStatus({ type: 'ok', msg })
          qc.invalidateQueries({ queryKey: ['uploads'] })
          qc.invalidateQueries({ queryKey: ['stats'] })
          qc.invalidateQueries({ queryKey: ['sections'] })
        },
        onError: msg => setStatus({ type: 'err', msg }),
      })
    } catch (err) {
      setStatus({ type: 'err', msg: err instanceof Error ? err.message : 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }, [appendLog, qc])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    uploadFiles(Array.from(e.dataTransfer.files))
  }, [uploadFiles])

  const handleDelete = (name: string) => {
    if (!confirm(`Remove "${name}" and its indexed chunks?`)) return
    deleteUpload.mutate(name)
  }

  const uploads = uploadsData?.uploads ?? []

  return (
    <div className="upload-panel" style={{ display: 'block' }}>
      <div className="upload-panel-header">
        <span>📎 Upload Documents</span>
        <button className="rebuild-close" onClick={onClose}>×</button>
      </div>
      <div className="upload-body">
        <div
          className="upload-drop-zone"
          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over') }}
          onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
          onDrop={handleDrop}
        >
          <div className="upload-drop-icon">📄</div>
          <div className="upload-drop-text">
            Drop files here or{' '}
            <label className="upload-browse-label" htmlFor="fileInput">browse</label>
          </div>
          <div className="upload-drop-hint">PDF · DOCX · TXT · MD · ZIP &nbsp;·&nbsp; JS · TS · PY · GO · CSS · Vue · Svelte · GraphQL · YAML · SQL · and more &nbsp;·&nbsp; Max 50 MB</div>
          <input
            ref={fileInputRef}
            type="file"
            id="fileInput"
            multiple
            accept=".pdf,.docx,.txt,.md,.html,.zip,.js,.jsx,.ts,.tsx,.py,.rb,.go,.java,.rs,.cpp,.c,.cs,.swift,.kt,.php,.sh,.css,.scss,.less,.sass,.vue,.svelte,.yaml,.yml,.json,.toml,.ini,.xml,.env,.sql,.graphql,.gql,.tf,.proto"
            onChange={e => { uploadFiles(Array.from(e.target.files ?? [])); e.target.value = '' }}
            style={{ display: 'none' }}
          />
        </div>

        {(uploading || log) && (
          <div>
            <div className="rebuild-log-wrap" style={{ maxHeight: 140 }}>
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
        )}

        <div className="uploaded-files-list">
          {uploads.length === 0
            ? <div className="upload-empty">No documents uploaded yet</div>
            : (
              <>
                <div className="upload-file-header">Uploaded files ({uploads.length})</div>
                {uploads.map(f => (
                  <div key={f.name} className="upload-file-item">
                    <span className="upload-file-icon">{fileIcon(f.originalName || f.name)}</span>
                    <div className="upload-file-info">
                      <span className="upload-file-name">{f.originalName || f.name}</span>
                      <span className="upload-file-meta">{f.chunks} chunks · {formatBytes(f.size)}</span>
                    </div>
                    <button className="upload-file-del" title="Remove" onClick={() => handleDelete(f.name)}>🗑</button>
                  </div>
                ))}
              </>
            )
          }
        </div>
      </div>
    </div>
  )
}
