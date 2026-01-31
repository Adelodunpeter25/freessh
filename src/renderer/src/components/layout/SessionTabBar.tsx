import { useState, useCallback } from 'react'
import { Home, FolderSync } from 'lucide-react'
import { useTabStore } from '@/stores'
import { useSessionStore } from '@/stores/sessionStore'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { SessionTab } from './SessionTab'
import { useSessionTabActions } from './SessionTabActions'
import { cn } from '@/lib/utils'

interface SessionTabBarProps {
  showHome: boolean
  showSFTP: boolean
  onHomeClick: () => void
  onSFTPClick: () => void
  onSessionClick: () => void
}

const noDrag = { WebkitAppRegion: 'no-drag' } as React.CSSProperties

export function SessionTabBar({ showHome, showSFTP, onHomeClick, onSFTPClick, onSessionClick }: SessionTabBarProps) {
  const { tabs, activeTabId } = useTabStore()
  const getSession = useSessionStore((state) => state.getSession)
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null)

  const {
    handleSelect,
    handleClose,
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

  return (
    <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide">
      <TooltipProvider delayDuration={400}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex items-center gap-2 px-8 py-2 rounded-md border cursor-pointer transition-all backdrop-blur-md shrink-0',
                showHome
                  ? 'bg-white/20 dark:bg-white/15 border-white/30 dark:border-white/30 text-foreground shadow-sm'
                  : 'bg-white/5 dark:bg-white/5 border-white/10 dark:border-white/10 text-foreground/70 dark:text-muted-foreground hover:bg-white/10 hover:border-white/20'
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
                  ? 'bg-white/20 dark:bg-white/15 border-white/30 dark:border-white/30 text-foreground shadow-sm'
                  : 'bg-white/5 dark:bg-white/5 border-white/10 dark:border-white/10 text-foreground/70 dark:text-muted-foreground hover:bg-white/10 hover:border-white/20'
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
              isActive={activeTabId === tab.id && !showHome && !showSFTP}
              isPinned={tab.isPinned || false}
              isRenaming={renamingTabId === tab.id}
              onSelect={handleSelect}
              onClose={handleClose}
              onRename={handleRename}
              onRenameSubmit={handleRenameComplete}
              onRenameCancel={handleRenameCancel}
              onOpenSFTP={handleOpenSFTP}
              onTogglePin={handleTogglePin}
            />
          )
        })}
      </TooltipProvider>
    </div>
  )
}
