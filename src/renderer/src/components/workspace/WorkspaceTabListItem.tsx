import { useEffect, useRef, useState } from 'react'
import { Monitor, Pin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkspaceTabListItemProps } from './types'
import { useOSTypeStore } from '@/stores/osTypeStore'
import { getOSIcon } from '@/utils/osIcons'
import { WorkspaceContextMenu } from '@/components/contextmenu'
import { Input } from '@/components/ui/input'

interface WorkspaceTabListItemActionProps extends WorkspaceTabListItemProps {
  onDisconnectSession?: (sessionId: string) => void
  onOpenSFTP?: (sessionId: string) => void
  onRenameSession?: (sessionId: string, title: string) => void
  onTogglePin?: (sessionId: string) => void
  onSplitRight?: () => void
  onSplitDown?: () => void
}

export function WorkspaceTabListItem({
  tab,
  active = false,
  onSelect,
  onDisconnectSession,
  onOpenSFTP,
  onRenameSession,
  onTogglePin,
  onSplitRight,
  onSplitDown,
}: WorkspaceTabListItemActionProps) {
  const osType = useOSTypeStore((state) => state.getOSType(tab.connectionId || ''))
  const OSIcon = tab.isLocal ? Monitor : getOSIcon(osType)
  const [isRenaming, setIsRenaming] = useState(false)
  const [draftTitle, setDraftTitle] = useState(tab.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isRenaming) {
      setDraftTitle(tab.title)
    }
  }, [tab.title, isRenaming])

  useEffect(() => {
    if (!isRenaming) return
    const timer = setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
    return () => clearTimeout(timer)
  }, [isRenaming])

  const handleRenameSave = () => {
    const next = draftTitle.trim()
    if (!next) {
      setDraftTitle(tab.title)
      setIsRenaming(false)
      return
    }
    onRenameSession?.(tab.sessionId, next)
    setIsRenaming(false)
  }

  const handleRenameCancel = () => {
    setDraftTitle(tab.title)
    setIsRenaming(false)
  }

  const content = (
    <button
      type="button"
      disabled={isRenaming}
      onClick={() => onSelect?.(tab.sessionId)}
      className={cn(
        'flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors',
        active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60',
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        <OSIcon className="h-4 w-4 shrink-0" />
        {tab.isPinned ? <Pin className="h-3 w-3 shrink-0 text-primary" /> : null}
        {isRenaming ? (
          <Input
            ref={inputRef}
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={handleRenameSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleRenameSave()
              } else if (e.key === 'Escape') {
                e.preventDefault()
                handleRenameCancel()
              }
            }}
            className="h-7 px-2 py-0 text-sm w-36 bg-background/50"
          />
        ) : (
          <span className="truncate">{tab.title}</span>
        )}
      </span>
    </button>
  )

  return (
    <WorkspaceContextMenu
      isPinned={tab.isPinned || false}
      isRemote={!tab.isLocal}
      onDisconnectSession={() => onDisconnectSession?.(tab.sessionId)}
      onOpenSFTP={() => onOpenSFTP?.(tab.sessionId)}
      onRenameSession={() => setIsRenaming(true)}
      onTogglePin={() => onTogglePin?.(tab.sessionId)}
      onSplitRight={() => onSplitRight?.()}
      onSplitDown={() => onSplitDown?.()}
    >
      {content}
    </WorkspaceContextMenu>
  )
}
