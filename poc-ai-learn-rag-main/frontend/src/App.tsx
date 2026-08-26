import { useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAppStore, type ActivePanel } from './store/appStore'
import { useAppStatus, useSession, useStats } from './hooks/useApi'
import { readStream } from './hooks/useStream'
import { formatDate } from './utils/format'
import { Sidebar } from './components/chat/Sidebar'
import { TopBar } from './components/chat/TopBar'
import { MessageList } from './components/chat/MessageList'
import { InputArea } from './components/chat/InputArea'
import { UploadPanel } from './components/chat/UploadPanel'
import { AnalyticsPanel } from './components/chat/AnalyticsPanel'
import { RebuildPanel } from './components/chat/RebuildPanel'
import { ChunkExplorer } from './components/chat/ChunkExplorer'
import { GapsPanel } from './components/chat/GapsPanel'
import { MemoryPanel } from './components/chat/MemoryPanel'
import { DecisionsPanel } from './components/chat/DecisionsPanel'
import { HealthPanel } from './components/chat/HealthPanel'
import { OnboardingPanel } from './components/chat/OnboardingPanel'
import { KnowledgeMapPanel } from './components/chat/KnowledgeMapPanel'
import { KnowledgeRiskPanel } from './components/chat/KnowledgeRiskPanel'
import { InsightsPanel } from './components/chat/InsightsPanel'
import { IntelligenceDashboard } from './components/chat/IntelligenceDashboard'
import { BuildPanel } from './components/chat/BuildPanel'
import { MaintenancePanel } from './components/chat/MaintenancePanel'
import { RagasPanel } from './components/chat/RagasPanel'
import { CopilotPanel } from './components/chat/CopilotPanel'
import { WelcomeFlow, DISMISS_KEY } from './components/chat/WelcomeFlow'
import { LicenseModal } from './components/shared/LicenseModal'
import type { ChatMessage } from './types'

// ── Nav dropdown component ────────────────────────────────────────────────
interface NavGroup {
  label: string
  icon: string
  items: { id: ActivePanel; icon: string; label: string }[]
}

