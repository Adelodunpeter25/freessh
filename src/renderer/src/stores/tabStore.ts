import { create } from 'zustand'
import { Session, ConnectionConfig, Tab } from '../types'
import { generateUniqueTitle } from '../utils/tabNaming'

interface TabStore {
  tabs: Tab[]
  activeTabId: string | null
  
  addTab: (session: Session, connection: ConnectionConfig, type: 'terminal' | 'sftp') => void
  addLocalTab: (session: Session) => void
  addLogTab: (logName: string, logContent: string) => void
  addWorkspaceTab: () => void
  updateWorkspaceTabSelection: (tabId: string, connectionIds: string[]) => void
  openWorkspaceTab: (tabId: string, sessionIds: string[]) => void
  setWorkspaceActiveSession: (tabId: string, sessionId: string) => void
  addSessionToWorkspaceTab: (tabId: string, sessionId: string) => void
  removeSessionFromWorkspaceTab: (tabId: string, sessionId: string) => void
  toggleWorkspacePinnedSession: (tabId: string, sessionId: string) => void
  setWorkspaceSplitDirection: (tabId: string, direction: 'horizontal' | 'vertical') => void
  removeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateTabTitle: (tabId: string, title: string) => void
  updateTabSession: (tabId: string, sessionId: string) => void
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

  addWorkspaceTab: () => {
    const id = `workspace-${Date.now()}`
    const existingTitles = get().tabs.map(t => t.title)
    const uniqueTitle = generateUniqueTitle('Workspace', existingTitles)

    const newTab: Tab = {
      id,
      sessionId: id,
      title: uniqueTitle,
      type: 'workspace',
      workspaceMode: 'picker',
      workspaceConnectionIds: []
    }

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id
    }))
  },

  updateWorkspaceTabSelection: (tabId, connectionIds) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId && tab.type === 'workspace'
          ? { ...tab, workspaceConnectionIds: connectionIds }
          : tab
      )
    }))
  },

  openWorkspaceTab: (tabId, sessionIds) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId && tab.type === 'workspace'
          ? {
              ...tab,
              workspaceMode: 'workspace',
              workspaceSessionIds: sessionIds,
              workspaceActiveSessionId: sessionIds[0],
              workspacePinnedSessionIds: [],
              workspaceSplitDirection: 'horizontal',
            }
          : tab
      )
    }))
  },

  setWorkspaceActiveSession: (tabId, sessionId) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId && tab.type === 'workspace'
          ? { ...tab, workspaceActiveSessionId: sessionId }
          : tab
      )
    }))
  },

  addSessionToWorkspaceTab: (tabId, sessionId) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => {
        if (tab.id !== tabId || tab.type !== 'workspace') return tab

        const existing = new Set(tab.workspaceSessionIds || [])
        existing.add(sessionId)
        const sessionIds = Array.from(existing)

        return {
          ...tab,
          workspaceMode: 'workspace',
          workspaceSessionIds: sessionIds,
          workspaceActiveSessionId: tab.workspaceActiveSessionId || sessionId,
          workspacePinnedSessionIds: tab.workspacePinnedSessionIds || [],
          workspaceSplitDirection: tab.workspaceSplitDirection || 'horizontal',
        }
      }),
    }))
  },

  removeSessionFromWorkspaceTab: (tabId, sessionId) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => {
        if (tab.id !== tabId || tab.type !== 'workspace') return tab

        const nextSessionIds = (tab.workspaceSessionIds || []).filter((id) => id !== sessionId)
        const nextPinned = (tab.workspacePinnedSessionIds || []).filter((id) => id !== sessionId)
        const nextActive =
          tab.workspaceActiveSessionId === sessionId
            ? nextSessionIds[0]
            : tab.workspaceActiveSessionId

        return {
          ...tab,
          workspaceSessionIds: nextSessionIds,
          workspacePinnedSessionIds: nextPinned,
          workspaceActiveSessionId: nextActive,
        }
      }),
    }))
  },

  toggleWorkspacePinnedSession: (tabId, sessionId) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => {
        if (tab.id !== tabId || tab.type !== 'workspace') return tab
        const pinned = new Set(tab.workspacePinnedSessionIds || [])
        if (pinned.has(sessionId)) {
          pinned.delete(sessionId)
        } else {
          pinned.add(sessionId)
        }
        return { ...tab, workspacePinnedSessionIds: Array.from(pinned) }
      }),
    }))
  },

  setWorkspaceSplitDirection: (tabId, direction) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId && tab.type === 'workspace'
          ? { ...tab, workspaceSplitDirection: direction }
          : tab,
      ),
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

  updateTabSession: (tabId, sessionId) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, sessionId } : tab
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
