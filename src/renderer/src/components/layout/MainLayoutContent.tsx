import { Suspense } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SFTPPage, TerminalView, LogViewer } from "./MainLayoutRoutes";
import { WorkspaceConnectionsView, WorkspaceEmptyState, WorkspacePicker, WorkspaceShell, WorkspaceSidebar } from "@/components/workspace";
import { useConnectionStore } from "@/stores/connectionStore";
import { useTabStore } from "@/stores/tabStore";
import { Tab } from "@/types";

type MainView = "home" | "sftp" | "terminal";

interface MainLayoutContentProps {
  mainView: MainView;
  tabs: Tab[];
  activeSessionTabId: string | null;
  showTerminalSettings: boolean;
}

export function MainLayoutContent({ mainView, tabs, activeSessionTabId, showTerminalSettings }: MainLayoutContentProps) {
  const connections = useConnectionStore((state) => state.connections)
  const updateWorkspaceTabSelection = useTabStore((state) => state.updateWorkspaceTabSelection)
  const openWorkspaceTab = useTabStore((state) => state.openWorkspaceTab)

  return (
    <>
      {/* SFTP view */}
      <div className={mainView === "sftp" ? "flex-1 overflow-hidden" : "hidden"}>
        <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}>
          <SFTPPage />
        </Suspense>
      </div>

      {/* Terminal view */}
      <div className={mainView === "terminal" ? "flex-1 overflow-hidden transition-[padding-right] duration-150 ease-out" : "hidden"} style={{ paddingRight: showTerminalSettings ? '320px' : '0' }}>
        <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={activeSessionTabId === tab.id ? "h-full w-full" : "hidden"}
            >
              {tab.type === 'log' ? (
                <LogViewer content={tab.logContent || ''} />
              ) : tab.type === 'workspace' ? (
                <WorkspaceShell
                  title={tab.title}
                  sidebar={<WorkspaceSidebar tabs={[]} activeTabId={null} />}
                  content={
                    tab.workspaceMode === 'workspace' ? (
                      (tab.workspaceConnectionIds?.length ?? 0) > 0 ? (
                        <WorkspaceConnectionsView
                          connections={connections.filter((conn) =>
                            (tab.workspaceConnectionIds || []).includes(conn.id),
                          )}
                        />
                      ) : (
                        <WorkspaceEmptyState
                          title="No connections selected"
                          description="Go back and select connections to open in this workspace."
                        />
                      )
                    ) : (
                      <WorkspacePicker
                        connections={connections}
                        selectedIds={tab.workspaceConnectionIds || []}
                        onSelectionChange={(ids) => updateWorkspaceTabSelection(tab.id, ids)}
                        onOpenWorkspace={() => openWorkspaceTab(tab.id)}
                      />
                    )
                  }
                />
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