function NavDropdown({ group, activePanel, setActivePanel }: {
  group: NavGroup
  activePanel: ActivePanel
  setActivePanel: (p: ActivePanel) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isActive = group.items.some(i => i.id === activePanel)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const activeItem = group.items.find(i => i.id === activePanel)

  return (
    <div className="nav-dropdown" ref={ref}>
      <button
        className={`main-nav-btn${isActive ? ' active' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className="nav-icon">{isActive && activeItem ? activeItem.icon : group.icon}</span>
        <span className="nav-label">{isActive && activeItem ? activeItem.label : group.label}</span>
        <span className="nav-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="nav-dropdown-menu">
          {group.items.map(item => (
            <button
              key={item.id}
              className={`nav-dropdown-item${activePanel === item.id ? ' active' : ''}`}
              onClick={() => { setActivePanel(item.id); setOpen(false) }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [showBanner, setShowBanner] = useState(false)
  const [licenseOpen, setLicenseOpen] = useState(false)
  const [sessionLoaded, setSessionLoaded] = useState(false)
  const streamingIdRef = useRef<string | null>(null)

  const {
    sessionId, selectedSections, pinnedChunkIds, loading, activePanel, convTitle, messageCount,
    setLoading, setConvTitle, setSessionId, incrementMessageCount, startNewSession, setActivePanel,
  } = useAppStore()

  const [welcomeDismissed, setWelcomeDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === '1'
  )

  const qc = useQueryClient()
  const { data: appStatus } = useAppStatus()
  const { data: statsData } = useStats()
  const showWelcome = !welcomeDismissed && statsData !== undefined && statsData.totalChunks === 0

  // Redirect to setup if not configured
  useEffect(() => {
    if (appStatus && !appStatus.setupComplete) window.location.href = '/setup'
    if (appStatus?.appName) {
      document.title = appStatus.appName
    }
  }, [appStatus])

  // Restore session on mount
  const { data: sessionData } = useSession(sessionId, !sessionLoaded)
  useEffect(() => {
    if (!sessionData || sessionLoaded) return
    setSessionLoaded(true)
    if (!sessionData.messages?.length) return

    const restored: ChatMessage[] = []
    for (const m of sessionData.messages) {
      restored.push({
        id: crypto.randomUUID(),
        role: m.role === 'user' ? 'user' : 'assistant',
        text: m.content,
        sources: [],
      })
    }
    const marker: ChatMessage = {
      id: 'restore-marker',
      role: 'assistant',
      text: `🔁 Restored ${sessionData.messages.filter(m => m.role === 'user').length} earlier messages · ${formatDate(sessionData.createdAt)}`,
      isTyping: false,
    }
    setMessages([marker, ...restored])
    if (sessionData.title) setConvTitle(sessionData.title)
  }, [sessionData, sessionLoaded, setConvTitle])

  const sendMessage = useCallback(async (question: string) => {
    if (!question.trim() || loading) return

    const userMsgId = crypto.randomUUID()
    const streamId = crypto.randomUUID()
    streamingIdRef.current = streamId

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', text: question },
      { id: streamId, role: 'assistant', text: '', isTyping: true },
    ])
    setLoading(true)

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          sessionId,
          sections: selectedSections.length > 0 ? selectedSections : undefined,
          pinnedChunkIds: pinnedChunkIds.length > 0 ? pinnedChunkIds : undefined,
          userId: localStorage.getItem('kh_user_name') || 'default',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `Server error ${res.status}` }))
        setMessages(prev => prev.map(m =>
          m.id === streamId
            ? { ...m, isTyping: false, isError: true, errorType: data.isOllamaError ? 'ollama' : 'generic', text: data.error || 'Server error' }
            : m
        ))
        return
      }

      setMessages(prev => prev.map(m =>
        m.id === streamId ? { ...m, isTyping: false, isStreaming: true } : m
      ))

      await readStream(res, {
        onToken: token => {
          setMessages(prev => prev.map(m =>
            m.id === streamId ? { ...m, text: m.text + token } : m
          ))
        },
        onDone: raw => {
          const meta = JSON.parse(raw)
          if (meta.limitReached) {
            setMessages(prev => prev.map(m =>
              m.id === streamId ? { ...m, isStreaming: false, isLimitReached: true, text: meta.answer || 'Query limit reached.' } : m
            ))
            return
          }
          setMessages(prev => prev.map(m =>
            m.id === streamId
              ? { ...m, isStreaming: false, sources: meta.sources || [], debug: meta.debug || null, suggestions: meta.suggestions || [] }
              : m
          ))
          if (meta.title) setConvTitle(meta.title)
          if (meta.sessionId) setSessionId(meta.sessionId)
          incrementMessageCount()
          if ((messageCount + 1) % 3 === 0 || messageCount === 0) {
            qc.invalidateQueries({ queryKey: ['sessions'] })
          }
        },
        onError: raw => {
          const errData = JSON.parse(raw)
          setMessages(prev => prev.map(m =>
            m.id === streamId
              ? { ...m, isStreaming: false, isError: true, errorType: errData.isOllamaError ? 'ollama' : 'generic', text: errData.error || 'Server error' }
              : m
          ))
        },
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setMessages(prev => prev.map(m =>
        m.id === streamId
          ? { ...m, isTyping: false, isError: true, errorType: 'generic', text: 'Network error — is the server running? ' + msg }
          : m
      ))
    } finally {
      setLoading(false)
      streamingIdRef.current = null
    }
  }, [loading, sessionId, selectedSections, pinnedChunkIds, messageCount, setLoading, setConvTitle, setSessionId, incrementMessageCount, qc])

  const newChat = useCallback(() => {
    startNewSession()
    setMessages([])
    setSessionLoaded(false)
    qc.invalidateQueries({ queryKey: ['sessions'] })
  }, [startNewSession, qc])

  const switchSession = useCallback(async (id: string, title: string) => {
    setMessages([])
    setSessionLoaded(false)
    setConvTitle(title)
    setSessionId(id)
    // Session data will re-fetch automatically via useSession
  }, [setConvTitle, setSessionId])

  const handleSuggestSection = useCallback((sec: string) => {
    useAppStore.getState().setSelectedSection(sec)
  }, [])

  const NAV_PRIMARY = [
    { id: 'chat'         as const, icon: '💬', label: 'Chat' },
    { id: 'intelligence' as const, icon: '🧠', label: 'Intelligence' },
    { id: 'copilot'      as const, icon: '🧭', label: 'Copilot' },
    { id: 'build'        as const, icon: '⚙️', label: 'Build' },
  ]

  const NAV_GROUPS: NavGroup[] = [
    {
      label: 'Knowledge', icon: '📚',
      items: [
        { id: 'knowledge'    as const, icon: '🗺️', label: 'Knowledge Map' },
        { id: 'decisions'    as const, icon: '⚖️', label: 'Decisions' },
        { id: 'health'       as const, icon: '❤️', label: 'Health' },
        { id: 'maintenance'  as const, icon: '🔧', label: 'Maintenance' },
        { id: 'onboard'      as const, icon: '🎓', label: 'Onboard' },
      ],
    },
    {
      label: 'Manage', icon: '⚙️',
      items: [
        { id: 'upload' as const,    icon: '📎', label: 'Upload' },
        { id: 'chunks' as const,    icon: '🔍', label: 'Chunks' },
        { id: 'analytics' as const, icon: '📊', label: 'Analytics' },
        { id: 'gaps' as const,      icon: '🔎', label: 'Gaps Detail' },
        { id: 'memory' as const,    icon: '🧠', label: 'Memory Detail' },
        { id: 'insights' as const,  icon: '📈', label: 'Insights Detail' },
        { id: 'risk' as const,      icon: '⚠️', label: 'Risk Detail' },
      ],
    },
  ]

  return (
    <>
      <Sidebar
        onNewChat={newChat}
        onSwitchSession={switchSession}
        onShowLicense={() => setLicenseOpen(true)}
      />

      <main className="main">
        {useAppStore.getState().rebuildPanelOpen && <RebuildPanel />}

        <TopBar onShowLicense={() => setLicenseOpen(true)} />

        {/* Primary tab navigation */}
        <nav className="main-nav">
          {NAV_PRIMARY.map(tab => (
            <button
              key={tab.id}
              className={`main-nav-btn${activePanel === tab.id ? ' active' : ''}`}
              onClick={() => setActivePanel(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
          {NAV_GROUPS.map(group => (
            <NavDropdown
              key={group.label}
              group={group}
              activePanel={activePanel}
              setActivePanel={setActivePanel}
            />
          ))}
        </nav>

        {/* Full-height panel content area */}
        <div className="panel-content">
          {activePanel === 'chat' && (
            showWelcome
              ? <WelcomeFlow
                  onStartChat={question => {
                    setWelcomeDismissed(true)
                    if (question) sendMessage(question)
                  }}
                />
              : <>
                  {showBanner && (
                    <div className="setup-banner show">
                      No documents indexed. <a href="/setup">Open setup</a> to crawl and build the knowledge base.
                    </div>
                  )}
                  <MessageList
                    messages={messages}
                    onSuggestSection={handleSuggestSection}
                    onLicenseUpgrade={() => setLicenseOpen(true)}
                  />
                  <InputArea onSend={sendMessage} />
                </>
          )}
          {activePanel === 'intelligence' && (
            <IntelligenceDashboard
              onBack={() => setActivePanel('chat')}
              onNavigate={setActivePanel}
            />
          )}
          {activePanel === 'analytics' && <AnalyticsPanel onBack={() => setActivePanel('chat')} />}
          {activePanel === 'gaps' && <GapsPanel onBack={() => setActivePanel('chat')} />}
          {activePanel === 'knowledge' && <KnowledgeMapPanel onBack={() => setActivePanel('chat')} />}
          {activePanel === 'memory' && <MemoryPanel onBack={() => setActivePanel('chat')} />}
          {activePanel === 'decisions' && <DecisionsPanel onBack={() => setActivePanel('chat')} />}
          {activePanel === 'health' && <HealthPanel onBack={() => setActivePanel('chat')} />}
          {activePanel === 'onboard' && <OnboardingPanel onBack={() => setActivePanel('chat')} />}
          {activePanel === 'insights' && <InsightsPanel onBack={() => setActivePanel('chat')} />}
          {activePanel === 'risk' && <KnowledgeRiskPanel onBack={() => setActivePanel('chat')} />}
          {activePanel === 'chunks'      && <ChunkExplorer onClose={() => setActivePanel('chat')} />}
          {activePanel === 'upload'      && <UploadPanel onClose={() => setActivePanel('chat')} />}
          {activePanel === 'copilot'     && <CopilotPanel onClose={() => setActivePanel('chat')} onOpenBuild={spec => { setActivePanel('build') }} />}
          {activePanel === 'build'       && <BuildPanel  onClose={() => setActivePanel('chat')} />}
          {activePanel === 'maintenance' && <MaintenancePanel onBack={() => setActivePanel('chat')} />}
          {activePanel === 'ragas' && <RagasPanel onBack={() => setActivePanel('intelligence')} />}
        </div>
      </main>

      {licenseOpen && <LicenseModal onClose={() => setLicenseOpen(false)} />}
    </>
  )
}
