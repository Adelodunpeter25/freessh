import { TerminalView } from '@/components/terminal/TerminalView'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

interface WorkspaceSplitPanesProps {
  sessionIds: string[]
  activeSessionId: string | null
  onActivateSession?: (sessionId: string) => void
}

export function WorkspaceSplitPanes({ sessionIds, activeSessionId, onActivateSession }: WorkspaceSplitPanesProps) {
  if (sessionIds.length === 0) return null

  if (sessionIds.length === 1) {
    const onlySessionId = sessionIds[0]
    return (
      <div className="h-full w-full p-2">
        <div
          className="h-full overflow-hidden rounded-md border border-primary/40"
          onClick={() => onActivateSession?.(onlySessionId)}
        >
          <TerminalView sessionId={onlySessionId} isActive={true} sidebarOpen={false} />
        </div>
      </div>
    )
  }

  return (
    <ResizablePanelGroup direction="horizontal" autoSaveId="workspace-terminal-splits">
      {sessionIds.flatMap((sessionId, index) => {
        const panel = (
          <ResizablePanel key={`panel-${sessionId}`} defaultSize={100 / sessionIds.length}>
            <div className="h-full p-2">
              <div
                className={`h-full overflow-hidden rounded-md border ${activeSessionId === sessionId ? 'border-primary/50' : 'border-border'}`}
                onClick={() => onActivateSession?.(sessionId)}
              >
                <TerminalView sessionId={sessionId} isActive={activeSessionId === sessionId} sidebarOpen={false} />
              </div>
            </div>
          </ResizablePanel>
        )

        if (index === sessionIds.length - 1) return [panel]
        return [panel, <ResizableHandle key={`handle-${sessionId}`} />]
      })}
    </ResizablePanelGroup>
  )
}
