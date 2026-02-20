import { TerminalView } from '@/components/terminal/TerminalView'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { WorkspaceTerminalHeader } from './WorkspaceTerminalHeader'

interface WorkspaceSplitPanesProps {
  sessionIds: string[]
  activeSessionId: string | null
  focusedSessionId?: string
  titleBySessionId?: Record<string, string>
  onActivateSession?: (sessionId: string) => void
  onCloseSession?: (sessionId: string) => void
  onToggleFocusSession?: (sessionId: string) => void
  direction?: 'horizontal' | 'vertical'
}

export function WorkspaceSplitPanes({
  sessionIds,
  activeSessionId,
  focusedSessionId,
  titleBySessionId = {},
  onActivateSession,
  onCloseSession,
  onToggleFocusSession,
  direction = 'horizontal',
}: WorkspaceSplitPanesProps) {
  if (sessionIds.length === 0) return null

  if (sessionIds.length === 1) {
    const onlySessionId = sessionIds[0]
    return (
      <div className="h-full w-full p-2">
        <div
          className="h-full overflow-hidden rounded-md border border-primary/40"
          onClick={() => onActivateSession?.(onlySessionId)}
        >
          <WorkspaceTerminalHeader
            title={titleBySessionId[onlySessionId] || onlySessionId}
            focused={focusedSessionId === onlySessionId}
            onClose={() => onCloseSession?.(onlySessionId)}
            onToggleFocus={() => onToggleFocusSession?.(onlySessionId)}
          />
          <div className="h-[calc(100%-2.25rem)]">
            <TerminalView sessionId={onlySessionId} isActive={true} sidebarOpen={false} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <ResizablePanelGroup direction={direction} autoSaveId={`workspace-terminal-splits-${direction}`}>
      {sessionIds.flatMap((sessionId, index) => {
        const panel = (
          <ResizablePanel key={`panel-${sessionId}`} defaultSize={100 / sessionIds.length}>
            <div className="h-full p-2">
              <div
                className={`h-full overflow-hidden rounded-md border ${activeSessionId === sessionId ? 'border-primary/50' : 'border-border'}`}
                onClick={() => onActivateSession?.(sessionId)}
              >
                <WorkspaceTerminalHeader
                  title={titleBySessionId[sessionId] || sessionId}
                  focused={focusedSessionId === sessionId}
                  onClose={() => onCloseSession?.(sessionId)}
                  onToggleFocus={() => onToggleFocusSession?.(sessionId)}
                />
                <div className="h-[calc(100%-2.25rem)]">
                  <TerminalView sessionId={sessionId} isActive={activeSessionId === sessionId} sidebarOpen={false} />
                </div>
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
