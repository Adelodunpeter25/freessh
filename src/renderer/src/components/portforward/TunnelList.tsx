import { PortForwardConfig } from '@/types'
import { TunnelCard } from './TunnelCard'

interface TunnelListProps {
  configs: PortForwardConfig[]
  loading: boolean
  activeTunnels: Set<string>
  connections: Map<string, string>
  onStart: (id: string) => void
  onStop: (id: string) => void
  onEdit: (config: PortForwardConfig) => void
  onDelete: (id: string) => void
}

export function TunnelList({ configs, loading, activeTunnels, connections, onStart, onStop, onEdit, onDelete }: TunnelListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading port forwards...</p>
      </div>
    )
  }

  if (configs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-muted-foreground mb-2">No port forwards configured</p>
        <p className="text-sm text-muted-foreground">
          Create a port forward to tunnel through SSH connections
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 p-6">
      {configs.map((config) => (
        <TunnelCard
          key={config.id}
          config={config}
          connectionName={connections.get(config.connection_id)}
          isActive={activeTunnels.has(config.id)}
          onStart={onStart}
          onStop={onStop}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
