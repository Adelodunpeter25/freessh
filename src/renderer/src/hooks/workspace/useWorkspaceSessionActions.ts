import { useCallback } from 'react'
import { useSessionStore } from '@/stores/sessionStore'
import { useTabStore } from '@/stores/tabStore'
import { useUIStore } from '@/stores/uiStore'
import { sshService } from '@/services/ipc/ssh'
import { toast } from 'sonner'

export function useWorkspaceSessionActions(workspaceTabId: string) {
  const workspaceTab = useTabStore((state) =>
    state.tabs.find((tab) => tab.id === workspaceTabId && tab.type === 'workspace'),
  )
  const getSession = useSessionStore((state) => state.getSession)
  const removeSession = useSessionStore((state) => state.removeSession)

  const removeSessionFromWorkspaceTab = useTabStore((state) => state.removeSessionFromWorkspaceTab)
  const toggleWorkspacePinnedSession = useTabStore((state) => state.toggleWorkspacePinnedSession)
  const setWorkspaceSplitDirection = useTabStore((state) => state.setWorkspaceSplitDirection)
  const hideWorkspaceSessionFromView = useTabStore((state) => state.hideWorkspaceSessionFromView)
  const setWorkspaceFocusSession = useTabStore((state) => state.setWorkspaceFocusSession)
  const renameWorkspaceSession = useTabStore((state) => state.renameWorkspaceSession)

  const openSFTP = useUIStore((state) => state.openSFTP)

  const disconnectSession = useCallback(async (sessionId: string) => {
    try {
      await sshService.disconnect(sessionId)
    } catch {
      // Session may already be disconnected.
    }

    removeSession(sessionId)
    removeSessionFromWorkspaceTab(workspaceTabId, sessionId)
    toast.success('Session disconnected')
  }, [removeSession, removeSessionFromWorkspaceTab, workspaceTabId])

  const openSessionSFTP = useCallback((sessionId: string) => {
    const sessionData = getSession(sessionId)
    const connectionId = sessionData?.connection?.id
    if (!connectionId) {
      toast.error('SFTP is only available for remote sessions')
      return
    }

    openSFTP(connectionId)
  }, [getSession, openSFTP])

  const togglePinned = useCallback((sessionId: string) => {
    toggleWorkspacePinnedSession(workspaceTabId, sessionId)
  }, [toggleWorkspacePinnedSession, workspaceTabId])

  const splitRight = useCallback(() => {
    setWorkspaceSplitDirection(workspaceTabId, 'horizontal')
    setWorkspaceFocusSession(workspaceTabId, undefined)
  }, [setWorkspaceFocusSession, setWorkspaceSplitDirection, workspaceTabId])

  const splitDown = useCallback(() => {
    setWorkspaceSplitDirection(workspaceTabId, 'vertical')
    setWorkspaceFocusSession(workspaceTabId, undefined)
  }, [setWorkspaceFocusSession, setWorkspaceSplitDirection, workspaceTabId])

  const closeFromView = useCallback((sessionId: string) => {
    hideWorkspaceSessionFromView(workspaceTabId, sessionId)
  }, [hideWorkspaceSessionFromView, workspaceTabId])

  const toggleFocus = useCallback((sessionId: string) => {
    const focused = workspaceTab?.workspaceFocusSessionId
    setWorkspaceFocusSession(workspaceTabId, focused === sessionId ? undefined : sessionId)
  }, [setWorkspaceFocusSession, workspaceTab?.workspaceFocusSessionId, workspaceTabId])

  const renameSession = useCallback((sessionId: string, title: string) => {
    const next = title.trim()
    if (!next) return
    renameWorkspaceSession(workspaceTabId, sessionId, next)
    toast.success('Session renamed in workspace')
  }, [renameWorkspaceSession, workspaceTabId])

  return {
    disconnectSession,
    openSessionSFTP,
    togglePinned,
    splitRight,
    splitDown,
    closeFromView,
    toggleFocus,
    renameSession,
  }
}
