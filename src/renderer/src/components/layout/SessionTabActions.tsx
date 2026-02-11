import { useCallback } from 'react'
import { useTabStore } from '@/stores'
import { useUIStore } from '@/stores/uiStore'
import { useSessionStore } from '@/stores/sessionStore'
import { sshService } from '@/services/ipc/ssh'
import { connectionService } from '@/services/ipc/connection'
import { sessionService } from '@/services/ipc/session'
import { toast } from 'sonner'

export const useSessionTabActions = (onSFTPClick: () => void, onSessionClick: () => void) => {
  const tabs = useTabStore((state) => state.tabs)
  const { setActiveTab, removeTab, updateTabTitle, togglePinTab, addTab, addLocalTab } = useTabStore()
  const openSFTP = useUIStore((state) => state.openSFTP)
  const getSession = useSessionStore((state) => state.getSession)
  const removeSession = useSessionStore((state) => state.removeSession)
  const addSession = useSessionStore((state) => state.addSession)

  const handleSelect = useCallback((id: string) => {
    setActiveTab(id)
    onSessionClick()
  }, [setActiveTab, onSessionClick])

  const handleClose = useCallback(async (id: string) => {
    const tab = tabs.find((item) => item.id === id)
    if (!tab) return

    if (tab.type === 'log') {
      removeTab(id)
      return
    }

    try {
      await sshService.disconnect(tab.sessionId)
      removeSession(tab.sessionId)
      removeTab(id)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to disconnect session'
      toast.error(message)
    }
  }, [tabs, removeSession, removeTab])

  const handleRenameSubmit = useCallback((id: string, newTitle: string) => {
    updateTabTitle(id, newTitle)
  }, [updateTabTitle])

  const handleDuplicate = useCallback(async (id: string) => {
    const tab = tabs.find((item) => item.id === id)
    if (!tab || tab.type === 'log') return

    const sessionData = getSession(tab.sessionId)
    if (!sessionData) {
      toast.error('Session data unavailable for duplicate')
      return
    }

    try {
      // Local terminal
      if (sessionData.session.connection_id === 'local' || !sessionData.connection) {
        const newSession = await sessionService.connectLocal()
        addSession(newSession)
        addLocalTab(newSession)
        onSessionClick()
        return
      }

      // Remote terminal: reconnect using existing connection config.
      const newSession = await connectionService.connect(sessionData.connection)
      addSession(newSession, sessionData.connection)
      addTab(newSession, sessionData.connection, 'terminal')
      onSessionClick()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to duplicate tab'
      toast.error(message)
    }
  }, [tabs, getSession, addSession, addLocalTab, addTab, onSessionClick])

  const handleOpenSFTP = useCallback((sessionId: string) => {
    const sessionData = getSession(sessionId)
    if (sessionData) {
      openSFTP(sessionData.connection.id)
      onSFTPClick()
    }
  }, [getSession, openSFTP, onSFTPClick])

  const handleTogglePin = useCallback((id: string) => {
    togglePinTab(id)
  }, [togglePinTab])

  return {
    handleSelect,
    handleClose,
    handleDuplicate,
    handleRenameSubmit,
    handleOpenSFTP,
    handleTogglePin
  }
}
