import { create } from 'zustand'
import { Session, ConnectionConfig } from '../types'

interface Tab {
  id: string
  sessionId: string
  title: string
  type: 'terminal' | 'sftp'
  isPinned?: boolean
}

interface TabStore {
  tabs: Tab[]
  activeTabId: string | null
  
  addTab: (session: Session, connection: ConnectionConfig, type: 'terminal' | 'sftp') => void
  addLocalTab: (session: Session) => void
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
    const newTab: Tab = {
      id: `${session.id}-${type}`,
      sessionId: session.id,
      title: connection.name || connection.host,
      type
    }

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id
    }))
  },

  addLocalTab: (session) => {
    const newTab: Tab = {
      id: `${session.id}-terminal`,
      sessionId: session.id,
      title: 'Local Terminal',
      type: 'terminal'
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
