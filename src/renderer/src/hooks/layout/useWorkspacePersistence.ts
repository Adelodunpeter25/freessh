import { useEffect, useRef, type MutableRefObject } from 'react'
import { connectionService, sessionService, workspacePersistenceService } from '@/services/ipc'
import { useConnectionStore } from '@/stores/connectionStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useTabStore } from '@/stores/tabStore'
import { ConnectionConfig, Tab } from '@/types'
import { PersistedSessionRef, RendererWorkspaceClientState } from '@/types/workspacePersistence'
import { FEATURE_FLAGS } from '@/constants/features'

type SidebarTab = 'connections' | 'keys' | 'known-hosts' | 'port-forward' | 'snippets' | 'logs' | 'settings'
type MainView = 'home' | 'sftp' | 'terminal'

interface UseWorkspacePersistenceParams {
  mainView: MainView
  sidebarTab: SidebarTab
  showTerminalSettings: boolean
  prevTabsLengthRef: MutableRefObject<number>
}

function remapRestoredTabs(
  tabs: Tab[],
  sessionMap: Map<string, string>,
): { tabs: Tab[]; tabIdMap: Map<string, string> } {
  const remapped: Tab[] = []
  const tabIdMap = new Map<string, string>()

  for (const tab of tabs) {
    if (tab.type === 'terminal' || tab.type === 'sftp') {
      const mappedSessionId = sessionMap.get(tab.sessionId)
      if (!mappedSessionId) continue
      const nextTab: Tab = {
        ...tab,
        id: `${mappedSessionId}-${tab.type}`,
        sessionId: mappedSessionId,
      }
      remapped.push(nextTab)
      tabIdMap.set(tab.id, nextTab.id)
      continue
    }

    if (tab.type === 'workspace') {
      const mappedSessionIds = (tab.workspaceSessionIds || [])
        .map((id) => sessionMap.get(id))
        .filter((id): id is string => Boolean(id))

      const titleMap = Object.entries(tab.workspaceSessionTitles || {}).reduce<Record<string, string>>(
        (acc, [oldSessionId, title]) => {
          const mapped = sessionMap.get(oldSessionId)
          if (mapped) acc[mapped] = title
          return acc
        },
        {},
      )

      const mappedPinned = (tab.workspacePinnedSessionIds || [])
        .map((id) => sessionMap.get(id))
        .filter((id): id is string => Boolean(id))

      const mappedHidden = (tab.workspaceHiddenSessionIds || [])
        .map((id) => sessionMap.get(id))
        .filter((id): id is string => Boolean(id))

      const mappedActive = tab.workspaceActiveSessionId
        ? sessionMap.get(tab.workspaceActiveSessionId)
        : undefined
      const mappedFocus = tab.workspaceFocusSessionId
        ? sessionMap.get(tab.workspaceFocusSessionId)
        : undefined

      const nextWorkspaceMode = mappedSessionIds.length > 0
        ? tab.workspaceMode || 'workspace'
        : 'picker'

      const nextTab: Tab = {
        ...tab,
        workspaceMode: nextWorkspaceMode,
        workspaceSessionIds: mappedSessionIds,
        workspacePinnedSessionIds: mappedPinned,
        workspaceHiddenSessionIds: mappedHidden,
        workspaceActiveSessionId: mappedActive || mappedSessionIds[0],
        workspaceFocusSessionId: mappedFocus,
        workspaceSessionTitles: titleMap,
      }

      remapped.push(nextTab)
      tabIdMap.set(tab.id, tab.id)
      continue
    }

    remapped.push(tab)
    tabIdMap.set(tab.id, tab.id)
  }

  return { tabs: remapped, tabIdMap }
}

function collectRequiredSessionIds(tabs: Tab[]): Set<string> {
  const ids = new Set<string>()
  for (const tab of tabs) {
    if (tab.type === 'terminal' || tab.type === 'sftp') {
      ids.add(tab.sessionId)
      continue
    }
    if (tab.type === 'workspace') {
      for (const sessionId of tab.workspaceSessionIds || []) {
        ids.add(sessionId)
      }
    }
  }
  return ids
}

