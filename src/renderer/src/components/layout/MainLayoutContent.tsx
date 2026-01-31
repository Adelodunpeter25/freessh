import { Suspense } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SFTPPage, TerminalView, LogViewer } from "./MainLayoutRoutes";
import { Tab } from "@/types";

type MainView = "home" | "sftp" | "terminal";

interface MainLayoutContentProps {
  mainView: MainView;
  tabs: Tab[];
  activeSessionTabId: string | null;
  showTerminalSettings: boolean;
}

export function MainLayoutContent({ mainView, tabs, activeSessionTabId, showTerminalSettings }: MainLayoutContentProps) {
  return (
    <>
      {/* SFTP view */}
      <div className={mainView === "sftp" ? "flex-1 overflow-hidden" : "hidden"}>
        <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}>
          <SFTPPage />
        </Suspense>
      </div>

      {/* Terminal view */}
      <div className={mainView === "terminal" ? "flex-1 overflow-hidden transition-all" : "hidden"} style={{ paddingRight: showTerminalSettings ? '320px' : '0' }}>
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
                  sidebarOpen={showTerminalSettings}
                />
              )}
            </div>
          ))}
        </Suspense>
      </div>
    </>
  );
}
