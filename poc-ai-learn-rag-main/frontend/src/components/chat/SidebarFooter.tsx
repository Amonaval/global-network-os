import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../../store/appStore'
import { useStats, useLicense } from '../../hooks/useApi'

const USER_KEY = 'kh_user_name'

function getUserName() {
  return localStorage.getItem(USER_KEY) || 'default'
}

interface Props {
  onShowLicense: () => void
}

export function SidebarFooter({ onShowLicense }: Props) {
  const { setRebuildPanelOpen } = useAppStore()
  const { data: stats } = useStats()
  const { data: license } = useLicense()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(false)
  const [userName, setUserName] = useState(getUserName)
  const [userInput, setUserInput] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!settingsOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setSettingsOpen(false)
    }
    setTimeout(() => document.addEventListener('click', handler), 0)
    return () => document.removeEventListener('click', handler)
  }, [settingsOpen])

  const modelLabel = stats
    ? stats.llmProvider === 'ollama' ? stats.ollamaModel || 'ollama'
    : stats.llmProvider === 'vllm' ? stats.vllmModel || 'vllm'
    : 'Claude'
    : '—'

  const embLabel = stats
    ? stats.embeddingProvider === 'nomic' ? '🧠 nomic'
    : stats.embeddingProvider === 'openai' ? '☁️ openai'
    : '📊 tfidf'
    : '📊 tfidf'

  const hybridLabel = stats
    ? stats.hybridWeight === 0 ? '🔷 semantic'
    : stats.hybridWeight === 1 ? '🔶 BM25'
    : '⚡ hybrid'
    : '⚡ hybrid'

  const handleReset = async () => {
    if (!confirm('This will delete all indexed data and redirect to the setup wizard. Are you sure?')) return
    setSettingsOpen(false)
    try { await fetch('/api/setup/reset', { method: 'POST' }) } catch (_) {}
    window.location.href = '/setup'
  }

  const handleRebuild = () => {
    if (!confirm('Re-crawl all sections and rebuild the knowledge base? This may take several minutes.')) return
    setSettingsOpen(false)
    setRebuildPanelOpen(true)
  }

  const startEditUser = () => {
    setUserInput(userName === 'default' ? '' : userName)
    setEditingUser(true)
  }

  const saveUser = () => {
    const name = userInput.trim() || 'default'
    localStorage.setItem(USER_KEY, name)
    setUserName(name)
    setEditingUser(false)
  }

  return (
    <div className="sidebar-footer">
      <div className="sidebar-stats-line">
        <span>{(stats?.totalChunks ?? 0).toLocaleString()}</span> chunks &middot; <span>{modelLabel}</span>
      </div>
      <div className="sidebar-badges">
        <span className="mode-badge" title="Embedding mode">{embLabel}</span>
        <span className="mode-badge" title="Search mode">{hybridLabel}</span>
      </div>

      <div className="sidebar-actions">
        <div className="sidebar-settings-wrap" ref={menuRef}>
          <button
            className="sidebar-action-btn"
            onClick={e => { e.stopPropagation(); setSettingsOpen(o => !o) }}
            title="Settings"
          >
            <span className="sa-icon">⚙</span><span className="sa-label">Settings</span><span className="sa-caret">▾</span>
          </button>
          <div className={`sidebar-settings-menu${settingsOpen ? ' open' : ''}`}>
            <button className="settings-menu-item" onClick={() => { window.location.href = '/setup'; setSettingsOpen(false) }}>⚙&nbsp; Reconfigure</button>
            <button className="settings-menu-item" onClick={handleRebuild}>🔄&nbsp; Rebuild Index</button>
            <button className="settings-menu-item settings-menu-danger" onClick={handleReset}>🗑&nbsp; Reset Knowledge Base</button>
          </div>
        </div>
      </div>

      <div className="sidebar-user-row">
        {editingUser ? (
          <form
            className="sidebar-user-edit"
            onSubmit={e => { e.preventDefault(); saveUser() }}
          >
            <input
              className="sidebar-user-input"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              placeholder="your name"
              autoFocus
            />
            <button type="submit" className="sidebar-user-save">✓</button>
            <button type="button" className="sidebar-user-cancel" onClick={() => setEditingUser(false)}>✕</button>
          </form>
        ) : (
          <button className="sidebar-user-btn" onClick={startEditUser} title="Set your name for team tracking">
            <span className="sidebar-user-icon">👤</span>
            <span className="sidebar-user-name">{userName}</span>
            <span className="sidebar-user-edit-hint">edit</span>
          </button>
        )}
      </div>

      <div className="license-footer">
        <span
          className="license-badge"
          style={{ background: license?.tierColor || '#6b7280', color: '#fff' }}
          onClick={onShowLicense}
          title="License status"
        >{license?.tierName ?? 'Free'}</span>
        {license?.tier === 'free' && (
          <button className="upgrade-link" onClick={onShowLicense}>✦ Upgrade to Pro</button>
        )}
      </div>
    </div>
  )
}
