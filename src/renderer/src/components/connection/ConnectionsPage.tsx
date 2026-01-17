import { useState } from 'react'
import { toast } from 'sonner'
import { ConnectionList } from './ConnectionList'
import { ConnectionForm } from './ConnectionForm'
import { NewConnectionButton } from './NewConnectionButton'
import { useConnections } from '@/hooks'
import { ConnectionConfig } from '@/types'

export function ConnectionsPage() {
  const { connections, loading, deleteConnection, updateConnection, connectToSaved } = useConnections()
  const [showForm, setShowForm] = useState(false)
  const [editingConnection, setEditingConnection] = useState<ConnectionConfig | undefined>()

  const handleConnect = async (connection: ConnectionConfig) => {
    try {
      await connectToSaved(connection.id)
      toast.success(`Connected to ${connection.name || connection.host}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to connect')
    }
  }

  const handleEdit = (connection: ConnectionConfig) => {
    setEditingConnection(connection)
    setShowForm(true)
  }

  const handleFormSave = async (config: ConnectionConfig) => {
    try {
      await updateConnection(config)
      toast.success('Connection updated')
      setShowForm(false)
      setEditingConnection(undefined)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update connection')
      throw error
    }
  }

  const handleFormConnect = async (config: ConnectionConfig) => {
    try {
      await connectToSaved(config.id)
      setShowForm(false)
      setEditingConnection(undefined)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to connect')
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteConnection(id)
      toast.success('Connection deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete connection')
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <NewConnectionButton onClick={() => setShowForm(true)} />
      </div>

      <div className="flex-1 overflow-hidden">
        <ConnectionList
          connections={connections}
          loading={loading}
          onConnect={handleConnect}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

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
    </div>
  )
}
