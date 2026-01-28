import { TunnelInfo } from '@/types'
import { TunnelCard } from './TunnelCard'

interface TunnelListProps {
  tunnels: TunnelInfo[]
  loading: boolean
  onStop: (id: string) => void
}

export function TunnelList({ tunnels, loading, onStop }: TunnelListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading tunnels...</p>
      </div>
    )
  }

  if (tunnels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-muted-foreground mb-2">No active tunnels</p>
        <p className="text-sm text-muted-foreground">
          Create a tunnel to forward ports through SSH
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 p-6">
      {tunnels.map((tunnel) => (
        <TunnelCard key={tunnel.id} tunnel={tunnel} onStop={onStop} />
      ))}
    </div>
  )
}
