import { useState, useCallback } from 'react'
import { ConnectionList } from '@/components/connection/ConnectionList'
import { ConnectionForm } from '@/components/connection/ConnectionForm'
import { ConnectionsHeader } from '@/components/connection/ConnectionsHeader'
import { NewConnectionButton } from '@/components/connection/NewConnectionButton'
import { useConnections } from '@/hooks'
import { useUIStore } from '@/stores/uiStore'
import { ConnectionConfig } from '@/types'

export function ConnectionsPage() {
  const { 
    connections, 
    loading, 
    connectingId,
    deleteConnection, 
    updateConnection, 
    connectAndOpen,
    saveAndConnect 
  } = useConnections()
  const openSFTP = useUIStore((state) => state.openSFTP)
  const [showForm, setShowForm] = useState(false)
  const [editingConnection, setEditingConnection] = useState<ConnectionConfig | undefined>()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  const groups = Array.from(new Set(connections.map(c => c.group).filter(Boolean))) as string[]

  const filteredConnections = connections
    .filter(conn => 
      conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(conn => selectedGroup === null || conn.group === selectedGroup)

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

  return (
    <div className="h-full flex flex-col relative">
      <ConnectionsHeader 
        onNewConnection={() => setShowForm(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filteredConnections={filteredConnections}
        onConnect={handleConnect}
        onOpenSFTP={handleOpenSFTP}
        groups={groups}
        selectedGroup={selectedGroup}
        onGroupSelect={setSelectedGroup}
      />
      <div className="flex-1 overflow-hidden">
        <ConnectionList
          connections={filteredConnections}
          loading={loading}
          selectedId={selectedId}
          connectingId={connectingId}
          onSelect={handleSelect}
          onConnect={handleConnect}
          onOpenSFTP={handleOpenSFTP}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isSearching={searchQuery.trim().length > 0}
        />
      </div>

      <NewConnectionButton onClick={() => setShowForm(true)} />

      {showForm && (
        <ConnectionForm
          connection={editingConnection}
          onConnect={handleFormConnect}
          onSave={handleFormSave}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}
