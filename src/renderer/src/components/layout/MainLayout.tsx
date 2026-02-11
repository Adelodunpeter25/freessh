import { useState, useEffect, useRef, useCallback } from "react";
import { TitleBar } from "./TitleBar";
import { MainLayoutSidebar } from "./MainLayoutSidebar";
import { MainLayoutContent } from "./MainLayoutContent";
import { MainLayoutTerminalSidebar } from "./MainLayoutTerminalSidebar";
import { MainLayoutDialogs } from "./MainLayoutDialogs";
import { DisconnectNotifications, type DisconnectNotice } from "@/components/terminal/DisconnectNotifications";
import { useTabStore } from "@/stores/tabStore";
import { useUIStore } from "@/stores/uiStore";
import { useSnippetStore } from "@/stores/snippetStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useKeyboardShortcuts, useLocalTerminal } from "@/hooks";
import { useMenuActions } from "@/hooks";
import { Snippet } from "@/types/snippet";
import { backendService } from "@/services/ipc/backend";
import { connectionService } from "@/services/ipc/connection";
import { sshService } from "@/services/ipc/ssh";
import { toast } from "sonner";
import type { IPCMessage, Session } from "@/types";

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
  const [disconnectNotices, setDisconnectNotices] = useState<DisconnectNotice[]>([]);
  const [reconnectingSessionId, setReconnectingSessionId] = useState<string | null>(null);
  const activeSessionTabId = useTabStore((state) => state.activeTabId);
  const tabs = useTabStore((state) => state.tabs);
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
  const updateSession = useSessionStore((state) => state.updateSession);
  const getSession = useSessionStore((state) => state.getSession);
  const getTabBySessionId = useTabStore((state) => state.getTabBySessionId);
  const removeTab = useTabStore((state) => state.removeTab);
  const updateTabSession = useTabStore((state) => state.updateTabSession);

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

  useEffect(() => {
    const handleSessionStatus = (message: IPCMessage) => {
      const sessionId = message.session_id;
      if (!sessionId) return;

      const status = typeof message.data?.status === "string"
        ? message.data.status
        : (message.data as Session | undefined)?.status;
      const reason = typeof message.data?.reason === "string" ? message.data.reason : "";
      const messageError = typeof message.data?.error === "string" ? message.data.error : "";

      if (!status) return;

      if (status === "disconnected" || status === "error") {
        const tab = getTabBySessionId(sessionId);
        updateSession(sessionId, {
          status: status === "error" ? "error" : "disconnected",
          error: messageError || undefined,
        });

        if (status === "error") {
          const errorMsg = messageError || (message.data as Session | undefined)?.error || "Session ended with an error";
          toast.error(errorMsg);
        } else if (reason !== "user_initiated" && tab) {
          const existing = disconnectNotices.some((item) => item.sessionId === sessionId);
          if (!existing) {
            setDisconnectNotices((prev) => [
              ...prev,
              {
                sessionId,
                tabId: tab.id,
                title: tab.title,
                reason,
                error: messageError,
              }
            ]);
          }
        }
      }
    };

    backendService.on("session_status", handleSessionStatus);
    return () => {
      backendService.off("session_status", handleSessionStatus);
    };
  }, [disconnectNotices, getTabBySessionId, updateSession]);

  const handleDismissDisconnect = useCallback((item: DisconnectNotice) => {
    setDisconnectNotices((prev) => prev.filter((notice) => notice.sessionId !== item.sessionId));
  }, []);

  const handleCloseDisconnectedTab = useCallback(async (item: DisconnectNotice) => {
    setDisconnectNotices((prev) => prev.filter((notice) => notice.sessionId !== item.sessionId));

    try {
      await sshService.disconnect(item.sessionId);
    } catch {
      // Session may already be dead. UI cleanup should still proceed.
    }

    removeSession(item.sessionId);
    removeTab(item.tabId);
  }, [removeSession, removeTab]);

  const handleReconnect = useCallback(async (item: DisconnectNotice) => {
    const sessionData = getSession(item.sessionId);
    const connection = sessionData?.connection;
    if (!connection) {
      toast.error("Connection details not available for reconnect");
      return;
    }

    setReconnectingSessionId(item.sessionId);
    try {
      const newSession = await connectionService.connect(connection);
      addSession(newSession, connection);
      updateTabSession(item.tabId, newSession.id);
      removeSession(item.sessionId);
      setDisconnectNotices((prev) => prev.filter((notice) => notice.sessionId !== item.sessionId));
      toast.success(`Reconnected to ${connection.name || connection.host}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Reconnect failed";
      toast.error(message);
    } finally {
      setReconnectingSessionId(null);
    }
  }, [addSession, getSession, removeSession, updateTabSession]);

  const { handleNewLocalTerminal } = useLocalTerminal();

  const handleHomeClick = useCallback(() => {
    setMainView("home");
    clearSFTPConnection();
  }, [clearSFTPConnection]);

  const handleSFTPClick = useCallback(() => setMainView("sftp"), []);
  const handleSessionClick = useCallback(() => setMainView("terminal"), []);
  const handleSidebarTabChange = useCallback((tab: SidebarTab) => setSidebarTab(tab), []);

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
    onOpenSettings: () => setShowSettings(true),
    onShowShortcuts: () => setShowShortcuts(true),
  })

  useMenuActions({
    onNewConnection: () => {
      handleHomeClick()
      setSidebarTab('connections')
    },
    onCloseTab: () => {
      if (activeSessionTabId) {
        useTabStore.getState().removeTab(activeSessionTabId)
      }
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
