import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ConnectionList } from '@/components/connection/ConnectionList'
import { ConnectionForm } from '@/components/connection/ConnectionForm'
import { ConnectionsHeader } from '@/components/connection/ConnectionsHeader'
import { NewConnectionButton } from '@/components/connection/NewConnectionButton'
import { GroupsSection, GroupSidebar } from '@/components/groups'
import { GroupDetailView } from '@/components/groups/GroupDetailView'
import { HostKeyVerificationDialog } from '@/components/knownhosts'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ConnectionsProvider } from '@/contexts/ConnectionsContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useConnections } from '@/hooks'
import {
  useConnectionHandlers,
  useGroupHandlers,
  useLocalTerminal,
  useConnectionFilters,
} from '@/hooks/connections'

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
    handleVerificationCancel,
  } = useConnections()

  const [searchQuery, setSearchQuery] = useState('')
  const [connectionsCollapsed, setConnectionsCollapsed] = useState(false)

  const connectionHandlers = useConnectionHandlers({
    deleteConnection,
    updateConnection,
    connectAndOpen,
    saveAndConnect,
  })
  const groupHandlers = useGroupHandlers()
  const localTerminal = useLocalTerminal()
  const { filteredConnections, groupNames, groupCounts } = useConnectionFilters(
    connections,
    searchQuery,
    groupHandlers.selectedGroup
  )

  const contextValue = useMemo(
    () => ({
      connections,
      filteredConnections,
      loading,
      connectingId,
      localTerminalLoading: localTerminal.localTerminalLoading,
      selectedId: connectionHandlers.selectedId,
      searchQuery,
      selectedGroup: groupHandlers.selectedGroup,
      groups: groupNames,
      groupCounts,
      pendingVerification,
      onSelect: connectionHandlers.handleSelect,
      onConnect: connectionHandlers.handleConnect,
      onOpenSFTP: connectionHandlers.handleOpenSFTP,
      onEdit: connectionHandlers.handleEdit,
      onDelete: connectionHandlers.handleDelete,
      onSearchChange: setSearchQuery,
      onGroupSelect: groupHandlers.handleSelectGroup,
      onNewConnection: connectionHandlers.handleNewConnection,
      onNewLocalTerminal: localTerminal.handleNewLocalTerminal,
      onNewGroup: groupHandlers.handleNewGroup,
      onVerificationTrust: handleVerificationTrust,
      onVerificationCancel: handleVerificationCancel,
    }),
    [
      connections,
      filteredConnections,
      loading,
      connectingId,
      localTerminal.localTerminalLoading,
      connectionHandlers.selectedId,
      searchQuery,
      groupHandlers.selectedGroup,
      groupNames,
      groupCounts,
      pendingVerification,
      connectionHandlers.handleSelect,
      connectionHandlers.handleConnect,
      connectionHandlers.handleOpenSFTP,
      connectionHandlers.handleEdit,
      connectionHandlers.handleDelete,
      groupHandlers.handleSelectGroup,
      connectionHandlers.handleNewConnection,
      localTerminal.handleNewLocalTerminal,
      groupHandlers.handleNewGroup,
      handleVerificationTrust,
      handleVerificationCancel,
    ]
  )

  return (
    <ConnectionsProvider value={contextValue}>
      {groupHandlers.openedGroup ? (
        <GroupDetailView
          group={groupHandlers.openedGroup}
          connections={connections.filter(c => c.group === groupHandlers.openedGroup?.name)}
          onBack={groupHandlers.handleCloseGroupDetail}
          connectionHandlers={connectionHandlers}
          loading={loading}
          connectingId={connectingId}
          pendingVerification={pendingVerification}
          handleVerificationTrust={handleVerificationTrust}
          handleVerificationCancel={handleVerificationCancel}
        />
      ) : (
        <div className="h-full flex flex-col relative">
          <ConnectionsHeader />
          <GroupsSection
            groups={groupHandlers.groups}
            loading={groupHandlers.loading}
            selectedGroupId={groupHandlers.selectedGroupId}
            onSelectGroup={groupHandlers.handleSelectGroup}
            onEditGroup={groupHandlers.handleEditGroup}
            onDeleteGroup={groupHandlers.handleDeleteGroup}
            onOpenGroup={groupHandlers.handleOpenGroup}
          />
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b bg-background/95">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setConnectionsCollapsed(!connectionsCollapsed)}
                >
                  {connectionsCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <h2 className="text-sm font-semibold text-foreground">
                  Connections ({connections.length})
                </h2>
                <Badge variant="secondary">{connections.length}</Badge>
              </div>
            </div>
            {!connectionsCollapsed && (
              <div className="flex-1 overflow-hidden">
                <ConnectionList />
              </div>
            )}
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

          <GroupSidebar
            isOpen={groupHandlers.showGroupSidebar}
            onClose={groupHandlers.handleCloseGroupSidebar}
            group={groupHandlers.editingGroup}
            onSave={groupHandlers.handleSaveGroup}
          />

          <ConfirmDialog
            open={!!groupHandlers.groupToDelete}
            onOpenChange={(open) => !open && groupHandlers.handleCancelDeleteGroup()}
            title="Delete group"
            description={`Are you sure you want to delete "${groupHandlers.groupToDelete?.name}"? Connections in this group will not be deleted.`}
            onConfirm={groupHandlers.handleConfirmDeleteGroup}
            confirmText="Delete"
            destructive
          />

          <HostKeyVerificationDialog
            open={!!pendingVerification}
            verification={pendingVerification}
            onTrust={handleVerificationTrust}
            onCancel={handleVerificationCancel}
          />
        </div>
      )}
    </ConnectionsProvider>
  )
}
