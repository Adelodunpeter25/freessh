import { ConnectionCard } from './ConnectionCard'
import { EmptyState } from '@/components/common/EmptyState'
import { SearchEmptyState } from './SearchEmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useConnectionsContext } from '@/contexts/ConnectionsContext'
import { Server } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export function ConnectionList() {
  const {
    filteredConnections,
    loading,
    selectedId,
    connectingId,
    selectedGroup,
    onSelect,
    onConnect,
    onOpenSFTP,
    onEdit,
    onDuplicate,
    onDelete,
    searchQuery,
  } = useConnectionsContext()

  const isSearching = searchQuery.trim().length > 0
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  if (filteredConnections.length === 0) {
    if (isSearching) {
      return <SearchEmptyState />
    }
    if (selectedGroup) {
      return (
        <EmptyState
          icon={Server}
          title="No connections in this group"
          description={`The "${selectedGroup}" group doesn't have any connections yet`}
        />
      )
    }
    return (
      <EmptyState
        icon={Server}
        title="No connections"
        description="Create your first SSH connection to get started"
      />
    )
  }

  return (
    <ScrollArea className="h-full" onClick={() => onSelect(null)}>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 p-6">
        {filteredConnections.map((connection) => (
          <ConnectionCard
            key={connection.id}
            connection={connection}
            selected={selectedId === connection.id}
            loading={connectingId === connection.id}
            onSelect={onSelect}
            onConnect={onConnect}
            onOpenSFTP={onOpenSFTP}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
