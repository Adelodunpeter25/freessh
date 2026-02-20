import { useState } from 'react'
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
  onReorderSession?: (sessionId: string, targetSessionId: string) => void
  onSplitDown?: () => void
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
  onReorderSession,
  onSplitDown,
  direction = 'horizontal',
}: WorkspaceSplitPanesProps) {
  const [dragTargetSessionId, setDragTargetSessionId] = useState<string | null>(null)

  const handleHeaderDragStart = (event: React.DragEvent, sessionId: string) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/x-freessh-workspace-session', sessionId)
  }

  const handleHeaderDragOver = (event: React.DragEvent, sessionId: string) => {
    const isWorkspaceSession = event.dataTransfer.types.includes('application/x-freessh-workspace-session')
    if (!isWorkspaceSession) return
    event.preventDefault()
    setDragTargetSessionId(sessionId)
  }

  const handleHeaderDrop = (event: React.DragEvent, targetSessionId: string) => {
    event.preventDefault()
    setDragTargetSessionId(null)
    const sessionId = event.dataTransfer.getData('application/x-freessh-workspace-session')
    if (!sessionId || sessionId === targetSessionId) return

    onSplitDown?.()
    onReorderSession?.(sessionId, targetSessionId)
  }

  const hiddenSessionIds =
    focusedSessionId && sessionIds.includes(focusedSessionId)
      ? sessionIds.filter((id) => id !== focusedSessionId)
      : []

  const renderedSessionIds =
    focusedSessionId && sessionIds.includes(focusedSessionId)
      ? [focusedSessionId]
      : sessionIds

  if (sessionIds.length === 0) return null

  if (renderedSessionIds.length === 1) {
    const onlySessionId = renderedSessionIds[0]
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
            draggable={sessionIds.length > 1}
            onDragStart={(event) => handleHeaderDragStart(event, onlySessionId)}
            onDragOver={(event) => handleHeaderDragOver(event, onlySessionId)}
            onDrop={(event) => handleHeaderDrop(event, onlySessionId)}
          />
          <div className="h-[calc(100%-2.25rem)]">
            <TerminalView sessionId={onlySessionId} isActive={true} sidebarOpen={false} />
          </div>
        </div>
        {hiddenSessionIds.map((sessionId) => (
          <div key={`hidden-${sessionId}`} className="hidden">
            <TerminalView sessionId={sessionId} isActive={false} sidebarOpen={false} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <ResizablePanelGroup direction={direction} autoSaveId={`workspace-terminal-splits-${direction}`}>
        {renderedSessionIds.flatMap((sessionId, index) => {
          const panel = (
            <ResizablePanel key={`panel-${sessionId}`} defaultSize={100 / renderedSessionIds.length}>
              <div className="h-full p-2">
                <div
                  className={`h-full overflow-hidden rounded-md border ${
                    dragTargetSessionId === sessionId
                      ? 'border-primary border-dashed'
                      : activeSessionId === sessionId
                        ? 'border-primary/50'
                        : 'border-border'
                  }`}
                  onClick={() => onActivateSession?.(sessionId)}
                >
                  <WorkspaceTerminalHeader
                    title={titleBySessionId[sessionId] || sessionId}
                    focused={focusedSessionId === sessionId}
                    onClose={() => onCloseSession?.(sessionId)}
                    onToggleFocus={() => onToggleFocusSession?.(sessionId)}
                    draggable
                    onDragStart={(event) => handleHeaderDragStart(event, sessionId)}
                    onDragOver={(event) => handleHeaderDragOver(event, sessionId)}
                    onDrop={(event) => handleHeaderDrop(event, sessionId)}
                  />
                  <div className="h-[calc(100%-2.25rem)]">
                    <TerminalView sessionId={sessionId} isActive={activeSessionId === sessionId} sidebarOpen={false} />
                  </div>
                </div>
              </div>
            </ResizablePanel>
          )

          if (index === renderedSessionIds.length - 1) return [panel]
          return [panel, <ResizableHandle key={`handle-${sessionId}`} />]
        })}
      </ResizablePanelGroup>
      {hiddenSessionIds.map((sessionId) => (
        <div key={`hidden-${sessionId}`} className="hidden">
          <TerminalView sessionId={sessionId} isActive={false} sidebarOpen={false} />
        </div>
      ))}
    </>
  )
}
