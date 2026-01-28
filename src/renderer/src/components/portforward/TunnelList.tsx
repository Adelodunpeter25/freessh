import { PortForwardConfig } from '@/types'
import { TunnelCard } from './TunnelCard'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Network } from 'lucide-react'

interface TunnelListProps {
  configs: PortForwardConfig[]
  loading: boolean
  activeTunnels: Set<string>
  connections: Map<string, string>
  onStart: (id: string) => void
  onStop: (id: string) => void
  onEdit: (config: PortForwardConfig) => void
  onDelete: (id: string) => void
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function TunnelList({ configs, loading, activeTunnels, connections, onStart, onStop, onEdit, onDelete, selectedId, onSelect }: TunnelListProps) {

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (configs.length === 0) {
    return (
      <EmptyState
        icon={Network}
        title="No port forwards configured"
        description="Create a port forward to tunnel through SSH connections"
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-6">
      {configs.map((config) => (
        <TunnelCard
          key={config.id}
          config={config}
          connectionName={connections.get(config.connection_id)}
          isActive={activeTunnels.has(config.id)}
          selected={selectedId === config.id}
          onStart={onStart}
          onStop={onStop}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={(id) => onSelect(id)}
        />
      ))}
    </div>
  )
}
