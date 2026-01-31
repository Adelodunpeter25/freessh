import { create } from 'zustand'
import { Session, ConnectionConfig } from '../types'
import { generateUniqueTitle } from '../utils/tabNaming'

interface Tab {
  id: string
  sessionId: string
  title: string
  type: 'terminal' | 'sftp' | 'log'
  isPinned?: boolean
  logContent?: string
}

interface TabStore {
  tabs: Tab[]
  activeTabId: string | null
  
  addTab: (session: Session, connection: ConnectionConfig, type: 'terminal' | 'sftp') => void
  addLocalTab: (session: Session) => void
  addLogTab: (logName: string, logContent: string) => void
  removeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateTabTitle: (tabId: string, title: string) => void
  togglePinTab: (tabId: string) => void
  getTabBySessionId: (sessionId: string) => Tab | undefined
}

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab: (session, connection, type) => {
    const baseTitle = connection.name || connection.host
    const existingTitles = get().tabs.map(t => t.title)
    const uniqueTitle = generateUniqueTitle(baseTitle, existingTitles)
    
    const newTab: Tab = {
      id: `${session.id}-${type}`,
      sessionId: session.id,
      title: uniqueTitle,
      type
    }

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id
    }))
  },

  addLocalTab: (session) => {
    const existingTitles = get().tabs.map(t => t.title)
    const uniqueTitle = generateUniqueTitle('Local Terminal', existingTitles)
    
    const newTab: Tab = {
      id: `${session.id}-terminal`,
      sessionId: session.id,
      title: uniqueTitle,
      type: 'terminal'
    }

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id
    }))
  },

  addLogTab: (logName, logContent) => {
    const logId = `log-${Date.now()}`
    const existingTitles = get().tabs.map(t => t.title)
    const uniqueTitle = generateUniqueTitle(logName, existingTitles)
    
    const newTab: Tab = {
      id: logId,
      sessionId: logId,
      title: uniqueTitle,
      type: 'log',
      logContent
    }

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id
    }))
  },

  removeTab: (tabId) => {
    set((state) => {
      const tab = state.tabs.find(t => t.id === tabId)
      if (tab?.isPinned) return state // Prevent closing pinned tabs
      
      const newTabs = state.tabs.filter((tab) => tab.id !== tabId)
      const newActiveTabId = 
        state.activeTabId === tabId 
          ? newTabs[newTabs.length - 1]?.id || null
          : state.activeTabId

      return {
        tabs: newTabs,
        activeTabId: newActiveTabId
      }
    })
  },

  setActiveTab: (tabId) => {
    set({ activeTabId: tabId })
  },

  updateTabTitle: (tabId, title) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, title } : tab
      )
    }))
  },

  togglePinTab: (tabId) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, isPinned: !tab.isPinned } : tab
      )
    }))
  },

  getTabBySessionId: (sessionId) => {
    return get().tabs.find((tab) => tab.sessionId === sessionId)
  }
}))
