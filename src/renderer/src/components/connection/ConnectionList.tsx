import { useState, useMemo } from 'react'
import { ConnectionCard } from './ConnectionCard'
import { GroupHeader } from './GroupHeader'
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Ungrouped']))

  const groupedConnections = useMemo(() => {
    const groups = new Map<string, ConnectionConfig[]>()
    
    connections.forEach(conn => {
      const groupName = conn.group || 'Ungrouped'
      if (!groups.has(groupName)) {
        groups.set(groupName, [])
      }
      groups.get(groupName)!.push(conn)
    })

    return Array.from(groups.entries()).sort(([a], [b]) => {
      if (a === 'Ungrouped') return 1
      if (b === 'Ungrouped') return -1
      return a.localeCompare(b)
    })
  }, [connections])

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupName)) {
        next.delete(groupName)
      } else {
        next.add(groupName)
      }
      return next
    })
  }

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
      <div className="py-4">
        {groupedConnections.map(([groupName, groupConnections]) => (
          <div key={groupName} className="mb-2">
            <GroupHeader
              name={groupName}
              count={groupConnections.length}
              isExpanded={expandedGroups.has(groupName)}
              onToggle={() => toggleGroup(groupName)}
            />
            {expandedGroups.has(groupName) && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 px-6 py-4">
                {groupConnections.map((connection) => (
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
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
