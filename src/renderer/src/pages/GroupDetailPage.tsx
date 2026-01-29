import { useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ConnectionList } from '@/components/connection/ConnectionList'
import { ConnectionForm } from '@/components/connection/ConnectionForm'
import { NewConnectionButton } from '@/components/connection/NewConnectionButton'
import { HostKeyVerificationDialog } from '@/components/knownhosts'
import { ConnectionsProvider } from '@/contexts/ConnectionsContext'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useConnections, useGroups } from '@/hooks'
import { useConnectionHandlers, useConnectionFilters } from '@/hooks/connections'
import { ConnectionConfig } from '@/types'

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
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
    handleVerificationCancel,
  } = useConnections()
  const { groups } = useGroups()

  const [searchQuery, setSearchQuery] = useState('')

  const group = groups.find(g => g.id === groupId)
  
  const connectionHandlers = useConnectionHandlers({
    deleteConnection,
    updateConnection,
    connectAndOpen,
    saveAndConnect,
  })

  const groupConnections = useMemo(
    () => connections.filter(conn => conn.group === group?.name),
    [connections, group?.name]
  )

  const { filteredConnections } = useConnectionFilters(
    groupConnections,
    searchQuery,
    null
  )

  const contextValue = useMemo(
    () => ({
      connections: groupConnections,
      filteredConnections,
      loading,
      connectingId,
      localTerminalLoading: false,
      selectedId: connectionHandlers.selectedId,
      searchQuery,
      selectedGroup: null,
      groups: [],
      groupCounts: {},
      pendingVerification,
      onSelect: connectionHandlers.handleSelect,
      onConnect: connectionHandlers.handleConnect,
      onOpenSFTP: connectionHandlers.handleOpenSFTP,
      onEdit: connectionHandlers.handleEdit,
      onDelete: connectionHandlers.handleDelete,
      onSearchChange: setSearchQuery,
      onGroupSelect: () => {},
      onNewConnection: connectionHandlers.handleNewConnection,
      onNewLocalTerminal: () => {},
      onNewGroup: () => {},
      onVerificationTrust: handleVerificationTrust,
      onVerificationCancel: handleVerificationCancel,
    }),
    [
      groupConnections,
      filteredConnections,
      loading,
      connectingId,
      connectionHandlers,
      searchQuery,
      pendingVerification,
      handleVerificationTrust,
      handleVerificationCancel,
    ]
  )

  if (!group) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Group not found</h2>
          <p className="text-sm text-muted-foreground mt-2">
            The group you're looking for doesn't exist
          </p>
        </div>
      </div>
    )
  }

  return (
    <ConnectionsProvider value={contextValue}>
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b bg-background/95">
          <Breadcrumb
            items={[
              { label: 'Connections', href: '/connections' },
              { label: group.name },
            ]}
          />
          <div className="mt-3">
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {group.connection_count} {group.connection_count === 1 ? 'connection' : 'connections'}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ConnectionList />
        </div>

        <NewConnectionButton onClick={connectionHandlers.handleNewConnection} />

        {connectionHandlers.showForm && (
          <ConnectionForm
            isOpen={connectionHandlers.showForm}
            connection={connectionHandlers.editingConnection}
            onConnect={connectionHandlers.handleFormConnect}
            onSave={connectionHandlers.handleFormSave}
            onClose={connectionHandlers.handleCloseForm}
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
