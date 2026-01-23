import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { TitleBar } from "./TitleBar";
import { Sidebar } from "./Sidebar";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useTabStore } from "@/stores/tabStore";
import { useUIStore } from "@/stores/uiStore";

// Lazy load pages
const ConnectionsPage = lazy(() => import("@/pages/ConnectionsPage").then(m => ({ default: m.ConnectionsPage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const SFTPPage = lazy(() => import("@/pages/SFTPPage"));
const TerminalView = lazy(() => import("@/components/terminal/TerminalView").then(m => ({ default: m.TerminalView })));
const TerminalSettings = lazy(() => import("@/components/terminal/TerminalSettings").then(m => ({ default: m.TerminalSettings })));

type SidebarTab = "connections" | "snippets" | "settings";
type MainView = "home" | "sftp" | "terminal";

export function MainLayout() {
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("connections");
  const [mainView, setMainView] = useState<MainView>("home");
  const [showTerminalSettings, setShowTerminalSettings] = useState(false);
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

  const renderHomeContent = () => {
    switch (sidebarTab) {
      case "connections":
        return <ConnectionsPage />;
      case "snippets":
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Snippets
          </div>
        );
      case "settings":
        return <SettingsPage />;
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
          {activeTab && <TerminalView sessionId={activeTab.sessionId} />}
        </Suspense>
      </div>

      {/* Terminal Settings Sidebar */}
      {showTerminalSettings && (
        <Suspense fallback={null}>
          <TerminalSettings onClose={() => setShowTerminalSettings(false)} />
        </Suspense>
      )}
    </div>
  );
}
