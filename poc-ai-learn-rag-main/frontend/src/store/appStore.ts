import { create } from 'zustand'

const STORAGE_KEY = 'knowledge_hub_session_id'

function makeSessionId() {
  const id = crypto.randomUUID ? crypto.randomUUID() : 'session-' + Date.now()
  localStorage.setItem(STORAGE_KEY, id)
  return id
}

export type ActivePanel = 'chat' | 'analytics' | 'upload' | 'chunks' | 'gaps' | 'memory' | 'decisions' | 'health' | 'onboard' | 'knowledge' | 'risk' | 'insights' | 'intelligence' | 'build' | 'maintenance' | 'copilot' | 'ragas'

interface AppState {
  sessionId: string
  // Multi-select: empty array = all sources
  selectedSections: string[]
  loading: boolean
  messageCount: number
  activePanel: ActivePanel
  sidebarCollapsed: boolean
  rebuildPanelOpen: boolean
  convTitle: string
  theme: 'light' | 'dark'

  // Pinned chunks (Chunk Explorer)
  pinnedChunkIds: string[]
  togglePin: (id: string) => void
  clearPins: () => void
  toggleTheme: () => void

  setSessionId: (id: string) => void
  setSelectedSections: (sections: string[]) => void
  toggleSection: (section: string) => void
  clearSections: () => void
  // Backward-compat setter (wraps single string into array)
  setSelectedSection: (section: string) => void
  setLoading: (loading: boolean) => void
  incrementMessageCount: () => void
  resetSession: () => void
  setActivePanel: (panel: ActivePanel) => void
  toggleSidebar: () => void
  setRebuildPanelOpen: (open: boolean) => void
  setConvTitle: (title: string) => void
  startNewSession: () => string
}

export const useAppStore = create<AppState>(set => ({
  sessionId: localStorage.getItem(STORAGE_KEY) || makeSessionId(),
  selectedSections: [],
  pinnedChunkIds: [],
  loading: false,
  messageCount: 0,
  activePanel: 'chat',
  sidebarCollapsed: false,
  rebuildPanelOpen: false,
  convTitle: 'New conversation',
  theme: (localStorage.getItem('kh_theme') as 'light' | 'dark') || 'light',

  toggleTheme: () => set(s => {
    const next = s.theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('kh_theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    return { theme: next }
  }),

  togglePin: id => set(s => ({
    pinnedChunkIds: s.pinnedChunkIds.includes(id)
      ? s.pinnedChunkIds.filter(x => x !== id)
      : [...s.pinnedChunkIds, id],
  })),
  clearPins: () => set({ pinnedChunkIds: [] }),

  setSessionId: id => {
    localStorage.setItem(STORAGE_KEY, id)
    set({ sessionId: id })
  },
  setSelectedSections: selectedSections => set({ selectedSections }),
  toggleSection: section => set(s => {
    const has = s.selectedSections.includes(section)
    return { selectedSections: has
      ? s.selectedSections.filter(x => x !== section)
      : [...s.selectedSections, section] }
  }),
  clearSections: () => set({ selectedSections: [] }),
  // Backward compat: single string → wrap in array (empty string = clear)
  setSelectedSection: section => set({ selectedSections: section ? [section] : [] }),
  setLoading: loading => set({ loading }),
  incrementMessageCount: () => set(s => ({ messageCount: s.messageCount + 1 })),
  resetSession: () => set({ messageCount: 0, convTitle: 'New conversation' }),
  setActivePanel: activePanel => set({ activePanel }),
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setRebuildPanelOpen: rebuildPanelOpen => set({ rebuildPanelOpen }),
  setConvTitle: convTitle => set({ convTitle }),

  startNewSession: () => {
    const id = makeSessionId()
    set({ sessionId: id, messageCount: 0, convTitle: 'New conversation' })
    return id
  },
}))
