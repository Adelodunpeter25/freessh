import { useState, useEffect, useRef, useCallback } from "react";
import { TitleBar } from "./TitleBar";
import { MainLayoutSidebar } from "./MainLayoutSidebar";
import { MainLayoutContent } from "./MainLayoutContent";
import { MainLayoutTerminalSidebar } from "./MainLayoutTerminalSidebar";
import { MainLayoutDialogs } from "./MainLayoutDialogs";
import { DisconnectNotifications } from "@/components/terminal/DisconnectNotifications";
import { useTabStore } from "@/stores/tabStore";
import { useUIStore } from "@/stores/uiStore";
import { useSnippetStore } from "@/stores/snippetStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useConnectionStore } from "@/stores/connectionStore";
import { useKeyboardShortcuts, useLocalTerminal } from "@/hooks";
import { useMenuActions } from "@/hooks";
import { Snippet } from "@/types/snippet";
import { useSessionLifecycle } from "@/hooks/layout/useSessionLifecycle";
import { sshService } from "@/services/ipc/ssh";
import { connectionService, sessionService, workspacePersistenceService } from "@/services/ipc";
import { Tab } from "@/types";
import { ConnectionConfig } from "@/types/connection";
import { RendererWorkspaceClientState, PersistedSessionRef } from "@/types/workspacePersistence";

type SidebarTab = "connections" | "keys" | "known-hosts" | "port-forward" | "snippets" | "logs" | "settings";
type MainView = "home" | "sftp" | "terminal";

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

