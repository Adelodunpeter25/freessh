import { useState, useCallback } from 'react'
import { ConnectionConfig } from '@/types'
import { useConnections } from '@/hooks'
import { useUIStore } from '@/stores/uiStore'

export function useConnectionHandlers() {
  const { deleteConnection, updateConnection, connectAndOpen, saveAndConnect } = useConnections()
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
  }, [updateConnection])

  const handleDelete = useCallback(async (id: string) => {
    await deleteConnection(id)
  }, [deleteConnection])

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
