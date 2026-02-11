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
import { useKeyboardShortcuts, useLocalTerminal } from "@/hooks";
import { useMenuActions } from "@/hooks";
import { Snippet } from "@/types/snippet";
import { useSessionLifecycle } from "@/hooks/layout/useSessionLifecycle";
import { sshService } from "@/services/ipc/ssh";

type SidebarTab = "connections" | "keys" | "known-hosts" | "port-forward" | "snippets" | "logs" | "settings";
type MainView = "home" | "sftp" | "terminal";

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
  const {
    disconnectNotices,
    reconnectingSessionId,
    handleReconnect,
    handleCloseDisconnectedTab,
    handleDismissDisconnect,
  } = useSessionLifecycle();

  useEffect(() => {
    if (tabs.length > prevTabsLength.current) {
      setMainView("terminal");
    } else if (tabs.length === 0 && mainView === "terminal") {
      setMainView("home");
    }
    prevTabsLength.current = tabs.length;
  }, [tabs.length, mainView]);

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

    if (tab.type === "log") {
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
