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
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
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
    setFormMode('edit')
    setEditingConnection(connection)
    setShowForm(true)
  }, [])

  const handleDuplicate = useCallback((connection: ConnectionConfig) => {
    setFormMode('create')
    setEditingConnection({
      ...connection,
      id: crypto.randomUUID(),
      name: `${connection.name} Copy`,
    })
    setShowForm(true)
  }, [])

  const handleFormConnect = useCallback(async (config: ConnectionConfig) => {
    await saveAndConnect(config)
    setShowForm(false)
    setEditingConnection(undefined)
    setFormMode('create')
  }, [saveAndConnect])

  const handleFormSave = useCallback(async (config: ConnectionConfig) => {
    await updateConnection(config)
    setShowForm(false)
    setEditingConnection(undefined)
    setFormMode('create')
    if (refreshGroups) await refreshGroups()
  }, [updateConnection, refreshGroups])

  const handleDelete = useCallback(async (id: string) => {
    await deleteConnection(id)
    if (refreshGroups) await refreshGroups()
  }, [deleteConnection, refreshGroups])

  const handleCloseForm = useCallback(() => {
    setShowForm(false)
    setEditingConnection(undefined)
    setFormMode('create')
  }, [])

  const handleNewConnection = useCallback(() => {
    setFormMode('create')
    setEditingConnection(undefined)
    setShowForm(true)
  }, [])

  return {
    selectedId,
    showForm,
    editingConnection,
    formMode,
    handleSelect,
    handleConnect,
    handleOpenSFTP,
    handleEdit,
    handleDuplicate,
    handleFormConnect,
    handleFormSave,
    handleDelete,
    handleCloseForm,
    handleNewConnection,
  }
}
