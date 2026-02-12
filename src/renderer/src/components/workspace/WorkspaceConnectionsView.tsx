import type { ConnectionConfig } from '@/types'

interface WorkspaceConnectionsViewProps {
  connections: ConnectionConfig[]
}

export function WorkspaceConnectionsView({ connections }: WorkspaceConnectionsViewProps) {
  return (
    <div className="h-full w-full p-4">
      <div className="mb-3 text-sm font-medium">Workspace Sessions</div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
        {connections.map((conn) => (
          <div key={conn.id} className="rounded-lg border border-border bg-card p-3">
            <div className="truncate text-sm font-semibold">{conn.name}</div>
            <div className="truncate text-xs text-muted-foreground">
              {conn.username}@{conn.host}:{conn.port}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
