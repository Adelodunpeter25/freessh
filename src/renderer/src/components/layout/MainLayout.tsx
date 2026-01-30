import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { TitleBar } from "./TitleBar";
import { Sidebar } from "./Sidebar";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { KeyboardShortcutsDialog } from "@/components/common/KeyboardShortcutsDialog";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { ExportImportDialog } from "@/components/export-import";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useTabStore } from "@/stores/tabStore";
import { useUIStore } from "@/stores/uiStore";
import { useKeyboardShortcuts } from "@/hooks";
import { useMenuActions } from "@/hooks";

// Lazy load pages
const ConnectionsPage = lazy(() => import("@/pages/ConnectionsPage").then(m => ({ default: m.ConnectionsPage })));
const SFTPPage = lazy(() => import("@/pages/SFTPPage"));
const TerminalView = lazy(() => import("@/components/terminal/TerminalView").then(m => ({ default: m.TerminalView })));
const TerminalSettings = lazy(() => import("@/components/terminal/TerminalSettings").then(m => ({ default: m.TerminalSettings })));
const KeygenList = lazy(() => import("@/components/keygen").then(m => ({ default: m.KeygenList })));
const KnownHostsPage = lazy(() => import("@/pages/KnownHostsPage").then(m => ({ default: m.KnownHostsPage })));
const PortForwardPage = lazy(() => import("@/pages/PortForwardPage").then(m => ({ default: m.PortForwardPage })));
const LogsPage = lazy(() => import("@/pages/LogsPage").then(m => ({ default: m.LogsPage })));
const LogViewer = lazy(() => import("@/components/logs").then(m => ({ default: m.LogViewer })));

type SidebarTab = "connections" | "keys" | "known-hosts" | "port-forward" | "logs" | "settings";
type MainView = "home" | "sftp" | "terminal";

export function MainLayout() {
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("connections");
  const [mainView, setMainView] = useState<MainView>("home");
  const [showTerminalSettings, setShowTerminalSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);
  const activeSessionTabId = useTabStore((state) => state.activeTabId);
  const tabs = useTabStore((state) => state.tabs);
  const sftpConnectionId = useUIStore((state) => state.sftpConnectionId);
  const clearSFTPConnection = useUIStore((state) => state.clearSFTPConnection);
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

  const renderHomeContent = () => {
    switch (sidebarTab) {
      case "connections":
        return <ConnectionsPage />;
      case "keys":
        return <KeygenList />;
      case "known-hosts":
        return <KnownHostsPage />;
      case "port-forward":
        return <PortForwardPage />;
      case "logs":
        return <LogsPage />;
      default:
        return null;
    }
  };

  const activeTab = tabs.find((t) => t.id === activeSessionTabId);

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
        <ResizablePanelGroup direction="horizontal" autoSaveId="sidebar-layout">
          <ResizablePanel defaultSize={20} minSize={20}>
            <Sidebar onTabChange={handleSidebarTabChange} />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={80}>
            <div className="h-full w-full bg-background overflow-hidden">
              <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}>
                {renderHomeContent()}
              </Suspense>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* SFTP view */}
      <div className={mainView === "sftp" ? "flex-1 overflow-hidden" : "hidden"}>
        <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}>
          <SFTPPage />
        </Suspense>
      </div>

      {/* Terminal view */}
      <div className={mainView === "terminal" ? "flex-1 overflow-hidden" : "hidden"}>
        <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={activeSessionTabId === tab.id ? "h-full w-full" : "hidden"}
            >
              {tab.type === 'log' ? (
                <LogViewer content={tab.logContent || ''} />
              ) : (
                <TerminalView
                  sessionId={tab.sessionId}
                  isActive={activeSessionTabId === tab.id && mainView === "terminal"}
                />
              )}
            </div>
          ))}
        </Suspense>
      </div>

      {/* Terminal Settings Sidebar */}
      {showTerminalSettings && (
        <Suspense fallback={null}>
          <TerminalSettings onClose={() => setShowTerminalSettings(false)} />
        </Suspense>
      )}

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />

      {/* Settings Dialog */}
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />

      {/* Export/Import Dialog */}
      <ExportImportDialog isOpen={showExportImport} onClose={() => setShowExportImport(false)} />
    </div>
  );
}
