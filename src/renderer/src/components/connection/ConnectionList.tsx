import { ConnectionCard } from './ConnectionCard'
import { EmptyState } from '@/components/common/EmptyState'
import { SearchEmptyState } from './SearchEmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ConnectionConfig } from '@/types'
import { Server } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ConnectionListProps {
  connections: ConnectionConfig[]
  loading: boolean
  selectedId: string | null
  connectingId: string | null
  onSelect: (connection: ConnectionConfig | null) => void
  onConnect: (connection: ConnectionConfig) => void
  onOpenSFTP: (connection: ConnectionConfig) => void
  onEdit: (connection: ConnectionConfig) => void
  onDelete: (id: string) => Promise<void>
  isSearching?: boolean
}

export function ConnectionList({ connections, loading, selectedId, connectingId, onSelect, onConnect, onOpenSFTP, onEdit, onDelete, isSearching }: ConnectionListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  if (connections.length === 0) {
    if (isSearching) {
      return <SearchEmptyState />
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
        {connections.map((connection) => (
          <ConnectionCard
            key={connection.id}
            connection={connection}
            selected={selectedId === connection.id}
            loading={connectingId === connection.id}
            onSelect={onSelect}
            onConnect={onConnect}
            onOpenSFTP={onOpenSFTP}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
