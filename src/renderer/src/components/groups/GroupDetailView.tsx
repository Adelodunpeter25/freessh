import { useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { GroupDetailHeader } from './GroupDetailHeader'
import { ConnectionList } from '@/components/connection/ConnectionList'
import { ConnectionForm } from '@/components/connection/ConnectionForm'
import { NewConnectionButton } from '@/components/connection/NewConnectionButton'
import { HostKeyVerificationDialog } from '@/components/knownhosts'
import { ConnectionsProvider } from '@/contexts/ConnectionsContext'
import { Group, ConnectionConfig } from '@/types'
import { HostKeyVerification } from '@/types/knownHost'

interface GroupDetailViewProps {
  group: Group
  connections: ConnectionConfig[]
  onBack: () => void
  connectionHandlers: any
  loading: boolean
  connectingId: string | null
  pendingVerification: HostKeyVerification | null
  handleVerificationTrust: () => void
  handleVerificationCancel: () => void
}

export function GroupDetailView({
  group,
  connections,
  onBack,
  connectionHandlers,
  loading,
  connectingId,
  pendingVerification,
  handleVerificationTrust,
  handleVerificationCancel,
}: GroupDetailViewProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConnections = useMemo(
    () => connections.filter(conn =>
      conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.username.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [connections, searchQuery]
  )

  const contextValue = useMemo(
    () => ({
      connections,
      filteredConnections,
      loading,
      connectingId,
      localTerminalLoading: false,
      selectedId: connectionHandlers.selectedId,
      searchQuery,
      selectedGroup: group.name,
      groups: [],
      groupCounts: {},
      pendingVerification,
      onSelect: connectionHandlers.handleSelect,
      onConnect: connectionHandlers.handleConnect,
      onOpenSFTP: connectionHandlers.handleOpenSFTP,
      onEdit: connectionHandlers.handleEdit,
      onDuplicate: connectionHandlers.handleDuplicate,
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
      connections,
      filteredConnections,
      loading,
      connectingId,
      connectionHandlers,
      searchQuery,
      group.name,
      pendingVerification,
      handleVerificationTrust,
      handleVerificationCancel,
    ]
  )

  return (
    <ConnectionsProvider value={contextValue}>
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b bg-background/95">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Breadcrumb
              items={[
                { label: 'Connections', onClick: onBack },
                { label: group.name },
              ]}
            />
          </div>
        </div>
        <GroupDetailHeader groupName={group.name} />

        <div className="flex-1 overflow-hidden">
          <ConnectionList />
        </div>

        <NewConnectionButton onClick={connectionHandlers.handleNewConnection} />

        {connectionHandlers.showForm && (
          <ConnectionForm
            isOpen={connectionHandlers.showForm}
            connection={connectionHandlers.editingConnection}
            mode={connectionHandlers.formMode}
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