export function MainLayout() {
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("connections");
  const [mainView, setMainView] = useState<MainView>("home");
  const [showTerminalSettings, setShowTerminalSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);
  const [showSnippetForm, setShowSnippetForm] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [deletingSnippet, setDeletingSnippet] = useState<Snippet | null>(null);
  const activeSessionTabId = useTabStore((state) => state.activeTabId);
  const tabs = useTabStore((state) => state.tabs);
  const replaceTabState = useTabStore((state) => state.replaceState);
  const exportTabState = useTabStore((state) => state.exportState);
  const removeTab = useTabStore((state) => state.removeTab);
  const currentTab = tabs.find(tab => tab.id === activeSessionTabId);
  const activeSessionId = currentTab?.sessionId;
  const sftpConnectionId = useUIStore((state) => state.sftpConnectionId);
  const sftpOpenRequest = useUIStore((state) => state.sftpOpenRequest);
  const clearSFTPConnection = useUIStore((state) => state.clearSFTPConnection);
  const createSnippet = useSnippetStore((state) => state.createSnippet);
  const updateSnippet = useSnippetStore((state) => state.updateSnippet);
  const deleteSnippet = useSnippetStore((state) => state.deleteSnippet);
  const prevTabsLength = useRef(tabs.length);
  const removeSession = useSessionStore((state) => state.removeSession);
  const addSession = useSessionStore((state) => state.addSession);
  const clearSessions = useSessionStore((state) => state.clearSessions);
  const getSession = useSessionStore((state) => state.getSession);
  const setConnections = useConnectionStore((state) => state.setConnections);
  const getConnection = useConnectionStore((state) => state.getConnection);
  const {
    disconnectNotices,
    reconnectingSessionId,
    handleReconnect,
    handleCloseDisconnectedTab,
    handleDismissDisconnect,
  } = useSessionLifecycle();
  const isHydratingRef = useRef(true);

  useEffect(() => {
    if (tabs.length > prevTabsLength.current) {
      setMainView("terminal");
    } else if (tabs.length === 0 && mainView === "terminal") {
      setMainView("home");
    }
    prevTabsLength.current = tabs.length;
  }, [tabs.length, mainView]);

  useEffect(() => {
    let mounted = true

    const hydrateWorkspaceState = async () => {
      try {
        const allConnections = await connectionService.list()
        setConnections(allConnections)

        const loaded = await workspacePersistenceService.load()
        const clientState = loaded.state?.client_state as RendererWorkspaceClientState | undefined
        if (!mounted || !loaded.found || !clientState?.tabs?.length) {
          return
        }

        const connectionByID = new Map<string, ConnectionConfig>(
          allConnections.map((connection) => [connection.id, connection]),
        )
        const sessionMap = new Map<string, string>()

        clearSessions()

        const refs = clientState.session_refs || {}
        for (const [oldSessionID, ref] of Object.entries(refs)) {
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

        const { tabs: restoredTabs, tabIdMap } = remapRestoredTabs(clientState.tabs, sessionMap)
        const nextActiveTab = clientState.active_tab_id
          ? tabIdMap.get(clientState.active_tab_id) || null
          : null
        prevTabsLength.current = restoredTabs.length
        replaceTabState(restoredTabs, nextActiveTab)

        if (clientState.main_view) setMainView(clientState.main_view)
        if (clientState.sidebar_tab) setSidebarTab(clientState.sidebar_tab)
        if (typeof clientState.show_terminal_settings === 'boolean') {
          setShowTerminalSettings(clientState.show_terminal_settings)
        }
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
  }, [addSession, clearSessions, getConnection, replaceTabState, setConnections])

  useEffect(() => {
    if (isHydratingRef.current) return

    const timer = setTimeout(() => {
      const { tabs: currentTabs, activeTabId } = exportTabState()
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

  useEffect(() => {
    if (sftpConnectionId) {
      setMainView("sftp");
    }
  }, [sftpConnectionId, sftpOpenRequest]);

  const { handleNewLocalTerminal } = useLocalTerminal();

  const handleHomeClick = useCallback(() => {
    setMainView("home");
    clearSFTPConnection();
  }, [clearSFTPConnection]);

  const handleSFTPClick = useCallback(() => setMainView("sftp"), []);
  const handleSessionClick = useCallback(() => setMainView("terminal"), []);
  const handleSidebarTabChange = useCallback((tab: SidebarTab) => setSidebarTab(tab), []);
  const handleCloseActiveTab = useCallback(async () => {
    if (!activeSessionTabId) return;

    const tab = tabs.find((item) => item.id === activeSessionTabId);
    if (!tab) return;

    if (tab.type === "log" || tab.type === "workspace") {
      removeTab(tab.id);
      return;
    }

    try {
      await sshService.disconnect(tab.sessionId);
    } catch {
      // Session may already be disconnected; continue cleanup.
    }

    removeSession(tab.sessionId);
    removeTab(tab.id);
  }, [activeSessionTabId, tabs, removeSession, removeTab]);

  useKeyboardShortcuts({
    onSwitchTab: (index) => {
      if (index === 0) handleHomeClick()
      else if (index === 1) handleSFTPClick()
      else handleSessionClick()
    },
    onNewConnection: () => {
      handleHomeClick()
      setSidebarTab('connections')
    },
    onNewLocalTerminal: handleNewLocalTerminal,
    onCloseTab: handleCloseActiveTab,
    onOpenSettings: () => setShowSettings(true),
    onShowShortcuts: () => setShowShortcuts(true),
    onToggleTerminalSidebar: () => {
      if (mainView === 'terminal') {
        setShowTerminalSettings((prev) => !prev)
      }
    },
  })

  useMenuActions({
    onNewConnection: () => {
      handleHomeClick()
      setSidebarTab('connections')
    },
    onCloseTab: () => {
      handleCloseActiveTab()
    },
    onOpenSettings: () => setShowSettings(true),
    onShowShortcuts: () => setShowShortcuts(true),
    onCheckUpdates: () => console.log('Check for updates'),
    onExportImport: () => setShowExportImport(true),
  })

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <TitleBar
        showHome={mainView === "home"}
        showSFTP={mainView === "sftp"}
        showTerminal={mainView === "terminal"}
        sidebarOpen={showTerminalSettings}
        onHomeClick={handleHomeClick}
        onSFTPClick={handleSFTPClick}
        onSessionClick={handleSessionClick}
        onSidebarToggle={() => setShowTerminalSettings(!showTerminalSettings)}
      />

      <div className={mainView === "home" ? "flex-1 overflow-hidden" : "hidden"}>
        <MainLayoutSidebar sidebarTab={sidebarTab} onSidebarTabChange={handleSidebarTabChange} />
      </div>

      <MainLayoutContent
        mainView={mainView}
        tabs={tabs}
        activeSessionTabId={activeSessionTabId}
        showTerminalSettings={showTerminalSettings}
      />

      <MainLayoutTerminalSidebar
        showTerminalSettings={showTerminalSettings}
        mainView={mainView}
        activeSessionId={activeSessionId}
        onClose={() => setShowTerminalSettings(false)}
        onEditSnippet={(snippet) => {
          setEditingSnippet(snippet)
          setShowTerminalSettings(false)
          setShowSnippetForm(true)
        }}
        onDeleteSnippet={(snippet) => setDeletingSnippet(snippet)}
        onNewSnippet={() => {
          setEditingSnippet(null)
          setShowTerminalSettings(false)
          setShowSnippetForm(true)
        }}
      />

      <MainLayoutDialogs
        showShortcuts={showShortcuts}
        setShowShortcuts={setShowShortcuts}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        showExportImport={showExportImport}
        setShowExportImport={setShowExportImport}
        showSnippetForm={showSnippetForm}
        setShowSnippetForm={setShowSnippetForm}
        editingSnippet={editingSnippet}
        setEditingSnippet={setEditingSnippet}
        deletingSnippet={deletingSnippet}
        setDeletingSnippet={setDeletingSnippet}
        setShowTerminalSettings={setShowTerminalSettings}
        onSaveSnippet={async (data) => {
          if (editingSnippet) {
            await updateSnippet({ id: editingSnippet.id, ...data })
          } else {
            await createSnippet(data)
          }
          setShowSnippetForm(false)
          setEditingSnippet(null)
          setShowTerminalSettings(true)
        }}
        onDeleteSnippet={async () => {
          if (deletingSnippet) {
            await deleteSnippet(deletingSnippet.id)
            setDeletingSnippet(null)
          }
        }}
      />

      <DisconnectNotifications
        items={disconnectNotices}
        reconnectingSessionId={reconnectingSessionId}
        onReconnect={handleReconnect}
        onClose={handleCloseDisconnectedTab}
        onDismiss={handleDismissDisconnect}
      />
    </div>
  );
}
