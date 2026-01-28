import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { ConnectionList } from '@/components/connection/ConnectionList'
import { ConnectionForm } from '@/components/connection/ConnectionForm'
import { ConnectionsHeader } from '@/components/connection/ConnectionsHeader'
import { NewConnectionButton } from '@/components/connection/NewConnectionButton'
import { HostKeyVerificationDialog } from '@/components/knownhosts'
import { ConnectionsProvider } from '@/contexts/ConnectionsContext'
import { useConnections } from '@/hooks'
import { useSessions } from '@/hooks/useSessions'
import { useTabStore } from '@/stores/tabStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useUIStore } from '@/stores/uiStore'
import { ConnectionConfig } from '@/types'

export function ConnectionsPage() {
  const { 
    connections, 
    loading, 
    connectingId,
    pendingVerification,
    deleteConnection, 
    updateConnection, 
    connectAndOpen,
    saveAndConnect,
    handleVerificationTrust,
    handleVerificationCancel
  } = useConnections()
  const { connectLocal } = useSessions()
  const addLocalTab = useTabStore((state) => state.addLocalTab)
  const addSession = useSessionStore((state) => state.addSession)
  const openSFTP = useUIStore((state) => state.openSFTP)
  const [showForm, setShowForm] = useState(false)
  const [editingConnection, setEditingConnection] = useState<ConnectionConfig | undefined>()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  const groups = Array.from(new Set(connections.map(c => c.group).filter(Boolean))) as string[]
  
  const groupCounts = groups.reduce((acc, group) => {
    acc[group] = connections.filter(c => c.group === group).length
    return acc
  }, {} as Record<string, number>)

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

  const handleNewLocalTerminal = useCallback(async () => {
    try {
      const session = await connectLocal()
      addSession(session)
      addLocalTab(session)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to open local terminal')
    }
  }, [connectLocal, addSession, addLocalTab])

  const contextValue = useMemo(() => ({
    connections,
    filteredConnections,
    loading,
    connectingId,
    selectedId,
    searchQuery,
    selectedGroup,
    groups,
    groupCounts,
    pendingVerification,
    onSelect: handleSelect,
    onConnect: handleConnect,
    onOpenSFTP: handleOpenSFTP,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onSearchChange: setSearchQuery,
    onGroupSelect: setSelectedGroup,
    onNewConnection: () => setShowForm(true),
    onNewLocalTerminal: handleNewLocalTerminal,
    onVerificationTrust: handleVerificationTrust,
    onVerificationCancel: handleVerificationCancel,
  }), [
    connections,
    filteredConnections,
    loading,
    connectingId,
    selectedId,
    searchQuery,
    selectedGroup,
    groups,
    groupCounts,
    pendingVerification,
    handleSelect,
    handleConnect,
    handleOpenSFTP,
    handleEdit,
    handleDelete,
    handleNewLocalTerminal,
    handleVerificationTrust,
    handleVerificationCancel,
  ])

  return (
    <ConnectionsProvider value={contextValue}>
      <div className="h-full flex flex-col relative">
        <ConnectionsHeader />
        <div className="flex-1 overflow-hidden">
          <ConnectionList />
        </div>

        <NewConnectionButton onClick={() => setShowForm(true)} />

        {showForm && (
          <ConnectionForm
            isOpen={showForm}
            connection={editingConnection}
            onConnect={handleFormConnect}
            onSave={handleFormSave}
            onClose={handleCloseForm}
          />
        )}

        <HostKeyVerificationDialog
          open={!!pendingVerification}
          verification={pendingVerification}
          onTrust={handleVerificationTrust}
          onCancel={handleVerificationCancel}
        />
      </div>
    </ConnectionsProvider>
  )
}
