import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useSessions, useSections, useDeleteSession } from '../../hooks/useApi'
import { formatAgo } from '../../utils/format'
import { SidebarFooter } from './SidebarFooter'
import type { SectionData } from '../../types'

interface Props {
  onNewChat: () => void
  onSwitchSession: (id: string, title: string) => void
  onShowLicense: () => void
}

const TYPE_ICONS: Record<string, string> = {
  confluence: '🔵',
  portal:     '📚',
  'web-pages':'🌐',
  uploads:    '📎',
}

const TYPE_LABELS: Record<string, string> = {
  confluence: 'Confluence',
  portal:     'Doc Portal',
  'web-pages':'Web Pages',
  uploads:    'Uploads',
}

const TYPE_ORDER = ['confluence', 'portal', 'web-pages', 'uploads']

export function Sidebar({ onNewChat, onSwitchSession, onShowLicense }: Props) {
  const { sessionId, selectedSections, sidebarCollapsed, toggleSection, clearSections, toggleSidebar } = useAppStore()
  const { data: sessionsData } = useSessions()
  const { data: sectionsData } = useSections()
  const deleteSession = useDeleteSession()

  const [sectionFilter, setSectionFilter] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [historyOpen, setHistoryOpen] = useState(true)

  const sessions = sessionsData?.sessions ?? []
  const sections = sectionsData?.sections ?? []

  // Group sections by type
  const grouped: Record<string, SectionData[]> = {}
  for (const s of sections) {
    const type = s.type || 'portal'
    if (!grouped[type]) grouped[type] = []
    grouped[type].push(s)
  }

  // Filter by search text (client-side)
  const filterText = sectionFilter.toLowerCase()
  const filteredGrouped: Record<string, SectionData[]> = {}
  for (const type of TYPE_ORDER) {
    if (!grouped[type]) continue
    const filtered = filterText
      ? grouped[type].filter(s =>
          (s.displayName || s.section).toLowerCase().includes(filterText) ||
          s.section.toLowerCase().includes(filterText))
      : grouped[type]
    if (filtered.length > 0) filteredGrouped[type] = filtered
  }

  const totalSections = sections.length
  const activeCount = selectedSections.length

  const toggleGroup = (type: string) =>
    setCollapsed(prev => ({ ...prev, [type]: !prev[type] }))

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteSession.mutate(id)
    if (id === sessionId) onNewChat()
  }

  return (
    <aside className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`} id="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-mark" id="logoMark">K</div>
          <div className="logo-text">
            <span className="logo-title" id="logoTitle">Knowledge Hub</span>
            <span className="logo-sub">Docs Assistant</span>
          </div>
        </div>
        <button className="icon-btn" onClick={toggleSidebar} title="Collapse">&#8249;</button>
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        <span className="btn-icon">＋</span> New conversation
      </button>

      <div className="sidebar-section">
        <button className="section-label-row" onClick={() => setHistoryOpen(o => !o)}>
          <span>Recent conversations</span>
          {sessions.length > 0 && <span className="section-chevron">{historyOpen ? '⌄' : '›'}</span>}
        </button>
        {historyOpen && (
          <div className="history-list">
            {sessions.length === 0
              ? <div className="history-empty">No conversations yet</div>
              : sessions.map(s => (
                  <div
                    key={s.id}
                    className={`history-item${s.id === sessionId ? ' active' : ''}`}
                    onClick={() => onSwitchSession(s.id, s.title)}
                  >
                    <span className="history-icon">💬</span>
                    <div className="history-info">
                      <div className="history-title">{s.title}</div>
                      <div className="history-meta">{s.count} questions · {formatAgo(s.updatedAt)}</div>
                    </div>
                    <button
                      className="history-del"
                      title="Delete"
                      onClick={e => handleDeleteSession(e, s.id)}
                    >×</button>
                  </div>
                ))
            }
          </div>
        )}
      </div>

      {totalSections > 0 && (
        <div className="sidebar-section sources-section">
          <div className="section-label">
            Sources
            {activeCount > 0 && (
              <span className="source-active-badge">{activeCount} active</span>
            )}
          </div>

          <div className="source-controls">
            <button
              className={`source-ctrl-btn${activeCount === 0 ? ' active' : ''}`}
              onClick={clearSections}
              title="Search all sources"
            >All</button>
            <button
              className="source-ctrl-btn"
              onClick={() => {
                const all = sections.map(s => s.section)
                useAppStore.getState().setSelectedSections(all)
              }}
              title="Select all sources"
            >Select all</button>
            <div className="source-search-wrap">
              <input
                className="source-search"
                type="text"
                placeholder="Filter…"
                value={sectionFilter}
                onChange={e => setSectionFilter(e.target.value)}
              />
              {sectionFilter && (
                <button className="source-search-clear" onClick={() => setSectionFilter('')}>×</button>
              )}
            </div>
          </div>

          {Object.entries(filteredGrouped).map(([type, items]) => (
            <div key={type} className="source-group">
              <button
                className="source-group-header"
                onClick={() => toggleGroup(type)}
              >
                <span>{TYPE_ICONS[type] || '📄'} {TYPE_LABELS[type] || type}</span>
                <span className="source-group-meta">
                  {items.some(s => selectedSections.includes(s.section)) && (
                    <span className="source-group-dot" title="Has active selections">●</span>
                  )}
                  <span className="source-group-count">{items.length}</span>
                  <span className="source-group-chevron">{collapsed[type] ? '›' : '⌄'}</span>
                </span>
              </button>
              {!collapsed[type] && (
                <div className="source-items">
                  {items.map(s => {
                    const isActive = selectedSections.includes(s.section)
                    return (
                      <button
                        key={s.section}
                        className={`source-item${isActive ? ' active' : ''}`}
                        onClick={() => toggleSection(s.section)}
                        title={s.section + ' · ' + s.chunks + ' chunks'}
                      >
                        <span className={`source-check${isActive ? ' checked' : ''}`}>
                          {isActive ? '✓' : ''}
                        </span>
                        <span className="source-name">{s.displayName || s.section}</span>
                        <span className="source-chunks">{s.chunks}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          {Object.keys(filteredGrouped).length === 0 && sectionFilter && (
            <div className="history-empty">No sources match "{sectionFilter}"</div>
          )}
        </div>
      )}

      <SidebarFooter onShowLicense={onShowLicense} />
    </aside>
  )
}
