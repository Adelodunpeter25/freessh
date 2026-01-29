import { useState, useCallback } from 'react'
import { ConnectionConfig } from '@/types'
import { useUIStore } from '@/stores/uiStore'

interface UseConnectionHandlersProps {
  deleteConnection: (id: string) => Promise<void>
  updateConnection: (config: ConnectionConfig) => Promise<void>
  connectAndOpen: (config: ConnectionConfig) => Promise<any>
  saveAndConnect: (config: ConnectionConfig) => Promise<void>
  refreshGroups?: () => Promise<void>
}

export function useConnectionHandlers({
  deleteConnection,
  updateConnection,
  connectAndOpen,
  saveAndConnect,
  refreshGroups,
}: UseConnectionHandlersProps) {
  const openSFTP = useUIStore((state) => state.openSFTP)
  const [showForm, setShowForm] = useState(false)
  const [editingConnection, setEditingConnection] = useState<ConnectionConfig | undefined>()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleSelect = useCallback((connection: ConnectionConfig | null) => {
    setSelectedId(connection?.id ?? null)
  }, [])

  const handleConnect = useCallback(async (connection: ConnectionConfig) => {
    await connectAndOpen(connection)
  }, [connectAndOpen])

  const handleOpenSFTP = useCallback((connection: ConnectionConfig) => {
    openSFTP(connection.id)
  }, [openSFTP])

  const handleEdit = useCallback((connection: ConnectionConfig) => {
    setEditingConnection(connection)
    setShowForm(true)
  }, [])

  const handleFormConnect = useCallback(async (config: ConnectionConfig) => {
    await saveAndConnect(config)
    setShowForm(false)
    setEditingConnection(undefined)
  }, [saveAndConnect])

  const handleFormSave = useCallback(async (config: ConnectionConfig) => {
    await updateConnection(config)
    setShowForm(false)
    setEditingConnection(undefined)
    if (refreshGroups) await refreshGroups()
  }, [updateConnection, refreshGroups])

  const handleDelete = useCallback(async (id: string) => {
    await deleteConnection(id)
    if (refreshGroups) await refreshGroups()
  }, [deleteConnection, refreshGroups])

  const handleCloseForm = useCallback(() => {
    setShowForm(false)
    setEditingConnection(undefined)
  }, [])

  const handleNewConnection = useCallback(() => {
    setShowForm(true)
  }, [])

  return {
    selectedId,
    showForm,
    editingConnection,
    handleSelect,
    handleConnect,
    handleOpenSFTP,
    handleEdit,
    handleFormConnect,
    handleFormSave,
    handleDelete,
    handleCloseForm,
    handleNewConnection,
  }
}
