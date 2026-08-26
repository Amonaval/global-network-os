import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useSections } from '../../hooks/useApi'

interface Props {
  onShowLicense: () => void
}

export function TopBar({ onShowLicense: _onShowLicense }: Props) {
  const { convTitle, loading, selectedSections, toggleSection, clearSections, sidebarCollapsed, toggleSidebar, activePanel, theme, toggleTheme } = useAppStore()
  const { data: sectionsData } = useSections()
  const [expanded, setExpanded] = useState(false)

  const sections = sectionsData?.sections ?? []

  const nameMap: Record<string, string> = {}
  for (const s of sections) nameMap[s.section] = s.displayName || s.section

  const MAX_VISIBLE = 2
  const visible = selectedSections.slice(0, MAX_VISIBLE)
  const hidden  = selectedSections.slice(MAX_VISIBLE)

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn mobile-only" onClick={toggleSidebar}>☰</button>
        <div className="conv-title">{convTitle}</div>
      </div>
      <div className="topbar-right">
        {activePanel === 'chat' && (
          selectedSections.length === 0 ? (
            <div className="filter-pill all-sources">All sources</div>
          ) : (
            <div className="active-tags">
              {visible.map(s => (
                <div key={s} className="active-tag">
                  <span>{nameMap[s] || s}</span>
                  <button onClick={() => toggleSection(s)} title="Remove">×</button>
                </div>
              ))}
              {hidden.length > 0 && !expanded && (
                <button className="active-tag-more" onClick={() => setExpanded(true)}>
                  +{hidden.length} more
                </button>
              )}
              {expanded && hidden.map(s => (
                <div key={s} className="active-tag">
                  <span>{nameMap[s] || s}</span>
                  <button onClick={() => toggleSection(s)} title="Remove">×</button>
                </div>
              ))}
              <button className="active-tag-clear" onClick={clearSections} title="Clear all filters">✕ Clear</button>
            </div>
          )
        )}
        <button
          className="icon-btn theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className={`status-indicator ${loading ? 'loading' : 'ready'}`}>
          <span className="status-dot"></span>
          <span>{loading ? 'Thinking…' : 'Ready'}</span>
        </div>
      </div>
    </header>
  )
}
