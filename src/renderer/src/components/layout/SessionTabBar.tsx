import { memo, useCallback, useState } from 'react'
import { X, Home, FolderSync, Pin } from 'lucide-react'
import { useTabStore } from '@/stores'
import { useUIStore } from '@/stores/uiStore'
import { useSessionStore } from '@/stores/sessionStore'
import { Button } from '@/components/ui/button'
import { SessionTabContextMenu } from '@/components/contextmenu/SessionTabContextMenu'
import { SessionTabInput } from './SessionTabInput'
import { cn } from '@/lib/utils'

interface SessionTabBarProps {
  showHome: boolean
  showSFTP: boolean
  onHomeClick: () => void
  onSFTPClick: () => void
  onSessionClick: () => void
}

const noDrag = { WebkitAppRegion: 'no-drag' } as React.CSSProperties

interface SessionTabProps {
  id: string
  sessionId: string
  title: string
  isActive: boolean
  isPinned: boolean
  isRenaming: boolean
  onSelect: (id: string) => void
  onClose: (id: string) => void
  onRename: (id: string) => void
  onRenameSubmit: (id: string, newTitle: string) => void
  onRenameCancel: () => void
  onOpenSFTP: (sessionId: string) => void
  onTogglePin: (id: string) => void
}

const SessionTab = memo(function SessionTab({ 
  id, 
  sessionId,
  title, 
  isActive, 
  isPinned,
  isRenaming,
  onSelect, 
  onClose,
  onRename,
  onRenameSubmit,
  onRenameCancel,
  onOpenSFTP,
  onTogglePin
}: SessionTabProps) {
  return (
    <SessionTabContextMenu
      tabId={id}
      tabTitle={title}
      isPinned={isPinned}
      onClose={() => onClose(id)}
      onRename={() => onRename(id)}
      onOpenSFTP={() => onOpenSFTP(sessionId)}
      onTogglePin={() => onTogglePin(id)}
    >
      <div
        className={cn(
          'group flex items-center gap-2 pl-8 pr-2 py-2 rounded-md border cursor-pointer transition-all backdrop-blur-md',
          isActive
            ? 'bg-white/20 dark:bg-white/15 border-white/30 text-foreground shadow-sm'
            : 'bg-white/5 dark:bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:border-white/20'
        )}
        style={noDrag}
        onClick={() => !isRenaming && onSelect(id)}
      >
        {isPinned && <Pin className="h-3 w-3 shrink-0" />}
        {isRenaming ? (
          <div style={noDrag}>
            <SessionTabInput
              value={title}
              onSave={(newTitle) => onRenameSubmit(id, newTitle)}
              onCancel={onRenameCancel}
            />
          </div>
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
    </SessionTabContextMenu>
  )
})

export function SessionTabBar({ showHome, showSFTP, onHomeClick, onSFTPClick, onSessionClick }: SessionTabBarProps) {
  const { tabs, activeTabId, setActiveTab, removeTab, updateTabTitle, togglePinTab } = useTabStore()
  const openSFTP = useUIStore((state) => state.openSFTP)
  const getSession = useSessionStore((state) => state.getSession)
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null)

  const handleSelect = useCallback((id: string) => {
    setActiveTab(id)
    onSessionClick()
  }, [setActiveTab, onSessionClick])

  const handleClose = useCallback((id: string) => {
    removeTab(id)
  }, [removeTab])

  const handleRename = useCallback((id: string) => {
    setRenamingTabId(id)
  }, [])

  const handleRenameSubmit = useCallback((id: string, newTitle: string) => {
    updateTabTitle(id, newTitle)
    setRenamingTabId(null)
  }, [updateTabTitle])

  const handleRenameCancel = useCallback(() => {
    setRenamingTabId(null)
  }, [])

  const handleOpenSFTP = useCallback((sessionId: string) => {
    const sessionData = getSession(sessionId)
    if (sessionData) {
      openSFTP(sessionData.connection.id)
      onSFTPClick()
    }
  }, [getSession, openSFTP, onSFTPClick])

  const handleTogglePin = useCallback((id: string) => {
    togglePinTab(id)
  }, [togglePinTab])

  return (
    <div className="flex items-center gap-2 flex-1 overflow-x-auto">
      <div
        className={cn(
          'flex items-center gap-2 px-8 py-2 rounded-md border cursor-pointer transition-all backdrop-blur-md',
          showHome
            ? 'bg-white/20 dark:bg-white/15 border-white/30 text-foreground shadow-sm'
            : 'bg-white/5 dark:bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:border-white/20'
        )}
        style={noDrag}
        onClick={onHomeClick}
      >
        <Home className="h-4 w-4" />
        <span className="text-sm font-medium">Home</span>
      </div>

      <div
        className={cn(
          'flex items-center gap-2 px-8 py-2 rounded-md border cursor-pointer transition-all backdrop-blur-md',
          showSFTP
            ? 'bg-white/20 dark:bg-white/15 border-white/30 text-foreground shadow-sm'
            : 'bg-white/5 dark:bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:border-white/20'
        )}
        style={noDrag}
        onClick={onSFTPClick}
      >
        <FolderSync className="h-4 w-4" />
        <span className="text-sm font-medium">SFTP</span>
      </div>
      
      {tabs.map((tab) => (
        <SessionTab
          key={tab.id}
          id={tab.id}
          sessionId={tab.sessionId}
          title={tab.title}
          isActive={activeTabId === tab.id && !showHome && !showSFTP}
          isPinned={tab.isPinned || false}
          isRenaming={renamingTabId === tab.id}
          onSelect={handleSelect}
          onClose={handleClose}
          onRename={handleRename}
          onRenameSubmit={handleRenameSubmit}
          onRenameCancel={handleRenameCancel}
          onOpenSFTP={handleOpenSFTP}
          onTogglePin={handleTogglePin}
        />
      ))}
    </div>
  )
}
