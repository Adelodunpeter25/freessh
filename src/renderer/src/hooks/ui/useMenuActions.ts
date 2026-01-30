import { useEffect } from 'react'

interface MenuActions {
  onNewConnection: () => void
  onCloseTab: () => void
  onOpenSettings: () => void
  onShowShortcuts: () => void
  onCheckUpdates: () => void
  onExportImport: () => void
}

export function useMenuActions(actions: MenuActions) {
  useEffect(() => {
    const handleNewConnection = () => actions.onNewConnection()
    const handleCloseTab = () => actions.onCloseTab()
    const handleOpenSettings = () => actions.onOpenSettings()
    const handleShowShortcuts = () => actions.onShowShortcuts()
    const handleCheckUpdates = () => actions.onCheckUpdates()
    const handleExportImport = () => actions.onExportImport()

    window.electron.ipcRenderer.on('menu:new-connection', handleNewConnection)
    window.electron.ipcRenderer.on('menu:close-tab', handleCloseTab)
    window.electron.ipcRenderer.on('menu:open-settings', handleOpenSettings)
    window.electron.ipcRenderer.on('menu:show-shortcuts', handleShowShortcuts)
    window.electron.ipcRenderer.on('menu:check-updates', handleCheckUpdates)
    window.electron.ipcRenderer.on('menu:export-import', handleExportImport)

    return () => {
      window.electron.ipcRenderer.removeListener('menu:new-connection', handleNewConnection)
      window.electron.ipcRenderer.removeListener('menu:close-tab', handleCloseTab)
      window.electron.ipcRenderer.removeListener('menu:open-settings', handleOpenSettings)
      window.electron.ipcRenderer.removeListener('menu:show-shortcuts', handleShowShortcuts)
      window.electron.ipcRenderer.removeListener('menu:check-updates', handleCheckUpdates)
      window.electron.ipcRenderer.removeListener('menu:export-import', handleExportImport)
    }
  }, [actions])
}
