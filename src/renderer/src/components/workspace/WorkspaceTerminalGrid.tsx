import { TerminalView } from '@/components/terminal/TerminalView'

interface WorkspaceTerminalGridProps {
  sessionIds: string[]
}

export function WorkspaceTerminalGrid({ sessionIds }: WorkspaceTerminalGridProps) {
  const columns = sessionIds.length > 1 ? 'grid-cols-2' : 'grid-cols-1'

  return (
    <div className={`grid h-full w-full gap-2 p-2 ${columns}`}>
      {sessionIds.map((sessionId) => (
        <div key={sessionId} className="min-h-0 overflow-hidden rounded-md border border-border">
          <TerminalView sessionId={sessionId} isActive={true} sidebarOpen={false} />
        </div>
      ))}
    </div>
  )
}
