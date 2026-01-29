import { useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/ui/breadcrumb'
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
  const contextValue = useMemo(
    () => ({
      connections,
      filteredConnections: connections,
      loading,
      connectingId,
      localTerminalLoading: false,
      selectedId: connectionHandlers.selectedId,
      searchQuery: '',
      selectedGroup: null,
      groups: [],
      groupCounts: {},
      pendingVerification,
      onSelect: connectionHandlers.handleSelect,
      onConnect: connectionHandlers.handleConnect,
      onOpenSFTP: connectionHandlers.handleOpenSFTP,
      onEdit: connectionHandlers.handleEdit,
      onDelete: connectionHandlers.handleDelete,
      onSearchChange: () => {},
      onGroupSelect: () => {},
      onNewConnection: connectionHandlers.handleNewConnection,
      onNewLocalTerminal: () => {},
      onNewGroup: () => {},
      onVerificationTrust: handleVerificationTrust,
      onVerificationCancel: handleVerificationCancel,
    }),
    [
      connections,
      loading,
      connectingId,
      connectionHandlers,
      pendingVerification,
      handleVerificationTrust,
      handleVerificationCancel,
    ]
  )

  return (
    <ConnectionsProvider value={contextValue}>
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b bg-background/95">
          <div className="flex items-center gap-3 mb-3">
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
                { label: 'Connections', href: '#' },
                { label: group.name },
              ]}
            />
          </div>
          <div className="ml-11">
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
