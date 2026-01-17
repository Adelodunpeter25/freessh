import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { ConnectionList } from '@/components/connection/ConnectionList'
import { ConnectionForm } from '@/components/connection/ConnectionForm'
import { NewConnectionButton } from '@/components/connection/NewConnectionButton'
import { LoadingOverlay } from '@/components/common/LoadingOverlay'
import { useConnections } from '@/hooks'
import { useSessionStore } from '@/stores/sessionStore'
import { useTabStore } from '@/stores/tabStore'
import { useUIStore } from '@/stores/uiStore'
import { ConnectionConfig } from '@/types'

export function ConnectionsPage() {
  const { connections, loading, deleteConnection, updateConnection, connect, loadConnections } = useConnections()
  const addSession = useSessionStore((state) => state.addSession)
  const addTab = useTabStore((state) => state.addTab)
  const openSFTP = useUIStore((state) => state.openSFTP)
  const [showForm, setShowForm] = useState(false)
  const [editingConnection, setEditingConnection] = useState<ConnectionConfig | undefined>()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [connectingId, setConnectingId] = useState<string | null>(null)

  const handleSelect = useCallback((connection: ConnectionConfig | null) => {
    setSelectedId(connection?.id ?? null)
  }, [])

  const handleConnect = useCallback(async (connection: ConnectionConfig) => {
    setConnectingId(connection.id)
    try {
      const session = await connect(connection)
      addSession(session, connection)
      addTab(session, connection, 'terminal')
      toast.success(`Connected to ${connection.name || connection.host}`)
    } catch (error) {
      console.error('Failed to connect:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to connect')
    } finally {
      setConnectingId(null)
    }
  }, [connect, addSession, addTab])

  const handleOpenSFTP = useCallback((connection: ConnectionConfig) => {
    openSFTP(connection.id)
  }, [openSFTP])

  const handleEdit = useCallback((connection: ConnectionConfig) => {
    setEditingConnection(connection)
    setShowForm(true)
  }, [])

  const handleFormConnect = useCallback(async (config: ConnectionConfig) => {
    try {
      const session = await connect(config)
      
      addSession(session, config)
      addTab(session, config, 'terminal')
      
      await loadConnections()
      
      setShowForm(false)
      setEditingConnection(undefined)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to connect')
      throw error
    }
  }, [connect, addSession, addTab, loadConnections])

  const handleFormSave = useCallback(async (config: ConnectionConfig) => {
    try {
      await updateConnection(config)
      toast.success('Connection updated')
      setShowForm(false)
      setEditingConnection(undefined)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update connection')
      throw error
    }
  }, [updateConnection])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteConnection(id)
      toast.success('Connection deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete connection')
    }
  }, [deleteConnection])

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 overflow-hidden">
        <ConnectionList
          connections={connections}
          loading={loading}
          selectedId={selectedId}
          connectingId={connectingId}
          onSelect={handleSelect}
          onConnect={handleConnect}
          onOpenSFTP={handleOpenSFTP}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <NewConnectionButton onClick={() => setShowForm(true)} />

      {showForm && (
        <ConnectionForm
          connection={editingConnection}
          onConnect={handleFormConnect}
          onSave={handleFormSave}
          onClose={() => {
            setShowForm(false)
            setEditingConnection(undefined)
          }}
        />
      )}

      <LoadingOverlay visible={!!connectingId} message="Connecting..." />
    </div>
  )
}
