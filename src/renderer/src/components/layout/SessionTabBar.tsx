import { useState, useCallback } from 'react'
import { Home, FolderSync, Plus } from 'lucide-react'
import { useTabStore } from '@/stores'
import { useSessionStore } from '@/stores/sessionStore'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { SessionTab } from './SessionTab'
import { useSessionTabActions } from './SessionTabActions'
import { cn } from '@/lib/utils'
import { FEATURE_FLAGS } from '@/constants/features'

interface SessionTabBarProps {
  showHome: boolean
  showSFTP: boolean
  onHomeClick: () => void
  onSFTPClick: () => void
  onSessionClick: () => void
}

const noDrag = { WebkitAppRegion: 'no-drag' } as React.CSSProperties

export function SessionTabBar({ showHome, showSFTP, onHomeClick, onSFTPClick, onSessionClick }: SessionTabBarProps) {
  const { tabs, activeTabId, addWorkspaceTab } = useTabStore()
  const getSession = useSessionStore((state) => state.getSession)
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null)

  const {
    handleSelect,
    handleClose,
    handleDuplicate,
    handleRenameSubmit,
    handleOpenSFTP,
    handleTogglePin
  } = useSessionTabActions(onSFTPClick, onSessionClick)

  const handleRename = useCallback((id: string) => {
    setRenamingTabId(id)
  }, [])

  const handleRenameComplete = useCallback((id: string, newTitle: string) => {
    handleRenameSubmit(id, newTitle)
    setRenamingTabId(null)
  }, [handleRenameSubmit])

  const handleRenameCancel = useCallback(() => {
    setRenamingTabId(null)
  }, [])

  const handleCreateWorkspaceTab = useCallback(() => {
    if (!FEATURE_FLAGS.DETACHABLE_WORKSPACES) return
    addWorkspaceTab()
    onSessionClick()
  }, [addWorkspaceTab, onSessionClick])

  return (
    <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide">
      <TooltipProvider delayDuration={400}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex items-center gap-2 px-8 py-2 rounded-md border cursor-pointer transition-all backdrop-blur-md shrink-0',
                showHome
                  ? 'bg-card border-zinc-400 text-foreground shadow-sm dark:bg-white/15 dark:border-white/30'
                  : 'bg-card/90 border-zinc-300 text-foreground/70 hover:bg-muted/40 hover:border-zinc-400 dark:bg-white/5 dark:border-white/10 dark:text-muted-foreground dark:hover:bg-white/10 dark:hover:border-white/20'
              )}
              style={noDrag}
              onClick={onHomeClick}
            >
              <Home className="h-4 w-4" />
              <span className="text-sm font-medium">Home</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Connections</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex items-center gap-2 px-8 py-2 rounded-md border cursor-pointer transition-all backdrop-blur-md shrink-0',
                showSFTP
                  ? 'bg-card border-zinc-400 text-foreground shadow-sm dark:bg-white/15 dark:border-white/30'
                  : 'bg-card/90 border-zinc-300 text-foreground/70 hover:bg-muted/40 hover:border-zinc-400 dark:bg-white/5 dark:border-white/10 dark:text-muted-foreground dark:hover:bg-white/10 dark:hover:border-white/20'
              )}
              style={noDrag}
              onClick={onSFTPClick}
            >
              <FolderSync className="h-4 w-4" />
              <span className="text-sm font-medium">SFTP</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>File browser and transfer</TooltipContent>
        </Tooltip>
      
        {tabs.map((tab) => {
          const sessionData = getSession(tab.sessionId)
          const connectionHost = sessionData?.connection ? `${sessionData.connection.username}@${sessionData.connection.host}` : undefined
          const connectionId = sessionData?.connection?.id
          
          return (
            <SessionTab
              key={tab.id}
              id={tab.id}
              sessionId={tab.sessionId}
              title={tab.title}
              connectionHost={connectionHost}
              connectionId={connectionId}
              canDuplicate={tab.type === 'terminal'}
              isActive={activeTabId === tab.id && !showHome && !showSFTP}
              isPinned={tab.isPinned || false}
              isRenaming={renamingTabId === tab.id}
              onSelect={handleSelect}
              onClose={handleClose}
              onRename={handleRename}
              onDuplicate={handleDuplicate}
              onRenameSubmit={handleRenameComplete}
              onRenameCancel={handleRenameCancel}
              onOpenSFTP={handleOpenSFTP}
              onTogglePin={handleTogglePin}
              canDragSession={tab.type === 'terminal'}
            />
          )
        })}

        {FEATURE_FLAGS.DETACHABLE_WORKSPACES ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                style={noDrag}
                onClick={handleCreateWorkspaceTab}
                className="ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-300 bg-card/90 text-foreground/80 transition-colors hover:border-zinc-400 hover:bg-muted/40 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10"
                aria-label="Open workspace tab"
                title="Open workspace tab"
              >
                <Plus className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>New workspace tab</TooltipContent>
          </Tooltip>
        ) : null}
      </TooltipProvider>
    </div>
  )
}
