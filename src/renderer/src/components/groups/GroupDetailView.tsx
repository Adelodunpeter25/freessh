import { useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ConnectionList } from '@/components/connection/ConnectionList'
import { ConnectionForm } from '@/components/connection/ConnectionForm'
import { NewConnectionButton } from '@/components/connection/NewConnectionButton'
import { HostKeyVerificationDialog } from '@/components/knownhosts'
import { ConnectionsProvider } from '@/contexts/ConnectionsContext'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
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

  const isSearching = searchQuery.trim().length > 0

  const contextValue = useMemo(
    () => ({
      connections,
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
      connections,
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

  return (
    <ConnectionsProvider value={contextValue}>
      <div className="h-full flex flex-col">
        <div className="flex flex-col px-4 py-3 border-b bg-background/95">
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
                { label: 'Connections', onClick: onBack },
                { label: group.name },
              ]}
            />
          </div>
          <div className="ml-11 mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{group.name}</h1>
              <Badge variant="secondary">{connections.length}</Badge>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find a host or ssh user@hostname..."
                className="pl-10 pr-10 bg-muted/50"
              />
              {isSearching && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
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
