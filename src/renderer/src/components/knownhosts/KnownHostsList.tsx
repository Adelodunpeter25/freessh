import { ScrollArea } from '@/components/ui/scroll-area'
import { KnownHostCard } from './KnownHostCard'
import { useKnownHosts } from '@/hooks/useKnownHosts'

export function KnownHostsList() {
  const { hosts, loading, removeHost } = useKnownHosts()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading known hosts...</p>
      </div>
    )
  }

  if (hosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-muted-foreground mb-2">No known hosts yet</p>
        <p className="text-sm text-muted-foreground">
          Host fingerprints will be saved when you connect to servers
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 p-6">
        {hosts.map((host) => (
          <KnownHostCard key={host.id} host={host} onRemove={removeHost} />
        ))}
      </div>
    </ScrollArea>
  )
}
