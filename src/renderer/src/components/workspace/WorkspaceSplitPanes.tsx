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
  onReorderSession?: (sessionId: string, targetSessionId: string, position: 'top' | 'bottom') => void
  onAttachSession?: (sessionId: string) => void
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
  onAttachSession,
  onSplitDown,
  direction = 'horizontal',
}: WorkspaceSplitPanesProps) {
  const [dragTargetSessionId, setDragTargetSessionId] = useState<string | null>(null)
  const [dragTargetPosition, setDragTargetPosition] = useState<'top' | 'bottom' | null>(null)

  const hasSupportedDragType = (event: React.DragEvent) => {
    const types = Array.from(event.dataTransfer.types || [])
    return types.includes('application/x-freessh-workspace-session') || types.includes('application/x-freessh-session')
  }

  const handleHeaderDragStart = (event: React.DragEvent, sessionId: string) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/x-freessh-workspace-session', sessionId)
    event.dataTransfer.setData('application/x-freessh-session', JSON.stringify({ sessionId }))
  }

  const handleHeaderDragOver = (event: React.DragEvent, sessionId: string) => {
    if (!hasSupportedDragType(event)) return
    event.preventDefault()
    setDragTargetSessionId(sessionId)
  }

  const handleHeaderDragLeave = (event: React.DragEvent, sessionId: string) => {
    if (!hasSupportedDragType(event)) return
    if (dragTargetSessionId === sessionId) {
      setDragTargetSessionId(null)
      setDragTargetPosition(null)
    }
  }

  const handleHeaderDrop = (event: React.DragEvent, targetSessionId: string, position: 'top' | 'bottom') => {
    event.preventDefault()
    setDragTargetSessionId(null)
    setDragTargetPosition(null)

    let sessionId = event.dataTransfer.getData('application/x-freessh-workspace-session')
    if (!sessionId) {
      const payload = event.dataTransfer.getData('application/x-freessh-session')
      if (payload) {
        try {
          const parsed = JSON.parse(payload) as { sessionId?: string }
          sessionId = parsed.sessionId || ''
        } catch {
          sessionId = ''
        }
      }
    }

    if (!sessionId) return

    onSplitDown?.()
    if (sessionIds.includes(sessionId)) {
      if (sessionId === targetSessionId) return
      onReorderSession?.(sessionId, targetSessionId, position)
      return
    }

    onAttachSession?.(sessionId)
    onActivateSession?.(sessionId)
  }

  const handlePaneDragOver = (event: React.DragEvent, sessionId: string) => {
    if (!hasSupportedDragType(event)) return

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const y = event.clientY - rect.top
    const ratio = rect.height > 0 ? y / rect.height : 0

    let position: 'top' | 'bottom' | null = null
    if (ratio <= 0.28) position = 'top'
    else if (ratio >= 0.72) position = 'bottom'

    if (!position) {
      if (dragTargetSessionId === sessionId) {
        setDragTargetPosition(null)
      }
      return
    }

    event.preventDefault()
    setDragTargetSessionId(sessionId)
    setDragTargetPosition(position)
  }

  const handlePaneDragLeave = (event: React.DragEvent, sessionId: string) => {
    handleHeaderDragLeave(event, sessionId)
  }

  const handlePaneDrop = (event: React.DragEvent, sessionId: string) => {
    if (!dragTargetPosition) return
    handleHeaderDrop(event, sessionId, dragTargetPosition)
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
          className="relative h-full overflow-hidden rounded-md border border-primary/40"
          onClick={() => onActivateSession?.(onlySessionId)}
          onDragOver={(event) => handlePaneDragOver(event, onlySessionId)}
          onDragLeave={(event) => handlePaneDragLeave(event, onlySessionId)}
          onDrop={(event) => handlePaneDrop(event, onlySessionId)}
        >
          <WorkspaceTerminalHeader
            title={titleBySessionId[onlySessionId] || onlySessionId}
            focused={focusedSessionId === onlySessionId}
            onClose={() => onCloseSession?.(onlySessionId)}
            onToggleFocus={() => onToggleFocusSession?.(onlySessionId)}
            draggable={sessionIds.length > 1}
            onDragStart={(event) => handleHeaderDragStart(event, onlySessionId)}
            onDragOver={(event) => handleHeaderDragOver(event, onlySessionId)}
            onDragLeave={(event) => handleHeaderDragLeave(event, onlySessionId)}
            onDrop={(event) => {
              if (!dragTargetPosition) return
              handleHeaderDrop(event, onlySessionId, dragTargetPosition)
            }}
          />
          {dragTargetSessionId === onlySessionId && dragTargetPosition === 'top' ? (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1/3 rounded-t-md border-2 border-primary/70 bg-primary/15" />
          ) : null}
          {dragTargetSessionId === onlySessionId && dragTargetPosition === 'bottom' ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1/3 rounded-b-md border-2 border-primary/70 bg-primary/15" />
          ) : null}
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
                  className={`relative h-full overflow-hidden rounded-md border ${
                    activeSessionId === sessionId ? 'border-primary/50' : 'border-border'
                  }`}
                  onClick={() => onActivateSession?.(sessionId)}
                  onDragOver={(event) => handlePaneDragOver(event, sessionId)}
                  onDragLeave={(event) => handlePaneDragLeave(event, sessionId)}
                  onDrop={(event) => handlePaneDrop(event, sessionId)}
                >
                  <WorkspaceTerminalHeader
                    title={titleBySessionId[sessionId] || sessionId}
                    focused={focusedSessionId === sessionId}
                    onClose={() => onCloseSession?.(sessionId)}
                    onToggleFocus={() => onToggleFocusSession?.(sessionId)}
                    draggable
                    onDragStart={(event) => handleHeaderDragStart(event, sessionId)}
                    onDragOver={(event) => handleHeaderDragOver(event, sessionId)}
                    onDragLeave={(event) => handleHeaderDragLeave(event, sessionId)}
                    onDrop={(event) => {
                      if (!dragTargetPosition) return
                      handleHeaderDrop(event, sessionId, dragTargetPosition)
                    }}
                  />
                  {dragTargetSessionId === sessionId && dragTargetPosition === 'top' ? (
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1/3 rounded-t-md border-2 border-primary/70 bg-primary/15" />
                  ) : null}
                  {dragTargetSessionId === sessionId && dragTargetPosition === 'bottom' ? (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1/3 rounded-b-md border-2 border-primary/70 bg-primary/15" />
                  ) : null}
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
