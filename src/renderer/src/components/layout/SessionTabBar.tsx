import { memo, useCallback } from 'react'
import { X, Home, FolderSync } from 'lucide-react'
import { useTabStore } from '@/stores'
import { Button } from '@/components/ui/button'
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
  title: string
  isActive: boolean
  onSelect: (id: string) => void
  onClose: (id: string) => void
}

const SessionTab = memo(function SessionTab({ id, title, isActive, onSelect, onClose }: SessionTabProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-2 pl-8 pr-2 py-2 rounded-md border cursor-pointer transition-all backdrop-blur-md',
        isActive
          ? 'bg-white/20 dark:bg-white/15 border-white/30 text-foreground shadow-sm'
          : 'bg-white/5 dark:bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:border-white/20'
      )}
      style={noDrag}
      onClick={() => onSelect(id)}
    >
      <span className="text-sm font-medium truncate max-w-[180px]">
        {title}
      </span>
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
    </div>
  )
})

export function SessionTabBar({ showHome, showSFTP, onHomeClick, onSFTPClick, onSessionClick }: SessionTabBarProps) {
  const { tabs, activeTabId, setActiveTab, removeTab } = useTabStore()

  const handleSelect = useCallback((id: string) => {
    setActiveTab(id)
    onSessionClick()
  }, [setActiveTab, onSessionClick])

  const handleClose = useCallback((id: string) => {
    removeTab(id)
  }, [removeTab])

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
          title={tab.title}
          isActive={activeTabId === tab.id && !showHome && !showSFTP}
          onSelect={handleSelect}
          onClose={handleClose}
        />
      ))}
    </div>
  )
}
