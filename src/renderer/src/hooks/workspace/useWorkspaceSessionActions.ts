import { useCallback } from 'react'
import { useSessionStore } from '@/stores/sessionStore'
import { useTabStore } from '@/stores/tabStore'
import { useUIStore } from '@/stores/uiStore'
import { sshService } from '@/services/ipc/ssh'
import { toast } from 'sonner'

export function useWorkspaceSessionActions(workspaceTabId: string) {
  const getSession = useSessionStore((state) => state.getSession)
  const removeSession = useSessionStore((state) => state.removeSession)

  const removeSessionFromWorkspaceTab = useTabStore((state) => state.removeSessionFromWorkspaceTab)
  const toggleWorkspacePinnedSession = useTabStore((state) => state.toggleWorkspacePinnedSession)
  const setWorkspaceSplitDirection = useTabStore((state) => state.setWorkspaceSplitDirection)

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
  }, [setWorkspaceSplitDirection, workspaceTabId])

  const splitDown = useCallback(() => {
    setWorkspaceSplitDirection(workspaceTabId, 'vertical')
  }, [setWorkspaceSplitDirection, workspaceTabId])

  return {
    disconnectSession,
    openSessionSFTP,
    togglePinned,
    splitRight,
    splitDown,
  }
}
