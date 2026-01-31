import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { TitleBar } from "./TitleBar";
import { MainLayoutSidebar } from "./MainLayoutSidebar";
import { MainLayoutContent } from "./MainLayoutContent";
import { KeyboardShortcutsDialog } from "@/components/common/KeyboardShortcutsDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { ExportImportDialog } from "@/components/export-import";
import { TerminalSidebar } from "./MainLayoutRoutes";
import { useTabStore } from "@/stores/tabStore";
import { useUIStore } from "@/stores/uiStore";
import { useSnippetStore } from "@/stores/snippetStore";
import { useKeyboardShortcuts, useLocalTerminal } from "@/hooks";
import { useMenuActions } from "@/hooks";
import { Snippet } from "@/types/snippet";
import { terminalService } from "@/services/ipc/terminal";
import { toast } from "sonner";
import { SnippetForm } from "./MainLayoutRoutes";

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
  const currentTab = tabs.find(tab => tab.id === activeSessionTabId);
  const activeSessionId = currentTab?.sessionId;
  const sftpConnectionId = useUIStore((state) => state.sftpConnectionId);
  const clearSFTPConnection = useUIStore((state) => state.clearSFTPConnection);
  const createSnippet = useSnippetStore((state) => state.createSnippet);
  const updateSnippet = useSnippetStore((state) => state.updateSnippet);
  const deleteSnippet = useSnippetStore((state) => state.deleteSnippet);
  const prevTabsLength = useRef(tabs.length);

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
  }, [sftpConnectionId]);

  const { handleNewLocalTerminal } = useLocalTerminal();

  const handleHomeClick = useCallback(() => {
    setMainView("home");
    clearSFTPConnection();
  }, [clearSFTPConnection]);

  const handleSFTPClick = useCallback(() => setMainView("sftp"), []);
  const handleSessionClick = useCallback(() => setMainView("terminal"), []);
  const handleSidebarTabChange = useCallback((tab: SidebarTab) => setSidebarTab(tab), []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSwitchTab: (index) => {
      if (index === 0) {
        handleHomeClick()
      } else if (index === 1) {
        handleSFTPClick()
      } else {
        handleSessionClick()
      }
    },
    onNewConnection: () => {
      handleHomeClick()
      setSidebarTab('connections')
    },
    onNewLocalTerminal: handleNewLocalTerminal,
    onOpenSettings: () => setShowSettings(true),
    onShowShortcuts: () => setShowShortcuts(true),
  })

  // Menu actions
  useMenuActions({
    onNewConnection: () => {
      handleHomeClick()
      setSidebarTab('connections')
    },
    onCloseTab: () => {
      if (activeSessionTabId) {
        useTabStore.getState().closeTab(activeSessionTabId)
      }
    },
    onOpenSettings: () => setShowSettings(true),
    onShowShortcuts: () => setShowShortcuts(true),
    onCheckUpdates: () => {
      // TODO: Implement update checker
      console.log('Check for updates')
    },
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

      {/* Home view with sidebar */}
      <div className={mainView === "home" ? "flex-1 overflow-hidden" : "hidden"}>
        <MainLayoutSidebar sidebarTab={sidebarTab} onSidebarTabChange={handleSidebarTabChange} />
      </div>

      {/* SFTP and Terminal views */}
      <MainLayoutContent
        mainView={mainView}
        tabs={tabs}
        activeSessionTabId={activeSessionTabId}
        showTerminalSettings={showTerminalSettings}
      />

      {/* Terminal Sidebar */}
      {showTerminalSettings && mainView === "terminal" && (
        <Suspense fallback={null}>
          <TerminalSidebar 
            onClose={() => setShowTerminalSettings(false)}
            onPasteSnippet={(command) => {
              if (activeSessionId) {
                terminalService.sendInput(activeSessionId, command)
              } else {
                toast.error('No active terminal session')
              }
            }}
            onRunSnippet={(command) => {
              if (activeSessionId) {
                terminalService.sendInput(activeSessionId, command + '\n')
              } else {
                toast.error('No active terminal session')
              }
            }}
            onEditSnippet={(snippet) => {
              setEditingSnippet(snippet)
              setShowTerminalSettings(false)
              setShowSnippetForm(true)
            }}
            onDeleteSnippet={(snippet) => {
              setDeletingSnippet(snippet)
            }}
            onNewSnippet={() => {
              setEditingSnippet(null)
              setShowTerminalSettings(false)
              setShowSnippetForm(true)
            }}
            activeSessionId={activeSessionId || null}
          />
        </Suspense>
      )}

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />

      {/* Settings Dialog */}
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />

      {/* Export/Import Dialog */}
      <ExportImportDialog isOpen={showExportImport} onClose={() => setShowExportImport(false)} />

      {/* Snippet Form */}
      {showSnippetForm && (
        <Suspense fallback={null}>
          <SnippetForm
            isOpen={showSnippetForm}
            snippet={editingSnippet}
            onClose={() => {
              setShowSnippetForm(false)
              setEditingSnippet(null)
              setShowTerminalSettings(true)
            }}
            onSave={async (data) => {
              if (editingSnippet) {
                await updateSnippet({
                  id: editingSnippet.id,
                  ...data
                })
              } else {
                await createSnippet(data)
              }
              setShowSnippetForm(false)
              setEditingSnippet(null)
              setShowTerminalSettings(true)
            }}
          />
        </Suspense>
      )}

      {/* Delete Snippet Confirm Dialog */}
      <ConfirmDialog
        open={!!deletingSnippet}
        onOpenChange={(open) => !open && setDeletingSnippet(null)}
        title="Delete Snippet"
        description={`Are you sure you want to delete "${deletingSnippet?.name}"? This action cannot be undone.`}
        onConfirm={async () => {
          if (deletingSnippet) {
            await deleteSnippet(deletingSnippet.id)
            setDeletingSnippet(null)
          }
        }}
        confirmText="Delete"
        destructive
      />
    </div>
  );
}
