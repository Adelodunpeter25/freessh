import { Suspense, useCallback, useState } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SFTPPage, TerminalView, LogViewer } from "./MainLayoutRoutes";
import { WorkspaceEmptyState, WorkspacePicker, WorkspaceShell, WorkspaceSidebar, WorkspaceSplitPanes } from "@/components/workspace";
import { useConnectionStore } from "@/stores/connectionStore";
import { useTabStore } from "@/stores/tabStore";
import { useSessionStore } from "@/stores/sessionStore";
import { connectionService } from "@/services/ipc/connection";
import { Tab } from "@/types";
import { generateUniqueTitle } from "@/utils/tabNaming";
import { useWorkspaceSessionActions } from "@/hooks/workspace";
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
  const showWorkspaceSessionInView = useTabStore((state) => state.showWorkspaceSessionInView)
  const setWorkspaceFocusSession = useTabStore((state) => state.setWorkspaceFocusSession)
  const dropSessionIntoWorkspaceTab = useTabStore((state) => state.dropSessionIntoWorkspaceTab)
  const removeTab = useTabStore((state) => state.removeTab)
  const getAllSessions = useSessionStore((state) => state.getAllSessions)
  const addSession = useSessionStore((state) => state.addSession)
  const getSession = useSessionStore((state) => state.getSession)
  const [openingWorkspaceTabs, setOpeningWorkspaceTabs] = useState<Record<string, boolean>>({})
  const activeTab = tabs.find((tab) => tab.id === activeSessionTabId) || null
  const activeWorkspaceTab = tabs.find((tab) => tab.id === activeSessionTabId && tab.type === 'workspace')
  const workspaceActions = useWorkspaceSessionActions(activeWorkspaceTab?.id || '')

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

  const handleSidebarSelect = useCallback((tab: Tab, sessionId: string) => {
    const hidden = new Set(tab.workspaceHiddenSessionIds || [])
    if (hidden.has(sessionId)) {
      showWorkspaceSessionInView(tab.id, sessionId)
    } else {
      setWorkspaceActiveSession(tab.id, sessionId)
    }

    // If focus mode is on, selecting a session should switch focused terminal.
    if (tab.workspaceFocusSessionId) {
      setWorkspaceFocusSession(tab.id, sessionId)
    }
  }, [setWorkspaceActiveSession, setWorkspaceFocusSession, showWorkspaceSessionInView])

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
          {activeTab ? (
            <div key={activeTab.id} className="h-full w-full">
              {activeTab.type === 'log' ? (
                <LogViewer content={activeTab.logContent || ''} />
              ) : activeTab.type === 'workspace' ? (
                <WorkspaceShell
                  title={activeTab.title}
                  sidebar={
                    activeTab.workspaceMode === 'workspace' ? (
                      <WorkspaceSidebar
                        tabs={(() => {
                          const pinnedSet = new Set(activeTab.workspacePinnedSessionIds || [])
                          const usedTitles: string[] = []
                          const orderedSessionIds = [
                            ...(activeTab.workspaceSessionIds || []).filter((id) => pinnedSet.has(id)),
                            ...(activeTab.workspaceSessionIds || []).filter((id) => !pinnedSet.has(id)),
                          ]
                          return orderedSessionIds.map((sessionId) => {
                            const item = getSession(sessionId)
                            const connection = item?.connection
                            const isLocal = item?.session.connection_id === 'local'
                            const baseTitle = isLocal
                              ? 'Local Terminal'
                              : connection?.name || connection?.host || sessionId
                            const preferred = activeTab.workspaceSessionTitles?.[sessionId]?.trim() || baseTitle
                            const title = generateUniqueTitle(preferred, usedTitles)
                            usedTitles.push(title)

                            return {
                              sessionId,
                              title,
                              subtitle: undefined,
                              connectionId: connection?.id,
                              isLocal,
                              isPinned: pinnedSet.has(sessionId),
                            }
                          })
                        })()}
                        activeTabId={activeTab.workspaceActiveSessionId || activeTab.workspaceSessionIds?.[0] || null}
                        onSelectTab={(sessionId) => handleSidebarSelect(activeTab, sessionId)}
                        onDropSession={(sessionId, sourceTabId) => {
                          addSessionToWorkspaceTab(activeTab.id, sessionId)
                          if (sourceTabId) {
                            removeTab(sourceTabId)
                          }
                        }}
                        onDisconnectSession={workspaceActions.disconnectSession}
                        onOpenSFTP={workspaceActions.openSessionSFTP}
                        onRenameSession={workspaceActions.renameSession}
                        onTogglePin={workspaceActions.togglePinned}
                        onSplitRight={workspaceActions.splitRight}
                        onSplitDown={workspaceActions.splitDown}
                      />
                    ) : undefined
                  }
                  content={
                    activeTab.workspaceMode === 'workspace' ? (
                      (activeTab.workspaceSessionIds?.length ?? 0) > 0 ? (
                        (() => {
                          const hidden = new Set(activeTab.workspaceHiddenSessionIds || [])
                          const visibleSessionIds = (activeTab.workspaceSessionIds || []).filter((id) => !hidden.has(id))
                          const focusedSessionId = activeTab.workspaceFocusSessionId
                          const renderedSessionIds =
                            focusedSessionId && visibleSessionIds.includes(focusedSessionId)
                              ? [focusedSessionId]
                              : visibleSessionIds

                          if (renderedSessionIds.length === 0) {
                            return (
                              <WorkspaceEmptyState
                                title="All sessions hidden"
                                description="Click a session in the sidebar to open it again."
                              />
                            )
                          }

                          const titleBySessionId: Record<string, string> = {}
                          const usedTitles: string[] = []
                          ;(activeTab.workspaceSessionIds || []).forEach((sessionId) => {
                            const item = getSession(sessionId)
                            const connection = item?.connection
                            const isLocal = item?.session.connection_id === 'local'
                            const baseTitle = isLocal
                              ? 'Local Terminal'
                              : connection?.name || (connection?.username && connection?.host
                                  ? `${connection.username}@${connection.host}`
                                  : sessionId)
                            const preferred = activeTab.workspaceSessionTitles?.[sessionId]?.trim() || baseTitle
                            const title = generateUniqueTitle(preferred, usedTitles)
                            usedTitles.push(title)
                            titleBySessionId[sessionId] = title
                          })

                          return (
                        <WorkspaceSplitPanes
                          sessionIds={renderedSessionIds}
                          activeSessionId={activeTab.workspaceActiveSessionId || renderedSessionIds[0] || null}
                          focusedSessionId={activeTab.workspaceFocusSessionId}
                          titleBySessionId={titleBySessionId}
                          onActivateSession={(sessionId) => setWorkspaceActiveSession(activeTab.id, sessionId)}
                          onCloseSession={workspaceActions.closeFromView}
                          onToggleFocusSession={workspaceActions.toggleFocus}
                          onReorderSession={(sessionId, targetSessionId, position) => {
                            dropSessionIntoWorkspaceTab(activeTab.id, sessionId, targetSessionId, position)
                          }}
                          onAttachSession={(sessionId) => {
                            addSessionToWorkspaceTab(activeTab.id, sessionId)
                          }}
                          direction={activeTab.workspaceSplitDirection || 'horizontal'}
                        />
                      )
                        })()
                      ) : (
                        <WorkspaceEmptyState
                          title="No active sessions"
                          description="Open workspace again after selecting one or more connections."
                        />
                      )
                    ) : (
                      <WorkspacePicker
                        connections={connections}
                        selectedIds={activeTab.workspaceConnectionIds || []}
                        onSelectionChange={(ids) => updateWorkspaceTabSelection(activeTab.id, ids)}
                        onOpenWorkspace={() => handleOpenWorkspace(activeTab)}
                        opening={openingWorkspaceTabs[activeTab.id] === true}
                      />
                    )
                  }
                />
              ) : (
                <TerminalView
                  sessionId={activeTab.sessionId}
                  isActive={mainView === "terminal"}
                  sidebarOpen={showTerminalSettings}
                />
              )}
            </div>
          ) : null}
        </Suspense>
      </div>
    </>
  );
}
