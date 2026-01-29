import { useState, useMemo } from 'react'
import { ConnectionList } from '@/components/connection/ConnectionList'
import { ConnectionForm } from '@/components/connection/ConnectionForm'
import { ConnectionsHeader } from '@/components/connection/ConnectionsHeader'
import { NewConnectionButton } from '@/components/connection/NewConnectionButton'
import { GroupsSection, GroupSidebar } from '@/components/groups'
import { HostKeyVerificationDialog } from '@/components/knownhosts'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ConnectionsProvider } from '@/contexts/ConnectionsContext'
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
    handleVerificationTrust,
    handleVerificationCancel,
  } = useConnections()

  const [searchQuery, setSearchQuery] = useState('')

  const connectionHandlers = useConnectionHandlers()
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
      <div className="h-full flex flex-col relative">
        <ConnectionsHeader />
        <GroupsSection
          groups={groupHandlers.groups}
          selectedGroupId={groupHandlers.selectedGroupId}
          onSelectGroup={groupHandlers.handleSelectGroup}
          onEditGroup={groupHandlers.handleEditGroup}
          onDeleteGroup={groupHandlers.handleDeleteGroup}
        />
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
    </ConnectionsProvider>
  )
}
