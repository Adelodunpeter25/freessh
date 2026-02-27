import { memo } from 'react'
import { X, Pin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SessionTabMenu } from './SessionTabMenu'
import { SessionTabInput } from './SessionTabInput'
import { useOSTypeStore } from '@/stores/osTypeStore'
import { getOSIcon } from '@/utils/osIcons'
import { cn } from '@/lib/utils'

const noDrag = { WebkitAppRegion: 'no-drag' } as React.CSSProperties

interface SessionTabProps {
  id: string
  sessionId: string
  title: string
  connectionHost?: string
  connectionId?: string
  canDuplicate: boolean
  isActive: boolean
  isPinned: boolean
  isRenaming: boolean
  onSelect: (id: string) => void
  onClose: (id: string) => void
  onRename: (id: string) => void
  onDuplicate: (id: string) => void
  onRenameSubmit: (id: string, newTitle: string) => void
  onRenameCancel: () => void
  onOpenSFTP: (sessionId: string) => void
  onTogglePin: (id: string) => void
  canDragSession?: boolean
}

export const SessionTab = memo(function SessionTab({ 
  id, 
  sessionId,
  title,
  connectionHost,
  connectionId,
  canDuplicate,
  isActive,
  isPinned,
  isRenaming,
  onSelect, 
  onClose,
  onRename,
  onDuplicate,
  onRenameSubmit,
  onRenameCancel,
  onOpenSFTP,
  onTogglePin,
  canDragSession = false
}: SessionTabProps) {
  const osType = useOSTypeStore((state) => state.getOSType(connectionId || ''))
  const OSIcon = getOSIcon(osType)
  
  return (
    <SessionTabMenu
      tabId={id}
      tabTitle={title}
      isPinned={isPinned}
      showSFTP={!!connectionId}
      showDuplicate={canDuplicate}
      sessionId={sessionId}
      onClose={() => onClose(id)}
      onRename={() => onRename(id)}
      onDuplicate={() => onDuplicate(id)}
      onOpenSFTP={() => onOpenSFTP(sessionId)}
      onTogglePin={() => onTogglePin(id)}
    >
      <div
        className={cn(
          'group flex items-center gap-2 pl-8 pr-2 py-2 rounded-md border cursor-pointer transition-all backdrop-blur-md animate-scale-in',
          isActive
            ? 'bg-background border-border text-foreground shadow-sm dark:bg-white/15 dark:border-white/30'
            : 'bg-background/80 border-border/80 text-foreground/70 hover:bg-muted/40 hover:border-border dark:bg-white/5 dark:border-white/10 dark:text-foreground/80 dark:hover:bg-white/10 dark:hover:border-white/20'
        )}
        style={noDrag}
        onClick={() => !isRenaming && onSelect(id)}
        draggable={canDragSession}
        onDragStart={(event) => {
          if (!canDragSession) return
          event.dataTransfer.effectAllowed = 'copy'
          event.dataTransfer.setData('application/x-freessh-session', JSON.stringify({ sessionId, tabId: id }))
          event.dataTransfer.setData('text/plain', title)
        }}
      >
        <OSIcon className="h-3.5 w-3.5 shrink-0" />
        {isPinned && <Pin className="h-3 w-3 shrink-0" />}
        {isRenaming ? (
          <div style={noDrag}>
            <SessionTabInput
              value={title}
              onSave={(newTitle) => onRenameSubmit(id, newTitle)}
              onCancel={onRenameCancel}
            />
          </div>
        ) : connectionHost ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm font-medium truncate max-w-[180px]">
                {title}
              </span>
            </TooltipTrigger>
            <TooltipContent>{connectionHost}</TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-sm font-medium truncate max-w-[180px]">
            {title}
          </span>
        )}
        {!isPinned && !isRenaming && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onClose(id)
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        {isPinned && !isRenaming && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 invisible shrink-0"
            disabled
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </SessionTabMenu>
  )
})
