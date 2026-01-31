import { useCallback } from 'react'
import { useTabStore } from '@/stores'
import { useUIStore } from '@/stores/uiStore'
import { useSessionStore } from '@/stores/sessionStore'

export const useSessionTabActions = (onSFTPClick: () => void, onSessionClick: () => void) => {
  const { setActiveTab, removeTab, updateTabTitle, togglePinTab } = useTabStore()
  const openSFTP = useUIStore((state) => state.openSFTP)
  const getSession = useSessionStore((state) => state.getSession)

  const handleSelect = useCallback((id: string) => {
    setActiveTab(id)
    onSessionClick()
  }, [setActiveTab, onSessionClick])

  const handleClose = useCallback((id: string) => {
    removeTab(id)
  }, [removeTab])

  const handleRenameSubmit = useCallback((id: string, newTitle: string) => {
    updateTabTitle(id, newTitle)
  }, [updateTabTitle])

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
    handleRenameSubmit,
    handleOpenSFTP,
    handleTogglePin
  }
}
