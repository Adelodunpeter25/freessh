import { Suspense, useCallback, useState } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SFTPPage, TerminalView, LogViewer } from "./MainLayoutRoutes";
import { WorkspaceEmptyState, WorkspacePicker, WorkspaceShell, WorkspaceSidebar, WorkspaceSplitPanes } from "@/components/workspace";
import { useConnectionStore } from "@/stores/connectionStore";
import { useTabStore } from "@/stores/tabStore";
import { useSessionStore } from "@/stores/sessionStore";
import { connectionService } from "@/services/ipc/connection";
import { Tab } from "@/types";
import { toast } from "sonner";

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
  const setWorkspaceActiveSession = useTabStore((state) => state.setWorkspaceActiveSession)
  const addSessionToWorkspaceTab = useTabStore((state) => state.addSessionToWorkspaceTab)
  const getAllSessions = useSessionStore((state) => state.getAllSessions)
  const addSession = useSessionStore((state) => state.addSession)
  const getSession = useSessionStore((state) => state.getSession)
  const [openingWorkspaceTabs, setOpeningWorkspaceTabs] = useState<Record<string, boolean>>({})

  const handleOpenWorkspace = useCallback(async (tab: Tab) => {
    const selectedConnectionIds = tab.workspaceConnectionIds || []
    if (selectedConnectionIds.length === 0) return

    setOpeningWorkspaceTabs((prev) => ({ ...prev, [tab.id]: true }))
    const sessionIds: string[] = []

    try {
      for (const connectionId of selectedConnectionIds) {
        const existing = getAllSessions().find(
          (item) =>
            item.connection?.id === connectionId &&
            (item.session.status === 'connected' || item.session.status === 'connecting'),
        )

        if (existing) {
          sessionIds.push(existing.session.id)
          continue
        }

        const connection = connections.find((conn) => conn.id === connectionId)
        if (!connection) continue

        try {
          const session = await connectionService.connect(connection)
          addSession(session, connection)
          sessionIds.push(session.id)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to connect'
          toast.error(`Failed to connect ${connection.name}: ${message}`)
        }
      }

      if (sessionIds.length === 0) {
        toast.error('No sessions could be opened for this workspace')
        return
      }

      openWorkspaceTab(tab.id, sessionIds)
    } finally {
      setOpeningWorkspaceTabs((prev) => ({ ...prev, [tab.id]: false }))
    }
  }, [addSession, connections, getAllSessions, openWorkspaceTab])

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
                  sidebar={
                    tab.workspaceMode === 'workspace' ? (
                      <WorkspaceSidebar
                        tabs={(tab.workspaceSessionIds || []).map((sessionId) => {
                          const item = getSession(sessionId)
                          const connection = item?.connection
                          const isLocal = item?.session.connection_id === 'local'
                          const localTitle = 'Local Terminal'
                          const remoteTitle = connection?.name || (connection?.username && connection?.host
                            ? `${connection.username}@${connection.host}`
                            : sessionId)
                          const title = isLocal ? localTitle : remoteTitle
                          const subtitle = isLocal
                            ? sessionId
                            : connection
                              ? `${connection.username}@${connection.host}`
                              : sessionId

                          return {
                            sessionId,
                            title,
                            subtitle,
                            connectionId: connection?.id,
                            isLocal,
                          }
                        })}
                        activeTabId={tab.workspaceActiveSessionId || tab.workspaceSessionIds?.[0] || null}
                        onSelectTab={(sessionId) => setWorkspaceActiveSession(tab.id, sessionId)}
                        onDropSession={(sessionId) => addSessionToWorkspaceTab(tab.id, sessionId)}
                      />
                    ) : undefined
                  }
                  content={
                    tab.workspaceMode === 'workspace' ? (
                      (tab.workspaceSessionIds?.length ?? 0) > 0 ? (
                        <WorkspaceSplitPanes
                          sessionIds={tab.workspaceSessionIds || []}
                          activeSessionId={tab.workspaceActiveSessionId || tab.workspaceSessionIds?.[0] || null}
                          onActivateSession={(sessionId) => setWorkspaceActiveSession(tab.id, sessionId)}
                        />
                      ) : (
                        <WorkspaceEmptyState
                          title="No active sessions"
                          description="Open workspace again after selecting one or more connections."
                        />
                      )
                    ) : (
                      <WorkspacePicker
                        connections={connections}
                        selectedIds={tab.workspaceConnectionIds || []}
                        onSelectionChange={(ids) => updateWorkspaceTabSelection(tab.id, ids)}
                        onOpenWorkspace={() => handleOpenWorkspace(tab)}
                        opening={openingWorkspaceTabs[tab.id] === true}
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