export function useWorkspacePersistence({
  mainView,
  sidebarTab,
  showTerminalSettings,
  prevTabsLengthRef,
}: UseWorkspacePersistenceParams) {
  const tabs = useTabStore((state) => state.tabs)
  const activeSessionTabId = useTabStore((state) => state.activeTabId)
  const replaceTabState = useTabStore((state) => state.replaceState)
  const exportTabState = useTabStore((state) => state.exportState)

  const addSession = useSessionStore((state) => state.addSession)
  const clearSessions = useSessionStore((state) => state.clearSessions)
  const getSession = useSessionStore((state) => state.getSession)

  const ensureConnectionsLoaded = useConnectionStore((state) => state.ensureConnectionsLoaded)
  const getConnection = useConnectionStore((state) => state.getConnection)

  const isHydratingRef = useRef(true)
  useEffect(() => {
    let mounted = true

    const hydrateWorkspaceState = async () => {
      try {
        const allConnections = await ensureConnectionsLoaded()

        const loaded = await workspacePersistenceService.load()
        const clientState = loaded.state?.client_state as RendererWorkspaceClientState | undefined
        if (!mounted || !loaded.found || !clientState?.tabs?.length) {
          return
        }

        const persistedTabs = FEATURE_FLAGS.DETACHABLE_WORKSPACES
          ? clientState.tabs
          : clientState.tabs.filter((tab) => tab.type !== 'workspace')
        if (persistedTabs.length === 0) {
          return
        }

        const connectionByID = new Map<string, ConnectionConfig>(
          allConnections.map((connection) => [connection.id, connection]),
        )
        const sessionMap = new Map<string, string>()
        const requiredOldSessionIds = collectRequiredSessionIds(persistedTabs)

        clearSessions()

        const refs = clientState.session_refs || {}
        for (const [oldSessionID, ref] of Object.entries(refs)) {
          if (!requiredOldSessionIds.has(oldSessionID)) continue
          try {
            if ((ref as PersistedSessionRef).is_local) {
              const localSession = await sessionService.connectLocal()
              addSession(localSession)
              sessionMap.set(oldSessionID, localSession.id)
              continue
            }

            const connectionID = (ref as PersistedSessionRef).connection_id
            if (!connectionID) continue

            const connection = connectionByID.get(connectionID) || getConnection(connectionID)
            if (!connection) continue

            const restored = await connectionService.connect(connection)
            addSession(restored, connection)
            sessionMap.set(oldSessionID, restored.id)
          } catch {
            // Continue restoring other sessions.
          }
        }

        const { tabs: restoredTabs, tabIdMap } = remapRestoredTabs(persistedTabs, sessionMap)
        const { tabs: existingTabs } = useTabStore.getState().exportState()
        if (existingTabs.length > 0) {
          return
        }

        const nextActiveTab = clientState.active_tab_id
          ? tabIdMap.get(clientState.active_tab_id) || null
          : null

        prevTabsLengthRef.current = restoredTabs.length
        replaceTabState(restoredTabs, nextActiveTab)
      } finally {
        if (mounted) {
          isHydratingRef.current = false
        }
      }
    }

    void hydrateWorkspaceState()

    return () => {
      mounted = false
    }
  }, [addSession, clearSessions, ensureConnectionsLoaded, getConnection, replaceTabState, prevTabsLengthRef])

  useEffect(() => {
    if (isHydratingRef.current) return

    const timer = setTimeout(() => {
      const { tabs: storeTabs, activeTabId: storeActiveTabId } = exportTabState()
      const currentTabs = FEATURE_FLAGS.DETACHABLE_WORKSPACES
        ? storeTabs
        : storeTabs.filter((tab) => tab.type !== 'workspace')
      const activeTabId =
        storeActiveTabId && currentTabs.some((tab) => tab.id === storeActiveTabId)
          ? storeActiveTabId
          : null
      const sessionRefs: Record<string, PersistedSessionRef> = {}

      const addRef = (sessionId: string) => {
        const item = getSession(sessionId)
        if (!item) return
        const isLocal = item.session.connection_id === 'local' || item.session.type === 'local'
        sessionRefs[sessionId] = {
          is_local: isLocal,
          connection_id: isLocal ? undefined : item.connection?.id,
        }
      }

      for (const tab of currentTabs) {
        if (tab.type === 'terminal' || tab.type === 'sftp') {
          addRef(tab.sessionId)
        }
        if (tab.type === 'workspace') {
          for (const sessionId of tab.workspaceSessionIds || []) {
            addRef(sessionId)
          }
        }
      }

      const payload: RendererWorkspaceClientState = {
        tabs: currentTabs,
        active_tab_id: activeTabId,
        main_view: mainView,
        sidebar_tab: sidebarTab,
        show_terminal_settings: showTerminalSettings,
        session_refs: sessionRefs,
      }

      void workspacePersistenceService.save({ client_state: payload })
    }, 1200)

    return () => clearTimeout(timer)
  }, [tabs, activeSessionTabId, mainView, sidebarTab, showTerminalSettings, exportTabState, getSession])
}
