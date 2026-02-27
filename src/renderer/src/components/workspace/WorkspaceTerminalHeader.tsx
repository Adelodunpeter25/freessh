import { Maximize2, Minimize2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WorkspaceTerminalHeaderProps {
  title: string
  focused: boolean
  onClose: () => void
  onToggleFocus: () => void
  draggable?: boolean
  onDragStart?: (event: React.DragEvent) => void
  onDragOver?: (event: React.DragEvent) => void
  onDragLeave?: (event: React.DragEvent) => void
  onDrop?: (event: React.DragEvent) => void
}

export function WorkspaceTerminalHeader({
  title,
  focused,
  onClose,
  onToggleFocus,
  draggable = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}: WorkspaceTerminalHeaderProps) {
  return (
    <div className="flex h-9 items-center justify-between border-b border-border bg-muted/20 px-2">
      <div
        className="min-w-0 flex-1 cursor-grab active:cursor-grabbing"
        draggable={draggable}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <span className="truncate text-xs font-medium text-foreground">{title}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onToggleFocus}
          title={focused ? 'Exit Focus Mode' : 'Focus Mode'}
          aria-label={focused ? 'Exit Focus Mode' : 'Focus Mode'}
        >
          {focused ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
          title="Hide Terminal"
          aria-label="Hide Terminal"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
